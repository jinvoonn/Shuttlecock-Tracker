"use client";

import React from 'react';
import { 
  Activity, 
  Bell, 
  Settings, 
  CalendarDays, 
  Wallet, 
  FileText,
  Banknote,
  Package,
  Calendar,
  LayoutGrid,
  History as HistoryIcon,
  Feather,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useRole } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { AnalyticsClient } from '@/components/AnalyticsClient';
import clsx from 'clsx';
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
    inventory: {
      totalTubes: number;
      remainingTubes: number;
      totalShuttles: number;
    };
  };
  players: PlayerStat[];
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
  isLiveUpdate?: boolean;
  lastUpdatedPlayerIds?: string[];
}

export default function MobileDashboard({ stats, players, upcomingSession, insights, trendData, leaderboard, isLiveUpdate, lastUpdatedPlayerIds }: DashboardProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const { canEdit } = useRole();
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spending' | 'usage'>('spending');
  const [leaderboardMode, setLeaderboardMode] = useState<"wins" | "winRate" | "elo">("elo");

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

  // Track previous rank mapping for animations within the same view
  const [prevViewRankMap, setPrevViewRankMap] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const currentMap = Object.fromEntries(sortedLeaderboard.map((p, i) => [p.id, i + 1]));
    setPrevViewRankMap(currentMap);
  }, [leaderboardMode]); // Only update map when mode changes, or...
  
  // Actually we need to capture the map JUST BEFORE the leaderboard updates
  const prevRanksRef = React.useRef<Record<string, number>>({});
  useEffect(() => {
    return () => {
      prevRanksRef.current = Object.fromEntries(sortedLeaderboard.map((p, i) => [p.id, i + 1]));
    };
  }, [sortedLeaderboard]);

  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 min-h-screen antialiased overflow-x-hidden">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl pb-24">
        {/* Header Section */}
        <header className="sticky top-0 z-10 flex flex-col items-center justify-center px-6 py-5 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Feather className="size-5 text-white transform rotate-45" />
            </div>
            <h1 className="text-2xl font-black text-slate-50 tracking-tighter">
              Cock<span className="text-sky-400">Count</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
             Because Shuttlecocks Aren't Free
          </p>
        </header>

        <main className="flex flex-col gap-6 p-6 flex-1 text-left">
          {/* Dashboard Stats Row - Horizontal Scrollable */}
          {insights && insights.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
              <div className="flex gap-4 w-max">
                {insights.map((insight, i) => (
                  <div key={i} className="bg-slate-800 rounded-2xl p-4 min-w-[180px] shadow-md border border-slate-700/50 group active:border-emerald-400/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{insight.icon}</span>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{insight.title}</div>
                    </div>
                    <div className="text-lg font-black text-emerald-400 leading-tight mb-0.5 truncate max-w-[140px]">
                      {insight.value}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {insight.subValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Stats - Stacked Vertically */}
          <div className="flex flex-col gap-4 animate-fade-in-up md:delay-75">
            {/* Total Owed - RED */}
            <div className="flex flex-col gap-2 rounded-2xl bg-rose-500/10 p-6 border border-rose-500/20 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="absolute top-0 right-0 size-24 bg-rose-500/5 rounded-full -translate-y-8 translate-x-8 blur-3xl group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="flex items-center gap-2 text-rose-400">
                <Wallet className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Total Owed</p>
              </div>
              <p className="font-mono text-4xl font-black text-rose-500 tracking-tighter italic">RM {stats.totalOwed.toFixed(2)}</p>
            </div>

            {/* Shuttle Used */}
            <div className="flex flex-col gap-2 rounded-2xl bg-slate-800 p-6 border border-slate-700 shadow-sm hover:border-emerald-400/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default">
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-400 transition-colors">
                <HistoryIcon className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Shuttle Used</p>
              </div>
              <p className="font-mono text-4xl font-black text-emerald-400 tracking-tighter italic">{stats.totalShuttlesUsed}</p>
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-2 rounded-2xl bg-slate-800 p-6 border border-slate-700 shadow-sm hover:border-emerald-400/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group cursor-default">
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-400 transition-colors">
                <CalendarDays className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Sessions</p>
              </div>
              <p className="font-mono text-4xl font-black text-emerald-400 tracking-tighter italic">{stats.totalSessions}</p>
            </div>

            {/* Inventory */}
            <div className="flex flex-col gap-2 rounded-2xl bg-slate-800 p-6 border border-slate-700 shadow-sm group hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="flex items-center gap-2 text-slate-400">
                <Package className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Inventory</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-4xl font-black text-emerald-400 tracking-tighter italic">{stats.inventory.totalShuttles}</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">{"// "}{stats.inventory.remainingTubes} Tubes Left</p>
              </div>
            </div>

            {/* Leaderboard Card */}
            {leaderboard && leaderboard.length > 0 && (
              <div className="flex flex-col gap-4 rounded-3xl bg-slate-800 p-6 border border-slate-700 shadow-xl mt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black italic uppercase tracking-tight flex items-center gap-2 text-white">
                    🏆 Leaderboard
                  </h3>
                  <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
                    <button
                      onClick={() => setLeaderboardMode("wins")}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-200 active:scale-95",
                        leaderboardMode === "wins"
                          ? "bg-emerald-400 text-white shadow-sm"
                          : "text-slate-500"
                      )}
                    >
                      Wins
                    </button>
                    <button
                      onClick={() => setLeaderboardMode("winRate")}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-200 active:scale-95",
                        leaderboardMode === "winRate"
                          ? "bg-emerald-400 text-white shadow-sm"
                          : "text-slate-500"
                      )}
                    >
                      Rate
                    </button>
                    <button
                      onClick={() => setLeaderboardMode("elo")}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-200 active:scale-95",
                        leaderboardMode === "elo"
                          ? "bg-emerald-400 text-white shadow-sm"
                          : "text-slate-500"
                      )}
                    >
                      CR
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                  {(() => {
                    console.log(`Leaderboard type: ${leaderboardMode}`);
                    console.log("Top 3 players:", sortedLeaderboard.slice(0, 3).map(p => p.name));
                    return null;
                  })()}
                  {sortedLeaderboard.map((player, index) => {
                    const displayRank = index + 1;
                    const isTop3 = displayRank <= 3;
                    
                    // Rank change is still relative to overall Elo rank for competitive feedback
                    const entry = leaderboard?.find(p => p.id === player.id);
                    const rankChange = entry?.rankChange ?? 0;

                    const prevRankInView = prevRanksRef.current[player.id];
                    const hasRankChanged = prevRankInView !== undefined && prevRankInView !== displayRank;
                    const isPromoted = hasRankChanged && displayRank < prevRankInView;
                    const isDemoted = hasRankChanged && displayRank > prevRankInView;
                    const isDirectlyAffected = lastUpdatedPlayerIds?.includes(player.id);

                    return (
                    <div 
                      key={player.id} 
                      className={clsx(
                        "flex items-center justify-between p-3 rounded-2xl transition-all duration-300",
                        isTop3 && displayRank === 1 && "rank-1-glow animate-glowPulse text-slate-950",
                        isTop3 && displayRank === 2 && "rank-2-glow animate-glowPulse text-slate-950",
                        isTop3 && displayRank === 3 && "rank-3-glow animate-glowPulse text-slate-950",
                        !isTop3 && "bg-slate-900/40 border border-slate-800/50",
                        // Animations
                        isPromoted && "animate-moveUp animate-promotionFlash",
                        isDemoted && "animate-moveDown animate-demotionFlash",
                        !hasRankChanged && isDirectlyAffected && "animate-promotionFlash"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          "text-xs font-black italic w-6",
                          isTop3 ? "text-slate-900" : "text-slate-500"
                        )}>
                          #{displayRank}
                        </span>
                        
                        <div className="flex flex-col">
                          <PlayerName 
                            name={player.name} 
                            elo={player.elo} 
                            placementMatchesPlayed={player.placementMatchesPlayed}
                            showRankName={false} 
                            nameClassName={clsx("text-sm font-black italic", isTop3 ? "text-slate-950" : "text-slate-100")}
                          />
                          {entry?.previousRank && entry.previousRank !== 99 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {rankChange > 0 ? (
                                <>
                                  <TrendingUp className={clsx("size-3", isTop3 ? "text-slate-900" : "text-emerald-400")} />
                                  <span className={clsx("text-[9px] font-bold uppercase", isTop3 ? "text-slate-800" : "text-emerald-500/80")}>+{rankChange} UP</span>
                                </>
                              ) : rankChange < 0 ? (
                                <>
                                  <TrendingDown className={clsx("size-3", isTop3 ? "text-slate-800" : "text-rose-500")} />
                                  <span className={clsx("text-[9px] font-bold uppercase", isTop3 ? "text-slate-800" : "text-rose-500/80")}>{rankChange} DOWN</span>
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          "font-mono text-xs font-black italic px-2 py-1 rounded",
                          isTop3 ? "bg-black/10 text-slate-900" : "text-emerald-400 bg-emerald-400/5"
                        )}>
                          {leaderboardMode === "wins" ? player.wins : leaderboardMode === "winRate" ? `${(player.winRate * 100).toFixed(1)}%` : player.elo}
                        </span>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>

          {/* Next Session Card */}
          {upcomingSession && (
            <div className="relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent z-10 opacity-90"></div>
              <div className="relative z-20 flex flex-col gap-4 p-6">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Upcoming Session</p>
                  <h3 className="text-4xl font-extrabold italic uppercase tracking-tighter mt-1 text-white leading-none">{upcomingSession.location.toUpperCase()}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mt-3">
                    <Calendar className="size-4" />
                    <span className="font-medium">{new Date(upcomingSession.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="flex w-fit items-center justify-center rounded bg-emerald-400 px-6 py-2.5 text-slate-950 font-black uppercase text-[10px] tracking-[0.1em] hover:brightness-110 transition-all shadow-lg shadow-emerald-400/20 active:scale-95">
                  VIEW DETAILS
                </button>
              </div>
              <div 
                className="absolute top-0 right-0 w-full h-full bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" 
                style={{ backgroundImage: "url('/badminton-hero-v2.png')" }}
              ></div>
            </div>
          )}
  
          {/* Trends Section */}
          {trendData && trendData.length > 0 && (
            <div 
              className="flex flex-col gap-4 rounded-3xl bg-slate-800/50 p-6 border border-slate-700 shadow-xl"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-tight italic">Monthly Trends</h3>
                </div>
                <div className="flex bg-slate-900 rounded-full p-1 border border-slate-700/50">
                  <button 
                    onClick={() => setActiveTab('spending')}
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'spending' ? 'bg-emerald-400 text-slate-950' : 'text-slate-500'}`}
                  >
                    $$
                  </button>
                  <button 
                    onClick={() => setActiveTab('usage')}
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === 'usage' ? 'bg-sky-400 text-slate-950' : 'text-slate-500'}`}
                  >
                    USE
                  </button>
                </div>
              </div>
              <AnalyticsClient data={trendData} type={activeTab} />
            </div>
          )}

          {/* Player Ledger Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold italic uppercase tracking-tight">PLAYER LEDGER</h2>
            </div>
            <div className="flex flex-col gap-3">
              {players.map((player) => (
                <div key={player.id} className="bg-slate-800 rounded-[2rem] p-6 border border-slate-700 shadow-sm group hover:border-emerald-400/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Link href={`${basePath}/players/${player.id}`} className="flex flex-col gap-1 flex-1">
                      <PlayerName 
                        name={player.name} 
                        elo={player.elo || 1200} 
                        placementMatchesPlayed={player.placementMatchesPlayed}
                        showRankName={false} 
                        nameClassName="text-sm font-black uppercase tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors italic leading-none"
                      />
                      <p className={`font-mono text-lg font-black tracking-tighter ${player.balance >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {player.balance >= 0 ? 'RM' : '-RM'}{Math.abs(player.balance).toFixed(2)}
                        <span className="text-[10px] uppercase font-bold tracking-widest ml-2 italic">
                          {player.balance >= 0 ? 'CREDIT' : 'OWED'}
                        </span>
                      </p>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`${basePath}/players/${player.id}`}
                      className="flex-1 h-11 rounded-xl bg-slate-900 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center border border-slate-700 active:scale-95 transition-all"
                    >
                      VIEW MORE
                    </Link>
                    {canEdit('payments') && (
                      <button 
                        onClick={async () => {
                          if (player.balance === 0) return;
                          setSettlingId(player.id);
                          try {
                            const { quickSettle } = await import("@/lib/actions/payments");
                            await quickSettle(player.id, -player.balance, currentMode);
                            router.refresh();
                          } catch (err) {
                            alert("Failed to settle balance");
                          } finally {
                            setSettlingId(null);
                          }
                        }}
                        disabled={player.balance === 0 || settlingId === player.id}
                        className={`flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border shadow-lg ${
                          player.balance === 0 
                            ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50' 
                            : 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-slate-950 border-emerald-400/20'
                        }`}
                      >
                        {settlingId === player.id ? 'SETTLING...' : 'SETTLE'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-emerald-400 transition-colors group relative">
              <LayoutGrid className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mt-1">Dash</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/sessions`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <HistoryIcon className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mt-1">Sessions</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/purchases`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <Package className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mt-1">Stock</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/payments`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <Banknote className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none mt-1">Payments</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
