# Inbox Zapper — Design System

<!-- Fichier généré par « npm run doc ». Les modifications faites ici sont
     perdues à la génération suivante : corriger la source, pas la fiche.
     Tokens : l’état de l’atelier. Composants : app/client/CanvasBoard.tsx.
     Règles : workspace/DESIGN_RULES.md. -->

Fiche de référence destinée à un assistant : les valeurs ci-dessous sont
celles en vigueur dans l’atelier au moment de la génération.

- Source des tokens : `.ds-studio/state.json`
- Révision de l’atelier : 6
- 39 tokens, 10 composants, 37 variantes

## Comment s’en servir

Les composants n’écrivent ni couleur ni dimension en dur : ils lisent les
variables CSS listées ci-dessous, posées sur la racine par `tokenCss()`
(`app/shared/model.ts`). Pour une nouvelle pièce, reprendre une variable
existante plutôt qu’un hexadécimal, et un pas de l’échelle d’espacement
plutôt qu’une valeur intermédiaire. Les noms de tokens sont figés par le
schéma : en ajouter un demande une migration d’état, pas une simple ligne.

## Tokens de l’atelier

### Couleurs — 24

| Token | Variable CSS | Valeur |
| --- | --- | --- |
| `color.brand` | `--color-brand` | `#007BFF` |
| `color.brandHover` | `--color-brandHover` | `#0062CC` |
| `color.onBrand` | `--color-onBrand` | `#FFFFFF` |
| `color.surface` | `--color-surface` | `#FFFFFF` |
| `color.canvas` | `--color-canvas` | `#F0F0F1` |
| `color.text` | `--color-text` | `#141617` |
| `color.muted` | `--color-muted` | `#6B7076` |
| `color.border` | `--color-border` | `#D5D7D9` |
| `color.danger` | `--color-danger` | `#CD3636` |
| `color.success` | `--color-success` | `#44BD1B` |
| `color.focus` | `--color-focus` | `#007BFF` |
| `color.brandSurface` | `--color-brandSurface` | `#EDF1F9` |
| `color.surfaceMuted` | `--color-surfaceMuted` | `#F7F7F8` |
| `color.surfaceSunken` | `--color-surfaceSunken` | `#F0F0F1` |
| `color.dangerSurface` | `--color-dangerSurface` | `#F8E1E1` |
| `color.placeholder` | `--color-placeholder` | `#9B9FA4` |
| `color.textSecondary` | `--color-textSecondary` | `#4D5258` |
| `color.brandStrong` | `--color-brandStrong` | `#1B49BD` |
| `color.warning` | `--color-warning` | `#E78300` |
| `color.warningSurface` | `--color-warningSurface` | `#FFF7ED` |
| `color.warningCanvas` | `--color-warningCanvas` | `#FEFAF5` |
| `color.warningText` | `--color-warningText` | `#513210` |
| `color.successSurface` | `--color-successSurface` | `#EEF9E9` |
| `color.brandTint` | `--color-brandTint` | `#E1EFFE` |

### Typographie — 5

| Token | Variable CSS | Valeur |
| --- | --- | --- |
| `font.family` | `--font-family` | `Inter, system-ui, sans-serif` |
| `font.body` | `--font-body` | `16px` |
| `font.heading` | `--font-heading` | `24px` |
| `font.caption` | `--font-caption` | `14px` |
| `font.control` | `--font-control` | `20px` |

### Espacements — 6

| Token | Variable CSS | Valeur |
| --- | --- | --- |
| `space.xs` | `--space-xs` | `4px` |
| `space.sm` | `--space-sm` | `8px` |
| `space.nm` | `--space-nm` | `12px` |
| `space.md` | `--space-md` | `16px` |
| `space.lg` | `--space-lg` | `24px` |
| `space.xl` | `--space-xl` | `32px` |

### Rayons — 4

| Token | Variable CSS | Valeur |
| --- | --- | --- |
| `radius.control` | `--radius-control` | `12px` |
| `radius.pill` | `--radius-pill` | `100px` |
| `radius.field` | `--radius-field` | `8px` |
| `radius.check` | `--radius-check` | `6px` |

### Contrastes relevés

Trois paires mesurées avec la fonction `contrast` partagée. C’est un
sondage, pas un audit : les états survol, désactivé et erreur ne sont pas
couverts.

| Paire | Rapport | Seuil AA texte courant (4,5:1) |
| --- | --- | --- |
| Texte sur surface | 18.15:1 | atteint |
| Texte sur marque | 3.98:1 | non atteint |
| Texte secondaire sur surface | 4.99:1 | atteint |

## Palette source (Figma)

Ces deux planches sont les valeurs du fichier Figma. Elles ne suivent pas
l’état de l’atelier : elles disent d’où viennent les tokens ci-dessus.

### Primitive Colors

Les 112 couleurs sources du fichier Figma, par famille. Valeurs brutes : la
couche sémantique ci-dessous y puise.

**Primary** — 10

| Nom | Valeur |
| --- | --- |
| `primary/blue-50` | `#F0F7FF` |
| `primary/blue-100` | `#E1EFFE` |
| `primary/blue-200` | `#B8DAFF` |
| `primary/blue-300` | `#69B1FF` |
| `primary/blue-400` | `#3395FF` |
| `primary/blue-500` | `#007BFF` |
| `primary/blue-600` | `#0062CC` |
| `primary/blue-700` | `#004A99` |
| `primary/blue-800` | `#003366` |
| `primary/blue-900` | `#001F3F` |

**Blue** — 10

| Nom | Valeur |
| --- | --- |
| `blue/50` | `#EDF1F9` |
| `blue/100` | `#EDF0FA` |
| `blue/200` | `#C4D1E8` |
| `blue/300` | `#7A9DD4` |
| `blue/400` | `#4070B8` |
| `blue/500` | `#1B49BD` |
| `blue/600` | `#0F3D8A` |
| `blue/700` | `#0B2E68` |
| `blue/800` | `#081F47` |
| `blue/900` | `#041228` |

**Green** — 10

| Nom | Valeur |
| --- | --- |
| `green/50` | `#F0FAEA` |
| `green/100` | `#EEFAED` |
| `green/200` | `#C3EDA6` |
| `green/300` | `#7DD44A` |
| `green/400` | `#51C223` |
| `green/500` | `#44BD1B` |
| `green/600` | `#35960D` |
| `green/700` | `#287109` |
| `green/800` | `#1B4D06` |
| `green/900` | `#0F2A03` |

**Red** — 10

| Nom | Valeur |
| --- | --- |
| `red/50` | `#FEF2F2` |
| `red/100` | `#FDE9E9` |
| `red/200` | `#F5C4C4` |
| `red/300` | `#E87171` |
| `red/400` | `#D94444` |
| `red/500` | `#CD3636` |
| `red/600` | `#9B1A1A` |
| `red/700` | `#741313` |
| `red/800` | `#4E0D0D` |
| `red/900` | `#2B0707` |

**Purple** — 10

| Nom | Valeur |
| --- | --- |
| `purple/50` | `#F8F5FB` |
| `purple/100` | `#F6F3FB` |
| `purple/200` | `#D8C8E6` |
| `purple/300` | `#A878C9` |
| `purple/400` | `#8F55B5` |
| `purple/500` | `#8650AA` |
| `purple/600` | `#6B3F8A` |
| `purple/700` | `#512F68` |
| `purple/800` | `#372047` |
| `purple/900` | `#1E1128` |

**Orange** — 10

| Nom | Valeur |
| --- | --- |
| `orange/50` | `#FFF7ED` |
| `orange/100` | `#FFECCC` |
| `orange/200` | `#FFD68A` |
| `orange/300` | `#FFBA42` |
| `orange/400` | `#F29A00` |
| `orange/500` | `#E78300` |
| `orange/600` | `#7A4600` |
| `orange/700` | `#5C3400` |
| `orange/800` | `#3D2300` |
| `orange/900` | `#211300` |

**Brown** — 10

| Nom | Valeur |
| --- | --- |
| `brown/50` | `#FEFAF5` |
| `brown/100` | `#FFEAD6` |
| `brown/200` | `#EDD5B8` |
| `brown/300` | `#C9A070` |
| `brown/400` | `#8A6030` |
| `brown/500` | `#513210` |
| `brown/600` | `#3D2510` |
| `brown/700` | `#2E1B0B` |
| `brown/800` | `#1F1207` |
| `brown/900` | `#110A04` |

**Yellow** — 10

| Nom | Valeur |
| --- | --- |
| `yellow/50` | `#FFFDE7` |
| `yellow/100` | `#FFF9C4` |
| `yellow/200` | `#FFF176` |
| `yellow/300` | `#FFEE58` |
| `yellow/400` | `#FFEB3B` |
| `yellow/500` | `#FDD835` |
| `yellow/600` | `#F9A825` |
| `yellow/700` | `#F57F17` |
| `yellow/800` | `#E65100` |
| `yellow/900` | `#BF360C` |

**Teal** — 10

| Nom | Valeur |
| --- | --- |
| `teal/50` | `#F0FDFA` |
| `teal/100` | `#CCFBF1` |
| `teal/200` | `#99F6E4` |
| `teal/300` | `#5EEAD4` |
| `teal/400` | `#2DD4BF` |
| `teal/500` | `#14B8A6` |
| `teal/600` | `#0D9488` |
| `teal/700` | `#0F766E` |
| `teal/800` | `#115E59` |
| `teal/900` | `#134E4A` |

**Pink** — 10

| Nom | Valeur |
| --- | --- |
| `pink/50` | `#FDF2F8` |
| `pink/100` | `#FCE7F3` |
| `pink/200` | `#FBCFE8` |
| `pink/300` | `#F9A8D4` |
| `pink/400` | `#F472B6` |
| `pink/500` | `#EC4899` |
| `pink/600` | `#DB2777` |
| `pink/700` | `#BE185D` |
| `pink/800` | `#9D174D` |
| `pink/900` | `#831843` |

**Base** — 12

| Nom | Valeur |
| --- | --- |
| `base/white` | `#FFFFFF` |
| `base/grey-50` | `#F8F9FA` |
| `base/grey-100` | `#F6F7F8` |
| `base/grey-200` | `#E0E3E5` |
| `base/grey-300` | `#9CA1A7` |
| `base/grey-400` | `#676E76` |
| `base/grey-500` | `#454C52` |
| `base/grey-600` | `#1F2B36` |
| `base/grey-700` | `#1A2530` |
| `base/grey-800` | `#151E27` |
| `base/grey-900` | `#10171E` |
| `base/black` | `#1A1D1F` |

### Semantic Colors

Les 50 rôles du design system, en mode clair et en mode sombre. L’atelier
n’expose que le mode clair.

**Background** — 4

| Rôle | Clair | Dark |
| --- | --- | --- |
| `background/elevated` | `#FFFFFF` #FFFFFF | `#1C1F22` #1C1F22 |
| `background/primary` | `#FFFFFF` #FFFFFF | `#141617` #141617 |
| `background/secondary` | `#F0F0F1` #F0F0F1 | `#181B1D` #181B1D |
| `background/tertiary` | `#D5D7D9` #D5D7D9 | `#1C1F22` #1C1F22 |

**Surface** — 5

| Rôle | Clair | Dark |
| --- | --- | --- |
| `surface/brand` | `#E1EFFE` #E1EFFE | `#001F3F` #001F3F |
| `surface/brand-subtle` | `#F0F7FF` #F0F7FF | `#003366` #003366 |
| `surface/primary` | `#FFFFFF` #FFFFFF | `#181B1D` #181B1D |
| `surface/secondary` | `#F7F7F8` #F7F7F8 | `#1C1F22` #1C1F22 |
| `surface/tertiary` | `#F0F0F1` #F0F0F1 | `#1C1F22` #1C1F22 |

**Text** — 8

| Rôle | Clair | Dark |
| --- | --- | --- |
| `text/body` | `#4D5258` #4D5258 | `#D5D7D9` #D5D7D9 |
| `text/brand` | `#007BFF` #007BFF | `#007BFF` #007BFF |
| `text/inverse` | `#FFFFFF` #FFFFFF | `#141617` #141617 |
| `text/link` | `#007BFF` #007BFF | `#007BFF` #007BFF |
| `text/placeholder` | `#9B9FA4` #9B9FA4 | `#9B9FA4` #9B9FA4 |
| `text/primary` | `#141617` #141617 | `#FFFFFF` #FFFFFF |
| `text/secondary` | `#4D5258` #4D5258 | `#D5D7D9` #D5D7D9 |
| `text/tertiary` | `#6B7076` #6B7076 | `#9B9FA4` #9B9FA4 |

**Stroke** — 3

| Rôle | Clair | Dark |
| --- | --- | --- |
| `stroke/default` | `#D5D7D9` #D5D7D9 | `#292D31` #292D31 |
| `stroke/strong` | `#141617` #141617 | `#D5D7D9` #D5D7D9 |
| `stroke/subtle` | `#F0F0F1` #F0F0F1 | `#1C1F22` #1C1F22 |

**Icon** — 4

| Rôle | Clair | Dark |
| --- | --- | --- |
| `icon/brand` | `#007BFF` #007BFF | `#007BFF` #007BFF |
| `icon/primary` | `#141617` #141617 | `#FFFFFF` #FFFFFF |
| `icon/secondary` | `#6B7076` #6B7076 | `#D5D7D9` #D5D7D9 |
| `icon/tertiary` | `#9B9FA4` #9B9FA4 | `#9B9FA4` #9B9FA4 |

**Action** — 9

| Rôle | Clair | Dark |
| --- | --- | --- |
| `action/destructive` | `#CD3636` #CD3636 | `#CD3636` #CD3636 |
| `action/destructive-surface` | `#CD3636 (15%)` #CD3636 | `#CD3636 (15%)` #CD3636 |
| `action/destructive-text` | `#CD3636` #CD3636 | `#CD3636` #CD3636 |
| `action/keep` | `#1B49BD` #1B49BD | `#007BFF` #007BFF |
| `action/keep-surface` | `#EDF1F9` #EDF1F9 | `#007BFF (15%)` #007BFF |
| `action/keep-text` | `#1B49BD` #1B49BD | `#007BFF` #007BFF |
| `action/primary` | `#007BFF` #007BFF | `#007BFF` #007BFF |
| `action/primary-hover` | `#0062CC` #0062CC | `#3395FF` #3395FF |
| `action/primary-text` | `#FFFFFF` #FFFFFF | `#FFFFFF` #FFFFFF |

**Status** — 8

| Rôle | Clair | Dark |
| --- | --- | --- |
| `status/error` | `#CD3636` #CD3636 | `#D94444` #D94444 |
| `status/error-surface` | `#FDE9E9` #FDE9E9 | `#2B0707` #2B0707 |
| `status/info` | `#1B49BD` #1B49BD | `#7A9DD4` #7A9DD4 |
| `status/info-surface` | `#EDF0FA` #EDF0FA | `#081F47` #081F47 |
| `status/success` | `#44BD1B` #44BD1B | `#51C223` #51C223 |
| `status/success-surface` | `#EEFAED` #EEFAED | `#51C223 (10%)` #51C223 |
| `status/warning` | `#E78300` #E78300 | `#F29A00` #F29A00 |
| `status/warning-surface` | `#FFF7ED` #FFF7ED | `#211300` #211300 |

**Component** — 9

| Rôle | Clair | Dark |
| --- | --- | --- |
| `component/badge` | `#CD3636` #CD3636 | `#D94444` #D94444 |
| `component/progress` | `#007BFF` #007BFF | `#007BFF` #007BFF |
| `component/progress-track` | `#F0F0F1` #F0F0F1 | `#1C1F22` #1C1F22 |
| `component/tab-active` | `#007BFF` #007BFF | `#007BFF` #007BFF |
| `component/tab-inactive` | `#9B9FA4` #9B9FA4 | `#6B7076` #6B7076 |
| `component/tag-surface` | `#F0F0F1` #F0F0F1 | `#1C1F22` #1C1F22 |
| `component/tag-text` | `#6B7076` #6B7076 | `#D5D7D9` #D5D7D9 |
| `component/toggle-off` | `#D5D7D9` #D5D7D9 | `#353B41` #353B41 |
| `component/toggle-on` | `#007BFF` #007BFF | `#007BFF` #007BFF |

## Composants — 10, 37 variantes

Chaque composant est un atome de `app/client/Atoms.tsx`. Le JSX donné est
celui de la variante affichée dans l’atelier, prêt à coller.

### Actions

#### `button`

Cinq intentions, trois tailles. H1 et H2 pleine largeur, sm pour les cartes.

- Identifiant : `button`
- Variantes : 13
- Écrans où il sert : Mailing lists (`home`), Anciens e-mails (`choice`), Accueil (`welcome`)

| Variante | JSX |
| --- | --- |
| `primary_H1` | `<Button tone="primary" block>Text</Button>` |
| `secondary_H1` | `<Button tone="secondary" block>Text</Button>` |
| `delete_H1` | `<Button tone="danger" block>Text</Button>` |
| `secondary_delete_H1` | `<Button tone="dangerSoft" block>Text</Button>` |
| `grey_H1` | `<Button tone="grey" block>Text</Button>` |
| `secondary_H1_disable` | `<Button disabled block>Text</Button>` |
| `primary_H2` | `<Button tone="primary" size="h2" block>Text</Button>` |
| `secondary_H2` | `<Button tone="secondary" size="h2" block>Text</Button>` |
| `delete_H2` | `<Button tone="danger" size="h2" block>Text</Button>` |
| `secondary_delete_H2` | `<Button tone="dangerSoft" size="h2" block>Text</Button>` |
| `grey_H2` | `<Button tone="grey" size="h2" block>Text</Button>` |
| `sm · buttons--secondary` | `<Button tone="secondary" size="sm" block>✓ Keep</Button>` |
| `sans icône` | `<Button size="h2" showIcon={false} block>Text</Button>` |

#### `tag`

Étiquette compacte, texte font.caption, rayon pleinement arrondi.

- Identifiant : `tag`
- Variantes : 2
- Écrans où il sert : Mailing lists (`home`), Fiche expéditeur (`sender`)

| Variante | JSX |
| --- | --- |
| `state=primary` | `<Tag>NEW</Tag>` |
| `state=secondary` | `<Tag tone="secondary">NEW</Tag>` |

#### `filters`

Puce de filtre à rayon plein, texte 14 et chevron 20. Inactive sur gris, active sur bleu clair.

- Identifiant : `filters`
- Variantes : 2 — 2 états
- Écrans où il sert : Expéditeurs (`sender`)

| Variante | JSX |
| --- | --- |
| `state=false` | `<Filter onClick={openMenu}>text</Filter>` |
| `state=true` | `<Filter active onClick={openMenu}>text</Filter>` |

### Formulaire

#### `checkbox`

Case 24 px, rayon radius.check. Élément natif : focus et rôle inclus.

- Identifiant : `checkbox`
- Variantes : 2 — 2 états

| Variante | JSX |
| --- | --- |
| `selected=true` | `<Checkbox checked={on} onChange={setOn}>Coché</Checkbox>` |
| `selected=false` | `<Checkbox checked={false} onChange={setOn}>Décoché</Checkbox>` |

#### `radio`

Bouton radio 24 px, pastille intérieure sur color.onBrand.

- Identifiant : `radio`
- Variantes : 2 — 2 états

| Variante | JSX |
| --- | --- |
| `selected=true` | `<Radio name="freq" value="a" checked={v === 'a'} onChange={setV}>Option A</Radio>` |
| `selected=false` | `<Radio name="freq" value="b" checked={v === 'b'} onChange={setV}>Option B</Radio>` |

#### `toggle`

Bascule aux proportions iOS, 54 × 23,6. Rôle switch natif.

- Identifiant : `toggle`
- Variantes : 2 — 2 états
- Écrans où il sert : Anciens e-mails (`choice`)

| Variante | JSX |
| --- | --- |
| `State=On` | `<Toggle checked={on} onChange={setOn}>Alertes</Toggle>` |
| `State=Off` | `<Toggle checked={false} onChange={setOn}>Alertes</Toggle>` |

#### `text_field`

Champ sur color.surfaceSunken, rayon radius.field, invite dédiée.

- Identifiant : `text_field`
- Variantes : 3 — 3 états

| Variante | JSX |
| --- | --- |
| `une ligne` | `<TextField label="Libellé" value={v} placeholder="Text..." onChange={setV} />` |
| `multiligne` | `<TextField label="Libellé" value={v} multiline onChange={setV} />` |
| `désactivé` | `<TextField label="Libellé" value="" disabled onChange={() => {}} />` |

#### `search-bar`

Champ de recherche 353 × 41. Bordure bleue au focus, croix dès qu’il y a du texte.

- Identifiant : `search-bar`
- Variantes : 2 — 2 états
- Écrans où il sert : Expéditeurs (`sender`)

| Variante | JSX |
| --- | --- |
| `state=default` | `<SearchBar value={q} onChange={setQ} />` |
| `state=focus` | `<SearchBar value={q} onChange={setQ} placeholder="Search sender" />` |

### Surfaces

#### `modal`

Boîte de dialogue 345 px, rembourrage et rayon à 24. Deux boutons, un, aucun, ou empilés.

- Identifiant : `modal`
- Variantes : 4 — 4 états
- Écrans où il sert : Anciens e-mails (`choice`)

| Variante | JSX |
| --- | --- |
| `state=2 buttons` | `<Modal state="two" title="Here your title">…</Modal>` |
| `state=1 button` | `<Modal state="one" title="Here your title">…</Modal>` |
| `state=0 button` | `<Modal state="none" onClose={close}>…</Modal>` |
| `state=2 buttons superimposed` | `<Modal state="stacked" title="Here your title">…</Modal>` |

#### `scan_free_limit`

État d'avancement du scan, 353 px. Carte cliquable côté premium, ligne centrée côté freemium.

- Identifiant : `scan_free_limit`
- Variantes : 5
- Écrans où il sert : Accueil (`home`)

| Variante | JSX |
| --- | --- |
| `premium · scanning` | `<ScanLimit plan="premium" state="scanning" onOpen={open} />` |
| `premium · scan limit reached` | `<ScanLimit plan="premium" state="limit" onOpen={goPro} />` |
| `premium · completed` | `<ScanLimit plan="premium" state="completed" />` |
| `freemium · scanning` | `<ScanLimit plan="freemium" state="scanning" />` |
| `freemium · completed` | `<ScanLimit plan="freemium" state="completed" />` |

## Règles de conception

Copie de `workspace/DESIGN_RULES.md` à la génération.

- Employer les couleurs sémantiques plutôt que des hexadécimaux dans les composants.
- Conserver un contraste de 4,5:1 pour le texte courant et 3:1 pour le grand texte.
- Garder un focus clavier visible et des libellés explicites pour les formulaires.
- Distinguer normal, survol, focus, désactivé et erreur.
- Vérifier une largeur de 320 px sans zoom et un scénario desktop.
- Expliquer chaque proposition : intention, composants touchés, preuve attendue.
- Ne jamais annoncer une synchronisation Figma qui n’a pas été relue et démontrée.

Ces règles sont des objectifs à tester, pas une certification automatique.
