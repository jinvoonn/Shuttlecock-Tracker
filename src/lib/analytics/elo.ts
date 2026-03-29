import { NormalizedMatch, EloMap, EloHistoryMap } from "./types";

const DEFAULT_RATING = 1200;
const K_BASE = 24;
const K_NEW_PLAYER = 32;
const K_VETERAN = 16;

/**
 * Determines the K-factor based on how many games a player has played.
 * - New players experience larger swings.
 * - Veterans experience smaller, more stable swings.
 */
function getPlayerK(gamesPlayed: number): number {
  if (gamesPlayed < 5) {
    // Dynamic K-factor for placement: 40 -> 35 -> 30 -> 25 -> 20
    return 20 + (4 - gamesPlayed) * 5;
  }
  return 20; // Standard K-factor
}

/**
 * Computes the team's rating.
 * IMPORTANT: Weights teammates to reduce unfair punishment for pairing strong+weak players.
 * (70% weight to stronger player, 30% to weaker player)
 */
function computeTeamRating(playerA: number, playerB: number): number {
  // If playing singles or missing a player, handle safely
  if (playerA === undefined && playerB === undefined) return DEFAULT_RATING;
  if (playerA === undefined) return playerB;
  if (playerB === undefined) return playerA;

  const [strong, weak] =
    playerA > playerB ? [playerA, playerB] : [playerB, playerA];

  return strong * 0.7 + weak * 0.3;
}

/**
 * Multiplier based on the score difference to reward dominant wins.
 * Scales up to a maximum of 1.5x for blowouts (e.g., 21-0).
 */
function getScoreMultiplier(teamAScore: number, teamBScore: number): number {
  // Avoid NaN if no scores are present
  if (isNaN(teamAScore) || isNaN(teamBScore)) return 1;

  const diff = Math.abs(teamAScore - teamBScore);
  const multiplier = 1 + (diff / 21) * 0.5;

  return Math.min(multiplier, 1.5);
}

/**
 * Calculates ELO ratings for all players by processing matches chronologically.
 */
export function calculateEloRatings(matches: NormalizedMatch[]): { current: EloMap, history: EloHistoryMap } {
  const elo: EloMap = {};
  const history: EloHistoryMap = {};
  const gamesPlayed: { [playerId: string]: number } = {};

  // Sort matches chronologically to assure ELO accuracy.
  // Primary sort by playedAt, secondary by createdAt
  const sortedMatches = [...matches].sort((a, b) => {
    const getTimeSafe = (d?: string) => {
      if (!d) return 0;
      const t = new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };
    
    const timeDiff = getTimeSafe(a.playedAt) - getTimeSafe(b.playedAt);
    if (timeDiff !== 0) return timeDiff;
    return getTimeSafe(a.createdAt) - getTimeSafe(b.createdAt);
  });

  // Initialize all players seen natively
  for (const match of sortedMatches) {
    const allPlayers = [...match.teamA, ...match.teamB];
    for (const player of allPlayers) {
      if (!(player in elo)) {
        elo[player] = DEFAULT_RATING;
        history[player] = [];
        gamesPlayed[player] = 0;
      }
    }
  }

  // Process matches chronologically
  for (const match of sortedMatches) {
    const teamA = match.teamA;
    const teamB = match.teamB;

    const teamAScore = match.scoreA;
    const teamBScore = match.scoreB;

    // Determine outcome
    let scoreA = 0.5;
    if (teamAScore > teamBScore) scoreA = 1;
    if (teamAScore < teamBScore) scoreA = 0;

    const scoreB = 1 - scoreA;

    // Team ratings (weighted algorithm)
    // We safely handle singles (team size 1) or doubles (team size 2)
    const teamARating = computeTeamRating(
      elo[teamA[0]],
      elo[teamA[1]]
    );

    const teamBRating = computeTeamRating(
      elo[teamB[0]],
      elo[teamB[1]]
    );

    // Expected scores based on pure rating differences
    const expectedA = 1 / (1 + Math.pow(10, (teamBRating - teamARating) / 400));
    const expectedB = 1 - expectedA;

    // Score multiplier (dominance)
    const multiplier = getScoreMultiplier(teamAScore, teamBScore);

    // Update players individually on Team A
    for (const player of teamA) {
      const k = getPlayerK(gamesPlayed[player]);
      elo[player] += k * multiplier * (scoreA - expectedA);
      gamesPlayed[player]++;
      history[player].push({ date: match.date, elo: elo[player] });
    }

    // Update players individually on Team B
    for (const player of teamB) {
      const k = getPlayerK(gamesPlayed[player]);
      elo[player] += k * multiplier * (scoreB - expectedB);
      gamesPlayed[player]++;
      history[player].push({ date: match.date, elo: elo[player] });
    }
  }

  return { current: elo, history };
}

/**
 * Transforms an EloMap into a sorted array leaderboard format.
 */
export function getEloLeaderboard(eloMap: EloMap) {
  return Object.entries(eloMap)
    .map(([playerId, rating]) => ({
      playerId,
      rating
    }))
    .sort((a, b) => b.rating - a.rating);
}
