"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Feather
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/AuthContext';
import { AnalyticsClient } from '@/components/AnalyticsClient';
import { getCockRank } from '@/lib/analytics/rank';
import RankBadge from '@/components/ui/RankBadge';
import PlayerName from '@/components/ui/PlayerName';

interface PlayerStat {
  id: string;
  name: string;
  totalShares: number;
  totalPayments: number;
  balance: number;
  elo?: number;
  placementMatchesPlayed?: number;
}

interface DashboardProps {
  stats: {
    totalOwed: number;
    totalShuttlesUsed: number;
    totalSessions: number;
    inventory: number;
  };
  players: PlayerStat[];
  isAdmin?: boolean;
  upcomingSession?: {
    location: string;
    date: string;
  };
  insights?: {
    title: string;
    icon: string;
    value: string;
    subValue: string;
  }[];
  trendData?: {
    month: string;
    spending: number;
    usage: number;
  }[];
  leaderboard?: {
    id: string;
    name: string;
    wins: number;
    totalGames: number;
    winRate: number;
    elo: number;
    placementMatchesPlayed?: number;
    previousRank?: number;
    rankChange?: number;
  }[];
}

export default function DesktopDashboard({ stats, players, upcomingSession, insights, trendData, leaderboard }: DashboardProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const { canEdit } = useRole();
  const [leaderboardMode, setLeaderboardMode] = React.useState<"wins" | "winRate" | "elo">("elo");

  const sortedLeaderboard = React.useMemo(() => {
    if (!leaderboard) return [];
    if (leaderboardMode === "elo") {
      return [...leaderboard].sort((a, b) => b.elo - a.elo);
    }
    if (leaderboardMode === "winRate") {
      return [...leaderboard]
        .filter(p => p.totalGames >= 3)
        .sort((a, b) => b.winRate - a.winRate);
    }
    return [...leaderboard].sort((a, b) => b.wins - a.wins);
  }, [leaderboard, leaderboardMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 font-['Lexend',_sans-serif]">
      {/* Cinematic Background Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/badminton-bg.png')" 
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#020617]/90 to-[#020617]/95 pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="relative z-20 w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Feather className="size-5 text-white transform rotate-45" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tighter">
                Cock<span className="text-sky-400">Count</span>
              </h2>
            </div>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest pl-1 leading-tight">
              Because Shuttlecocks Aren't Free
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href={`${basePath}`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <LayoutDashboard className="size-5" />
            <span className="text-sm tracking-wide uppercase">DASHBOARD</span>
          </Link>
          <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <CalendarDays className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">SESSIONS</span>
          </Link>
          <Link href={`${basePath}/purchases`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Package className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">STOCK</span>
          </Link>
          <Link href={`${basePath}/payments`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Wallet className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">PAYMENTS</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50" />

        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Insights Row */}
          {insights && insights.length > 0 && (
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-4 w-max">
                {insights.map((insight, i) => (
                  <div 
                    key={i} 
                    className="bg-slate-800/50 w-full backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 min-w-[200px] shadow-lg group hover:border-emerald-400/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{insight.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors uppercase italic">{insight.title}</span>
                    </div>
                    <div className="text-lg font-black text-emerald-400 leading-tight mb-1 truncate max-w-[160px]">
                      {insight.value}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {insight.subValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metric Grid - Exactly 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {/* Total Owed */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-red-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <TrendingUp className="size-6 text-emerald-400" />
                </div>
              </div>
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">Total Owed</p>
              <h3 className="text-3xl font-black italic text-red-500 tracking-tighter shrink-0 leading-none">
                RM{stats.totalOwed.toFixed(2)}
              </h3>
            </div>

            {/* Shuttles Used */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-sky-500/10 rounded-xl">
                  <Activity className="size-6 text-sky-400" />
                </div>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">Shuttles Used</p>
              <h3 className="text-3xl font-black italic text-slate-100 tracking-tighter shrink-0 leading-none">
                {stats.totalShuttlesUsed}
              </h3>
            </div>

            {/* Total Sessions */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <CalendarDays className="size-6 text-amber-400" />
                </div>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">Total Sessions</p>
              <h3 className="text-3xl font-black italic text-slate-100 tracking-tighter shrink-0 leading-none">
                {stats.totalSessions}
              </h3>
            </div>

            {/* Inventory */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-sky-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-500/10 rounded-xl">
                  <Package className="size-6 text-rose-400" />
                </div>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">Inventory</p>
              <h3 className="text-3xl font-black italic text-slate-100 tracking-tighter shrink-0 leading-none">
                {stats.inventory} <span className="text-xs italic lowercase">Shuttlecocks</span>
              </h3>
            </div>
          </div>

          {/* Leaderboard Section */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-100">
                  <Activity className="size-6 text-[#13ec80]" />
                  🏆 Leaderboard
                </h3>
                <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-inner">
                  <button
                    onClick={() => setLeaderboardMode("wins")}
                    className={clsx(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                      leaderboardMode === "wins"
                        ? "bg-emerald-400 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Wins
                  </button>
                  <button
                    onClick={() => setLeaderboardMode("winRate")}
                    className={clsx(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                      leaderboardMode === "winRate"
                        ? "bg-emerald-400 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Win Rate
                  </button>
                  <button
                    onClick={() => setLeaderboardMode("elo")}
                    className={clsx(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                      leaderboardMode === "elo"
                        ? "bg-emerald-400 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    CR
                  </button>
                </div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4 py-2">
                {(() => {
                  console.log(`Leaderboard type: ${leaderboardMode}`);
                  console.log("Top 3 players:", sortedLeaderboard.slice(0, 3).map(p => p.name));
                  return null;
                })()}
                {sortedLeaderboard.map((player, index) => {
                  const displayRank = index + 1;
                  const isTop3 = displayRank <= 3;
                  
                  const entry = leaderboard?.find(p => p.id === player.id);
                  const rankChange = entry?.rankChange ?? 0;

                  return (
                  <div 
                    key={player.id} 
                    className={clsx(
                      "flex items-center justify-between p-5 rounded-2xl transition-all duration-300 animate-fade-in-up",
                      isTop3 && displayRank === 1 && "rank-1-glow animate-glowPulse text-slate-950",
                      isTop3 && displayRank === 2 && "rank-2-glow animate-glowPulse text-slate-950",
                      isTop3 && displayRank === 3 && "rank-3-glow animate-glowPulse text-slate-950",
                      !isTop3 && "bg-slate-950/40 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900/80"
                    )}
                    style={{ animationDelay: `${(index * 50) + 100}ms` }}
                  >
                    <div className="flex items-center gap-6">
                      <span className={clsx(
                        "text-2xl font-black italic w-12",
                        isTop3 ? "text-slate-900" : "text-slate-600"
                      )}>
                        #{displayRank}
                      </span>
                      <div className="flex flex-col">
                        <PlayerName 
                          name={player.name} 
                          elo={player.elo} 
                          placementMatchesPlayed={player.placementMatchesPlayed}
                          showRankName={false} 
                          nameClassName={clsx("text-xl font-black italic", isTop3 ? "text-slate-950" : "text-slate-100")}
                        />
                        {entry?.previousRank && entry.previousRank !== 99 && (
                          <div className="flex items-center gap-2 mt-1">
                            {rankChange > 0 ? (
                              <>
                                <TrendingUp className={clsx("size-4", isTop3 ? "text-slate-900" : "text-emerald-400")} />
                                <span className={clsx("text-[11px] font-black uppercase tracking-wider", isTop3 ? "text-slate-800" : "text-emerald-400")}>+{rankChange} POSITIONS UP</span>
                              </>
                            ) : rankChange < 0 ? (
                              <>
                                <TrendingDown className={clsx("size-4", isTop3 ? "text-slate-800" : "text-rose-500")} />
                                <span className={clsx("text-[11px] font-black uppercase tracking-wider", isTop3 ? "text-slate-800" : "text-rose-500")}>{rankChange} POSITIONS DOWN</span>
                              </>
                            ) : (
                               <>
                                <Minus className={clsx("size-4", isTop3 ? "text-slate-800" : "text-slate-500")} />
                                <span className={clsx("text-[11px] font-black uppercase tracking-wider", isTop3 ? "text-slate-800" : "text-slate-500")}>NO CHANGE</span>
                               </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={clsx(
                      "font-mono font-black italic px-5 py-2 rounded-xl text-xl",
                      isTop3 ? "bg-black/10 text-slate-900" : "text-[#13ec80] bg-emerald-500/5"
                    )}>
                      {leaderboardMode === "wins" 
                        ? `${player.wins} WINS` 
                        : leaderboardMode === "winRate"
                           ? `${(player.winRate * 100).toFixed(1)}%`
                           : `${player.elo} CR`
                      }
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Analytics Trends Row */}
          {trendData && trendData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl hover:border-emerald-500/20 hover:shadow-emerald-500/5 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp className="size-5 text-emerald-400" /> 
                    Spending Trends
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Last 6 Months</span>
                </div>
                <div className="h-64">
                   {/* Importing AnalyticsClient dynamically or assuming it's imported at top */}
                   <AnalyticsClient data={trendData} type="spending" />
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <Activity className="size-5 text-sky-400" /> 
                    Usage Trends
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Last 6 Months</span>
                </div>
                <div className="h-64">
                   <AnalyticsClient data={trendData} type="usage" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Featured Session & Player Ledger */}
            <div className="space-y-8 animate-fade-in-up opacity-0" style={{ animationDelay: "450ms" }}>
              {/* Featured Card */}
              {upcomingSession && (
                <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-emerald-500/30 group h-64 shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent z-10" />
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-[#13ec80]/5" />
                  <div className="relative z-20 p-10 flex flex-col h-full justify-center max-w-md">
                    <span className="text-[#13ec80] font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13ec80] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#13ec80]" />
                      </span>
                      Latest Session
                    </span>
                    <h3 className="text-4xl font-black italic text-white mb-2 uppercase tracking-tighter leading-none">{upcomingSession.location}</h3>
                    <p className="text-slate-400 text-sm mb-6 font-bold tracking-tight">
                      {new Date(upcomingSession.date).toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex gap-4">
                      <Link href={`${basePath}/sessions`} className="bg-[#13ec80] text-slate-950 font-black text-xs uppercase px-8 py-3 rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#13ec80]/20 flex items-center justify-center">
                        View Sessions
                      </Link>
                    </div>
                  </div>
                </section>
              )}

              {/* Player Ledger Section */}
              <section className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Player Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase font-black tracking-[0.2em] border-b border-slate-800 italic">
                        <th className="px-8 py-5">Player</th>
                        <th className="px-8 py-5 text-right">Money Owed</th>
                        <th className="px-8 py-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {players.map((player) => (
                        <tr key={player.id} className="hover:bg-slate-950/50 transition-colors group/row">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-sm text-[#13ec80] border border-slate-700">
                                {player.name.charAt(0).toUpperCase()}
                              </div>
                              <Link 
                                href={`${basePath}/players/${player.id}`}
                                className="font-black text-slate-100 text-sm hover:text-[#13ec80] transition-colors uppercase italic tracking-tight"
                              >
                                <PlayerName 
                                  name={player.name} 
                                  elo={player.elo || 1200} 
                                  placementMatchesPlayed={player.placementMatchesPlayed}
                                  showRankName={false} 
                                  nameClassName="text-sm font-black uppercase italic tracking-tight"
                                />
                              </Link>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <p className={clsx(
                              "font-mono font-black text-lg tracking-tighter leading-none italic",
                              player.balance >= 0 ? "text-emerald-400" : "text-rose-400",
                            )}>
                              {player.balance >= 0 ? '+' : '-'}RM {Math.abs(player.balance).toFixed(2)}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-3">
                              {canEdit('payments') && (
                                <button 
                                  onClick={async () => {
                                    if (confirm(`Quick Settle RM ${Math.abs(player.balance).toFixed(2)} for ${player.name}?`)) {
                                      const { quickSettle } = await import("@/lib/actions/payments");
                                      await quickSettle(player.id, Math.abs(player.balance), currentMode);
                                    }
                                  }}
                                  className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all active:scale-95"
                                >
                                  Quick Settle
                                </button>
                              )}
                              <Link 
                                href={`${basePath}/players/${player.id}`}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all active:scale-95"
                              >
                                View More
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {players.length === 0 && (
                        <tr>
                           <td colSpan={3} className="px-8 py-10 text-center text-slate-500 font-bold text-sm italic uppercase tracking-widest">
                             No player records found.
                           </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
