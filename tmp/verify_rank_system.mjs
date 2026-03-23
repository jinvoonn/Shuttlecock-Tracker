import { getCockRank } from '../src/lib/analytics/rank.ts'; // Node module resolution mapped dynamically for pure ts

// We compile rank.ts implicitly in Next.js, but since this is isolated Node execution, we will mock the exact module locally for our script
import fs from 'fs';
import path from 'path';

const rankModule = fs.readFileSync(path.join(process.cwd(), 'src/lib/analytics/rank.ts'), 'utf-8');

// Strip Typescript typings to run inside raw Node process safely without ts-node bindings
// Highly rudimentary test harness matching the pure TS core
const tests = [
  { elo: -50, expected: 'Chick' },
  { elo: 0, expected: 'Chick' },
  { elo: 999, expected: 'Chick' },
  { elo: 1000, expected: 'Feather' },
  { elo: 1199, expected: 'Feather' },
  { elo: 1200, expected: 'Shuttle' },
  { elo: 1399, expected: 'Shuttle' },
  { elo: 1400, expected: 'Rally' },
  { elo: 1599, expected: 'Rally' },
  { elo: 1600, expected: 'Smash' },
  { elo: 1799, expected: 'Smash' },
  { elo: 1800, expected: 'Ace' },
  { elo: 1999, expected: 'Ace' },
  { elo: 2000, expected: 'CockMaster' },
  { elo: 3500, expected: 'CockMaster' },
];

let rankDefString = rankModule.substring(rankModule.indexOf('export const RANK_TIERS'));
rankDefString = rankDefString.replace(/export type.*?;/s, '');
rankDefString = rankDefString.replace(/export const RANK_TIERS: CockRank\[\] =/g, 'const RANK_TIERS =');
rankDefString = rankDefString.replace(/export function getCockRank\(elo: number\): CockRank/g, 'function getCockRank(elo)');

const evalContext = `
  ${rankDefString}
  
  let passed = true;
  for (const t of ${JSON.stringify(tests)}) {
    const res = getCockRank(t.elo);
    if (res.name === t.expected) {
       console.log("✅ Passed -> ELO: " + t.elo + " => " + res.name);
    } else {
       console.error("❌ FAILED -> ELO: " + t.elo + " | Expected: " + t.expected + " but got: " + res.name);
       passed = false;
    }
  }
  if (!passed) process.exit(1);
`;

try {
  eval(evalContext);
  console.log("\\n🎉 SUCCESS: All boundary threshold tests successfully completed without crossover overlaps.");
} catch(e) {
  console.error(e);
  process.exit(1);
}
