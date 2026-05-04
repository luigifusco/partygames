import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { STARTING_ELO } from '../../shared/elo.js';
import { NATURES } from '../../shared/natures.js';
import { dataDirPath } from './paths.js';

export const DEFAULT_PARTY_ID = 'main';
export const DEFAULT_PARTY_SLUG = 'main';
export const DEFAULT_PARTY_NAME = 'Main Party';

export function initDb() {
  const dataDir = dataDirPath();
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, 'game.db');
  const db = new DatabaseSync(dbPath);

  db.exec('PRAGMA journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS parties (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
      name TEXT NOT NULL,
      essence INTEGER NOT NULL DEFAULT 0,
      elo INTEGER NOT NULL DEFAULT ${STARTING_ELO},
      picture TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (party_id, name)
    );

    CREATE TABLE IF NOT EXISTS owned_pokemon (
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS battles (
      id TEXT PRIMARY KEY,
      party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
      winner_id TEXT REFERENCES players(id),
      loser_id TEXT REFERENCES players(id),
      essence_gained INTEGER NOT NULL,
      winner_elo_delta INTEGER NOT NULL DEFAULT 0,
      loser_elo_delta INTEGER NOT NULL DEFAULT 0,
      field_size INTEGER NOT NULL DEFAULT 3,
      total_pokemon INTEGER NOT NULL DEFAULT 3,
      selection_mode TEXT NOT NULL DEFAULT 'blind',
      opponent_type TEXT NOT NULL DEFAULT 'pvp',
      rounds INTEGER NOT NULL DEFAULT 0,
      showdown_log TEXT,
      tournament_id TEXT,
      tournament_match_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
      player1_id TEXT REFERENCES players(id),
      player2_id TEXT REFERENCES players(id),
      pokemon1_id TEXT REFERENCES owned_pokemon(id),
      pokemon2_id TEXT REFERENCES owned_pokemon(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS battle_pokemon_usage (
      player_id TEXT NOT NULL REFERENCES players(id),
      pokemon_id INTEGER NOT NULL,
      times_used INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (player_id, pokemon_id)
    );

    CREATE TABLE IF NOT EXISTS battle_team_entries (
      battle_id TEXT NOT NULL REFERENCES battles(id),
      player_id TEXT NOT NULL REFERENCES players(id),
      pokemon_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS owned_items (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      item_type TEXT NOT NULL,
      item_data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.prepare('INSERT OR IGNORE INTO parties (id, slug, name) VALUES (?, ?, ?)')
    .run(DEFAULT_PARTY_ID, DEFAULT_PARTY_SLUG, DEFAULT_PARTY_NAME);

  // Add elo column if it doesn't exist (migration for existing DBs)
  const cols = db.prepare("PRAGMA table_info(players)").all() as any[];
  if (!cols.find((c: any) => c.name === 'elo')) {
    db.exec(`ALTER TABLE players ADD COLUMN elo INTEGER NOT NULL DEFAULT ${STARTING_ELO}`);
  }
  // Add picture column (base64 data URL, ~256x256 JPEG). Nullable for legacy rows.
  if (!cols.find((c: any) => c.name === 'picture')) {
    db.exec(`ALTER TABLE players ADD COLUMN picture TEXT`);
  }
  if (!cols.find((c: any) => c.name === 'party_id')) {
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec(`
      CREATE TABLE players_new (
        id TEXT PRIMARY KEY,
        party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
        name TEXT NOT NULL,
        essence INTEGER NOT NULL DEFAULT 0,
        elo INTEGER NOT NULL DEFAULT ${STARTING_ELO},
        picture TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (party_id, name)
      )
    `);
    db.exec(`
      INSERT INTO players_new (id, party_id, name, essence, elo, picture, created_at)
      SELECT id, '${DEFAULT_PARTY_ID}', name, essence, elo, picture, created_at FROM players
    `);
    db.exec('DROP TABLE players');
    db.exec('ALTER TABLE players_new RENAME TO players');
    db.exec('PRAGMA foreign_keys = ON');
  }
  const battleCols = db.prepare("PRAGMA table_info(battles)").all() as any[];
  if (!battleCols.find((c: any) => c.name === 'party_id')) {
    db.exec(`ALTER TABLE battles ADD COLUMN party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}'`);
  }
  if (!battleCols.find((c: any) => c.name === 'winner_elo_delta')) {
    db.exec(`ALTER TABLE battles ADD COLUMN winner_elo_delta INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE battles ADD COLUMN loser_elo_delta INTEGER NOT NULL DEFAULT 0`);
  }

  // Add move override columns if they don't exist (migration for TM teaching)
  const pokemonCols2 = db.prepare("PRAGMA table_info(owned_pokemon)").all() as any[];
  if (!pokemonCols2.find((c: any) => c.name === 'move_1')) {
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN move_1 TEXT DEFAULT NULL`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN move_2 TEXT DEFAULT NULL`);
  }

  // Add held_item column if it doesn't exist (migration for held items)
  if (!pokemonCols2.find((c: any) => c.name === 'held_item')) {
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN held_item TEXT DEFAULT NULL`);
  }

  // Add bond_xp column (Evolution 2.0: per-instance XP from battling)
  if (!pokemonCols2.find((c: any) => c.name === 'bond_xp')) {
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN bond_xp INTEGER NOT NULL DEFAULT 0`);
  }

  // Add favorite column (per-instance favorite flag for sorting/selection)
  if (!pokemonCols2.find((c: any) => c.name === 'favorite')) {
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0`);
  }

  // Add character column (AI profile override for move choice)
  if (!pokemonCols2.find((c: any) => c.name === 'character')) {
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN character TEXT DEFAULT NULL`);
  }

  // Add ability column if it doesn't exist (migration for abilities)
  // Drop all owned pokemon and recreate with NOT NULL ability
  if (!pokemonCols2.find((c: any) => c.name === 'ability')) {
    db.exec(`DELETE FROM owned_pokemon`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN ability TEXT NOT NULL DEFAULT ''`);
  }

  // Add IV and nature columns if they don't exist (migration for existing DBs)
  const pokemonCols = db.prepare("PRAGMA table_info(owned_pokemon)").all() as any[];
  if (!pokemonCols.find((c: any) => c.name === 'nature')) {
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN nature TEXT NOT NULL DEFAULT 'Serious'`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN iv_hp INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN iv_atk INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN iv_def INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN iv_spa INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN iv_spd INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE owned_pokemon ADD COLUMN iv_spe INTEGER NOT NULL DEFAULT 0`);

    // Backfill existing rows with random IVs and natures
    const allOwned = db.prepare('SELECT id FROM owned_pokemon').all() as any[];
    const update = db.prepare(
      'UPDATE owned_pokemon SET nature = ?, iv_hp = ?, iv_atk = ?, iv_def = ?, iv_spa = ?, iv_spd = ?, iv_spe = ? WHERE id = ?'
    );
    const rand = () => Math.floor(Math.random() * 32);
    for (const row of allOwned) {
      const nature = NATURES[Math.floor(Math.random() * NATURES.length)].name;
      update.run(nature, rand(), rand(), rand(), rand(), rand(), rand(), row.id);
    }
  }

  // Add battle config columns if they don't exist
  const battleCols2 = db.prepare("PRAGMA table_info(battles)").all() as any[];
  if (!battleCols2.find((c: any) => c.name === 'field_size')) {
    db.exec(`ALTER TABLE battles ADD COLUMN field_size INTEGER NOT NULL DEFAULT 3`);
    db.exec(`ALTER TABLE battles ADD COLUMN total_pokemon INTEGER NOT NULL DEFAULT 3`);
    db.exec(`ALTER TABLE battles ADD COLUMN selection_mode TEXT NOT NULL DEFAULT 'blind'`);
    db.exec(`ALTER TABLE battles ADD COLUMN opponent_type TEXT NOT NULL DEFAULT 'pvp'`);
    db.exec(`ALTER TABLE battles ADD COLUMN rounds INTEGER NOT NULL DEFAULT 0`);
  }
  if (!battleCols2.find((c: any) => c.name === 'showdown_log')) {
    // Raw Pokémon Showdown protocol log, newline-joined. Stored as the
    // source of truth so battles can be replayed or audited even if our
    // parser/UI changes.
    db.exec(`ALTER TABLE battles ADD COLUMN showdown_log TEXT`);
  }
  if (!battleCols2.find((c: any) => c.name === 'tournament_id')) {
    // Link tournament-match battles back to their tournament for replay.
    db.exec(`ALTER TABLE battles ADD COLUMN tournament_id TEXT`);
    db.exec(`ALTER TABLE battles ADD COLUMN tournament_match_id TEXT`);
  }

  // Story progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS story_progress (
      player_id TEXT NOT NULL REFERENCES players(id),
      chapter_id INTEGER NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (player_id, chapter_id)
    )
  `);

  // Game settings table (key-value store for admin-adjustable settings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_settings (
      party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (party_id, key)
    )
  `);
  const settingsCols = db.prepare("PRAGMA table_info(game_settings)").all() as any[];
  if (!settingsCols.find((c: any) => c.name === 'party_id')) {
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec(`
      CREATE TABLE game_settings_new (
        party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (party_id, key)
      )
    `);
    db.exec(`INSERT INTO game_settings_new (party_id, key, value) SELECT '${DEFAULT_PARTY_ID}', key, value FROM game_settings`);
    db.exec('DROP TABLE game_settings');
    db.exec('ALTER TABLE game_settings_new RENAME TO game_settings');
    db.exec('PRAGMA foreign_keys = ON');
  }

  // Clean up removed setting (pack tiers are now hardcoded)
  db.prepare("DELETE FROM game_settings WHERE key = 'rarity_weights'").run();

  // Pokedex: track which Pokemon a player has ever owned
  db.exec(`
    CREATE TABLE IF NOT EXISTS pokedex (
      player_id TEXT NOT NULL REFERENCES players(id),
      pokemon_id INTEGER NOT NULL,
      discovered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (player_id, pokemon_id)
    )
  `);

  // Tournaments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}' REFERENCES parties(id),
      name TEXT NOT NULL,
      field_size INTEGER NOT NULL DEFAULT 1,
      total_pokemon INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'registration',
      registration_end INTEGER NOT NULL,
      match_time_limit INTEGER NOT NULL DEFAULT 300,
      bracket TEXT NOT NULL DEFAULT '[]',
      participants TEXT NOT NULL DEFAULT '[]',
      current_round INTEGER NOT NULL DEFAULT 0,
      winner TEXT,
      fixed_team INTEGER NOT NULL DEFAULT 1,
      public_teams INTEGER NOT NULL DEFAULT 0,
      allow_legendaries INTEGER NOT NULL DEFAULT 1,
      pick_mode TEXT NOT NULL DEFAULT 'blind',
      frozen_teams TEXT NOT NULL DEFAULT '{}',
      prizes TEXT NOT NULL DEFAULT '{}',
      runner_up TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add fixed_team columns if missing (migration for existing DBs)
  const tournCols = db.prepare("PRAGMA table_info(tournaments)").all() as any[];
  if (tournCols.length > 0 && !tournCols.find((c: any) => c.name === 'party_id')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}'`);
  }
  if (tournCols.length > 0 && !tournCols.find((c: any) => c.name === 'fixed_team')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN fixed_team INTEGER NOT NULL DEFAULT 0`);
    db.exec(`ALTER TABLE tournaments ADD COLUMN frozen_teams TEXT NOT NULL DEFAULT '{}'`);
  }
  if (tournCols.length > 0 && !tournCols.find((c: any) => c.name === 'public_teams')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN public_teams INTEGER NOT NULL DEFAULT 0`);
  }
  if (tournCols.length > 0 && !tournCols.find((c: any) => c.name === 'prizes')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN prizes TEXT NOT NULL DEFAULT '{}'`);
    db.exec(`ALTER TABLE tournaments ADD COLUMN runner_up TEXT`);
  }
  if (tournCols.length > 0 && !tournCols.find((c: any) => c.name === 'allow_legendaries')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN allow_legendaries INTEGER NOT NULL DEFAULT 1`);
  }
  if (tournCols.length > 0 && !tournCols.find((c: any) => c.name === 'pick_mode')) {
    db.exec(`ALTER TABLE tournaments ADD COLUMN pick_mode TEXT NOT NULL DEFAULT 'blind'`);
  }
  const tradeCols = db.prepare("PRAGMA table_info(trades)").all() as any[];
  if (tradeCols.length > 0 && !tradeCols.find((c: any) => c.name === 'party_id')) {
    db.exec(`ALTER TABLE trades ADD COLUMN party_id TEXT NOT NULL DEFAULT '${DEFAULT_PARTY_ID}'`);
  }

  // Query indexes for the main per-player and battle-history hot paths.
  // Keep these idempotent so existing DBs get them on the next restart.
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_owned_pokemon_player ON owned_pokemon(player_id);
    CREATE INDEX IF NOT EXISTS idx_owned_pokemon_player_species ON owned_pokemon(player_id, pokemon_id);

    CREATE INDEX IF NOT EXISTS idx_owned_items_player ON owned_items(player_id);
    CREATE INDEX IF NOT EXISTS idx_owned_items_player_type_data ON owned_items(player_id, item_type, item_data);

    CREATE INDEX IF NOT EXISTS idx_story_progress_player ON story_progress(player_id);

    CREATE INDEX IF NOT EXISTS idx_battle_team_entries_player_battle ON battle_team_entries(player_id, battle_id);
    CREATE INDEX IF NOT EXISTS idx_battle_team_entries_battle ON battle_team_entries(battle_id);

    CREATE INDEX IF NOT EXISTS idx_battles_winner_created ON battles(winner_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_battles_loser_created ON battles(loser_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_battles_created ON battles(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_battles_tournament_match ON battles(tournament_id, tournament_match_id);

    CREATE INDEX IF NOT EXISTS idx_battle_pokemon_usage_player_used ON battle_pokemon_usage(player_id, times_used DESC);

    CREATE INDEX IF NOT EXISTS idx_tournaments_status_created ON tournaments(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tournaments_party_status_created ON tournaments(party_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tournaments_created ON tournaments(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_players_party_name ON players(party_id, name);
    CREATE INDEX IF NOT EXISTS idx_battles_party_created ON battles(party_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_party_created ON trades(party_id, created_at DESC);
  `);

  return db;
}
