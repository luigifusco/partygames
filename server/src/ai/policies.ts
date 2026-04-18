// Uselessness filters ("policies")
// ====================================================================
// Each filter is a pure function (move, ctx) -> string|null where a
// non-null string ("reason") flags the move as useless in this context.
// applyHardFilters returns the first matching reason or null.

import type { MoveCtx } from './types.js';

// Showdown volatile names for "target is mid-invulnerable-charge-move"
const INVULN_VOLATILES_HIT_BY: Record<string, string[]> = {
  dig: ['earthquake', 'magnitude', 'fissure'],
  dive: ['surf', 'whirlpool'],
  fly: ['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows'],
  bounce: ['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows'],
  skydrop: ['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows'],
  phantomforce: [],
  shadowforce: [],
};

function moveId(m: any): string {
  return (m.id || '').toString().toLowerCase();
}

function getTypes(p: any): string[] {
  if (!p) return [];
  if (typeof p.getTypes === 'function') return p.getTypes();
  return p.types || [];
}

function hpPct(p: any): number {
  if (!p || !p.maxhp) return 1;
  return p.hp / p.maxhp;
}

type Filter = (move: any, md: any, ctx: MoveCtx) => string | null;

// ── Weather / terrain redundancy ───────────────────────────────────
const weatherRedundant: Filter = (_m, md, ctx) => {
  if (!md.weather) return null;
  const cur = ctx.battle.field?.weatherState?.id || '';
  const map: Record<string, string> = {
    raindance: 'raindance',
    sunnyday: 'sunnyday',
    sandstorm: 'sandstorm',
    hail: 'hail',
    snowscape: 'snow',
    snow: 'snow',
  };
  const wantId = map[(md.weather || '').toLowerCase()] || (md.weather || '').toLowerCase();
  if (wantId && cur === wantId) return 'weather-already-active';
  return null;
};

const terrainRedundant: Filter = (_m, md, ctx) => {
  if (!md.terrain) return null;
  const cur = ctx.battle.field?.terrainState?.id || '';
  if (cur && cur === (md.terrain || '').toLowerCase()) return 'terrain-already-active';
  return null;
};

// ── Hazards already at cap ─────────────────────────────────────────
const hazardRedundant: Filter = (_m, md, ctx) => {
  if (!md.sideCondition) return null;
  const oppCond = ctx.oppSide.sideConditions || {};
  const id = (md.sideCondition || '').toLowerCase();
  if (id === 'stealthrock' && oppCond.stealthrock) return 'sr-already-set';
  if (id === 'spikes' && oppCond.spikes && (oppCond.spikes.layers || 0) >= 3) return 'spikes-maxed';
  if (id === 'toxicspikes' && oppCond.toxicspikes && (oppCond.toxicspikes.layers || 0) >= 2) return 'tspikes-maxed';
  if (id === 'stickyweb' && oppCond.stickyweb) return 'web-already-set';
  return null;
};

// ── Screens already up on our side ─────────────────────────────────
const screenRedundant: Filter = (m, _md, ctx) => {
  const id = moveId(m);
  const mySide = ctx.side.sideConditions || {};
  if (id === 'reflect' && mySide.reflect) return 'reflect-up';
  if (id === 'lightscreen' && mySide.lightscreen) return 'lightscreen-up';
  if (id === 'auroraveil') {
    if (mySide.auroraveil) return 'auroraveil-up';
    const w = ctx.battle.field?.weatherState?.id || '';
    if (w !== 'hail' && w !== 'snow') return 'auroraveil-wrong-weather';
  }
  return null;
};

// ── Status redundancy / type immunity ──────────────────────────────
const statusRedundant: Filter = (_m, md, ctx) => {
  if (md.category !== 'Status') return null;
  const t = ctx.target;
  if (!t) return null;
  const targetTypes = getTypes(t);

  // Major status on already-statused target
  if (md.status && t.status) return 'target-already-statused';

  // Confusion on confused target
  if (md.volatileStatus === 'confusion' && t.volatiles?.confusion) return 'target-already-confused';

  // Specific status vs type immunities
  if (md.status === 'par' && (targetTypes.includes('Electric') || targetTypes.includes('Ground') && md.type === 'Electric')) return 'par-immune-type';
  if (md.status === 'par' && targetTypes.includes('Electric')) return 'par-electric';
  if (md.status === 'brn' && targetTypes.includes('Fire')) return 'brn-fire';
  if (md.status === 'frz' && targetTypes.includes('Ice')) return 'frz-ice';
  if ((md.status === 'psn' || md.status === 'tox') && (targetTypes.includes('Poison') || targetTypes.includes('Steel'))) return 'psn-immune-type';

  // Powder moves on Grass
  if (md.flags?.powder && targetTypes.includes('Grass')) return 'powder-grass';

  // Thunder Wave specifically on Ground
  if ((md.id === 'thunderwave' || (md.type === 'Electric' && md.status === 'par')) && targetTypes.includes('Ground')) return 'twave-ground';

  // Sleep on already-sleeping target
  if ((md.status === 'slp' || md.volatileStatus === 'yawn') && t.status === 'slp') return 'slp-already-sleeping';
  if (md.volatileStatus === 'yawn' && t.volatiles?.yawn) return 'yawn-already-drowsy';

  // Leech Seed on Grass or already seeded
  if (moveId(_m) === 'leechseed') {
    if (targetTypes.includes('Grass')) return 'leechseed-grass';
    if (t.volatiles?.leechseed) return 'leechseed-already';
  }

  // Taunt on already-taunted target
  if (md.volatileStatus === 'taunt' && t.volatiles?.taunt) return 'taunt-already';

  // Encore / Disable on already-under-that-effect target
  if (md.volatileStatus === 'encore' && t.volatiles?.encore) return 'encore-already';
  if (md.volatileStatus === 'disable' && t.volatiles?.disable) return 'disable-already';

  return null;
};

// ── Stat-boost caps ────────────────────────────────────────────────
const boostCapped: Filter = (_m, md, ctx) => {
  if (!md.boosts || md.status || md.volatileStatus) return null;
  const entries = Object.entries(md.boosts) as [string, number][];
  const isSelf = md.target === 'self' || md.target === 'adjacentAllyOrSelf' || md.target === 'allySide';
  const subject = isSelf ? ctx.selfPkmn : ctx.target;
  if (!subject) return null;
  const boosts = subject.boosts || {};
  if (isSelf) {
    const pos = entries.filter(([, v]) => v > 0);
    if (pos.length > 0 && pos.every(([s]) => (boosts[s] ?? 0) >= 6)) return 'self-boosts-maxed';
  } else {
    const neg = entries.filter(([, v]) => v < 0);
    if (neg.length > 0 && neg.every(([s]) => (boosts[s] ?? 0) <= -6)) return 'target-drops-maxed';
  }
  return null;
};

// ── Heal / substitute / belly drum redundancy ──────────────────────
const HEAL_MOVES = new Set([
  'recover', 'roost', 'softboiled', 'slackoff', 'milkdrink', 'healorder', 'moonlight', 'morningsun', 'synthesis', 'shoreup', 'strengthsap',
]);
const healAtFull: Filter = (m, _md, ctx) => {
  const id = moveId(m);
  if (HEAL_MOVES.has(id) && hpPct(ctx.selfPkmn) >= 1) return 'at-full-hp';
  if (id === 'rest') {
    if (hpPct(ctx.selfPkmn) >= 1) return 'rest-at-full';
    if (ctx.selfPkmn?.status === 'slp') return 'rest-asleep';
  }
  if (id === 'bellydrum') {
    if (hpPct(ctx.selfPkmn) <= 0.5) return 'bellydrum-low-hp';
    if ((ctx.selfPkmn?.boosts?.atk ?? 0) >= 6) return 'bellydrum-maxed';
  }
  if (id === 'substitute') {
    if (hpPct(ctx.selfPkmn) <= 0.25) return 'sub-low-hp';
    if (ctx.selfPkmn?.volatiles?.substitute) return 'sub-already';
  }
  return null;
};

// ── Target is semi-invulnerable (Dig/Dive/Fly/Bounce/etc) ──────────
const targetInvulnerable: Filter = (m, md, ctx) => {
  if (md.category === 'Status') return null;
  const t = ctx.target;
  if (!t || !t.volatiles) return null;
  for (const volName of Object.keys(INVULN_VOLATILES_HIT_BY)) {
    if (t.volatiles[volName]) {
      const hitters = INVULN_VOLATILES_HIT_BY[volName];
      if (!hitters.includes(moveId(m))) return `target-in-${volName}`;
    }
  }
  return null;
};

// ── Legality of limited-use moves ──────────────────────────────────
const limitedMoveLegality: Filter = (m, md, ctx) => {
  const id = moveId(m);
  const selfTurns = ctx.selfPkmn?.activeTurns ?? 0;

  if (id === 'fakeout' && selfTurns > 0) return 'fakeout-late';
  if (id === 'firstimpression' && selfTurns > 0) return 'firstimpression-late';

  // Dream Eater fails on non-sleeping target
  if (id === 'dreameater' && ctx.target && ctx.target.status !== 'slp') return 'dreameater-awake';

  // OHKO moves fail vs higher level (in our sim all level=100 so skip)
  // Sheer Cold fails on Ice types (Gen 7+ — Gen 5 actually works, but filter anyway in other gens)
  if (id === 'sheercold' && ctx.target) {
    const tt = getTypes(ctx.target);
    if (tt.includes('Ice')) return 'sheercold-ice';
  }

  // Belch requires ate-berry flag
  if (id === 'belch' && !ctx.selfPkmn?.ateBerry) return 'belch-no-berry';

  // Last Resort requires all other moves used
  if (id === 'lastresort') {
    const other = (ctx.selfPkmn?.moveSlots || []).filter((s: any) => s.id !== 'lastresort');
    if (other.length === 0) return 'lastresort-only-move';
    if (other.some((s: any) => !s.used)) return 'lastresort-untriggered';
  }

  // Trick / Switcheroo on empty-handed self or stuck-matching target
  if (id === 'trick' || id === 'switcheroo') {
    const myItem = ctx.selfPkmn?.item;
    const theirItem = ctx.target?.item;
    if (!myItem && !theirItem) return 'trick-no-items';
  }

  return null;
};

// ── Self-destruct safety ───────────────────────────────────────────
const selfDestructUnsafe: Filter = (_m, md, ctx) => {
  if (!md.selfdestruct) return null;
  const allyAlive = ctx.side.pokemon.filter((p: any) => !p.fainted).length;
  if (allyAlive > 1) return 'selfdestruct-team-alive';
  return null;
};

// ── Snatched list (all filters to evaluate) ────────────────────────
const FILTERS: Filter[] = [
  weatherRedundant,
  terrainRedundant,
  hazardRedundant,
  screenRedundant,
  statusRedundant,
  boostCapped,
  healAtFull,
  targetInvulnerable,
  limitedMoveLegality,
  selfDestructUnsafe,
];

/** Returns first reason string the move is useless, or null if viable. */
export function applyHardFilters(move: any, md: any, ctx: MoveCtx): string | null {
  for (const f of FILTERS) {
    const r = f(move, md, ctx);
    if (r) return r;
  }
  return null;
}
