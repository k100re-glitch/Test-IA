import { useState, type CSSProperties, type ReactNode } from 'react';
import { tokenCss, tokenKeys, type Tokens } from '../shared/model.js';
import CopyButton from './CopyButton.js';
import MockupFrame, { mockups } from './Mockups.js';
import {
  Button,
  Checkbox,
  Modal,
  Radio,
  Tag,
  TextField,
  Toggle,
} from './Atoms.js';

// Catalogue de composants : une liste de cartes, chacune avec un aperçu posé
// sur une surface neutre, puis une vue de détail qui déplie toutes les
// variantes. La structure reprend celle d'une page d'index d'outils :
// fil d'Ariane, titre, grille de cartes, chaque carte menant à sa page.

interface Variant {
  label: string;
  node: ReactNode;
  wide?: boolean;
  // Le JSX réellement équivalent à l'aperçu affiché, prêt à coller.
  code?: string;
}
// Écrans où le composant apparaît réellement. L'aperçu les charge dans
// l'iframe du scénario, à largeur de téléphone : on voit la pièce en service,
// pas isolée sur sa scène.
interface Situation {
  scenario: string;
  label: string;
}
// Familles de composants. L'ordre ci-dessous est celui de l'affichage.
const families = ['Actions', 'Formulaire', 'Surfaces'] as const;
type Family = (typeof families)[number];

interface Entry {
  id: string;
  family: Family;
  name: string;
  eyebrow: string;
  description: string;
  preview: ReactNode;
  variants: Variant[];
  situations: Situation[];
}

function useCatalogue(): Entry[] {
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState('a');
  const [on, setOn] = useState(true);
  const [text, setText] = useState('');
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
        <div className="prev-stack">
          <Button block>Text</Button>
          <Button tone="secondary" size="h2" block>
            Text
          </Button>
          <Button tone="danger" size="sm" block>
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
        <div className="prev-scaled">
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
}: {
  tokens: Tokens;
  picker?: ReactNode;
  tokensView?: ReactNode;
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState<string>();
  const [tab, setTab] = useState<'components' | 'tokens'>('components');
  const entries = useCatalogue();
  const current = entries.find((e) => e.id === open);
  const style = tokenCss(tokens) as CSSProperties;
  const total = entries.reduce((n, e) => n + e.variants.length, 0);
  return (
    <div className="cat" id="cat-title" tabIndex={-1}>
      <div className="cat-crumb-row">
        <nav className="cat-crumbs" aria-label="Fil d’Ariane">
          <button type="button" onClick={() => setOpen(undefined)}>
            Design System
          </button>
          <span className="cat-sep" aria-hidden="true">
            /
          </span>
          {current ? (
            <>
              <button type="button" onClick={() => setOpen(undefined)}>
                Composants
              </button>
              <span className="cat-sep" aria-hidden="true">
                /
              </span>
              <span className="cat-family-crumb">{current.family}</span>
              <span className="cat-sep" aria-hidden="true">
                /
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
              onClick={() => setTab('components')}
            >
              Composants
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'tokens'}
              className={tab === 'tokens' ? 'is-on' : undefined}
              onClick={() => setTab('tokens')}
            >
              Tokens
            </button>
          </div>
        </div>
      )}

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
              onClick={() => setOpen(undefined)}
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
            onClick={() => setOpen(undefined)}
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
                  {g.family}
                  <span>{g.items.length}</span>
                </h4>
                <div className="cat-grid" style={style}>
                  {g.items.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="cat-card"
                      onClick={() => setOpen(e.id)}
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
  );
}
