import { PlayerStats, LeaderboardEntry } from "./types";

/**
 * Creates a sorted leaderboard from player stats.
 */
export function getLeaderboard(
  playerStats: Record<string, PlayerStats>,
  options: {
    sortBy: "wins" | "winRate";
    minGames?: number;
  } = { sortBy: "wins", minGames: 0 }
): LeaderboardEntry[] {
  const { sortBy, minGames = 0 } = options;

  return Object.values(playerStats)
    .filter((s) => s.totalGames >= minGames)
    .sort((a, b) => {
      if (sortBy === "winRate") {
        return b.winRate - a.winRate || b.totalGames - a.totalGames;
      }
      return b.wins - a.wins || b.winRate - a.winRate;
    })
    .map((s, index) => ({
      ...s,
      rank: index + 1,
    }));
}

/**
 * Extracts global insights from player stats.
 */
export function getGlobalInsights(playerStats: Record<string, PlayerStats>) {
  const statsArray = Object.values(playerStats);
  if (statsArray.length === 0) return { mostWinsPlayer: null, bestWinRatePlayer: null, longestStreakPlayer: null };

  const mostWinsPlayer = [...statsArray].sort((a, b) => b.wins - a.wins)[0];
  const bestWinRatePlayer = [...statsArray]
    .filter((s) => s.totalGames >= 3) // Standard threshold
    .sort((a, b) => b.winRate - a.winRate)[0];
  const longestStreakPlayer = [...statsArray].sort((a, b) => b.maxStreak - a.maxStreak)[0];

  return {
    mostWinsPlayer,
    bestWinRatePlayer,
    longestStreakPlayer,
  };
}
