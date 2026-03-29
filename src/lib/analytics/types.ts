export type NormalizedMatch = {
  id: string;
  date: string;
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
  winner: "A" | "B" | "Draw";
  playedAt: string;
  createdAt?: string;
  shuttleUsed?: number;
};

export type PlayerStats = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number; // 0 to 1
  streak: number;
  maxStreak: number;
  lastResults: ("W" | "L" | "D")[];
  placementMatchesPlayed: number;
  isRanked: boolean;
};

export type LeaderboardEntry = PlayerStats & {
  rank: number;
  elo: number;
  previousRank?: number;
  rankChange?: number;
};

export type GlobalInsights = {
  mostWinsPlayer: PlayerStats | null;
  bestWinRatePlayer: PlayerStats | null;
  longestStreakPlayer: PlayerStats | null;
};

export type EloMap = {
  [playerId: string]: number;
};

export type EloHistoryEntry = {
  date: string;
  elo: number;
};

export type EloHistoryMap = {
  [playerId: string]: EloHistoryEntry[];
};
