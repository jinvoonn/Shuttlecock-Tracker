export type SnapshotRow = {
  player_id: string;
  rank: number;
  period_end: string;
  wins: number;
  win_rate: number;
  cock_rating: number;
};

export type LeaderboardPlayer = {
  id: string;
  wins: number;
  winRate: number;
  elo: number;
  [key: string]: any;
};

/**
 * Computes the rank difference between the current live leaderboard 
 * and the most recent snapshot period, sorting dynamically based on user toggle.
 */
export function computeRankDelta<T extends LeaderboardPlayer>(
  currentLeaderboard: T[],
  snapshots: SnapshotRow[],
  sortBy: "wins" | "winRate" | "elo" = "elo"
): (T & { rank: number; rankDelta: number | null })[] {
  if (!snapshots || snapshots.length === 0) {
    return currentLeaderboard.map((p, index) => ({
      ...p,
      rank: index + 1,
      rankDelta: null,
    }));
  }

  // 1. Get the most recent snapshot period end
  // (We use period_end as the unique identifier for the snapshot version)
  const periods = Array.from(
    new Set(snapshots.map(s => s.period_end))
  ).sort((a, b) => (a > b ? -1 : 1));

  const latestPeriod = periods[0];

  if (!latestPeriod) {
    return currentLeaderboard.map((p, index) => ({
      ...p,
      rank: index + 1,
      rankDelta: null,
    }));
  }

  // 2. Filter snapshots for the most recent period
  const latestSnapshots = snapshots.filter(s => s.period_end === latestPeriod);

  // 3. Re-sort the snapshot data to reflect the user's current sorting toggle
  // This satisfies the constraint to support all leaderboard types.
  const sortedPrev = [...latestSnapshots].sort((a, b) => {
    if (sortBy === "winRate") {
      return (b.win_rate - a.win_rate) || (b.wins - a.wins);
    }
    if (sortBy === "elo") {
      return b.cock_rating - a.cock_rating;
    }
    return (b.wins - a.wins) || (b.win_rate - a.win_rate);
  });

  // 4. Build lookup for previous ranks based on the re-sort
  const prevMap: Record<string, number> = {};
  sortedPrev.forEach((s, index) => {
    prevMap[s.player_id] = index + 1; // 1-indexed rank
  });

  // 5. Compute delta against current leaderboard placement
  return currentLeaderboard.map((player, currentIndex) => {
    const currentAbsoluteRank = currentIndex + 1;
    const prevRank = prevMap[player.id];

    if (!prevRank) {
      return { ...player, rank: currentAbsoluteRank, rankDelta: null };
    }

    return {
      ...player,
      rank: currentAbsoluteRank,
      rankDelta: prevRank - currentAbsoluteRank,
    };
  });
}
