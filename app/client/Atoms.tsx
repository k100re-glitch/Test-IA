import type { ReactNode } from 'react';
import bellMark from './brand/modal-bell.svg';
import checkCircle from './icons/check-circle.svg';
import loadingLarge from './icons/loading.svg';
import loadingSmall from './icons/loading-sm.svg';
import warningTriangle from './icons/exclamation-triangle.svg';
import chevronDown from './icons/chevron-down.svg';
import chevronDownBrand from './icons/chevron-down-brand.svg';

// Atomes portés depuis la page components_list d'Inbox Zapper.
// Les valeurs viennent des tokens : aucune couleur ni dimension en dur ici.
//
// Deux tailles, nommées comme dans Figma :
//   H1 — texte font.control, icône 24 px, rembourrage généreux
//   H2 — texte font.body, icône 20 px
//
// Le bouton « secondaire désactivé » de Figma affiche du texte blanc sur
// action/keep-surface, soit un contraste d'environ 1,1:1. Ce n'est pas
// reproduit tel quel : l'état désactivé utilise ici color.placeholder, qui
// reste lisible. L'écart est consigné dans workspace/DECISIONS.md.

export type ButtonTone = 'primary' | 'secondary' | 'danger' | 'dangerSoft' | 'grey';
// h1 et h2 sont les deux tailles du composant `button`. `sm` correspond au
// groupe `buttons--secondary` de Figma (hauteur 35), utilisé dans les cartes.
export type ButtonSize = 'h1' | 'h2' | 'sm';

// Dans Figma chaque bouton porte une icône (academic-cap) et occupe toute la
// largeur. L'icône est redessinée ici plutôt qu'importée : les URL d'export
// Figma expirent, et une icône en SVG local suit la couleur du token.
function DefaultIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 1 8.5l11 5.5 9-4.5v6h2v-7L12 3Zm-7 9.1v3.4c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5v-3.4l-7 3.5-7-3.5Z" />
    </svg>
  );
}

export function Button({
  tone = 'primary',
  size = 'h1',
  disabled = false,
  icon,
  showIcon = true,
  block = false,
  children,
  onClick,
  type = 'button',
}: {
  tone?: ButtonTone;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: ReactNode;
  showIcon?: boolean;
  block?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const mark = icon ?? (showIcon ? <DefaultIcon /> : null);
  return (
    <button
      type={type}
      className={`ds-btn ds-btn-${tone} ds-btn-${size}${block ? ' ds-btn-block' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {mark && (
        <span className="ds-btn-icon" aria-hidden="true">
          {mark}
        </span>
      )}
      {children}
    </button>
  );
}

export function Tag({
  tone = 'primary',
  children,
}: {
  tone?: 'primary' | 'secondary';
  children: ReactNode;
}) {
  return <span className={`ds-tag ds-tag-${tone}`}>{children}</span>;
}

// Les trois contrôles suivants restent des éléments de formulaire natifs :
// le focus clavier, le rôle et l'annonce au lecteur d'écran viennent du
// navigateur. Seule l'apparence est reprise du DS.

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="ds-choice">
      <input
        type="checkbox"
        className="ds-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

export function Radio({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="ds-choice">
      <input
        type="radio"
        className="ds-radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span>{children}</span>
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="ds-choice ds-toggle-row">
      <input
        type="checkbox"
        role="switch"
        className="ds-toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const shared = {
    className: 'ds-input',
    value,
    placeholder,
    disabled,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };
  return (
    <label className="ds-field">
      <span className="ds-field-label">{label}</span>
      {multiline ? <textarea rows={4} {...shared} /> : <input {...shared} />}
    </label>
  );
}

// modal — porté depuis Figma (node 6819:117044), quatre états.
// Largeur 345, rembourrage et rayon à 24, titre 24/600 interligne 1,2,
// description 16/400. Le rayon vaut le pas d'espacement xlarge : Figma
// utilise la même variable, on fait de même plutôt que d'inventer un token.
export type ModalState = 'two' | 'one' | 'none' | 'stacked';

// L'illustration est un emplacement : les écrans y passent la leur. Par
// défaut c'est le dessin du slot de Figma, en SVG : il reste net à toute
// taille, contrairement à l'export matriciel qui plafonne à 72 px.
function ModalMark() {
  return <img src={bellMark} alt="" aria-hidden="true" draggable={false} />;
}

export function Modal({
  state = 'two',
  title = 'Here your title',
  children = 'The description of your pop-up should be written here, like this, here you go.',
  mark,
  showMark = true,
  primaryLabel = 'Text',
  secondaryLabel = 'Text',
  onPrimary,
  onSecondary,
  onClose,
}: {
  state?: ModalState;
  title?: string;
  children?: ReactNode;
  mark?: ReactNode;
  showMark?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose?: () => void;
}) {
  const primary = (
    <Button size="h2" showIcon={false} block onClick={onPrimary}>
      {primaryLabel}
    </Button>
  );
  const secondary = (
    <Button
      size="h2"
      tone="grey"
      showIcon={false}
      block
      onClick={onSecondary}
    >
      {secondaryLabel}
    </Button>
  );
  return (
    <div className="ds-modal">
      <div className="ds-modal-body">
        {showMark && (
          <span className="ds-modal-mark" aria-hidden="true">
            {mark ?? <ModalMark />}
          </span>
        )}
        <div className="ds-modal-text">
          <p className="ds-modal-title">{title}</p>
          <p className="ds-modal-desc">{children}</p>
        </div>
        {state === 'none' && (
          <button type="button" className="ds-modal-close" onClick={onClose}>
            <span className="ds-visually-hidden">Fermer</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      {state === 'two' && (
        <div className="ds-modal-actions">
          {secondary}
          {primary}
        </div>
      )}
      {state === 'one' && <div className="ds-modal-actions">{primary}</div>}
      {state === 'stacked' && (
        <div className="ds-modal-actions is-stacked">
          {primary}
          {secondary}
        </div>
      )}
    </div>
  );
}

// scan_free_limit — porté depuis Figma (node 8047:17777), deux jeux de
// variantes. Largeur 353, rayon 12.
//
//   premium  — une carte cliquable : pastille d'icône 40, titre 16/500,
//              sous-titre 14/400, chevron. États scanning et limit.
//   freemium — une seule ligne centrée, icône 16 et texte 14/500.
//
// L'état « completed » est identique dans les deux jeux (mêmes fonds,
// rembourrages et gouttière) : il n'est donc écrit qu'une fois.
//
// Les quatre icônes viennent de l'export Figma. Leur couleur y est cuite
// dans le fichier : changer color.success ou color.warning dans l'atelier
// ne les suivra pas. Les redessiner les ferait suivre les tokens au prix de
// la fidélité du tracé ; l'écart est consigné dans workspace/DECISIONS.md.
export type ScanPlan = 'premium' | 'freemium';
export type ScanState = 'scanning' | 'limit' | 'completed';

// Chevron : dans Figma c'est un SF Symbol, pas un calque exportable. Il suit
// la couleur du titre, comme à l'écran.
function Chevron() {
  return (
    <svg viewBox="0 0 25 25" aria-hidden="true" focusable="false">
      <path d="M9.5 5.5 17 12.5 9.5 19.5" />
    </svg>
  );
}

export function ScanLimit({
  plan = 'premium',
  state = 'scanning',
  onOpen,
}: {
  plan?: ScanPlan;
  state?: ScanState;
  onOpen?: () => void;
}) {
  if (state === 'completed')
    return (
      <p className="ds-scan ds-scan-flat ds-scan-completed" role="status">
        <img src={checkCircle} alt="" aria-hidden="true" />
        Inbox Scan Completed
      </p>
    );
  if (plan === 'freemium')
    return (
      <p className="ds-scan ds-scan-flat ds-scan-waiting" role="status">
        <img src={loadingSmall} alt="" aria-hidden="true" />
        Scanning your inbox...
      </p>
    );
  const limit = state === 'limit';
  // La rangée entière est l'élément cliquable : le chevron n'est qu'un
  // repère visuel, il ne porte pas l'action à lui seul.
  return (
    <button
      type="button"
      className={`ds-scan ds-scan-card ds-scan-${limit ? 'limit' : 'scanning'}`}
      onClick={onOpen}
    >
      <span className="ds-scan-tile">
        <img
          src={limit ? warningTriangle : loadingLarge}
          alt=""
          aria-hidden="true"
        />
      </span>
      <span className="ds-scan-text">
        <span className="ds-scan-title">
          {limit ? 'Scan limit reached' : 'Scanning your inbox...'}
        </span>
        {/* Les deux libellés sont repris tels quels du DS, coquille
            « scaninng » comprise : l'atelier reflète Figma, il ne le
            corrige pas en douce. */}
        <span className="ds-scan-sub">
          {limit
            ? 'Go Pro to resume scaninng.'
            : 'Up to 10.000 mails with Free plan'}
        </span>
      </span>
      <span className="ds-scan-go" aria-hidden="true">
        <Chevron />
      </span>
    </button>
  );
}

// filters — porté depuis Figma (node 5548:65591), deux états.
// Puce de filtre : texte 14/500 et chevron 20, rembourrage 8/12, rayon plein.
// Figma pose un rayon de 48 : au-delà de la moitié de la hauteur, toute
// valeur donne le même stade, radius.pill est donc utilisé tel quel.
//
// Les deux chevrons sont deux exports distincts, leur couleur est cuite dans
// le fichier comme celles de scan_free_limit.
export function Filter({
  active = false,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`ds-filter${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
      <img
        src={active ? chevronDownBrand : chevronDown}
        alt=""
        aria-hidden="true"
      />
    </button>
  );
}
