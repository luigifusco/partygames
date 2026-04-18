// Evolution rules: tokens-based shortcut + bond-XP path.
// Keep in sync between client and server.

import type { BoxTier } from './types';

// --- Bond XP thresholds, keyed by the TARGET tier of the evolution. ---
const BOND_THRESHOLDS: Record<BoxTier, number> = {
  common: 60,       // e.g. Caterpie → Metapod
  uncommon: 60,     // treated as common→uncommon cost
  rare: 150,        // e.g. Metapod → Butterfree, Ivysaur → Venusaur
  epic: 350,        // e.g. Dragonair → Dragonite
  legendary: 700,   // any future legendary evolution
};

// --- Token shortcut cost, keyed by the TARGET tier of the evolution. ---
const TOKEN_COSTS: Record<BoxTier, number> = {
  common: 2,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

export function bondThreshold(targetTier: BoxTier): number {
  return BOND_THRESHOLDS[targetTier];
}

export function tokenCost(targetTier: BoxTier): number {
  return TOKEN_COSTS[targetTier];
}

// --- Bond XP awarded for participating in a battle. ---

export type BondBattleMode = 'pvp' | 'tournament' | 'ai' | 'friendly' | 'story' | 'demo';

export interface BondAwardInput {
  mode: BondBattleMode;
  won: boolean;
  survived: boolean;
  rounds: number;
}

export function computeBondXp(input: BondAwardInput): number {
  const base = 10;
  const survivedBonus = input.survived ? 10 : 0;
  const winBonus = input.won ? 10 : 0;
  const roundBonus = 3 * Math.max(0, Math.min(20, input.rounds));
  const raw = base + survivedBonus + winBonus + roundBonus;

  let mult = 1;
  switch (input.mode) {
    case 'pvp':
    case 'tournament': mult = 1.5; break;
    case 'ai':
    case 'story':      mult = 1.0; break;
    case 'friendly':
    case 'demo':       mult = 0.5; break;
  }

  return Math.round(raw * mult);
}

// --- Evolution gate ---

export interface EvolveGateInput {
  bondXp: number;
  tokens: number;
  targetTier: BoxTier;
}

export interface EvolveGate {
  canEvolve: boolean;
  bondMet: boolean;
  tokensMet: boolean;
  bondNeeded: number;
  tokensNeeded: number;
}

export function evolveGate(input: EvolveGateInput): EvolveGate {
  const bondNeeded = bondThreshold(input.targetTier);
  const tokensNeeded = tokenCost(input.targetTier);
  const bondMet = input.bondXp >= bondNeeded;
  const tokensMet = input.tokens >= tokensNeeded;
  return {
    canEvolve: bondMet || tokensMet,
    bondMet,
    tokensMet,
    bondNeeded,
    tokensNeeded,
  };
}
