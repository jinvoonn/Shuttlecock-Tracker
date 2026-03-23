export type PartnerStats = {
  games: number;
  wins: number;
  winRate: number;
};

export type PartnerStatsMap = {
  [playerId: string]: {
    [partnerId: string]: PartnerStats;
  };
};

/**
 * Returns the best partner for a player, enforcing a minimum games threshold.
 */
export function getBestPartner(partnerStats: PartnerStatsMap, playerId: string, minGames = 3) {
  const stats = partnerStats[playerId];
  if (!stats) return null;

  const candidates = Object.entries(stats)
    .filter(([, s]) => s.games >= minGames)
    .map(([id, s]) => ({ partnerId: id, stats: s }))
    .sort((a, b) => b.stats.winRate - a.stats.winRate || b.stats.games - a.stats.games);

  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Returns the worst partner for a player, enforcing a minimum games threshold.
 */
export function getWorstPartner(partnerStats: PartnerStatsMap, playerId: string, minGames = 3) {
  const stats = partnerStats[playerId];
  if (!stats) return null;

  const candidates = Object.entries(stats)
    .filter(([, s]) => s.games >= minGames)
    .map(([id, s]) => ({ partnerId: id, stats: s }))
    .sort((a, b) => a.stats.winRate - b.stats.winRate || b.stats.games - a.stats.games);

  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Calculates win/loss statistics for all partner combinations.
 * Output format: { [playerId]: { [partnerId]: { games, wins, winRate } } }
 */
export function getPartnerStats(normalizedMatches: any[]): PartnerStatsMap {
  const partners: Record<string, Record<string, { games: number; wins: number }>> = {};

  normalizedMatches.forEach((m) => {
    const { teamA, teamB, winner } = m;

    const processTeam = (team: string[], isWinner: boolean) => {
      // Order-independent mapping via dual loops
      team.forEach((p1: string) => {
        if (!partners[p1]) partners[p1] = {};
        team.forEach((p2: string) => {
          if (p1 === p2) return;
          if (!partners[p1][p2]) partners[p1][p2] = { games: 0, wins: 0 };
          partners[p1][p2].games++;
          if (isWinner) partners[p1][p2].wins++;
        });
      });
    };

    processTeam(teamA, winner === "A");
    processTeam(teamB, winner === "B");
  });

  const result: PartnerStatsMap = {};
  Object.keys(partners).forEach((p1) => {
    result[p1] = {};
    Object.keys(partners[p1]).forEach((p2) => {
      const stats = partners[p1][p2];
      result[p1][p2] = {
        ...stats,
        winRate: stats.games > 0 ? stats.wins / stats.games : 0,
      };
    });
  });

  return result;
}

/**
 * Calculates the synergy score between a player and their partner.
 * Synergy = partnerWinRate - playerAverageWinRate
 */
export function getPartnerSynergy(
  partnerStats: PartnerStatsMap,
  playerId: string,
  partnerId: string
) {
  const pStats = partnerStats[playerId];
  if (!pStats || !pStats[partnerId]) return 0;
  
  const pairing = pStats[partnerId];
  const partnerWinRate = pairing.winRate;

  // Calculate player's average win rate from all partnerships
  let totalWins = 0;
  let totalGames = 0;
  Object.values(pStats).forEach(s => {
    totalWins += s.wins;
    totalGames += s.games;
  });

  const playerAverageWinRate = totalGames > 0 ? totalWins / totalGames : 0;
  
  return partnerWinRate - playerAverageWinRate;
}
