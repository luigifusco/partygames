import type { PokemonInstance, Pokemon, Stats } from '@shared/types';
import { NATURE_BY_NAME, calcStat, STAT_LABELS } from '@shared/natures';
import RarityStars from './RarityStars';
import './EvolvePreviewModal.css';

interface EvolvePreviewModalProps {
  instance: PokemonInstance;
  targets: Pokemon[];
  onConfirm: (targetId: number) => void;
  onCancel: () => void;
}

const STAT_KEYS: (keyof Stats)[] = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];

export default function EvolvePreviewModal({ instance, targets, onConfirm, onCancel }: EvolvePreviewModalProps) {
  if (targets.length === 0) return null;
  const natureData = NATURE_BY_NAME[instance.nature];
  const current = instance.pokemon;

  return (
    <div className="evolve-preview-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="evolve-preview-modal">
        <div className="evolve-preview-header">
          <h3>Evolve {current.name}?</h3>
          <button className="evolve-preview-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <div className="evolve-preview-body">
          {targets.map((target) => (
            <div key={target.id} className="evolve-preview-target">
              <div className="evolve-preview-sprites">
                <div className="evolve-preview-sprite-col">
                  <img src={current.sprite} alt={current.name} />
                  <div className="evolve-preview-sprite-name">{current.name}</div>
                  <RarityStars tier={current.tier} size="sm" />
                </div>
                <div className="evolve-preview-arrow">→</div>
                <div className="evolve-preview-sprite-col evolve-preview-next">
                  <img src={target.sprite} alt={target.name} />
                  <div className="evolve-preview-sprite-name">{target.name}</div>
                  <RarityStars tier={target.tier} size="sm" />
                </div>
              </div>

              <div className="evolve-preview-stats">
                {STAT_KEYS.map((key) => {
                  const iv = instance.ivs[key];
                  const before = calcStat(key, current.stats[key], iv, natureData);
                  const after = calcStat(key, target.stats[key], iv, natureData);
                  const delta = after - before;
                  return (
                    <div key={key} className="evolve-preview-stat">
                      <span className="evolve-preview-stat-label">{STAT_LABELS[key]}</span>
                      <span className="evolve-preview-stat-values">
                        <span className="evolve-preview-stat-before">{before}</span>
                        <span className="evolve-preview-stat-arrow">→</span>
                        <span className="evolve-preview-stat-after">{after}</span>
                      </span>
                      <span className={`evolve-preview-stat-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}`}>
                        {delta > 0 ? `+${delta}` : delta === 0 ? '±0' : `${delta}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {target.types && (
                <div className="evolve-preview-types">
                  <span className="evolve-preview-types-label">Types</span>
                  <span>{target.types.join(' / ')}</span>
                </div>
              )}

              <button className="evolve-preview-confirm" onClick={() => onConfirm(target.id)}>
                Evolve into {target.name}
              </button>
            </div>
          ))}
        </div>

        <div className="evolve-preview-footer">
          <button className="evolve-preview-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
