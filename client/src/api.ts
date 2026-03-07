import type { PokemonInstance, NatureName } from '@shared/types';
import { POKEMON_BY_ID } from '@shared/pokemon-data';

const API_BASE = '';

// Build a PokemonInstance from a server-returned owned_pokemon row
export function buildInstance(row: any): PokemonInstance | null {
  const pokemon = POKEMON_BY_ID[row.pokemon_id];
  if (!pokemon) return null;
  return {
    instanceId: row.id,
    pokemon,
    nature: row.nature as NatureName,
    ivs: {
      hp: row.iv_hp,
      attack: row.iv_atk,
      defense: row.iv_def,
      spAtk: row.iv_spa,
      spDef: row.iv_spd,
      speed: row.iv_spe,
    },
  };
}

export async function syncEssence(playerId: string, essence: number) {
  await fetch(`${API_BASE}/api/player/${playerId}/essence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ essence }),
  });
}

export async function addPokemonToServer(playerId: string, pokemonIds: number[]): Promise<PokemonInstance[]> {
  const res = await fetch(`${API_BASE}/api/player/${playerId}/pokemon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pokemonIds }),
  });
  const data = await res.json();
  return (data.pokemon ?? []).map(buildInstance).filter(Boolean) as PokemonInstance[];
}

export async function removePokemonFromServer(playerId: string, pokemonId: number, count: number) {
  await fetch(`${API_BASE}/api/player/${playerId}/pokemon/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pokemonId, count }),
  });
}
