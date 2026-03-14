"use client";

import React from 'react';
import { 
  Activity, 
  Bell, 
  Settings, 
  History, 
  CalendarDays, 
  Wallet, 
  Package, 
  Calendar, 
  LayoutGrid, 
  FileText, 
  Banknote 
} from 'lucide-react';

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
      remainingTubes: number;
      totalShuttles: number;
    };
  };
  players: PlayerStat[];
  upcomingSession?: {
    location: string;
    date: string;
  };
}

export default function MobileDashboard({ stats, players, upcomingSession }: DashboardProps) {
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen antialiased overflow-x-hidden">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl pb-24">
        {/* Header content... same as before */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="text-[#13ec80] size-6" />
            <h1 className="text-xl font-extrabold italic tracking-tighter uppercase">COCKCOUNT</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 size-10 hover:border-[#13ec80] transition-colors shadow-sm">
              <Bell className="size-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button className="flex items-center justify-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 size-10 hover:border-[#13ec80] transition-colors shadow-sm">
              <Settings className="size-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-6 p-6 flex-1 text-left">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-[#13ec80]/30 group">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-[#13ec80] transition-colors">
                <History className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Shuttle Used</p>
              </div>
              <p className="font-mono text-3xl font-bold text-[#13ec80] transition-all group-hover:scale-105 origin-left">{stats.totalShuttlesUsed}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-[#13ec80]/30 group">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-[#13ec80] transition-colors">
                <CalendarDays className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Sessions</p>
              </div>
              <p className="font-mono text-3xl font-bold text-[#13ec80] transition-all group-hover:scale-105 origin-left">{stats.totalSessions}</p>
            </div>
          </div>

          {/* Dashboard Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Wallet className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Pool Balance</p>
              </div>
              <p className={`font-mono text-3xl font-bold ${stats.totalPoolBalance >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                ${stats.totalPoolBalance.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Package className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Inventory</p>
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-bold leading-none text-slate-900 dark:text-slate-100 italic">{stats.inventory.totalTubes} Tubes <span className="text-slate-400 dark:text-slate-500 font-normal mx-1 tracking-tighter not-italic">//</span> {stats.inventory.totalShuttles}</p>
                <p className="text-[10px] font-black text-rose-500 dark:text-rose-400 mt-1 uppercase tracking-wider">{stats.inventory.remainingTubes} TUBES REMAINING</p>
              </div>
            </div>
          </div>

          {/* Next Session Card */}
          {upcomingSession && (
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent z-10 dark:from-slate-950 dark:via-slate-950/40 opacity-90 dark:opacity-100"></div>
              <div className="relative z-20 flex flex-col gap-4 p-6">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-[#13ec80] uppercase tracking-[0.2em]">Upcoming Session</p>
                  <h3 className="text-4xl font-extrabold italic uppercase tracking-tighter mt-1 text-white leading-none">{upcomingSession.location.toUpperCase()}</h3>
                  <div className="flex items-center gap-2 text-slate-300 text-sm mt-3">
                    <Calendar className="size-4" />
                    <span className="font-medium">{new Date(upcomingSession.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="flex w-fit items-center justify-center rounded bg-[#13ec80] px-6 py-2.5 text-[#020617] font-black uppercase text-[10px] tracking-[0.1em] hover:brightness-110 transition-all shadow-lg shadow-[#13ec80]/20 active:scale-95">
                  VIEW DETAILS
                </button>
              </div>
              <div 
                className="absolute top-0 right-0 w-full h-full bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfmXBh3dgZ09S5o1pZuRMOo_tJn0NZ4fS6LuevxPecezeCbu3C10NhrGfv7SC5_I3EbkSp4bsVSdjSMMj_JRsPeEUNoE0uMzEeYeh8G4zpkhB3ts8_1br9MdemqVnaTubWy8IBuEvyxgTjZZ7c_jHUwueXewTzXtSIbCC-r18WsSoajtGMyON1wY13bmuYp5Oby8zMiRVXCQ96tuPuIJYyh4k67OOeGpOMb-_sBSdUYQjvRIPSI_n0oyXtVGE_gZ3qj-t77iEz65W9')" }}
              ></div>
            </div>
          )}

          {/* Player Ledger Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold italic uppercase tracking-tight">PLAYER LEDGER</h2>
              <button className="text-[10px] font-black text-[#13ec80] uppercase border-b-2 border-[#13ec80] pb-0.5 tracking-wider">EXPAND ALL</button>
            </div>
            <div className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between bg-white dark:bg-[#0f172a] p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 ${player.balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`}></div>
                    <div className="text-left">
                      <p className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">{player.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tighter">ID: CK-{player.id.slice(0, 4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-black ${player.balance >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {player.balance >= 0 ? '+' : '-'}${Math.abs(player.balance).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">
                      {player.balance >= 0 ? 'Balanced' : 'Owed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Context Hint */}
          <div className="p-5 rounded-2xl border-l-4 border-[#13ec80] bg-[#13ec80]/5 dark:bg-[#13ec80]/10 shadow-sm text-left">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-black text-[#13ec80] uppercase tracking-wider mr-1">Elite Status:</span> 
              Active tracking enabled for all premium courts. Equipment maintenance scheduled for next Monday.
            </p>
          </div>
        </main>

        {/* Bottom Navigation content... same as before */}
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-white/95 dark:bg-[#020617]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-4 px-2 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
          <button className="flex flex-col items-center gap-1 text-[#13ec80] transition-colors group">
            <LayoutGrid className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors group">
            <FileText className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">Sessions</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors group">
            <Package className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">Stock</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors group">
            <Banknote className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">Payments</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
