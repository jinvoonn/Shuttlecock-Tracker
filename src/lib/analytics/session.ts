import { NormalizedMatch, PlayerStats, LeaderboardEntry } from "./types";
import { getPlayerStats } from "./core";
import { getLeaderboard } from "./leaderboard";

/**
 * Aggregates statistics for a specific session.
 */
export function getSessionAnalytics(
  matches: NormalizedMatch[],
  playerMap: Record<string, string>,
  sessionId: string
) {
  const sessionMatches = matches.filter((m) => {
    // Depending on how sessionId is stored in NormalizedMatch (optional) or raw
    // In our case, we usually filter before passing to these functions, 
    // but we can provide helper here.
    return true; // Assume filtered by caller for now
  });

  const stats = getPlayerStats(sessionMatches, playerMap);
  
  return {
    stats,
    leaderboardWins: getLeaderboard(stats, { sortBy: "wins" }),
    leaderboardWinRate: getLeaderboard(stats, { sortBy: "winRate" }),
  };
}
