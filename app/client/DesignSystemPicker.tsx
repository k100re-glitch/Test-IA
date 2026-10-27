import { useEffect, useState } from 'react';
import { request } from './api.js';
import { tokenKeys, type Proposal, type Tokens } from '../shared/model.js';

export interface DesignSystemEntry {
  id: string;
  name: string;
  description: string;
  tokens: Tokens;
}

// Couleurs montrées en aperçu : celles qui donnent son caractère à un DS.
const preview = [
  'color.brand',
  'color.canvas',
  'color.text',
  'color.danger',
  'color.success',
] as const;

function sameTokens(a: Tokens, b: Tokens) {
  return tokenKeys.every((k) => a[k].$value === b[k].$value);
}

export default function DesignSystemPicker({
  tokens,
  revision,
  disabled,
  onProposal,
  onError,
  onActive,
}: {
  tokens: Tokens;
  revision: number;
  disabled: boolean;
  onProposal: (p: Proposal) => void;
  onError: (message: string) => void;
  onActive?: (name: string | undefined) => void;
}) {
  const [entries, setEntries] = useState<DesignSystemEntry[]>([]);
  const [pending, setPending] = useState<string>();
  useEffect(() => {
    request<DesignSystemEntry[]>('design-systems')
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);
  const active = entries.find((e) => sameTokens(e.tokens, tokens));
  const activeName = active?.name;
  useEffect(() => {
    onActive?.(activeName);
  }, [activeName, onActive]);
  if (entries.length === 0) return null;
  async function choose(entry: DesignSystemEntry) {
    if (active?.id === entry.id) return;
    setPending(entry.id);
    try {
      onProposal(
        await request<Proposal>('design-systems', { revision, id: entry.id }),
      );
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Proposition impossible.');
    } finally {
      setPending(undefined);
    }
  }
  return (
    <fieldset className="ds-picker">
      <legend>Design system actif</legend>
      <div className="ds-picker-list">
        {entries.map((entry) => {
          const current = active?.id === entry.id;
          return (
            <label
              key={entry.id}
              className={`ds-option${current ? ' is-active' : ''}`}
            >
              <input
                type="radio"
                name="design-system"
                checked={current}
                disabled={disabled || pending !== undefined}
                onChange={() => choose(entry)}
              />
              <span className="ds-option-body">
                <span className="ds-option-name">
                  {entry.name}
                  {current && <span className="ds-badge">actif</span>}
                  {pending === entry.id && (
                    <span className="ds-badge">diff en cours…</span>
                  )}
                </span>
                <span className="ds-option-desc">{entry.description}</span>
                <span className="ds-swatches" aria-hidden="true">
                  {preview.map((key) => (
                    <span
                      key={key}
                      className="ds-swatch"
                      style={{ background: String(entry.tokens[key].$value) }}
                    />
                  ))}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <p className="ds-picker-hint">
        Choisir un design system prépare un diff. Rien n’est écrit avant votre
        validation.
      </p>
    </fieldset>
  );
}
