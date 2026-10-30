import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { stateVersion, tokensSchema } from '../app/shared/model.js';

// Le générateur de fiche s'exécute avec des crochets de module qui neutralisent
// les imports d'images : il ne peut donc pas être importé dans ce fichier, qui
// tourne sans eux. Il est lancé comme le fait « npm run doc », ce qui vérifie
// aussi la commande elle-même.
const run = promisify(execFile);
const root = process.cwd();

async function generate(
  dataDirectory: string,
  output: string,
): Promise<string> {
  await run(
    process.execPath,
    [
      '--import',
      'tsx',
      '--import',
      './scripts/asset-stub.mjs',
      'scripts/generate-doc.ts',
      output,
    ],
    { cwd: root, env: { ...process.env, DS_STUDIO_DATA_DIR: dataDirectory } },
  );
  return fs.readFile(output, 'utf8');
}

async function sandbox() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ds-doc-'));
  return {
    directory,
    output: path.join(directory, 'DESIGN_SYSTEM.md'),
    state: path.join(directory, 'state.json'),
  };
}

async function seedState(file: string, brand: string, revision: number) {
  const tokens = tokensSchema.parse(
    JSON.parse(
      await fs.readFile(
        path.join(root, 'workspace', 'design-system.tokens.json'),
        'utf8',
      ),
    ),
  );
  tokens['color.brand'].$value = brand;
  await fs.writeFile(
    file,
    JSON.stringify({ version: stateVersion, revision, tokens, history: [] }),
  );
}

test('la fiche générée porte les valeurs de l’état courant, pas celles du seed', async () => {
  const box = await sandbox();
  await seedState(box.state, '#123456', 42);
  const markdown = await generate(box.directory, box.output);
  assert.match(
    markdown,
    /\| `color\.brand` \| `--color-brand` \| `#123456` \|/,
  );
  assert.match(markdown, /Révision de l’atelier : 42/);
  // Le catalogue est lu dans les composants eux-mêmes : la fiche doit contenir
  // du JSX réel, pas seulement des tokens.
  assert.match(markdown, /<Button tone="secondary" block>Text<\/Button>/);
  assert.match(markdown, /## Composants — \d+, \d+ variantes/);
});

test('deux générations sans changement donnent le même fichier', async () => {
  const box = await sandbox();
  await seedState(box.state, '#654321', 3);
  const first = await generate(box.directory, box.output);
  const second = await generate(box.directory, box.output);
  assert.equal(first, second);
});

test('sans état, la fiche se replie sur le seed versionné et le dit', async () => {
  const box = await sandbox();
  const markdown = await generate(box.directory, box.output);
  assert.match(markdown, /workspace\/design-system\.tokens\.json/);
  assert.match(markdown, /Révision : aucune/);
});

test('un état illisible arrête la génération au lieu de produire une fiche fausse', async () => {
  const box = await sandbox();
  await fs.writeFile(box.state, '{ pas du json');
  await assert.rejects(
    () => generate(box.directory, box.output),
    /présent mais illisible/,
  );
  await assert.rejects(() => fs.stat(box.output));
});
