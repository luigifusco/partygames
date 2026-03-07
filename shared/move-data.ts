// Move name → type mapping for TM sprites and display
import type { PokemonType } from './types';

export const MOVE_TYPES: Record<string, PokemonType> = {
  // Normal
  'Tackle': 'normal',
  'Scratch': 'normal',
  'Quick Attack': 'normal',
  'Pound': 'normal',
  'Slam': 'normal',
  'Headbutt': 'normal',
  'Take Down': 'normal',
  'Body Slam': 'normal',
  'Hyper Fang': 'normal',
  'Struggle': 'normal',
  'Hidden Power': 'normal',

  // Fire
  'Ember': 'fire',
  'Flamethrower': 'fire',
  'Sunny Day': 'fire',

  // Water
  'Water Gun': 'water',
  'Surf': 'water',
  'Hydro Pump': 'water',
  'Rain Dance': 'water',

  // Electric
  'Thunderbolt': 'electric',
  'Thunder': 'electric',

  // Grass
  'Vine Whip': 'grass',
  'Razor Leaf': 'grass',
  'Giga Drain': 'grass',
  'Solar Beam': 'grass',
  'Absorb': 'grass',

  // Ice
  'Ice Beam': 'ice',

  // Fighting
  'Karate Chop': 'fighting',
  'Low Kick': 'fighting',
  'Cross Chop': 'fighting',
  'Dynamic Punch': 'fighting',

  // Poison
  'Poison Sting': 'poison',
  'Sludge Bomb': 'poison',

  // Ground
  'Earthquake': 'ground',
  'Dig': 'ground',

  // Flying
  'Gust': 'flying',
  'Wing Attack': 'flying',
  'Aerial Ace': 'flying',
  'Air Slash': 'flying',
  'Air Cutter': 'flying',
  'Peck': 'flying',
  'Drill Peck': 'flying',

  // Psychic
  'Confusion': 'psychic',
  'Psybeam': 'psychic',
  'Psychic': 'psychic',
  'Zen Headbutt': 'psychic',

  // Bug
  'Bug Bite': 'bug',
  'Silver Wind': 'bug',
  'Pin Missile': 'bug',

  // Rock
  'Rock Throw': 'rock',
  'Rock Slide': 'rock',

  // Ghost
  'Lick': 'ghost',
  'Shadow Ball': 'ghost',
  'Night Shade': 'ghost',

  // Dragon
  'Twister': 'dragon',
  'Dragon Claw': 'dragon',

  // Dark
  'Bite': 'dark',
  'Crunch': 'dark',

  // Steel
  'Meteor Mash': 'steel',
};

export const ALL_MOVE_NAMES = Object.keys(MOVE_TYPES);

export function getMoveType(moveName: string): PokemonType {
  return MOVE_TYPES[moveName] ?? 'normal';
}

export function getTMSprite(moveName: string): string {
  const type = getMoveType(moveName);
  return `/assets/tm-${type}.png`;
}
