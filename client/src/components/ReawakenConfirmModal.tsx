import type { PokemonInstance } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';
import RarityStars from './RarityStars';
import './ReawakenConfirmModal.css';

interface ReawakenConfirmModalProps {
  instance: PokemonInstance;
  essence: number;
  tokenCount: number;
  cost: { tokens: number; essence: number };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReawakenConfirmModal({ instance, essence, tokenCount, cost, onConfirm, onCancel }: ReawakenConfirmModalProps) {
  const moves = getEffectiveMoves(instance);
  const canAfford = essence >= cost.essence && tokenCount >= cost.tokens;

  return (
    <div className="reawaken-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="reawaken-modal">
        <div className="reawaken-modal-header">
          <h3>Reawaken {instance.pokemon.name}?</h3>
          <button className="reawaken-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <div className="reawaken-modal-body">
          <p className="reawaken-modal-flavor">
            Let this partner return to the wild for one night. They will come back the version of themselves they were meant to be — fresh nature, new potential, new muscles, new moves learned under the stars.
          </p>

          <div className="reawaken-preview">
            <div className="reawaken-preview-sprite-wrap">
              <img src={instance.pokemon.sprite} alt={instance.pokemon.name} className="reawaken-preview-sprite" />
              <RarityStars tier={instance.pokemon.tier} size="md" />
            </div>
            <div className="reawaken-preview-info">
              <div className="reawaken-preview-name">{instance.pokemon.name}</div>
              <div className="reawaken-preview-meta">
                {instance.nature} · {instance.ability}
              </div>
              <div className="reawaken-preview-meta reawaken-preview-moves">
                {moves.join(' · ')}
              </div>
            </div>
          </div>

          <div className="reawaken-cost">
            <div className={`reawaken-cost-row ${tokenCount >= cost.tokens ? 'ok' : 'short'}`}>
              <span className="reawaken-cost-icon">🪙</span>
              <span className="reawaken-cost-label">{instance.pokemon.name} token</span>
              <span className="reawaken-cost-value">
                {cost.tokens} <span className="reawaken-cost-have">(have {tokenCount})</span>
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
            This specimen's current nature, IVs, ability, moves, and bond XP will be released with them.
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
