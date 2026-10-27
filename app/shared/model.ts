import { z } from 'zod';

// Ce sous-ensemble explicite utilise les noms $type/$value, pas toute la norme DTCG.
const color = z
  .object({
    $type: z.literal('color'),
    $value: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur attendue : #RRGGBB'),
  })
  .strict();
// Borne haute des dimensions. Élargie de 128 à 512 pour accepter les échelles
// d’espacement et de typographie réelles d’un DS importé. Élargir une borne ne
// rend invalide aucun état existant : aucune migration n’est requise.
export const dimensionMax = 512;
const dimension = z
  .object({
    $type: z.literal('dimension'),
    $value: z.number().finite().min(0).max(dimensionMax),
  })
  .strict();
// Polices proposées par l’atelier. Les quatre premières sont disponibles sur
// toute machine ; les suivantes sont celles d’un DS importé et ne s’affichent
// que si la police est installée localement ou fournie par le projet.
// Ajouter une valeur ne rend invalide aucun état existant.
export const fontFamilies = [
  'system-ui',
  'Arial',
  'Georgia',
  'Verdana',
  'Inter',
] as const;
const font = z
  .object({
    $type: z.literal('fontFamily'),
    $value: z.enum(fontFamilies),
  })
  .strict();
export const tokensSchema = z
  .object({
    'color.brand': color,
    'color.brandHover': color,
    'color.onBrand': color,
    'color.surface': color,
    'color.canvas': color,
    'color.text': color,
    'color.muted': color,
    'color.border': color,
    'color.danger': color,
    'color.success': color,
    'color.focus': color,
    // Ajoutés en version 2 pour les atomes : fonds de surface et couleur de
    // texte d'invite que les onze premières couleurs ne pouvaient pas exprimer.
    'color.brandSurface': color,
    'color.surfaceMuted': color,
    'color.surfaceSunken': color,
    'color.dangerSurface': color,
    'color.placeholder': color,
    // text/secondary et action/keep-text : le corps de texte des listes et le
    // bleu soutenu des actions « garder », distincts de muted et de brand.
    'color.textSecondary': color,
    'color.brandStrong': color,
    'font.family': font,
    'font.body': dimension,
    'font.heading': dimension,
    'font.caption': dimension,
    'font.control': dimension,
    // L'échelle complète du DS : 4, 8, 12, 16, 24, 32. Sans le pas de 12 ni
    // celui de 32, les rembourrages des atomes devaient être dérivés, donc
    // approximés.
    'space.xs': dimension,
    'space.sm': dimension,
    'space.nm': dimension,
    'space.md': dimension,
    'space.lg': dimension,
    'space.xl': dimension,
    'radius.control': dimension,
    'radius.pill': dimension,
    'radius.field': dimension,
    'radius.check': dimension,
  })
  .strict();
export type Tokens = z.infer<typeof tokensSchema>;
export type TokenKey = keyof Tokens;
export const tokenKeys = Object.keys(tokensSchema.shape) as TokenKey[];
export type TokenValue = string | number;
export const changeSchema = z
  .object({
    key: z.enum(tokenKeys as [TokenKey, ...TokenKey[]]),
    value: z.union([z.string().max(100), z.number().finite()]),
  })
  .strict();
export const proposeSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    changes: z.array(changeSchema).min(1).max(50),
  })
  .strict();
export interface Patch {
  key: TokenKey;
  before: TokenValue;
  after: TokenValue;
}
export interface Revision {
  id: string;
  revision: number;
  date: string;
  source: 'manual' | 'codex' | 'import' | 'undo';
  patches: Patch[];
}
// Version du fichier d'état. La version 2 ajoute onze tokens pour les atomes.
export const stateVersion = 2;
export interface State {
  version: typeof stateVersion;
  revision: number;
  tokens: Tokens;
  history: Revision[];
}

// Valeurs de repli des clés ajoutées en version 2. Une migration complète un
// état existant, elle n'invente pas une intention de design : ces valeurs sont
// neutres, et réappliquer un design system du catalogue les remplace toutes.
export const tokensAddedInV2: Record<string, { $type: string; $value: TokenValue }> = {
  'color.brandSurface': { $type: 'color', $value: '#EDF1F9' },
  'color.surfaceMuted': { $type: 'color', $value: '#F7F7F8' },
  'color.surfaceSunken': { $type: 'color', $value: '#F0F0F1' },
  'color.dangerSurface': { $type: 'color', $value: '#F8E1E1' },
  'color.placeholder': { $type: 'color', $value: '#9B9FA4' },
  'color.textSecondary': { $type: 'color', $value: '#4D5258' },
  'color.brandStrong': { $type: 'color', $value: '#1B49BD' },
  'font.caption': { $type: 'dimension', $value: 14 },
  'font.control': { $type: 'dimension', $value: 20 },
  'space.xs': { $type: 'dimension', $value: 4 },
  'space.nm': { $type: 'dimension', $value: 12 },
  'space.xl': { $type: 'dimension', $value: 32 },
  'radius.pill': { $type: 'dimension', $value: 100 },
  'radius.field': { $type: 'dimension', $value: 8 },
  'radius.check': { $type: 'dimension', $value: 6 },
};

// Complète un état lu sur disque sans rien supprimer : les tokens déjà
// présents gardent leur valeur, le journal et la révision sont intacts. Une
// clé inconnue n'est pas retirée ici : la validation stricte la signalera,
// plutôt que de faire disparaître silencieusement une donnée de l'étudiant.
export function migrateState(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input;
  const state = input as Record<string, unknown>;
  if (typeof state.version !== 'number' || state.version > stateVersion)
    return input;
  const tokens = state.tokens;
  if (typeof tokens !== 'object' || tokens === null) return input;
  // Toute clé attendue et absente est complétée, même dans un état qui porte
  // déjà le numéro de version courant : un fichier écrit entre deux ajouts ne
  // doit pas devenir illisible.
  const next = { ...(tokens as Record<string, unknown>) };
  let added = false;
  for (const [key, value] of Object.entries(tokensAddedInV2))
    if (!(key in next)) {
      next[key] = { ...value };
      added = true;
    }
  if (!added && state.version === stateVersion) return input;
  return { ...state, version: stateVersion, tokens: next };
}
export interface Proposal {
  id: string;
  revision: number;
  source: Revision['source'];
  patches: Patch[];
}
export const patchSchema = z
  .object({
    key: z.enum(tokenKeys as [TokenKey, ...TokenKey[]]),
    before: z.union([z.string(), z.number()]),
    after: z.union([z.string(), z.number()]),
  })
  .strict();
export const stateSchema = z
  .object({
    version: z.literal(stateVersion),
    revision: z.number().int().nonnegative(),
    tokens: tokensSchema,
    history: z.array(
      z
        .object({
          id: z.string().uuid(),
          revision: z.number().int().positive(),
          date: z.string().datetime(),
          source: z.enum(['manual', 'codex', 'import', 'undo']),
          patches: z.array(patchSchema).min(1),
        })
        .strict(),
    ),
  })
  .strict();
export const agentReplySchema = z
  .object({
    message: z.string().max(12000),
    changes: z.array(changeSchema).max(20),
  })
  .strict();
export type AgentReply = z.infer<typeof agentReplySchema>;
export function applyChanges(
  tokens: Tokens,
  changes: { key: TokenKey; value: TokenValue }[],
): Tokens {
  const next = structuredClone(tokens);
  if (new Set(changes.map((c) => c.key)).size !== changes.length)
    throw new Error('Un token ne peut apparaître deux fois.');
  for (const change of changes) next[change.key].$value = change.value as never;
  return tokensSchema.parse(next);
}
export function diff(before: Tokens, after: Tokens): Patch[] {
  return tokenKeys
    .filter((key) => before[key].$value !== after[key].$value)
    .map((key) => ({
      key,
      before: before[key].$value,
      after: after[key].$value,
    }));
}
// Pile de secours appliquée aux polices qui ne sont pas garanties présentes.
// Sans elle, une police absente de la machine fait retomber le rendu sur le
// défaut du navigateur plutôt que sur le reste du DS.
function fontStack(value: string): string {
  return value === 'system-ui' ? value : `${value}, system-ui, sans-serif`;
}
export function tokenCss(tokens: Tokens): Record<string, string> {
  return Object.fromEntries(
    tokenKeys.map((key) => {
      const token = tokens[key];
      if (token.$type === 'dimension')
        return [`--${key.replaceAll('.', '-')}`, `${token.$value}px`];
      if (token.$type === 'fontFamily')
        return [
          `--${key.replaceAll('.', '-')}`,
          fontStack(String(token.$value)),
        ];
      return [`--${key.replaceAll('.', '-')}`, String(token.$value)];
    }),
  );
}
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = hex
      .slice(1)
      .match(/../g)!
      .map((x) => parseInt(x, 16) / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
