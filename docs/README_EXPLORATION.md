# Pokémon Party Project - Complete Exploration Documentation

## 📑 Documentation Index

This folder contains comprehensive documentation of the Pokémon Party project exploration. Choose the file based on your needs:

### 1. **QUICK_REFERENCE.md** ⭐ START HERE
**Best for:** Quick lookups, key facts, comparison tables
- 2-3 minute read
- Battle mode comparison
- Socket.IO events reference
- Important constants
- File locations
- What's NOT implemented

### 2. **POKEMONPARTY_EXPLORATION.md** 📚 COMPREHENSIVE
**Best for:** Understanding the full architecture
- 10 detailed sections covering everything
- Project structure explanation
- Client/server separation
- Battle flow diagrams
- Database schema
- 697 lines of detailed analysis

### 3. **POKEMONPARTY_KEY_FILES.md** 💻 SOURCE CODE
**Best for:** Reviewing actual implementation code
- Full source for MenuScreen (homepage)
- Complete BattleDemo.tsx (AI battle)
- Complete BattleMultiplayer.tsx (PvP battle)
- Routing configuration
- Shared type definitions
- Server battle logic excerpts
- 836 lines of code with annotations

### 4. **POKEMONPARTY_SUMMARY.txt** 📋 TECHNICAL DETAILS
**Best for:** Deep technical dive with tables and lists
- ASCII-art structured format
- Technology stack overview
- File locations and purposes
- Battle simulation steps
- Database schema details
- Socket.IO event reference

### 5. **README_EXPLORATION.md** (this file) 📍 ORIENTATION
**Best for:** Getting oriented and choosing next steps

---

## 🎯 What You'll Learn

### Architecture
- **Stack:** React 18 + Express + Socket.IO + SQLite
- **Language:** TypeScript throughout
- **Pattern:** Monorepo with client, server, shared packages

### Two Battle Modes
| Mode | Type | Matching | Ranking | Reward |
|------|------|----------|---------|--------|
| **AI** | Solo | N/A | No ELO | Essence only |
| **PvP** | Multiplayer | Mutual challenge | ELO rated | Essence + ELO |

### Key Concepts
1. **Team Selection** - Always 3 Pokémon per side
2. **Battle Simulation** - Server is source of truth
3. **Matching System** - Mutual challenge required for PvP
4. **Rewards** - Essence (20 base + tier values) + ELO (K=32)
5. **Architecture** - REST for static, WebSocket for real-time

---

## 📂 Quick File Navigation

### You Requested...

**"Show me the homepage component"**
→ See: `POKEMONPARTY_KEY_FILES.md` → Section 1 (MenuScreen.tsx)

**"How does team selection work?"**
→ See: `POKEMONPARTY_KEY_FILES.md` → Sections 3-4 (BattleDemo & BattleMultiplayer)

**"What battle modes exist?"**
→ See: `QUICK_REFERENCE.md` → "Two Battle Modes" section

**"Show me the types"**
→ See: `POKEMONPARTY_KEY_FILES.md` → Sections 5-6 (battle-types.ts & types.ts)

**"How's the server handling battles?"**
→ See: `POKEMONPARTY_EXPLORATION.md` → Section 8 (Server Battle Logic)

**"What's the database structure?"**
→ See: `POKEMONPARTY_SUMMARY.txt` → "Database Schema" section

**"Compare AI vs PvP mode"**
→ See: `QUICK_REFERENCE.md` → "Battle Flow Comparison" table

---

## 🔑 Key Findings

### Homepage Structure
- Route: `/play` (after login)
- Shows: Player name, Essence balance, ELO rating, Collection size
- Buttons: Collection, Store, Items, Pokedex, Trade, Battle, Battle Demo
- Conditional buttons based on collection size (need ≥3 for battle)

### AI Battle Flow
1. Select 3 Pokémon from your collection
2. Random opponent generated (3 Pokémon from all available)
3. HTTP POST to `/pokemonparty/api/battle/simulate`
4. Server simulates battle
5. BattleScene renders with 2000ms turn delay
6. Essence reward if you win
7. "New Battle" button to try again

### PvP Battle Flow
1. Enter opponent's name (or select from recents)
2. Wait for them to challenge you back (mutual match required)
3. Both select 3 Pokémon from their collections
4. Server simulates battle (both see same result, flipped perspective)
5. Essence + ELO reward if you win
6. "Back to Menu" button

### No Battle Mode Enum
- Routes determine mode: `/battle` = PvP, `/battle-demo` = AI
- Could add explicit `enum BattleMode { AI, PVP, SPECTATOR }`
- Currently implicit rather than explicit

### Shared Types Location
All in `shared/`:
- `battle-types.ts` - BattleSnapshot, EloUpdate
- `types.ts` - Pokemon, PokemonInstance, OwnedItem
- `essence.ts` - Reward calculations
- `elo.ts` - ELO system
- Pokemon data files

---

## 📖 Reading Suggestions

### First Time? Start Here
1. Read: QUICK_REFERENCE.md (5 mins)
2. Look at: POKEMONPARTY_KEY_FILES.md → Section 1 (MenuScreen)
3. Understand: Two battle modes comparison in QUICK_REFERENCE.md

### Want to Modify Battle Logic?
1. Study: POKEMONPARTY_EXPLORATION.md → Section 5 (Battle flows)
2. Review: POKEMONPARTY_KEY_FILES.md → Sections 3-4 (Components)
3. Check: POKEMONPARTY_SUMMARY.txt → Battle simulation section

### Need Type Definitions?
1. Look at: POKEMONPARTY_KEY_FILES.md → Sections 5-6
2. Reference: POKEMONPARTY_EXPLORATION.md → Section 6 (Shared directory)

### Building a Similar Feature?
1. Start: QUICK_REFERENCE.md → Socket.IO events
2. Study: POKEMONPARTY_KEY_FILES.md → Server logic
3. Compare: Both battle mode implementations

---

## 💡 Key Insights

### Architecture Decisions
- **Server-side simulation** - Prevents cheating, ensures fair play
- **WebSocket for PvP** - Real-time matching and team selection
- **HTTP for AI** - Simple request-response, stateless
- **Flipped snapshots** - Each player sees themselves as "left"
- **Mutual challenge** - Prevents unsolicited battles

### Scaling Considerations
- Battle matching uses in-memory Maps (not persistent)
- No matchmaking algorithm (direct name-based)
- ELO system works at any player count
- Essence rewards fixed per tier (no dynamic scaling)

### What's Missing
- No explicit BattleMode type/enum
- No spectator implementation (TVView exists but no code)
- No level scaling (all battles at level 50)
- No abilities or held items
- No stat stage changes
- No draw conditions (higher HP wins ties)

---

## 🚀 Next Steps

### To Understand More
- [ ] Read QUICK_REFERENCE.md (5 mins)
- [ ] Review MenuScreen.tsx in KEY_FILES.md (10 mins)
- [ ] Compare BattleDemo vs BattleMultiplayer (15 mins)
- [ ] Study server Socket.IO handlers (20 mins)

### To Make Changes
- [ ] Identify what you want to change
- [ ] Find relevant section in EXPLORATION.md
- [ ] Locate code in KEY_FILES.md or full repo
- [ ] Review before making modifications

### To Learn More
- [ ] Check linked files in documentation
- [ ] Look at `/home/luigifusco/projects/pokemonparty/`
- [ ] Review damage-calc integration
- [ ] Study Socket.IO/Express patterns used

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Documentation files | 4 |
| Total documentation | ~2,100 lines |
| Source code shown | 6 complete files + excerpts |
| Sections analyzed | 10 major areas |
| Database tables | 6 main tables |
| Socket.IO events | 6 documented |
| HTTP endpoints | 13 endpoints |
| Routes | 11 main routes |

---

## ✅ Checklist: What Was Covered

- [x] Overall project structure
- [x] Client directory organization
- [x] Homepage component (MenuScreen.tsx)
- [x] Battle setup flow (both AI and PvP)
- [x] Versus mode detailed explanation
- [x] AI mode detailed explanation
- [x] Shared types and constants
- [x] Battle type definitions
- [x] Routing configuration
- [x] Server-side battle logic
- [x] Room creation mechanism
- [x] Database schema
- [x] Socket.IO events
- [x] REST endpoints
- [x] Code comparisons (AI vs PvP)
- [x] Essence rewards system
- [x] ELO rating system

---

**Generated:** March 8, 2024
**Project Location:** `/home/luigifusco/projects/pokemonparty/`
**Documentation Location:** `/home/luigifusco/`

---
