import { NormalizedMatch } from "./types";

/**
 * Calculates the total number of shuttlecocks used across a set of matches.
 * @param sessionMatches Array of normalized matches for a specific session.
 * @returns Total shuttle count.
 */
export function getTotalShuttleUsed(sessionMatches: NormalizedMatch[]): number {
  if (!sessionMatches || sessionMatches.length === 0) return 0;
  
  return sessionMatches.reduce((total, match) => {
    return total + (match.shuttleUsed || 0);
  }, 0);
}
