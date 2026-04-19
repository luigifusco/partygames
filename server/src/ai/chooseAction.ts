// Choose action — top-level entry replacing the old buildChoice.
// ====================================================================

import type { MoveCtx, CharacterProfile } from './types.js';
import { resolveProfile, PROFILES } from './characterProfile.js';
import { scoreMove, pickMove, priorityKOBypass } from './scoring.js';

type CharLookup = (instanceId: string | undefined, speciesName: string) => string | undefined;

export interface AIOptions {
  /** Look up the character override for a given active pokemon. */
  getCharacter?: CharLookup;
}

export function buildChoice(battle: any, sideIndex: number, opts: AIOptions = {}): string {
  const side = battle.sides[sideIndex];
  const oppSide = battle.sides[1 - sideIndex];
  const req = side.activeRequest;
  if (!req) return 'default';
  const dex = battle.dex;

  // ── Force switch (same as legacy) ────────────────────────────────
  if (req.forceSwitch) {
    const switches = req.forceSwitch as boolean[];
    const choices: string[] = [];
    const chosen = new Set<number>();

    for (let i = 0; i < switches.length; i++) {
      if (!switches[i]) { choices.push('pass'); continue; }
      let found = false;
      for (let j = 0; j < side.pokemon.length; j++) {
        if (!side.pokemon[j].fainted && !side.pokemon[j].isActive && !chosen.has(j)) {
          choices.push(`switch ${j + 1}`);
          chosen.add(j);
          found = true;
          break;
        }
      }
      if (!found) choices.push('pass');
    }
    return choices.join(', ');
  }

  if (!req.active) return 'default';

  const isMulti = req.active.length > 1;
  const choices: string[] = [];
  const oppAlive = oppSide.pokemon.filter((p: any) => !p.fainted).length;

  for (let i = 0; i < req.active.length; i++) {
    const active = req.active[i];
    if (!active) { choices.push('pass'); continue; }
    const usable = active.moves.filter((m: any) => !m.disabled && m.pp > 0);
    if (usable.length === 0) { choices.push('move 1'); continue; }

    const selfPkmn = side.active[i];
    const selfHpPct = selfPkmn ? selfPkmn.hp / selfPkmn.maxhp : 1;

    const livingOppSlots: number[] = [];
    for (let j = 0; j < oppSide.active.length; j++) {
      const opp = oppSide.active[j];
      if (opp && !opp.fainted && opp.hp > 0) livingOppSlots.push(j);
    }
    const opponents = livingOppSlots.map((s) => oppSide.active[s]);

    // Resolve profile for this pokemon
    const speciesName = selfPkmn?.species?.name || selfPkmn?.speciesid || '';
    const characterOverride = opts.getCharacter?.(selfPkmn?.id, speciesName);
    const profile: CharacterProfile = resolveProfile(characterOverride, speciesName);

    const makeCtx = (tgt: any): MoveCtx => ({
      battle,
      dex,
      side,
      oppSide,
      selfPkmn,
      target: tgt && !tgt.fainted ? tgt : null,
      opponents,
      isMulti,
      selfHpPct,
      oppAlive,
      profile,
    });

    // For single-target foe moves in multi, score each move against every
    // living opponent and pick the best (move, target) pair. Otherwise
    // score once with the default (lowest-HP) primary target.
    const defaultTarget =
      opponents.length > 0
        ? opponents.reduce((a: any, b: any) => (a.hp / a.maxhp) < (b.hp / b.maxhp) ? a : b)
        : oppSide.active[0];
    const defaultCtx = makeCtx(defaultTarget);

    const isSingleFoeMove = (m: any) => {
      const t = m.target;
      return t === 'normal' || t === 'any' || t === 'adjacentFoe';
    };

    // Map from move → { bestSlot, bestScore, ctx used for filtering }
    const bestTargetByMove = new Map<any, { slot: number; score: number }>();
    const scored = usable.map((m: any) => {
      if (isMulti && isSingleFoeMove(m) && livingOppSlots.length > 1) {
        let bestScore = -Infinity;
        let bestSlot = livingOppSlots[0];
        let bestScored: any = null;
        for (const slot of livingOppSlots) {
          const ctxForTarget = makeCtx(oppSide.active[slot]);
          const s = scoreMove(m, ctxForTarget);
          if (s.score > bestScore) {
            bestScore = s.score;
            bestSlot = slot;
            bestScored = s;
          }
        }
        bestTargetByMove.set(m, { slot: bestSlot, score: bestScore });
        return bestScored || scoreMove(m, defaultCtx);
      }
      return scoreMove(m, defaultCtx);
    });

    // priorityKOBypass needs a ctx with a concrete target. For multi, evaluate
    // per-move against that move's best target so we don't miss KOs on the
    // non-primary opponent.
    let bypass: any = null;
    if (isMulti && livingOppSlots.length > 1) {
      for (const s of scored) {
        const md = dex.moves.get(s.move.id);
        if (!md || (md.priority || 0) <= 0 || s.score <= 0) continue;
        const slot = bestTargetByMove.get(s.move)?.slot ?? livingOppSlots[0];
        const ctxForTarget = makeCtx(oppSide.active[slot]);
        const candidate = priorityKOBypass([s], ctxForTarget);
        if (candidate && (!bypass || candidate.score > bypass.score)) bypass = candidate;
      }
    } else if (defaultCtx.target) {
      bypass = priorityKOBypass(scored, defaultCtx);
    }
    const pick = bypass || pickMove(scored, profile.temperature);
    const moveIdx = active.moves.indexOf(pick.move) + 1;

    // Friendly-fire avoidance / focus-fire targeting. For single-foe moves
    // in multi, use the target slot that scored best for this move.
    if (isMulti && isSingleFoeMove(pick.move)) {
      if (livingOppSlots.length > 0) {
        const tgt = bestTargetByMove.get(pick.move);
        const slot = tgt ? tgt.slot : livingOppSlots[0];
        choices.push(`move ${moveIdx} ${slot + 1}`);
      } else {
        choices.push(`move ${moveIdx}`);
      }
    } else {
      choices.push(`move ${moveIdx}`);
    }
  }
  return choices.join(', ');
}

export { PROFILES, resolveProfile };
