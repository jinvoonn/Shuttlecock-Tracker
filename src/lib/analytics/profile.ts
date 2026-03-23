import { getPlayerStats } from "./core";
import { normalizeMatches } from "./normalize";
import { NormalizedMatch } from "./types";
import { PartnerStatsMap } from "./partner";

/**
 * Fetches standardized statistics for a specific player profile.
 */
export function getPlayerProfileStats(
  matches: any[],
  playerMap: Record<string, string>,
  playerId: string
) {
  const normalized = normalizeMatches(matches, playerMap);
  const allStats = getPlayerStats(normalized, playerMap);
  return allStats[playerId] || null;
}


