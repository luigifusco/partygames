# Pokémon Party

A real-time multiplayer Pokémon party game. Players collect Pokémon from expansion boxes, build teams, and battle each other in auto-chess style combat — all from their phones during a party, with a TV leaderboard view.

## Quick Start

```bash
# Clone with submodules (damage-calc is required)
git clone --recurse-submodules <repo-url>
cd pokemonparty

# Development (run client + server separately)
cd server && npm install && npm run dev &
cd client && npm install && npm run dev

# Production (single-container Docker)
docker build -t pokemonparty .
docker run -p 3001:3001 -v ./data:/app/data pokemonparty

# Production split targets (frontend static server + backend API/socket server)
docker build --target frontend -t pokemonparty-frontend .
docker build --target backend -t pokemonparty-backend .
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_PATH` | `pokemonparty` | URL prefix (e.g. `pokemonparty` → `/pokemonparty/`, empty → `/`) |
| `PORT` | `3001` | Server port |
| `API_TARGET` | `http://localhost:3001` | Client dev proxy target |

## Project Structure

```
├── client/          React + Vite frontend
│   └── src/
│       ├── config.ts        BASE_PATH config
│       ├── api.ts           REST API client
│       ├── socket.ts        Socket.IO client
│       ├── App.tsx          Routes & state
│       ├── pages/           Page components
│       └── components/      Battle scene, animations, icons
├── server/          Express + Socket.IO backend
│   └── src/
│       ├── index.ts         Routes, battle engine, Socket.IO events
│       └── db.ts            SQLite schema & migrations
├── shared/          TypeScript types & game data (used by both)
├── assets-public/   Static assets (sprites, backgrounds, FX)
├── damage-calc/     Smogon damage calculator (git submodule)
├── docker/          Production frontend server config
└── Dockerfile       Production multi-stage build (split + combined targets)
```

See [docs/](docs/) for architecture, game design, and API reference.
