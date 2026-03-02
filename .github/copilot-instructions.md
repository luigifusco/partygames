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
