// Shared types for the Pokémon party game

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: Stats;
  moves: [MoveId, MoveId];
  evolutionFrom?: number;
  evolutionTo?: number;
  tier: BoxTier;
  sprite: string;
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface IVs {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export type NatureName =
  | 'Hardy' | 'Lonely' | 'Brave' | 'Adamant' | 'Naughty'
  | 'Bold' | 'Docile' | 'Relaxed' | 'Impish' | 'Lax'
  | 'Timid' | 'Hasty' | 'Serious' | 'Jolly' | 'Naive'
  | 'Modest' | 'Mild' | 'Quiet' | 'Bashful' | 'Rash'
  | 'Calm' | 'Gentle' | 'Sassy' | 'Careful' | 'Quirky';

export interface PokemonInstance {
  instanceId: string;
  pokemon: Pokemon;
  ivs: IVs;
  nature: NatureName;
}

export interface Move {
  id: number;
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number;
  effect?: MoveEffect;
}

export interface MoveEffect {
  type: 'stat_boost' | 'heal' | 'status_condition';
  target: 'self' | 'ally' | 'enemy';
  stat?: keyof Stats;
  stages?: number;
  healPercent?: number;
}

export type MoveId = string;

export type BoxTier = 'common' | 'uncommon' | 'rare' | 'legendary';

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface Player {
  id: string;
  name: string;
  essence: number;
  elo: number;
}

export interface OwnedPokemon {
  id: string;
  playerId: string;
  pokemonId: number;
}

export interface BoxDefinition {
  tier: BoxTier;
  cost: number;
  pokemonPool: number[];
}

// Items

export type ItemType = 'tm' | 'token';

export interface OwnedItem {
  id: string;
  itemType: ItemType;
  itemData: string; // move name for TMs, pokemon ID (as string) for tokens
}
