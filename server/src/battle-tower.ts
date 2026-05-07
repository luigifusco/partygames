import { POKEMON } from '../../shared/pokemon-data.js';
import { HELD_ITEMS, HELD_ITEMS_BY_ID } from '../../shared/held-item-data.js';
import { TM_LEARNSETS } from '../../shared/tm-learnsets.js';
import type { BoxTier, Pokemon as AppPokemon } from '../../shared/types.js';
import type { ProfileName } from '../../shared/character-profiles.js';
import { resolveCharacterName } from '../../shared/character-profiles.js';
import {
  BATTLE_TOWER_RUN_LENGTH,
  battleTowerBattleBracket,
  battleTowerDifficultyLabel,
  type BattleTowerDifficultyBracket,
  type BattleTowerFormat,
} from '../../shared/battle-tower.js';
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
  moves?: [string, string];
}

export interface BattleTowerOpponent {
  name: string;
  title: string;
  sprite: string;
  line: string;
  difficultyLabel: string;
  themeName?: string;
  themeDescription?: string;
  team: BattleTowerPokemonEntry[];
}

interface BonusBossTeam {
  themeName: string;
  themeDescription: string;
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

function pokemonIdForSpecies(speciesName: string): number {
  const pokemon = POKEMON.find((entry) => entry.name === speciesName);
  if (!pokemon) throw new Error(`Unknown Battle Tower bonus boss species: ${speciesName}`);
  return pokemon.id;
}

function bonusEntry(
  speciesName: string,
  heldItem: string,
  ability: string,
  character: ProfileName,
  moves: [string, string],
): BattleTowerPokemonEntry {
  if (!HELD_ITEMS_BY_ID[heldItem]) throw new Error(`Unknown Battle Tower bonus boss held item: ${heldItem}`);
  const learnset = TM_LEARNSETS[speciesName] ?? [];
  for (const move of moves) {
    if (!learnset.includes(move)) {
      throw new Error(`${speciesName} cannot learn Battle Tower bonus boss move: ${move}`);
    }
  }
  return {
    pokemonId: pokemonIdForSpecies(speciesName),
    heldItem,
    ability,
    character,
    moves,
  };
}

const BONUS_BOSS_SINGLE_TEAMS: BonusBossTeam[] = [
  {
    themeName: 'Dragon Tyranny',
    themeDescription: 'High-pressure Dragon offense with one setup threat and two immediate nukes.',
    line: 'You have reached the dragon floor. Every turn from here is a test of nerve.',
    team: [
      bonusEntry('Garchomp', 'choice-band', 'Rough Skin', 'glassCannon', ['Outrage', 'Earthquake']),
      bonusEntry('Salamence', 'life-orb', 'Intimidate', 'setupSweeper', ['Dragon Dance', 'Outrage']),
      bonusEntry('Hydreigon', 'choice-specs', 'Levitate', 'glassCannon', ['Draco Meteor', 'Fire Blast']),
    ],
  },
  {
    themeName: 'Rain Overdrive',
    themeDescription: 'Politoed sets Drizzle so Swift Swim attackers can overwhelm the field.',
    line: 'The forecast at the summit is simple: rain, pressure, and no shelter.',
    team: [
      bonusEntry('Politoed', 'leftovers', 'Drizzle', 'balanced', ['Scald', 'Ice Beam']),
      bonusEntry('Kingdra', 'life-orb', 'Swift Swim', 'setupSweeper', ['Hydro Pump', 'Draco Meteor']),
      bonusEntry('Kabutops', 'choice-band', 'Swift Swim', 'glassCannon', ['Aqua Tail', 'Stone Edge']),
    ],
  },
  {
    themeName: 'Sun Furnace',
    themeDescription: 'Ninetales sets Drought for Chlorophyll speed, instant Solar Beam, and boosted Fire damage.',
    line: 'At this height, the sun does not warm. It burns.',
    team: [
      bonusEntry('Ninetales', 'leftovers', 'Drought', 'balanced', ['Fire Blast', 'Solar Beam']),
      bonusEntry('Venusaur', 'black-sludge', 'Chlorophyll', 'statusSpammer', ['Sleep Powder', 'Solar Beam']),
      bonusEntry('Volcarona', 'life-orb', 'Flame Body', 'setupSweeper', ['Quiver Dance', 'Fire Blast']),
    ],
  },
  {
    themeName: 'Sand Citadel',
    themeDescription: 'Hippowdon and Tyranitar keep sand active while Excadrill converts it into speed.',
    line: 'Every tower needs a foundation. Mine is stone, sand, and patience.',
    team: [
      bonusEntry('Hippowdon', 'leftovers', 'Sand Stream', 'balanced', ['Stealth Rock', 'Earthquake']),
      bonusEntry('Excadrill', 'life-orb', 'Sand Rush', 'glassCannon', ['Earthquake', 'Iron Head']),
      bonusEntry('Tyranitar', 'choice-band', 'Sand Stream', 'setupSweeper', ['Stone Edge', 'Crunch']),
    ],
  },
  {
    themeName: 'Contact Punishment',
    themeDescription: 'Rocky Helmet, Rough Skin, Iron Barbs, Mummy, and burns make contact attacks costly.',
    line: 'Strike carelessly and the Tower will make the counterattack for me.',
    team: [
      bonusEntry('Ferrothorn', 'rocky-helmet', 'Iron Barbs', 'statusSpammer', ['Leech Seed', 'Gyro Ball']),
      bonusEntry('Garchomp', 'rocky-helmet', 'Rough Skin', 'glassCannon', ['Dragon Claw', 'Earthquake']),
      bonusEntry('Cofagrigus', 'leftovers', 'Mummy', 'statusSpammer', ['Will-O-Wisp', 'Shadow Ball']),
    ],
  },
  {
    themeName: 'Anti-Sweeper Control',
    themeDescription: 'Dual Intimidate, burn, paralysis, and priority deny clean setup sweeps.',
    line: 'Fast teams all ask the same question. My answer is control.',
    team: [
      bonusEntry('Gyarados', 'leftovers', 'Intimidate', 'balanced', ['Thunder Wave', 'Aqua Tail']),
      bonusEntry('Arcanine', 'rocky-helmet', 'Intimidate', 'balanced', ['Will-O-Wisp', 'Flare Blitz']),
      bonusEntry('Metagross', 'choice-band', 'Clear Body', 'setupSweeper', ['Bullet Punch', 'Meteor Mash']),
    ],
  },
  {
    themeName: 'Trick Room Inversion',
    themeDescription: 'Slow breakers use Trick Room to turn low Speed into the winning stat.',
    line: 'The clock at the top of the Tower runs backward.',
    team: [
      bonusEntry('Reuniclus', 'mental-herb', 'Magic Guard', 'statusSpammer', ['Trick Room', 'Psychic']),
      bonusEntry('Rhyperior', 'choice-band', 'Solid Rock', 'setupSweeper', ['Earthquake', 'Stone Edge']),
      bonusEntry('Conkeldurr', 'flame-orb', 'Guts', 'setupSweeper', ['Hammer Arm', 'Stone Edge']),
    ],
  },
  {
    themeName: "Champion's Balance",
    themeDescription: 'A broad champion-style core with Steel pressure, Water bulk, and Dragon coverage.',
    line: 'No weather. No gimmick. Just the cleanest team at the top of the Tower.',
    team: [
      bonusEntry('Metagross', 'expert-belt', 'Clear Body', 'setupSweeper', ['Meteor Mash', 'Earthquake']),
      bonusEntry('Milotic', 'leftovers', 'Marvel Scale', 'balanced', ['Scald', 'Ice Beam']),
      bonusEntry('Hydreigon', 'life-orb', 'Levitate', 'glassCannon', ['Draco Meteor', 'Fire Blast']),
    ],
  },
];

const BONUS_BOSS_DOUBLE_TEAMS: BonusBossTeam[] = [
  {
    themeName: 'Dragon Tyranny',
    themeDescription: 'Dragon pressure adapted for doubles with safer Dragon Claw lines and Levitate support.',
    line: 'Two targets. Four dragons. The math is not in your favor.',
    team: [
      bonusEntry('Dragonite', 'lum-berry', 'Multiscale', 'setupSweeper', ['Dragon Dance', 'Dragon Claw']),
      bonusEntry('Haxorus', 'choice-band', 'Mold Breaker', 'glassCannon', ['Dragon Claw', 'Earthquake']),
      bonusEntry('Kingdra', 'life-orb', 'Swift Swim', 'balanced', ['Hydro Pump', 'Draco Meteor']),
      bonusEntry('Hydreigon', 'expert-belt', 'Levitate', 'glassCannon', ['Draco Meteor', 'Fire Blast']),
    ],
  },
  {
    themeName: 'Rain Overdrive',
    themeDescription: 'Drizzle plus three Swift Swim attackers creates immediate rain-speed pressure.',
    line: 'When the rain starts here, it does not stop for challengers.',
    team: [
      bonusEntry('Politoed', 'leftovers', 'Drizzle', 'balanced', ['Scald', 'Ice Beam']),
      bonusEntry('Kingdra', 'life-orb', 'Swift Swim', 'setupSweeper', ['Hydro Pump', 'Draco Meteor']),
      bonusEntry('Ludicolo', 'wise-glasses', 'Swift Swim', 'balanced', ['Hydro Pump', 'Giga Drain']),
      bonusEntry('Kabutops', 'choice-band', 'Swift Swim', 'glassCannon', ['Aqua Tail', 'Stone Edge']),
    ],
  },
  {
    themeName: 'Sun Furnace',
    themeDescription: 'Drought powers Fire attackers while Venusaur converts sun into speed and sleep pressure.',
    line: 'Do not look directly at this team. Battle it, if you can.',
    team: [
      bonusEntry('Ninetales', 'leftovers', 'Drought', 'balanced', ['Fire Blast', 'Solar Beam']),
      bonusEntry('Venusaur', 'black-sludge', 'Chlorophyll', 'statusSpammer', ['Sleep Powder', 'Solar Beam']),
      bonusEntry('Darmanitan', 'choice-band', 'Sheer Force', 'glassCannon', ['Flare Blitz', 'Rock Slide']),
      bonusEntry('Chandelure', 'wise-glasses', 'Flash Fire', 'glassCannon', ['Fire Blast', 'Shadow Ball']),
    ],
  },
  {
    themeName: 'Sand Citadel',
    themeDescription: 'Sand Stream anchors Excadrill, Garchomp, and Tyranitar around Rock/Ground pressure.',
    line: 'The sand gets everywhere, especially into winning streaks.',
    team: [
      bonusEntry('Hippowdon', 'leftovers', 'Sand Stream', 'balanced', ['Stealth Rock', 'Earthquake']),
      bonusEntry('Excadrill', 'life-orb', 'Sand Rush', 'glassCannon', ['Earthquake', 'Iron Head']),
      bonusEntry('Garchomp', 'choice-band', 'Sand Veil', 'glassCannon', ['Dragon Claw', 'Earthquake']),
      bonusEntry('Tyranitar', 'expert-belt', 'Sand Stream', 'setupSweeper', ['Stone Edge', 'Crunch']),
    ],
  },
  {
    themeName: 'Contact Punishment',
    themeDescription: 'Two armored pivots, Mummy, Toxic, and Foul Play punish direct physical pressure.',
    line: 'Every contact move has a price. This floor collects immediately.',
    team: [
      bonusEntry('Ferrothorn', 'rocky-helmet', 'Iron Barbs', 'statusSpammer', ['Leech Seed', 'Gyro Ball']),
      bonusEntry('Forretress', 'rocky-helmet', 'Sturdy', 'statusSpammer', ['Spikes', 'Gyro Ball']),
      bonusEntry('Cofagrigus', 'leftovers', 'Mummy', 'statusSpammer', ['Will-O-Wisp', 'Shadow Ball']),
      bonusEntry('Umbreon', 'sitrus-berry', 'Synchronize', 'statusSpammer', ['Toxic', 'Foul Play']),
    ],
  },
  {
    themeName: 'Anti-Sweeper Control',
    themeDescription: 'Intimidate, paralysis, burn, priority, and Blissey bulk slow down explosive teams.',
    line: 'I do not need to outspeed you if I can make speed meaningless.',
    team: [
      bonusEntry('Gyarados', 'leftovers', 'Intimidate', 'balanced', ['Thunder Wave', 'Aqua Tail']),
      bonusEntry('Arcanine', 'rocky-helmet', 'Intimidate', 'balanced', ['Will-O-Wisp', 'Flare Blitz']),
      bonusEntry('Scizor', 'life-orb', 'Technician', 'setupSweeper', ['Bullet Punch', 'U-turn']),
      bonusEntry('Blissey', 'leftovers', 'Natural Cure', 'statusSpammer', ['Thunder Wave', 'Ice Beam']),
    ],
  },
  {
    themeName: 'Trick Room Inversion',
    themeDescription: 'Two Trick Room setters and two slow breakers flip doubles turn order.',
    line: 'Speed brought you up the Tower. It will not carry you through this room.',
    team: [
      bonusEntry('Bronzong', 'mental-herb', 'Levitate', 'statusSpammer', ['Trick Room', 'Gyro Ball']),
      bonusEntry('Reuniclus', 'life-orb', 'Magic Guard', 'statusSpammer', ['Trick Room', 'Psychic']),
      bonusEntry('Rhyperior', 'muscle-band', 'Solid Rock', 'setupSweeper', ['Earthquake', 'Stone Edge']),
      bonusEntry('Conkeldurr', 'flame-orb', 'Guts', 'setupSweeper', ['Hammer Arm', 'Stone Edge']),
    ],
  },
  {
    themeName: "Champion's Balance",
    themeDescription: 'A flexible doubles core with Steel priority, Water bulk, Intimidate, and broad coverage.',
    line: 'The final floor favors teams with no obvious seam.',
    team: [
      bonusEntry('Metagross', 'expert-belt', 'Clear Body', 'setupSweeper', ['Meteor Mash', 'Earthquake']),
      bonusEntry('Milotic', 'leftovers', 'Marvel Scale', 'balanced', ['Scald', 'Ice Beam']),
      bonusEntry('Scizor', 'choice-band', 'Technician', 'setupSweeper', ['Bullet Punch', 'U-turn']),
      bonusEntry('Arcanine', 'sitrus-berry', 'Intimidate', 'balanced', ['Flare Blitz', 'Close Combat']),
    ],
  },
];

const BONUS_BOSS_TEAMS: Record<BattleTowerFormat, BonusBossTeam[]> = {
  single: BONUS_BOSS_SINGLE_TEAMS,
  double: BONUS_BOSS_DOUBLE_TEAMS,
};

function tierWeights(bracket: BattleTowerDifficultyBracket): Record<BoxTier, number> {
  if (bracket >= 4) return { common: 0, uncommon: 0, rare: 0, epic: 100, legendary: 0 };
  if (bracket >= 3) return { common: 0, uncommon: 0, rare: 25, epic: 75, legendary: 0 };
  if (bracket >= 2) return { common: 0, uncommon: 5, rare: 45, epic: 50, legendary: 0 };
  if (bracket >= 1) return { common: 0, uncommon: 20, rare: 55, epic: 25, legendary: 0 };
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

function cloneTowerTeam(team: BattleTowerPokemonEntry[]): BattleTowerPokemonEntry[] {
  return team.map((entry) => ({
    ...entry,
    moves: entry.moves ? [...entry.moves] as [string, string] : undefined,
  }));
}

function bonusBossTeam(format: BattleTowerFormat, teamSize: number): BonusBossTeam | null {
  const teams = BONUS_BOSS_TEAMS[format].filter((team) => team.team.length === teamSize);
  if (teams.length === 0) return null;
  const chosen = pick(teams);
  return {
    ...chosen,
    team: cloneTowerTeam(chosen.team),
  };
}

function generateTeam(teamSize: number, bracket: BattleTowerDifficultyBracket, used: Set<number>): BattleTowerPokemonEntry[] {
  const pool = eligiblePokemon();
  const weights = tierWeights(bracket);
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
  const trainers = sample(TOWER_TRAINERS, BATTLE_TOWER_RUN_LENGTH);
  const used = new Set<number>();
  return Array.from({ length: BATTLE_TOWER_RUN_LENGTH }, (_, battleIndex) => {
    const trainer = trainers[battleIndex] ?? pick(TOWER_TRAINERS);
    const bracket = battleTowerBattleBracket(level, battleIndex);
    const bonusTeam = bracket >= 4 ? bonusBossTeam(format, teamSize) : null;
    return {
      ...trainer,
      line: bonusTeam?.line ?? pick(TOWER_LINES),
      difficultyLabel: battleTowerDifficultyLabel(bracket),
      themeName: bonusTeam?.themeName,
      themeDescription: bonusTeam?.themeDescription,
      team: bonusTeam?.team ?? generateTeam(teamSize, bracket, used),
    };
  });
}
