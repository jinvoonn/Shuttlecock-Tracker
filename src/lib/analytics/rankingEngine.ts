import { NormalizedMatch, EloMap, EloHistoryMap } from "./types";

const q = Math.log(10) / 400;
const piSq = Math.PI * Math.PI;

const DEFAULT_RATING = 1200;
const DEFAULT_RD = 350;
const MMR_FLOOR = 1000;

interface GlickoTeamStats {
  r: number;
  rd: number;
}

/**
 * Computes the team rating and average uncertainty (RD).
 * Weighted team rating (70/30) to reduce pairing imbalance.
 */
function computeGlickoTeamRating(
  teamPlayers: string[],
  R: Record<string, number>,
  RD: Record<string, number>
): GlickoTeamStats {
  if (!teamPlayers || teamPlayers.length === 0) {
    return { r: DEFAULT_RATING, rd: DEFAULT_RD };
  }
  if (teamPlayers.length === 1) {
    const p = teamPlayers[0];
    return { r: R[p] ?? DEFAULT_RATING, rd: RD[p] ?? DEFAULT_RD };
  }

  const p1 = teamPlayers[0];
  const p2 = teamPlayers[1];

  const r1 = R[p1] ?? DEFAULT_RATING;
  const r2 = R[p2] ?? DEFAULT_RATING;
  const rd1 = RD[p1] ?? DEFAULT_RD;
  const rd2 = RD[p2] ?? DEFAULT_RD;

  const [strongR, weakR] = r1 > r2 ? [r1, r2] : [r2, r1];
  return {
    r: strongR * 0.7 + weakR * 0.3,
    rd: (rd1 + rd2) / 2
  };
}

/**
 * Calculates Glicko-Lite + Attendance Streak XP ratings chronologically.
 */
export function calculateGlickoHybridRatings(matches: NormalizedMatch[]): {
  current: EloMap;
  history: EloHistoryMap;
} {
  const R: Record<string, number> = {};
  const RD: Record<string, number> = {};
  const XP: Record<string, number> = {};
  const streak: Record<string, number> = {};
  const gamesCount: Record<string, number> = {};

  const current: EloMap = {};
  const history: EloHistoryMap = {};

  // Sort matches chronologically to ensure ranking accuracy.
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

  // Initialize all players seen in history
  for (const match of sortedMatches) {
    const allPlayers = [...match.teamA, ...match.teamB];
    for (const player of allPlayers) {
      if (!(player in R)) {
        R[player] = DEFAULT_RATING;
        RD[player] = DEFAULT_RD;
        XP[player] = 0;
        streak[player] = 0;
        gamesCount[player] = 0;
        history[player] = [];
      }
    }
  }

  // 1. Group matches by sessionId to process sessions chronologically
  const sessionsOrder: string[] = [];
  const matchesBySession: Record<string, NormalizedMatch[]> = {};

  for (const match of sortedMatches) {
    // Fallback to match date if no session_id is present
    const sId = match.sessionId || match.date || "unknown-session";
    if (!matchesBySession[sId]) {
      matchesBySession[sId] = [];
      sessionsOrder.push(sId);
    }
    matchesBySession[sId].push(match);
  }

  // 2. Process sessions one by one
  for (const sId of sessionsOrder) {
    const sessionMatches = matchesBySession[sId];
    
    // Find players who active-played in this session
    const attendees = new Set<string>();
    sessionMatches.forEach(m => {
      m.teamA.forEach(p => attendees.add(p));
      m.teamB.forEach(p => attendees.add(p));
    });

    // Update Attendance Streaks for all known players
    Object.keys(R).forEach(player => {
      const hasPlayedBefore = gamesCount[player] > 0 || attendees.has(player);
      if (hasPlayedBefore) {
        if (attendees.has(player)) {
          streak[player] = Math.min(10, (streak[player] || 0) + 1);
        } else {
          // Soft decay instead of instant reset
          streak[player] = Math.max(0, (streak[player] || 0) - 2);
        }
      }
    });

    // 3. Process matches inside this session
    for (const m of sessionMatches) {
      const teamA = m.teamA;
      const teamB = m.teamB;

      const teamAStats = computeGlickoTeamRating(teamA, R, RD);
      const teamBStats = computeGlickoTeamRating(teamB, R, RD);

      const outcomeA = m.winner === "A" ? 1 : m.winner === "B" ? 0 : 0.5;
      const outcomeB = 1 - outcomeA;

      const diff = Math.abs(m.scoreA - m.scoreB);
      const isCloseMatch = diff <= 2;

      // Update Team A Players
      teamA.forEach(p => {
        const playerR = R[p] ?? DEFAULT_RATING;
        const playerRD = RD[p] ?? DEFAULT_RD;

        const gOpp = 1 / Math.sqrt(1 + (3 * q * q * teamBStats.rd * teamBStats.rd) / piSq);
        const expected = 1 / (1 + Math.pow(10, (-gOpp * (playerR - teamBStats.r)) / 400));
        const dSq = 1 / (q * q * gOpp * gOpp * expected * (1 - expected));

        let delta = (q / ((1 / (playerRD * playerRD)) + (1 / dSq))) * gOpp * (outcomeA - expected);
        if (isCloseMatch) delta *= 0.3;

        // Apply Skill Floor
        R[p] = Math.max(MMR_FLOOR, playerR + delta);

        const newRD = Math.sqrt(1 / ((1 / (playerRD * playerRD)) + (1 / dSq)));
        RD[p] = isCloseMatch ? (playerRD - (playerRD - newRD) * 0.3) : newRD;

        // Attendance-Streak XP Progression
        const currentStreak = streak[p] || 0;
        const xpEarned = 1.0 + currentStreak * 0.1;
        XP[p] = (XP[p] || 0) + xpEarned;
        gamesCount[p] = (gamesCount[p] || 0) + 1;

        history[p].push({
          date: m.date,
          elo: Math.round(R[p] + XP[p])
        });
      });

      // Update Team B Players
      teamB.forEach(p => {
        const playerR = R[p] ?? DEFAULT_RATING;
        const playerRD = RD[p] ?? DEFAULT_RD;

        const gOpp = 1 / Math.sqrt(1 + (3 * q * q * teamAStats.rd * teamAStats.rd) / piSq);
        const expected = 1 / (1 + Math.pow(10, (-gOpp * (playerR - teamAStats.r)) / 400));
        const dSq = 1 / (q * q * gOpp * gOpp * expected * (1 - expected));

        let delta = (q / ((1 / (playerRD * playerRD)) + (1 / dSq))) * gOpp * (outcomeB - expected);
        if (isCloseMatch) delta *= 0.3;

        // Apply Skill Floor
        R[p] = Math.max(MMR_FLOOR, playerR + delta);

        const newRD = Math.sqrt(1 / ((1 / (playerRD * playerRD)) + (1 / dSq)));
        RD[p] = isCloseMatch ? (playerRD - (playerRD - newRD) * 0.3) : newRD;

        // Attendance-Streak XP Progression
        const currentStreak = streak[p] || 0;
        const xpEarned = 1.0 + currentStreak * 0.1;
        XP[p] = (XP[p] || 0) + xpEarned;
        gamesCount[p] = (gamesCount[p] || 0) + 1;

        history[p].push({
          date: m.date,
          elo: Math.round(R[p] + XP[p])
        });
      });
    }
  }

  // Compile final ratings
  Object.keys(R).forEach(player => {
    current[player] = Math.round(R[player] + XP[player]);
  });

  return { current, history };
}
