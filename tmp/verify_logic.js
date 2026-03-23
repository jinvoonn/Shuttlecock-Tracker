
function getPlayerK(gamesPlayed) {
  if (gamesPlayed < 5) {
    return 40 - (gamesPlayed * 5); // 40, 35, 30, 25, 20
  }
  return 20;
}

function getCockRank(elo, placementMatchesPlayed = 5) {
  if (placementMatchesPlayed < 5) {
    return {
      name: "Unranked",
      color: "text-slate-500",
      icon: "🐣"
    };
  }

  const RANK_TIERS = [
    { name: "Chick", minElo: 0, color: "text-yellow-400", icon: "🐥" },
    { name: "Feather", minElo: 1000, color: "text-green-400", icon: "🪶" },
    { name: "Shuttle", minElo: 1200, color: "text-sky-400", icon: "🏸" },
    { name: "Rally", minElo: 1400, color: "text-indigo-400", icon: "🎾" },
    { name: "Smash", minElo: 1600, color: "text-orange-500", icon: "🔥" },
    { name: "Ace", minElo: 1800, color: "text-purple-500", icon: "💎" },
    { name: "CockMaster", minElo: 2000, color: "text-rose-500", icon: "👑" }
  ];

  let currentRank = RANK_TIERS[0];
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (elo >= RANK_TIERS[i].minElo) {
      currentRank = RANK_TIERS[i];
      break;
    }
  }
  return currentRank;
}

console.log("--- Testing K-Factor ---");
for (let i = 0; i <= 6; i++) {
  console.log(`Matches: ${i}, K: ${getPlayerK(i)}`);
}

console.log("\n--- Testing Rank Assignment ---");
console.log("0 matches, 1200 ELO:", getCockRank(1200, 0).name);
console.log("3 matches, 1500 ELO:", getCockRank(1500, 3).name);
console.log("5 matches, 1500 ELO:", getCockRank(1500, 5).name);
console.log("10 matches, 1500 ELO:", getCockRank(1500, 10).name);
