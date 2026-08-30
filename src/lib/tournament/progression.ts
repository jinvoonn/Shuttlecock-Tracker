import { ShufflerPlayer, ShufflerPair, TournamentState, TournamentRound, TournamentMatch, ShufflerOption } from "./types";
import { shuffleArray } from "./pairing";

/**
 * Initializes Tournament State from an accepted Shuffler Option
 */
export function initializeTournamentState(
  sessionId: string,
  option: ShufflerOption,
  numCourts: number,
  playersPerTeam: number = 2
): TournamentState {
  const restHistory: Record<string, number> = {};
  option.restingPlayers.forEach(p => {
    restHistory[p.id] = (restHistory[p.id] || 0) + 1;
  });

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
  option.waitingPairs.forEach(w => {
    recordPair(w.players);
  });

  const currentRound: TournamentRound = {
    roundNumber: 1,
    courts: option.courtMatches.map(c => ({
      courtNumber: c.courtNumber,
      teamA: c.teamA,
      teamB: c.teamB
    })),
    waitingPairs: option.waitingPairs,
    restingPlayers: option.restingPlayers
  };

  return {
    sessionId,
    isActive: true,
    currentRound,
    roundHistory: [],
    numCourts,
    playersPerTeam,
    restHistory,
    partnerHistory
  };
}

/**
 * Advances to the Next Round of the tournament based on Winner/Loser progression:
 * 
 * Rules:
 * 1. Winners play Winners (or promote to Top Court).
 * 2. Losers play Losers (or demote/rotate with bench).
 * 3. 5-Player Single Court:
 *    - Winning pair stays intact on Court 1.
 *    - Losing team rotates 1 player to bench (prioritizing the one who rested least).
 *    - Previous resting player enters and partners with remaining loser.
 * 4. 6-Player Single Court:
 *    - Winning pair stays intact on Court 1.
 *    - The waiting pair enters Court 1 as challengers.
 *    - Losing pair rotates to the waiting/resting queue.
 * 5. Multi-Courts (e.g. 2 Courts):
 *    - Court 1 Winners vs Court 2 Winners (or Court 2 Winners promote to Court 1).
 *    - Court 1 Losers demote to Court 2.
 *    - Waiting pairs rotate into Court 2.
 */
export function advanceTournamentState(
  currentState: TournamentState,
  decidedCourts: TournamentMatch[]
): TournamentState {
  const prevRound = currentState.currentRound;
  const nextRoundNumber = prevRound.roundNumber + 1;
  const numCourts = currentState.numCourts;
  const playersPerTeam = currentState.playersPerTeam;

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
  let newWaitingPairs: ShufflerPair[] = [];
  let newRestingPlayers: ShufflerPlayer[] = [];

  const totalPlayersInRound = 
    decidedCourts.reduce((sum, c) => sum + c.teamA.length + c.teamB.length, 0) +
    prevRound.waitingPairs.reduce((sum, w) => sum + w.players.length, 0) +
    prevRound.restingPlayers.length;

  if (numCourts === 1) {
    const court = decidedCourts[0];
    const winningTeam = court.winner === "B" ? court.teamB : court.teamA;
    const losingTeam = court.winner === "B" ? court.teamA : court.teamB;

    if (totalPlayersInRound === 4) {
      // 4 Players: Rematch or shuffle partners
      // Dynamically remix partners between winning pair and losing pair for variety
      const [w1, w2] = winningTeam;
      const [l1, l2] = losingTeam;

      // New 2v2: (w1 + l1) vs (w2 + l2)
      const nextTeamA = [w1, l1];
      const nextTeamB = [w2, l2];

      recordPair(nextTeamA);
      recordPair(nextTeamB);

      newCourts.push({
        courtNumber: 1,
        teamA: nextTeamA,
        teamB: nextTeamB
      });
    } else if (totalPlayersInRound === 5) {
      // 5 Players: Winning pair stays intact on Court 1
      // From losing team: choose player with LEAST rest history to go to bench
      const [l1, l2] = losingTeam;
      const restCount1 = newRestHistory[l1.id] || 0;
      const restCount2 = newRestHistory[l2.id] || 0;

      let playerToBench: ShufflerPlayer;
      let playerToStay: ShufflerPlayer;

      if (restCount1 < restCount2) {
        playerToBench = l1;
        playerToStay = l2;
      } else if (restCount2 < restCount1) {
        playerToBench = l2;
        playerToStay = l1;
      } else {
        // Equal rest counts: randomize
        const shuffled = shuffleArray(losingTeam);
        playerToBench = shuffled[0];
        playerToStay = shuffled[1];
      }

      // Incoming resting player from previous round
      const incomingPlayer = prevRound.restingPlayers[0];
      const challengerTeam = [playerToStay, incomingPlayer];

      recordPair(challengerTeam);
      newRestHistory[playerToBench.id] = (newRestHistory[playerToBench.id] || 0) + 1;

      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: challengerTeam
      });
      newRestingPlayers = [playerToBench];
    } else if (prevRound.waitingPairs.length > 0) {
      // 6+ Players: Waiting pair comes in to challenge winners
      const incomingPair = prevRound.waitingPairs[0];
      const remainingWaiting = prevRound.waitingPairs.slice(1);

      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: incomingPair.players
      });

      // Losing pair joins waiting queue
      newWaitingPairs = [
        ...remainingWaiting,
        {
          id: `waiting-pair-${losingTeam.map(p => p.id).join("-")}`,
          players: losingTeam
        }
      ];
      newRestingPlayers = prevRound.restingPlayers;
    } else {
      // General fallback
      newCourts.push({
        courtNumber: 1,
        teamA: winningTeam,
        teamB: losingTeam
      });
    }
  } else {
    // Multi-Court (2+ courts)
    const results = decidedCourts.map(c => ({
      courtNumber: c.courtNumber,
      winner: c.winner === "B" ? c.teamB : c.teamA,
      loser: c.winner === "B" ? c.teamA : c.teamB
    }));

    // Court 1 (King Court): Court 1 Winner vs Court 2 Winner (promoted)
    const court1Winner = results[0].winner;
    const court2Winner = results[1]?.winner || results[0].loser;

    newCourts.push({
      courtNumber: 1,
      teamA: court1Winner,
      teamB: court2Winner
    });

    // Court 2 (Lower Court): Court 1 Loser vs Court 2 Loser OR Waiting Pair
    const court1Loser = results[0].loser;
    const court2Loser = results[1]?.loser;

    if (prevRound.waitingPairs.length > 0) {
      const incomingPair = prevRound.waitingPairs[0];
      const remainingWaiting = prevRound.waitingPairs.slice(1);

      newCourts.push({
        courtNumber: 2,
        teamA: court1Loser,
        teamB: incomingPair.players
      });

      if (court2Loser) {
        newWaitingPairs = [
          ...remainingWaiting,
          {
            id: `waiting-pair-${court2Loser.map(p => p.id).join("-")}`,
            players: court2Loser
          }
        ];
      }
    } else {
      newCourts.push({
        courtNumber: 2,
        teamA: court1Loser,
        teamB: court2Loser || court1Winner
      });
    }

    newRestingPlayers = prevRound.restingPlayers;
  }

  const newRound: TournamentRound = {
    roundNumber: nextRoundNumber,
    courts: newCourts,
    waitingPairs: newWaitingPairs,
    restingPlayers: newRestingPlayers
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
