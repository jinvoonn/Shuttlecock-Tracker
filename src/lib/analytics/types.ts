export type NormalizedMatch = {
  id: string;
  date: string;
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
  winner: "A" | "B" | "Draw";
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
};

export type LeaderboardEntry = PlayerStats & {
  rank: number;
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
