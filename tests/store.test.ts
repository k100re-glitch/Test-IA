import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  writeFile,
  rm,
  mkdir,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Store } from '../app/server/store.js';
import {
  tokensSchema,
  contrast,
  dimensionMax,
  tokensAddedInV2,
  tokenKeys,
  fontFamilies,
} from '../app/shared/model.js';
const seed = tokensSchema.parse(
  JSON.parse(
    await readFile(
      new URL('../workspace/design-system.tokens.json', import.meta.url),
      'utf8',
    ),
  ),
);
async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const dir = await mkdtemp(path.join(tmpdir(), 'ds-store-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = new Store(dir, seed);
  await store.init();
  return { dir, store };
}
test('proposition sans écriture, commit, redémarrage réel du store et annulation sélective', async (t) => {
  const { dir, store } = await fixture(t);
  const before = await readFile(store.file, 'utf8');
  const p = store.propose(0, [{ key: 'color.brand', value: '#AA2255' }]);
  assert.equal(await readFile(store.file, 'utf8'), before);
  await store.commit(p.id);
  const r = store.propose(1, [{ key: 'space.md', value: 22 }]);
  await store.commit(r.id);
  const reopened = new Store(dir, seed);
  await reopened.init();
  assert.equal(reopened.snapshot().tokens['color.brand'].$value, '#AA2255');
  const undo = reopened.proposeUndo(2, p.id);
  await reopened.commit(undo.id);
  assert.equal(
    reopened.snapshot().tokens['color.brand'].$value,
    seed['color.brand'].$value,
  );
  assert.equal(reopened.snapshot().tokens['space.md'].$value, 22);
  assert.equal(reopened.snapshot().history.length, 3);
});
test('concurrence : une seule proposition de la même révision peut être acceptée', async (t) => {
  const { store } = await fixture(t);
  const a = store.propose(0, [{ key: 'color.brand', value: '#112233' }]);
  const b = store.propose(0, [{ key: 'space.sm', value: 9 }]);
  const results = await Promise.allSettled([
    store.commit(a.id),
    store.commit(b.id),
  ]);
  assert.equal(results.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal(store.snapshot().revision, 1);
  await assert.rejects(() => store.commit(a.id), /inconnue/);
  assert.throws(
    () => store.propose(0, [{ key: 'space.sm', value: 4 }]),
    /changé/,
  );
});
test('annulation refuse de perdre un changement plus récent du même token', async (t) => {
  const { store } = await fixture(t);
  const p = store.propose(0, [{ key: 'color.brand', value: '#112233' }]);
  await store.commit(p.id);
  await store.commit(
    store.propose(1, [{ key: 'color.brand', value: '#445566' }]).id,
  );
  assert.throws(() => store.proposeUndo(2, p.id), /Conflit/);
});
test('entrées, imports et types invalides sont rejetés sans effet disque', async (t) => {
  const { store } = await fixture(t);
  const raw = await readFile(store.file, 'utf8');
  for (const value of ['red', 'url(https://invalid.test)', 12, '#FFF'])
    assert.throws(() => store.propose(0, [{ key: 'color.brand', value }]));
  for (const value of [-1, dimensionMax + 1, Infinity, '18'])
    assert.throws(() => store.propose(0, [{ key: 'space.md', value }]));
  assert.throws(
    () =>
      store.propose(0, [
        { key: 'space.md', value: 12 },
        { key: 'space.md', value: 14 },
      ]),
    /deux fois/,
  );
  assert.throws(() => store.proposeImport(0, {}));
  assert.throws(() => store.proposeImport(0, { ...seed, secret: 'no' }));
  assert.throws(() =>
    store.propose(0, [{ key: 'font.family', value: 'url(evil)' }]),
  );
  assert.equal(await readFile(store.file, 'utf8'), raw);
});
test('import local passe par le même diff et la validation', async (t) => {
  const { store } = await fixture(t);
  const tokens = structuredClone(seed);
  tokens['color.brand'].$value = '#774422';
  tokens['space.md'].$value = 20;
  const p = store.proposeImport(0, tokens);
  assert.equal(p.source, 'import');
  assert.equal(p.patches.length, 2);
  assert.equal(store.snapshot().revision, 0);
  await store.commit(p.id);
  assert.deepEqual(store.snapshot().tokens, tokens);
});
test('fichier corrompu et historique falsifié préservés sans reset silencieux', async (t) => {
  const { dir, store } = await fixture(t);
  for (const raw of [
    '{bad',
    JSON.stringify({ ...store.snapshot(), revision: 42 }),
  ]) {
    await writeFile(store.file, raw);
    await assert.rejects(
      () => new Store(dir, seed).init(),
      /original préservé/,
    );
    assert.equal(await readFile(store.file, 'utf8'), raw);
  }
});
test('modification extérieure détectée avant écrasement', async (t) => {
  const { store } = await fixture(t);
  const p = store.propose(0, [{ key: 'space.sm', value: 9 }]);
  await writeFile(store.file, 'changed externally');
  await assert.rejects(() => store.commit(p.id), /hors application/);
  assert.equal(await readFile(store.file, 'utf8'), 'changed externally');
});
test(
  'symlink vers un dossier externe refusé',
  {
    skip:
      process.platform === 'win32'
        ? 'Droits symlink Windows à qualifier'
        : false,
  },
  async (t) => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ds-links-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    await mkdir(path.join(dir, 'target'));
    await symlink(path.join(dir, 'target'), path.join(dir, 'link'));
    await assert.rejects(
      () => new Store(path.join(dir, 'link'), seed).init(),
      /symbolique refusé/,
    );
  },
);
test('contraste noir/blanc et identité', () => {
  assert.equal(contrast('#000000', '#FFFFFF'), 21);
  assert.equal(contrast('#123456', '#123456'), 1);
});

test('copie précédente complète, restauration explicite et original corrompu archivé', async (t) => {
  const { store, dir } = await fixture(t);
  const { restorePrevious } = await import('../app/server/store.js');
  const original = await readFile(store.file, 'utf8');
  await store.commit(
    store.propose(0, [{ key: 'color.brand', value: '#445566' }]).id,
  );
  assert.equal(
    await readFile(path.join(dir, 'state.previous.json'), 'utf8'),
    original,
  );
  await writeFile(store.file, '{interruption');
  const restored = await restorePrevious(dir);
  assert.equal(restored.revision, 0);
  assert.equal(
    await readFile(path.join(dir, restored.preserved), 'utf8'),
    '{interruption',
  );
  assert.equal(await readFile(store.file, 'utf8'), original);
  const reopened = new Store(dir, {
    ...seed,
    'color.brand': { $type: 'color', $value: '#000000' },
  });
  await reopened.init();
  assert.equal(
    reopened.snapshot().tokens['color.brand'].$value,
    seed['color.brand'].$value,
    'Une mise à jour du seed ne réinitialise jamais un état existant',
  );
});

test('copie précédente falsifiée : restauration refusée sans toucher l’original', async (t) => {
  const { store, dir } = await fixture(t);
  const { restorePrevious } = await import('../app/server/store.js');
  const original = await readFile(store.file, 'utf8');
  await writeFile(path.join(dir, 'state.previous.json'), '{invalid');
  await assert.rejects(() => restorePrevious(dir));
  assert.equal(await readFile(store.file, 'utf8'), original);
});

test('échec de sauvegarde : commit non appliqué et brouillon encore validable', async (t) => {
  const { store, dir } = await fixture(t);
  const original = await readFile(store.file, 'utf8');
  const backup = path.join(dir, 'state.previous.json');
  await mkdir(backup);
  const p = store.propose(0, [{ key: 'space.md', value: 24 }]);
  await assert.rejects(() => store.commit(p.id));
  assert.equal(store.snapshot().revision, 0);
  assert.equal(await readFile(store.file, 'utf8'), original);
  await rm(backup, { recursive: true });
  await store.commit(p.id);
  assert.equal(store.snapshot().revision, 1);
});

test(
  'lien ajouté après ouverture : commit refusé sans lire ni modifier sa cible',
  {
    skip:
      process.platform === 'win32'
        ? 'Droits symlink non accordés sur Windows'
        : false,
  },
  async (t) => {
    const { store, dir } = await fixture(t);
    const target = path.join(dir, 'outside.json');
    const original = await readFile(store.file, 'utf8');
    await writeFile(target, original);
    await rm(store.file);
    await symlink(target, store.file);
    const p = store.propose(0, [{ key: 'space.md', value: 24 }]);
    await assert.rejects(() => store.commit(p.id));
    assert.equal(await readFile(target, 'utf8'), original);
  },
);
test('le schéma élargi accepte une police ajoutée sans invalider un état existant', async (t) => {
  const { store } = await fixture(t);
  // Le seed reste valide tel quel, quelle que soit la police qu'il porte.
  const before = tokensSchema.parse(seed);
  assert.ok(fontFamilies.includes(before['font.family'].$value));
  // On propose une police différente de celle du seed, pour que le test
  // prouve un vrai changement sans dépendre du design system par défaut.
  const target = before['font.family'].$value === 'Inter' ? 'Georgia' : 'Inter';
  const proposal = store.propose(0, [
    { key: 'font.family', value: target },
    { key: 'font.heading', value: 320 },
  ]);
  await store.commit(proposal.id);
  const after = store.snapshot().tokens;
  assert.equal(after['font.family'].$value, target);
  assert.equal(after['font.heading'].$value, 320);
  // Une police hors liste reste refusée.
  assert.throws(() =>
    store.propose(1, [{ key: 'font.family', value: 'Comic Sans MS' }]),
  );
  // La borne haute reste appliquée, seulement plus haute.
  assert.throws(() =>
    store.propose(1, [{ key: 'font.heading', value: dimensionMax + 1 }]),
  );
});
test('migration v1 → v2 : complète les tokens sans toucher au journal', async (t) => {
  const { store } = await fixture(t);
  // Un état écrit par la version précédente : 18 tokens, version 1,
  // et une révision déjà au journal.
  const v1Tokens: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(seed))
    if (!(key in tokensAddedInV2)) v1Tokens[key] = structuredClone(value);
  assert.equal(Object.keys(v1Tokens).length, tokenKeys.length - Object.keys(tokensAddedInV2).length);
  (v1Tokens['color.brand'] as { $value: string }).$value = '#123456';
  const legacy = {
    version: 1,
    revision: 1,
    tokens: v1Tokens,
    history: [
      {
        id: randomUUID(),
        revision: 1,
        date: new Date().toISOString(),
        source: 'manual',
        patches: [
          {
            key: 'color.brand',
            before: seed['color.brand'].$value,
            after: '#123456',
          },
        ],
      },
    ],
  };
  await writeFile(store.file, JSON.stringify(legacy), 'utf8');
  const reopened = new Store(path.dirname(store.file), seed);
  await reopened.init();
  const migrated = reopened.snapshot();
  // La version monte, les clés nouvelles arrivent, rien d'ancien ne bouge.
  assert.equal(migrated.version, 2);
  assert.equal(Object.keys(migrated.tokens).length, tokenKeys.length);
  assert.equal(migrated.tokens['color.brand'].$value, '#123456');
  for (const key of Object.keys(tokensAddedInV2))
    assert.ok(key in migrated.tokens, `clé manquante : ${key}`);
  // Le journal est conservé à l'identique : ni effacé, ni réécrit.
  assert.equal(migrated.revision, 1);
  assert.equal(migrated.history.length, 1);
  assert.deepEqual(migrated.history[0].patches, legacy.history[0].patches);
  // L'annulation de cette révision fonctionne encore après migration.
  const undo = reopened.proposeUndo(1, migrated.history[0].id);
  await reopened.commit(undo.id);
  assert.equal(
    reopened.snapshot().tokens['color.brand'].$value,
    seed['color.brand'].$value,
  );
});
