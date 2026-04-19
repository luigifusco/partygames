import type { Pokemon } from '@shared/types';
import RarityStars from './RarityStars';
import './ReawakenConfirmModal.css';

interface ReawakenConfirmModalProps {
  species: Pokemon;
  essence: number;
  memoryCount: number;
  cost: { tokens: number; essence: number };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReawakenConfirmModal({ species, essence, memoryCount, cost, onConfirm, onCancel }: ReawakenConfirmModalProps) {
  const canAfford = essence >= cost.essence && memoryCount >= cost.tokens;

  return (
    <div className="reawaken-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="reawaken-modal">
        <div className="reawaken-modal-header">
          <h3>Reawaken a {species.name}?</h3>
          <button className="reawaken-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <div className="reawaken-modal-body">
          <p className="reawaken-modal-flavor">
            Offer this Memory to the stars. A fresh {species.name} will emerge — a new nature, new potential, new muscles, new moves learned under the moon.
          </p>

          <div className="reawaken-preview">
            <div className="reawaken-preview-sprite-wrap">
              <img src={species.sprite} alt={species.name} className="reawaken-preview-sprite" />
              <RarityStars tier={species.tier} size="md" />
            </div>
            <div className="reawaken-preview-info">
              <div className="reawaken-preview-name">{species.name}</div>
              <div className="reawaken-preview-meta">
                {species.types.join(' · ')}
              </div>
              <div className="reawaken-preview-meta reawaken-preview-moves">
                Nature, IVs, ability and moves will be re-rolled.
              </div>
            </div>
          </div>

          <div className="reawaken-cost">
            <div className={`reawaken-cost-row ${memoryCount >= cost.tokens ? 'ok' : 'short'}`}>
              <span className="reawaken-cost-icon">🌙</span>
              <span className="reawaken-cost-label">{species.name} Memory</span>
              <span className="reawaken-cost-value">
                {cost.tokens} <span className="reawaken-cost-have">(have {memoryCount})</span>
              </span>
            </div>
            <div className={`reawaken-cost-row ${essence >= cost.essence ? 'ok' : 'short'}`}>
              <span className="reawaken-cost-icon">✦</span>
              <span className="reawaken-cost-label">Essence offering</span>
              <span className="reawaken-cost-value">
                {cost.essence.toLocaleString()} <span className="reawaken-cost-have">(have {essence.toLocaleString()})</span>
              </span>
            </div>
          </div>

          <div className="reawaken-warning">
            The Memory will be consumed. A brand new {species.name} will join your collection.
          </div>
        </div>

        <div className="reawaken-modal-actions">
          <button className="reawaken-modal-btn reawaken-modal-btn-cancel" onClick={onCancel}>Not tonight</button>
          <button
            className="reawaken-modal-btn reawaken-modal-btn-confirm"
            onClick={onConfirm}
            disabled={!canAfford}
          >
            ✨ Begin the rite
          </button>
        </div>
      </div>
    </div>
  );
}
