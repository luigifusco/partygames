import fs from 'fs';
import path from 'path';
import { POKEMON } from '../../../shared/pokemon-data.js';
import { HELD_ITEMS, HELD_ITEMS_BY_ID } from '../../../shared/held-item-data.js';
import { PACKS } from '../../../shared/pack-data.js';
import { MOVE_TYPES } from '../../../shared/move-data.js';
import { TM_LEARNSETS } from '../../../shared/tm-learnsets.js';
import { PROFILE_NAMES } from '../../../shared/character-profiles.js';
import { BATTLE_TOWER_FORMATS } from '../../../shared/battle-tower.js';
import { generateBattleTowerOpponents } from '../battle-tower.js';
import { showdownSimPath } from '../paths.js';

interface ShowdownDexApi {
  forGen(gen: number): ShowdownDexApi;
  moves: { get(name: string): { exists: boolean } };
  items: { get(name: string): { exists: boolean } };
  species: { get(name: string): { exists: boolean; abilities?: Record<string, string> } };
}

const { Dex } = require(showdownSimPath()) as { Dex: ShowdownDexApi };
const GEN5_DEX = Dex.forGen(5);

const repoRoot = path.resolve(process.cwd(), '..');
const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function assertUnique(values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(`${label} contains duplicate: ${value}`);
    seen.add(value);
  }
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

assertUnique(HELD_ITEMS.map((item) => item.id), 'HELD_ITEMS');
assertUnique(POKEMON.map((pokemon) => String(pokemon.id)), 'POKEMON ids');

for (const item of HELD_ITEMS) {
  if (HELD_ITEMS_BY_ID[item.id] !== item) fail(`HELD_ITEMS_BY_ID missing or mismatched for ${item.id}`);
  if (!GEN5_DEX.items.get(item.name).exists) fail(`Showdown Gen 5 item missing: ${item.name}`);
  const expectedAsset = item.sprite.replace(/^\/pokemonparty\//, '');
  if (!fileExists(expectedAsset)) fail(`Held item sprite missing: ${expectedAsset}`);
  if (!fileExists(`assets-public/${expectedAsset}`)) fail(`Public held item sprite missing: assets-public/${expectedAsset}`);
}

for (const pokemon of POKEMON) {
  if (!GEN5_DEX.species.get(pokemon.name).exists) fail(`Showdown Gen 5 species missing: ${pokemon.name}`);
  const sprite = pokemon.sprite.replace(/^\/pokemonparty\//, '');
  if (!fileExists(`assets-public/${sprite}`)) fail(`Pokemon sprite missing: assets-public/${sprite}`);
  for (const move of pokemon.moves) {
    if (!MOVE_TYPES[move]) fail(`${pokemon.name} default move lacks type data: ${move}`);
    if (!GEN5_DEX.moves.get(move).exists) fail(`${pokemon.name} default move missing in Showdown: ${move}`);
  }
}

for (const [speciesName, learnset] of Object.entries(TM_LEARNSETS)) {
  for (const move of learnset) {
    if (!MOVE_TYPES[move]) fail(`${speciesName} learnset move lacks type data: ${move}`);
    if (!GEN5_DEX.moves.get(move).exists) fail(`${speciesName} learnset move missing in Showdown: ${move}`);
  }
}

for (const pack of PACKS) {
  for (const itemId of pack.itemPool) {
    if (!HELD_ITEMS_BY_ID[itemId]) fail(`${pack.id} references unknown held item: ${itemId}`);
  }
  for (const pokemonId of pack.pool) {
    if (!POKEMON.some((pokemon) => pokemon.id === pokemonId)) fail(`${pack.id} references unknown Pokemon id: ${pokemonId}`);
  }
  for (const move of pack.tmPool) {
    if (!MOVE_TYPES[move]) fail(`${pack.id} references move without type data: ${move}`);
    if (!GEN5_DEX.moves.get(move).exists) fail(`${pack.id} references Showdown-missing move: ${move}`);
  }
}

const profileNames = new Set(PROFILE_NAMES);
for (const [format, def] of Object.entries(BATTLE_TOWER_FORMATS)) {
  for (let i = 0; i < 80; i++) {
    const opponents = generateBattleTowerOpponents(format as keyof typeof BATTLE_TOWER_FORMATS, def.teamSize, 2);
    const boss = opponents.at(-1);
    if (!boss?.themeName) fail(`${format} Bonus boss did not use a curated theme`);
    for (const entry of boss?.team ?? []) {
      const pokemon = POKEMON.find((candidate) => candidate.id === entry.pokemonId);
      if (!pokemon) {
        fail(`${format} Bonus boss references unknown Pokemon id: ${entry.pokemonId}`);
        continue;
      }
      if (!HELD_ITEMS_BY_ID[entry.heldItem]) fail(`${pokemon.name} has unknown held item: ${entry.heldItem}`);
      if (!profileNames.has(entry.character)) fail(`${pokemon.name} has unknown AI profile: ${entry.character}`);
      const abilities = Object.values(GEN5_DEX.species.get(pokemon.name).abilities ?? {});
      if (entry.ability && !abilities.includes(entry.ability)) fail(`${pokemon.name} has illegal ability: ${entry.ability}`);
      if (!entry.moves || entry.moves.length !== 2) fail(`${pokemon.name} Bonus boss entry is missing fixed moves`);
      for (const move of entry.moves ?? []) {
        if (!TM_LEARNSETS[pokemon.name]?.includes(move)) fail(`${pokemon.name} cannot learn curated move: ${move}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Game data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Game data validation passed.');
