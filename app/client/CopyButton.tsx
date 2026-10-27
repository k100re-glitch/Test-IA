import { useEffect, useState } from 'react';

// Copie un extrait de code. L'API presse-papiers échoue hors contexte sûr ou
// si la permission est refusée : on retombe alors sur une sélection que
// l'étudiant valide lui-même, plutôt que de prétendre avoir copié.
async function write(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
    }
  }
}

export default function CopyButton({
  code,
  label = 'Copier le code',
  small = false,
}: {
  code: string;
  label?: string;
  small?: boolean;
}) {
  const [done, setDone] = useState<'ok' | 'fail'>();
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(undefined), 2200);
    return () => clearTimeout(timer);
  }, [done]);
  return (
    <button
      type="button"
      className={`cat-copy-btn${small ? ' is-small' : ''}`}
      onClick={async () => setDone((await write(code)) ? 'ok' : 'fail')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        {done === 'ok' ? (
          <path d="M5 13l4 4L19 7" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </>
        )}
      </svg>
      <span aria-live="polite">
        {done === 'ok' ? 'Copié' : done === 'fail' ? 'Copie refusée' : label}
      </span>
    </button>
  );
}
