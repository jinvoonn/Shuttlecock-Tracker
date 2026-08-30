/**
 * Player Shuffler & Tournament Engine Types
 */

export interface ShufflerPlayer {
  id: string;
  name: string;
  elo?: number;
  skillRating?: number;
}

export interface ShufflerPair {
  id: string; // e.g. "pair-p1-p2"
  players: ShufflerPlayer[]; // 1 player for 1v1, 2 for 2v2
}

export interface ShufflerCourtMatch {
  courtNumber: number;
  teamA: ShufflerPlayer[];
  teamB: ShufflerPlayer[];
}

export interface ShufflerOption {
  id: string;
  courtMatches: ShufflerCourtMatch[];
  waitingPairs: ShufflerPair[];
  restingPlayers: ShufflerPlayer[];
  fairnessScore?: number;
}

export interface MatchHistoryRecord {
  team_a_player1?: string | null;
  team_a_player2?: string | null;
  team_b_player1?: string | null;
  team_b_player2?: string | null;
}

export interface TournamentMatch {
  courtNumber: number;
  teamA: ShufflerPlayer[];
  teamB: ShufflerPlayer[];
  winner?: "A" | "B";
  isRecorded?: boolean;
}

export interface TournamentRound {
  roundNumber: number;
  courts: TournamentMatch[];
  waitingPairs: ShufflerPair[];
  restingPlayers: ShufflerPlayer[];
}

export interface TournamentState {
  sessionId: string;
  isActive: boolean;
  currentRound: TournamentRound;
  roundHistory: TournamentRound[];
  numCourts: number;
  playersPerTeam: number; // 1 for 1v1, 2 for 2v2
  restHistory: Record<string, number>; // playerId -> count of times rested
  partnerHistory: Record<string, Record<string, number>>; // p1 -> p2 -> times partnered
}
