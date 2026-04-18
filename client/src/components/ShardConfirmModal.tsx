import type { PokemonInstance } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';
import { getHeldItemName, getHeldItemSprite } from '@shared/held-item-data';
import RarityStars from './RarityStars';
import './ShardConfirmModal.css';

interface ShardConfirmModalProps {
  instances: PokemonInstance[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ShardConfirmModal({ instances, onConfirm, onCancel }: ShardConfirmModalProps) {
  if (instances.length === 0) return null;
  const isBulk = instances.length > 1;
  const totalTokens = instances.length;
  const returnedItems = instances.filter((i) => !!i.heldItem);
  const totalBondLost = instances.reduce((sum, i) => sum + (i.bondXp ?? 0), 0);

  return (
    <div className="shard-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="shard-modal">
        <div className="shard-modal-header">
          <h3>{isBulk ? `Shard ${instances.length} Pokémon?` : `Shard ${instances[0].pokemon.name}?`}</h3>
          <button className="shard-modal-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <div className="shard-modal-body">
          {!isBulk && (() => {
            const inst = instances[0];
            const moves = getEffectiveMoves(inst);
            return (
              <div className="shard-preview-single">
                <div className="shard-preview-sprite-wrap">
                  <img src={inst.pokemon.sprite} alt={inst.pokemon.name} className="shard-preview-sprite" />
                  <RarityStars tier={inst.pokemon.tier} size="md" className="shard-preview-rarity" />
                </div>
                <div className="shard-preview-info">
                  <div className="shard-preview-name">{inst.pokemon.name}</div>
                  <div className="shard-preview-meta">{inst.nature} · {inst.ability}</div>
                  <div className="shard-preview-moves">{moves[0]} · {moves[1]}</div>
                  {inst.heldItem && (
                    <div className="shard-preview-held">
                      <img src={getHeldItemSprite(inst.heldItem)} alt="" />
                      <span>{getHeldItemName(inst.heldItem)} will be returned</span>
                    </div>
                  )}
                  {(inst.bondXp ?? 0) > 0 && (
                    <div className="shard-preview-warn">Bond XP ({inst.bondXp}) will be lost</div>
                  )}
                </div>
              </div>
            );
          })()}

          {isBulk && (
            <>
              <div className="shard-preview-list">
                {instances.map((inst) => (
                  <div key={inst.instanceId} className="shard-preview-chip" title={`${inst.pokemon.name} · ${inst.nature}`}>
                    <img src={inst.pokemon.sprite} alt={inst.pokemon.name} />
                    <span className="shard-preview-chip-name">{inst.pokemon.name}</span>
                    {inst.heldItem && <span className="shard-preview-chip-held" title={`${getHeldItemName(inst.heldItem)} will be returned`}>●</span>}
                  </div>
                ))}
              </div>
              {returnedItems.length > 0 && (
                <div className="shard-preview-warn">{returnedItems.length} held item{returnedItems.length > 1 ? 's' : ''} will be returned to your inventory.</div>
              )}
              {totalBondLost > 0 && (
                <div className="shard-preview-warn">Total Bond XP lost: {totalBondLost}</div>
              )}
            </>
          )}

          <div className="shard-preview-reward">
            You will receive <strong>{totalTokens} token{totalTokens > 1 ? 's' : ''}</strong>.
          </div>
        </div>

        <div className="shard-modal-actions">
          <button className="shard-modal-btn shard-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="shard-modal-btn shard-modal-confirm" onClick={onConfirm}>
            Shard {isBulk ? `${instances.length}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
