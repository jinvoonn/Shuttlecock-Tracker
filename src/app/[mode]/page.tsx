import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import DesktopDashboard from "@/stitch-designs/desktop/Dashboard";
import MobileDashboard from "@/stitch-designs/mobile/Dashboard";
import { AlertCircle } from "lucide-react";
import { ADMIN_SECRET } from "@/lib/constants";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { getPlayerStats } from "@/lib/analytics/core";
import { getLeaderboard, getGlobalInsights } from "@/lib/analytics/leaderboard";

export const revalidate = 0;

export default async function DashboardPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  const isAdmin = mode === ADMIN_SECRET;

  if (!isSupabaseConfigured) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-amber-500 bg-[#020617] text-center max-w-md mx-auto">
        <AlertCircle className="size-12 mb-4" />
        <p className="font-black italic uppercase text-2xl tracking-tighter">Configuration Required</p>
        <p className="text-sm text-slate-400 mt-2 font-bold tracking-tight">
          Vercel Environment Variables are missing. Please add <code className="text-[#13ec80]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[#13ec80]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Project Settings.
        </p>
      </div>
    );
  }

  const [
    { data: playersData, error: playersError },
    { data: paymentsData, error: paymentsError },
    { data: purchasesData, error: purchasesError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError },
    { data: matchesData, error: matchesError }
  ] = await Promise.all([
    supabase.from("players").select("id, name"),
    supabase.from("payments").select("amount, player_id"),
    supabase.from("purchases").select("price_per_tube, initial_quantity, remaining_quantity, brands(name)"),
    supabase.from("sessions").select(`id, date, session_players ( player_id )`),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)"),
    supabase.from("matches").select("*").order("created_at", { ascending: true })
  ]);

  if (playersError || paymentsError || purchasesError || sessionsError || sessionUsageError || matchesError) {
    console.error("Dashboard Fetch Error:", { playersError, paymentsError, purchasesError, sessionsError, sessionUsageError, matchesError });
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-rose-500 bg-[#020617]">
        <p className="font-black italic uppercase text-2xl tracking-tighter">Failed to fetch data</p>
        <p className="text-sm text-slate-500 mt-2 font-bold tracking-widest uppercase">Database Connection Error</p>
        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-500 max-w-lg overflow-auto">
           {JSON.stringify({ paymentsError, purchasesError, sessionsError, sessionUsageError, matchesError }, null, 2)}
        </div>
      </div>
    );
  }

  const matches = matchesData || [];
  const playerMap = Object.fromEntries((playersData || []).map(p => [p.id, p.name]));

  const normalizedMatches = normalizeMatches(matchesData || [], playerMap);
  const coreStats = getPlayerStats(normalizedMatches, playerMap);

  // Still need to calculate session participation as it's not in match data
  (sessionsData || []).forEach(s => {
    (s.session_players || []).forEach((sp: { player_id: string }) => {
      if (coreStats[sp.player_id]) {
        // We can extend the coreStats or just keep a local count
        // For local simplicity in UI mapping, let's just use the engine results
      }
    });
  });

  // Insights using the engine
  const { mostWinsPlayer, bestWinRatePlayer, longestStreakPlayer } = getGlobalInsights(coreStats);

  const insights = [
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

  // Leaderboard using the engine
  const leaderboard = getLeaderboard(coreStats, { sortBy: "wins" }).map(s => ({
    id: s.id,
    name: s.name,
    wins: s.wins,
    total: s.totalGames,
    winRate: s.winRate
  }));

  console.log("Analytics Stats:", coreStats);
  console.log("Leaderboard:", leaderboard);

  // --- Monthly Trends Calculation ---
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

  const trendData = Object.entries(monthlyTrends)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(([, val]) => val)
    .slice(-6); // Last 6 months

  const totalShuttlesUsed = (sessionUsageData || []).reduce((acc, curr) => acc + Number(curr.quantity_used || 0), 0);
  const totalSessions = (sessionsData || []).length;

  const playerBalances: Record<string, { name: string; id: string; totalShares: number; totalPayments: number; balance: number }> = {};

  (playersData || []).forEach(p => {
    playerBalances[p.id] = { id: p.id, name: p.name, totalShares: 0, totalPayments: 0, balance: 0 };
  });

  (paymentsData || []).forEach(p => {
    const id = p.player_id;
    if (playerBalances[id]) {
      playerBalances[id].totalPayments += Number(p.amount || 0);
    }
  });

  const sessionCosts: Record<string, number> = {};
  (sessionUsageData || []).forEach(su => {
    const sId = su.session_id;
    // Handle Supabase join result being possibly an array or object
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

  const players = Object.values(playerBalances).map(stats => ({
    ...stats,
    balance: stats.totalPayments - stats.totalShares,
  })).sort((a, b) => a.balance - b.balance);

  const totalOwed = players.filter(p => p.balance < 0).reduce((acc, p) => acc + Math.abs(p.balance), 0);
  const totalShuttles = (purchasesData || []).reduce((acc, curr) => acc + Number(curr.remaining_quantity || 0), 0);

  const statsProps = {
    totalOwed,
    totalShuttlesUsed,
    totalSessions,
    inventory: totalShuttles
  };

  const mobileStatsProps = {
    ...statsProps,
    totalPoolBalance: players.reduce((acc, p) => acc + p.balance, 0),
    inventory: {
        totalTubes: (purchasesData || []).filter(p => (p.remaining_quantity || 0) > 0).length,
        totalShuttles: totalShuttles,
        remainingTubes: (purchasesData || []).filter(p => (p.remaining_quantity || 0) > 0).length
    }
  };

  return (
    <>
      <div className="block lg:hidden">
        <MobileDashboard stats={mobileStatsProps} players={players} insights={insights} trendData={trendData} leaderboard={leaderboard} />
      </div>
      <div className="hidden lg:block">
        <DesktopDashboard stats={statsProps} players={players} isAdmin={isAdmin} insights={insights} trendData={trendData} leaderboard={leaderboard} />
      </div>
    </>
  );
}
