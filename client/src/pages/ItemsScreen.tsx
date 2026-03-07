import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTMSprite, getMoveType } from '@shared/move-data';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import type { OwnedItem, PokemonInstance } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';
import PokemonIcon from '../components/PokemonIcon';
import './ItemsScreen.css';

interface ItemsScreenProps {
  items: OwnedItem[];
  collection: PokemonInstance[];
  onTeachTM: (instance: PokemonInstance, moveName: string, moveSlot: 0 | 1) => void;
}

interface TMGroup {
  moveName: string;
  count: number;
}

interface TokenGroup {
  pokemonId: number;
  pokemonName: string;
  count: number;
}

type TeachPhase =
  | { step: 'pickPokemon'; moveName: string }
  | { step: 'pickMove'; moveName: string; instance: PokemonInstance };

export default function ItemsScreen({ items, collection, onTeachTM }: ItemsScreenProps) {
  const navigate = useNavigate();
  const [teachPhase, setTeachPhase] = useState<TeachPhase | null>(null);

  // Group TMs by move name
  const tmGroups: TMGroup[] = [];
  const tmCounts = new Map<string, number>();
  for (const item of items) {
    if (item.itemType === 'tm') {
      tmCounts.set(item.itemData, (tmCounts.get(item.itemData) ?? 0) + 1);
    }
  }
  for (const [moveName, count] of [...tmCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    tmGroups.push({ moveName, count });
  }

  // Group Tokens by pokemon ID
  const tokenGroups: TokenGroup[] = [];
  const tokenCounts = new Map<number, number>();
  for (const item of items) {
    if (item.itemType === 'token') {
      const pid = Number(item.itemData);
      tokenCounts.set(pid, (tokenCounts.get(pid) ?? 0) + 1);
    }
  }
  for (const [pokemonId, count] of [...tokenCounts.entries()].sort((a, b) => a[0] - b[0])) {
    const pokemon = POKEMON_BY_ID[pokemonId];
    tokenGroups.push({ pokemonId, pokemonName: pokemon?.name ?? `#${pokemonId}`, count });
  }

  const hasItems = tmGroups.length > 0 || tokenGroups.length > 0;

  const handleUseTM = (moveName: string) => {
    setTeachPhase({ step: 'pickPokemon', moveName });
  };

  const handlePickPokemon = (inst: PokemonInstance) => {
    if (!teachPhase || teachPhase.step !== 'pickPokemon') return;
    setTeachPhase({ step: 'pickMove', moveName: teachPhase.moveName, instance: inst });
  };

  const handlePickMoveSlot = (slot: 0 | 1) => {
    if (!teachPhase || teachPhase.step !== 'pickMove') return;
    onTeachTM(teachPhase.instance, teachPhase.moveName, slot);
    setTeachPhase(null);
  };

  // Sorted collection for pokemon picker
  const sortedCollection = [...collection].sort((a, b) => a.pokemon.id - b.pokemon.id);

  return (
    <div className="items-screen">
      <div className="items-header">
        <button className="items-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>Items</h2>
        <div className="items-count">{items.length} total</div>
      </div>

      {!hasItems ? (
        <div className="items-empty">No items yet. Buy packs to get TMs!</div>
      ) : (
        <div className="items-scroll">
          {tokenGroups.length > 0 && (
            <>
              <div className="items-section-title">Tokens</div>
              <div className="items-grid">
                {tokenGroups.map(({ pokemonId, pokemonName, count }) => (
                  <div key={`token-${pokemonId}`} className="item-card token-card">
                    <div className="token-icon-wrapper">
                      <PokemonIcon pokemonId={pokemonId} />
                    </div>
                    {count > 1 && <div className="item-count">×{count}</div>}
                    <div className="item-name">{pokemonName}</div>
                    <div className="item-type token-badge">Token</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tmGroups.length > 0 && (
            <>
              <div className="items-section-title">TMs</div>
              <div className="items-grid">
                {tmGroups.map(({ moveName, count }) => {
                  const moveType = getMoveType(moveName);
                  return (
                    <div key={moveName} className={`item-card type-bg-${moveType} tm-usable`} onClick={() => handleUseTM(moveName)}>
                      <img
                        className="item-sprite"
                        src={getTMSprite(moveName)}
                        alt={`TM ${moveName}`}
                      />
                      {count > 1 && <div className="item-count">×{count}</div>}
                      <div className="item-name">{moveName}</div>
                      <div className={`item-type type-${moveType}`}>{moveType}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 1: Pick a pokemon to teach the TM to */}
      {teachPhase?.step === 'pickPokemon' && (
        <div className="teach-overlay" onClick={(e) => e.target === e.currentTarget && setTeachPhase(null)}>
          <div className="teach-content">
            <div className="teach-header">
              <span>Teach <strong>{teachPhase.moveName}</strong> to...</span>
              <button className="teach-close" onClick={() => setTeachPhase(null)}>✕</button>
            </div>
            {sortedCollection.length === 0 ? (
              <div className="teach-empty">No Pokémon in your collection</div>
            ) : (
              <div className="teach-pokemon-grid">
                {sortedCollection.map((inst) => (
                  <div key={inst.instanceId} className="teach-pokemon-card" onClick={() => handlePickPokemon(inst)}>
                    <img src={inst.pokemon.sprite} alt={inst.pokemon.name} />
                    <div className="teach-pokemon-name">{inst.pokemon.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Pick which move to replace */}
      {teachPhase?.step === 'pickMove' && (
        <div className="teach-overlay" onClick={(e) => e.target === e.currentTarget && setTeachPhase(null)}>
          <div className="teach-content teach-move-content">
            <div className="teach-header">
              <button className="teach-back" onClick={() => setTeachPhase({ step: 'pickPokemon', moveName: teachPhase.moveName })}>←</button>
              <span>Replace a move</span>
              <button className="teach-close" onClick={() => setTeachPhase(null)}>✕</button>
            </div>
            <div className="teach-pokemon-preview">
              <img src={teachPhase.instance.pokemon.sprite} alt={teachPhase.instance.pokemon.name} />
              <span>{teachPhase.instance.pokemon.name}</span>
            </div>
            <div className="teach-new-move">
              <img className="teach-tm-icon" src={getTMSprite(teachPhase.moveName)} alt="TM" />
              <span className={`teach-new-move-name type-${getMoveType(teachPhase.moveName)}`}>{teachPhase.moveName}</span>
            </div>
            <div className="teach-arrow">▼ replaces ▼</div>
            <div className="teach-move-slots">
              {getEffectiveMoves(teachPhase.instance).map((move, i) => {
                const moveType = getMoveType(move);
                return (
                  <button
                    key={i}
                    className={`teach-move-slot type-bg-${moveType}`}
                    onClick={() => handlePickMoveSlot(i as 0 | 1)}
                  >
                    <span className="teach-move-slot-name">{move}</span>
                    <span className={`teach-move-slot-type type-${moveType}`}>{moveType}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
