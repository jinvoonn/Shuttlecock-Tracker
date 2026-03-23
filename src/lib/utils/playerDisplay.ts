import { getCockRank } from '../analytics/rank';

/**
 * Standardizes player name formatting across the application.
 * Returns the name followed by the rank icon (and optionally the rank name).
 * 
 * Note: This utility is for string-based formatting or logic.
 * For react rendering with icons and colors, use the <PlayerName /> component.
 */
export function formatPlayerName(
  name: string,
  elo: number,
  options?: { showRankName?: boolean }
) {
  const rank = getCockRank(elo);
  const separator = " | ";
  const rankPart = options?.showRankName 
    ? `${rank.icon} ${rank.name}` 
    : rank.icon;
  
  return `${name}${separator}${rankPart}`;
}
