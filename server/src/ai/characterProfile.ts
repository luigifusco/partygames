// Character profiles
// ====================================================================
// Four presets that define how a pokemon weighs different move types.
// Lookup order: instance.character -> species default -> 'balanced'.

import type { CharacterProfile, ProfileName } from './types.js';
import { SPECIES_CHARACTER } from './speciesDefaults.js';

export const PROFILES: Record<ProfileName, CharacterProfile> = {
  balanced: {
    name: 'balanced',
    damageWeight: 1.0,
    koBonus: 1.5,
    statusWeight: 1.0,
    setupWeight: 0.8,
    hazardWeight: 0.7,
    recoilTolerance: 0.5,
    riskTolerance: 0.5,
    priorityBias: 0.3,
    temperature: 0.3,
  },
  setupSweeper: {
    name: 'setupSweeper',
    damageWeight: 1.0,
    koBonus: 1.2,
    statusWeight: 0.2,
    setupWeight: 2.5,
    hazardWeight: 0.3,
    recoilTolerance: 0.6,
    riskTolerance: 0.4,
    priorityBias: 0.1,
    temperature: 0.1,
  },
  statusSpammer: {
    name: 'statusSpammer',
    damageWeight: 0.5,
    koBonus: 1.0,
    statusWeight: 2.0,
    setupWeight: 0.4,
    // Entry hazards are this profile's signature play — weighted above
    // statusWeight so Stealth Rock / Spikes / Toxic Spikes get laid
    // down first whenever the field still has capacity.
    hazardWeight: 4.0,
    recoilTolerance: 0.1,
    riskTolerance: 0.3,
    priorityBias: 0.2,
    temperature: 0.4,
  },
  glassCannon: {
    name: 'glassCannon',
    damageWeight: 1.8,
    koBonus: 3.0,
    statusWeight: 0.0,
    setupWeight: 0.0,
    hazardWeight: 0.0,
    recoilTolerance: 1.0,
    riskTolerance: 1.0,
    priorityBias: 0.7,
    temperature: 0.1,
  },
};

export function getProfile(name: string | null | undefined): CharacterProfile {
  if (name && (PROFILES as any)[name]) return (PROFILES as any)[name];
  return PROFILES.balanced;
}

/** Resolve the profile for a given instance character override + species. */
export function resolveProfile(instanceCharacter: string | null | undefined, speciesName: string): CharacterProfile {
  if (instanceCharacter && (PROFILES as any)[instanceCharacter]) return (PROFILES as any)[instanceCharacter];
  const key = normalizeSpeciesKey(speciesName);
  const defaultName = SPECIES_CHARACTER[key];
  if (defaultName && (PROFILES as any)[defaultName]) return (PROFILES as any)[defaultName];
  return PROFILES.balanced;
}

export function normalizeSpeciesKey(name: string): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
