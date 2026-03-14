/**
 * Evaluates combinations to balance skill.
 * Finds a division of playQueue into two teams that minimizes the difference in averge skill ratings.
 */

export interface PlayerStats {
    id: string;
    name: string;
    skill_rating: number; // 1-10
}

interface GroupingResult {
    teamA: PlayerStats[];
    teamB: PlayerStats[];
    benched: PlayerStats[];
}

export function generateAutoMatch(
    sessionPlayers: PlayerStats[], 
    pastMatches: any[], 
    config: { balanceSkill: boolean, avoidRepeatPartners: boolean, playersPerTeam: number }
): GroupingResult {
    if (sessionPlayers.length === 0) {
        return { teamA: [], teamB: [], benched: [] };
    }

    const playersPerTeam = config.playersPerTeam || 2;
    const requiredTotal = playersPerTeam * 2;

    // Shuffle array (Fisher-Yates) purely for initial randomness 
    // to prevent deterministic output on identical inputs without parameters.
    const candidates = [...sessionPlayers].sort(() => Math.random() - 0.5);

    // Bench excess players
    const benched = candidates.length > requiredTotal 
        ? candidates.slice(requiredTotal)
        : [];
        
    const playingQueue = candidates.slice(0, requiredTotal);
    
    // If we don't have enough players to form two standard teams,
    // just split who we have down the middle as best as possible.
    if (playingQueue.length < 2) {
         return {
             teamA: playingQueue,
             teamB: [],
             benched
         };
    }

    // Default basic split
    let bestTeamA = playingQueue.slice(0, Math.ceil(playingQueue.length / 2));
    let bestTeamB = playingQueue.slice(Math.ceil(playingQueue.length / 2));
    let bestScore = Infinity;

    // Evaluate combinations
    const totalCombinations = 1 << playingQueue.length;
    const targetSizeA = Math.ceil(playingQueue.length / 2);

    for (let mask = 0; mask < totalCombinations; mask++) {
        const teamA: PlayerStats[] = [];
        const teamB: PlayerStats[] = [];

        // Distribute players based on bitmask
        for (let i = 0; i < playingQueue.length; i++) {
            if ((mask & (1 << i))) {
                teamA.push(playingQueue[i]);
            } else {
                teamB.push(playingQueue[i]);
            }
        }

        // Must divide teams evently 
        if (teamA.length !== targetSizeA) continue;

        let penaltyScore = 0;

        // Balance Skill Penalty - Evaluate absolute difference of averages
        if (config.balanceSkill) {
            const avgA = teamA.reduce((sum, p) => sum + (p.skill_rating || 5), 0) / (teamA.length || 1);
            const avgB = teamB.reduce((sum, p) => sum + (p.skill_rating || 5), 0) / (teamB.length || 1);
            
            // Large multiplier to prioritize skill balancing tightly
            penaltyScore += Math.abs(avgA - avgB) * 50; 
        }

        // Avoid Repeat Penalty - Scan last matches
        if (config.avoidRepeatPartners && pastMatches && pastMatches.length > 0) {
           const penalty = calculateRepeatPenalty(teamA, teamB, pastMatches);
           penaltyScore += penalty;
        }

        // Save best
        if (penaltyScore < bestScore) {
            bestScore = penaltyScore;
            bestTeamA = [...teamA];
            bestTeamB = [...teamB];
        }
    }

    return {
        teamA: bestTeamA,
        teamB: bestTeamB,
        benched: benched
    };
}

/**
 * Assigns weight values to repeating partners to actively discourage it
 * 100 points for immediate prior match
 * 20 points for any other match in the session
 */
function calculateRepeatPenalty(teamA: PlayerStats[], teamB: PlayerStats[], pastMatches: any[]): number {
    let penalty = 0;
    
    const evalTeamHistory = (team: PlayerStats[]) => {
        if (team.length < 2) return;
        
        // compare pairs inside the simulated team
        for (let i = 0; i < team.length; i++) {
            for (let j = i + 1; j < team.length; j++) {
                const p1 = team[i].id;
                const p2 = team[j].id;

                // Check matches (reverse order = newest first)
                const sortedMatches = [...pastMatches].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                sortedMatches.forEach((match, idx) => {
                    // find which team p1 was on
                    const p1Player = match.match_players?.find((mp: any) => mp.player_id === p1);
                    const p2Player = match.match_players?.find((mp: any) => mp.player_id === p2);

                    if (p1Player && p2Player && p1Player.team === p2Player.team) {
                        // Partnered!
                        if (idx === 0) {
                            penalty += 100; // Immediate last match
                        } else {
                            penalty += 20; // Earlier in session
                        }
                    }
                });
            }
        }
    };

    evalTeamHistory(teamA);
    evalTeamHistory(teamB);

    return penalty;
}
