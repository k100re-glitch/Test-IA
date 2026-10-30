import { useState, type CSSProperties, type ReactNode } from 'react';
import { tokenCss, tokenKeys, type Tokens } from '../shared/model.js';
import CopyButton from './CopyButton.js';
import MockupFrame, { mockups } from './Mockups.js';
import { sectionId, tokenSections } from './TokensTab.js';
import type { Draft } from './drafts.js';
import {
  Button,
  Checkbox,
  Filter,
  Modal,
  Radio,
  ScanLimit,
  SearchBar,
  Tag,
  TextField,
  Toggle,
} from './Atoms.js';

// Catalogue de composants : une liste de cartes, chacune avec un aperçu posé
// sur une surface neutre, puis une vue de détail qui déplie toutes les
// variantes. La structure reprend celle d'une page d'index d'outils :
// fil d'Ariane, titre, grille de cartes, chaque carte menant à sa page.

export interface Variant {
  label: string;
  node: ReactNode;
  wide?: boolean;
  // Le JSX réellement équivalent à l'aperçu affiché, prêt à coller.
  code?: string;
}
// Écrans où le composant apparaît réellement. L'aperçu les charge dans
// l'iframe du scénario, à largeur de téléphone : on voit la pièce en service,
// pas isolée sur sa scène.
export interface Situation {
  scenario: string;
  label: string;
}
// Familles de composants. L'ordre ci-dessous est celui de l'affichage.
const families = ['Actions', 'Formulaire', 'Surfaces'] as const;

// Un pictogramme par famille, au trait et hérité de la couleur du libellé :
// dans une liste de dix entrées, l'œil retrouve un groupe à sa silhouette plus
// vite qu'à son nom. Ils sont décoratifs, le nom de la famille est écrit juste
// à côté.
const familyIcons: Record<(typeof families)[number], ReactNode> = {
  // éclair : le déclenchement
  Actions: <path d="M11.2 2.4 4.6 11.2h4.2l-1 6.4 6.6-8.8h-4.2z" />,
  // champ et ligne de saisie
  Formulaire: (
    <>
      <rect x="2.6" y="4.2" width="14.8" height="11.6" rx="2.4" />
      <path d="M5.8 9.4h5.2" />
    </>
  ),
  // plans empilés
  Surfaces: (
    <>
      <rect x="2.6" y="2.8" width="10.6" height="10.6" rx="2.4" />
      <path d="M6.8 17.2h8a2.4 2.4 0 0 0 2.4-2.4v-8" />
    </>
  ),
};

function FamilyIcon({ family }: { family: (typeof families)[number] }) {
  return (
    <svg
      className="cat-fam-icon"
      width="14"
      height="14"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      {familyIcons[family]}
    </svg>
  );
}
type Family = (typeof families)[number];

export interface Entry {
  id: string;
  family: Family;
  name: string;
  eyebrow: string;
  description: string;
  preview: ReactNode;
  variants: Variant[];
  situations: Situation[];
}

// Une demande venue d'un lien Figma prend la forme d'une entrée du catalogue,
// mais ne prétend pas en être une : son aperçu est un emplacement vide, son
// accroche dit « simulé », et sa fiche donne les coordonnées du nœud plutôt
// qu'un code qui n'existe pas.
function draftEntry(draft: Draft): Entry {
  const place = (
    <span className="prev-draft">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7.5v9M7.5 12h9" />
      </svg>
      {draft.name}
    </span>
  );
  return {
    id: `draft:${draft.id}`,
    family: draft.family,
    name: draft.name,
    eyebrow: 'Simulé',
    description: `Nœud ${draft.nodeId} du fichier ${draft.fileKey}. Le code sera écrit lors de l'intégration réelle.`,
    preview: place,
    variants: [{ label: 'en attente d’intégration', node: place }],
    situations: [],
  };
}

export function useCatalogue(): Entry[] {
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState('a');
  const [on, setOn] = useState(true);
  const [text, setText] = useState('');
  // Deux champs distincts : les variantes du DS sont le champ vide et le
  // champ saisi, elles doivent rester indépendantes à l'écran.
  const [search, setSearch] = useState('');
  const [searchTyped, setSearchTyped] = useState('Dav');
  const tones = [
    ['primary', 'primary'],
    ['secondary', 'secondary'],
    ['danger', 'delete'],
    ['dangerSoft', 'secondary_delete'],
    ['grey', 'grey'],
  ] as const;
  return [
    {
      id: 'button',
      family: 'Actions',
      name: 'button',
      eyebrow: '13 variantes',
      description:
        'Cinq intentions, trois tailles. H1 et H2 pleine largeur, sm pour les cartes.',
      preview: (
        // Deux boutons suffisent à montrer le contraste primaire / secondaire ;
        // le troisième allongeait la vignette sans rien dire de plus. Les onze
        // autres variantes sont sur la fiche.
        <div className="prev-stack">
          <Button block>Text</Button>
          <Button tone="secondary" size="h2" block>
            Text
          </Button>
        </div>
      ),
      variants: [
        ...tones.map(([tone, label]) => ({
          label: `${label}_H1`,
          wide: true,
          code: `<Button tone="${tone}" block>Text</Button>`,
          node: (
            <Button tone={tone} block>
              Text
            </Button>
          ),
        })),
        {
          label: 'secondary_H1_disable',
          wide: true,
          code: '<Button disabled block>Text</Button>',
          node: (
            <Button disabled block>
              Text
            </Button>
          ),
        },
        ...tones.map(([tone, label]) => ({
          label: `${label}_H2`,
          wide: true,
          code: `<Button tone="${tone}" size="h2" block>Text</Button>`,
          node: (
            <Button tone={tone} size="h2" block>
              Text
            </Button>
          ),
        })),
        {
          label: 'sm · buttons--secondary',
          wide: true,
          code: '<Button tone="secondary" size="sm" block>\u2713 Keep</Button>',
          node: (
            <Button tone="secondary" size="sm" block>
              ✓ Keep
            </Button>
          ),
        },
        {
          label: 'sans icône',
          wide: true,
          code: '<Button size="h2" showIcon={false} block>Text</Button>',
          node: (
            <Button size="h2" showIcon={false} block>
              Text
            </Button>
          ),
        },
      ],
      situations: [
        { scenario: 'home', label: 'Mailing lists' },
        { scenario: 'choice', label: 'Anciens e-mails' },
        { scenario: 'welcome', label: 'Accueil' },
      ],
    },
    {
      id: 'tag',
      family: 'Actions',
      name: 'tag',
      eyebrow: '2 variantes',
      description:
        'Étiquette compacte, texte font.caption, rayon pleinement arrondi.',
      preview: (
        <div className="prev-row">
          <Tag>NEW</Tag>
          <Tag tone="secondary">Archivé</Tag>
        </div>
      ),
      variants: [
        {
          label: 'state=primary',
          node: <Tag>NEW</Tag>,
          code: '<Tag>NEW</Tag>',
        },
        {
          label: 'state=secondary',
          node: <Tag tone="secondary">NEW</Tag>,
          code: '<Tag tone="secondary">NEW</Tag>',
        },
      ],
      situations: [
        { scenario: 'home', label: 'Mailing lists' },
        { scenario: 'sender', label: 'Fiche expéditeur' },
      ],
    },
    {
      id: 'checkbox',
      family: 'Formulaire',
      name: 'checkbox',
      eyebrow: '2 états',
      description:
        'Case 24 px, rayon radius.check. Élément natif : focus et rôle inclus.',
      preview: (
        <Checkbox checked={checked} onChange={setChecked}>
          Me prévenir
        </Checkbox>
      ),
      variants: [
        {
          label: 'selected=true',
          code: '<Checkbox checked={on} onChange={setOn}>Coché</Checkbox>',
          node: (
            <Checkbox checked={checked} onChange={setChecked}>
              Coché
            </Checkbox>
          ),
        },
        {
          label: 'selected=false',
          code: '<Checkbox checked={false} onChange={setOn}>Décoché</Checkbox>',
          node: (
            <Checkbox checked={!checked} onChange={(v) => setChecked(!v)}>
              Décoché
            </Checkbox>
          ),
        },
      ],
      situations: [],
    },
    {
      id: 'radio',
      family: 'Formulaire',
      name: 'radio',
      eyebrow: '2 états',
      description: 'Bouton radio 24 px, pastille intérieure sur color.onBrand.',
      preview: (
        <Radio
          name="prev"
          value="a"
          checked={choice === 'a'}
          onChange={setChoice}
        >
          Immédiat
        </Radio>
      ),
      variants: [
        {
          label: 'selected=true',
          code: '<Radio name="freq" value="a" checked={v === \'a\'} onChange={setV}>Option A</Radio>',
          node: (
            <Radio
              name="d"
              value="a"
              checked={choice === 'a'}
              onChange={setChoice}
            >
              Option A
            </Radio>
          ),
        },
        {
          label: 'selected=false',
          code: '<Radio name="freq" value="b" checked={v === \'b\'} onChange={setV}>Option B</Radio>',
          node: (
            <Radio
              name="d"
              value="b"
              checked={choice === 'b'}
              onChange={setChoice}
            >
              Option B
            </Radio>
          ),
        },
      ],
      situations: [],
    },
    {
      id: 'toggle',
      family: 'Formulaire',
      name: 'toggle',
      eyebrow: '2 états',
      description: 'Bascule aux proportions iOS, 54 × 23,6. Rôle switch natif.',
      preview: (
        <Toggle checked={on} onChange={setOn}>
          Alertes
        </Toggle>
      ),
      variants: [
        {
          label: 'State=On',
          code: '<Toggle checked={on} onChange={setOn}>Alertes</Toggle>',
          node: (
            <Toggle checked={on} onChange={setOn}>
              Activé
            </Toggle>
          ),
        },
        {
          label: 'State=Off',
          code: '<Toggle checked={false} onChange={setOn}>Alertes</Toggle>',
          node: (
            <Toggle checked={!on} onChange={(v) => setOn(!v)}>
              Désactivé
            </Toggle>
          ),
        },
      ],
      situations: [{ scenario: 'choice', label: 'Anciens e-mails' }],
    },
    {
      id: 'text_field',
      family: 'Formulaire',
      name: 'text_field',
      eyebrow: '3 états',
      description:
        'Champ sur color.surfaceSunken, rayon radius.field, invite dédiée.',
      preview: (
        <TextField
          label="Libellé"
          value={text}
          placeholder="Text..."
          onChange={setText}
        />
      ),
      variants: [
        {
          label: 'une ligne',
          wide: true,
          code: '<TextField label="Libellé" value={v} placeholder="Text..." onChange={setV} />',
          node: (
            <TextField
              label="Libellé"
              value={text}
              placeholder="Text..."
              onChange={setText}
            />
          ),
        },
        {
          label: 'multiligne',
          wide: true,
          code: '<TextField label="Libellé" value={v} multiline onChange={setV} />',
          node: (
            <TextField
              label="Libellé"
              value=""
              placeholder="Text..."
              multiline
              onChange={() => {}}
            />
          ),
        },
        {
          label: 'désactivé',
          wide: true,
          code: '<TextField label="Libellé" value="" disabled onChange={() => {}} />',
          node: (
            <TextField
              label="Libellé"
              value=""
              placeholder="Non disponible"
              disabled
              onChange={() => {}}
            />
          ),
        },
      ],
      situations: [],
    },
    {
      id: 'modal',
      family: 'Surfaces',
      name: 'modal',
      eyebrow: '4 \u00e9tats',
      description:
        'Bo\u00eete de dialogue 345 px, rembourrage et rayon \u00e0 24. Deux boutons, un, aucun, ou empil\u00e9s.',
      preview: (
        <div className="prev-scaled prev-scaled-sm">
          <Modal state="two" title="Here your title">
            The description of your pop-up should be written here.
          </Modal>
        </div>
      ),
      variants: [
        {
          label: 'state=2 buttons',
          wide: true,
          code: '<Modal state="two" title="Here your title">…</Modal>',
          node: <Modal state="two" />,
        },
        {
          label: 'state=1 button',
          wide: true,
          code: '<Modal state="one" title="Here your title">…</Modal>',
          node: <Modal state="one" />,
        },
        {
          label: 'state=0 button',
          wide: true,
          code: '<Modal state="none" onClose={close}>…</Modal>',
          node: <Modal state="none" />,
        },
        {
          label: 'state=2 buttons superimposed',
          wide: true,
          code: '<Modal state="stacked" title="Here your title">…</Modal>',
          node: <Modal state="stacked" />,
        },
      ],
      situations: [{ scenario: 'choice', label: 'Anciens e-mails' }],
    },
    {
      id: 'scan_free_limit',
      family: 'Surfaces',
      name: 'scan_free_limit',
      eyebrow: '5 variantes',
      description:
        "État d'avancement du scan, 353 px. Carte cliquable c\u00f4t\u00e9 premium, ligne centr\u00e9e c\u00f4t\u00e9 freemium.",
      preview: (
        <div className="prev-stack prev-scaled">
          <ScanLimit plan="premium" state="scanning" />
          <ScanLimit plan="premium" state="limit" />
          <ScanLimit state="completed" />
        </div>
      ),
      variants: [
        {
          label: 'premium · scanning',
          wide: true,
          code: '<ScanLimit plan="premium" state="scanning" onOpen={open} />',
          node: <ScanLimit plan="premium" state="scanning" />,
        },
        {
          label: 'premium · scan limit reached',
          wide: true,
          code: '<ScanLimit plan="premium" state="limit" onOpen={goPro} />',
          node: <ScanLimit plan="premium" state="limit" />,
        },
        {
          label: 'premium · completed',
          wide: true,
          code: '<ScanLimit plan="premium" state="completed" />',
          node: <ScanLimit plan="premium" state="completed" />,
        },
        {
          label: 'freemium · scanning',
          wide: true,
          code: '<ScanLimit plan="freemium" state="scanning" />',
          node: <ScanLimit plan="freemium" state="scanning" />,
        },
        {
          label: 'freemium · completed',
          wide: true,
          code: '<ScanLimit plan="freemium" state="completed" />',
          node: <ScanLimit plan="freemium" state="completed" />,
        },
      ],
      situations: [{ scenario: 'home', label: 'Accueil' }],
    },
    {
      id: 'filters',
      family: 'Actions',
      name: 'filters',
      eyebrow: '2 états',
      description:
        'Puce de filtre à rayon plein, texte 14 et chevron 20. Inactive sur gris, active sur bleu clair.',
      preview: (
        <div className="prev-row">
          <Filter>text</Filter>
          <Filter active>text</Filter>
        </div>
      ),
      variants: [
        {
          label: 'state=false',
          code: '<Filter onClick={openMenu}>text</Filter>',
          node: <Filter>text</Filter>,
        },
        {
          label: 'state=true',
          code: '<Filter active onClick={openMenu}>text</Filter>',
          node: <Filter active>text</Filter>,
        },
      ],
      situations: [{ scenario: 'sender', label: 'Expéditeurs' }],
    },
    {
      id: 'search-bar',
      family: 'Formulaire',
      name: 'search-bar',
      eyebrow: '2 états',
      description:
        'Champ de recherche 353 × 41. Bordure bleue au focus, croix dès qu’il y a du texte.',
      preview: (
        <div className="prev-stack prev-scaled">
          <SearchBar value="" onChange={() => {}} />
          <SearchBar value="Dav" onChange={() => {}} />
        </div>
      ),
      variants: [
        {
          label: 'state=default',
          wide: true,
          code: '<SearchBar value={q} onChange={setQ} />',
          node: <SearchBar value={search} onChange={setSearch} />,
        },
        {
          label: 'state=focus',
          wide: true,
          code: '<SearchBar value={q} onChange={setQ} placeholder="Search sender" />',
          node: <SearchBar value={searchTyped} onChange={setSearchTyped} />,
        },
      ],
      situations: [{ scenario: 'sender', label: 'Expéditeurs' }],
    },
  ];
}

// Extrait complet d'un composant : l'import, puis chaque variante annotée.
// Les noms sont ceux réellement exportés par app/client/Atoms.tsx.
const exported: Record<string, string> = {
  button: 'Button',
  tag: 'Tag',
  checkbox: 'Checkbox',
  radio: 'Radio',
  toggle: 'Toggle',
  text_field: 'TextField',
  modal: 'Modal',
  filters: 'Filter',
  'search-bar': 'SearchBar',
  scan_free_limit: 'ScanLimit',
};
function snippet(entry: Entry) {
  const lines = entry.variants
    .filter((v) => v.code)
    .map((v) => `// ${v.label}\n${v.code}`);
  return (
    `import { ${exported[entry.id] ?? entry.name} } from './Atoms';\n\n` +
    lines.join('\n\n') +
    '\n'
  );
}

function Situations({ entry }: { entry: Entry }) {
  const shots = entry.situations
    .map((s) => mockups[s.scenario])
    .filter(Boolean);
  const [current, setCurrent] = useState(shots[0]?.id);
  const shown = shots.find((m) => m.id === current) ?? shots[0];
  // Aucune maquette ne montre encore ce composant : on le dit, plutôt que
  // d'afficher un écran où il n'apparaît pas.
  if (!shown)
    return (
      <section className="cat-situation">
        <div className="cat-situation-bar">
          <h4>En situation</h4>
        </div>
        <p className="cat-situation-note">
          Aucune des maquettes importées ne montre ce composant pour l’instant.
        </p>
      </section>
    );
  return (
    <section className="cat-situation">
      <div className="cat-situation-bar">
        <h4>En situation</h4>
        {shots.length > 1 && (
          <div className="dm-tabs cat-situation-tabs">
            {shots.map((m) => (
              <button
                key={m.id}
                type="button"
                className={shown.id === m.id ? 'is-on' : undefined}
                aria-pressed={shown.id === m.id}
                onClick={() => setCurrent(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="cat-situation-stage">
        <MockupFrame mockup={shown} />
      </div>
      <p className="cat-situation-note">
        Maquette exportée de Figma. C’est une image : elle ne suit pas vos
        tokens, contrairement aux variantes ci-dessus.
      </p>
    </section>
  );
}

export default function CanvasBoard({
  tokens,
  picker,
  tokensView,
  actions,
  drafts,
  onOpenChange,
}: {
  tokens: Tokens;
  picker?: ReactNode;
  tokensView?: ReactNode;
  actions?: ReactNode;
  // Demandes d'ajout en attente. Elles viennent de la page, qui les tient :
  // le catalogue les affiche, il ne les garde pas.
  drafts?: Draft[];
  // Prévient la page qu'une fiche est ouverte : c'est elle qui décide quoi
  // faire de son décor, le catalogue ne connaît pas ce qui l'entoure.
  onOpenChange?: (id?: string) => void;
}) {
  const [open, setOpen] = useState<string>();
  const [tab, setTab] = useState<'components' | 'tokens'>('components');
  // Remonter en haut AVANT d'échanger le contenu, et d'un seul coup.
  //
  // Une remontée animée se faisait prendre de vitesse : le contenu était
  // remplacé pendant le trajet, le document rétrécissait, et le navigateur
  // rabattait la position au nouveau bas de page — on atterrissait donc en
  // bas, puis on remontait lentement. En remontant d'abord, dans le même
  // gestionnaire d'événement, le navigateur ne peint qu'une fois : en haut,
  // avec le nouveau contenu. La douceur est portée par l'animation d'arrivée
  // du bloc, qui elle ne dépend pas de la hauteur du document.
  const toTop = () => scrollTo({ top: 0, behavior: 'auto' });
  const show = (id?: string) => {
    toTop();
    setOpen(id);
    onOpenChange?.(id);
  };
  const goToTab = (next: 'components' | 'tokens') => {
    toTop();
    setTab(next);
  };
  const catalogue = useCatalogue();
  const entries = drafts?.length
    ? [...catalogue, ...drafts.map(draftEntry)]
    : catalogue;
  const current = entries.find((e) => e.id === open);
  const view = tab === 'tokens' ? 'tokens' : (current?.id ?? 'index');
  const style = tokenCss(tokens) as CSSProperties;
  const total = entries.reduce((n, e) => n + e.variants.length, 0);
  return (
    <div
      className={`cat${current ? ' is-flush' : ''}`}
      id="cat-title"
      tabIndex={-1}
    >
      <div className="cat-crumb-row">
        <nav className="cat-crumbs" aria-label="Fil d’Ariane">
          <button type="button" onClick={() => show(undefined)}>
            Design System
          </button>
          <span className="cat-sep" aria-hidden="true">
            ›
          </span>
          {current ? (
            <>
              <button type="button" onClick={() => show(undefined)}>
                Composants
              </button>
              <span className="cat-sep" aria-hidden="true">
                ›
              </span>
              <span className="cat-family-crumb">{current.family}</span>
              <span className="cat-sep" aria-hidden="true">
                ›
              </span>
              <span className="cat-current" aria-current="page">
                {current.name}
              </span>
            </>
          ) : (
            <span className="cat-current" aria-current="page">
              Composants
            </span>
          )}
        </nav>
        {actions && <div className="cat-head-right">{actions}</div>}
      </div>

      {/* Le design system actif se choisit au-dessus des onglets : il
          détermine le contenu des deux, il n'appartient à aucun. */}
      {picker && <div className="cat-picker">{picker}</div>}

      {tokensView && (
        <div className="cat-tabs-row">
          <div className="dm-tabs" role="tablist" aria-label="Vue du catalogue">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'components'}
              className={tab === 'components' ? 'is-on' : undefined}
              onClick={() => goToTab('components')}
            >
              Composants
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'tokens'}
              className={tab === 'tokens' ? 'is-on' : undefined}
              onClick={() => goToTab('tokens')}
            >
              Tokens
            </button>
          </div>
        </div>
      )}

      <div className="cat-layout">
        {/* Sommaire permanent. Sans lui, choisir un composant demandait de
            dérouler tout le catalogue, puis de le dérouler à nouveau pour
            passer au suivant. Il reste visible dans les deux onglets : depuis
            les tokens, cliquer un composant bascule d'onglet et l'ouvre. */}
        {/* Le sommaire suit l'onglet : les composants d'un côté, les familles
            de tokens de l'autre. Un sommaire qui reste sur les composants
            pendant qu'on lit les tokens ne sert plus à rien. */}
        {tokensView && tab === 'tokens' ? (
          <aside className="cat-nav" aria-label="Familles de tokens">
            {tokenSections.map((s) => (
              <button
                key={s.title}
                type="button"
                className="cat-nav-all"
                onClick={() => {
                  const target = document.getElementById(sectionId(s.title));
                  if (!target) return;
                  // 100 px : la hauteur de l'en-tête collante, plus l'air qui
                  // évite que le titre touche son bord.
                  scrollTo({
                    top: target.getBoundingClientRect().top + scrollY - 100,
                    behavior: matchMedia('(prefers-reduced-motion: reduce)')
                      .matches
                      ? 'auto'
                      : 'smooth',
                  });
                }}
              >
                {s.title}
                <span>{s.count}</span>
              </button>
            ))}
          </aside>
        ) : (
        <aside className="cat-nav" aria-label="Composants">
          <button
            type="button"
            className={`cat-nav-all${!current && tab === 'components' ? ' is-on' : ''}`}
            aria-current={!current && tab === 'components' ? 'true' : undefined}
            onClick={() => {
              setTab('components');
              show(undefined);
            }}
          >
            Tous les composants
            <span>{entries.length}</span>
          </button>
          {families
            .map((family) => ({
              family,
              items: entries.filter((e) => e.family === family),
            }))
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <div key={g.family} className="cat-nav-group">
                <h4>
                  <FamilyIcon family={g.family} />
                  {g.family}
                </h4>
                <ul>
                  {g.items.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        className={
                          current?.id === e.id && tab === 'components'
                            ? 'is-on'
                            : undefined
                        }
                        aria-current={
                          current?.id === e.id && tab === 'components'
                            ? 'page'
                            : undefined
                        }
                        onClick={() => {
                          setTab('components');
                          show(e.id);
                        }}
                      >
                        {e.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </aside>
        )}
        {/* La clé change à chaque vue : React remonte le bloc, ce qui rejoue
            son animation d'arrivée. Sans cela le contenu se substituait d'un
            coup, pendant que la page remontait en douceur — deux rythmes pour
            un seul geste. */}
        <div className="cat-main" key={view}>
      {tokensView && tab === 'tokens' ? (
        <>
          <header className="cat-head">
            <span className="cat-eyebrow">Tokens</span>
            <h3>Les tokens de votre design system.</h3>
            <p>
              {tokenKeys.length} tokens enregistrés sur disque, en quatre
              familles. Ce sont les valeurs du design system choisi ci-dessus :
              pour en changer, basculez de design system ou importez un JSON.
            </p>
          </header>
          {tokensView}
        </>
      ) : current ? (
        <>
          <div className="cat-backrow">
            <button
              type="button"
              className="cat-back-btn"
              onClick={() => show(undefined)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M15 5 8 12l7 7" />
              </svg>
              Retour
            </button>
          </div>
          <header className="cat-head">
            <span className="cat-eyebrow">{current.eyebrow}</span>
            <h3>{current.name}</h3>
            <p>{current.description}</p>
            <div className="cat-head-actions">
              <CopyButton code={snippet(current)} />
            </div>
          </header>
          <div className="cat-variants" style={style}>
            {current.variants.map((v) => (
              <figure
                key={v.label}
                className={`cat-spec${v.wide ? ' is-wide' : ''}`}
              >
                <div className="cat-stage cat-grey">{v.node}</div>
                <figcaption>
                  <span>{v.label}</span>
                  {v.code && <CopyButton code={v.code} label="Copier" small />}
                </figcaption>
              </figure>
            ))}
          </div>
          <Situations key={current.id} entry={current} />
          <button
            type="button"
            className="cat-back"
            onClick={() => show(undefined)}
          >
            ← Tous les composants
          </button>
        </>
      ) : (
        <>
          <header className="cat-head">
            <span className="cat-eyebrow">Catalogue</span>
            <h3>Les composants de votre design system.</h3>
            <p>
              {entries.length} composants et {total} variantes, rangés en{' '}
              {families.length} familles. Chaque aperçu est rendu avec vos
              tokens enregistrés.
            </p>
          </header>
          {families
            .map((family) => ({
              family,
              items: entries.filter((e) => e.family === family),
            }))
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <section key={g.family} className="cat-family">
                <h4>
                  <FamilyIcon family={g.family} />
                  {g.family}
                  <span>{g.items.length}</span>
                </h4>
                <div className="cat-grid" style={style}>
                  {g.items.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="cat-card"
                      onClick={() => show(e.id)}
                    >
                      <span className="cat-stage cat-grey">
                        {e.preview}
                      </span>
                      <span className="cat-copy">
                        <span className="cat-eyebrow">{e.eyebrow}</span>
                        <strong>{e.name}</strong>
                        <span className="cat-desc">{e.description}</span>
                        <em>
                          Ouvrir
                          <svg
                            className="cat-arrow"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M7 17 17 7" />
                            <path d="M7 7h10v10" />
                          </svg>
                        </em>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
