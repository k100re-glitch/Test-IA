import { useEffect, useRef, useState } from 'react';
import { Scenario } from './DesignSystem.js';
import CanvasBoard, { useCatalogue } from './CanvasBoard.js';
import glyph from './brand/glyph.png';
import headerMotion from './brand/header-motion.mp4';
import Banner from './Banner.js';
import TokensTab from './TokensTab.js';
import { fallbackName, parseFigmaLink } from './figmaLink.js';
import {
  FAMILIES,
  STEPS,
  loadDrafts,
  saveDrafts,
  type Draft,
  type Family,
} from './drafts.js';
import {
  bootstrap,
  commit,
  generateDoc,
  getState,
  gitCommit,
  request,
  type Bootstrap,
} from './api.js';
import {
  contrast,
  tokenKeys,
  type Proposal,
  type State,
  type TokenKey,
} from '../shared/model.js';

function useDesignState() {
  const [state, setState] = useState<State>();
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || !live) return;
      inFlight = true;
      try {
        const s = await getState();
        if (live) {
          setState((current) =>
            !current || s.revision >= current.revision ? s : current,
          );
          setError('');
        }
      } catch (e) {
        if (live) setError((e as Error).message);
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 1200);
    const channel = new BroadcastChannel('ds-studio');
    channel.onmessage = refresh;
    return () => {
      live = false;
      clearInterval(timer);
      channel.close();
    };
  }, []);
  return { state, setState, error };
}
function announceChange() {
  const c = new BroadcastChannel('ds-studio');
  c.postMessage('updated');
  c.close();
}
export function Preview() {
  const { state, error } = useDesignState();
  const scenario =
    new URLSearchParams(location.search).get('scenario') ?? 'cards';
  return state ? (
    <Scenario tokens={state.tokens} scenario={scenario} />
  ) : (
    <p role="alert">{error || 'Chargement du scénario…'}</p>
  );
}
export default function App() {
  const { state, setState, error: stateError } = useDesignState();
  // L'appel de démarrage est conservé pour lui-même : c'est lui qui pose le
  // jeton de session utilisé par toutes les écritures. Sa réponse n'est plus
  // affichée depuis que l'état Figma a quitté l'en-tête.
  const [, setBoot] = useState<Bootstrap>();
  const [proposal, setProposal] = useState<Proposal>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  // La génération relance un processus Node : elle prend une seconde ou deux.
  // Sans état d'attente, le bouton paraît mort et on le clique deux fois.
  const [writingDoc, setWritingDoc] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  // Le compte rendu de la dernière génération, gardé dans la fiche plutôt que
  // dans le message flottant : on vient d'y lire ce qui allait être écrit,
  // c'est là qu'on attend la réponse.
  const [docDone, setDocDone] = useState('');
  const [docError, setDocError] = useState('');
  // Demandes d'ajout venues d'un lien Figma. La page les tient, le catalogue
  // les affiche. Voir app/client/drafts.ts : l'enchaînement est une mise en
  // scène, rien n'est lu dans Figma et aucun composant n'est écrit.
  const [drafts, setDrafts] = useState<Draft[]>(loadDrafts);
  const [addOpen, setAddOpen] = useState(false);
  const [link, setLink] = useState('');
  const [draftName, setDraftName] = useState('');
  const [family, setFamily] = useState<Family>('Actions');
  const [step, setStep] = useState(-1);
  const [addError, setAddError] = useState('');
  const [added, setAdded] = useState('');
  // Les nombres annoncés par la fiche sont comptés sur le catalogue réel,
  // celui que l'atelier affiche. Une phrase écrite en dur vieillirait au
  // premier composant ajouté.
  const catalogue = useCatalogue();
  const catalogueVariants = catalogue.reduce(
    (n, entry) => n + entry.variants.length,
    0,
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  // La bannière est un décor d'accueil. Sur la fiche d'un composant elle
  // n'apporte rien et repousse le contenu sous la ligne de flottaison.
  const [componentOpen, setComponentOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const historyPopup = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const historyButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    bootstrap()
      .then(setBoot)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (proposal) {
      dialog.current?.showModal();
      cancelButton.current?.focus();
    } else dialog.current?.close();
  }, [proposal]);
  // Un message posé dans le flux partait en défilant ; flottant, il resterait
  // là indéfiniment. Les confirmations s'effacent donc d'elles-mêmes au bout
  // de cinq secondes. Les erreurs, non : elles disent qu'une action n'a pas
  // eu lieu, et c'est à la suivante de les remplacer.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  // L'historique s'ouvre en popup accrochée à son bouton. L'API popover fait
  // le reste : calque supérieur, fermeture par Échap et au clic en dehors,
  // sans fond assombri — c'est une pastille d'information, pas une décision à
  // prendre, et rien ne justifie de bloquer la page derrière.
  useEffect(() => {
    const node = historyPopup.current;
    if (!node) return;
    const shown = node.matches(':popover-open');
    if (historyOpen && !shown) {
      // La popup se place sous son bouton, lu juste avant l'ouverture : il a
      // changé de rangée une fois, et une position écrite en dur dans la
      // feuille de style redeviendrait fausse à la prochaine.
      const anchor = historyButton.current?.getBoundingClientRect();
      if (anchor) {
        node.style.setProperty(
          '--sheet-top',
          `${Math.round(anchor.bottom + 8)}px`,
        );
        node.style.setProperty(
          '--sheet-right',
          `${Math.round(innerWidth - anchor.right)}px`,
        );
      }
      node.showPopover();
    } else if (!historyOpen && shown) node.hidePopover();
  }, [historyOpen]);
  // Elle est posée dans le calque supérieur, donc fixée au viewport : si la
  // page défile, elle se décroche de son bouton. Autant la fermer.
  useEffect(() => {
    if (!historyOpen) return;
    const close = () => setHistoryOpen(false);
    addEventListener('scroll', close, { passive: true });
    return () => removeEventListener('scroll', close);
  }, [historyOpen]);
  useEffect(() => saveDrafts(drafts), [drafts]);
  // Chaque étape attend la précédente. Les minuteries sont annulées si la
  // fiche se ferme en cours de route : une démonstration interrompue ne doit
  // pas ajouter une carte dans le dos de l'étudiant.
  function runAdd() {
    let target: ReturnType<typeof parseFigmaLink>;
    try {
      target = parseFigmaLink(link);
    } catch (e) {
      setAddError((e as Error).message);
      return;
    }
    setAddError('');
    setAdded('');
    const name = draftName.trim() || fallbackName(target);
    let index = 0;
    const next = () => {
      setStep(index);
      const current = STEPS[index];
      timers.current.push(
        setTimeout(() => {
          index += 1;
          if (index < STEPS.length) return next();
          setStep(-1);
          setDrafts((list) => [
            ...list,
            {
              id: crypto.randomUUID(),
              name,
              family,
              fileKey: target.fileKey,
              nodeId: target.nodeId,
              addedAt: new Date().toISOString(),
            },
          ]);
          setAdded(name);
          setLink('');
          setDraftName('');
        }, current.ms),
      );
    };
    next();
  }
  function stopAdd() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep(-1);
  }
  const clearError = () => {
    setError('');
    setNotice('');
  };
  async function perform(action: () => Promise<void>) {
    clearError();
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function accept() {
    if (!proposal) return;
    setSaving(true);
    await perform(async () => {
      const next = await commit(proposal);
      try {
        sessionStorage.removeItem('ds-studio-token-draft-v2');
      } catch {
        /* Facultatif. */
      }
      setState(next);
      setProposal(undefined);
      announceChange();
      setNotice(`Révision ${next.revision} enregistrée sur disque.`);
    });
    setSaving(false);
  }
  if (!state)
    return (
      <main className="loading">
        <h1>DS-Studio</h1>
        <p role="alert">{stateError || 'Ouverture du Design System…'}</p>
        <p>Lancez le serveur local puis rechargez cette page.</p>
      </main>
    );
  const staleProposal = !!proposal && proposal.revision !== state.revision;
  return (
    <>
      <a className="skip-link" href="#ds-title">
        Aller aux tokens
      </a>
      <header className="studio-header">
        <div className="wordmark">
          <img
            className="brand-logo"
            src={glyph}
            alt=""
            width={30}
            height={30}
          />
          <div>
            <strong>Inbox Zapper</strong>
            <span>Design System</span>
          </div>
        </div>
        <div className="header-status">
          <button
            type="button"
            className="is-history"
            ref={historyButton}
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
          >
            {/* La même horloge que dans l'en-tête de la popup : le bouton et ce
                qu'il ouvre portent le même signe. */}
            <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 5.4V10l3 1.8" />
              <circle cx="10" cy="10" r="7.2" />
            </svg>
            Historique · {state.revision}
          </button>
          {/* Le bouton n'écrit rien : il ouvre la fiche, qui dit ce que le
              fichier contient avant de proposer de l'écrire. Un fichier qu'on
              va joindre à une conversation mérite qu'on sache ce qu'il y a
              dedans. */}
          <button
            type="button"
            className="is-doc"
            // L'ouverture est confiée au navigateur par `popovertarget`.
            // Appelée depuis React, `showPopover()` tombait dans le même
            // événement que le clic : la fiche s'ouvrait, puis le clic
            // lui-même comptait comme un clic au dehors et la refermait
            // aussitôt — pas à tous les coups, ce qui est pire. L'attribut
            // n'a pas cette course.
            popoverTarget="doc-sheet"
            aria-expanded={docOpen}
          >
            {/* Une feuille et ses lignes de texte. */}
            <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M11.4 2.4H6a2 2 0 0 0-2 2v11.2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7z" />
              <path d="M11.2 2.6V7h4.6M7.4 11h5.2M7.4 14h3.4" />
            </svg>
            Export .md
          </button>
          {/* Commiter écrit les tokens courants dans le fichier versionnable du
              workspace et les valide. Rien n'est poussé : publier est une autre
              décision, qui se prend ailleurs. */}
          <button
            className="is-commit"
            onClick={() =>
              void perform(async () => {
                const result = await gitCommit();
                setNotice(result.message);
              })
            }
          >
            <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
            </svg>
            Commit
          </button>
        </div>
      </header>
      <div className="feedback" aria-live="polite">
        {(error || stateError) && (
          <p className="error" role="alert">
            {error || stateError}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
      </div>
      {/* Échap et le clic en dehors ferment la popup sans passer par nous : il
          faut donc réaccorder l'état, sinon le bouton se croit encore ouvert
          et le clic suivant ne fait rien. */}
      <div
        className="sheet"
        popover="auto"
        ref={historyPopup}
        onToggle={(e) => setHistoryOpen(e.newState === 'open')}
        aria-labelledby="history-title"
      >
        <header className="sheet-head">
          <span className="sheet-crumb">
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 5.4V10l3 1.8" />
              <circle cx="10" cy="10" r="7.2" />
            </svg>
            Design System
            <i aria-hidden="true">/</i>
            <strong id="history-title">Historique</strong>
          </span>
          <button
            type="button"
            className="sheet-close"
            onClick={() => setHistoryOpen(false)}
            aria-label="Fermer l’historique"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5.4 5.4 9.2 9.2M14.6 5.4l-9.2 9.2" />
            </svg>
          </button>
        </header>
        <div className="sheet-body">
          <p className="sheet-lead">
            Annulez un changement précis. Les autres tokens restent intacts. Une
            annulation s’enregistre elle aussi.
          </p>
          {!state.history.length && (
            <p className="sheet-empty">Aucun changement enregistré.</p>
          )}
          {/* Une entrée par révision, de la plus récente à la plus ancienne,
              reliées par un filet : l'historique est une suite, pas un tas. */}
          <ol className="tl">
            {[...state.history].reverse().map((event) => (
              <li key={event.id}>
                <div className="tl-line">
                  <strong>Révision {event.revision}</strong>
                  <span className="tl-source">{event.source}</span>
                  <time dateTime={event.date}>
                    {new Date(event.date).toLocaleString('fr-FR')}
                  </time>
                </div>
                <div className="tl-chips">
                  {event.patches.map((p) => (
                    <span key={p.key}>{p.key}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className="tl-undo"
                  onClick={() => {
                    setHistoryOpen(false);
                    void perform(async () =>
                      setProposal(
                        await request('undo', {
                          revision: state.revision,
                          id: event.id,
                        }),
                      ),
                    );
                  }}
                >
                  Annuler la révision {event.revision}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {/* La fiche .md : ce que le fichier contient, puis le bouton qui l'écrit.
          Les trois nombres sont comptés sur place — ils doivent suivre le
          design system, pas une phrase écrite une fois. */}
      <div
        className="sheet is-modal is-doc-sheet"
        id="doc-sheet"
        popover="auto"
        onToggle={(e) => setDocOpen(e.newState === 'open')}
        aria-labelledby="doc-title"
      >
        {/* Le panneau d'illustration. Décoratif au sens strict : il ne porte
            aucune information que le texte ne donne pas, donc il est retiré de
            l'arbre d'accessibilité et disparaît en colonne étroite plutôt que
            de voler la moitié de la hauteur au contenu. */}
        <div className="doc-art" aria-hidden="true">
          {/* Le décor dessiné reste sous la vidéo : il habille la colonne si
              le mouvement est refusé, et pendant que la vidéo charge. */}
          <span className="doc-art-grid" />
          {/* Muette, en boucle, sans commande : c'est un décor, pas un média à
              lire. `playsInline` évite le passage en plein écran sur iOS. Le
              dégradé reste dessous : il tient la place pendant le chargement,
              et il est seul si le mouvement est refusé. */}
          <video src={headerMotion} autoPlay loop muted playsInline />
        </div>
        <div className="doc-main">
          <header className="sheet-head">
            <span className="sheet-crumb">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M11.4 2.4H6a2 2 0 0 0-2 2v11.2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7z" />
                <path d="M11.2 2.6V7h4.6M7.4 11h5.2M7.4 14h3.4" />
              </svg>
              Design System
              <i aria-hidden="true">/</i>
              <strong id="doc-title">Export .md</strong>
            </span>
            <button
              type="button"
              className="sheet-close"
              popoverTarget="doc-sheet"
              popoverTargetAction="hide"
              aria-label="Fermer l’export"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="m5.4 5.4 9.2 9.2M14.6 5.4l-9.2 9.2" />
              </svg>
            </button>
          </header>
          <div className="sheet-body">
            <p className="sheet-lead">
              Un seul fichier Markdown qui décrit votre design system tel qu’il
              est maintenant. À joindre à une conversation avec un assistant
              pour qu’il travaille sur les bonnes valeurs plutôt que sur celles
              qu’il a vues la dernière fois.
            </p>
            <ul className="doc-points">
              <li>
                <strong>{tokenKeys.length} tokens</strong>
                <span>leur valeur en vigueur et leur variable CSS</span>
              </li>
              <li>
                <strong>
                  {catalogue.length} composants, {catalogueVariants} variantes
                </strong>
                <span>
                  avec le JSX à coller, lu dans les composants eux-mêmes
                </span>
              </li>
              <li>
                <strong>La palette Figma et les règles</strong>
                <span>162 couleurs sources et les règles de conception</span>
              </li>
            </ul>
            <p className="doc-path">
              Écrit dans <code>workspace/DESIGN_SYSTEM.md</code>. Le fichier est
              remplacé à chaque fois, et rien n’est commité.
            </p>
            {docError && (
              <p className="doc-bad" role="alert">
                {docError}
              </p>
            )}
            {docDone && (
              <p className="doc-ok" role="status">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="m5.6 10.4 3 3 5.8-6.8" />
                </svg>
                {docDone}
              </p>
            )}
          </div>
          <footer className="sheet-foot">
            <button
              type="button"
              className="is-ghost"
              popoverTarget="doc-sheet"
              popoverTargetAction="hide"
            >
              Fermer
            </button>
            <button
              type="button"
              className="is-cta"
              disabled={writingDoc}
              // L'erreur est rendue dans la fiche et non dans le bandeau de la
              // page : la fiche est posée dans le calque supérieur, au-dessus de
              // son propre fond, donc un message resté derrière ne se verrait
              // pas.
              onClick={() => {
                setWritingDoc(true);
                setDocDone('');
                setDocError('');
                void generateDoc()
                  .then((result) => setDocDone(result.message))
                  .catch((e: Error) => setDocError(e.message))
                  .finally(() => setWritingDoc(false));
              }}
            >
              {writingDoc
                ? 'Génération…'
                : docDone
                  ? 'Régénérer la fiche'
                  : 'Générer la fiche'}
            </button>
          </footer>
        </div>
      </div>
      {!componentOpen && <Banner />}
      <CanvasBoard
        onOpenChange={(id) => setComponentOpen(!!id)}
        drafts={drafts}
        tokens={state.tokens}
        tokensView={<TokensTab tokens={state.tokens} />}
      />
      {/* Ajouter un composant depuis Figma. Le bouton flotte en bas à droite :
          l'ajout est une action de l'atelier entier, pas d'une page, et il
          reste sous la main quelle que soit la hauteur du catalogue. */}
      <button
        type="button"
        className="fab"
        popoverTarget="add-sheet"
        aria-label="Ajouter un composant depuis Figma"
        title="Ajouter un composant depuis Figma"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6v12M6 12h12" />
        </svg>
      </button>
      <div
        className="sheet is-modal is-add-sheet"
        id="add-sheet"
        popover="auto"
        onToggle={(e) => {
          setAddOpen(e.newState === 'open');
          if (e.newState === 'closed') {
            stopAdd();
            setAddError('');
            setAdded('');
          }
        }}
        aria-labelledby="add-title"
      >
        <header className="sheet-head">
          <span className="sheet-crumb">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 6v12M6 12h12" />
            </svg>
            Design System
            <i aria-hidden="true">/</i>
            <strong id="add-title">Ajouter un composant</strong>
          </span>
          <button
            type="button"
            className="sheet-close"
            popoverTarget="add-sheet"
            popoverTargetAction="hide"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5.4 5.4 9.2 9.2M14.6 5.4l-9.2 9.2" />
            </svg>
          </button>
        </header>
        <div className="sheet-body">
          <p className="sheet-lead">
            Collez le lien Figma d’un composant : il est lu, écrit sur vos
            tokens, puis ajouté au catalogue.
          </p>
          {/* Dit sans détour ce qui est joué et ce qui ne l'est pas. Une
              démonstration qui se fait passer pour une intégration ne
              démontre rien. */}
          <p className="add-warn">
            <strong>Démonstration.</strong> Tant qu’aucune clé API n’est
            fournie, rien n’est lu dans Figma et aucun composant n’est écrit :
            l’enchaînement ci-dessous montre les étapes, et la carte créée est
            marquée « Simulé ».
          </p>
          <label className="add-field">
            <span>Lien du composant</span>
            <input
              type="url"
              value={link}
              placeholder="https://www.figma.com/design/…?node-id=412-1908"
              onChange={(e) => {
                setLink(e.target.value);
                setAddError('');
              }}
              disabled={step >= 0}
            />
          </label>
          <div className="add-row">
            <label className="add-field">
              <span>Nom (lu depuis Figma plus tard)</span>
              <input
                type="text"
                value={draftName}
                placeholder="déduit du nœud"
                onChange={(e) => setDraftName(e.target.value)}
                disabled={step >= 0}
              />
            </label>
            <label className="add-field">
              <span>Famille</span>
              <select
                value={family}
                onChange={(e) => setFamily(e.target.value as Family)}
                disabled={step >= 0}
              >
                {FAMILIES.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>
          {step >= 0 && (
            <ol className="add-steps" aria-live="polite">
              {STEPS.map((s, i) => (
                <li
                  key={s.label}
                  className={
                    i < step ? 'is-done' : i === step ? 'is-now' : undefined
                  }
                >
                  <i aria-hidden="true" />
                  {s.label}
                </li>
              ))}
            </ol>
          )}
          {addError && (
            <p className="doc-bad" role="alert">
              {addError}
            </p>
          )}
          {added && (
            <p className="doc-ok" role="status">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="m5.6 10.4 3 3 5.8-6.8" />
              </svg>
              {added} ajouté au catalogue, marqué « Simulé ».
            </p>
          )}
        </div>
        <footer className="sheet-foot">
          <button
            type="button"
            className="is-ghost"
            popoverTarget="add-sheet"
            popoverTargetAction="hide"
          >
            Fermer
          </button>
          <button
            type="button"
            className="is-cta"
            disabled={step >= 0}
            onClick={runAdd}
          >
            {step >= 0 ? 'Intégration…' : 'Ajouter au design system'}
          </button>
        </footer>
      </div>
      <footer className="studio-footer">
        <span>DS-Studio V2 · Fait pour être transformé.</span>
        <span>JSON local → validation → composants partagés</span>
      </footer>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          if (saving) e.preventDefault();
          else setProposal(undefined);
        }}
        aria-labelledby="diff-title"
      >
        <h2 id="diff-title">Valider le changement</h2>
        <p>
          Proposition {proposal?.source} · basée sur la révision{' '}
          {proposal?.revision}. Ces valeurs seront enregistrées sur votre
          machine.
        </p>
        {staleProposal && (
          <p role="alert" className="error">
            Une autre validation a modifié le DS. Fermez ce diff et refaites
            votre proposition ; aucun écrasement n’est permis.
          </p>
        )}
        <div className="diff-scroll">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Avant</th>
                <th>Après</th>
              </tr>
            </thead>
            <tbody>
              {proposal?.patches.map((p) => (
                <tr key={p.key}>
                  <th>{p.key}</th>
                  <td>
                    <del>{p.before}</del>
                  </td>
                  <td>
                    <ins>{p.after}</ins>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            ref={cancelButton}
            onClick={() => setProposal(undefined)}
            disabled={saving}
          >
            Ne pas appliquer
          </button>
          <button
            className="studio-primary"
            onClick={() => void accept()}
            disabled={saving || staleProposal}
          >
            {saving ? 'Enregistrement…' : 'Valider et enregistrer'}
          </button>
        </div>
      </dialog>
    </>
  );
}
