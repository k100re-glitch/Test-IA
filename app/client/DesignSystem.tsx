import { useState, type CSSProperties, type ReactNode } from 'react';
import { tokenCss, type Tokens } from '../shared/model.js';
import {
  Button,
  Checkbox,
  Radio,
  Tag,
  TextField,
  Toggle,
} from './Atoms.js';

// Les atomes du DS sont définis dans Atoms.tsx et réexportés ici pour que les
// deux viewers continuent d'importer un seul module.
export { Button, Checkbox, Radio, Tag, TextField, Toggle } from './Atoms.js';
import {
  ChoiceScreen,
  HomeScreen,
  ModalScreen,
  SenderScreen,
} from './Screens.js';

export function DSProvider({
  tokens,
  children,
}: {
  tokens: Tokens;
  children: ReactNode;
}) {
  return (
    <div className="ds" style={tokenCss(tokens) as CSSProperties}>
      {children}
    </div>
  );
}
export function BookingCard() {
  const [booked, setBooked] = useState(false);
  return (
    <article className="ds-card">
      <div className="card-kicker">ATELIER · 45 MIN</div>
      <h3>Faire moins, mais mieux.</h3>
      <p>Un atelier pour imaginer des services plus attentifs au quotidien.</p>
      <div className="card-meta">
        <Tag>6 places disponibles</Tag>
        <Tag tone="secondary">Gratuit</Tag>
      </div>
      <Button onClick={() => setBooked(!booked)}>
        {booked ? 'Réservation confirmée ✓' : 'Réserver une place'}
      </Button>
      <span role="status" className="ds-feedback">
        {booked ? 'Inscription de démonstration, aucune donnée envoyée.' : ''}
      </span>
    </article>
  );
}
export function ExampleForm() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [digest, setDigest] = useState(true);
  const [pace, setPace] = useState('immediat');
  return (
    <form
      className="ds-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <TextField
        label="Votre prénom"
        value={name}
        placeholder="Camille"
        onChange={(v) => {
          setName(v);
          setSent(false);
        }}
      />
      <TextField
        label="Adresse e-mail"
        value={mail}
        placeholder="camille@example.com"
        onChange={(v) => {
          setMail(v);
          setSent(false);
        }}
      />
      <TextField
        label="Champ désactivé"
        value=""
        placeholder="Non disponible"
        disabled
        onChange={() => {}}
      />
      <fieldset className="ds-choices">
        <legend>Fréquence</legend>
        <Radio
          name="frequence"
          value="immediat"
          checked={pace === 'immediat'}
          onChange={setPace}
        >
          Immédiat
        </Radio>
        <Radio
          name="frequence"
          value="hebdo"
          checked={pace === 'hebdo'}
          onChange={setPace}
        >
          Hebdomadaire
        </Radio>
      </fieldset>
      <Toggle checked={digest} onChange={setDigest}>
        Recevoir le résumé hebdomadaire
      </Toggle>
      <Checkbox checked={agreed} onChange={setAgreed}>
        J’accepte les conditions de démonstration
      </Checkbox>
      <Button type="submit" size="h2" disabled={!agreed}>
        S’inscrire
      </Button>
      <p role="status">
        {sent ? 'Merci ! Démonstration locale, aucune inscription réelle.' : ''}
      </p>
    </form>
  );
}
export function Navigation() {
  const [tab, setTab] = useState('Découvrir');
  return (
    <nav aria-label="Navigation du scénario" className="ds-nav">
      {['Découvrir', 'Favoris', 'Profil'].map((t) => (
        <button
          key={t}
          aria-current={tab === t ? 'page' : undefined}
          onClick={() => setTab(t)}
        >
          {t}
        </button>
      ))}
      <p className="nav-context" aria-live="polite">
        {tab === 'Favoris'
          ? 'Vos ateliers favoris apparaîtront ici.'
          : tab === 'Profil'
            ? 'Votre espace personnel de démonstration.'
            : 'Des idées à explorer près de chez vous.'}
      </p>
    </nav>
  );
}
export function Scenario({
  tokens,
  scenario,
}: {
  tokens: Tokens;
  scenario: string;
}) {
  // Les écrans Inbox Zapper sont rendus seuls : ce sont des maquettes
  // d'application à pleine hauteur, pas des sections d'une page web.
  if (['home', 'sender', 'choice', 'modal'].includes(scenario))
    return (
      <DSProvider tokens={tokens}>
        {scenario === 'home' ? (
          <HomeScreen />
        ) : scenario === 'sender' ? (
          <SenderScreen />
        ) : scenario === 'modal' ? (
          <ModalScreen />
        ) : (
          <ChoiceScreen />
        )}
      </DSProvider>
    );
  return (
    <DSProvider tokens={tokens}>
      <div className="scenario">
        <header className="scenario-head">
          <strong>
            lisière<span>®</span>
          </strong>
          <span className="ds-badge">Bordeaux</span>
        </header>
        <Navigation />
        <main>
          <div className="section-label">LE QUOTIDIEN, AUTREMENT</div>
          <h1>
            De petites idées.
            <br />
            De vrais liens.
          </h1>
          <p>Des ateliers pour apprendre, partager et se rencontrer.</p>
          {scenario === 'form' ? (
            <div className="ds-card">
              <h2>Rejoignez le mouvement.</h2>
              <ExampleForm />
            </div>
          ) : (
            <div className="scenario-grid">
              <BookingCard />
              <article className="ds-card">
                <div className="card-kicker">À VOTRE RYTHME</div>
                <h3>Un quartier qui inspire.</h3>
                <p>Explorez vos prochaines rencontres.</p>
                <Button tone="secondary">Voir les ateliers</Button>
              </article>
            </div>
          )}
        </main>
        <footer>lisière · Design System d’exemple fictif</footer>
      </div>
    </DSProvider>
  );
}
