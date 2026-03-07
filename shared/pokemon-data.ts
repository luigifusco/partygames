// Pokémon data — game-specific fields only; stats & types sourced from species-data.ts
import type { Pokemon, PokemonType, BoxTier } from './types';
import { SPECIES_DATA } from './species-data';

interface PokemonEntry {
  id: number;
  name: string;
  moves: [string, string];
  tier: BoxTier;
  evolutionFrom?: number;
  evolutionTo?: number;
}

function buildPokemon(entry: PokemonEntry): Pokemon {
  const species = SPECIES_DATA[entry.name];
  if (!species) throw new Error(`Unknown species: ${entry.name}`);
  return {
    id: entry.id,
    name: entry.name,
    types: species.types.map((t) => t.toLowerCase()) as PokemonType[],
    stats: {
      hp: species.bs.hp,
      attack: species.bs.at,
      defense: species.bs.df,
      spAtk: species.bs.sa,
      spDef: species.bs.sd,
      speed: species.bs.sp,
    },
    moves: entry.moves,
    tier: entry.tier,
    sprite: `/assets/${entry.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}.gif`,
    evolutionFrom: entry.evolutionFrom,
    evolutionTo: entry.evolutionTo,
  };
}

const ENTRIES: PokemonEntry[] = [
  // Common tier — weak evolution lines
  { id: 10, name: 'Caterpie', moves: ['Tackle', 'Bug Bite'], tier: 'common', evolutionTo: 11 },
  { id: 11, name: 'Metapod', moves: ['Tackle', 'Struggle'], tier: 'common', evolutionFrom: 10, evolutionTo: 12 },
  { id: 12, name: 'Butterfree', moves: ['Silver Wind', 'Psybeam'], tier: 'common', evolutionFrom: 11 },
  { id: 13, name: 'Weedle', moves: ['Tackle', 'Poison Sting'], tier: 'common', evolutionTo: 14 },
  { id: 14, name: 'Kakuna', moves: ['Tackle', 'Struggle'], tier: 'common', evolutionFrom: 13, evolutionTo: 15 },
  { id: 15, name: 'Beedrill', moves: ['Poison Sting', 'Pin Missile'], tier: 'common', evolutionFrom: 14 },
  { id: 16, name: 'Pidgey', moves: ['Tackle', 'Gust'], tier: 'common', evolutionTo: 17 },
  { id: 17, name: 'Pidgeotto', moves: ['Tackle', 'Wing Attack'], tier: 'common', evolutionFrom: 16, evolutionTo: 18 },
  { id: 18, name: 'Pidgeot', moves: ['Wing Attack', 'Aerial Ace'], tier: 'common', evolutionFrom: 17 },
  { id: 19, name: 'Rattata', moves: ['Tackle', 'Quick Attack'], tier: 'common', evolutionTo: 20 },
  { id: 20, name: 'Raticate', moves: ['Quick Attack', 'Hyper Fang'], tier: 'common', evolutionFrom: 19 },
  { id: 21, name: 'Spearow', moves: ['Tackle', 'Peck'], tier: 'common', evolutionTo: 22 },
  { id: 22, name: 'Fearow', moves: ['Peck', 'Drill Peck'], tier: 'common', evolutionFrom: 21 },
  { id: 41, name: 'Zubat', moves: ['Bite', 'Poison Sting'], tier: 'common', evolutionTo: 42 },
  { id: 42, name: 'Golbat', moves: ['Bite', 'Air Cutter'], tier: 'common', evolutionFrom: 41 },

  // Uncommon tier — moderate evolution lines
  { id: 1, name: 'Bulbasaur', moves: ['Vine Whip', 'Poison Sting'], tier: 'uncommon', evolutionTo: 2 },
  { id: 2, name: 'Ivysaur', moves: ['Razor Leaf', 'Poison Sting'], tier: 'uncommon', evolutionFrom: 1, evolutionTo: 3 },
  { id: 3, name: 'Venusaur', moves: ['Giga Drain', 'Sludge Bomb'], tier: 'uncommon', evolutionFrom: 2 },
  { id: 4, name: 'Charmander', moves: ['Ember', 'Scratch'], tier: 'uncommon', evolutionTo: 5 },
  { id: 5, name: 'Charmeleon', moves: ['Ember', 'Flamethrower'], tier: 'uncommon', evolutionFrom: 4, evolutionTo: 6 },
  { id: 6, name: 'Charizard', moves: ['Flamethrower', 'Air Slash'], tier: 'uncommon', evolutionFrom: 5 },
  { id: 7, name: 'Squirtle', moves: ['Water Gun', 'Tackle'], tier: 'uncommon', evolutionTo: 8 },
  { id: 8, name: 'Wartortle', moves: ['Water Gun', 'Bite'], tier: 'uncommon', evolutionFrom: 7, evolutionTo: 9 },
  { id: 9, name: 'Blastoise', moves: ['Hydro Pump', 'Bite'], tier: 'uncommon', evolutionFrom: 8 },
  { id: 25, name: 'Pikachu', moves: ['Thunderbolt', 'Quick Attack'], tier: 'uncommon', evolutionFrom: 172, evolutionTo: 26 },
  { id: 26, name: 'Raichu', moves: ['Thunderbolt', 'Thunder'], tier: 'uncommon', evolutionFrom: 25 },
  { id: 63, name: 'Abra', moves: ['Confusion', 'Hidden Power'], tier: 'uncommon', evolutionTo: 64 },
  { id: 64, name: 'Kadabra', moves: ['Confusion', 'Psybeam'], tier: 'uncommon', evolutionFrom: 63, evolutionTo: 65 },
  { id: 65, name: 'Alakazam', moves: ['Psybeam', 'Psychic'], tier: 'uncommon', evolutionFrom: 64 },
  { id: 66, name: 'Machop', moves: ['Karate Chop', 'Low Kick'], tier: 'uncommon', evolutionTo: 67 },
  { id: 67, name: 'Machoke', moves: ['Karate Chop', 'Cross Chop'], tier: 'uncommon', evolutionFrom: 66, evolutionTo: 68 },
  { id: 68, name: 'Machamp', moves: ['Cross Chop', 'Dynamic Punch'], tier: 'uncommon', evolutionFrom: 67 },

  // Rare tier — strong evolution lines
  { id: 92, name: 'Gastly', moves: ['Lick', 'Night Shade'], tier: 'rare', evolutionTo: 93 },
  { id: 93, name: 'Haunter', moves: ['Lick', 'Shadow Ball'], tier: 'rare', evolutionFrom: 92, evolutionTo: 94 },
  { id: 94, name: 'Gengar', moves: ['Shadow Ball', 'Sludge Bomb'], tier: 'rare', evolutionFrom: 93 },
  { id: 147, name: 'Dratini', moves: ['Twister', 'Slam'], tier: 'rare', evolutionTo: 148 },
  { id: 148, name: 'Dragonair', moves: ['Twister', 'Dragon Claw'], tier: 'rare', evolutionFrom: 147, evolutionTo: 149 },
  { id: 149, name: 'Dragonite', moves: ['Dragon Claw', 'Aerial Ace'], tier: 'rare', evolutionFrom: 148 },
  { id: 246, name: 'Larvitar', moves: ['Rock Throw', 'Dig'], tier: 'rare', evolutionTo: 247 },
  { id: 247, name: 'Pupitar', moves: ['Rock Throw', 'Rock Slide'], tier: 'rare', evolutionFrom: 246, evolutionTo: 248 },
  { id: 248, name: 'Tyranitar', moves: ['Rock Slide', 'Crunch'], tier: 'rare', evolutionFrom: 247 },
  { id: 371, name: 'Bagon', moves: ['Twister', 'Headbutt'], tier: 'rare', evolutionTo: 372 },
  { id: 372, name: 'Shelgon', moves: ['Twister', 'Zen Headbutt'], tier: 'rare', evolutionFrom: 371, evolutionTo: 373 },
  { id: 373, name: 'Salamence', moves: ['Dragon Claw', 'Air Slash'], tier: 'rare', evolutionFrom: 372 },

  // Epic tier
  { id: 374, name: 'Beldum', moves: ['Take Down', 'Zen Headbutt'], tier: 'epic', evolutionTo: 375 },
  { id: 375, name: 'Metang', moves: ['Take Down', 'Meteor Mash'], tier: 'epic', evolutionFrom: 374, evolutionTo: 376 },
  { id: 376, name: 'Metagross', moves: ['Meteor Mash', 'Psychic'], tier: 'epic', evolutionFrom: 375 },
  { id: 143, name: 'Snorlax', moves: ['Body Slam', 'Earthquake'], tier: 'epic' },
  { id: 131, name: 'Lapras', moves: ['Bite', 'Ice Beam'], tier: 'epic' },
  { id: 130, name: 'Gyarados', moves: ['Hydro Pump', 'Earthquake'], tier: 'epic' },

  // Weather Pokémon
  { id: 270, name: 'Lotad', moves: ['Rain Dance', 'Absorb'], tier: 'uncommon', evolutionTo: 271 },
  { id: 271, name: 'Lombre', moves: ['Rain Dance', 'Surf'], tier: 'uncommon', evolutionFrom: 270, evolutionTo: 272 },
  { id: 272, name: 'Ludicolo', moves: ['Rain Dance', 'Surf'], tier: 'uncommon', evolutionFrom: 271 },
  { id: 102, name: 'Exeggcute', moves: ['Sunny Day', 'Confusion'], tier: 'uncommon', evolutionTo: 103 },
  { id: 103, name: 'Exeggutor', moves: ['Solar Beam', 'Psychic'], tier: 'uncommon', evolutionFrom: 102 },
];

export const POKEMON: Pokemon[] = ENTRIES.map(buildPokemon);

export const POKEMON_BY_ID: Record<number, Pokemon> = Object.fromEntries(
  POKEMON.map((p) => [p.id, p])
);
