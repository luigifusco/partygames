import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PokemonInstance, BoxTier } from '@shared/types';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import PokemonCard from '../components/PokemonCard';
import './CollectionScreen.css';

const TIERS: (BoxTier | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'legendary'];

interface CollectionScreenProps {
  collection: PokemonInstance[];
  onEvolve: (pokemonId: number) => void;
}

export default function CollectionScreen({ collection, onEvolve }: CollectionScreenProps) {
  const navigate = useNavigate();
  const [evolving, setEvolving] = useState<{ from: PokemonInstance; to: any } | null>(null);
  const [filter, setFilter] = useState<BoxTier | 'all'>('all');

  // Count duplicates for evolution, but show each pokemon individually
  const counts = new Map<number, number>();
  for (const inst of collection) {
    counts.set(inst.pokemon.id, (counts.get(inst.pokemon.id) ?? 0) + 1);
  }
  const filtered = collection
    .filter((inst) => filter === 'all' || inst.pokemon.tier === filter)
    .sort((a, b) => a.pokemon.id - b.pokemon.id);
  // Track which pokemon ids have already shown the evolve button
  const evolveShown = new Set<number>();

  const handleEvolve = (inst: PokemonInstance) => {
    if (!inst.pokemon.evolutionTo) return;
    const evolved = POKEMON_BY_ID[inst.pokemon.evolutionTo];
    if (!evolved) return;

    setEvolving({ from: inst, to: evolved });
    setTimeout(() => {
      onEvolve(inst.pokemon.id);
      setTimeout(() => setEvolving(null), 1200);
    }, 1500);
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
            const count = counts.get(inst.pokemon.id) ?? 1;
            const showEvolve = count >= 4 && inst.pokemon.evolutionTo !== undefined && POKEMON_BY_ID[inst.pokemon.evolutionTo] && !evolveShown.has(inst.pokemon.id);
            if (showEvolve) evolveShown.add(inst.pokemon.id);
            return (
              <PokemonCard
                key={inst.instanceId}
                pokemon={inst.pokemon}
                onClick={() => navigate(`/pokemon/${getCollectionIndex(inst)}`)}
              >
                {showEvolve && (
                  <button className="collection-evolve-btn" onClick={(e) => { e.stopPropagation(); handleEvolve(inst); }}>
                    ✨ Evolve
                  </button>
                )}
              </PokemonCard>
            );
          })}
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
    </div>
  );
}
