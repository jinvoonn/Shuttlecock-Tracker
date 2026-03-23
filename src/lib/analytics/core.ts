import { NormalizedMatch, PlayerStats } from "./types";

/**
 * Aggregates normalized matches into player statistics.
 */
export function getPlayerStats(
  matches: NormalizedMatch[],
  playerMap: Record<string, string>
): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {};

  // Initialize stats for all players mentioned in matches
  // (We could also pass in allPlayers from the caller)
  const initializePlayer = (id: string) => {
    if (!stats[id]) {
      stats[id] = {
        id,
        name: playerMap[id] || "Unknown",
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        winRate: 0,
        streak: 0,
        maxStreak: 0,
        lastResults: [],
      };
    }
  };

  // Process matches in chronological order to calculate streaks
  // We assume matches are already sorted or we sort them here
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedMatches.forEach((match) => {
    const { teamA, teamB, winner } = match;

    [...teamA, ...teamB].forEach(initializePlayer);

    // Update games and wins/losses/draws
    teamA.forEach((id) => {
      const s = stats[id];
      s.totalGames++;
      if (winner === "A") {
        s.wins++;
        s.streak++;
        s.maxStreak = Math.max(s.maxStreak, s.streak);
        s.lastResults.push("W");
      } else if (winner === "B") {
        s.losses++;
        s.streak = 0;
        s.lastResults.push("L");
      } else {
        s.draws++;
        s.streak = 0;
        s.lastResults.push("D");
      }
    });

    teamB.forEach((id) => {
      const s = stats[id];
      s.totalGames++;
      if (winner === "B") {
        s.wins++;
        s.streak++;
        s.maxStreak = Math.max(s.maxStreak, s.streak);
        s.lastResults.push("W");
      } else if (winner === "A") {
        s.losses++;
        s.streak = 0;
        s.lastResults.push("L");
      } else {
        s.draws++;
        s.streak = 0;
        s.lastResults.push("D");
      }
    });
  });

  // Calculate final win rates and trim lastResults to recent form (e.g., last 5)
  Object.values(stats).forEach((s) => {
    if (s.totalGames > 0) {
      s.winRate = s.wins / s.totalGames;
    }
    s.lastResults = s.lastResults.slice(-5).reverse(); // Most recent first
  });

  return stats;
}
