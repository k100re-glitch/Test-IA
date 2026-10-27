# DS - Inbox

Design System **Inbox Zapper**, extrait de Figma le 27/10/2026.

Source : fichier Figma `deaSNHimACor07vt2742ZH` (Inbox Zapper), pages
`color-palette` (node `10621:175684`) et `semantic-colors` (node `10606:62979`).
Extraction par Claude Code en terminal via le MCP officiel Figma — **pas** par le
connecteur de DS-Studio, qui reste NOT IMPLEMENTED.

> Une première version de ce dossier mappait la bibliothèque « Shorts Design
> System », remontée comme abonnée au fichier par `get_libraries`. Ce n'est pas
> le DS du projet. Le mapping part désormais de la couche sémantique d'Inbox
> Zapper elle-même.

## Fichiers

| Fichier | Contenu | Statut |
| --- | --- | --- |
| `primitives.colors.json` | 112 couleurs, 11 familles | lu dans Figma |
| `primitives.spacing.json` | 7 pas (4 → 40) | lu dans Figma |
| `primitives.typography.json` | Inter, 6 tailles, 3 graisses | lu dans Figma |
| `semantic.tokens.json` | **50 tokens sémantiques, modes light et dark** | lu dans Figma |
| `ds-studio.tokens.json` | mapping fidèle vers les 18 tokens | valide au schéma |
| `ds-studio.tokens.a11y.json` | mapping corrigé pour le contraste | valide au schéma |

## Couche sémantique

8 groupes, 50 tokens, chacun avec une valeur **light** et une valeur **dark** :

`background/*` (4) · `surface/*` (5) · `text/*` (8) · `stroke/*` (3) ·
`icon/*` (4) · `action/*` (9) · `status/*` (8) · `component/*` (9)

Trois tokens portent une transparence (`action/destructive-surface`,
`action/keep-surface` en dark, `status/success-surface` en dark). Le schéma de
l'app n'accepte que `#RRGGBB` opaque : ces trois-là ne sont pas transposables en
l'état.

## Mapping vers les 18 tokens de l'app

| Token app | ← sémantique Inbox Zapper | Light |
| --- | --- | --- |
| `color.brand` | `action/primary` | `#007BFF` |
| `color.brandHover` | `action/primary-hover` | `#0062CC` |
| `color.onBrand` | `action/primary-text` | `#FFFFFF` |
| `color.surface` | `surface/primary` | `#FFFFFF` |
| `color.canvas` | `background/secondary` | `#F0F0F1` |
| `color.text` | `text/primary` | `#141617` |
| `color.muted` | `text/tertiary` | `#6B7076` |
| `color.border` | `stroke/default` | `#D5D7D9` |
| `color.danger` | `status/error` | `#CD3636` |
| `color.success` | `status/success` | `#44BD1B` |
| `color.focus` | `text/link` | `#007BFF` |

Plus `font.family: Inter`, `font.body: 16`, `font.heading: 24`,
`space.sm/md/lg: 8/16/24`, `radius.control: 12`.

## Contrastes

Mesurés avec `contrast()` de `app/shared/model.ts`, règle de `DESIGN_RULES.md`
(4,5:1 texte courant) :

| Paire | Fidèle | a11y |
| --- | --- | --- |
| onBrand sur brand | **3,98 ✗** | 5,80 ✓ |
| onBrand sur brandHover | 5,80 ✓ | 8,61 ✓ |
| text sur surface | 18,15 ✓ | 18,15 ✓ |
| text sur canvas | 15,94 ✓ | 15,94 ✓ |
| muted sur surface | 4,99 ✓ | 4,99 ✓ |
| danger sur surface | 5,03 ✓ | 5,03 ✓ |
| success sur surface | **2,46 ✗** | 6,08 ✓ |
| focus sur surface | 3,98 ✓ | 3,98 ✓ |

Les deux échecs viennent de la couche sémantique d'Inbox Zapper, pas du mapping :
du blanc sur `action/primary` et `status/success` sur une surface claire ne
tiennent pas 4,5:1. La variante `a11y` descend d'un cran dans les rampes
primitives : `primary/blue-600`, `primary/blue-700`, `green/700`.

## Schéma étendu

`app/shared/model.ts` a été élargi pour accepter ce DS :

- `fontFamilies` exporté, **`Inter` ajouté** à la liste.
- `dimensionMax` exporté, borne passée de **128 à 512**.
- `tokenCss()` ajoute une pile de secours (`Inter, system-ui, sans-serif`) pour
  les polices non garanties.
- `App.tsx` consomme ces exports au lieu de redéclarer la liste et la borne.

Élargir une liste et relever une borne **n'invalide aucun état existant** :
aucune migration n'est requise, le journal n'est pas touché. Un test le vérifie
(`tests/store.test.ts`, « le schéma élargi accepte Inter sans invalider un état
existant »), y compris le refus d'une police hors liste et d'une valeur
au-dessus de la nouvelle borne.

## Limites connues

- **Inter doit être installée sur la machine.** Le projet ne la fournit pas ;
  sans elle, la pile de secours rend `system-ui`. Pour la garantir hors ligne il
  faudrait embarquer le woff2 dans le dépôt.
- **`radius.control` = 12 reste une hypothèse.** Les `12px`/`16px` relevés dans
  la page sont ceux de la documentation Figma elle-même, pas un token de rayon.
  Aucune échelle de rayon n'a été trouvée.
- **Le mode dark n'est pas exploitable par l'app.** Les 50 tokens ont leurs deux
  valeurs ici, mais le schéma n'a qu'un seul mode. Supporter light/dark demande
  d'ajouter des clés, donc une vraie migration d'état.
- Les 3 tokens à transparence ne sont pas transposables.

## Ajouter d'autres tokens

Déposez un `primitives.*.json` ou enrichissez les existants (clés plates,
`$type` / `$value`). Pour qu'un token nouveau soit réellement utilisé par
l'atelier, il faut l'ajouter au schéma **et** écrire une migration d'état :
`.ds-studio/state.json` ne doit jamais être supprimé pour faire passer une clé.
