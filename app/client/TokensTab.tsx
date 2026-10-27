import {
  contrast,
  tokenKeys,
  type TokenKey,
  type Tokens,
} from '../shared/model.js';
import primitive from './data/primitive.json';
import semantic from './data/semantic.json';

// Onglet Tokens : lecture seule. Les valeurs viennent du design system choisi
// au-dessus ; on ne les retouche pas une par une ici. Pour en changer, on
// bascule de design system ou on importe un JSON — les deux passent par un
// diff validé.

// Les couleurs ne figurent pas ici : « Semantic Colors » ci-dessus les montre
// déjà, avec leurs deux modes. On ne garde que ce qu'elle ne couvre pas.
const groups: { title: string; keys: TokenKey[] }[] = [
  { title: 'Typography', keys: tokenKeys.filter((k) => k.startsWith('font.')) },
  { title: 'Spacing', keys: tokenKeys.filter((k) => k.startsWith('space.')) },
  { title: 'Shapes', keys: tokenKeys.filter((k) => k.startsWith('radius.')) },
];



// Les deux planches du fichier Figma, reprises telles quelles.
//
// « Primitive Colors » : Name / Value / Example, une famille par bloc. Les
// familles sont repliées par défaut — 112 lignes d'affilée ne se lisent pas —
// et la bande de couleurs dans l'en-tête donne un aperçu sans déplier.
// « Semantic Colors » : Name / Light / Dark, un groupe de rôles par bloc,
// repliable lui aussi — 50 lignes d'affilée se lisent mal.
// Ce sont les valeurs sources ; elles ne suivent pas l'état de l'atelier.

function Dot({ hex }: { hex: string }) {
  return <span className="ctab-dot" style={{ background: hex }} aria-hidden="true" />;
}

function PrimitiveTable() {
  return (
    <div className="ctab">
      <div className="ctab-head ctab-row-3">
        <span>Name</span>
        <span>Value</span>
        <span>Example</span>
      </div>
      {(primitive as { title: string; rows: string[][] }[]).map((group) => (
        <details key={group.title} className="ctab-group">
          <summary>
            <span className="ctab-section">{group.title}</span>
            <span className="ctab-count">{group.rows.length}</span>
            <span className="ctab-preview" aria-hidden="true">
              {group.rows.map(([name, hex]) => (
                <span key={name} style={{ background: hex }} />
              ))}
            </span>
          </summary>
          {group.rows.map(([name, hex]) => (
            <div key={name} className="ctab-row ctab-row-3">
              <span className="ctab-name">{name}</span>
              <span className="ctab-value">{hex}</span>
              <span>
                <Dot hex={hex} />
              </span>
            </div>
          ))}
        </details>
      ))}
    </div>
  );
}

function SemanticTable() {
  return (
    <div className="ctab">
      <div className="ctab-head ctab-row-s">
        <span>Name</span>
        <span>Light</span>
        <span>Dark</span>
      </div>
      {(semantic as { title: string; rows: string[][] }[]).map((group) => (
        <details key={group.title} className="ctab-group">
          <summary>
            <span className="ctab-section">{group.title}</span>
            <span className="ctab-count">{group.rows.length}</span>
            <span className="ctab-preview" aria-hidden="true">
              {group.rows.map(([name, , , lightHex]) => (
                <span key={name} style={{ background: lightHex }} />
              ))}
            </span>
          </summary>
          {group.rows.map(([name, light, dark, lightHex, darkHex]) => (
            <div key={name} className="ctab-row ctab-row-s">
              <span className="ctab-name">{name}</span>
              <span className="ctab-pair">
                <Dot hex={lightHex} />
                <span className="ctab-value">{light}</span>
              </span>
              <span className="ctab-pair">
                <Dot hex={darkHex} />
                <span className="ctab-value">{dark}</span>
              </span>
            </div>
          ))}
        </details>
      ))}
    </div>
  );
}

function shortName(key: TokenKey) {
  return key.slice(key.indexOf('.') + 1);
}

// Les tokens non colorés se lisent mal en chiffres seuls : un espacement est
// montré à sa largeur réelle, un rayon par l'angle qu'il dessine, une taille
// de texte par un échantillon à sa taille.
function Figure({ token, value }: { token: TokenKey; value: string | number }) {
  if (token.startsWith('space.'))
    return (
      <span className="dm-fig dm-fig-space" aria-hidden="true">
        <span style={{ width: `${value}px` }} />
      </span>
    );
  if (token.startsWith('radius.'))
    return (
      <span
        className="dm-fig dm-fig-radius"
        aria-hidden="true"
        style={{ borderTopLeftRadius: `${Math.min(Number(value), 28)}px` }}
      />
    );
  if (token === 'font.family')
    return (
      <span className="dm-fig-font" style={{ fontFamily: String(value) }}>
        Ag
      </span>
    );
  return (
    <span
      className="dm-fig-font"
      style={{ fontSize: `${Math.min(Number(value), 28)}px` }}
    >
      Ag
    </span>
  );
}

export default function TokensTab({ tokens }: { tokens: Tokens }) {
  const brandContrast = contrast(
    tokens['color.brand'].$value,
    tokens['color.onBrand'].$value,
  );
  return (
    <div className="dm">
      <p className="dm-note" aria-live="polite">
        Marque / texte sur marque : <strong>{brandContrast.toFixed(2)}:1</strong>{' '}
        ·{' '}
        {brandContrast >= 4.5 ? 'AA texte courant' : 'contraste à améliorer'}.
        Cette indication ne certifie pas tous les états.
      </p>
      <section className="dm-group">
        <h3>Primitive Colors</h3>
        <p className="dm-lead">
          Les 112 couleurs sources, par famille. Ce sont les valeurs brutes du
          fichier Figma ; la couche sémantique ci-dessous y puise.
        </p>
        <PrimitiveTable />
      </section>
      <section className="dm-group">
        <h3>Semantic Colors</h3>
        <p className="dm-lead">
          Les 50 rôles du design system, avec leur valeur en mode clair et en
          mode sombre. L’atelier n’expose que le mode clair.
        </p>
        <SemanticTable />
      </section>
      {groups.map((group) => (
        <section key={group.title} className="dm-group">
          <h3>{group.title}</h3>
          <div className="dm-swatches">
            {group.keys.map((k) => {
              const t = tokens[k];
              return (
                <figure key={k} className="dm-swatch">
                  <span className="dm-swatch-color">
                    <Figure token={k} value={t.$value} />
                  </span>
                  <figcaption>
                    <strong>{shortName(k)}</strong>
                    <small>
                      {t.$type === 'dimension'
                        ? `${t.$value}px`
                        : String(t.$value)}
                    </small>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
