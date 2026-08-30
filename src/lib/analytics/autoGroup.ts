/**
 * Auto-Grouping, Court Shuffler & Match Balancing Engine
 * 
 * Capabilities:
 * 1. Random Court Shuffler with Rotation Fairness (prioritizes least-played players in the session).
 * 2. Multi-court support (e.g. 1 court, 2 courts, 3 courts) with Active vs Resting / Next Up queues.
 * 3. Locked Pairings support (forcefully locks specific 2-player pairs so they stay together).
 * 4. Custom 4-Player Balancer (generates all 3 2v2 combinations ranked by Elo fairness).
 */

export interface GroupingPlayer {
  id: string;
  name: string;
  elo: number;
  placementMatchesPlayed?: number;
  matchesPlayedInSession?: number;
}

export interface MatchRecommendation {
  teamA: GroupingPlayer[];
  teamB: GroupingPlayer[];
  teamAElo: number;
  teamBElo: number;
  eloDifference: number;
  fairnessScore: number; // 0 to 100% (100% = perfectly balanced)
  winProbabilityA: number; // 0 to 100%
  description: string;
}

export interface LockedPair {
  player1Id: string;
  player2Id: string;
}

export interface CourtAssignment {
  courtNumber: number;
  match: MatchRecommendation;
}

export interface CourtShuffleResult {
  courtAssignments: CourtAssignment[];
  restingPlayers: GroupingPlayer[];
}

/**
 * Calculates the average Elo of a team.
 */
export function getTeamAverageElo(team: GroupingPlayer[]): number {
  if (!team || team.length === 0) return 1200;
  const sum = team.reduce((acc, p) => acc + (p.elo ?? 1200), 0);
  return Math.round(sum / team.length);
}

/**
 * Calculates fairness score and win probability for two teams.
 */
export function evaluatePairing(teamA: GroupingPlayer[], teamB: GroupingPlayer[]): MatchRecommendation {
  const avgA = getTeamAverageElo(teamA);
  const avgB = getTeamAverageElo(teamB);
  const eloDiff = Math.abs(avgA - avgB);

  // Win probability for Team A based on Elo difference
  const winProbA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
  const winProbabilityA = Math.round(winProbA * 100);

  // Fairness formula: e^(-|diff|/400) gives a smooth 0-100% rating
  const fairnessScore = Math.max(10, Math.round(Math.exp(-eloDiff / 400) * 100));

  let description = "Even Match";
  if (eloDiff <= 25) description = "🔥 Dead Heat (Extremely Balanced)";
  else if (eloDiff <= 60) description = "⚖️ Very Balanced";
  else if (eloDiff <= 120) description = "⚡ Competitive";
  else description = "⚠️ Skill Gap (Underdog Challenge)";

  return {
    teamA,
    teamB,
    teamAElo: avgA,
    teamBElo: avgB,
    eloDifference: eloDiff,
    fairnessScore,
    winProbabilityA,
    description
  };
}

/**
 * Generates all 3 possible 2v2 combinations from 4 selected players,
 * sorted by closest team average Elo (most competitive first).
 */
export function generateBalanced2v2(players: GroupingPlayer[]): MatchRecommendation[] {
  if (players.length !== 4) return [];

  const [p1, p2, p3, p4] = players;

  // 3 possible unique pairings of 4 players into two 2-player teams:
  // Option 1: (p1, p2) vs (p3, p4)
  // Option 2: (p1, p3) vs (p2, p4)
  // Option 3: (p1, p4) vs (p2, p3)
  const pairings = [
    { teamA: [p1, p2], teamB: [p3, p4] },
    { teamA: [p1, p3], teamB: [p2, p4] },
    { teamA: [p1, p4], teamB: [p2, p3] }
  ];

  return pairings
    .map(pair => evaluatePairing(pair.teamA, pair.teamB))
    .sort((a, b) => a.eloDifference - b.eloDifference);
}

/**
 * Modern Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Court Shuffler with Rotation Fairness and Locked Pairs.
 * 
 * Rules:
 * 1. Locked Pairs (up to 2 pairs): Players in locked pairs are guaranteed to be placed on the same team.
 * 2. Playtime Fairness: Players with FEWER matches in the current session are selected first to play on courts.
 * 3. Random Shuffling: Among players eligible to play, assignments and pairings are randomized (not based on rating).
 * 4. Multi-court & Resting: Fills Court 1, Court 2, etc. (4 players per court). Excess players are marked as "Resting / Next Up".
 */
export function shuffleCourts(
  attendees: GroupingPlayer[],
  matchCountPerPlayer: Record<string, number> = {},
  numCourts: number = 1,
  lockedPairs: LockedPair[] = []
): CourtShuffleResult {
  if (!attendees || attendees.length === 0) {
    return { courtAssignments: [], restingPlayers: [] };
  }

  const maxActivePlayers = numCourts * 4;
  const playerMap = new Map(attendees.map(p => [p.id, {
    ...p,
    matchesPlayedInSession: matchCountPerPlayer[p.id] || 0
  }]));

  // Validate and extract locked pair units
  const lockedUnits: { type: "locked"; players: GroupingPlayer[]; avgMatches: number }[] = [];
  const lockedPlayerIds = new Set<string>();

  for (const pair of lockedPairs) {
    const p1 = playerMap.get(pair.player1Id);
    const p2 = playerMap.get(pair.player2Id);
    if (p1 && p2 && p1.id !== p2.id && !lockedPlayerIds.has(p1.id) && !lockedPlayerIds.has(p2.id)) {
      lockedPlayerIds.add(p1.id);
      lockedPlayerIds.add(p2.id);
      lockedUnits.push({
        type: "locked",
        players: [p1, p2],
        avgMatches: ((p1.matchesPlayedInSession ?? 0) + (p2.matchesPlayedInSession ?? 0)) / 2
      });
    }
  }

  // Extract individual unlocked units
  const individualUnits: { type: "individual"; player: GroupingPlayer; matches: number }[] = [];
  for (const p of attendees) {
    if (!lockedPlayerIds.has(p.id)) {
      const fullPlayer = playerMap.get(p.id) || p;
      individualUnits.push({
        type: "individual",
        player: fullPlayer,
        matches: fullPlayer.matchesPlayedInSession ?? 0
      });
    }
  }

  // Priority selection based on fewest matches played
  // Shuffle within the same match count bracket for fairness & randomness
  const sortedIndividuals = [...individualUnits].sort((a, b) => {
    if (a.matches !== b.matches) return a.matches - b.matches;
    return Math.random() - 0.5; // randomize tie breaks
  });

  const sortedLocked = [...lockedUnits].sort((a, b) => {
    if (a.avgMatches !== b.avgMatches) return a.avgMatches - b.avgMatches;
    return Math.random() - 0.5;
  });

  // Assemble active pool respecting maxActivePlayers
  // Prioritize locked pairs if their average match count is competitive
  const activeTeams: GroupingPlayer[][] = [];
  const activeIndividuals: GroupingPlayer[] = [];
  let availableSlots = maxActivePlayers;

  // Insert locked pairs first if space permits
  for (const lUnit of sortedLocked) {
    if (availableSlots >= 2) {
      activeTeams.push(lUnit.players);
      availableSlots -= 2;
    }
  }

  // Fill remaining slots with individual players who played least
  const selectedIndividualIds = new Set<string>();
  for (const iUnit of sortedIndividuals) {
    if (availableSlots > 0) {
      activeIndividuals.push(iUnit.player);
      selectedIndividualIds.add(iUnit.player.id);
      availableSlots--;
    }
  }

  // If we couldn't fit a locked pair, release them into individuals if slots remain
  for (const lUnit of sortedLocked) {
    if (!activeTeams.includes(lUnit.players)) {
      for (const p of lUnit.players) {
        if (availableSlots > 0 && !selectedIndividualIds.has(p.id)) {
          activeIndividuals.push(p);
          selectedIndividualIds.add(p.id);
          availableSlots--;
        }
      }
    }
  }

  // Randomize the active individuals and form 2-player teams
  const shuffledIndividuals = shuffleArray(activeIndividuals);
  for (let i = 0; i < shuffledIndividuals.length; i += 2) {
    if (i + 1 < shuffledIndividuals.length) {
      activeTeams.push([shuffledIndividuals[i], shuffledIndividuals[i + 1]]);
    } else {
      // Odd 1 player leftover in active queue, push to resting
      // (Will be handled below)
    }
  }

  // Randomly pair teams into 2v2 courts
  const shuffledTeams = shuffleArray(activeTeams);
  const courtAssignments: CourtAssignment[] = [];
  const activeAssignedIds = new Set<string>();

  const fullCourtsPossible = Math.min(numCourts, Math.floor(shuffledTeams.length / 2));
  for (let c = 0; c < fullCourtsPossible; c++) {
    const teamA = shuffledTeams[c * 2];
    const teamB = shuffledTeams[c * 2 + 1];

    teamA.forEach(p => activeAssignedIds.add(p.id));
    teamB.forEach(p => activeAssignedIds.add(p.id));

    courtAssignments.push({
      courtNumber: c + 1,
      match: evaluatePairing(teamA, teamB)
    });
  }

  // Resting players are anyone in attendees who wasn't assigned to a court
  const restingPlayers: GroupingPlayer[] = attendees
    .filter(p => !activeAssignedIds.has(p.id))
    .map(p => playerMap.get(p.id) || p)
    .sort((a, b) => (a.matchesPlayedInSession ?? 0) - (b.matchesPlayedInSession ?? 0));

  return {
    courtAssignments,
    restingPlayers
  };
}
