import { NormalizedMatch } from "./types";

/**
 * Normalizes a raw Supabase match record into a standard structure.
 * Handles dynamic conversion of team_a_playerX columns to arrays.
 */
export function normalizeMatch(raw: any, playerMap: Record<string, string>): NormalizedMatch {
  const teamA: string[] = [];
  const teamB: string[] = [];

  // Dynamically extract all team players regardless of schema hardcoding limits
  Object.keys(raw).forEach((key) => {
    if (key.startsWith("team_a_player") && raw[key]) {
      teamA.push(raw[key]);
    } else if (key.startsWith("team_b_player") && raw[key]) {
      teamB.push(raw[key]);
    }
  });

  const scoreA = Number(raw.team_a_score || 0);
  const scoreB = Number(raw.team_b_score || 0);

  let winner: NormalizedMatch["winner"] = "Draw";
  if (scoreA > scoreB) winner = "A";
  else if (scoreB > scoreA) winner = "B";

  return {
    id: raw.id,
    date: raw.sessions?.date || raw.date || new Date(raw.created_at).toISOString().split("T")[0],
    teamA,
    teamB,
    scoreA,
    scoreB,
    winner,
    playedAt: raw.played_at || raw.created_at || new Date().toISOString(),
    createdAt: raw.created_at,
    shuttleUsed: Number(raw.shuttle_used || raw.stats?.shuttleUsed || 0),
  };
}

export function normalizeMatches(rawMatches: any[], playerMap: Record<string, string>): NormalizedMatch[] {
  return rawMatches.map((m) => normalizeMatch(m, playerMap));
}
