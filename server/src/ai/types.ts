// AI decision types
// ====================================================================
// Structures shared by the move-choice modules.

export type ProfileName = 'balanced' | 'setupSweeper' | 'statusSpammer' | 'glassCannon';

export interface CharacterProfile {
  name: ProfileName;
  /** Multiplier on estimated-damage component. */
  damageWeight: number;
  /** Additive bonus applied when a move guarantees KO. */
  koBonus: number;
  /** Multiplier on status-move valuation. */
  statusWeight: number;
  /** Multiplier on setup-move valuation. */
  setupWeight: number;
  /** Multiplier on hazard-move valuation. */
  hazardWeight: number;
  /** 0 = refuses recoil; 1 = ignores it. */
  recoilTolerance: number;
  /** 0 = accuracy is critical; 1 = accuracy barely matters. */
  riskTolerance: number;
  /** Extra weight on priority moves when target is low HP. */
  priorityBias: number;
  /** Softmax temperature for final pick. 0 = argmax; higher = noisier. */
  temperature: number;
}

/** Runtime context passed to policies and scorers. Thin wrappers over Showdown state. */
export interface MoveCtx {
  battle: any;
  dex: any;
  side: any;
  oppSide: any;
  selfPkmn: any;
  target: any; // primary target, may be null if no living opponent
  opponents: any[];
  isMulti: boolean;
  selfHpPct: number;
  oppAlive: number;
  profile: CharacterProfile;
}

export interface ScoredMove {
  move: any;
  score: number;
  /** Reason for hard-zero (debug/tracing). */
  filteredBy?: string;
}
