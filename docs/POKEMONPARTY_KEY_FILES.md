# Key Files - Full Content

## 1. HOMEPAGE COMPONENT (MenuScreen.tsx)

**Location:** `/home/luigifusco/projects/pokemonparty/client/src/pages/MenuScreen.tsx`

```typescript
import { useNavigate } from 'react-router-dom';
import './MenuScreen.css';

interface MenuScreenProps {
  playerName: string;
  essence: number;
  elo: number;
  collectionSize: number;
  itemCount: number;
}

export default function MenuScreen({ playerName, essence, elo, collectionSize, itemCount }: MenuScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="menu-screen">
      <h1>⚡ Pokémon Party</h1>
      <div className="menu-player">Trainer: {playerName}</div>
      <div className="menu-essence">✦ {essence} Essence</div>
      <div className="menu-player">⚡ {elo} Elo</div>
      <div className="menu-player">Collection: {collectionSize} Pokémon</div>
      <div className="menu-buttons">
        <button className="menu-btn" onClick={() => navigate('/collection')}>
          🎒 My Pokémon
        </button>
        <button className="menu-btn" onClick={() => navigate('/store')}>
          🎁 Expansion Shop
        </button>
        <button className="menu-btn" onClick={() => navigate('/items')}>
          💿 Items ({itemCount})
        </button>
        <button className="menu-btn" onClick={() => navigate('/pokedex')}>
          📖 All Pokémon
        </button>
        {collectionSize >= 1 && (
          <button className="menu-btn" onClick={() => navigate('/trade')}>
            🔄 Trade
          </button>
        )}
        {collectionSize >= 3 && (
          <>
            <button className="menu-btn" onClick={() => navigate('/battle')}>
              ⚔️ Battle
            </button>
            <button className="menu-btn" onClick={() => navigate('/battle-demo')}>
              🤖 Battle Demo (vs AI)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 2. ROUTING CONFIGURATION (App.tsx - relevant portions)

**Location:** `/home/luigifusco/projects/pokemonparty/client/src/App.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import MenuScreen from './pages/MenuScreen';
import PokedexScreen from './pages/PokedexScreen';
import CollectionScreen from './pages/CollectionScreen';
import PokemonDetailScreen from './pages/PokemonDetailScreen';
import StoreScreen from './pages/StoreScreen';
import ItemsScreen from './pages/ItemsScreen';
import BattleDemo from './pages/BattleDemo';
import BattleMultiplayer from './pages/BattleMultiplayer';
import TradeScreen from './pages/TradeScreen';
import TVView from './pages/TVView';
import { socket } from './socket';
import { syncEssence, addPokemonToServer, removePokemonFromServer, addItemsToServer, removeItemsFromServer, evolvePokemonOnServer, teachTMOnServer, useBoostOnServer, buildInstance, buildItem } from './api';
import { STARTING_ESSENCE } from '@shared/essence';
import { STARTING_ELO } from '@shared/elo';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import { MAX_IV } from '@shared/boost-data';
import type { StatKey } from '@shared/boost-data';
import type { PokemonInstance, OwnedItem, MoveId } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';

interface PlayerState {
  id: string;
  name: string;
}

export default function App() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [essence, setEssence] = useState(0);
  const [elo, setElo] = useState(STARTING_ELO);
  const [collection, setCollection] = useState<PokemonInstance[]>([]);
  const [items, setItems] = useState<OwnedItem[]>([]);

  // ... state management functions ...

  const handleLogin = (playerData: { id: string; name: string; essence: number; elo: number }, pokemonRows: any[], itemRows: any[]) => {
    setPlayer({ id: playerData.id, name: playerData.name });
    setEssence(playerData.essence);
    setElo(playerData.elo ?? STARTING_ELO);
    setCollection(pokemonRows.map(buildInstance).filter(Boolean) as PokemonInstance[]);
    setItems((itemRows ?? []).map(buildItem));
    socket.connect();
    socket.emit('player:identify', playerData.name);
  };

  // TV view is always accessible without login
  if (!player) {
    return (
      <Routes>
        <Route path="/tv" element={<TVView />} />
        <Route path="*" element={<LoginScreen onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/play" element={<MenuScreen playerName={player.name} essence={essence} elo={elo} collectionSize={collection.length} itemCount={items.length} />} />
      <Route path="/collection" element={<CollectionScreen collection={collection} items={items} onEvolve={evolvePokemon} onShard={shardPokemon} />} />
      <Route path="/pokemon/:idx" element={<PokemonDetailScreen collection={collection} />} />
      <Route path="/pokedex" element={<PokedexScreen />} />
      <Route path="/store" element={<StoreScreen essence={essence} onSpendEssence={spendEssence} onAddPokemon={addPokemon} onAddItems={addItems} />} />
      <Route path="/items" element={<ItemsScreen items={items} collection={collection} onTeachTM={teachTM} onUseBoost={useBoost} />} />
      <Route path="/trade" element={<TradeScreen playerName={player.name} collection={collection} onTrade={handleTrade} />} />
      <Route path="/battle" element={<BattleMultiplayer playerName={player.name} collection={collection} essence={essence} onGainEssence={gainEssence} onEloUpdate={(newElo) => setElo(newElo)} />} />
      <Route path="/battle-demo" element={<BattleDemo essence={essence} onGainEssence={gainEssence} />} />
      <Route path="/tv" element={<TVView />} />
      <Route path="*" element={<Navigate to="/play" replace />} />
    </Routes>
  );
}
```

---

## 3. BATTLE SETUP - AI BATTLE (BattleDemo.tsx - full file)

**Location:** `/home/luigifusco/projects/pokemonparty/client/src/pages/BattleDemo.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BattleScene from '../components/BattleScene';
import type { BattleSnapshot } from '@shared/battle-types';
import { POKEMON } from '@shared/pokemon-data';
import { calculateBattleEssence } from '@shared/essence';
import type { Pokemon } from '@shared/types';
import './BattleDemo.css';
import './BattleMultiplayer.css';

const API_BASE = '/pokemonparty';

function pickRandomTeam(exclude: number[]): Pokemon[] {
  const available = POKEMON.filter((p) => !exclude.includes(p.id));
  const team: Pokemon[] = [];
  while (team.length < 3 && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    team.push(available.splice(idx, 1)[0]);
  }
  return team;
}

interface BattleDemoProps {
  essence: number;
  onGainEssence: (amount: number) => void;
}

export default function BattleDemo({ essence, onGainEssence }: BattleDemoProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Pokemon[]>([]);
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>([]);
  const [rewarded, setRewarded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (snapshot) {
    const essenceGained = calculateBattleEssence(opponentTeam);
    // Award essence once when battle finishes with a win
    if (snapshot.winner === 'left' && !rewarded) {
      onGainEssence(essenceGained);
      setRewarded(true);
    }
    return (
      <div className="battle-demo-wrapper">
        <BattleScene snapshot={snapshot} turnDelayMs={2000} essenceGained={essenceGained} />
        <button className="battle-demo-back" onClick={() => { setSnapshot(null); setSelected([]); setOpponentTeam([]); setRewarded(false); }}>
          ← New Battle
        </button>
      </div>
    );
  }

  const toggle = (p: Pokemon) => {
    if (selected.find((s) => s.id === p.id)) {
      setSelected(selected.filter((s) => s.id !== p.id));
    } else if (selected.length < 3) {
      setSelected([...selected, p]);
    }
  };

  const startBattle = async () => {
    const opponent = pickRandomTeam(selected.map((p) => p.id));
    setOpponentTeam(opponent);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/battle/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leftTeam: selected.map((p) => p.id),
          rightTeam: opponent.map((p) => p.id),
        }),
      });
      const data = await res.json();
      setSnapshot(data.snapshot);
    } catch (err) {
      console.error('Battle simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...POKEMON].sort((a, b) => a.id - b.id);

  return (
    <div className="battle-mp-screen">
      <div className="battle-mp-team-header">
        <button className="battle-mp-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>Pick Your Team ({selected.length}/3)</h2>
        {selected.length === 3 && (
          <button className="team-select-go" onClick={startBattle} disabled={loading}>
            {loading ? '⏳ Simulating...' : '⚔️ Battle!'}
          </button>
        )}
      </div>
      <div className="team-select-chosen">
        {selected.map((p) => (
          <div key={p.id} className="team-select-chosen-card" onClick={() => toggle(p)}>
            <img src={p.sprite} alt={p.name} />
            <span>{p.name}</span>
          </div>
        ))}
        {Array.from({ length: 3 - selected.length }).map((_, i) => (
          <div key={`empty-${i}`} className="team-select-chosen-card empty">?</div>
        ))}
      </div>
      <div className="team-select-scroll">
        <div className="team-select-grid">
          {sorted.map((p) => {
            const isSelected = !!selected.find((s) => s.id === p.id);
            return (
              <div
                key={p.id}
                className={`team-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggle(p)}
              >
                <img src={p.sprite} alt={p.name} />
                <div className="team-select-card-name">{p.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## 4. BATTLE SETUP - PVP BATTLE (BattleMultiplayer.tsx - full file)

**Location:** `/home/luigifusco/projects/pokemonparty/client/src/pages/BattleMultiplayer.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import BattleScene from '../components/BattleScene';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import { calculateBattleEssence } from '@shared/essence';
import { getRecentTrainers, addRecentTrainer } from '../recentTrainers';
import type { PokemonInstance } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';
import type { BattleSnapshot, EloUpdate } from '@shared/battle-types';
import './BattleMultiplayer.css';
import '../pages/BattleDemo.css';

type Phase = 'challenge' | 'waiting' | 'teamSelect' | 'waitingTeam' | 'battle';

interface BattleMultiplayerProps {
  playerName: string;
  collection: PokemonInstance[];
  essence: number;
  onGainEssence: (amount: number) => void;
  onEloUpdate: (newElo: number) => void;
}

export default function BattleMultiplayer({ playerName, collection, essence, onGainEssence, onEloUpdate }: BattleMultiplayerProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('challenge');
  const [targetName, setTargetName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [battleId, setBattleId] = useState('');
  const [challengers, setChallengers] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]); // indices into collection
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const [opponentTeamIds, setOpponentTeamIds] = useState<number[]>([]);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      socket.emit('player:identify', playerName);
    };

    if (socket.connected) {
      socket.emit('player:identify', playerName);
    }
    socket.on('connect', onConnect);

    const onMatched = ({ battleId, opponent }: { battleId: string; opponent: string }) => {
      setBattleId(battleId);
      setOpponentName(opponent);
      addRecentTrainer(playerName, opponent);
      setPhase('teamSelect');
    };

    const onWaiting = () => {
      setPhase('waiting');
    };

    const onChallenged = ({ challenger }: { challenger: string }) => {
      setChallengers((prev) => prev.includes(challenger) ? prev : [...prev, challenger]);
    };

    const onBattleStart = (data: { battleId: string; player1: string; player2: string; player1Team: number[]; player2Team: number[]; snapshot: BattleSnapshot }) => {
      const isPlayer1 = data.player1 === playerName;
      const theirTeam = isPlayer1 ? data.player2Team : data.player1Team;
      setOpponentTeamIds(theirTeam);

      setSnapshot(data.snapshot);
      setBattleId(data.battleId);
      setPhase('battle');
    };

    const onWaitingForOpponent = () => {
      setPhase('waitingTeam');
    };

    const handleEloUpdate = (update: EloUpdate) => {
      const myNewElo = update.winnerName === playerName ? update.winnerNewElo : update.loserNewElo;
      onEloUpdate(myNewElo);
    };

    socket.on('battle:matched', onMatched);
    socket.on('battle:waiting', onWaiting);
    socket.on('battle:challenged', onChallenged);
    socket.on('battle:start', onBattleStart);
    socket.on('battle:waitingForOpponent', onWaitingForOpponent);
    socket.on('battle:eloUpdate', handleEloUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('battle:matched', onMatched);
      socket.off('battle:waiting', onWaiting);
      socket.off('battle:challenged', onChallenged);
      socket.off('battle:start', onBattleStart);
      socket.off('battle:waitingForOpponent', onWaitingForOpponent);
      socket.off('battle:eloUpdate', handleEloUpdate);
    };
  }, [playerName, opponentName]);

  const handleChallenge = () => {
    if (!targetName.trim()) return;
    socket.emit('battle:challenge', targetName.trim());
  };

  const handleCancel = () => {
    socket.emit('battle:cancel');
    setPhase('challenge');
  };

  const togglePokemon = (idx: number) => {
    if (selected.includes(idx)) {
      setSelected(selected.filter((i) => i !== idx));
    } else if (selected.length < 3) {
      setSelected([...selected, idx]);
    }
  };

  const submitTeam = () => {
    socket.emit('battle:selectTeam', {
      battleId,
      team: selected.map((idx) => collection[idx].pokemon.id),
    });
    setPhase('waitingTeam');
  };

  // Battle phase
  if (phase === 'battle' && snapshot) {
    const opponentPokemon = opponentTeamIds.map((id) => POKEMON_BY_ID[id]).filter(Boolean);
    const essenceGained = calculateBattleEssence(opponentPokemon);

    if (snapshot.winner === 'left' && !rewarded) {
      onGainEssence(essenceGained);
      setRewarded(true);
    }

    return (
      <div className="battle-demo-wrapper">
        <BattleScene snapshot={snapshot} turnDelayMs={2000} essenceGained={essenceGained} />
        <button className="battle-demo-back" onClick={() => navigate('/play')}>
          ← Back to Menu
        </button>
      </div>
    );
  }

  // Team selection phase
  if (phase === 'teamSelect' || phase === 'waitingTeam') {
    // Build sorted indices
    const indices = collection.map((_, i) => i).sort((a, b) => collection[a].pokemon.id - collection[b].pokemon.id);

    return (
      <div className="battle-mp-screen">
        <div className="battle-mp-team-header">
          <button className="battle-mp-back" onClick={() => navigate('/play')}>← Back</button>
          <h2>Pick Your Team ({selected.length}/3)</h2>
          <div className="opponent-name">vs {opponentName}</div>
        </div>
        {phase === 'waitingTeam' && (
          <div className="battle-mp-team-status">Waiting for opponent's team...</div>
        )}
        {phase === 'teamSelect' && (
          <>
            <div className="team-select-chosen" style={{ padding: '4px 8px' }}>
              {selected.map((idx) => {
                const p = collection[idx].pokemon;
                return (
                  <div key={idx} className="team-select-chosen-card" onClick={() => togglePokemon(idx)}>
                    <img src={p.sprite} alt={p.name} />
                    <span>{p.name}</span>
                  </div>
                );
              })}
              {Array.from({ length: 3 - selected.length }).map((_, i) => (
                <div key={`empty-${i}`} className="team-select-chosen-card empty">?</div>
              ))}
            </div>
            {selected.length === 3 && (
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <button className="team-select-go" onClick={submitTeam}>⚔️ Lock In!</button>
              </div>
            )}
          </>
        )}
        <div className="team-select-scroll">
          <div className="team-select-grid">
            {indices.map((idx) => {
              const inst = collection[idx];
              const p = inst.pokemon;
              const moves = getEffectiveMoves(inst);
              const isSelected = selected.includes(idx);
              return (
                <div
                  key={idx}
                  className={`team-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => phase === 'teamSelect' && togglePokemon(idx)}
                >
                  <img src={p.sprite} alt={p.name} />
                  <div className="team-select-card-name">{p.name}</div>
                  <div className="team-select-card-info">
                    <div className="team-select-card-nature">{inst.nature}</div>
                    <div className="team-select-card-moves">
                      {moves.map((m, i) => (
                        <span key={i} className="team-select-card-move">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Challenge phase
  return (
    <div className="battle-mp-screen">
      <div className="battle-mp-header">
        <button className="battle-mp-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>⚔️ Battle</h2>
      </div>
      <div className="battle-mp-content">
        {challengers.length > 0 && (
          <div className="battle-mp-challenged">
            ⚡ Challenged by: {challengers.join(', ')}
          </div>
        )}

        {phase === 'challenge' && (
          <>
            {getRecentTrainers(playerName).length > 0 && (
              <div className="recent-trainers">
                {getRecentTrainers(playerName).map((name) => (
                  <button key={name} className="recent-trainer-btn" onClick={() => setTargetName(name)}>
                    {name}
                  </button>
                ))}
              </div>
            )}
            <input
              className="battle-mp-input"
              type="text"
              placeholder="Opponent's name"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChallenge()}
              maxLength={20}
            />
            <button
              className="battle-mp-btn"
              onClick={handleChallenge}
              disabled={!targetName.trim()}
            >
              ⚔️ Challenge!
            </button>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <div className="battle-mp-status waiting">
              Waiting for {targetName} to challenge you back...
            </div>
            <button className="battle-mp-btn" onClick={handleCancel}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 5. SHARED BATTLE TYPES (battle-types.ts)

**Location:** `/home/luigifusco/projects/pokemonparty/shared/battle-types.ts`

```typescript
// Shared battle types used by both client and server

export interface BattlePokemonState {
  instanceId: string;
  name: string;
  sprite: string;
  types: string[];
  currentHp: number;
  maxHp: number;
  side: 'left' | 'right';
}

export interface BattleLogEntry {
  round: number;
  attackerInstanceId: string;
  attackerName: string;
  moveName: string;
  targetInstanceId: string;
  targetName: string;
  damage: number;
  effectiveness: 'super' | 'neutral' | 'not-very' | 'immune' | null;
  targetFainted: boolean;
  message: string;
  weather?: 'rain' | 'sun' | 'clear';
}

export interface BattleSnapshot {
  left: BattlePokemonState[];
  right: BattlePokemonState[];
  log: BattleLogEntry[];
  winner: 'left' | 'right' | null;
  round: number;
}

export interface EloUpdate {
  winnerName: string;
  loserName: string;
  winnerNewElo: number;
  loserNewElo: number;
  winnerDelta: number;
  loserDelta: number;
}
```

---

## 6. SHARED TYPES (types.ts - relevant portions)

**Location:** `/home/luigifusco/projects/pokemonparty/shared/types.ts`

```typescript
// Shared types for the Pokémon party game

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: Stats;
  moves: [MoveId, MoveId];
  evolutionFrom?: number;
  evolutionTo?: number[];
  tier: BoxTier;
  sprite: string;
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface IVs {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export type NatureName =
  | 'Hardy' | 'Lonely' | 'Brave' | 'Adamant' | 'Naughty'
  | 'Bold' | 'Docile' | 'Relaxed' | 'Impish' | 'Lax'
  | 'Timid' | 'Hasty' | 'Serious' | 'Jolly' | 'Naive'
  | 'Modest' | 'Mild' | 'Quiet' | 'Bashful' | 'Rash'
  | 'Calm' | 'Gentle' | 'Sassy' | 'Careful' | 'Quirky';

export interface PokemonInstance {
  instanceId: string;
  pokemon: Pokemon;
  ivs: IVs;
  nature: NatureName;
  learnedMoves?: [MoveId, MoveId];
}

// Returns the effective moves for a pokemon instance (learned overrides species defaults)
export function getEffectiveMoves(inst: PokemonInstance): [MoveId, MoveId] {
  return inst.learnedMoves ?? inst.pokemon.moves;
}

export type MoveId = string;
export type BoxTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

// Items
export type ItemType = 'tm' | 'token' | 'boost';

export interface OwnedItem {
  id: string;
  itemType: ItemType;
  itemData: string; // move name for TMs, pokemon ID (as string) for tokens, stat key for boosts
}
```

---

## 7. SERVER BATTLE LOGIC (index.ts - relevant portions)

**Location:** `/home/luigifusco/projects/pokemonparty/server/src/index.ts` (lines 504-662)

### Battle Simulation Endpoint:
```typescript
// AI / demo battle endpoint
app.post('/pokemonparty/api/battle/simulate', (req, res) => {
  const { leftTeam, rightTeam } = req.body;
  if (!Array.isArray(leftTeam) || !Array.isArray(rightTeam)) {
    return res.status(400).json({ error: 'leftTeam and rightTeam must be arrays of pokemon IDs' });
  }
  const snapshot = simulateBattleFromIds(leftTeam, rightTeam);
  return res.json({ snapshot });
});
```

### Socket.IO Battle Events:
```typescript
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  let playerName: string | null = null;

  socket.on('player:identify', (name: string) => {
    playerName = name;
    connectedPlayers.set(name, socket.id);
    console.log(`Player identified: ${name}`);
  });

  socket.on('battle:challenge', (targetName: string) => {
    if (!playerName) return;
    pendingChallenges.set(playerName, targetName);
    console.log(`${playerName} challenges ${targetName}`);

    // Check if there's a mutual challenge
    const otherChallenge = pendingChallenges.get(targetName);
    if (otherChallenge === playerName) {
      // Match found!
      pendingChallenges.delete(playerName);
      pendingChallenges.delete(targetName);

      const battleId = uuidv4();
      const battle: ActiveBattle = {
        id: battleId,
        player1: playerName,
        player2: targetName,
        player1Team: null,
        player2Team: null,
      };
      activeBattles.set(battleId, battle);

      // Notify both players
      const socket1 = connectedPlayers.get(playerName);
      const socket2 = connectedPlayers.get(targetName);
      if (socket1) io.to(socket1).emit('battle:matched', { battleId, opponent: targetName });
      if (socket2) io.to(socket2).emit('battle:matched', { battleId, opponent: playerName });
      console.log(`Battle matched: ${playerName} vs ${targetName} (${battleId})`);
    } else {
      // Notify challenger they're waiting
      socket.emit('battle:waiting', { target: targetName });
      // Notify target they've been challenged
      const targetSocket = connectedPlayers.get(targetName);
      if (targetSocket) io.to(targetSocket).emit('battle:challenged', { challenger: playerName });
    }
  });

  socket.on('battle:cancel', () => {
    if (!playerName) return;
    pendingChallenges.delete(playerName);
    socket.emit('battle:cancelled');
  });

  socket.on('battle:selectTeam', ({ battleId, team }: { battleId: string; team: number[] }) => {
    if (!playerName) return;
    const battle = activeBattles.get(battleId);
    if (!battle) return;

    if (battle.player1 === playerName) battle.player1Team = team;
    else if (battle.player2 === playerName) battle.player2Team = team;

    // Check if both teams are selected
    if (battle.player1Team && battle.player2Team) {
      const socket1 = connectedPlayers.get(battle.player1);
      const socket2 = connectedPlayers.get(battle.player2);

      // Simulate battle on server so both players see the same result
      const snapshot = simulateBattleFromIds(battle.player1Team, battle.player2Team);

      const battleDataP1 = {
        battleId,
        player1: battle.player1,
        player2: battle.player2,
        player1Team: battle.player1Team,
        player2Team: battle.player2Team,
        snapshot,
      };
      const battleDataP2 = {
        battleId,
        player1: battle.player1,
        player2: battle.player2,
        player1Team: battle.player1Team,
        player2Team: battle.player2Team,
        snapshot: flipSnapshot(snapshot),
      };

      if (socket1) io.to(socket1).emit('battle:start', battleDataP1);
      if (socket2) io.to(socket2).emit('battle:start', battleDataP2);
      console.log(`Battle starting: ${battle.player1} vs ${battle.player2}`);

      // Report result immediately from server simulation
      const winnerName = snapshot.winner === 'left' ? battle.player1 : battle.player2;
      const loserName = snapshot.winner === 'left' ? battle.player2 : battle.player1;

      const winnerRow = db.prepare('SELECT id, elo FROM players WHERE name = ?').get(winnerName) as any;
      const loserRow = db.prepare('SELECT id, elo FROM players WHERE name = ?').get(loserName) as any;
      if (winnerRow && loserRow) {
        const { winnerNewElo, loserNewElo, winnerDelta, loserDelta } = calculateEloChanges(winnerRow.elo, loserRow.elo);
        db.prepare('UPDATE players SET elo = ? WHERE id = ?').run(winnerNewElo, winnerRow.id);
        db.prepare('UPDATE players SET elo = ? WHERE id = ?').run(loserNewElo, loserRow.id);

        const eloUpdate = { winnerName, loserName, winnerNewElo, loserNewElo, winnerDelta, loserDelta };
        if (socket1) io.to(socket1).emit('battle:eloUpdate', eloUpdate);
        if (socket2) io.to(socket2).emit('battle:eloUpdate', eloUpdate);

        const p1Row = snapshot.winner === 'left' ? winnerRow : loserRow;
        const p2Row = snapshot.winner === 'left' ? loserRow : winnerRow;
        const recordUsage = db.prepare(
          'INSERT INTO battle_pokemon_usage (player_id, pokemon_id, times_used) VALUES (?, ?, 1) ON CONFLICT(player_id, pokemon_id) DO UPDATE SET times_used = times_used + 1'
        );
        for (const pid of battle.player1Team) recordUsage.run(p1Row.id, pid);
        for (const pid of battle.player2Team) recordUsage.run(p2Row.id, pid);

        console.log(`Elo update: ${winnerName} ${winnerRow.elo}→${winnerNewElo} (+${winnerDelta}), ${loserName} ${loserRow.elo}→${loserNewElo} (${loserDelta})`);
      }

      activeBattles.delete(battleId);
    } else {
      socket.emit('battle:waitingForOpponent');
    }
  });
});
```

