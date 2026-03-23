
import { getPlayerK } from '../src/lib/analytics/elo.js'; // Adjust paths as needed for local testing
import { getCockRank } from '../src/lib/analytics/rank.js';
import { aggregatePlayerStats } from '../src/lib/analytics/core.js';
import { normalizeMatches } from '../src/lib/analytics/normalize.js';

// Mock data and simple tests
console.log("--- Testing K-Factor ---");
for (let i = 0; i <= 6; i++) {
  console.log(`Matches: ${i}, K: ${getPlayerK(i)}`);
}

console.log("\n--- Testing Rank Assignment ---");
console.log("0 matches, 1200 ELO:", getCockRank(1200, 0).name);
console.log("3 matches, 1500 ELO:", getCockRank(1500, 3).name);
console.log("5 matches, 1500 ELO:", getCockRank(1500, 5).name);
console.log("10 matches, 1500 ELO:", getCockRank(1500, 10).name);

console.log("\n--- Testing Next Rank Logic ---");
const rank3 = getCockRank(1500, 5);
console.log(`Current: ${rank3.name}, Next: ${rank3.nextRank?.name} at ${rank3.nextRank?.minElo}`);

console.log("\n--- Testing Analytics Engine ---");
const playerMap = { "p1": "Player 1" };
const matches = [
  { id: 'm1', date: '2024-01-01', team_a_player1: 'p1', team_a_score: 21, team_b_player1: 'p2', team_b_score: 10, session_id: 's1' }
];
const normalized = normalizeMatches(matches, playerMap);
const { stats } = aggregatePlayerStats(normalized, playerMap);

console.log("Player 1 stats:", stats["p1"]);
if (stats["p1"]) {
  console.log(`Placement matches: ${stats["p1"].placementMatchesPlayed}`);
  console.log(`Is ranked: ${stats["p1"].isRanked}`);
}
