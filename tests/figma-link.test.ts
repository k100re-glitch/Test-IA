import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackName, parseFigmaLink } from '../app/client/figmaLink.js';

test('lien de composant : clé de fichier et nœud extraits, tirets normalisés', () => {
  assert.deepEqual(
    parseFigmaLink(
      'https://www.figma.com/design/aBcDeF123456/Inbox-Zapper?node-id=412-1908&m=dev',
    ),
    { fileKey: 'aBcDeF123456', nodeId: '412:1908' },
  );
  // La forme ancienne et les deux-points déjà présents passent aussi.
  assert.deepEqual(
    parseFigmaLink('https://figma.com/file/aBcDeF123456/X?node-id=7%3A2'),
    { fileKey: 'aBcDeF123456', nodeId: '7:2' },
  );
});

test('un lien de fichier sans nœud est refusé, avec quoi faire', () => {
  assert.throws(
    () => parseFigmaLink('https://www.figma.com/design/aBcDeF123456/Inbox'),
    /calque sélectionné/,
  );
});

test('ce qui n’est pas un lien Figma de composant est refusé', () => {
  assert.throws(() => parseFigmaLink('   '), /Collez le lien/);
  assert.throws(() => parseFigmaLink('figma.com/design/abc'), /https/);
  assert.throws(
    () => parseFigmaLink('https://exemple.test/design/aBcDeF123456?node-id=1-2'),
    /exemple\.test/,
  );
  assert.throws(
    () => parseFigmaLink('https://www.figma.com/board/aBcDeF123456/X?node-id=1-2'),
    /ne désigne pas un fichier/,
  );
  assert.throws(
    () => parseFigmaLink('https://www.figma.com/design/aBcDeF123456/X?node-id=abc'),
    /illisible/,
  );
});

test('le nom de repli vient du nœud, il n’est pas inventé', () => {
  assert.equal(fallbackName({ fileKey: 'k', nodeId: '412:1908' }), 'node-412-1908');
});
