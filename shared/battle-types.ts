// Shared battle types used by both client and server

export interface BattleConfig {
  fieldSize: 1 | 2 | 3;
  totalPokemon: number;
  selectionMode: 'blind' | 'draft';
}

export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  fieldSize: 1,
  totalPokemon: 3,
  selectionMode: 'blind',
};

export interface BattlePokemonState {
  instanceId: string;
  name: string;
  sprite: string;
  types: string[];
  currentHp: number;
  maxHp: number;
  side: 'left' | 'right';
  heldItem?: string | null;
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
  boostChanges?: { instanceId: string; changes: Partial<Record<'atk' | 'def' | 'spa' | 'spd' | 'spe', number>> };
  statusChange?: { instanceId: string; status: string };
  statusDamage?: { instanceId: string; damage: number };
  replacement?: { instanceId: string; name: string; sprite: string; side: 'left' | 'right' };
  itemConsumed?: { instanceId: string; itemId: string };
  /** Absolute HP snapshot for all pokemon after this event — client should SET hp to these values */
  hpState?: Record<string, number>;
  /** Full turn-end state sync from the engine — authoritative ground truth */
  turnState?: TurnEndState;
}

/** Authoritative state snapshot from the battle engine at end of each turn */
export interface TurnEndState {
  /** Absolute HP for every pokemon (keyed by instanceId) */
  hp: Record<string, number>;
  /** Max HP for every pokemon */
  maxHp: Record<string, number>;
  /** Status condition per pokemon ('' = none) */
  status: Record<string, string>;
  /** Stat boosts per pokemon */
  boosts: Record<string, Record<string, number>>;
  /** Which instance IDs are currently active on the field */
  activeLeft: string[];
  activeRight: string[];
}

export interface BattleSnapshot {
  left: BattlePokemonState[];
  right: BattlePokemonState[];
  log: BattleLogEntry[];
  winner: 'left' | 'right' | null;
  round: number;
  fieldSize: number;
}

export interface EloUpdate {
  winnerName: string;
  loserName: string;
  winnerNewElo: number;
  loserNewElo: number;
  winnerDelta: number;
  loserDelta: number;
}
