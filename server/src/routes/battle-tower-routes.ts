import type { Express, Request, Response } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import type { Counter, Histogram } from 'prom-client';
import { v4 as uuidv4 } from 'uuid';
import { POKEMON_BY_ID } from '../../../shared/pokemon-data.js';
import { getPokemonSprite } from '../../../shared/types.js';
import type { BattlePokemonState, BattleSnapshot } from '../../../shared/battle-types.js';
import {
  BATTLE_TOWER_FORMATS,
  BATTLE_TOWER_RUN_LENGTH,
  battleTowerEconomy,
  isBattleTowerFormat,
  type BattleTowerFormat,
} from '../../../shared/battle-tower.js';
import { generateBattleTowerOpponents, type BattleTowerOpponent } from '../battle-tower.js';

interface BattleTowerPlayerEntry {
  instanceId: string;
  pokemonId: number;
  shiny: boolean;
  moves: [string, string] | null;
  heldItem: string | null;
  ability: string | null;
  character: string | null;
}

interface BattleTowerRunRow {
  id: string;
  party_id: string;
  player_id: string;
  format: BattleTowerFormat;
  field_size: number;
  team_size: number;
  entry_cost: number;
  reward_essence: number;
  tower_level: number;
  status: string;
  current_battle_index: number;
  player_team_json: string;
  opponents_json: string;
  pending_snapshot_json: string | null;
  pending_result_json: string | null;
}

interface PartyContext {
  id: string;
  slug: string;
  name: string;
  stoppedAt: string | null;
}

interface PlayerContext {
  party: PartyContext;
  player: { id: string; name?: string; essence: number };
}

interface BondAward {
  instanceId: string;
  slot: number;
  delta: number;
  total: number;
  threshold: number | null;
  previous: number;
}

type SimulateBattleFromIds = (
  leftIds: number[],
  rightIds: number[],
  fieldSize?: number,
  leftHeldItems?: (string | null)[],
  rightHeldItems?: (string | null)[],
  leftMoves?: ([string, string] | null)[],
  rightMoves?: ([string, string] | null)[],
  leftAbilities?: (string | null)[],
  rightAbilities?: (string | null)[],
  leftCharacters?: (string | null)[],
  rightCharacters?: (string | null)[],
  leftSprites?: (string | null)[],
  rightSprites?: (string | null)[],
) => Promise<BattleSnapshot>;

interface BattleTowerRouteDeps {
  db: DatabaseSync;
  basePath: string;
  partyFromRequest: (req: Request) => PartyContext | null;
  partyStoppedResponse: (res: Response) => unknown;
  simulateBattleFromIds: SimulateBattleFromIds;
  observeBattleSimulation: <T>(
    labels: { field_size: string; total_pokemon: string; opponent_type: string },
    run: () => Promise<T>,
  ) => Promise<T>;
  awardBondXp: (
    playerId: string,
    instanceIds: string[] | undefined,
    teamStates: BattlePokemonState[],
    rounds: number,
    won: boolean,
    mode: 'ai',
  ) => BondAward[];
  battlesTotal: Pick<Counter<string>, 'inc'>;
  battleRounds: Pick<Histogram<string>, 'observe'>;
}

function asMovePair(value: unknown): [string, string] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  if (typeof value[0] !== 'string' || typeof value[1] !== 'string') return null;
  return [value[0], value[1]];
}

export function registerBattleTowerRoutes(app: Express, deps: BattleTowerRouteDeps) {
  const {
    db,
    basePath,
    partyFromRequest,
    partyStoppedResponse,
    simulateBattleFromIds,
    observeBattleSimulation,
    awardBondXp,
    battlesTotal,
    battleRounds,
  } = deps;

  function getBattleTowerProgress(playerId: string, format: BattleTowerFormat) {
    const existing = db.prepare('SELECT player_id, format, current_streak, best_streak, total_clears, total_attempts FROM battle_tower_progress WHERE player_id = ? AND format = ?').get(playerId, format) as any;
    if (existing) return existing;
    return { player_id: playerId, format, current_streak: 0, best_streak: 0, total_clears: 0, total_attempts: 0 };
  }

  function summarizeBattleTowerFormat(playerId: string, format: BattleTowerFormat) {
    const progress = getBattleTowerProgress(playerId, format);
    const economy = battleTowerEconomy(format, progress.current_streak ?? 0);
    return {
      ...BATTLE_TOWER_FORMATS[format],
      progress: {
        currentStreak: progress.current_streak ?? 0,
        bestStreak: progress.best_streak ?? 0,
        totalClears: progress.total_clears ?? 0,
        totalAttempts: progress.total_attempts ?? 0,
      },
      ...economy,
    };
  }

  function parseBattleTowerRun(row: BattleTowerRunRow | null) {
    if (!row) return null;
    const opponents = JSON.parse(row.opponents_json) as BattleTowerOpponent[];
    return {
      id: row.id,
      format: row.format,
      fieldSize: row.field_size,
      teamSize: row.team_size,
      entryCost: row.entry_cost,
      rewardEssence: row.reward_essence,
      towerLevel: row.tower_level,
      status: row.status,
      currentBattleIndex: row.current_battle_index,
      opponents,
      currentOpponent: opponents[row.current_battle_index] ?? null,
      pendingSnapshot: row.pending_snapshot_json ? JSON.parse(row.pending_snapshot_json) : null,
      pendingResult: row.pending_result_json ? JSON.parse(row.pending_result_json) : null,
    };
  }

  function getActiveBattleTowerRun(playerId: string): BattleTowerRunRow | null {
    return (db.prepare("SELECT * FROM battle_tower_runs WHERE player_id = ? AND status = 'in_progress' ORDER BY created_at DESC LIMIT 1").get(playerId) as unknown as BattleTowerRunRow | undefined) ?? null;
  }

  function getBattleTowerPlayer(req: Request, res: Response): PlayerContext | null {
    const party = partyFromRequest(req);
    if (!party) { res.status(404).json({ error: 'Party not found' }); return null; }
    if (party.stoppedAt) { partyStoppedResponse(res); return null; }
    const playerId = typeof req.body?.playerId === 'string' ? req.body.playerId : typeof req.query?.playerId === 'string' ? req.query.playerId : null;
    if (!playerId) { res.status(400).json({ error: 'playerId is required' }); return null; }
    const player = db.prepare('SELECT id, name, essence FROM players WHERE id = ? AND party_id = ?').get(playerId, party.id) as any;
    if (!player) { res.status(404).json({ error: 'Player not found' }); return null; }
    return { party, player };
  }

  function buildBattleTowerPlayerTeam(playerId: string, format: BattleTowerFormat, body: any): BattleTowerPlayerEntry[] | { error: string } {
    const def = BATTLE_TOWER_FORMATS[format];
    const instanceIds = Array.isArray(body.instanceIds) ? body.instanceIds.filter((id: unknown): id is string => typeof id === 'string') : [];
    if (instanceIds.length !== def.teamSize) return { error: `Select exactly ${def.teamSize} Pokémon.` };
    if (new Set(instanceIds).size !== instanceIds.length) return { error: 'Duplicate Pokémon are not allowed.' };
    const placeholders = instanceIds.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT id, pokemon_id, shiny, move_1, move_2, held_item, ability
      FROM owned_pokemon
      WHERE player_id = ? AND id IN (${placeholders})
    `).all(playerId, ...instanceIds) as any[];
    const byId = new Map(rows.map((row) => [row.id, row]));
    const heldItems = Array.isArray(body.heldItems) ? body.heldItems : [];
    const moves = Array.isArray(body.moves) ? body.moves : [];
    const abilities = Array.isArray(body.abilities) ? body.abilities : [];
    const characters = Array.isArray(body.characters) ? body.characters : [];
    const team: BattleTowerPlayerEntry[] = [];
    for (let i = 0; i < instanceIds.length; i++) {
      const row = byId.get(instanceIds[i]);
      if (!row) return { error: 'Selected Pokémon was not found.' };
      const species = POKEMON_BY_ID[row.pokemon_id];
      if (!species) return { error: 'Selected Pokémon data is missing.' };
      if (species.tier === 'legendary') return { error: 'Legendary Pokémon are banned from Battle Tower.' };
      const overrideMoves = asMovePair(moves[i]);
      const savedMoves = row.move_1 && row.move_2 ? [row.move_1, row.move_2] as [string, string] : null;
      const heldItem = i < heldItems.length
        ? (typeof heldItems[i] === 'string' ? heldItems[i] : null)
        : (row.held_item ?? null);
      team.push({
        instanceId: row.id,
        pokemonId: row.pokemon_id,
        shiny: !!row.shiny,
        moves: overrideMoves ?? savedMoves,
        heldItem,
        ability: typeof abilities[i] === 'string' ? abilities[i] : row.ability ?? null,
        character: typeof characters[i] === 'string' ? characters[i] : 'balanced',
      });
    }
    return team;
  }

  function battleTowerStatusPayload(player: { id: string; essence: number }) {
    const active = getActiveBattleTowerRun(player.id);
    return {
      essence: player.essence,
      formats: {
        single: summarizeBattleTowerFormat(player.id, 'single'),
        double: summarizeBattleTowerFormat(player.id, 'double'),
      },
      activeRun: parseBattleTowerRun(active),
    };
  }

  app.get(`${basePath}/api/battle-tower/status`, (req, res) => {
    const ctx = getBattleTowerPlayer(req, res);
    if (!ctx) return;
    return res.json(battleTowerStatusPayload(ctx.player));
  });

  app.post(`${basePath}/api/battle-tower/start`, (req, res) => {
    const ctx = getBattleTowerPlayer(req, res);
    if (!ctx) return;
    const { party, player } = ctx;
    const format = req.body?.format;
    if (!isBattleTowerFormat(format)) {
      res.status(400).json({ error: 'Invalid Battle Tower format.' });
      return;
    }
    const existingRun = getActiveBattleTowerRun(player.id);
    if (existingRun) {
      res.status(409).json({ error: 'An active Battle Tower run already exists.', activeRun: parseBattleTowerRun(existingRun) });
      return;
    }
    const playerTeam = buildBattleTowerPlayerTeam(player.id, format, req.body);
    if (!Array.isArray(playerTeam)) {
      res.status(400).json({ error: playerTeam.error });
      return;
    }
    const progress = getBattleTowerProgress(player.id, format);
    const economy = battleTowerEconomy(format, progress.current_streak ?? 0);
    if ((player.essence ?? 0) < economy.entryCost) {
      res.status(400).json({ error: 'Not enough essence for the Battle Tower entry ticket.' });
      return;
    }
    const def = BATTLE_TOWER_FORMATS[format];
    const opponents = generateBattleTowerOpponents(format, def.teamSize, economy.level);
    const runId = uuidv4();
    try {
      db.exec('BEGIN');
      db.prepare('UPDATE players SET essence = essence - ? WHERE id = ? AND party_id = ?').run(economy.entryCost, player.id, party.id);
      db.prepare(`
        INSERT INTO battle_tower_progress (player_id, format, current_streak, best_streak, total_clears, total_attempts)
        VALUES (?, ?, 0, 0, 0, 1)
        ON CONFLICT(player_id, format) DO UPDATE SET total_attempts = total_attempts + 1
      `).run(player.id, format);
      db.prepare(`
        INSERT INTO battle_tower_runs (
          id, party_id, player_id, format, field_size, team_size, entry_cost, reward_essence,
          tower_level, status, current_battle_index, player_team_json, opponents_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', 0, ?, ?)
      `).run(
        runId,
        party.id,
        player.id,
        format,
        def.fieldSize,
        def.teamSize,
        economy.entryCost,
        economy.rewardEssence,
        economy.level,
        JSON.stringify(playerTeam),
        JSON.stringify(opponents),
      );
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      console.error('Battle Tower start failed:', error);
      res.status(500).json({ error: 'Battle Tower entry failed.' });
      return;
    }
    const updatedPlayer = db.prepare('SELECT id, name, essence FROM players WHERE id = ?').get(player.id) as any;
    const run = getActiveBattleTowerRun(player.id);
    return res.json({ ...battleTowerStatusPayload(updatedPlayer), activeRun: parseBattleTowerRun(run) });
  });

  app.post(`${basePath}/api/battle-tower/battle`, async (req, res) => {
    const ctx = getBattleTowerPlayer(req, res);
    if (!ctx) return;
    const { party, player } = ctx;
    const runId = typeof req.body?.runId === 'string' ? req.body.runId : '';
    const row = (db.prepare("SELECT * FROM battle_tower_runs WHERE id = ? AND player_id = ? AND status = 'in_progress'").get(runId, player.id) as unknown as BattleTowerRunRow | undefined) ?? null;
    if (!row) {
      res.status(404).json({ error: 'Active Battle Tower run not found.' });
      return;
    }
    if (row.pending_snapshot_json && row.pending_result_json) {
      const pending = JSON.parse(row.pending_result_json);
      res.json({
        snapshot: JSON.parse(row.pending_snapshot_json),
        bondAwards: pending.bondAwards ?? [],
        opponent: (JSON.parse(row.opponents_json) as BattleTowerOpponent[])[row.current_battle_index] ?? null,
        battleNumber: row.current_battle_index + 1,
        run: parseBattleTowerRun(row),
      });
      return;
    }

    const playerTeam = JSON.parse(row.player_team_json) as BattleTowerPlayerEntry[];
    const opponents = JSON.parse(row.opponents_json) as BattleTowerOpponent[];
    const opponent = opponents[row.current_battle_index];
    if (!opponent) {
      res.status(500).json({ error: 'Battle Tower opponent is missing.' });
      return;
    }

    try {
      const leftTeam = playerTeam.map((entry) => entry.pokemonId);
      const rightTeam = opponent.team.map((entry) => entry.pokemonId);
      const leftMoves = playerTeam.map((entry) => entry.moves);
      const leftHeldItems = playerTeam.map((entry) => entry.heldItem);
      const leftAbilities = playerTeam.map((entry) => entry.ability);
      const leftCharacters = playerTeam.map((entry) => entry.character);
      const leftSprites = playerTeam.map((entry) => {
        const species = POKEMON_BY_ID[entry.pokemonId];
        return species ? getPokemonSprite(species, entry.shiny) : null;
      });
      const rightHeldItems = opponent.team.map((entry) => entry.heldItem);
      const rightMoves = opponent.team.map((entry) => entry.moves ?? null);
      const rightAbilities = opponent.team.map((entry) => entry.ability);
      const rightCharacters = opponent.team.map((entry) => entry.character);
      const snapshot = await observeBattleSimulation(
        { field_size: String(row.field_size), total_pokemon: String(row.team_size), opponent_type: 'battle_tower' },
        () => simulateBattleFromIds(leftTeam, rightTeam, row.field_size, leftHeldItems, rightHeldItems, leftMoves, rightMoves, leftAbilities, rightAbilities, leftCharacters, rightCharacters, leftSprites),
      );
      const won = snapshot.winner === 'left';
      const battleRecordId = uuidv4();
      const bondAwards = awardBondXp(player.id, playerTeam.map((entry) => entry.instanceId), snapshot.left, snapshot.round, won, 'ai');
      db.prepare(
        'INSERT INTO battles (id, party_id, winner_id, loser_id, essence_gained, field_size, total_pokemon, selection_mode, opponent_type, rounds, showdown_log) VALUES (?, ?, ?, NULL, 0, ?, ?, ?, ?, ?, ?)'
      ).run(battleRecordId, party.id, won ? player.id : null, row.field_size, row.team_size, row.format, 'battle_tower', snapshot.round, (snapshot.rawLog ?? []).join('\n'));
      const recordTeamEntry = db.prepare('INSERT INTO battle_team_entries (battle_id, player_id, pokemon_id) VALUES (?, ?, ?)');
      for (const pid of leftTeam) recordTeamEntry.run(battleRecordId, player.id, pid);
      const pendingResult = { won, bondAwards, battleRecordId };
      db.prepare(`
        UPDATE battle_tower_runs
        SET pending_snapshot_json = ?, pending_result_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(snapshot), JSON.stringify(pendingResult), row.id);
      battlesTotal.inc({ field_size: String(row.field_size), total_pokemon: String(row.team_size), selection_mode: row.format, opponent_type: 'battle_tower' });
      battleRounds.observe({ field_size: String(row.field_size), total_pokemon: String(row.team_size) }, snapshot.round);
      res.json({ snapshot, bondAwards, opponent, battleNumber: row.current_battle_index + 1, run: parseBattleTowerRun({ ...row, pending_snapshot_json: JSON.stringify(snapshot), pending_result_json: JSON.stringify(pendingResult) }) });
    } catch (error) {
      console.error('Battle Tower battle failed:', error);
      res.status(502).json({ error: 'Battle Tower battle failed.' });
    }
  });

  app.post(`${basePath}/api/battle-tower/advance`, (req, res) => {
    const ctx = getBattleTowerPlayer(req, res);
    if (!ctx) return;
    const { player } = ctx;
    const runId = typeof req.body?.runId === 'string' ? req.body.runId : '';
    const row = (db.prepare("SELECT * FROM battle_tower_runs WHERE id = ? AND player_id = ? AND status = 'in_progress'").get(runId, player.id) as unknown as BattleTowerRunRow | undefined) ?? null;
    if (!row || !row.pending_result_json) {
      res.status(400).json({ error: 'No completed Battle Tower battle is waiting to advance.' });
      return;
    }
    const pending = JSON.parse(row.pending_result_json) as { won: boolean };
    const completedTower = pending.won && row.current_battle_index + 1 >= BATTLE_TOWER_RUN_LENGTH;
    try {
      db.exec('BEGIN');
      if (!pending.won) {
        db.prepare(`
          UPDATE battle_tower_progress
          SET current_streak = 0
          WHERE player_id = ? AND format = ?
        `).run(player.id, row.format);
        db.prepare(`
          UPDATE battle_tower_runs
          SET status = 'failed', pending_snapshot_json = NULL, pending_result_json = NULL,
              updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(row.id);
      } else if (completedTower) {
        db.prepare('UPDATE players SET essence = essence + ? WHERE id = ?').run(row.reward_essence, player.id);
        db.prepare(`
          UPDATE battle_tower_progress
          SET current_streak = current_streak + 1,
              best_streak = MAX(best_streak, current_streak + 1),
              total_clears = total_clears + 1
          WHERE player_id = ? AND format = ?
        `).run(player.id, row.format);
        db.prepare(`
          UPDATE battle_tower_runs
          SET status = 'completed', pending_snapshot_json = NULL, pending_result_json = NULL,
              updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(row.id);
      } else {
        db.prepare(`
          UPDATE battle_tower_runs
          SET current_battle_index = current_battle_index + 1,
              pending_snapshot_json = NULL,
              pending_result_json = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(row.id);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      console.error('Battle Tower advance failed:', error);
      res.status(500).json({ error: 'Battle Tower advance failed.' });
      return;
    }
    const updatedPlayer = db.prepare('SELECT id, name, essence FROM players WHERE id = ?').get(player.id) as any;
    const activeRun = getActiveBattleTowerRun(player.id);
    res.json({
      ...battleTowerStatusPayload(updatedPlayer),
      result: pending.won ? (completedTower ? 'completed' : 'advanced') : 'failed',
      rewardEssence: completedTower ? row.reward_essence : 0,
      activeRun: parseBattleTowerRun(activeRun),
    });
  });

  app.post(`${basePath}/api/battle-tower/cancel`, (req, res) => {
    const ctx = getBattleTowerPlayer(req, res);
    if (!ctx) return;
    const runId = typeof req.body?.runId === 'string' ? req.body.runId : '';
    db.prepare(`
      UPDATE battle_tower_runs
      SET status = 'abandoned', updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND player_id = ? AND status = 'in_progress'
    `).run(runId, ctx.player.id);
    const updatedPlayer = db.prepare('SELECT id, name, essence FROM players WHERE id = ?').get(ctx.player.id) as any;
    res.json(battleTowerStatusPayload(updatedPlayer));
  });
}
