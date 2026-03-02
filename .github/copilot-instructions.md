# Copilot Instructions

## Project: Pokémon Party Game

A real-time multiplayer party game played on mobile phones with a TV leaderboard. Located in `pokemon/`.

## Running the App

The app has two processes that need to run simultaneously:

1. **Backend** (Express + Socket.IO, port 3001):
   ```
   cd pokemon/server && npm run dev
   ```

2. **Frontend** (Vite + React, port 5173):
   ```
   cd pokemon/client && npm run dev -- --host
   ```
   The `--host` flag is required to access from other devices on the network (phones, TV).

Access the app at `http://<machine-ip>:5173`:
- `/tv` — TV leaderboard (no login, auto-refreshes)
- `/` — Player mobile view (login by name)

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express + TypeScript (tsx)
- **Real-time:** Socket.IO
- **Database:** SQLite (better-sqlite3)
- **Shared code:** `pokemon/shared/` for types, game logic, and static data

## Type Checking

- Client: `cd pokemon/client && npx tsc --noEmit`
- Server has pre-existing rootDir issues with shared imports; uses `tsx` at runtime which handles them

## CSS Layout

- When combining CSS Grid (`display: grid`) with flex-based scrolling, **do not** put `flex: 1; min-height: 0; overflow-y: auto` directly on the grid element. Instead, wrap the grid in a separate scroll container:
  ```css
  .scroll-wrapper { flex: 1; min-height: 0; overflow-y: auto; }
  .grid { display: grid; grid-template-columns: ...; align-content: start; }
  ```
  Mixing flex overflow properties directly on a `display: grid` element causes items to squish instead of scrolling on some browsers/devices.

## Sprites

- Sprite images are 96×96 PNG files located in `pokemon/assets/`, symlinked from `pokemon/assets-public/assets/`
- **Each sprite has ~16px of transparent padding per side** built into the image file. The actual Pokémon artwork occupies roughly the center 64×64 area.
- When displaying sprites, account for this padding:
  - In grids (collection, pokédex, team select): use `width: 100%` to fill the card, or use oversized dimensions (e.g., 144px) with `overflow: hidden` on the container to crop the padding
  - For overlapping text on sprites, use `text-shadow: 0 0 4px #000, 0 0 4px #000` for readability
  - Always use `image-rendering: pixelated` since these are pixel art sprites
  - Avoid non-integer `transform: scale()` as it causes interpolation artifacts on pixel art
