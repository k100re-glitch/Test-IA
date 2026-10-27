import { useState } from 'react';
import { Button, Modal, Tag, Toggle } from './Atoms.js';

// Écrans d'Inbox Zapper repris de Figma : Mailing lists (11600:68069),
// la fiche expéditeur (11551:55355) et la question sur les anciens e-mails
// (11838:36277 et 11838:36531, deux états du même écran).
//
// Les données sont fictives et locales. Les logos de marque ne sont pas
// reproduits : un monogramme coloré tient la place, pour ne pas embarquer
// des images de tiers dans le dépôt.

function StatusBar() {
  return (
    <div className="iz-status" aria-hidden="true">
      <span className="iz-clock">9:41</span>
      <span className="iz-signal" />
    </div>
  );
}

function AppHeader() {
  return (
    <header className="iz-header">
      <div className="iz-header-id">
        <h1>Mailing lists</h1>
        <p>
          akayaian@gmail.com <span aria-hidden="true">⌄</span>
        </p>
      </div>
      <span className="iz-pro">✦ GET PRO</span>
      <span className="iz-gear" aria-hidden="true">
        ⚙
      </span>
    </header>
  );
}

function Avatar({ name, hue }: { name: string; hue: number }) {
  return (
    <span
      className="iz-avatar"
      aria-hidden="true"
      style={{ background: `hsl(${hue} 55% 92%)`, color: `hsl(${hue} 55% 32%)` }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

interface Sender {
  name: string;
  mail: string;
  count: number;
  size: string;
  hue: number;
}
const senders: Sender[] = [
  {
    name: 'Tiktok',
    mail: 'newsletter@service.tiktok.com',
    count: 8,
    size: '2.5 Kb',
    hue: 340,
  },
  {
    name: 'Discover Card',
    mail: 'discover@card-e.em.discover.com',
    count: 8,
    size: '2.5 Kb',
    hue: 28,
  },
  {
    name: 'Discover Card',
    mail: 'david@blimsly.com',
    count: 32,
    size: '2.5 Kb',
    hue: 210,
  },
];

function SenderCard({
  sender,
  badge,
  onOpen,
}: {
  sender: Sender;
  badge?: string;
  onOpen?: () => void;
}) {
  const [choice, setChoice] = useState<'keep' | 'drop' | null>(null);
  return (
    <article className="iz-sender">
      <div className="iz-sender-head">
        <Avatar name={sender.name} hue={sender.hue} />
        <button type="button" className="iz-sender-id" onClick={onOpen}>
          <strong>{sender.name}</strong>
          <span>{sender.mail}</span>
        </button>
        <div className="iz-sender-meta">
          {badge ? (
            <Tag tone="secondary">{badge}</Tag>
          ) : (
            <>
              <Tag tone="secondary">✉ {sender.count}</Tag>
              <Tag tone="secondary">{sender.size}</Tag>
            </>
          )}
        </div>
      </div>
      <div className="iz-actions">
        <Button
          size="sm"
          tone="secondary"
          showIcon={false}
          block
          onClick={() => setChoice(choice === 'keep' ? null : 'keep')}
        >
          {choice === 'keep' ? '✓ Gardé' : '✓ Keep'}
        </Button>
        <Button
          size="sm"
          tone="dangerSoft"
          showIcon={false}
          block
          onClick={() => setChoice(choice === 'drop' ? null : 'drop')}
        >
          {choice === 'drop' ? '✕ Désabonné' : '✕ Unsubscribe'}
        </Button>
      </div>
    </article>
  );
}

function Filters() {
  return (
    <>
      <div className="iz-search" role="search">
        <span aria-hidden="true">⌕</span>
        <input placeholder="Search sender" aria-label="Rechercher un expéditeur" />
      </div>
      <div className="iz-chips">
        {['Frequency', 'Older than', 'Larger than'].map((c) => (
          <button key={c} type="button" className="iz-chip">
            {c} <span aria-hidden="true">⌄</span>
          </button>
        ))}
      </div>
      <div className="iz-count">
        <span>173 senders found</span>
        <button type="button" className="iz-sort">
          ↕ Most recent
        </button>
      </div>
    </>
  );
}

function TabBar({ active = 'Home' }: { active?: string }) {
  return (
    <nav className="iz-tabbar" aria-label="Navigation principale">
      {['Home', 'Senders', 'AI Selec…', 'Privacy', 'History'].map((t) => (
        <button
          key={t}
          type="button"
          aria-current={t === active ? 'page' : undefined}
          className={t === active ? 'is-active' : undefined}
        >
          <span className="iz-tab-dot" aria-hidden="true" />
          {t}
        </button>
      ))}
    </nav>
  );
}

export function HomeScreen({ onOpenSender }: { onOpenSender?: () => void }) {
  return (
    <div className="iz-screen">
      <StatusBar />
      <AppHeader />
      <div className="iz-scroll">
        <Filters />
        <h2 className="iz-section">
          New Sender (6) <span aria-hidden="true">ⓘ</span>
        </h2>
        <SenderCard sender={senders[0]} badge="1st · 7d ago" onOpen={onOpenSender} />
        <h2 className="iz-section">Today</h2>
        <SenderCard sender={senders[1]} onOpen={onOpenSender} />
        <SenderCard sender={senders[2]} onOpen={onOpenSender} />
      </div>
      <TabBar />
    </div>
  );
}

const received = [
  { age: '2d', subject: 'Please note, these insights are not guara…' },
  { age: '9d', subject: 'Keep in mind, these are observations, no…' },
  { age: '11d', subject: 'Remember, these are just reports, not gu…' },
  { age: '23d', subject: 'Please note, these are observations, not …' },
  { age: '1mo', subject: 'These insights are not certainties, we sha…' },
];

export function SenderScreen() {
  const s = senders[0];
  return (
    <div className="iz-screen">
      <StatusBar />
      <AppHeader />
      <div className="iz-sheet">
        <button type="button" className="iz-close" aria-label="Fermer">
          ✕
        </button>
        <Avatar name={s.name} hue={s.hue} />
        <div className="iz-sheet-id">
          <strong>{s.name}</strong>
          <span>{s.mail}</span>
        </div>
        <div className="iz-sheet-meta">
          <Tag tone="secondary">✉ {s.count}</Tag>
          <Tag tone="secondary">{s.size}</Tag>
        </div>
        <dl className="iz-dates">
          <div>
            <dt>First email</dt>
            <dd>10 Sep. 2024</dd>
          </div>
          <div>
            <dt>Last email</dt>
            <dd>29 Jun. 2025</dd>
          </div>
        </dl>
        <div className="iz-actions">
          <Button size="sm" tone="secondary" showIcon={false} block>
            ✓ Keep
          </Button>
          <Button size="sm" tone="dangerSoft" showIcon={false} block>
            ✕ Unsubscribe
          </Button>
        </div>
        <section className="iz-received">
          <h3>Last emails received</h3>
          <ul>
            {received.map((r) => (
              <li key={r.age}>
                <span className="iz-age">{r.age}</span>
                <span className="iz-subject">{r.subject}</span>
              </li>
            ))}
          </ul>
        </section>
        <Button tone="danger" size="h2" showIcon={false} block>
          🗑 Delete all emails ({s.count})
        </Button>
      </div>
    </div>
  );
}

// Les deux derniers écrans Figma sont le même, toggle éteint puis allumé :
// l'illustration suit l'état plutôt que d'être figée.
export function ChoiceScreen() {
  const [trash, setTrash] = useState(false);
  return (
    <div className="iz-screen">
      <StatusBar />
      <AppHeader />
      <div className="iz-scroll iz-dimmed" aria-hidden="true">
        <Filters />
        <h2 className="iz-section">Today</h2>
      </div>
      <div className="iz-modal">
        <div className={`iz-illus${trash ? ' is-trash' : ''}`} aria-hidden="true">
          <div className="iz-illus-card">
            <span className="iz-illus-line" />
            <span className="iz-illus-line short" />
            <span className="iz-illus-keep">✓ Keep</span>
          </div>
          <div className="iz-illus-stack">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ transform: `translateY(${i * 4}px)` }} />
            ))}
            {trash && <span className="iz-illus-bin">🗑</span>}
          </div>
        </div>
        <h2>What about their past emails?</h2>
        <p>Senders you keep will still reach your inbox.</p>
        <div className="iz-modal-row">
          <span className="iz-modal-icon" aria-hidden="true">
            🗑
          </span>
          <span className="iz-modal-text">
            <strong>Move past emails to trash</strong>
            <span>Every time you keep</span>
          </span>
          <Toggle checked={trash} onChange={setTrash}>
            <span className="iz-visually-hidden">
              Déplacer les anciens e-mails vers la corbeille
            </span>
          </Toggle>
        </div>
        <p className="iz-hint">
          <span aria-hidden="true">ⓘ</span> You can change this anytime in
          Settings.
        </p>
        <Button block showIcon={false}>
          Save my choice
        </Button>
      </div>
    </div>
  );
}

// Écran de démonstration de la modale : la liste reste visible derrière un
// voile, la modale est posée au centre. Les quatre états se parcourent.
export function ModalScreen() {
  const [state, setState] = useState<'two' | 'one' | 'none' | 'stacked'>('two');
  const order = ['two', 'one', 'none', 'stacked'] as const;
  return (
    <div className="iz-screen">
      <StatusBar />
      <AppHeader />
      <div className="iz-scroll iz-dimmed" aria-hidden="true">
        <Filters />
        <h2 className="iz-section">Today</h2>
        <SenderCard sender={senders[1]} />
      </div>
      <div className="iz-overlay">
        <Modal
          state={state}
          title="Here your title"
          primaryLabel="Text"
          secondaryLabel="Text"
          onPrimary={() =>
            setState(order[(order.indexOf(state) + 1) % order.length])
          }
          onSecondary={() =>
            setState(order[(order.indexOf(state) + 1) % order.length])
          }
          onClose={() =>
            setState(order[(order.indexOf(state) + 1) % order.length])
          }
        >
          The description of your pop-up should be written here, like this, here
          you go.
        </Modal>
      </div>
    </div>
  );
}
