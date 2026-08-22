"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getLeaderboard, getGlobalInsights } from "@/lib/analytics/leaderboard";
import dynamic from 'next/dynamic';
import { Season, SeasonPlayerResult, calculateSoftResetRatings } from "@/lib/analytics/season";
import SeasonAdminModal from "@/components/admin/SeasonAdminModal";

const MobileDash = dynamic(() => import("@/stitch-designs/mobile/Dashboard"), { ssr: false }) as any;
const DesktopDash = dynamic(() => import("@/stitch-designs/desktop/Dashboard"), { ssr: false }) as any;
import { LeaderboardEntry } from "@/lib/analytics/types";

import { useMatches } from "@/context/MatchesContext";

interface DashboardClientProps {
  playersData: any[];
  paymentsData: any[];
  purchasesData: any[];
  sessionsData: any[];
  sessionUsageData: any[];
  snapshotsData: any[];
  seasonsData?: Season[];
  seasonResultsData?: SeasonPlayerResult[];
  isAdmin: boolean;
  basePath: string;
}

export default function DashboardClient({
  playersData,
  paymentsData,
  purchasesData,
  sessionsData,
  sessionUsageData,
  snapshotsData,
  seasonsData = [],
  seasonResultsData = [],
  isAdmin,
  basePath
}: DashboardClientProps) {
  const { matches } = useMatches();
  const [lastUpdatedPlayerIds, setLastUpdatedPlayerIds] = useState<string[]>([]);
  const [isLiveUpdate, setIsLiveUpdate] = useState(false);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);

  // Active Season
  const activeSeason = useMemo(() => {
    return seasonsData.find(s => s.status === 'active') || seasonsData[0] || {
      id: "fallback-season-1",
      season_number: 1,
      name: "Season 1",
      status: "active",
      start_date: "2023-09-13"
    };
  }, [seasonsData]);

  // Selected Season Filter (defaults to active season ID)
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(activeSeason.id);

  // Keep selectedSeasonId synchronized if activeSeason changes
  useEffect(() => {
    if (activeSeason?.id && (!selectedSeasonId || selectedSeasonId === "fallback-season-1")) {
      setSelectedSeasonId(activeSeason.id);
    }
  }, [activeSeason?.id]);

  const prevMatchesLength = React.useRef(matches.length);
  
  useEffect(() => {
    if (matches.length > prevMatchesLength.current) {
      setIsLiveUpdate(true);
      const lastMatch = matches[matches.length - 1];
      const affected = [
          lastMatch.team_a_player1, 
          lastMatch.team_a_player2, 
          lastMatch.team_b_player1, 
          lastMatch.team_b_player2
      ].filter(Boolean);
      setLastUpdatedPlayerIds(affected);
      setTimeout(() => setIsLiveUpdate(false), 5000);
    }
    prevMatchesLength.current = matches.length;
  }, [matches]);

  const { statsProps, mobileStatsProps, players, insights, trendData, leaderboard, activeSeasonMatchesCount } = useMemo(() => {
    const playerMap = Object.fromEntries((playersData || []).map(p => [p.id, p.name]));
    const allNormalizedMatches = normalizeMatches(matches, playerMap);

    // 1. Determine active season matches
    const activeSeasonMatches = allNormalizedMatches.filter(m => {
      if (m.seasonId) return m.seasonId === activeSeason.id;
      return activeSeason.season_number === 1; // Unassigned matches belong to Season 1
    });

    // 2. Compute Soft-Reset Initial Seeds for Active Season if Season > 1
    let initialRatings: Record<string, { r: number; rd: number; xp?: number }> | undefined = undefined;
    if (activeSeason.season_number > 1) {
      const prevSeasonNumber = activeSeason.season_number - 1;
      const prevSeason = seasonsData.find(s => s.season_number === prevSeasonNumber);
      if (prevSeason) {
        const prevResults = seasonResultsData.filter(r => r.season_id === prevSeason.id);
        const prevSeedMap: Record<string, { r: number; rd: number; xp?: number }> = {};
        prevResults.forEach(r => {
          prevSeedMap[r.player_id] = { r: r.final_mmr, rd: r.final_rd, xp: 0 };
        });
        initialRatings = calculateSoftResetRatings(prevSeedMap, activeSeason.config);
      }
    }

    // 3. Compute Leaderboard depending on selected season
    let computedLeaderboard: LeaderboardEntry[] = [];
    const isCompletedSeasonSelected = selectedSeasonId !== "all-time" && selectedSeasonId !== activeSeason.id;
    const isAllTimeSelected = selectedSeasonId === "all-time";

    if (isCompletedSeasonSelected) {
      // Historical Season: Render the frozen snapshot directly!
      const snapshots = seasonResultsData.filter(r => r.season_id === selectedSeasonId);
      computedLeaderboard = snapshots
        .sort((a, b) => a.final_rank - b.final_rank)
        .map(r => ({
          id: r.player_id,
          name: playerMap[r.player_id] || r.player_name || "Unknown",
          wins: r.wins,
          losses: r.losses,
          draws: r.draws,
          totalGames: r.matches_played,
          winRate: r.win_rate,
          streak: r.streak,
          maxStreak: r.max_streak,
          lastResults: [],
          placementMatchesPlayed: Math.min(r.matches_played, 5),
          isRanked: r.matches_played >= 5,
          rank: r.final_rank,
          elo: r.final_cock_rating
        }));
    } else if (isAllTimeSelected) {
      // All-Time / Career: Aggregate all historical matches
      const { stats: careerStats, elo: careerElo } = aggregatePlayerStats(allNormalizedMatches, playerMap);
      computedLeaderboard = getLeaderboard(careerStats, careerElo, { sortBy: "elo" });
    } else {
      // Active Season: Compute live seasonal ratings seeded from previous season
      const { stats: seasonStats, elo: seasonElo } = aggregatePlayerStats(
        activeSeasonMatches,
        playerMap,
        { initialRatings }
      );
      computedLeaderboard = getLeaderboard(seasonStats, seasonElo, { sortBy: "elo" });
    }

    // 4. Global Insights (calculated from active season or all-time)
    const { stats: activeStats } = aggregatePlayerStats(activeSeasonMatches, playerMap, { initialRatings });
    const { mostWinsPlayer, bestWinRatePlayer, longestStreakPlayer } = getGlobalInsights(activeStats);
    const computedInsights = [
      {
        title: "Most Wins",
        icon: "🏆",
        value: mostWinsPlayer ? mostWinsPlayer.name : "None",
        subValue: mostWinsPlayer ? `${mostWinsPlayer.wins} Wins` : "0 Wins"
      },
      {
        title: "Best Win Rate",
        icon: "🎯",
        value: bestWinRatePlayer ? bestWinRatePlayer.name : "None",
        subValue: bestWinRatePlayer ? `${(bestWinRatePlayer.winRate * 100).toFixed(1)}%` : "0%"
      },
      {
        title: "Longest Win Streak",
        icon: "🔥",
        value: longestStreakPlayer ? longestStreakPlayer.name : "None",
        subValue: longestStreakPlayer ? `${longestStreakPlayer.maxStreak} Wins Streak` : "0 Wins"
      }
    ];

    // 5. Monthly Trends (Lifetime financial/inventory data)
    const monthlyTrends: Record<string, { month: string, spending: number, usage: number }> = {};
    (sessionsData || []).forEach(s => {
      const date = new Date(s.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { month: monthName, spending: 0, usage: 0 };
      }
    });

    (sessionUsageData || []).forEach(su => {
      const s = (sessionsData || []).find(sess => sess.id === su.session_id);
      if (!s) return;
      const date = new Date(s.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
      const price_per_cock = Number(purchase?.price_per_cock || 0);
      const qty = Number(su.quantity_used || 0);
      if (monthlyTrends[monthKey]) {
        monthlyTrends[monthKey].spending += (price_per_cock * qty);
        monthlyTrends[monthKey].usage += qty;
      }
    });

    const computedTrendData = Object.entries(monthlyTrends)
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([, val]) => val)
      .slice(-6);

    // 6. Balances (Strictly Lifetime Data - 100% Isolated from Seasons)
    const playerBalances: Record<string, any> = {};
    (playersData || []).forEach(p => {
      playerBalances[p.id] = { id: p.id, name: p.name, totalShares: 0, totalPayments: 0, balance: 0 };
    });

    (paymentsData || []).forEach(p => {
      if (playerBalances[p.player_id]) {
        playerBalances[p.player_id].totalPayments += Number(p.amount || 0);
      }
    });

    const sessionCosts: Record<string, number> = {};
    (sessionUsageData || []).forEach(su => {
      const sId = su.session_id;
      const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
      const price_per_cock = Number(purchase?.price_per_cock || 0);
      sessionCosts[sId] = (sessionCosts[sId] || 0) + (price_per_cock * Number(su.quantity_used || 0));
    });

    (sessionsData || []).forEach(s => {
      const cost = sessionCosts[s.id] || 0;
      const attendees = s.session_players || [];
      if (attendees.length > 0) {
        const share = cost / attendees.length;
        attendees.forEach((ap: { player_id: string }) => {
          if (playerBalances[ap.player_id]) {
            playerBalances[ap.player_id].totalShares += share;
          }
        });
      }
    });

    // Active season ratings for player balance cards
    const { elo: currentEloMap } = aggregatePlayerStats(activeSeasonMatches, playerMap, { initialRatings });

    const computedPlayers = Object.values(playerBalances).map((stats: any) => ({
      ...stats,
      balance: stats.totalPayments - stats.totalShares,
      elo: currentEloMap[stats.id] || 1200,
      placementMatchesPlayed: activeStats[stats.id]?.placementMatchesPlayed || 0
    })).sort((a: any, b: any) => a.balance - b.balance);

    const totalOwed = computedPlayers.filter((p: any) => p.balance < 0).reduce((acc: number, p: any) => acc + Math.abs(p.balance), 0);
    const totalShuttles = (purchasesData || []).reduce((acc: number, curr: any) => acc + Number(curr.remaining_quantity || 0), 0);
    const totalShuttlesUsed = (sessionUsageData || []).reduce((acc: number, curr: any) => acc + Number(curr.quantity_used || 0), 0);
    const totalSessions = (sessionsData || []).length;

    const sProps = {
      totalOwed,
      totalShuttlesUsed,
      totalSessions,
      inventory: totalShuttles
    };

    const mStatsProps = {
      ...sProps,
      totalPoolBalance: computedPlayers.reduce((acc: number, p: any) => acc + p.balance, 0),
      inventory: {
          totalTubes: (purchasesData || []).filter((p: any) => (p.remaining_quantity || 0) > 0).length,
          totalShuttles: totalShuttles,
          remainingTubes: (purchasesData || []).filter((p: any) => (p.remaining_quantity || 0) > 0).length
      }
    };

    return {
      leaderboard: computedLeaderboard,
      insights: computedInsights,
      players: computedPlayers,
      statsProps: sProps,
      mobileStatsProps: mStatsProps,
      trendData: computedTrendData,
      activeSeasonMatchesCount: activeSeasonMatches.length
    };
  }, [matches, playersData, paymentsData, purchasesData, sessionsData, sessionUsageData, seasonsData, seasonResultsData, selectedSeasonId, activeSeason]);

  return (
    <>
      <div className="block lg:hidden">
        <MobileDash 
          stats={mobileStatsProps} 
          players={players} 
          insights={insights} 
          trendData={trendData} 
          leaderboard={leaderboard} 
          isLiveUpdate={isLiveUpdate}
          lastUpdatedPlayerIds={lastUpdatedPlayerIds}
          isAdmin={isAdmin}
          snapshots={snapshotsData || []}
          seasons={seasonsData}
          activeSeason={activeSeason}
          selectedSeasonId={selectedSeasonId}
          onSelectSeason={setSelectedSeasonId}
          onOpenSeasonModal={() => setIsSeasonModalOpen(true)}
        />
      </div>
      <div className="hidden lg:block">
        <DesktopDash 
          stats={statsProps} 
          players={players} 
          isAdmin={isAdmin} 
          insights={insights} 
          trendData={trendData} 
          leaderboard={leaderboard} 
          isLiveUpdate={isLiveUpdate}
          lastUpdatedPlayerIds={lastUpdatedPlayerIds}
          snapshots={snapshotsData || []}
          seasons={seasonsData}
          activeSeason={activeSeason}
          selectedSeasonId={selectedSeasonId}
          onSelectSeason={setSelectedSeasonId}
          onOpenSeasonModal={() => setIsSeasonModalOpen(true)}
        />
      </div>

      {/* Admin Season Management Modal */}
      {isAdmin && (
        <SeasonAdminModal
          isOpen={isSeasonModalOpen}
          onClose={() => setIsSeasonModalOpen(false)}
          activeSeason={activeSeason}
          totalMatchesCount={activeSeasonMatchesCount}
          activePlayersCount={players.length}
        />
      )}
    </>
  );
}
