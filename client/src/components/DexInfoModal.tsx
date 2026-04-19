import { useEffect, useState } from 'react';
import { BASE_PATH } from '../config';
import './DexInfoModal.css';

export interface MoveDetails {
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  basePower: number;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  target: string | null;
  shortDesc: string;
  desc: string;
}

export interface AbilityDetails {
  name: string;
  shortDesc: string;
  desc: string;
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
};

interface BaseProps {
  onClose: () => void;
}

interface MoveProps extends BaseProps {
  kind: 'move';
  moveName: string;
}

interface AbilityProps extends BaseProps {
  kind: 'ability';
  abilityName: string;
}

type Props = MoveProps | AbilityProps;

/**
 * Popover card showing the Pokémon Showdown-sourced details for a move
 * (type/power/accuracy/PP/category/description) or an ability
 * (short + long description). Data is fetched on open from the server so it
 * stays authoritative regardless of any client-side shortcuts.
 */
export default function DexInfoModal(props: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [move, setMove] = useState<MoveDetails | null>(null);
  const [ability, setAbility] = useState<AbilityDetails | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setMove(null);
    setAbility(null);

    const url = props.kind === 'move'
      ? `${BASE_PATH}/api/dex/move/${encodeURIComponent(props.moveName)}`
      : `${BASE_PATH}/api/dex/ability/${encodeURIComponent(props.abilityName)}`;

    fetch(url)
      .then(async (r) => {
        if (!alive) return;
        if (!r.ok) {
          setError(r.status === 404 ? 'No entry found in the dex.' : 'Failed to load details.');
          return;
        }
        const data = await r.json();
        if (!alive) return;
        if (props.kind === 'move') setMove(data);
        else setAbility(data);
      })
      .catch(() => { if (alive) setError('Failed to load details.'); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [props.kind, (props as any).moveName, (props as any).abilityName]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props.onClose]);

  const title = props.kind === 'move' ? props.moveName : props.abilityName;

  return (
    <div className="dex-modal-backdrop" onClick={props.onClose} role="dialog" aria-modal="true">
      <div className="dex-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="dex-modal-header">
          <div className="dex-modal-title">
            <span className="dex-modal-kind">{props.kind === 'move' ? 'Move' : 'Ability'}</span>
            <h3>{move?.name || ability?.name || title}</h3>
          </div>
          <button className="dex-modal-close" aria-label="Close" onClick={props.onClose}>✕</button>
        </div>

        <div className="dex-modal-body">
          {loading && <div className="dex-modal-loading">Loading…</div>}
          {error && <div className="dex-modal-error">{error}</div>}

          {!loading && !error && move && (
            <>
              <div className="dex-modal-chips">
                <span
                  className="dex-modal-type"
                  style={{ background: TYPE_COLORS[move.type.toLowerCase()] || '#888' }}
                >
                  {move.type}
                </span>
                <span className={`dex-modal-category dex-modal-category-${move.category.toLowerCase()}`}>
                  {move.category}
                </span>
              </div>

              <div className="dex-modal-stats">
                <div className="dex-modal-stat">
                  <span className="dex-modal-stat-label">Power</span>
                  <span className="dex-modal-stat-value">
                    {move.basePower > 0 ? move.basePower : '—'}
                  </span>
                </div>
                <div className="dex-modal-stat">
                  <span className="dex-modal-stat-label">Accuracy</span>
                  <span className="dex-modal-stat-value">
                    {move.accuracy == null ? '—' : `${move.accuracy}%`}
                  </span>
                </div>
                <div className="dex-modal-stat">
                  <span className="dex-modal-stat-label">PP</span>
                  <span className="dex-modal-stat-value">{move.pp ?? '—'}</span>
                </div>
                {move.priority !== 0 && (
                  <div className="dex-modal-stat">
                    <span className="dex-modal-stat-label">Priority</span>
                    <span className="dex-modal-stat-value">
                      {move.priority > 0 ? `+${move.priority}` : move.priority}
                    </span>
                  </div>
                )}
              </div>

              {move.desc && <p className="dex-modal-desc">{move.desc}</p>}
              {!move.desc && move.shortDesc && <p className="dex-modal-desc">{move.shortDesc}</p>}
            </>
          )}

          {!loading && !error && ability && (
            <>
              {ability.desc && <p className="dex-modal-desc">{ability.desc}</p>}
              {ability.shortDesc && ability.shortDesc !== ability.desc && (
                <p className="dex-modal-short">{ability.shortDesc}</p>
              )}
              {!ability.desc && !ability.shortDesc && (
                <p className="dex-modal-desc dex-modal-desc-muted">No description available.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
