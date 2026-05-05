import type { BattleSnapshot } from '../../shared/battle-types.js';
import type { Pokemon } from '../../shared/types.js';

export interface BattleSimulationEntry {
  pokemon: Pokemon;
  heldItem?: string | null;
  moves: [string, string];
  ivs?: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number };
  nature?: string;
  ability?: string;
  character?: string | null;
  instanceId?: string;
}

export interface BattleSimulationJob {
  leftEntries: BattleSimulationEntry[];
  rightEntries: BattleSimulationEntry[];
  fieldSize: number;
}

export interface BattleSimulationResponse {
  snapshot: BattleSnapshot;
  durationMs: number;
}
