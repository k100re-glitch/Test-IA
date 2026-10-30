import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { StudioError } from './store.js';

const run = promisify(execFile);

// Génération de la fiche Markdown du design system, déclenchée depuis
// l'interface.
//
// Pourquoi un processus enfant plutôt qu'un simple import : le générateur lit
// le catalogue dans les composants eux-mêmes, et ces composants importent des
// images que Node ne sait pas charger. La commande installe pour cela des
// crochets de module (`scripts/asset-stub.mjs`), qui s'enregistrent au
// démarrage du processus — trop tard pour celui-ci, qui tourne déjà. Le
// serveur relance donc exactement la commande documentée.
//
// Deux bornes, comme pour le commit :
//
// 1. Aucun shell et aucun paramètre. `execFile` reçoit un tableau figé ; la
//    requête n'apporte rien, il n'y a donc rien à injecter.
// 2. Une seule destination, écrite en dur dans le générateur. Le client ne
//    choisit pas où écrire.
//
// `tsx` est une dépendance de développement, mais le serveur lui-même tourne
// sous tsx : s'il répond, le binaire est là.

export const DOC_FILE = path.join('workspace', 'DESIGN_SYSTEM.md');

// Une ligne de diagnostic, bornée : c'est notre propre script, mais une erreur
// de Node peut traîner des chemins sur plusieurs lignes qui n'apprennent rien
// de plus à l'étudiant.
function firstLine(text: string): string {
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .find((l) => l.startsWith('Error:') || l.includes('illisible'));
  return line ? line.replace(/^Error:\s*/, '').slice(0, 200) : '';
}

export async function generateDoc(root: string) {
  try {
    await run(
      process.execPath,
      [
        '--import',
        'tsx',
        '--import',
        './scripts/asset-stub.mjs',
        'scripts/generate-doc.ts',
      ],
      { cwd: root, timeout: 60_000, maxBuffer: 1_000_000, windowsHide: true },
    );
  } catch (error) {
    const detail = firstLine(
      String((error as { stderr?: string }).stderr ?? ''),
    );
    throw new StudioError(
      detail
        ? `La fiche n'a pas été écrite : ${detail}`
        : "La fiche n'a pas été écrite. Lancez « npm run doc » dans un terminal pour voir l'erreur complète.",
      500,
    );
  }
  // Le compte est relu sur le fichier produit, pas sur ce que le script a
  // affiché : c'est l'état du disque qui intéresse l'étudiant.
  const markdown = await fs.readFile(path.join(root, DOC_FILE), 'utf8');
  const lines = markdown.split('\n').length;
  return {
    file: DOC_FILE,
    lines,
    message: `${DOC_FILE} régénéré — ${lines} lignes. Rien n'est commité.`,
  };
}
