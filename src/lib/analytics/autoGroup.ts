/**
 * Auto-Grouping & Fair Match Generator
 * Balances teams based on skill ratings (Elo/CockRating) and session court playtime.
 */

export interface GroupingPlayer {
  id: string;
  name: string;
  elo: number;
  placementMatchesPlayed?: number;
  matchesPlayedInSession?: number;
}

export interface MatchRecommendation {
  teamA: GroupingPlayer[];
  teamB: GroupingPlayer[];
  teamAElo: number;
  teamBElo: number;
  eloDifference: number;
  fairnessScore: number; // 0 to 100% (100% = perfectly balanced)
  winProbabilityA: number; // 0 to 100%
  description: string;
}

/**
 * Calculates the average Elo of a team.
 */
export function getTeamAverageElo(team: GroupingPlayer[]): number {
  if (!team || team.length === 0) return 1200;
  const sum = team.reduce((acc, p) => acc + (p.elo ?? 1200), 0);
  return Math.round(sum / team.length);
}

/**
 * Calculates fairness score and win probability for two teams.
 */
export function evaluatePairing(teamA: GroupingPlayer[], teamB: GroupingPlayer[]): MatchRecommendation {
  const avgA = getTeamAverageElo(teamA);
  const avgB = getTeamAverageElo(teamB);
  const eloDiff = Math.abs(avgA - avgB);

  // Win probability for Team A based on Elo difference
  const winProbA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
  const winProbabilityA = Math.round(winProbA * 100);

  // Fairness formula: e^(-|diff|/400) gives a smooth 0-100% rating
  const fairnessScore = Math.max(10, Math.round(Math.exp(-eloDiff / 400) * 100));

  let description = "Even Match";
  if (eloDiff <= 25) description = "🔥 Dead Heat (Extremely Balanced)";
  else if (eloDiff <= 60) description = "⚖️ Very Balanced";
  else if (eloDiff <= 120) description = "⚡ Competitive";
  else description = "⚠️ Skill Gap (Underdog Challenge)";

  return {
    teamA,
    teamB,
    teamAElo: avgA,
    teamBElo: avgB,
    eloDifference: eloDiff,
    fairnessScore,
    winProbabilityA,
    description
  };
}

/**
 * Generates all 3 possible 2v2 combinations from 4 selected players,
 * sorted by closest team average Elo (most competitive first).
 */
export function generateBalanced2v2(players: GroupingPlayer[]): MatchRecommendation[] {
  if (players.length !== 4) return [];

  const [p1, p2, p3, p4] = players;

  // 3 possible unique pairings of 4 players into two 2-player teams:
  // Option 1: (p1, p2) vs (p3, p4)
  // Option 2: (p1, p3) vs (p2, p4)
  // Option 3: (p1, p4) vs (p2, p3)
  const pairings = [
    { teamA: [p1, p2], teamB: [p3, p4] },
    { teamA: [p1, p3], teamB: [p2, p4] },
    { teamA: [p1, p4], teamB: [p2, p3] }
  ];

  return pairings
    .map(pair => evaluatePairing(pair.teamA, pair.teamB))
    .sort((a, b) => a.eloDifference - b.eloDifference);
}

/**
 * Helper to compute number of combinations nCr
 */
function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 1) return array.map(item => [item]);
  const combinations: T[][] = [];
  array.forEach((item, index) => {
    const smallerCombinations = getCombinations(array.slice(index + 1), size - 1);
    smallerCombinations.forEach(smallerCombination => {
      combinations.push([item, ...smallerCombination]);
    });
  });
  return combinations;
}

/**
 * Suggests the best match from an active session pool of players.
 * Prioritizes players with fewer played matches in the session (fair court rotation),
 * while finding the most competitively balanced 2v2 combination.
 */
export function suggestNextMatchFromPool(
  attendees: GroupingPlayer[],
  matchCountPerPlayer: Record<string, number> = {},
  topN: number = 3
): MatchRecommendation[] {
  if (!attendees || attendees.length < 4) return [];

  // Attach match count
  const poolWithCounts = attendees.map(p => ({
    ...p,
    matchesPlayedInSession: matchCountPerPlayer[p.id] || 0
  }));

  // Sort players primarily by matches played (ascending)
  const sorted = [...poolWithCounts].sort((a, b) => {
    const countA = a.matchesPlayedInSession ?? 0;
    const countB = b.matchesPlayedInSession ?? 0;
    return countA - countB;
  });

  // Pick candidates: if pool <= 6, use all. If larger, prioritize the bottom 6-8 least-played players
  const candidateSize = Math.min(sorted.length, Math.max(4, 6));
  const candidatePool = sorted.slice(0, candidateSize);

  // Generate all 4-player subsets from candidate pool
  const fourPlayerSubsets = getCombinations(candidatePool, 4);

  const allRecommendations: MatchRecommendation[] = [];

  for (const subset of fourPlayerSubsets) {
    const balancedPairings = generateBalanced2v2(subset);
    if (balancedPairings.length > 0) {
      allRecommendations.push(balancedPairings[0]);
    }
  }

  // Sort recommendations by:
  // 1. Total matches played by the 4 players (lowest sum first)
  // 2. Elo difference (lowest first)
  allRecommendations.sort((a, b) => {
    const countSumA = [...a.teamA, ...a.teamB].reduce((acc, p) => acc + (p.matchesPlayedInSession || 0), 0);
    const countSumB = [...b.teamA, ...b.teamB].reduce((acc, p) => acc + (p.matchesPlayedInSession || 0), 0);
    
    if (countSumA !== countSumB) {
      return countSumA - countSumB;
    }
    return a.eloDifference - b.eloDifference;
  });

  return allRecommendations.slice(0, topN);
}
