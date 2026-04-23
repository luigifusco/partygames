// Shared battle types used by both client and server

export interface BattleConfig {
  fieldSize: 1 | 2 | 3;
  totalPokemon: number;
  selectionMode: 'blind' | 'draft';
  /** When false, legendary-tier Pokémon are banned from the team. Default true. */
  allowLegendaries?: boolean;
}

export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  fieldSize: 1,
  totalPokemon: 3,
  selectionMode: 'blind',
  allowLegendaries: true,
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
  /** True when the attacker rolled a critical hit. */
  crit?: boolean;
  message: string;
  weather?: 'rain' | 'sun' | 'sand' | 'hail' | 'clear';
  /** Trick Room field activation (true = started, false = ended). */
  trickRoom?: boolean;
  boostChanges?: { instanceId: string; changes: Partial<Record<'atk' | 'def' | 'spa' | 'spd' | 'spe', number>> };
  statusChange?: { instanceId: string; status: string };
  statusDamage?: { instanceId: string; damage: number };
  replacement?: { instanceId: string; name: string; sprite: string; side: 'left' | 'right'; outgoingInstanceId?: string };
  /** Illusion broke — client should swap this pokemon's displayed sprite/name. */
  illusionBroken?: { instanceId: string; name: string; sprite: string };
  itemConsumed?: { instanceId: string; itemId: string };
  /** Absolute HP snapshot for all pokemon after this event — client should SET hp to these values */
  hpState?: Record<string, number>;
}

export interface BattleSnapshot {
  left: BattlePokemonState[];
  right: BattlePokemonState[];
  log: BattleLogEntry[];
  winner: 'left' | 'right' | null;
  round: number;
  fieldSize: number;
  /** Raw Showdown protocol lines (for debug view) */
  rawLog?: string[];
}

export interface EloUpdate {
  winnerName: string;
  loserName: string;
  winnerNewElo: number;
  loserNewElo: number;
  winnerDelta: number;
  loserDelta: number;
}
