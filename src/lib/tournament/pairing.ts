import { ShufflerPlayer, ShufflerPair, ShufflerOption, ShufflerCourtMatch, MatchHistoryRecord } from "./types";

/**
 * Normalizes a pair into a canonical string key (e.g. "idA_idB" where idA < idB)
 */
export function normalizePairKey(p1Id: string, p2Id?: string): string {
  if (!p2Id) return p1Id;
  return p1Id < p2Id ? `${p1Id}__${p2Id}` : `${p2Id}__${p1Id}`;
}

/**
 * Normalizes a match of 2 teams so order doesn't create duplicate keys.
 */
export function normalizeMatchKey(teamA: ShufflerPlayer[], teamB: ShufflerPlayer[]): string {
  const keyA = teamA.map(p => p.id).sort().join("_");
  const keyB = teamB.map(p => p.id).sort().join("_");
  return keyA < keyB ? `${keyA}___vs___${keyB}` : `${keyB}___vs___${keyA}`;
}

/**
 * Normalizes an entire ShufflerOption into a canonical signature string
 * to detect and discard duplicate combinations.
 */
export function normalizeOptionSignature(option: ShufflerOption): string {
  const courtKeys = option.courtMatches
    .map(c => normalizeMatchKey(c.teamA, c.teamB))
    .sort()
    .join("||");

  const restingPairKeys = option.restingPairs
    .map(w => w.players.map(p => p.id).sort().join("_"))
    .sort()
    .join("||");

  const oddKey = option.oddRestingPlayer ? option.oddRestingPlayer.id : "none";

  return `C:[${courtKeys}]_RP:[${restingPairKeys}]_ODD:[${oddKey}]`;
}

/**
 * Fisher-Yates array shuffle with pure immutability
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Builds a partner co-occurrence frequency map from past matches
 */
export function buildPartnerHistoryMap(pastMatches: MatchHistoryRecord[] = []): Record<string, Record<string, number>> {
  const map: Record<string, Record<string, number>> = {};

  const recordPair = (p1?: string | null, p2?: string | null) => {
    if (!p1 || !p2 || p1 === p2) return;
    if (!map[p1]) map[p1] = {};
    if (!map[p2]) map[p2] = {};
    map[p1][p2] = (map[p1][p2] || 0) + 1;
    map[p2][p1] = (map[p2][p1] || 0) + 1;
  };

  pastMatches.forEach(m => {
    recordPair(m.team_a_player1, m.team_a_player2);
    recordPair(m.team_b_player1, m.team_b_player2);
  });

  return map;
}

/**
 * Generates N unique, non-duplicate pairing arrangements from session players.
 * 
 * Arrangement structure:
 * - Court 1..C matches (Playing: Team A vs Team B)
 * - Planned Resting Pairs: e.g. AB + CD (future pairings)
 * - Odd Resting Player: e.g. EF (the single odd resting player guaranteed to enter later)
 * 
 * Examples:
 * - 5 players, 1 court: Playing: A+B vs C+D, Resting: E (odd)
 * - 6 players, 1 court: Playing: A+B vs C+D, Resting: E+F (pair)
 * - 7 players, 1 court: Playing: A+B vs C+D, Resting: E+F (pair), G (odd)
 * - 8 players, 1 court: Playing: A+B vs C+D, Resting: E+F, G+H
 * - 9 players, 1 court: Playing: A+B vs C+D, Resting: E+F, G+H, I (odd)
 */
export function generatePairingOptions(
  players: ShufflerPlayer[],
  numCourts: number = 1,
  requestedCount: number = 5,
  pastMatches: MatchHistoryRecord[] = [],
  restHistory: Record<string, number> = {}
): ShufflerOption[] {
  if (!players || players.length < 2) return [];

  const partnerHistory = buildPartnerHistoryMap(pastMatches);
  const isSingles = players.length < 4;
  const playersPerTeam = isSingles ? 1 : 2;
  const playersPerCourtMatch = playersPerTeam * 2; // 2 for singles, 4 for doubles

  const options: ShufflerOption[] = [];
  const seenSignatures = new Set<string>();

  const totalPlayers = players.length;
  const maxActivePlayers = Math.min(totalPlayers - (totalPlayers % 2), numCourts * playersPerCourtMatch);

  // Maximum attempts to find distinct non-duplicate combinations
  const MAX_ATTEMPTS = 200;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && options.length < requestedCount; attempt++) {
    // 1. Sort players by rest history to distribute odd rest/resting fairly across sessions
    const sortedForRest = [...players].sort((a, b) => {
      const restA = restHistory[a.id] || 0;
      const restB = restHistory[b.id] || 0;
      if (restA !== restB) return restA - restB; // least rested prioritized to play
      return Math.random() - 0.5;
    });

    // 2. Select active players and resting players
    const activePool = shuffleArray(sortedForRest.slice(0, maxActivePlayers));
    const restingPool = sortedForRest.slice(maxActivePlayers);

    // 3. Form active court matches
    const courtMatches: ShufflerCourtMatch[] = [];
    for (let c = 0; c < numCourts; c++) {
      const offset = c * playersPerCourtMatch;
      if (offset + playersPerCourtMatch <= activePool.length) {
        const teamA = activePool.slice(offset, offset + playersPerTeam);
        const teamB = activePool.slice(offset + playersPerTeam, offset + playersPerCourtMatch);
        courtMatches.push({
          courtNumber: c + 1,
          teamA,
          teamB
        });
      }
    }

    if (courtMatches.length === 0) continue;

    // 4. Form planned resting pairs and identify odd resting player
    const restingPairs: ShufflerPair[] = [];
    let oddRestingPlayer: ShufflerPlayer | null = null;

    const shuffledResting = shuffleArray(restingPool);
    const completePairsCount = Math.floor(shuffledResting.length / playersPerTeam);

    for (let p = 0; p < completePairsCount; p++) {
      const pairPlayers = shuffledResting.slice(p * playersPerTeam, (p + 1) * playersPerTeam);
      restingPairs.push({
        id: `resting-pair-${pairPlayers.map(x => x.id).join("-")}`,
        players: pairPlayers
      });
    }

    // Remainder single player is the odd resting player
    const remainderIndex = completePairsCount * playersPerTeam;
    if (remainderIndex < shuffledResting.length) {
      oddRestingPlayer = shuffledResting[remainderIndex];
    }

    const candidateOption: ShufflerOption = {
      id: `option-${options.length + 1}`,
      courtMatches,
      restingPairs,
      oddRestingPlayer
    };

    const signature = normalizeOptionSignature(candidateOption);
    if (!seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      options.push(candidateOption);
    }
  }

  return options;
}
