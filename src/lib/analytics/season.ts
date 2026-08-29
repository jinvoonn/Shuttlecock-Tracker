export interface SeasonConfig {
  BASE_MMR: number;
  RESET_FACTOR: number;
  RD_INCREMENT: number;
  MAX_RD: number;
  DEFAULT_START_MMR: number;
  DEFAULT_START_RD: number;
  MMR_FLOOR: number;
}

export const DEFAULT_SEASON_CONFIG: SeasonConfig = {
  BASE_MMR: 1200,
  RESET_FACTOR: 0.50,
  RD_INCREMENT: 75,
  MAX_RD: 350,
  DEFAULT_START_MMR: 1200,
  DEFAULT_START_RD: 350,
  MMR_FLOOR: 1000,
};

export interface Season {
  id: string;
  season_number: number;
  name: string;
  status: "active" | "completed";
  start_date: string;
  end_date?: string | null;
  created_at: string;
  ended_at?: string | null;
  config?: SeasonConfig;
}

export interface SeasonPlayerResult {
  id?: string;
  season_id: string;
  player_id: string;
  player_name?: string;
  final_mmr: number;
  final_rd: number;
  final_xp: number;
  final_cock_rating: number;
  final_rank: number;
  wins: number;
  losses: number;
  draws: number;
  matches_played: number;
  win_rate: number;
  streak: number;
  max_streak: number;
  created_at?: string;
}

export interface PlayerRatingSeed {
  r: number;
  rd: number;
  xp?: number;
}

/**
 * Computes the Soft MMR and RD reset for transitioning between seasons.
 * Asymmetric Formula:
 *   - If OLD_MMR > BASE_MMR: NEW_MMR = max(BASE_MMR, BASE_MMR + (OLD_MMR - BASE_MMR) * RESET_FACTOR)
 *   - If OLD_MMR <= BASE_MMR: NEW_MMR = OLD_MMR (no free lifts or drops)
 *   - NEW_RD = min(OLD_RD + RD_INCREMENT, MAX_RD)
 */
export function calculateSoftResetRatings(
  finalRatings: Record<string, { r: number; rd: number; xp?: number }>,
  config: Partial<SeasonConfig> = {}
): Record<string, PlayerRatingSeed> {
  const cfg = { ...DEFAULT_SEASON_CONFIG, ...config };
  const resetRatings: Record<string, PlayerRatingSeed> = {};

  Object.entries(finalRatings).forEach(([playerId, rating]) => {
    const oldMMR = rating.r ?? cfg.DEFAULT_START_MMR;
    const oldRD = rating.rd ?? cfg.DEFAULT_START_RD;

    // Apply Asymmetric Soft Reset:
    // Players > 1200 compress towards 1200 (clamped to at least 1200).
    // Players <= 1200 keep their exact MMR (earned points preserved, no free bailout).
    let newMMR: number;
    if (oldMMR > cfg.BASE_MMR) {
      const compressed = cfg.BASE_MMR + (oldMMR - cfg.BASE_MMR) * cfg.RESET_FACTOR;
      newMMR = Math.max(cfg.BASE_MMR, Math.round(compressed * 100) / 100);
    } else {
      newMMR = Math.max(cfg.MMR_FLOOR, Math.round(oldMMR * 100) / 100);
    }

    // Increase Uncertainty (RD) to give fast mobility in early season matches
    const newRD = Math.min(cfg.MAX_RD, Math.round((oldRD + cfg.RD_INCREMENT) * 100) / 100);

    resetRatings[playerId] = {
      r: newMMR,
      rd: newRD,
      xp: 0 // XP reset for new season's competitive counter, lifetime XP is tracked separately
    };
  });

  return resetRatings;
}
