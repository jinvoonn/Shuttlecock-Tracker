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
        placementMatchesPlayed: 0,
        isRanked: false,
      };
    }
  };

  // Process matches in chronological order to calculate streaks
  // Primary sort by played_at, secondary by created_at
  const sortedMatches = [...matches].sort((a, b) => {
    const getTimeSafe = (d?: string) => {
      if (!d) return 0;
      const t = new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };

    const timeDiff = getTimeSafe(a.playedAt) - getTimeSafe(b.playedAt);
    if (timeDiff !== 0) return timeDiff;
    
    // Fallback to createdAt if playedAt is identical
    return getTimeSafe(a.createdAt) - getTimeSafe(b.createdAt);
  });

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
    s.placementMatchesPlayed = Math.min(s.totalGames, 5);
    s.isRanked = s.totalGames >= 5;
    s.lastResults = s.lastResults.slice(-5).reverse(); // Most recent first
  });

  return stats;
}

// Ensure calculateGlickoHybridRatings is imported
import { calculateGlickoHybridRatings } from "./rankingEngine";
import { EloMap } from "./types";

/**
 * Aggregates both standard player statistics and Team ELO ratings concurrently.
 * This extends outputs for UI consumption while preventing breaking changes to getPlayerStats.
 */
export function aggregatePlayerStats(
  matches: NormalizedMatch[],
  playerMap: Record<string, string>,
  options?: {
    initialRatings?: Record<string, { r: number; rd: number; xp?: number }>;
  }
) {
  const stats = getPlayerStats(matches, playerMap);
  const { current: elo, history: eloHistory, deltas, detailed } = calculateGlickoHybridRatings(
    matches,
    options?.initialRatings
  );
  return { stats, elo, eloHistory, deltas, detailed };
}
