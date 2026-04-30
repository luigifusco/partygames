import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PokemonInstance, Pokemon, BoxTier, OwnedItem } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import { getHeldItemSprite, getHeldItemName } from '@shared/held-item-data';
import { evolveGate } from '@shared/evolution';
import { evolutionStepFor } from '@shared/evolution-helpers';
import { BOND_UNLOCK_CHAPTER } from '@shared/story-data';
import PokemonCard from '../components/PokemonCard';
import ShardConfirmModal from '../components/ShardConfirmModal';
import { useStoryChapters } from '../hooks/useStoryChapters';
import './CollectionScreen.css';

const TIERS: (BoxTier | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
const COLLECTION_STATE_KEY = 'pp:collectionState';

type CollectionStoredState = Partial<{ filter: BoxTier | 'all'; nameQuery: string; scrollTop: number }>;

interface CollectionScreenProps {
  collection: PokemonInstance[];
  items: OwnedItem[];
  onEvolve: (instance: PokemonInstance, targetId: number) => void;
  onShard: (instance: PokemonInstance) => void;
  playerId?: string;
  onRefresh?: () => void | Promise<void>;
}

function getEvoTargets(pokemon: Pokemon): Pokemon[] {
  if (!pokemon.evolutionTo) return [];
  return pokemon.evolutionTo
    .map((id) => POKEMON_BY_ID[id])
    .filter(Boolean);
}

function readCollectionState(): CollectionStoredState {
  const raw = sessionStorage.getItem(COLLECTION_STATE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CollectionStoredState;
  } catch (error) {
    console.warn('Could not restore collection state', error);
    return {};
  }
}

export default function CollectionScreen({ collection, items, onShard, playerId, onRefresh }: CollectionScreenProps) {
  const navigate = useNavigate();
  const chapters = useStoryChapters(playerId);
  const bondUnlocked = chapters.has(BOND_UNLOCK_CHAPTER);
  const gridRef = useRef<HTMLDivElement>(null);
  const restoredScrollRef = useRef(false);

  // Ensure the collection reflects any bond-XP / evolution changes that
  // happened during the preceding battle. If a socket event was missed
  // (tab backgrounded, race with navigation, etc.) this gives a reliable
  // second chance to catch up from the server.
  useEffect(() => {
    if (onRefresh) void onRefresh();
    // Intentionally only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filter, setFilter] = useState<BoxTier | 'all'>(() => {
    const saved = readCollectionState();
    return saved.filter && TIERS.includes(saved.filter) ? saved.filter : 'all';
  });
  const [nameQuery, setNameQuery] = useState(() => {
    const saved = readCollectionState();
    return typeof saved.nameQuery === 'string' ? saved.nameQuery : '';
  });
  const [shardMode, setShardMode] = useState(false);
  const [shardSelected, setShardSelected] = useState<Set<string>>(new Set());
  const [shardPreview, setShardPreview] = useState<PokemonInstance[] | null>(null);

  const normalizedQuery = nameQuery.trim().toLowerCase();
  const matchesQuery = (inst: PokemonInstance) => {
    if (normalizedQuery === '') return true;
    const q = normalizedQuery;
    if (inst.pokemon.name.toLowerCase().includes(q)) return true;
    if ((inst.ability ?? '').toLowerCase().includes(q)) return true;
    if ((inst.nature ?? '').toLowerCase().includes(q)) return true;
    const moves = getEffectiveMoves(inst);
    return moves.some((m) => m.toLowerCase().includes(q));
  };
  const filtered = collection
    .filter((inst) => filter === 'all' || inst.pokemon.tier === filter)
    .filter(matchesQuery)
    .sort((a, b) => {
      const aFav = a.favorite ? 0 : 1;
      const bFav = b.favorite ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.pokemon.id - b.pokemon.id;
    });

  const saveCollectionState = (next?: CollectionStoredState) => {
    const state = {
      filter,
      nameQuery,
      scrollTop: gridRef.current?.scrollTop ?? 0,
      ...next,
    };
    sessionStorage.setItem(COLLECTION_STATE_KEY, JSON.stringify(state));
  };

  useEffect(() => {
    saveCollectionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, nameQuery]);

  useLayoutEffect(() => {
    if (restoredScrollRef.current || !gridRef.current) return;
    restoredScrollRef.current = true;
    const saved = readCollectionState();
    if (typeof saved.scrollTop === 'number') {
      gridRef.current.scrollTop = saved.scrollTop;
    }
  }, [filtered.length]);

  // Evolution is triggered from the Pokemon detail screen — clicking a
  // ready-to-evolve card just navigates there via the normal onClick.


  const toggleShardSelect = (inst: PokemonInstance) => {
    setShardSelected((prev) => {
      const next = new Set(prev);
      if (next.has(inst.instanceId)) next.delete(inst.instanceId);
      else next.add(inst.instanceId);
      return next;
    });
  };

  const confirmBulkShard = () => {
    const toShard = collection.filter((c) => shardSelected.has(c.instanceId));
    if (toShard.length === 0) return;
    setShardPreview(toShard);
  };

  const doBulkShard = () => {
    if (!shardPreview) return;
    for (const inst of shardPreview) onShard(inst);
    setShardPreview(null);
    setShardSelected(new Set());
    setShardMode(false);
  };

  const exitShardMode = () => {
    setShardSelected(new Set());
    setShardMode(false);
  };

  // Find the index in the original collection for navigation
  const getCollectionIndex = (inst: PokemonInstance) =>
    collection.findIndex((c) => c.instanceId === inst.instanceId);

  return (
    <div className="collection-screen">
      <div className="collection-header">
        <button className="collection-back" onClick={() => shardMode ? exitShardMode() : navigate('/play')}>
          {shardMode ? 'Cancel' : '← Back'}
        </button>
        <h2>{shardMode ? `Shard (${shardSelected.size} selected)` : `My Pokémon (${collection.length})`}</h2>
        {!shardMode && (
          <button className="collection-shard-mode-btn" onClick={() => setShardMode(true)}>Shard</button>
        )}
        {shardMode && shardSelected.size > 0 && (
          <button className="collection-shard-confirm-btn" onClick={confirmBulkShard}>
            Shard {shardSelected.size}
          </button>
        )}
      </div>
      <div className="collection-search-row">
        <span className="collection-search-icon" aria-hidden>🔍</span>
        <input
          type="search"
          className="collection-search-input"
          placeholder="Search name, move, ability, nature…"
          value={nameQuery}
          onChange={(e) => {
            const next = e.target.value;
            setNameQuery(next);
            saveCollectionState({ nameQuery: next, scrollTop: 0 });
            if (gridRef.current) gridRef.current.scrollTop = 0;
          }}
          aria-label="Search Pokémon by name"
        />
        {nameQuery && (
          <button
            type="button"
            className="collection-search-clear"
            onClick={() => {
              setNameQuery('');
              saveCollectionState({ nameQuery: '', scrollTop: 0 });
              if (gridRef.current) gridRef.current.scrollTop = 0;
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <div className="collection-filters">
        {TIERS.map((tier) => (
          <button
            key={tier}
            className={`collection-filter-btn ${filter === tier ? 'active' : ''}`}
            onClick={() => {
              setFilter(tier);
              saveCollectionState({ filter: tier, scrollTop: 0 });
              if (gridRef.current) gridRef.current.scrollTop = 0;
            }}
          >
            {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="collection-empty">
          {collection.length === 0 ? 'No Pokémon yet — visit the shop!' : 'No Pokémon match your search or filters.'}
        </div>
      ) : (
        <div
          className="collection-grid"
          ref={gridRef}
          onScroll={() => saveCollectionState()}
        >
          {filtered.map((inst) => {
            const targets = getEvoTargets(inst.pokemon);
            const firstTarget = targets[0];
            const gate = firstTarget
              ? evolveGate({ bondXp: inst.bondXp ?? 0, tokens: 0, targetTier: firstTarget.tier, step: evolutionStepFor(inst.pokemon) ?? undefined })
              : null;
            const canEvolve = !!gate && gate.canEvolve && targets.length > 0;
            const bondXp = inst.bondXp ?? 0;
            const bondPct = gate ? Math.min(100, Math.round((bondXp / gate.bondNeeded) * 100)) : 0;
            const isShardSelected = shardSelected.has(inst.instanceId);
            return (
              <PokemonCard
                key={inst.instanceId}
                pokemon={inst.pokemon}
                instance={inst}
                onClick={() => {
                  if (shardMode) toggleShardSelect(inst);
                  else {
                    saveCollectionState();
                    navigate(`/pokemon/${getCollectionIndex(inst)}`);
                  }
                }}
                className={`${shardMode && isShardSelected ? 'shard-selected' : ''} ${inst.favorite ? 'favorite' : ''} ${!shardMode && canEvolve ? 'ready-to-evolve' : ''}`}
              >
                {inst.favorite && <div className="collection-favorite-badge" title="Favorite">★</div>}
                {shardMode && isShardSelected && (
                  <div className="shard-check">✓</div>
                )}
                {!shardMode && inst.heldItem && (
                  <div
                    className="collection-held-item"
                    title={getHeldItemName(inst.heldItem)}
                    aria-label={getHeldItemName(inst.heldItem)}
                  >
                    <img src={getHeldItemSprite(inst.heldItem)} alt="" />
                  </div>
                )}
                {!shardMode && canEvolve && (
                  <div className="collection-evolve-pill">EVOLVE</div>
                )}
                {!shardMode && bondUnlocked && gate && targets.length > 0 && !canEvolve && (
                  <div className="collection-bond-bar" title={`Bond ${bondXp}/${gate.bondNeeded}`}>
                    <div className="collection-bond-fill" style={{ width: `${bondPct}%` }} />
                    <span className="collection-bond-text">{bondXp}/{gate.bondNeeded}</span>
                  </div>
                )}
              </PokemonCard>
            );
          })}
        </div>
      )}

      {shardPreview && (
        <ShardConfirmModal
          instances={shardPreview}
          onCancel={() => setShardPreview(null)}
          onConfirm={doBulkShard}
        />
      )}
    </div>
  );
}
