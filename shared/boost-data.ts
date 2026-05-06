// Boost items — one per stat, maxes out the IV when used on a Pokémon
// Sprites from Pokémon Showdown CDN (vitamin item icons)

import type { Stats } from './types';

export type StatKey = keyof Stats;

export interface BoostItem {
  stat: StatKey;
  name: string;        // display name (e.g. "Protein")
  spriteSlug: string;  // Showdown CDN slug (e.g. "protein")
  price: number;
  description: string;
}

export const MAX_IV = 31;
export const BOOST_PRICE = 2500;

export const BOOST_ITEMS: BoostItem[] = [
  { stat: 'hp',      name: 'HP Up',    spriteSlug: 'hp-up',   price: BOOST_PRICE, description: 'Maxes the HP IV of one Pokémon.' },
  { stat: 'attack',  name: 'Protein',  spriteSlug: 'protein', price: BOOST_PRICE, description: 'Maxes the Attack IV of one Pokémon.' },
  { stat: 'defense', name: 'Iron',     spriteSlug: 'iron',    price: BOOST_PRICE, description: 'Maxes the Defense IV of one Pokémon.' },
  { stat: 'spAtk',   name: 'Calcium',  spriteSlug: 'calcium', price: BOOST_PRICE, description: 'Maxes the Sp. Atk IV of one Pokémon.' },
  { stat: 'spDef',   name: 'Zinc',     spriteSlug: 'zinc',    price: BOOST_PRICE, description: 'Maxes the Sp. Def IV of one Pokémon.' },
  { stat: 'speed',   name: 'Carbos',   spriteSlug: 'carbos',  price: BOOST_PRICE, description: 'Maxes the Speed IV of one Pokémon.' },
];

export const BOOST_BY_STAT: Record<StatKey, BoostItem> = Object.fromEntries(
  BOOST_ITEMS.map((b) => [b.stat, b])
) as Record<StatKey, BoostItem>;

export function getBoostSprite(stat: StatKey): string {
  return `/pokemonparty/assets/${BOOST_BY_STAT[stat].spriteSlug}.png`;
}

export function getBoostName(stat: StatKey): string {
  return BOOST_BY_STAT[stat].name;
}

export function getBoostPrice(stat: StatKey): number {
  return BOOST_BY_STAT[stat].price;
}

export function getBoostDescription(stat: StatKey): string {
  return BOOST_BY_STAT[stat].description;
}

export function rollBoost(): StatKey {
  const stats: StatKey[] = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];
  return stats[Math.floor(Math.random() * stats.length)];
}
