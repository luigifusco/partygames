import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pokemon, BoxTier } from '@shared/types';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import PokemonCard from '../components/PokemonCard';
import './CollectionScreen.css';

const TIERS: (BoxTier | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'legendary'];

interface CollectionScreenProps {
  collection: Pokemon[];
  onEvolve: (pokemonId: number) => void;
}

export default function CollectionScreen({ collection, onEvolve }: CollectionScreenProps) {
  const navigate = useNavigate();
  const [evolving, setEvolving] = useState<{ from: Pokemon; to: Pokemon } | null>(null);
  const [filter, setFilter] = useState<BoxTier | 'all'>('all');

  // Count duplicates for evolution, but show each pokemon individually
  const counts = new Map<number, number>();
  for (const p of collection) {
    counts.set(p.id, (counts.get(p.id) ?? 0) + 1);
  }
  const filtered = collection
    .filter((p) => filter === 'all' || p.tier === filter)
    .sort((a, b) => a.id - b.id);
  // Track which pokemon ids have already shown the evolve button
  const evolveShown = new Set<number>();

  const handleEvolve = (pokemon: Pokemon) => {
    if (!pokemon.evolutionTo) return;
    const evolved = POKEMON_BY_ID[pokemon.evolutionTo];
    if (!evolved) return;

    setEvolving({ from: pokemon, to: evolved });
    setTimeout(() => {
      onEvolve(pokemon.id);
      setTimeout(() => setEvolving(null), 1200);
    }, 1500);
  };

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
          {filtered.map((pokemon, idx) => {
            const count = counts.get(pokemon.id) ?? 1;
            const showEvolve = count >= 4 && pokemon.evolutionTo !== undefined && POKEMON_BY_ID[pokemon.evolutionTo] && !evolveShown.has(pokemon.id);
            if (showEvolve) evolveShown.add(pokemon.id);
            return (
              <PokemonCard key={`${pokemon.id}-${idx}`} pokemon={pokemon}>
                {showEvolve && (
                  <button className="collection-evolve-btn" onClick={() => handleEvolve(pokemon)}>
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
              <img src={evolving.from.sprite} alt={evolving.from.name} />
              <div>{evolving.from.name}</div>
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
