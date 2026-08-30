/**
 * Auto-Grouping, Court Shuffler & Session Tournament / Ladder Engine
 * 
 * Capabilities:
 * 1. Random Court Shuffler with Rotation Fairness (prioritizes least-played players).
 * 2. Multi-court support (1 to 4 courts) with Active vs Resting / Next Up queues.
 * 3. Locked Pairings support (forcefully locks specific 2-player pairs so they stay together).
 * 4. Custom 4-Player Balancer (generates all 3 2v2 combinations ranked by Elo fairness).
 * 5. King of the Court / Tournament Mode:
 *    - "Accept & Start Tournament" from initial pairing list.
 *    - Winner vs Winner / King stays.
 *    - Loser vs Loser or rotation to bench.
 *    - 5-player rotation: Loser randomly rotates 1 player out to bench; resting player enters.
 *    - 6-player rotation: 2 resting players enter together; losing pair takes the rest slot.
 *    - Multi-court promotion / demotion (Court 2 winners promote to Court 1, Court 1 losers move to Court 2).
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

export interface TournamentCourtMatch {
  courtNumber: number;
  teamA: GroupingPlayer[];
  teamB: GroupingPlayer[];
  winner?: "A" | "B";
  scoreA?: number;
  scoreB?: number;
  isRecorded?: boolean;
}

export interface TournamentRound {
  roundNumber: number;
  courts: TournamentCourtMatch[];
  restingPlayers: GroupingPlayer[];
}

export interface TournamentState {
  isActive: boolean;
  currentRound: TournamentRound;
  roundHistory: TournamentRound[];
  numCourts: number;
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
 * Fisher-Yates shuffle
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
  const sortedIndividuals = [...individualUnits].sort((a, b) => {
    if (a.matches !== b.matches) return a.matches - b.matches;
    return Math.random() - 0.5;
  });

  const sortedLocked = [...lockedUnits].sort((a, b) => {
    if (a.avgMatches !== b.avgMatches) return a.avgMatches - b.avgMatches;
    return Math.random() - 0.5;
  });

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

  // If locked pairs couldn't fit as a pair, release individuals if slots remain
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

/**
 * Initializes a Tournament from an accepted Shuffle result.
 */
export function initializeTournament(
  shuffleResult: CourtShuffleResult,
  numCourts: number
): TournamentState {
  const currentRound: TournamentRound = {
    roundNumber: 1,
    courts: shuffleResult.courtAssignments.map(ca => ({
      courtNumber: ca.courtNumber,
      teamA: ca.match.teamA,
      teamB: ca.match.teamB
    })),
    restingPlayers: shuffleResult.restingPlayers
  };

  return {
    isActive: true,
    currentRound,
    roundHistory: [],
    numCourts
  };
}

/**
 * Advances the tournament to the next round based on match outcomes:
 * 
 * Rules:
 * 1. Single Court (1 Court):
 *    - 4 Players Total: Winners vs Losers (losers rematch or players swap partners).
 *    - 5 Players Total: Winning pair stays intact on Court 1.
 *      From the losing pair, 1 player is randomly rotated to rest (or player with higher games).
 *      The resting player from the previous round enters and partners with the remaining loser to challenge the winners.
 *    - 6 Players Total: Winning pair stays intact on Court 1.
 *      Losing pair moves to the resting bench.
 *      The 2 resting players from previous round enter as a fresh pair on Court 1.
 *    - 7+ Players Total: Winners stay, fresh resting pair enters from top of bench queue, losing pair joins end of bench.
 * 
 * 2. Multi-Court (2+ Courts):
 *    - Court 1 Winners stay on Court 1 (King Court).
 *    - Court 2 Winners promote to Court 1 to face Court 1 Winners.
 *    - Court 1 Losers demote to Court 2.
 *    - If there are resting players: Top resting pair enters Court 2, Court 2 Losers rotate to bench.
 *    - If no resting players: Court 1 Losers vs Court 2 Losers on Court 2.
 */
export function advanceTournamentRound(
  currentState: TournamentState,
  updatedCourtsWithWinners: TournamentCourtMatch[]
): TournamentState {
  const prevRound = currentState.currentRound;
  const numCourts = currentState.numCourts;
  const nextRoundNumber = prevRound.roundNumber + 1;

  const totalPlayersInTournament = 
    updatedCourtsWithWinners.reduce((sum, c) => sum + c.teamA.length + c.teamB.length, 0) +
    prevRound.restingPlayers.length;

  const newCourts: TournamentCourtMatch[] = [];
  let newRestingPlayers: GroupingPlayer[] = [];

  if (numCourts === 1) {
    const court = updatedCourtsWithWinners[0];
    const winningTeam = court.winner === "B" ? court.teamB : court.teamA;
    const losingTeam = court.winner === "B" ? court.teamA : court.teamB;

    if (totalPlayersInTournament === 4) {
      // 4 Players: Shuffle/rematch on same court
      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: losingTeam
      });
      newRestingPlayers = [];
    } else if (totalPlayersInTournament === 5) {
      // 5 Players: Winner pair stays.
      // Randomly pick 1 player from losing team to rest (or pick the one who played more)
      const shuffledLosing = shuffleArray(losingTeam);
      const loserResting = shuffledLosing[0];
      const loserStaying = shuffledLosing[1];

      // Resting player from previous round comes in
      const incomingPlayer = prevRound.restingPlayers[0];

      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: [loserStaying, incomingPlayer]
      });

      newRestingPlayers = [loserResting];
    } else if (totalPlayersInTournament === 6) {
      // 6 Players: Winner pair stays on Court 1.
      // 2 Resting players from previous round come in as Team B.
      // Losing pair takes the bench.
      const incomingPair = prevRound.restingPlayers.slice(0, 2);

      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: incomingPair
      });

      newRestingPlayers = losingTeam;
    } else {
      // 7+ Players (1 court): Winners stay.
      // Top 2 resting players come in as challengers.
      // Losers join the end of the resting queue.
      const incomingPair = prevRound.restingPlayers.slice(0, 2);
      const remainingResting = prevRound.restingPlayers.slice(2);

      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: incomingPair
      });

      newRestingPlayers = [...remainingResting, ...losingTeam];
    }
  } else {
    // Multi-Court logic (2+ courts)
    // Extract winners and losers per court
    const courtResults = updatedCourtsWithWinners.map(c => ({
      courtNumber: c.courtNumber,
      winner: c.winner === "B" ? c.teamB : c.teamA,
      loser: c.winner === "B" ? c.teamA : c.teamB
    }));

    // Court 1: Top Court (King Court)
    // Team A: Court 1 Winner
    // Team B: Court 2 Winner (promoted)
    const court1Winner = courtResults[0].winner;
    const court2Winner = courtResults[1]?.winner || courtResults[0].loser;

    newCourts.push({
      courtNumber: 1,
      teamA: court1Winner,
      teamB: court2Winner
    });

    // Lower Courts (Court 2, 3, etc.)
    const court1Loser = courtResults[0].loser;
    const court2Loser = courtResults[1]?.loser;

    if (prevRound.restingPlayers.length >= 2) {
      // Resting pair enters Court 2
      const incomingRestingPair = prevRound.restingPlayers.slice(0, 2);
      const benchTail = prevRound.restingPlayers.slice(2);

      newCourts.push({
        courtNumber: 2,
        teamA: court1Loser,
        teamB: incomingRestingPair
      });

      // Court 2 Loser goes to bench
      newRestingPlayers = [...benchTail, ...(court2Loser ? court2Loser : [])];
    } else {
      // No full resting pair, Court 1 Loser plays Court 2 Loser on Court 2
      newCourts.push({
        courtNumber: 2,
        teamA: court1Loser,
        teamB: court2Loser || court1Winner
      });

      newRestingPlayers = prevRound.restingPlayers;
    }
  }

  const newRound: TournamentRound = {
    roundNumber: nextRoundNumber,
    courts: newCourts,
    restingPlayers: newRestingPlayers
  };

  return {
    ...currentState,
    currentRound: newRound,
    roundHistory: [...currentState.roundHistory, {
      ...prevRound,
      courts: updatedCourtsWithWinners
    }]
  };
}
