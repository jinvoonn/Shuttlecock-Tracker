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
  History as HistoryIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

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
          {/* Dashboard Stats - Stacked Vertically */}
          <div className="flex flex-col gap-4">
            {/* Total Owed - RED */}
            <div className="flex flex-col gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-6 border border-rose-100 dark:border-rose-900/30 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-24 bg-rose-500/5 rounded-full -translate-y-8 translate-x-8 blur-3xl"></div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Wallet className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Total Owed</p>
              </div>
              <p className="font-mono text-4xl font-black text-rose-600 dark:text-rose-500 tracking-tighter italic">RM {stats.totalOwed.toFixed(2)}</p>
            </div>

            {/* Shuttle Used */}
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-[#13ec80]/30 group">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-[#13ec80] transition-colors">
                <HistoryIcon className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Shuttle Used</p>
              </div>
              <p className="font-mono text-4xl font-black text-[#13ec80] tracking-tighter italic">{stats.totalShuttlesUsed}</p>
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-[#13ec80]/30 group">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-[#13ec80] transition-colors">
                <CalendarDays className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Sessions</p>
              </div>
              <p className="font-mono text-4xl font-black text-[#13ec80] tracking-tighter italic">{stats.totalSessions}</p>
            </div>

            {/* Inventory */}
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-[#0f172a] p-6 border border-slate-200 dark:border-slate-800 shadow-sm group">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Package className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-tight">Inventory</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-4xl font-black text-[#13ec80] tracking-tighter italic">{stats.inventory.totalShuttles}</p>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">// {stats.inventory.remainingTubes} Tubes Left</p>
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
            <div className="flex flex-col gap-3">
              {players.map((player) => (
                <div key={player.id} className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-[#13ec80]/30 transition-all flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Link href={`/players/${player.id}`} className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 hover:text-[#13ec80] transition-colors italic">
                      {player.name}
                    </Link>
                    <p className={`font-mono text-lg font-black tracking-tighter ${player.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {player.balance >= 0 ? 'RM' : 'RM'}{Math.abs(player.balance).toFixed(2)}
                      <span className="text-[10px] uppercase font-bold tracking-widest ml-2 italic">
                        {player.balance >= 0 ? 'CREDIT' : 'OWED'}
                      </span>
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push(`/view/record-transaction-stitch?playerId=${player.id}`)}
                    className="h-11 px-6 rounded-xl bg-slate-900 dark:bg-slate-800 text-[#13ec80] font-black text-[10px] uppercase tracking-widest hover:bg-[#13ec80] hover:text-slate-950 transition-all active:scale-95 border border-slate-800 dark:border-slate-700 shadow-lg"
                  >
                    SETTLE
                  </button>
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

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-white/95 dark:bg-[#020617]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-4 px-2 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
          <button className="flex flex-1 flex-col items-center justify-center gap-1 text-[#13ec80] transition-colors group relative">
            <LayoutGrid className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mt-1">Dash</span>
            <div className="absolute bottom-[-16px] size-1.5 rounded-full bg-[#13ec80] shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
          </button>
          <button 
            onClick={() => router.push(`${basePath}/sessions`)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors group"
          >
            <HistoryIcon className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mt-1">Sessions</span>
          </button>
          <button 
            onClick={() => router.push(`${basePath}/purchases`)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors group"
          >
            <Package className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mt-1">Stock</span>
          </button>
          <button 
            onClick={() => router.push(`${basePath}/payments`)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors group"
          >
            <Banknote className="size-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mt-1">Payments</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
