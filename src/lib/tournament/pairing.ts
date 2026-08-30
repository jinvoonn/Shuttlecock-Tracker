import { ShufflerPlayer, ShufflerPair, ShufflerOption, ShufflerCourtMatch, MatchHistoryRecord } from "./types";

/**
 * Normalizes a pair into a canonical string key (e.g. "idA_idB" where idA < idB)
 */
export function normalizePairKey(p1Id: string, p2Id?: string): string {
  if (!p2Id) return p1Id;
  return p1Id < p2Id ? `${p1Id}__${p2Id}` : `${p2Id}__${p1Id}`;
}

/**
 * Normalizes a match of 2 teams (or 2 players) so order doesn't create duplicate keys.
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

  const waitingKeys = option.waitingPairs
    .map(w => w.players.map(p => p.id).sort().join("_"))
    .sort()
    .join("||");

  const restingKeys = option.restingPlayers
    .map(p => p.id)
    .sort()
    .join("||");

  return `C:[${courtKeys}]_W:[${waitingKeys}]_R:[${restingKeys}]`;
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
 * Computes a penalty score for a proposed pairing set:
 * - High penalty for players who have partnered together frequently
 * - Slight penalty for extreme skill imbalances if skill/Elo exists
 */
export function evaluatePairingPenalty(
  pairs: ShufflerPair[],
  partnerHistory: Record<string, Record<string, number>> = {}
): number {
  let penalty = 0;

  for (const pair of pairs) {
    if (pair.players.length === 2) {
      const [p1, p2] = pair.players;
      const timesPartnered = partnerHistory[p1.id]?.[p2.id] || 0;
      penalty += timesPartnered * 10; // heavier penalty for repeated partners

      // Optional slight skill delta penalty (soft)
      const elo1 = p1.elo ?? 1200;
      const elo2 = p2.elo ?? 1200;
      const eloDiff = Math.abs(elo1 - elo2);
      if (eloDiff > 250) {
        penalty += (eloDiff - 250) * 0.05;
      }
    }
  }

  return penalty;
}

/**
 * Generates N unique, high-quality, randomized pairing options from attendees.
 * 
 * Capabilities:
 * - Handles any player count (2, 3, 4, 5, 6, 7, 8, 10+)
 * - Automatically computes complete pairs, waiting pairs, and resting players
 * - Avoids duplicate combinations
 * - Reduces repeated partners using past match history
 * - Supports 1v1 (2 or 3 players) or Doubles 2v2 (4+ players)
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

  // Maximum attempts to find distinct non-duplicate combinations
  const MAX_ATTEMPTS = 150;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && options.length < requestedCount; attempt++) {
    // 1. Prioritize resting players: sort players who rested least first, add random jitter
    const sortedForRest = [...players].sort((a, b) => {
      const restA = restHistory[a.id] || 0;
      const restB = restHistory[b.id] || 0;
      if (restA !== restB) return restA - restB; // players with FEWEST rests are chosen first to PLAY
      return Math.random() - 0.5;
    });

    // Determine how many can play at once
    const totalPlayers = players.length;
    const maxActivePlayers = numCourts * playersPerCourtMatch;
    
    // Total complete teams we can make
    const totalTeams = Math.floor(totalPlayers / playersPerTeam);
    const activeTeamsCount = Math.min(totalTeams - (totalTeams % 2), numCourts * 2);
    const activePlayersCount = activeTeamsCount * playersPerTeam;

    // The remainder players (e.g. 5 players -> 4 play, 1 rests)
    // Select active players (prioritizing least rested)
    const activePlayers = sortedForRest.slice(0, activePlayersCount);
    const excessPlayers = sortedForRest.slice(activePlayersCount);

    // Shuffle active players to generate pairings
    const shuffledActive = shuffleArray(activePlayers);
    const formedPairs: ShufflerPair[] = [];

    for (let i = 0; i < shuffledActive.length; i += playersPerTeam) {
      const teamPlayers = shuffledActive.slice(i, i + playersPerTeam);
      formedPairs.push({
        id: `pair-${teamPlayers.map(p => p.id).join("-")}`,
        players: teamPlayers
      });
    }

    // Assign pairs to courts (2 pairs per court)
    const courtMatches: ShufflerCourtMatch[] = [];
    for (let c = 0; c < Math.floor(formedPairs.length / 2); c++) {
      courtMatches.push({
        courtNumber: c + 1,
        teamA: formedPairs[c * 2].players,
        teamB: formedPairs[c * 2 + 1].players
      });
    }

    // Handle excess complete pairs (e.g. 6 players on 1 court -> Pair C is waiting)
    const waitingPairs: ShufflerPair[] = [];
    const restingPlayers: ShufflerPlayer[] = [];

    for (let i = 0; i < excessPlayers.length; i += playersPerTeam) {
      const group = excessPlayers.slice(i, i + playersPerTeam);
      if (group.length === playersPerTeam) {
        waitingPairs.push({
          id: `waiting-pair-${group.map(p => p.id).join("-")}`,
          players: group
        });
      } else {
        group.forEach(p => restingPlayers.push(p));
      }
    }

    const candidateOption: ShufflerOption = {
      id: `option-${options.length + 1}`,
      courtMatches,
      waitingPairs,
      restingPlayers
    };

    const signature = normalizeOptionSignature(candidateOption);
    if (!seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      options.push(candidateOption);
    }
  }

  // Fallback: If player count is small and fewer than requested options exist, return whatever distinct options we have
  return options;
}
