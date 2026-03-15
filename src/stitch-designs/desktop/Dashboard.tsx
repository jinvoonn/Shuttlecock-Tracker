"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet, 
  Search, 
  Activity,
  TrendingUp,
  TrendingDown,
  Feather
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/AuthContext';

interface PlayerStat {
  id: string;
  name: string;
  totalShares: number;
  totalPayments: number;
  balance: number;
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
}

export default function DesktopDashboard({ stats, players, upcomingSession }: DashboardProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const { canEdit } = useRole();

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
          {/* Metric Grid - Exactly 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Owed */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/5">
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
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-sky-500/50 transition-all shadow-lg shadow-sky-500/5">
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
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5">
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
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl group hover:border-rose-500/50 transition-all shadow-lg shadow-rose-500/5">
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
                                {player.name}
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
