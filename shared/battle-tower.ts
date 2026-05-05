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

export const BATTLE_TOWER_FORMATS: Record<BattleTowerFormat, BattleTowerFormatDef> = {
  single: {
    id: 'single',
    label: '1v1',
    description: 'Three Pokémon, one active battler at a time.',
    fieldSize: 1,
    teamSize: 3,
    baseEntryCost: 300,
    baseReward: 900,
  },
  double: {
    id: 'double',
    label: '2v2',
    description: 'Four Pokémon, two active battlers at a time.',
    fieldSize: 2,
    teamSize: 4,
    baseEntryCost: 450,
    baseReward: 1400,
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
  const scale = 1 + level * 0.35;
  return {
    level,
    difficultyLabel: battleTowerDifficultyLabel(level),
    entryCost: Math.round((def.baseEntryCost * scale) / 10) * 10,
    rewardEssence: Math.round((def.baseReward * (1 + level * 0.45)) / 10) * 10,
  };
}

