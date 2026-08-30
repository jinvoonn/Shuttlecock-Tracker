import { ShufflerPlayer, ShufflerPair, TournamentState, TournamentRound, TournamentMatch, ShufflerOption } from "./types";
import { shuffleArray } from "./pairing";

/**
 * Initializes a 3-Round Rotation Tournament from an accepted Shuffler Option
 */
export function initializeTournamentState(
  sessionId: string,
  option: ShufflerOption,
  numCourts: number,
  playersPerTeam: number = 2
): TournamentState {
  const restHistory: Record<string, number> = {};
  
  // Record initial rest stats
  option.restingPairs.forEach(rp => {
    rp.players.forEach(p => {
      restHistory[p.id] = (restHistory[p.id] || 0) + 1;
    });
  });
  if (option.oddRestingPlayer) {
    restHistory[option.oddRestingPlayer.id] = (restHistory[option.oddRestingPlayer.id] || 0) + 1;
  }

  const partnerHistory: Record<string, Record<string, number>> = {};
  const recordPair = (players: ShufflerPlayer[]) => {
    if (players.length === 2) {
      const [p1, p2] = players;
      if (!partnerHistory[p1.id]) partnerHistory[p1.id] = {};
      if (!partnerHistory[p2.id]) partnerHistory[p2.id] = {};
      partnerHistory[p1.id][p2.id] = (partnerHistory[p1.id][p2.id] || 0) + 1;
      partnerHistory[p2.id][p1.id] = (partnerHistory[p2.id][p1.id] || 0) + 1;
    }
  };

  option.courtMatches.forEach(c => {
    recordPair(c.teamA);
    recordPair(c.teamB);
  });
  option.restingPairs.forEach(rp => {
    recordPair(rp.players);
  });

  const currentRound: TournamentRound = {
    roundNumber: 1,
    courts: option.courtMatches.map(c => ({
      courtNumber: c.courtNumber,
      teamA: c.teamA,
      teamB: c.teamB
    })),
    restingPairs: option.restingPairs,
    oddRestingPlayer: option.oddRestingPlayer
  };

  return {
    sessionId,
    isActive: true,
    isCompleted: false,
    totalRounds: 3,
    currentRound,
    roundHistory: [],
    numCourts,
    playersPerTeam,
    initialOddRestingPlayerId: option.oddRestingPlayer ? option.oddRestingPlayer.id : null,
    restHistory,
    partnerHistory
  };
}

/**
 * Advances the 3-Round Rotation Tournament to the next round based on match outcomes:
 * 
 * Round 1 → Round 2:
 * - The Round 1 Winner advances.
 * - The planned resting pair from Round 1 (e.g. AB + CD) enters as the opposing team on Court 1.
 * - The Round 1 Loser (e.g. KC + HX) and Odd Resting Player (e.g. EF) form the new resting arrangement.
 * 
 * Round 2 → Round 3:
 * - In Round 3, the Odd Resting Player (e.g. EF) is GUARANTEED to enter the court.
 * - Out of the remaining candidate players, ONE player is randomly rotated out to the resting bench.
 * - The match pairing is dynamically constructed to incorporate EF and the Round 2 winners/challengers.
 * 
 * After Round 3:
 * - The tournament completes (`isCompleted: true`).
 */
export function advanceTournamentState(
  currentState: TournamentState,
  decidedCourts: TournamentMatch[]
): TournamentState {
  const prevRound = currentState.currentRound;
  const currentRoundNum = prevRound.roundNumber;
  const numCourts = currentState.numCourts;
  const playersPerTeam = currentState.playersPerTeam;

  // If already at Round 3, mark completed
  if (currentRoundNum >= 3) {
    return {
      ...currentState,
      isActive: false,
      isCompleted: true,
      roundHistory: [
        ...currentState.roundHistory,
        { ...prevRound, courts: decidedCourts }
      ]
    };
  }

  const nextRoundNumber = currentRoundNum + 1;
  const newRestHistory = { ...currentState.restHistory };
  const newPartnerHistory = { ...currentState.partnerHistory };

  const recordPair = (players: ShufflerPlayer[]) => {
    if (players.length === 2) {
      const [p1, p2] = players;
      if (!newPartnerHistory[p1.id]) newPartnerHistory[p1.id] = {};
      if (!newPartnerHistory[p2.id]) newPartnerHistory[p2.id] = {};
      newPartnerHistory[p1.id][p2.id] = (newPartnerHistory[p1.id][p2.id] || 0) + 1;
      newPartnerHistory[p2.id][p1.id] = (newPartnerHistory[p2.id][p1.id] || 0) + 1;
    }
  };

  const newCourts: TournamentMatch[] = [];
  let newRestingPairs: ShufflerPair[] = [];
  let newOddRestingPlayer: ShufflerPlayer | null = null;

  if (numCourts === 1) {
    const court = decidedCourts[0];
    const winningTeam = court.winner === "B" ? court.teamB : court.teamA;
    const losingTeam = court.winner === "B" ? court.teamA : court.teamB;

    if (currentRoundNum === 1) {
      // -------------------------------------------------------------
      // ROUND 1 → ROUND 2
      // -------------------------------------------------------------
      if (prevRound.restingPairs.length > 0) {
        // e.g. 7 Players (Playing: Poi+ZT vs KC+HX, Resting: AB+CD, Odd: EF)
        // Winner (Poi+ZT) advances vs Planned Resting Pair (AB+CD)
        const incomingPair = prevRound.restingPairs[0];
        const remainingRestingPairs = prevRound.restingPairs.slice(1);

        newCourts.push({
          courtNumber: 1,
          teamA: winningTeam,
          teamB: incomingPair.players
        });

        // The Round 1 losing pair (KC+HX) and Odd resting player (EF) become the resting lineup
        newRestingPairs = [
          ...remainingRestingPairs,
          {
            id: `resting-pair-${losingTeam.map(p => p.id).join("-")}`,
            players: losingTeam
          }
        ];
        newOddRestingPlayer = prevRound.oddRestingPlayer;
      } else if (prevRound.oddRestingPlayer) {
        // e.g. 5 Players (Playing: A+B vs C+D, Odd Rest: E)
        // Winner (A+B) stays. One player from losing team rotates to rest, E enters.
        const [l1, l2] = losingTeam;
        const shuffled = shuffleArray(losingTeam);
        const playerToRest = shuffled[0];
        const playerToStay = shuffled[1];

        const challengerPair = [playerToStay, prevRound.oddRestingPlayer];
        recordPair(challengerPair);

        newCourts.push({
          courtNumber: 1,
          teamA: winningTeam,
          teamB: challengerPair
        });

        newRestingPairs = [];
        newOddRestingPlayer = playerToRest;
      } else {
        // 4 Players: Shuffle partners between winners and losers
        const [w1, w2] = winningTeam;
        const [l1, l2] = losingTeam;
        const nextTeamA = [w1, l1];
        const nextTeamB = [w2, l2];
        recordPair(nextTeamA);
        recordPair(nextTeamB);

        newCourts.push({
          courtNumber: 1,
          teamA: nextTeamA,
          teamB: nextTeamB
        });
      }
    } else if (currentRoundNum === 2) {
      // -------------------------------------------------------------
      // ROUND 2 → ROUND 3 (Guarantee Odd Resting Player enters)
      // -------------------------------------------------------------
      if (prevRound.oddRestingPlayer) {
        // Odd resting player (e.g. EF) MUST enter in Round 3!
        const guaranteedPlayer = prevRound.oddRestingPlayer;

        // Collect all available candidates:
        // Round 2 winning team (e.g. Poi + ZT), Round 2 losing team (e.g. AB + CD), and any resting pair (KC + HX)
        const candidates = [
          ...winningTeam,
          ...losingTeam
        ];

        // Randomly select 1 candidate to sit out / rest
        const shuffledCandidates = shuffleArray(candidates);
        const playerSittingOut = shuffledCandidates[0];
        const remaining3Players = shuffledCandidates.slice(1);

        // Form 2 teams for Court 1 (4 players: guaranteedPlayer + remaining3Players)
        const active4 = [guaranteedPlayer, ...remaining3Players];
        const finalTeamA = [active4[0], active4[1]];
        const finalTeamB = [active4[2], active4[3]];

        recordPair(finalTeamA);
        recordPair(finalTeamB);

        newCourts.push({
          courtNumber: 1,
          teamA: finalTeamA,
          teamB: finalTeamB
        });

        // The player sitting out and any other resting pairs form the bench
        newRestingPairs = prevRound.restingPairs;
        newOddRestingPlayer = playerSittingOut;
      } else if (prevRound.restingPairs.length > 0) {
        // 6 players (no odd): Next resting pair enters vs Round 2 Winner
        const incomingPair = prevRound.restingPairs[0];
        const remainingPairs = prevRound.restingPairs.slice(1);

        newCourts.push({
          courtNumber: 1,
          teamA: winningTeam,
          teamB: incomingPair.players
        });

        newRestingPairs = [
          ...remainingPairs,
          {
            id: `resting-pair-${losingTeam.map(p => p.id).join("-")}`,
            players: losingTeam
          }
        ];
      } else {
        // 4 players
        const [w1, w2] = winningTeam;
        const [l1, l2] = losingTeam;
        const nextTeamA = [w1, l2];
        const nextTeamB = [w2, l1];
        recordPair(nextTeamA);
        recordPair(nextTeamB);

        newCourts.push({
          courtNumber: 1,
          teamA: nextTeamA,
          teamB: nextTeamB
        });
      }
    }
  } else {
    // -------------------------------------------------------------
    // MULTI-COURT (2+ Courts)
    // -------------------------------------------------------------
    const results = decidedCourts.map(c => ({
      courtNumber: c.courtNumber,
      winner: c.winner === "B" ? c.teamB : c.teamA,
      loser: c.winner === "B" ? c.teamA : c.teamB
    }));

    // Court 1: Court 1 Winner vs Court 2 Winner (promoted)
    const court1Winner = results[0].winner;
    const court2Winner = results[1]?.winner || results[0].loser;

    newCourts.push({
      courtNumber: 1,
      teamA: court1Winner,
      teamB: court2Winner
    });

    // Court 2: Court 1 Loser vs Resting Pair or Court 2 Loser
    const court1Loser = results[0].loser;
    const court2Loser = results[1]?.loser;

    if (prevRound.restingPairs.length > 0) {
      const incomingPair = prevRound.restingPairs[0];
      const remainingPairs = prevRound.restingPairs.slice(1);

      newCourts.push({
        courtNumber: 2,
        teamA: court1Loser,
        teamB: incomingPair.players
      });

      if (court2Loser) {
        newRestingPairs = [
          ...remainingPairs,
          {
            id: `resting-pair-${court2Loser.map(p => p.id).join("-")}`,
            players: court2Loser
          }
        ];
      }
      newOddRestingPlayer = prevRound.oddRestingPlayer;
    } else {
      newCourts.push({
        courtNumber: 2,
        teamA: court1Loser,
        teamB: court2Loser || court1Winner
      });
      newOddRestingPlayer = prevRound.oddRestingPlayer;
    }
  }

  // Update rest stats for newly resting players
  newRestingPairs.forEach(rp => {
    rp.players.forEach(p => {
      newRestHistory[p.id] = (newRestHistory[p.id] || 0) + 1;
    });
  });
  if (newOddRestingPlayer) {
    newRestHistory[newOddRestingPlayer.id] = (newRestHistory[newOddRestingPlayer.id] || 0) + 1;
  }

  const newRound: TournamentRound = {
    roundNumber: nextRoundNumber,
    courts: newCourts,
    restingPairs: newRestingPairs,
    oddRestingPlayer: newOddRestingPlayer
  };

  return {
    ...currentState,
    currentRound: newRound,
    roundHistory: [
      ...currentState.roundHistory,
      { ...prevRound, courts: decidedCourts }
    ],
    restHistory: newRestHistory,
    partnerHistory: newPartnerHistory
  };
}
