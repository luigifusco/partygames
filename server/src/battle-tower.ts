import { POKEMON } from '../../shared/pokemon-data.js';
import { HELD_ITEMS } from '../../shared/held-item-data.js';
import type { BoxTier, Pokemon as AppPokemon } from '../../shared/types.js';
import type { ProfileName } from '../../shared/character-profiles.js';
import { resolveCharacterName } from '../../shared/character-profiles.js';
import { BATTLE_TOWER_RUN_LENGTH, type BattleTowerFormat } from '../../shared/battle-tower.js';
import { randomAbilityForSpecies } from './showdown-battle.js';

const TRAINERS_PATH = '/pokemonparty/assets/trainers';

const TOWER_TRAINERS = [
  { name: 'Vera Volt', title: 'Tower Ace', sprite: `${TRAINERS_PATH}/volkner.png` },
  { name: 'Maris Tide', title: 'Tower Specialist', sprite: `${TRAINERS_PATH}/marlon.png` },
  { name: 'Rowan Shade', title: 'Tower Tactician', sprite: `${TRAINERS_PATH}/morty.png` },
  { name: 'Clara Fang', title: 'Tower Captain', sprite: `${TRAINERS_PATH}/clair.png` },
  { name: 'Silas Stone', title: 'Tower Veteran', sprite: `${TRAINERS_PATH}/steven.png` },
  { name: 'Iris Gale', title: 'Tower Prodigy', sprite: `${TRAINERS_PATH}/iris.png` },
  { name: 'Cynthia Vale', title: 'Tower Champion', sprite: `${TRAINERS_PATH}/cynthia.png` },
  { name: 'Redline', title: 'Silent Challenger', sprite: `${TRAINERS_PATH}/red.png` },
];

const TOWER_LINES = [
  'The elevator only goes up if you can keep pace.',
  'Three floors. Three chances for your team to crack.',
  'I hope your strategy has more than one gear.',
  'The Tower remembers every win. It remembers every mistake, too.',
  'No soft teams make it past this floor.',
  'Show me a team that can survive pressure.',
  'Strong trainers do not climb. They conquer.',
  'Your streak ends where my opening move begins.',
  'The view from the top is reserved for winners.',
  'Items ready. Team ready. No excuses.',
];

const GENERAL_ITEMS = [
  'leftovers',
  'sitrus-berry',
  'life-orb',
  'expert-belt',
  'focus-sash',
  'rocky-helmet',
  'lum-berry',
  'choice-scarf',
];

export interface BattleTowerPokemonEntry {
  pokemonId: number;
  heldItem: string;
  ability: string | null;
  character: ProfileName;
}

export interface BattleTowerOpponent {
  name: string;
  title: string;
  sprite: string;
  line: string;
  team: BattleTowerPokemonEntry[];
}

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function sample<T>(values: T[], count: number): T[] {
  const copy = [...values];
  const out: T[] = [];
  while (out.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function tierWeights(level: number, battleIndex: number): Record<BoxTier, number> {
  const pressure = level + battleIndex;
  if (pressure >= 9) return { common: 0, uncommon: 0, rare: 25, epic: 75, legendary: 0 };
  if (pressure >= 6) return { common: 0, uncommon: 5, rare: 45, epic: 50, legendary: 0 };
  if (pressure >= 3) return { common: 0, uncommon: 20, rare: 55, epic: 25, legendary: 0 };
  return { common: 0, uncommon: 45, rare: 45, epic: 10, legendary: 0 };
}

function weightedTier(weights: Record<BoxTier, number>): BoxTier {
  const entries = Object.entries(weights) as [BoxTier, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [tier, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return tier;
  }
  return 'rare';
}

function eligiblePokemon(): AppPokemon[] {
  return POKEMON.filter((pokemon) =>
    !pokemon.evolutionTo?.length &&
    pokemon.tier !== 'common' &&
    pokemon.tier !== 'legendary'
  );
}

function itemForPokemon(pokemon: AppPokemon): string {
  const validItems = new Set(HELD_ITEMS.map((item) => item.id).filter((id) => id !== 'eviolite'));
  const candidates: string[] = [];
  if (pokemon.types.includes('poison')) candidates.push('black-sludge');
  if (pokemon.stats.speed >= 100) candidates.push('choice-scarf', 'life-orb', 'focus-sash');
  if (pokemon.stats.attack >= pokemon.stats.spAtk + 20) candidates.push('choice-band', 'muscle-band', 'life-orb');
  if (pokemon.stats.spAtk >= pokemon.stats.attack + 20) candidates.push('choice-specs', 'wise-glasses', 'life-orb');
  if (pokemon.stats.hp + pokemon.stats.defense + pokemon.stats.spDef >= 280) candidates.push('leftovers', 'rocky-helmet', 'sitrus-berry');
  candidates.push(...GENERAL_ITEMS);
  const filtered = candidates.filter((id) => validItems.has(id));
  return pick(filtered.length > 0 ? filtered : [...validItems]);
}

function characterForPokemon(pokemon: AppPokemon): ProfileName {
  return resolveCharacterName(null, pokemon.name);
}

function generateTeam(teamSize: number, level: number, battleIndex: number, used: Set<number>): BattleTowerPokemonEntry[] {
  const pool = eligiblePokemon();
  const weights = tierWeights(level, battleIndex);
  const team: AppPokemon[] = [];
  const local = new Set<number>();
  let attempts = 0;
  while (team.length < teamSize && attempts < 300) {
    attempts += 1;
    const tier = weightedTier(weights);
    const tierPool = pool.filter((pokemon) =>
      pokemon.tier === tier &&
      !local.has(pokemon.id) &&
      (!used.has(pokemon.id) || pool.length < teamSize * BATTLE_TOWER_RUN_LENGTH * 2)
    );
    const fallback = pool.filter((pokemon) => !local.has(pokemon.id));
    const chosen = pick(tierPool.length > 0 ? tierPool : fallback);
    if (!chosen) break;
    local.add(chosen.id);
    used.add(chosen.id);
    team.push(chosen);
  }
  return team.map((pokemon) => ({
    pokemonId: pokemon.id,
    heldItem: itemForPokemon(pokemon),
    ability: randomAbilityForSpecies(pokemon.name) || null,
    character: characterForPokemon(pokemon),
  }));
}

export function generateBattleTowerOpponents(format: BattleTowerFormat, teamSize: number, level: number): BattleTowerOpponent[] {
  void format;
  const trainers = sample(TOWER_TRAINERS, BATTLE_TOWER_RUN_LENGTH);
  const used = new Set<number>();
  return Array.from({ length: BATTLE_TOWER_RUN_LENGTH }, (_, battleIndex) => {
    const trainer = trainers[battleIndex] ?? pick(TOWER_TRAINERS);
    return {
      ...trainer,
      line: pick(TOWER_LINES),
      team: generateTeam(teamSize, level, battleIndex, used),
    };
  });
}

