"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getLeaderboard, getGlobalInsights } from "@/lib/analytics/leaderboard";
import dynamic from 'next/dynamic';

const MobileDash = dynamic(() => import("@/stitch-designs/mobile/Dashboard"), { ssr: false }) as any;
const DesktopDash = dynamic(() => import("@/stitch-designs/desktop/Dashboard"), { ssr: false }) as any;
import { LeaderboardEntry } from "@/lib/analytics/types";

import { useMatches } from "@/context/MatchesContext";

interface DashboardClientProps {
  // initialMatches is now handled by MatchesProvider at root, 
  // but we might still accept it as a fallback or starting point.
  playersData: any[];
  paymentsData: any[];
  purchasesData: any[];
  sessionsData: any[];
  sessionUsageData: any[];
  isAdmin: boolean;
  basePath: string;
}

export default function DashboardClient({
  playersData,
  paymentsData,
  purchasesData,
  sessionsData,
  sessionUsageData,
  isAdmin,
  basePath
}: DashboardClientProps) {
  const { matches } = useMatches();
  const [lastUpdatedPlayerIds, setLastUpdatedPlayerIds] = useState<string[]>([]);
  const [isLiveUpdate, setIsLiveUpdate] = useState(false);

  // Still need to trigger lastUpdatedPlayerIds and isLiveUpdate when matches change
  // We can use a ref to detect new matches
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

  const { statsProps, mobileStatsProps, players, insights, trendData, leaderboard } = useMemo(() => {
    const playerMap = Object.fromEntries((playersData || []).map(p => [p.id, p.name]));
    const normalizedMatches = normalizeMatches(matches, playerMap);
    const { stats: coreStats, elo: globalElo, eloHistory } = aggregatePlayerStats(normalizedMatches, playerMap);

    // Insights
    const { mostWinsPlayer, bestWinRatePlayer, longestStreakPlayer } = getGlobalInsights(coreStats);
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

    // Rank Movement
    const previousElo: Record<string, number> = {};
    Object.keys(globalElo).forEach(pid => {
      const history = eloHistory[pid] || [];
      if (history.length > 1) {
        previousElo[pid] = history[history.length - 2].elo;
      } else {
        previousElo[pid] = 1200;
      }
    });

    const previousEloLeaderboard = Object.entries(previousElo)
      .map(([id, elo]) => ({ id, elo }))
      .sort((a, b) => b.elo - a.elo);
    
    const currentEloLeaderboard = Object.entries(globalElo)
      .map(([id, elo]) => ({ id, elo }))
      .sort((a, b) => b.elo - a.elo);

    const prevRankMap: Record<string, number> = {};
    previousEloLeaderboard.forEach((item, idx) => { prevRankMap[item.id] = idx + 1; });

    const currRankMap: Record<string, number> = {};
    currentEloLeaderboard.forEach((item, idx) => { currRankMap[item.id] = idx + 1; });

    const computedLeaderboard = getLeaderboard(coreStats, globalElo, { sortBy: "wins" }).map(s => {
      const currentRank = currRankMap[s.id] || 99;
      const previousRank = prevRankMap[s.id] || 99;
      
      return {
        ...s,
        previousRank,
        rankChange: previousRank - currentRank
      };
    });

    // Monthly Trends
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

    // Balances
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

    const computedPlayers = Object.values(playerBalances).map((stats: any) => ({
      ...stats,
      balance: stats.totalPayments - stats.totalShares,
      elo: globalElo[stats.id] || 1200,
      placementMatchesPlayed: coreStats[stats.id]?.placementMatchesPlayed || 0
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
      trendData: computedTrendData
    };
  }, [matches, playersData, paymentsData, purchasesData, sessionsData, sessionUsageData]);

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
        />
      </div>
    </>
  );
}
