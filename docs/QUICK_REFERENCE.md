# Pokémon Party - Quick Reference Guide

## 🎯 Project at a Glance

| Aspect | Details |
|--------|---------|
| **Stack** | React 18 + Express + Socket.IO + SQLite |
| **Language** | TypeScript |
| **Battle Types** | AI (HTTP) + PvP (WebSocket) |
| **ELO System** | K=32, starting 1000 |
| **Team Size** | 3 Pokémon per battle |
| **Economy** | Essence currency + items (TMs, tokens, boosts) |

## 🎮 Two Battle Modes

### AI Battle (`/battle-demo`)
```
Team Selection (3 Pokémon) 
  ↓
HTTP POST /pokemonparty/api/battle/simulate
  ↓
Server simulates battle
  ↓
BattleScene renders (2000ms turns)
  ↓
Essence reward if win ✓
```

**Key Files:**
- Client: `client/src/pages/BattleDemo.tsx`
- Endpoint: `POST /pokemonparty/api/battle/simulate`

### PvP Battle (`/battle`)
```
Challenge Phase (enter opponent name)
  ↓
Mutual Challenge (both must challenge each other)
  ↓
Team Selection Phase (both pick 3)
  ↓
Server Simulates Battle (source of truth)
  ↓
Flipped Snapshots (each sees self as "left")
  ↓
Essence + ELO Update ✓
```

**Key Files:**
- Client: `client/src/pages/BattleMultiplayer.tsx`
- Server: Socket.IO events in `server/src/index.ts`

## 📡 Socket.IO Events

**Client → Server:**
```typescript
socket.emit('player:identify', playerName)
socket.emit('battle:challenge', targetName)
socket.emit('battle:cancel')
socket.emit('battle:selectTeam', { battleId, team: number[] })
```

**Server → Client:**
```typescript
io.emit('battle:matched', { battleId, opponent })
io.emit('battle:waiting', { target })
io.emit('battle:challenged', { challenger })
io.emit('battle:start', { battleId, player1, player2, snapshot })
io.emit('battle:waitingForOpponent')
io.emit('battle:eloUpdate', { winnerName, loserName, winnerNewElo, ... })
```

## 🏠 Homepage (MenuScreen)

**Route:** `/play` (after login)

**Shows:**
- Player name, Essence, ELO rating, Collection size
- Buttons to: Collection, Store, Items, Pokedex, Trade, Battle, Battle Demo

**Conditional:**
- Trade button: requires ≥1 Pokémon
- Battle buttons: require ≥3 Pokémon

## 🔀 Routing

```
/                      → LoginScreen
/play                  → MenuScreen (HOMEPAGE)
/collection            → CollectionScreen
/pokemon/:idx          → PokemonDetailScreen
/pokedex               → PokedexScreen
/store                 → StoreScreen
/items                 → ItemsScreen
/trade                 → TradeScreen
/battle                → BattleMultiplayer (PvP)
/battle-demo           → BattleDemo (AI)
/tv                    → TVView (public, no login)
```

## 💾 Shared Types Location

**All in `/home/luigifusco/projects/pokemonparty/shared/`:**

| File | Contains |
|------|----------|
| `battle-types.ts` | BattleSnapshot, BattleLogEntry, BattlePokemonState, EloUpdate |
| `types.ts` | Pokemon, PokemonInstance, OwnedItem, BoxTier, NatureName |
| `essence.ts` | Essence reward calculation (BASE=20 + tier_values) |
| `elo.ts` | ELO calculation (K=32) |
| `pokemon-data.ts` | All Pokémon species, POKEMON_BY_ID map |
| `natures.ts` | Nature definitions and stat modifiers |
| `move-data.ts` | Move information |
| `type-chart.ts` | Type effectiveness |

## 🎲 Battle Simulation

**Server function:** `simulateBattleFromIds(leftIds: number[], rightIds: number[])`

**Process:**
1. Load Pokémon species
2. Create damage-calc instances
3. Initialize battle states (left/right teams)
4. Run up to 50 rounds:
   - Check for winner (one side = 0 HP)
   - Sort by speed
   - Each Pokémon attacks with random move
   - Calculate damage via damage-calc
   - Track type effectiveness
   - Handle weather (Rain Dance/Sunny Day = 5 turns)
5. Determine winner
6. Return BattleSnapshot with full log

**Key:** Server is source of truth for PvP

## 📊 Battle Snapshot Structure

```typescript
interface BattleSnapshot {
  left: BattlePokemonState[];         // Team 1
  right: BattlePokemonState[];        // Team 2
  log: BattleLogEntry[];              // Move log
  winner: 'left' | 'right' | null;    // Result
  round: number;                       // Turns taken
}
```

## 🗂️ Database Tables

| Table | Purpose |
|-------|---------|
| `players` | User accounts (id, name, essence, elo) |
| `owned_pokemon` | Player's Pokémon (nature, IVs, TM moves) |
| `battles` | Battle history (winner/loser, ELO deltas) |
| `battle_pokemon_usage` | Stats (times_used per player) |
| `owned_items` | Inventory (TMs, tokens, boosts) |
| `trades` | Trade history |

## 🎁 Item Types

| Type | Purpose | Data Field |
|------|---------|------------|
| `tm` | Teach move to Pokémon | Move name |
| `token` | Shard/currency for evolution | Pokémon ID |
| `boost` | Maximize one IV stat | Stat key (hp, atk, def, spa, spd, spe) |

## 🌟 Pokémon Tiers

```typescript
type BoxTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Essence rewards (sum for team):
common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 200
// Plus base 20 = total reward
```

## ⚡ ELO System

```typescript
STARTING_ELO = 1000
K_FACTOR = 32

winnerDelta = round(32 * (1 - expectedWinner))
loserDelta = round(32 * (0 - expectedLoser))
```

Expected win rate calculated via standard Elo formula.

## 🔑 Key Files to Understand

1. **Homepage:** `client/src/pages/MenuScreen.tsx`
2. **AI Battle:** `client/src/pages/BattleDemo.tsx` + `POST /api/battle/simulate`
3. **PvP Battle:** `client/src/pages/BattleMultiplayer.tsx` + Socket.IO in `server/src/index.ts`
4. **Types:** `shared/battle-types.ts`, `shared/types.ts`
5. **Router:** `client/src/App.tsx`
6. **Server:** `server/src/index.ts` (REST + WebSocket)

## 🚀 Battle Flow Comparison

| Phase | AI | PvP |
|-------|----|----|
| **1** | Team select (player only) | Challenge (mutual required) |
| **2** | Random opponent generated | Team select (both) |
| **3** | HTTP request to server | Wait for opponent team |
| **4** | Server simulates | Server simulates |
| **5** | Return snapshot | Flipped snapshots to each |
| **6** | Essence reward | Essence + ELO update |
| **7** | "New Battle" button | "Back to Menu" button |

## 🎨 UI Components

- **BattleScene.tsx** - Renders battle animation and log
- **PokemonCard.tsx** - Pokémon display with HP bar
- **BattleAnimationEngine.ts** - Move animations
- **BattleSounds.ts** - Audio effects and background music

## 📍 Important Constants

```typescript
BATTLE_LEVEL = 50                    // Pokémon combat level
ZERO_EVS = { hp: 0, atk: 0, ... }  // No EV investment
STARTING_ESSENCE = 30                // Initial currency
STARTING_ELO = 1000                  // Initial rating
K_FACTOR = 32                        // ELO sensitivity
BATTLE_BASE_ESSENCE = 20             // Base reward
MAX_ROUNDS = 50                      // Battle timeout
TEAM_SIZE = 3                        // Pokémon per team
```

## 🎯 What's NOT Implemented

- No explicit `BattleMode` enum (routes determine mode)
- No level scaling (all battles at level 50)
- No held items or abilities
- No stat stage changes mid-battle
- No draw conditions (tie goes to higher total HP)
- No spectator mode code (TV view is placeholder)

