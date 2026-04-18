// Move scoring
// ====================================================================
// Score each usable move for a given active slot, using character profile
// weights. Phase 1 keeps the existing SE/STAB/weather multiplicative
// damage heuristic and layers profile-aware status/setup/hazard scoring
// on top. Phase 2 will replace the damage heuristic with a real damage
// estimator.

import type { MoveCtx, ScoredMove } from './types.js';
import { applyHardFilters } from './policies.js';

const DAMAGING_RECOIL: Record<string, number> = {
  // Fraction of damage dealt recoiled back to user
  doubleedge: 0.33,
  takedown: 0.25,
  bravebird: 0.33,
  flareblitz: 0.33,
  volttackle: 0.33,
  woodhammer: 0.33,
  headsmash: 0.5,
  submission: 0.25,
  headcharge: 0.25,
  struggle: 0.25,
};

const SETUP_VALUE: Record<string, number> = {
  // Rough "expected benefit" scalar. Phase 4 will compute from stats.
  swordsdance: 1.2,
  nastyplot: 1.2,
  dragondance: 1.4,
  quiverdance: 1.5,
  calmmind: 1.0,
  bulkup: 0.9,
  agility: 0.7,
  rockpolish: 0.7,
  shellsmash: 1.6,
  tailglow: 1.3,
  shiftgear: 1.3,
  workup: 0.9,
  growth: 0.7,
  cosmicpower: 0.6,
  irondefense: 0.6,
  amnesia: 0.6,
  acidarmor: 0.6,
  barrier: 0.6,
  stockpile: 0.5,
};

const HAZARD_VALUE: Record<string, number> = {
  stealthrock: 1.0,
  spikes: 0.6,  // per layer; multiplier varies with layer count — Phase 4
  toxicspikes: 0.5,
  stickyweb: 0.5,
};

const STATUS_MOVE_BASE_VALUE: Record<string, number> = {
  // Per-move rough valuation (0..1.5). Phase 4 refines via tempo math.
  toxic: 1.0,
  willowisp: 1.0,
  thunderwave: 0.8,
  spore: 1.4,
  sleeppowder: 1.1,
  hypnosis: 0.7,
  yawn: 0.7,
  leechseed: 0.8,
  confuseray: 0.6,
  supersonic: 0.4,
  taunt: 0.7,
  encore: 0.7,
  disable: 0.6,
  glare: 0.8,
  stunspore: 0.7,
  poisonpowder: 0.6,
  toxicthread: 0.7,
};

function getTypes(p: any): string[] {
  if (!p) return [];
  if (typeof p.getTypes === 'function') return p.getTypes();
  return p.types || [];
}

function hpPct(p: any): number {
  if (!p || !p.maxhp) return 1;
  return p.hp / p.maxhp;
}

/**
 * Phase-1 damage heuristic: retains the legacy multiplicative scoring
 * (STAB / effectiveness / priority / weather) but normalized to a
 * 0..~2 range so it composes with profile weights. Phase 2 replaces
 * this with `estimatedAvgDamage / target.currentHp`.
 */
function damageHeuristic(move: any, md: any, ctx: MoveCtx): { score: number; hitsSE: boolean; recoilFrac: number } {
  const target = ctx.target;
  if (!target) return { score: 0.1, hitsSE: false, recoilFrac: 0 };

  const moveType = md.type;
  const targetTypes = getTypes(target);
  const selfTypes = getTypes(ctx.selfPkmn);

  // Type effectiveness
  let eff = 1;
  for (const ttype of targetTypes) {
    const dt = ctx.dex.types.get(ttype)?.damageTaken?.[moveType];
    if (dt === 1) eff *= 2;
    else if (dt === 2) eff *= 0.5;
    else if (dt === 3) eff *= 0;
  }
  // Ability-based immunity check (only Levitate for Phase 1; Phase 3 expands)
  if (moveType === 'Ground' && target.ability) {
    const abilName = ctx.dex.abilities.get(target.ability)?.name;
    if (abilName === 'Levitate') eff = 0;
  }

  const bp = md.basePower || 0;
  // Normalize BP to 0..1.5 (120 BP -> 1.2)
  const bpScore = bp > 0 ? Math.min(1.5, bp / 100) : 0.4; // fixed-damage / status-like moves get a flat 0.4

  // STAB
  const stab = selfTypes.includes(moveType) ? 1.5 : 1.0;

  // Weather
  let wMul = 1;
  const weather = ctx.battle.field?.weatherState?.id || '';
  if (weather === 'raindance' && moveType === 'Water') wMul = 1.5;
  if (weather === 'raindance' && moveType === 'Fire') wMul = 0.5;
  if (weather === 'sunnyday' && moveType === 'Fire') wMul = 1.5;
  if (weather === 'sunnyday' && moveType === 'Water') wMul = 0.5;

  // Accuracy (flat 1 when accuracy is true/100)
  const acc = md.accuracy === true || md.accuracy === undefined ? 1 : Math.max(0.3, (md.accuracy as number) / 100);

  // Priority bump vs low-HP target
  let prioBump = 1;
  if ((md.priority || 0) > 0 && hpPct(target) < 0.3) prioBump = 1.5;

  const score = bpScore * stab * eff * wMul * acc * prioBump;

  const recoilFrac = DAMAGING_RECOIL[(md.id || '').toLowerCase()] || 0;

  return { score, hitsSE: eff >= 2, recoilFrac };
}

/** Extra damage/KO bonuses. Phase 1 approximates; Phase 2 uses real damage. */
function koApprox(move: any, md: any, ctx: MoveCtx): number {
  if (!ctx.target || md.category === 'Status') return 0;
  // Rough KO detection: SE STAB at low target HP
  const hp = hpPct(ctx.target);
  if (hp < 0.35) return 1;
  if (hp < 0.6) return 0.3;
  return 0;
}

function statusValue(move: any, md: any, ctx: MoveCtx): number {
  if (md.category !== 'Status') return 0;
  const id = (md.id || '').toLowerCase();
  const base = STATUS_MOVE_BASE_VALUE[id] || 0;

  // Boost moves are scored under setupValue instead.
  if (md.boosts && !md.status && !md.volatileStatus && !md.sideCondition && !md.weather && !md.terrain) return 0;

  // Haze / Clear Smog etc. — not modeled in Phase 1
  return base;
}

function setupValue(move: any, md: any, ctx: MoveCtx): number {
  const id = (md.id || '').toLowerCase();
  const base = SETUP_VALUE[id] || 0;
  if (base === 0) return 0;

  // Scale down if we're at low HP (likely to be KO'd next turn)
  const hp = hpPct(ctx.selfPkmn);
  if (hp < 0.35) return base * 0.2;

  // Don't boost on last-pokemon-standing if target is near death anyway
  if (ctx.oppAlive === 1 && ctx.target && hpPct(ctx.target) < 0.3) return base * 0.3;

  return base;
}

function hazardValue(move: any, md: any, ctx: MoveCtx): number {
  if (!md.sideCondition) return 0;
  const id = (md.sideCondition || '').toLowerCase();
  const base = HAZARD_VALUE[id] || 0;
  if (base === 0) return 0;

  // Scale by opponent bench alive (more pokemon = more value)
  const benchAlive = ctx.oppSide.pokemon.filter((p: any) => !p.fainted && !p.isActive).length;
  if (benchAlive === 0) return base * 0.1; // opponent has no more switches

  return base * (1 + benchAlive * 0.3);
}

/** Full score for a move. Non-zero only if it passes hard filters. */
export function scoreMove(move: any, ctx: MoveCtx): ScoredMove {
  const md = ctx.dex.moves.get(move.id);
  if (!md) return { move, score: 1 };

  const filtered = applyHardFilters(move, md, ctx);
  if (filtered) return { move, score: 0, filteredBy: filtered };

  const profile = ctx.profile;
  let total = 0;

  // ── Damage component ──
  if (md.category !== 'Status') {
    const { score: dmg, hitsSE, recoilFrac } = damageHeuristic(move, md, ctx);
    let dmgComp = dmg * profile.damageWeight;

    // KO bonus
    const ko = koApprox(move, md, ctx);
    if (ko > 0) dmgComp += ko * profile.koBonus;

    // Recoil penalty (scaled by 1 - recoilTolerance)
    if (recoilFrac > 0) {
      dmgComp *= 1 - recoilFrac * (1 - profile.recoilTolerance);
    }

    // Accuracy risk (already folded in via damageHeuristic's acc); widen with riskTolerance
    // riskTolerance=1 -> no further penalty, riskTolerance=0 -> extra penalty for <100% acc moves
    const rawAcc = md.accuracy === true || md.accuracy === undefined ? 100 : (md.accuracy as number);
    if (rawAcc < 100) {
      const accFrac = rawAcc / 100;
      const extraPenalty = (1 - profile.riskTolerance) * (1 - accFrac);
      dmgComp *= 1 - extraPenalty;
    }

    // Priority bias for priority moves
    if ((md.priority || 0) > 0) {
      dmgComp *= 1 + profile.priorityBias;
    }

    total += dmgComp;
  }

  // ── Status / setup / hazard components ──
  total += statusValue(move, md, ctx) * profile.statusWeight;
  total += setupValue(move, md, ctx) * profile.setupWeight;
  total += hazardValue(move, md, ctx) * profile.hazardWeight;

  // Floor so every legal move has a sliver of chance to be picked
  if (total <= 0) total = 0.01;

  return { move, score: total };
}

/** Softmax pick with given temperature. temp=0 -> argmax; higher -> noisier. */
export function pickMove(scored: ScoredMove[], temperature: number): ScoredMove {
  const viable = scored.filter(s => s.score > 0);
  const pool = viable.length > 0 ? viable : scored.map(s => ({ ...s, score: 1 }));
  if (pool.length === 1) return pool[0];

  if (temperature <= 0.001) {
    // Argmax
    let best = pool[0];
    for (const s of pool) if (s.score > best.score) best = s;
    return best;
  }

  // Softmax over log(score)/temperature so scores stay scale-invariant.
  const logScores = pool.map(s => Math.log(s.score + 1e-9) / temperature);
  const maxLog = Math.max(...logScores);
  const exps = logScores.map(l => Math.exp(l - maxLog));
  const total = exps.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= exps[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
