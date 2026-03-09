# Pokémon Party Project - Comprehensive Exploration

## 1. OVERALL PROJECT STRUCTURE

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + React Router v6
- **Backend:** Express.js + Socket.IO + SQLite (better-sqlite3) + Node.js
- **Build:** TypeScript (both client/server)
- **Architecture:** Monorepo with 3 main packages:
  - `client/` - React web application
  - `server/` - Express + Socket.IO server
  - `shared/` - Shared TypeScript types and constants
  - Additional: `damage-calc/`, `pokemon-showdown/`, `data/`, `assets-public/`

**Directory Structure:**
```
pokemonparty/
├── client/                 # React SPA
│   ├── src/
│   │   ├── pages/         # Screen components
│   │   ├── components/    # Reusable components (BattleScene, etc)
│   │   ├── App.tsx        # Main router
│   │   ├── api.ts         # HTTP client calls
│   │   └── socket.ts      # Socket.IO client setup
│   └── package.json
├── server/                 # Express + Socket.IO
│   ├── src/
│   │   ├── index.ts       # Main server + all endpoints + Socket.IO handlers
│   │   └── db.ts          # SQLite database schema & initialization
│   └── package.json
├── shared/                 # Shared constants & types
│   ├── battle-types.ts
│   ├── types.ts
│   ├── essence.ts
│   ├── elo.ts
│   └── (other data files)
└── package.json
```

---

## 2. CLIENT DIRECTORY STRUCTURE

### Pages/Screens (`client/src/pages/`):
- **MenuScreen.tsx** - Homepage/main menu
- **LoginScreen.tsx** - Authentication
- **BattleMultiplayer.tsx** - PvP battle flow (challenge, team selection, battle)
- **BattleDemo.tsx** - AI battle mode (team selection, simulation)
- **CollectionScreen.tsx** - View/manage Pokémon collection
- **PokemonDetailScreen.tsx** - Individual Pokémon details
- **PokedexScreen.tsx** - Browse all Pokémon
- **StoreScreen.tsx** - Buy boxes to get Pokémon
- **ItemsScreen.tsx** - TM teaching and boost usage
- **TradeScreen.tsx** - Trade Pokémon with other players
- **TVView.tsx** - Public view (no login required)

### Components (`client/src/components/`):
- **BattleScene.tsx** - Renders battle with animations and log
- **BattleAnimationEngine.ts** - Move animation logic
- **BattleSounds.ts** - Audio effects and background music
- **PokemonCard.tsx** - Pokémon card display
- **PokemonIcon.tsx** - Pokémon icon display

### Core Files:
- **App.tsx** - Main router configuration
- **api.ts** - HTTP client for REST endpoints
- **socket.ts** - Socket.IO client initialization
- **recentTrainers.ts** - Local storage for recently battled trainers

### Routing (`App.tsx`):
```
Routes:
  /play             → MenuScreen (homepage)
  /collection       → CollectionScreen
  /pokemon/:idx     → PokemonDetailScreen
  /pokedex          → PokedexScreen
  /store            → StoreScreen
  /items            → ItemsScreen
  /trade            → TradeScreen
  /battle           → BattleMultiplayer (PvP)
  /battle-demo      → BattleDemo (vs AI)
  /tv               → TVView (public, no login)
  *                 → LoginScreen (redirect to /play if logged in)
```

---

## 3. HOMEPAGE STRUCTURE

**File:** `/home/luigifusco/projects/pokemonparty/client/src/pages/MenuScreen.tsx`

**Content & Navigation:**
```
┌─────────────────────────────────────────┐
│          ⚡ Pokémon Party              │
│                                         │
│  Trainer: {playerName}                 │
│  ✦ {essence} Essence                   │
│  ⚡ {elo} Elo                           │
│  Collection: {collectionSize} Pokémon  │
│                                         │
│  Buttons (always visible):              │
│  ├─ 🎒 My Pokémon    → /collection     │
│  ├─ 🎁 Expansion Shop → /store         │
│  ├─ 💿 Items (N)      → /items         │
│  ├─ 📖 All Pokémon    → /pokedex       │
│  │                                     │
│  ├─ (if collectionSize >= 1)           │
│  │  🔄 Trade           → /trade        │
│  │                                     │
│  └─ (if collectionSize >= 3)           │
│     ⚔️ Battle           → /battle       │
│     🤖 Battle Demo (vs AI) → /battle   │
└─────────────────────────────────────────┘
```

**Props Interface:**
```typescript
interface MenuScreenProps {
  playerName: string;
  essence: number;
  elo: number;
  collectionSize: number;
  itemCount: number;
}
```

**Features:**
- Player info display (name, essence, elo rating, collection size)
- Conditional buttons:
  - Trade: requires ≥1 Pokémon
  - Battle/Battle Demo: requires ≥3 Pokémon
- Navigation to all major game modes

---

## 4. BATTLE SETUP & TEAM SELECTION

### AI Battle Mode (Battle Demo)
**File:** `/home/luigifusco/projects/pokemonparty/client/src/pages/BattleDemo.tsx`

**Flow:**
1. **Team Selection Phase**
   - Player selects exactly 3 Pokémon from their collection
   - Shows grid of available Pokémon (sorted by ID)
   - Highlights selected Pokémon
   - Shows selected team in a separate row

2. **Battle Initialization**
   - Opponent team randomly generated (picks 3 from all Pokémon, excluding player's choices)
   - HTTP POST to `/pokemonparty/api/battle/simulate` with team IDs
   ```typescript
   {
     leftTeam: number[],    // Player's team (3 IDs)
     rightTeam: number[]    // AI opponent (3 IDs)
   }
   ```

3. **Battle Display**
   - Displays BattleScene component with snapshot
   - Shows essence gained on victory (once per battle)
   - Turn delay: 2000ms between moves

**Team Selection UI:**
```
┌─────────────────────────────────┐
│ ← Back  Pick Your Team (N/3)    │
│ (selected header area)          │
│ [Poke1] [Poke2] [?]             │
│ ─────────────────────────────   │
│ ⚔️ Battle! (enabled at 3/3)     │
│                                 │
│ (scrollable grid of all Pokémon)│
│ [Poke] [Poke] [Poke] ...       │
└─────────────────────────────────┘
```

### PvP Battle Mode (Multiplayer)
**File:** `/home/luigifusco/projects/pokemonparty/client/src/pages/BattleMultiplayer.tsx`

**Flow (3 phases):**

1. **Challenge Phase**
   - Player enters opponent's name
   - Shows recent opponents as quick-select buttons
   - Emits `battle:challenge` socket event
   - Waits for mutual challenge or displays "Challenged by" list

2. **Team Selection Phase**
   - Once both players challenge each other → "matched" event
   - Both enter team selection screen (same UI as BattleDemo)
   - Selects exactly 3 Pokémon
   - Emits `battle:selectTeam` socket event with battleId and team IDs
   - Waits for opponent's team selection

3. **Battle Display Phase**
   - Once both teams selected → `battle:start` event
   - Server simulates battle, sends snapshot
   - Displays BattleScene
   - Updates Elo rating via `battle:eloUpdate` event

**Socket Events (Client → Server):**
- `battle:challenge` - Challenge a player
- `battle:cancel` - Cancel pending challenge
- `battle:selectTeam` - Submit team selection
  ```typescript
  { battleId: string, team: number[] }
  ```

**Socket Events (Server → Client):**
- `battle:matched` - Both challenged each other
- `battle:waiting` - Waiting for opponent response
- `battle:challenged` - Being challenged by someone
- `battle:start` - Battle starting (includes snapshot)
- `battle:waitingForOpponent` - Opponent hasn't selected team yet
- `battle:eloUpdate` - Elo changes after battle

**Phase State Management:**
```typescript
type Phase = 'challenge' | 'waiting' | 'teamSelect' | 'waitingTeam' | 'battle';
```

**Team Toggle Logic:**
```typescript
const togglePokemon = (idx: number) => {
  if (selected.includes(idx)) {
    setSelected(selected.filter((i) => i !== idx));
  } else if (selected.length < 3) {
    setSelected([...selected, idx]);
  }
};
```

---

## 5. VERSUS & AI BATTLE MODE HANDLING

### Two Battle Types:

#### A. **AI Battle Mode** (`/battle-demo`)
```
MenuScreen → (if collectionSize >= 3) → BattleDemo.tsx
    ↓
Team Selection (3 Pokémon from player's collection)
    ↓
Random opponent generated (3 from all Pokémon except player's)
    ↓
HTTP POST /pokemonparty/api/battle/simulate
    ↓
Server simulates battle, returns BattleSnapshot
    ↓
BattleScene renders battle with turnDelayMs=2000
    ↓
Victory/loss → Essence reward (if win)
    ↓
"← New Battle" button to start over
```

#### B. **PvP Versus Mode** (`/battle`)
```
MenuScreen → (if collectionSize >= 3) → BattleMultiplayer.tsx
    ↓
Challenge Phase:
  - Enter opponent name or select from recent trainers
  - Emit battle:challenge event
  - Wait for mutual challenge (other player challenges back)
    ↓
Team Selection Phase (triggered by battle:matched):
  - Both players select 3 Pokémon
  - Each emits battle:selectTeam with their team
    ↓
Server Side (when both teams received):
  - Simulate battle on server (server is source of truth)
  - Create two flipped snapshots (each player sees themselves as "left")
  - Determine winner, update Elo ratings
  - Emit battle:start with snapshot to both players
    ↓
Battle Display Phase:
  - BattleScene renders the battle
  - turnDelayMs=2000
    ↓
Battle End:
  - Update local Elo via battle:eloUpdate event
  - Track essence gains
  - "← Back to Menu" button
```

### Key Differences:
| Aspect | AI Battle | PvP Battle |
|--------|-----------|-----------|
| Opponent | Random team from all Pokémon | Real player (mutual challenge) |
| Team Selection | Player only | Both players |
| Simulation | Client-side (via HTTP) | Server-side (Socket.IO) |
| Essence | Always award on win | Award on win (calculated from opponent's team tier) |
| Elo | Not tracked | Tracked via battle:eloUpdate |
| Result Fairness | Each local run might differ | Both see same battle (server truth) |

---

## 6. SHARED DIRECTORY

**Location:** `/home/luigifusco/projects/pokemonparty/shared/`

### Key Files:

#### **battle-types.ts**
```typescript
// Battle state representation
interface BattlePokemonState {
  instanceId: string;
  name: string;
  sprite: string;
  types: string[];
  currentHp: number;
  maxHp: number;
  side: 'left' | 'right';
}

interface BattleLogEntry {
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

interface BattleSnapshot {
  left: BattlePokemonState[];
  right: BattlePokemonState[];
  log: BattleLogEntry[];
  winner: 'left' | 'right' | null;
  round: number;
}

interface EloUpdate {
  winnerName: string;
  loserName: string;
  winnerNewElo: number;
  loserNewElo: number;
  winnerDelta: number;
  loserDelta: number;
}
```

#### **types.ts**
```typescript
// Core game types
interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: Stats;
  moves: [MoveId, MoveId];  // 2 default moves
  evolutionFrom?: number;
  evolutionTo?: number[];
  tier: BoxTier;
  sprite: string;
}

interface PokemonInstance {
  instanceId: string;
  pokemon: Pokemon;
  ivs: IVs;
  nature: NatureName;
  learnedMoves?: [MoveId, MoveId];  // Overrides pokemon.moves if present
}

interface OwnedItem {
  id: string;
  itemType: ItemType;  // 'tm' | 'token' | 'boost'
  itemData: string;     // move name for TMs, pokemon ID for tokens, stat key for boosts
}

type BoxTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type MoveId = string;
type ItemType = 'tm' | 'token' | 'boost';
```

#### **essence.ts**
```typescript
// Battle rewards based on opponent tier
const TIER_STRENGTH: Record<BoxTier, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 200,
};

const BATTLE_BASE_ESSENCE = 20;

function calculateBattleEssence(opponentTeam: Pokemon[]): number {
  const teamStrength = opponentTeam.reduce(
    (sum, p) => sum + TIER_STRENGTH[p.tier], 0
  );
  return BATTLE_BASE_ESSENCE + teamStrength;
}
```

#### **elo.ts**
```typescript
export const STARTING_ELO = 1000;
const K_FACTOR = 32;

function calculateEloChanges(
  winnerElo: number,
  loserElo: number
): {
  winnerNewElo: number;
  loserNewElo: number;
  winnerDelta: number;
  loserDelta: number;
}
```

### Other Shared Files:
- `pokemon-data.ts` - Pokémon species data (POKEMON array, POKEMON_BY_ID map)
- `move-data.ts` - Move information
- `natures.ts` - Nature names and their stat modifiers
- `boost-data.ts` - IV boost constants (MAX_IV = 31)
- `type-chart.ts` - Type effectiveness
- `elo.ts` - ELO calculation
- `essence.ts` - Essence/currency calculations

---

## 7. BATTLE MODE TYPES/ENUMS

**No explicit "BattleMode" enum exists in the codebase.** Instead, modes are implicitly determined by route/component:

### Current Implementation:
```typescript
// Implicit modes (by route):
// '/battle'       = PvP Versus Mode
// '/battle-demo'  = AI Battle Mode
// '/tv'           = Spectator Mode (public broadcasts)

// Client-side phase states:
type Phase = 'challenge' | 'waiting' | 'teamSelect' | 'waitingTeam' | 'battle';

// Battle outcome determination:
type BattleOutcome = 'left' | 'right' | null;  // Snapshot.winner

// Types for type effectiveness:
type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

// Weather during battle:
type Weather = 'rain' | 'sun' | 'clear' | null;

// Effectiveness labels:
type Effectiveness = 'super' | 'neutral' | 'not-very' | 'immune' | null;
```

### No Explicit Enum, But Could Be Added:
```typescript
// Suggested future enum (not currently in code):
enum BattleMode {
  AI = 'ai',           // vs AI
  PVP = 'pvp',         // vs Player
  SPECTATOR = 'spectator', // TV view
}
```

---

## 8. SERVER-SIDE BATTLE & ROOM CREATION LOGIC

**File:** `/home/luigifusco/projects/pokemonparty/server/src/index.ts`

### Battle Simulation Function
```typescript
function simulateBattleFromIds(leftIds: number[], rightIds: number[]): BattleSnapshot {
  // 1. Load Pokemon from POKEMON_BY_ID
  // 2. Create damage-calc instances for HP/speed calculations
  // 3. Initialize BattlePokemonState for each (left & right teams)
  // 4. Run up to 50 rounds of battle:
  //    - Sort alive Pokémon by speed (via damage-calc rawStats)
  //    - Each attacks in speed order, picking random move from 2 available
  //    - Calculate damage via damage-calc library
  //    - Track type effectiveness and faints
  //    - Handle weather effects (Rain Dance, Sunny Day → 5 turn duration)
  // 5. Determine winner based on remaining HP
  // 6. Return BattleSnapshot with all battle log entries
}

function flipSnapshot(snapshot: BattleSnapshot): BattleSnapshot {
  // Swaps left/right sides so each player sees themselves as "left"
}
```

### Battle Matching & Room Management

**Data Structures:**
```typescript
const pendingChallenges = new Map<string, string>();  // challengerName → targetName
const connectedPlayers = new Map<string, string>();   // playerName → socketId
const activeBattles = new Map<string, ActiveBattle>();

interface ActiveBattle {
  id: string;
  player1: string;
  player2: string;
  player1Team: number[] | null;
  player2Team: number[] | null;
}
```

**Socket Event Handlers:**

1. **`player:identify`** - Register connected player
   ```typescript
   socket.on('player:identify', (name: string) => {
     playerName = name;
     connectedPlayers.set(name, socket.id);
   });
   ```

2. **`battle:challenge`** - Challenge a player
   ```typescript
   socket.on('battle:challenge', (targetName: string) => {
     pendingChallenges.set(playerName, targetName);
     
     // Check for mutual challenge
     if (pendingChallenges.get(targetName) === playerName) {
       // CREATE BATTLE ROOM
       const battleId = uuidv4();
       const battle: ActiveBattle = {
         id: battleId,
         player1: playerName,
         player2: targetName,
         player1Team: null,
         player2Team: null,
       };
       activeBattles.set(battleId, battle);
       
       // Notify both: emit 'battle:matched' with battleId & opponent name
     } else {
       // Emit 'battle:waiting' to challenger
       // Emit 'battle:challenged' to target
     }
   });
   ```

3. **`battle:selectTeam`** - Submit team & trigger battle simulation
   ```typescript
   socket.on('battle:selectTeam', ({ battleId, team }) => {
     const battle = activeBattles.get(battleId);
     
     if (player1: update battle.player1Team
     else if (player2): update battle.player2Team
     
     if (battle.player1Team && battle.player2Team) {
       // SIMULATE BATTLE ON SERVER
       const snapshot = simulateBattleFromIds(battle.player1Team, battle.player2Team);
       
       // Create flipped snapshot for player2 (they see themselves as "left")
       const snapshotP2 = flipSnapshot(snapshot);
       
       // Emit 'battle:start' to both with their respective snapshots
       io.to(socket1).emit('battle:start', { ..., snapshot });
       io.to(socket2).emit('battle:start', { ..., snapshot: snapshotP2 });
       
       // UPDATE ELO RATINGS
       const { winnerNewElo, loserNewElo, winnerDelta, loserDelta } 
         = calculateEloChanges(winnerRow.elo, loserRow.elo);
       
       db.prepare('UPDATE players SET elo = ? WHERE id = ?').run(...);
       
       // EMIT ELO UPDATE
       io.to(socket1).emit('battle:eloUpdate', { 
         winnerName, loserName, winnerNewElo, loserNewElo, ...
       });
       
       // RECORD BATTLE USAGE (for leaderboard/stats)
       recordUsage(player1Id, pokemon, timesUsed++);
       recordUsage(player2Id, pokemon, timesUsed++);
       
       activeBattles.delete(battleId);
     } else {
       // Emit 'battle:waitingForOpponent'
     }
   });
   ```

### REST API Endpoint

**POST `/pokemonparty/api/battle/simulate`** - AI battle simulation
```typescript
app.post('/pokemonparty/api/battle/simulate', (req, res) => {
  const { leftTeam, rightTeam } = req.body;
  const snapshot = simulateBattleFromIds(leftTeam, rightTeam);
  return res.json({ snapshot });
});
```

### Key Features:
- **Server as source of truth**: Battle simulation happens on server, not client
- **Mutual challenge required**: Both players must challenge each other
- **Flipped snapshots**: Each player sees battle from their perspective
- **Elo tracking**: Updated immediately after battle simulation
- **Usage tracking**: Records which Pokémon were used for stats/leaderboard
- **Room cleanup**: Battle room deleted after completion

---

## 9. DATABASE SCHEMA

**File:** `/home/luigifusco/projects/pokemonparty/server/src/db.ts`

**Tables:**

```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  essence INTEGER NOT NULL DEFAULT 0,
  elo INTEGER NOT NULL DEFAULT 1000,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE owned_pokemon (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id),
  pokemon_id INTEGER NOT NULL,
  nature TEXT NOT NULL DEFAULT 'Serious',
  iv_hp INTEGER NOT NULL DEFAULT 0,
  iv_atk INTEGER NOT NULL DEFAULT 0,
  iv_def INTEGER NOT NULL DEFAULT 0,
  iv_spa INTEGER NOT NULL DEFAULT 0,
  iv_spd INTEGER NOT NULL DEFAULT 0,
  iv_spe INTEGER NOT NULL DEFAULT 0,
  move_1 TEXT DEFAULT NULL,  -- TM-taught move slot 1
  move_2 TEXT DEFAULT NULL,  -- TM-taught move slot 2
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE battles (
  id TEXT PRIMARY KEY,
  winner_id TEXT REFERENCES players(id),
  loser_id TEXT REFERENCES players(id),
  essence_gained INTEGER NOT NULL,
  winner_elo_delta INTEGER NOT NULL DEFAULT 0,
  loser_elo_delta INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE battle_pokemon_usage (
  player_id TEXT NOT NULL REFERENCES players(id),
  pokemon_id INTEGER NOT NULL,
  times_used INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (player_id, pokemon_id)
);

CREATE TABLE owned_items (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id),
  item_type TEXT NOT NULL,  -- 'tm', 'token', 'boost'
  item_data TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trades (
  id TEXT PRIMARY KEY,
  player1_id TEXT REFERENCES players(id),
  player2_id TEXT REFERENCES players(id),
  pokemon1_id TEXT REFERENCES owned_pokemon(id),
  pokemon2_id TEXT REFERENCES owned_pokemon(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 10. SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Framework** | React 18 + Express.js + Socket.IO |
| **Language** | TypeScript |
| **Database** | SQLite (better-sqlite3) |
| **Routing** | React Router v6 (SPA) |
| **Communication** | REST API + WebSockets (Socket.IO) |
| **Battle Types** | AI (HTTP) + PvP (Socket.IO) |
| **Ranking** | Elo-based (K=32 factor) |
| **Economy** | Essence currency + Item economy |
| **Team Size** | 3 Pokémon per battle |
| **Simulation** | Damage-calc library (Gen 4) + custom weather/RNG |

