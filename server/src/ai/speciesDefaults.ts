// Species default character map
// ====================================================================
// Hand-curated mapping of species -> character profile.
// Anything not listed here falls back to 'balanced'.
// Keys are normalized (lowercase, alphanum only) — see normalizeSpeciesKey.

import type { ProfileName } from './types.js';

export const SPECIES_CHARACTER: Record<string, ProfileName> = {
  // ── glassCannon: frail, hard-hitting offense ──
  alakazam: 'glassCannon',
  gengar: 'glassCannon',
  garchomp: 'glassCannon',
  hydreigon: 'glassCannon',
  haxorus: 'glassCannon',
  weavile: 'glassCannon',
  mienshao: 'glassCannon',
  darmanitan: 'glassCannon',
  electrode: 'glassCannon',
  sceptile: 'glassCannon',
  infernape: 'glassCannon',
  greninja: 'glassCannon',
  tauros: 'glassCannon',
  kingler: 'glassCannon',
  persian: 'glassCannon',
  pikachu: 'glassCannon',
  raichu: 'glassCannon',

  // ── setupSweeper: wants to boost then sweep ──
  gyarados: 'setupSweeper',
  dragonite: 'setupSweeper',
  scizor: 'setupSweeper',
  volcarona: 'setupSweeper',
  salamence: 'setupSweeper',
  tyranitar: 'setupSweeper',
  kingdra: 'setupSweeper',
  feraligatr: 'setupSweeper',
  lucario: 'setupSweeper',
  conkeldurr: 'setupSweeper',
  charizard: 'setupSweeper',
  machamp: 'setupSweeper',
  blaziken: 'setupSweeper',
  metagross: 'setupSweeper',
  absol: 'setupSweeper',
  crobat: 'setupSweeper',

  // ── statusSpammer: wants to stall, spread status, set hazards ──
  blissey: 'statusSpammer',
  chansey: 'statusSpammer',
  ferrothorn: 'statusSpammer',
  forretress: 'statusSpammer',
  amoonguss: 'statusSpammer',
  gliscor: 'statusSpammer',
  whimsicott: 'statusSpammer',
  sableye: 'statusSpammer',
  jynx: 'statusSpammer',
  clefable: 'statusSpammer',
  venusaur: 'statusSpammer',
  gardevoir: 'statusSpammer',
  dusknoir: 'statusSpammer',
  cofagrigus: 'statusSpammer',
  umbreon: 'statusSpammer',

  // Everything else -> balanced (implicit default).
};
