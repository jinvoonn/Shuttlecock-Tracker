import { EloHistoryMap, EloHistoryEntry } from "./types";

/**
 * Extracts the chronological ELO history for a specific player from the global history map.
 * Ensures the output array is ready for visualization components like Recharts.
 */
export function getPlayerEloHistory(historyMap: EloHistoryMap, playerId: string): EloHistoryEntry[] {
  if (!historyMap || !historyMap[playerId]) return [];
  return historyMap[playerId];
}
