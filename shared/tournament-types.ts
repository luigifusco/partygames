// Tournament types shared between client and server

export interface TournamentMatch {
  id: string;
  round: number;
  position: number;
  player1: string | null;
  player2: string | null;
  winner: string | null;
  status: 'pending' | 'active' | 'completed' | 'forfeit';
  deadline?: number;
}

export interface FrozenPokemon {
  pokemonId: number;
  name: string;
  sprite: string;
  heldItem: string | null;
  moves: [string, string] | null;
  ability: string | null;
  character?: string | null;
}

export interface TournamentPrize {
  essence: number;
  pack?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  pokemonIds?: number[];
}

/** Ranked prize list: index 0 = 1st place, 1 = 2nd, ..., last = participation */
export type TournamentPrizes = TournamentPrize[];

export const DEFAULT_PRIZES: TournamentPrizes = [
  { essence: 2000, pack: 'legendary' },
  { essence: 1000, pack: 'rare' },
  { essence: 200 },
];

export interface Tournament {
  id: string;
  name: string;
  fieldSize: 1 | 2 | 3;
  totalPokemon: number;
  status: 'registration' | 'active' | 'completed' | 'cancelled';
  registrationEnd: number;
  matchTimeLimit: number;
  participants: string[];
  bracket: TournamentMatch[];
  currentRound: number;
  winner?: string;
  runnerUp?: string;
  createdAt: number;
  /** Deprecated: tournaments are always fixed-team now. Kept for back-compat with older data. */
  fixedTeam: boolean;
  publicTeams: boolean;
  /** When false, legendary-tier Pokémon are banned from teams in this tournament. */
  allowLegendaries: boolean;
  /** Per-match ordering phase. 'blind' = both order simultaneously hidden.
   *  'draft' = alternating reveal (p1 picks slot 1, p2 picks slot 1, ...). */
  pickMode: 'blind' | 'draft';
  frozenTeams: Record<string, FrozenPokemon[]>;
  prizes: TournamentPrizes;
}

export interface TournamentSummary {
  id: string;
  name: string;
  status: Tournament['status'];
  fieldSize: number;
  totalPokemon: number;
  participantCount: number;
  participants: string[];
  registrationEnd: number;
  currentRound: number;
  winner?: string;
  fixedTeam: boolean;
  publicTeams: boolean;
  allowLegendaries: boolean;
  pickMode: 'blind' | 'draft';
  prizes: TournamentPrizes;
}

/** Live state of the per-match draft phase. Broadcast to both participants
 *  after every pick so the UI can render whose turn it is. */
export interface TournamentDraftState {
  tournamentId: string;
  matchId: string;
  player1: string;
  player2: string;
  /** Ordered slot indices into the frozen team. Starts empty, fills in
   *  alternating fashion. Length <= totalPokemon. */
  p1Order: number[];
  p2Order: number[];
  /** Whose turn it is to pick next. null = draft complete. */
  currentPicker: 'p1' | 'p2' | null;
  totalPokemon: number;
  /** Frozen teams are included so both players can see what is being
   *  revealed. For blind mode we never send this event. */
  p1Team: FrozenPokemon[];
  p2Team: FrozenPokemon[];
}
