import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { atomicWrite } from './files.js';
import { StudioError } from './store.js';
import type { Tokens } from '../shared/model.js';

const run = promisify(execFile);

// Commit des tokens dans le dépôt de l'étudiant.
//
// Trois bornes, posées ici et pas ailleurs :
//
// 1. Un seul fichier. `.ds-studio/` est l'état privé d'exécution et ne doit
//    jamais être commité ; le fichier versionnable est celui du workspace. Le
//    chemin est écrit en dur, jamais reçu par HTTP.
// 2. Aucun shell. `execFile` reçoit un tableau d'arguments : il n'y a pas de
//    ligne de commande à interpréter, donc rien à y injecter. Le seul texte
//    variable du message est un entier, la révision.
// 3. Commit, pas de push. Pousser publie ; c'est une autre décision, qui se
//    prend ailleurs et explicitement.

export const TOKENS_FILE = path.join('workspace', 'design-system.tokens.json');

async function git(root: string, args: string[]) {
  return run('git', ['-C', root, ...args], {
    timeout: 15_000,
    maxBuffer: 1_000_000,
    windowsHide: true,
  });
}

export async function commitTokens(root: string, revision: number, tokens: Tokens) {
  try {
    await git(root, ['rev-parse', '--is-inside-work-tree']);
  } catch {
    throw new StudioError(
      'Aucun dépôt Git ici. Lancez « git init » à la racine du projet.',
      409,
    );
  }
  await atomicWrite(
    path.join(root, TOKENS_FILE),
    JSON.stringify(tokens, null, 2) + '\n',
  );
  await git(root, ['add', '--', TOKENS_FILE]);
  // `--quiet` sort en 1 quand il n'y a rien à valider : c'est la façon la plus
  // sûre de le savoir, plus que de lire un statut à la main.
  const clean = await git(root, [
    'diff',
    '--cached',
    '--quiet',
    '--',
    TOKENS_FILE,
  ]).then(
    () => true,
    () => false,
  );
  if (clean)
    return { committed: false, message: 'Les tokens du dépôt sont déjà à jour.' };
  await git(root, [
    'commit',
    '--only',
    '--no-verify',
    '-m',
    `Tokens du design system, révision ${revision}`,
    '--',
    TOKENS_FILE,
  ]);
  const { stdout } = await git(root, ['rev-parse', '--short', 'HEAD']);
  const sha = stdout.trim();
  return {
    committed: true,
    sha,
    message: `Révision ${revision} commitée dans ${sha}. Rien n'est poussé.`,
  };
}
