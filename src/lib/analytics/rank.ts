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
    name: "Soft Chick",
    color: "#94a3b8", // slate-400
    icon: "🐤",
    minElo: 0,
    maxElo: 1000,
    nextRank: "Rising Chick",
  },
  {
    name: "Rising Chick",
    color: "#38bdf8", // sky-400
    icon: "🐥",
    minElo: 1000,
    maxElo: 1200,
    nextRank: "Hard Hitter",
  },
  {
    name: "Hard Hitter",
    color: "#fbbf24", // amber-400
    icon: "🏸",
    minElo: 1200,
    maxElo: 1400,
    nextRank: "Big Cock",
  },
  {
    name: "Big Cock",
    color: "#34d399", // emerald-400
    icon: "🔥",
    minElo: 1400,
    maxElo: 1600,
    nextRank: "Battle Cock",
  },
  {
    name: "Battle Cock",
    color: "#f97316", // orange-500
    icon: "⚔️",
    minElo: 1600,
    maxElo: 1800,
    nextRank: "Alpha Cock",
  },
  {
    name: "Alpha Cock",
    color: "#a78bfa", // violet-400
    icon: "👑",
    minElo: 1800,
    maxElo: 2000,
    nextRank: "CockMaster",
  },
  {
    name: "CockMaster",
    color: "#f43f5e", // rose-500
    icon: "🐓",
    minElo: 2000,
    maxElo: null,
    nextRank: null,
  },
];

/**
 * Pure function mapping any player ELO to its exact tier bounds.
 * If the player has not completed 5 placement matches, returns "Unranked".
 */
export function getCockRank(elo: number, placementMatchesPlayed: number = 5): CockRank & { nextRank?: string | null } {
  // 1. Handle Unranked (Placement) state
  if (placementMatchesPlayed < 5) {
    return {
      name: "Unranked",
      color: "#6b7280", // gray-500
      icon: "🐣",
      minElo: 0,
      maxElo: 1200, // Show progress towards "Rising Chick" or similar? No, standard start.
      nextRank: null
    };
  }

  // 2. Handle Ranked tiers
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

const rankEmojiMap: Record<string, string> = {
  Unranked: "🐣",
  "Soft Chick": "🐤",
  "Rising Chick": "🐥",
  "Hard Hitter": "🏸",
  "Big Cock": "🔥",
  "Battle Cock": "⚔️",
  "Alpha Cock": "👑",
  "CockMaster": "🐓"
};

export function getRankEmoji(rank: string): string {
  return rankEmojiMap[rank] ?? "❓";
}
