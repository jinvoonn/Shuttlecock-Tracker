"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet, 
  Search, 
  Activity 
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PlayerStat {
  id: string;
  name: string;
  totalShares: number;
  totalPayments: number;
  balance: number;
}

interface DashboardProps {
  stats: {
    totalShuttlesUsed: number;
    totalSessions: number;
    totalPoolBalance: number;
    inventory: {
      totalTubes: number;
      totalShuttles: number;
    };
  };
  players: PlayerStat[];
  isAdmin?: boolean;
  upcomingSession?: {
    location: string;
    date: string;
  };
}

export default function DesktopDashboard({ stats, players, isAdmin, upcomingSession }: DashboardProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

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
          <div className="flex items-center gap-3 text-[#13ec80]">
            <div className="size-8 bg-[#13ec80]/10 rounded-lg flex items-center justify-center border border-[#13ec80]/20">
              <Activity className="size-5 font-bold" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter text-slate-100 uppercase">COCKCOUNT</h2>
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
        <header className="h-20 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-6 w-1/3">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-[#13ec80] transition-colors" />
              <input 
                className="w-full bg-slate-950 border-slate-800 rounded-xl pl-10 text-sm focus:ring-1 focus:ring-[#13ec80] focus:border-[#13ec80] transition-all text-slate-200 h-10 outline-none shadow-inner" 
                placeholder="Search..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-100 uppercase">Shuttle Tracker</p>
                <p className="text-[10px] text-[#13ec80] font-black uppercase tracking-tighter">{currentMode}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all shadow-xl">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Shuttles Used</p>
              <p className="text-4xl font-mono font-black text-slate-100 tracking-tighter">{stats.totalShuttlesUsed}</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all shadow-xl">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sessions</p>
              <p className="text-4xl font-mono font-black text-slate-100 tracking-tighter">{stats.totalSessions}</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all shadow-xl">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pool Balance</p>
              <p className={clsx("text-4xl font-mono font-black tracking-tighter", stats.totalPoolBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {stats.totalPoolBalance >= 0 ? "+" : "-"}RM {Math.abs(stats.totalPoolBalance).toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all shadow-xl">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Inventory</p>
              <p className="text-xl font-mono font-black text-slate-100 leading-tight tracking-tighter">
                {stats.inventory.totalTubes} Tubes Left<br/>
                <span className="text-sm text-slate-500 font-medium tracking-normal">// {stats.inventory.totalShuttles} Shuttles</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Featured Session & Player Ledger */}
            <div className="space-y-8">
              {/* Featured Card */}
              {upcomingSession && (
                <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 group h-64 shadow-2xl">
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
                      <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800">
                        <th className="px-8 py-4">Player</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {players.map((player) => {
                        const isSurplus = player.balance >= 0;
                        const isSevereDebt = player.balance < -50;
                        const initial = player.name.charAt(0).toUpperCase();

                        return (
                          <tr key={player.id} className="hover:bg-slate-950/50 transition-colors group/row">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-sm text-slate-400 border border-slate-700 group-hover/row:border-slate-500 transition-all">
                                  {initial}
                                </div>
                                <Link 
                                  href={`${basePath}/players/${player.id}`}
                                  className="font-black text-slate-100 text-sm hover:text-[#13ec80] transition-colors"
                                >
                                  {player.name}
                                </Link>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={clsx(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                isSurplus 
                                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                                  : isSevereDebt
                                    ? "bg-rose-400/10 text-rose-400 border-rose-400/20"
                                    : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                              )}>
                                {isSurplus ? 'Paid' : isSevereDebt ? 'Overdue' : 'Pending'}
                              </span>
                            </td>
                            <td className={clsx(
                              "px-8 py-6 font-mono font-black text-sm tracking-tighter",
                              isSurplus ? "text-emerald-400" : "text-rose-400",
                            )}>
                              {isSurplus ? '+' : '-'}RM {Math.abs(player.balance).toFixed(2)}
                            </td>
                            {isAdmin && (
                              <td className="px-8 py-6 text-right">
                                {!isSurplus && (
                                  <button 
                                    onClick={async () => {
                                      if (confirm(`Settle up RM ${Math.abs(player.balance).toFixed(2)} for ${player.name}?`)) {
                                        const { quickSettle } = await import("@/lib/actions/payments");
                                        await quickSettle(player.id, Math.abs(player.balance));
                                      }
                                    }}
                                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all"
                                  >
                                    Settle
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {players.length === 0 && (
                        <tr>
                           <td colSpan={3} className="px-8 py-10 text-center text-slate-500 font-bold text-sm">
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
