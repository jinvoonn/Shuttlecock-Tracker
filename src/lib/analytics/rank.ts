export type CockRank = {
  name: string;
  color: string;
  icon: string;
  minElo: number;
  maxElo: number | null; // null represents uncapped upper limit
  nextRank: string | null;
};

export const RANK_TIERS: CockRank[] = [
  {
    name: "Chick",
    color: "#94a3b8", // slate-400
    icon: "🐣",
    minElo: 0,
    maxElo: 1000,
    nextRank: "Feather",
  },
  {
    name: "Feather",
    color: "#38bdf8", // sky-400
    icon: "🪶",
    minElo: 1000,
    maxElo: 1200,
    nextRank: "Shuttle",
  },
  {
    name: "Shuttle",
    color: "#fbbf24", // amber-400
    icon: "🏸",
    minElo: 1200,
    maxElo: 1400,
    nextRank: "Rally",
  },
  {
    name: "Rally",
    color: "#34d399", // emerald-400
    icon: "⚡",
    minElo: 1400,
    maxElo: 1600,
    nextRank: "Smash",
  },
  {
    name: "Smash",
    color: "#f97316", // orange-500
    icon: "⚔️",
    minElo: 1600,
    maxElo: 1800,
    nextRank: "Ace",
  },
  {
    name: "Ace",
    color: "#a78bfa", // violet-400
    icon: "👑",
    minElo: 1800,
    maxElo: 2000,
    nextRank: "CockMaster",
  },
  {
    name: "CockMaster",
    color: "#f43f5e", // rose-500
    icon: "🌌",
    minElo: 2000,
    maxElo: null,
    nextRank: null,
  },
];

/**
 * Pure function mapping any player ELO to its exact tier bounds.
 */
export function getCockRank(elo: number): CockRank {
  // Ensure we don't crash on strangely negative ELO edge cases
  const clampedElo = Math.max(0, elo);

  for (const tier of RANK_TIERS) {
    if (tier.maxElo === null) {
      return tier; // We've reached CockMaster
    }
    // Strict bounding: min <= elo < max
    if (clampedElo >= tier.minElo && clampedElo < tier.maxElo) {
      return tier;
    }
  }

  // Fallback (Should mathematically never reach here due to the uncapped CockMaster)
  return RANK_TIERS[RANK_TIERS.length - 1];
}
