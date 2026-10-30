import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  contrast,
  migrateState,
  stateSchema,
  tokenCss,
  tokenKeys,
  tokensSchema,
  type TokenKey,
  type Tokens,
} from '../app/shared/model.js';
import { atomicWrite } from '../app/server/files.js';
import { useCatalogue, type Entry } from '../app/client/CanvasBoard.js';
import primitive from '../app/client/data/primitive.json' with { type: 'json' };
import semantic from '../app/client/data/semantic.json' with { type: 'json' };

// Générateur de la fiche Markdown du design system, lancé par « npm run doc ».
//
// Le but : un seul fichier à donner à un assistant pour qu'il travaille sur les
// valeurs réellement en vigueur, et non sur celles qu'il a vues la semaine
// dernière. Tout ce qu'il contient est donc lu à l'instant de la génération :
// les tokens dans l'état de l'atelier, le catalogue dans les composants
// eux-mêmes, les règles dans leur fichier. Rien n'est recopié à la main ici,
// sinon la fiche mentirait au premier changement.
//
// Aucune date n'est écrite dans la sortie : un horodatage ferait un diff à
// chaque exécution, même sans changement, et noierait les vraies évolutions.
// La révision de l'atelier, elle, dit quelque chose et figure en tête.

const OUTPUT = path.join('workspace', 'DESIGN_SYSTEM.md');
const SEED = path.join('workspace', 'design-system.tokens.json');
const RULES = path.join('workspace', 'DESIGN_RULES.md');

// Un chemin hors du projet reste écrit en absolu : « ../../../private/tmp/… »
// ne renseigne personne.
function label(root: string, file: string): string {
  const relative = path.relative(root, file);
  return relative.startsWith('..') ? file : relative;
}

interface Source {
  tokens: Tokens;
  revision: number | undefined;
  origin: string;
}

// L'état courant de l'atelier d'abord, le seed versionné en repli : c'est
// l'ordre que suit le serveur. La lecture est seule et sans écriture — le
// générateur ne doit pas créer de dossier de données ni réparer un état.
async function readTokens(root: string): Promise<Source> {
  const directory = process.env.DS_STUDIO_DATA_DIR
    ? path.resolve(process.env.DS_STUDIO_DATA_DIR)
    : path.join(root, '.ds-studio');
  const file = path.join(directory, 'state.json');
  try {
    const state = stateSchema.parse(
      migrateState(JSON.parse(await fs.readFile(file, 'utf8'))),
    );
    return {
      tokens: state.tokens,
      revision: state.revision,
      origin: label(root, file),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
      // Un état illisible n'est pas réparé et n'est pas contourné en silence :
      // la fiche serait fausse sans qu'on le sache.
      throw new Error(
        `${label(root, file)} est présent mais illisible : ${
          (error as Error).message
        }`,
      );
    return {
      tokens: tokensSchema.parse(
        JSON.parse(await fs.readFile(path.join(root, SEED), 'utf8')),
      ),
      revision: undefined,
      origin: SEED,
    };
  }
}

// Le catalogue est un hook React : les métadonnées n'existent qu'au rendu.
// Un composant sonde le rappelle dans un rendu serveur jetable, ce qui évite
// de tenir une seconde liste de composants à côté de celle qui s'affiche.
function readCatalogue(): Entry[] {
  let entries: Entry[] = [];
  function Probe() {
    entries = useCatalogue();
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  if (!entries.length) throw new Error('Catalogue de composants vide.');
  return entries;
}

const cell = (text: string) => text.replaceAll('|', '\\|');
const inline = (code: string) =>
  `\`${cell(code.replace(/\s+/g, ' ').trim())}\``;

function tokenTable(tokens: Tokens, keys: TokenKey[]): string[] {
  const css = tokenCss(tokens);
  return [
    '| Token | Variable CSS | Valeur |',
    '| --- | --- | --- |',
    ...keys.map((key) => {
      const variable = `--${key.replaceAll('.', '-')}`;
      return `| \`${key}\` | \`${variable}\` | \`${css[variable]}\` |`;
    }),
  ];
}

// Trois paires seulement, celles que l'œil rencontre partout. Les annoncer
// comme des sondages et non comme un audit : le reste des états — survol,
// désactivé, erreur sur fond coloré — n'est pas mesuré ici.
const PAIRS: [string, TokenKey, TokenKey][] = [
  ['Texte sur surface', 'color.text', 'color.surface'],
  ['Texte sur marque', 'color.onBrand', 'color.brand'],
  ['Texte secondaire sur surface', 'color.muted', 'color.surface'],
];

function contrastTable(tokens: Tokens): string[] {
  return [
    '| Paire | Rapport | Seuil AA texte courant (4,5:1) |',
    '| --- | --- | --- |',
    ...PAIRS.map(([label, a, b]) => {
      const ratio = contrast(
        String(tokens[a].$value),
        String(tokens[b].$value),
      );
      return `| ${label} | ${ratio.toFixed(2)}:1 | ${
        ratio >= 4.5 ? 'atteint' : 'non atteint'
      } |`;
    }),
  ];
}

function componentSections(entries: Entry[]): string[] {
  const lines: string[] = [];
  const families = [...new Set(entries.map((entry) => entry.family))];
  for (const family of families) {
    lines.push(`### ${family}`, '');
    for (const entry of entries.filter((e) => e.family === family)) {
      lines.push(
        `#### \`${entry.name}\``,
        '',
        entry.description,
        '',
        `- Identifiant : \`${entry.id}\``,
        // L'accroche de la carte dit souvent le même nombre que la liste
        // elle-même (« 13 variantes ») : elle n'est reprise que lorsqu'elle
        // ajoute quelque chose, par exemple « 2 états ».
        `- Variantes : ${entry.variants.length}${
          entry.eyebrow &&
          entry.eyebrow !== `${entry.variants.length} variantes`
            ? ` — ${entry.eyebrow}`
            : ''
        }`,
      );
      if (entry.situations.length)
        lines.push(
          `- Écrans où il sert : ${entry.situations
            .map((s) => `${s.label} (\`${s.scenario}\`)`)
            .join(', ')}`,
        );
      lines.push('', '| Variante | JSX |', '| --- | --- |');
      for (const variant of entry.variants)
        lines.push(
          `| \`${cell(variant.label)}\` | ${
            // Toutes les variantes affichées ne déclarent pas leur JSX. Mieux
            // vaut le dire que de l'inventer : un assistant qui lit « non
            // déclaré » va chercher la source, un assistant à qui on sert du
            // code approximatif le recopie.
            variant.code ? inline(variant.code) : '_non déclaré dans la source_'
          } |`,
        );
      lines.push('');
    }
  }
  return lines;
}

function palette(): string[] {
  const lines: string[] = ['### Primitive Colors', ''];
  lines.push(
    `Les ${primitive.reduce(
      (n, g) => n + g.rows.length,
      0,
    )} couleurs sources du fichier Figma, par famille. Valeurs brutes : la`,
    'couche sémantique ci-dessous y puise.',
    '',
  );
  for (const group of primitive) {
    lines.push(`**${group.title}** — ${group.rows.length}`, '');
    lines.push('| Nom | Valeur |', '| --- | --- |');
    for (const [name, hex] of group.rows)
      lines.push(`| \`${name}\` | \`${hex}\` |`);
    lines.push('');
  }
  lines.push(
    '### Semantic Colors',
    '',
    `Les ${semantic.reduce(
      (n, g) => n + g.rows.length,
      0,
    )} rôles du design system, en mode clair et en mode sombre. L’atelier`,
    'n’expose que le mode clair.',
    '',
  );
  for (const group of semantic) {
    lines.push(`**${group.title}** — ${group.rows.length}`, '');
    lines.push(
      '| Rôle | Clair | Dark |',
      '| --- | --- | --- |',
      ...group.rows.map(
        ([name, light, dark, lightHex, darkHex]) =>
          `| \`${name}\` | \`${light}\` ${lightHex} | \`${dark}\` ${darkHex} |`,
      ),
      '',
    );
  }
  return lines;
}

export async function generateDoc(
  root: string,
  output = path.join(root, OUTPUT),
): Promise<string> {
  const source = await readTokens(root);
  const entries = readCatalogue();
  const rules = await fs.readFile(path.join(root, RULES), 'utf8');
  const variants = entries.reduce((n, e) => n + e.variants.length, 0);
  const groups = [
    {
      title: 'Couleurs',
      keys: tokenKeys.filter((k) => k.startsWith('color.')),
    },
    {
      title: 'Typographie',
      keys: tokenKeys.filter((k) => k.startsWith('font.')),
    },
    {
      title: 'Espacements',
      keys: tokenKeys.filter((k) => k.startsWith('space.')),
    },
    { title: 'Rayons', keys: tokenKeys.filter((k) => k.startsWith('radius.')) },
  ];

  const lines: string[] = [
    '# Inbox Zapper — Design System',
    '',
    '<!-- Fichier généré par « npm run doc ». Les modifications faites ici sont',
    '     perdues à la génération suivante : corriger la source, pas la fiche.',
    '     Tokens : l’état de l’atelier. Composants : app/client/CanvasBoard.tsx.',
    '     Règles : workspace/DESIGN_RULES.md. -->',
    '',
    'Fiche de référence destinée à un assistant : les valeurs ci-dessous sont',
    'celles en vigueur dans l’atelier au moment de la génération.',
    '',
    `- Source des tokens : \`${source.origin}\``,
    source.revision === undefined
      ? '- Révision : aucune (le seed versionné, l’atelier n’a pas encore d’état)'
      : `- Révision de l’atelier : ${source.revision}`,
    `- ${tokenKeys.length} tokens, ${entries.length} composants, ${variants} variantes`,
    '',
    '## Comment s’en servir',
    '',
    'Les composants n’écrivent ni couleur ni dimension en dur : ils lisent les',
    'variables CSS listées ci-dessous, posées sur la racine par `tokenCss()`',
    '(`app/shared/model.ts`). Pour une nouvelle pièce, reprendre une variable',
    'existante plutôt qu’un hexadécimal, et un pas de l’échelle d’espacement',
    'plutôt qu’une valeur intermédiaire. Les noms de tokens sont figés par le',
    'schéma : en ajouter un demande une migration d’état, pas une simple ligne.',
    '',
    '## Tokens de l’atelier',
    '',
  ];
  for (const group of groups)
    lines.push(
      `### ${group.title} — ${group.keys.length}`,
      '',
      ...tokenTable(source.tokens, group.keys),
      '',
    );
  lines.push(
    '### Contrastes relevés',
    '',
    'Trois paires mesurées avec la fonction `contrast` partagée. C’est un',
    'sondage, pas un audit : les états survol, désactivé et erreur ne sont pas',
    'couverts.',
    '',
    ...contrastTable(source.tokens),
    '',
    '## Palette source (Figma)',
    '',
    'Ces deux planches sont les valeurs du fichier Figma. Elles ne suivent pas',
    'l’état de l’atelier : elles disent d’où viennent les tokens ci-dessus.',
    '',
    ...palette(),
    `## Composants — ${entries.length}, ${variants} variantes`,
    '',
    'Chaque composant est un atome de `app/client/Atoms.tsx`. Le JSX donné est',
    'celui de la variante affichée dans l’atelier, prêt à coller.',
    '',
    ...componentSections(entries),
    '## Règles de conception',
    '',
    `Copie de \`${RULES}\` à la génération.`,
    '',
    // Le titre de niveau 1 du fichier de règles ferait doublon avec la section
    // qui l'accueille : seul le corps est repris.
    rules.replace(/^#\s[^\n]*\n+/, '').trim(),
    '',
  );

  const markdown = lines.join('\n');
  await atomicWrite(output, markdown);
  return markdown;
}

// La destination est un argument facultatif : le test de bout en bout écrit
// ailleurs que dans le workspace, pour ne pas remplacer la fiche de l'étudiant
// par une fiche de test.
const root = process.cwd();
const output = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, OUTPUT);
const markdown = await generateDoc(root, output);
console.log(
  `${label(root, output)} écrit — ${markdown.split('\n').length} lignes, ${
    markdown.length
  } caractères.`,
);
