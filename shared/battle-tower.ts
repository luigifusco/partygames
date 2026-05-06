import type { BoxTier } from './types';

export type BattleTowerFormat = 'single' | 'double';

export interface BattleTowerFormatDef {
  id: BattleTowerFormat;
  label: string;
  description: string;
  fieldSize: 1 | 2;
  teamSize: 3 | 4;
  baseEntryCost: number;
  baseReward: number;
}

export const BATTLE_TOWER_RUN_LENGTH = 3;
export const BATTLE_TOWER_BASE_ENTRY_COST = 500;
export const BATTLE_TOWER_BASE_REWARD = 2000;
export const BATTLE_TOWER_ENTRY_SCALE_PER_CLEAR = 0.6;
export const BATTLE_TOWER_REWARD_SCALE_PER_CLEAR = 0.9;

export const BATTLE_TOWER_FORMATS: Record<BattleTowerFormat, BattleTowerFormatDef> = {
  single: {
    id: 'single',
    label: '1v1',
    description: 'Three Pokémon, one active battler at a time.',
    fieldSize: 1,
    teamSize: 3,
    baseEntryCost: BATTLE_TOWER_BASE_ENTRY_COST,
    baseReward: BATTLE_TOWER_BASE_REWARD,
  },
  double: {
    id: 'double',
    label: '2v2',
    description: 'Four Pokémon, two active battlers at a time.',
    fieldSize: 2,
    teamSize: 4,
    baseEntryCost: BATTLE_TOWER_BASE_ENTRY_COST,
    baseReward: BATTLE_TOWER_BASE_REWARD,
  },
};

export const BATTLE_TOWER_ELIGIBLE_TIERS: BoxTier[] = ['uncommon', 'rare', 'epic'];

export function isBattleTowerFormat(value: unknown): value is BattleTowerFormat {
  return value === 'single' || value === 'double';
}

export function battleTowerLevel(currentStreak: number): number {
  return Math.max(0, Math.floor(currentStreak));
}

export function battleTowerDifficultyLabel(level: number): string {
  if (level >= 9) return 'Master';
  if (level >= 6) return 'Elite';
  if (level >= 3) return 'Veteran';
  return 'Challenger';
}

export function battleTowerEconomy(format: BattleTowerFormat, currentStreak: number) {
  const def = BATTLE_TOWER_FORMATS[format];
  const level = battleTowerLevel(currentStreak);
  const entryScale = 1 + level * BATTLE_TOWER_ENTRY_SCALE_PER_CLEAR;
  const rewardScale = 1 + level * BATTLE_TOWER_REWARD_SCALE_PER_CLEAR;
  return {
    level,
    difficultyLabel: battleTowerDifficultyLabel(level),
    entryCost: Math.round((def.baseEntryCost * entryScale) / 10) * 10,
    rewardEssence: Math.round((def.baseReward * rewardScale) / 10) * 10,
  };
}
