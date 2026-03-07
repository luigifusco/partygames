import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PokemonInstance, Pokemon, BoxTier, OwnedItem } from '@shared/types';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import PokemonCard from '../components/PokemonCard';
import './CollectionScreen.css';

const TIERS: (BoxTier | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];

interface CollectionScreenProps {
  collection: PokemonInstance[];
  items: OwnedItem[];
  onEvolve: (instance: PokemonInstance, targetId: number) => void;
  onShard: (instance: PokemonInstance) => void;
}

function getEvoTargets(pokemon: Pokemon): Pokemon[] {
  if (!pokemon.evolutionTo) return [];
  return pokemon.evolutionTo
    .map((id) => POKEMON_BY_ID[id])
    .filter(Boolean);
}

export default function CollectionScreen({ collection, items, onEvolve, onShard }: CollectionScreenProps) {
  const navigate = useNavigate();
  const [evolving, setEvolving] = useState<{ from: PokemonInstance; to: Pokemon } | null>(null);
  const [evoPicker, setEvoPicker] = useState<{ inst: PokemonInstance; targets: Pokemon[] } | null>(null);
  const [sharding, setSharding] = useState<PokemonInstance | null>(null);
  const [filter, setFilter] = useState<BoxTier | 'all'>('all');

  // Count tokens per pokemon id
  const tokenCounts = new Map<number, number>();
  for (const item of items) {
    if (item.itemType === 'token') {
      const pid = Number(item.itemData);
      tokenCounts.set(pid, (tokenCounts.get(pid) ?? 0) + 1);
    }
  }

  const filtered = collection
    .filter((inst) => filter === 'all' || inst.pokemon.tier === filter)
    .sort((a, b) => a.pokemon.id - b.pokemon.id);

  const startEvolve = (inst: PokemonInstance) => {
    const targets = getEvoTargets(inst.pokemon);
    if (targets.length === 0) return;
    if (targets.length === 1) {
      doEvolve(inst, targets[0]);
    } else {
      setEvoPicker({ inst, targets });
    }
  };

  const doEvolve = (inst: PokemonInstance, target: Pokemon) => {
    setEvoPicker(null);
    setEvolving({ from: inst, to: target });
    setTimeout(() => {
      onEvolve(inst, target.id);
      setTimeout(() => setEvolving(null), 1200);
    }, 1500);
  };

  const handleShard = (inst: PokemonInstance) => {
    setSharding(inst);
  };

  const confirmShard = () => {
    if (!sharding) return;
    onShard(sharding);
    setSharding(null);
  };

  // Find the index in the original collection for navigation
  const getCollectionIndex = (inst: PokemonInstance) =>
    collection.findIndex((c) => c.instanceId === inst.instanceId);

  return (
    <div className="collection-screen">
      <div className="collection-header">
        <button className="collection-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>My Pokémon ({collection.length})</h2>
      </div>
      <div className="collection-filters">
        {TIERS.map((tier) => (
          <button
            key={tier}
            className={`collection-filter-btn ${filter === tier ? 'active' : ''}`}
            onClick={() => setFilter(tier)}
          >
            {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="collection-empty">No Pokémon yet — visit the shop!</div>
      ) : (
        <div className="collection-grid">
          {filtered.map((inst) => {
            const tokens = tokenCounts.get(inst.pokemon.id) ?? 0;
            const targets = getEvoTargets(inst.pokemon);
            const canEvolve = tokens >= 3 && targets.length > 0;
            return (
              <PokemonCard
                key={inst.instanceId}
                pokemon={inst.pokemon}
                onClick={() => navigate(`/pokemon/${getCollectionIndex(inst)}`)}
              >
                {canEvolve && (
                  <button className="collection-evolve-btn" onClick={(e) => { e.stopPropagation(); startEvolve(inst); }}>
                    ✨ Evolve ({tokens}/3)
                  </button>
                )}
                <button className="collection-shard-btn" onClick={(e) => { e.stopPropagation(); handleShard(inst); }}>
                  🔮 Shard
                </button>
              </PokemonCard>
            );
          })}
        </div>
      )}

      {evoPicker && (
        <div className="evolve-overlay" onClick={(e) => e.target === e.currentTarget && setEvoPicker(null)}>
          <div className="evo-picker">
            <div className="evo-picker-title">Evolve {evoPicker.inst.pokemon.name} into...</div>
            <div className="evo-picker-options">
              {evoPicker.targets.map((target) => (
                <button key={target.id} className="evo-picker-option" onClick={() => doEvolve(evoPicker.inst, target)}>
                  <img src={target.sprite} alt={target.name} />
                  <span>{target.name}</span>
                </button>
              ))}
            </div>
            <button className="evo-picker-cancel" onClick={() => setEvoPicker(null)}>Cancel</button>
          </div>
        </div>
      )}

      {evolving && (
        <div className="evolve-overlay">
          <div className="evolve-animation">
            <div className="evolve-from">
              <img src={evolving.from.pokemon.sprite} alt={evolving.from.pokemon.name} />
              <div>{evolving.from.pokemon.name}</div>
            </div>
            <div className="evolve-arrow">→</div>
            <div className="evolve-to">
              <img src={evolving.to.sprite} alt={evolving.to.name} />
              <div>{evolving.to.name}</div>
            </div>
          </div>
          <div className="evolve-text">Evolving!</div>
        </div>
      )}

      {sharding && (
        <div className="shard-overlay" onClick={(e) => e.target === e.currentTarget && setSharding(null)}>
          <div className="shard-content">
            <img className="shard-sprite" src={sharding.pokemon.sprite} alt={sharding.pokemon.name} />
            <div className="shard-title">Shard {sharding.pokemon.name}?</div>
            <div className="shard-desc">
              This will destroy the Pokémon and give you a <strong>{sharding.pokemon.name} Token</strong>.
            </div>
            <div className="shard-buttons">
              <button className="shard-confirm" onClick={confirmShard}>🔮 Shard</button>
              <button className="shard-cancel" onClick={() => setSharding(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
