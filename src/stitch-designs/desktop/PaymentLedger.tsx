"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  User, 
  TrendingUp, 
  Clock, 
  Users, 
  Filter, 
  Download,
  LayoutDashboard,
  CalendarDays,
  Package,
  Wallet
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PlayerBalance {
  id: string;
  name: string;
  balance: number;
  lastActivity: string;
  status: 'Settled' | 'Overdue' | 'Neutral';
  avatar?: string;
}

interface DesktopPaymentLedgerProps {
  poolBalance: number;
  owedTotal: number;
  players: PlayerBalance[];
}

export default function DesktopPaymentLedger({ poolBalance, owedTotal, players }: DesktopPaymentLedgerProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 font-['Lexend',_sans-serif]">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
        style={{ backgroundImage: "url('/badminton-bg.png')" }}
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
          <Link href={`${basePath}`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <LayoutDashboard className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">DASHBOARD</span>
          </Link>
          <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <CalendarDays className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">SESSIONS</span>
          </Link>
          <Link href={`${basePath}/purchases`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Package className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">STOCK</span>
          </Link>
          <Link href={`${basePath}/payments`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <Wallet className="size-5" />
            <span className="text-sm tracking-wide uppercase">PAYMENTS</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 flex flex-col overflow-y-auto w-full">
        {/* Top Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 w-1/3">
             <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-[#13ec80] transition-colors" />
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 text-sm focus:ring-1 focus:ring-[#13ec80] transition-all text-slate-200 h-10 outline-none shadow-inner" 
                placeholder="Search players..." 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href={`${basePath}/record-transaction-stitch`} className="bg-[#13ec80] text-[#020617] px-6 py-2 rounded font-black text-xs tracking-tighter hover:brightness-110 transition-all uppercase shadow-lg shadow-[#13ec80]/20 border border-[#13ec80]">
              Record Payment
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-100 uppercase">Shuttle Tracker</p>
                <p className="text-[10px] text-[#13ec80] font-black uppercase tracking-tighter">{currentMode}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 space-y-8 flex-1 max-w-6xl mx-auto w-full">
          {/* Hero Title */}
          <div className="flex flex-col gap-1 text-left">
            <h2 className="text-5xl font-black italic tracking-tighter text-slate-100 uppercase leading-none">Payment Ledger</h2>
            <p className="text-slate-500 font-medium text-sm tracking-tight uppercase">Squad financial status & balances</p>
          </div>

          {/* Pool Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:border-[#13ec80]/50 transition-all">
              <div>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Total Pool Balance</p>
                <p className={clsx("font-mono text-4xl font-bold", poolBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {poolBalance >= 0 ? "+" : "-"}RM{Math.abs(poolBalance).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-emerald-400/80 text-xs font-bold">
                <TrendingUp className="size-4" />
                <span className="uppercase tracking-tight">Active Pool Size</span>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Total Owed by Players</p>
                <p className="font-mono text-4xl font-bold text-rose-400">RM{Math.abs(owedTotal).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-slate-500 text-xs font-bold uppercase">
                <Clock className="size-4" />
                <span>Pending Collections</span>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Active Players</p>
                <p className="font-mono text-4xl font-bold text-slate-100">{players.length}</p>
              </div>
              <button className="flex items-center gap-2 mt-4 text-[#13ec80] text-xs font-bold uppercase tracking-widest hover:brightness-110">
                <Users className="size-4" />
                <span>Squad Size</span>
              </button>
            </div>
          </div>

          {/* Player Balance List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-100">Squad Standings</h3>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-left">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/30 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Player Details</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Activity</th>
                      <th className="px-6 py-4 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredPlayers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-bold">No players found matching your search.</td>
                      </tr>
                    )}
                    {filteredPlayers.map(player => {
                      const initial = player.name.charAt(0).toUpperCase();
                      const isSurplus = player.balance >= 0;
                      const isDebt = player.balance < -50;
                      
                      return (
                        <tr key={player.id} className="hover:bg-slate-950/50 transition-colors">
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center gap-3">
                              <div className={clsx(
                                "size-8 rounded-full flex items-center justify-center border font-bold text-xs uppercase",
                                isSurplus 
                                  ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                                  : isDebt 
                                    ? "bg-rose-400/10 border-rose-400/20 text-rose-400"
                                    : "bg-amber-400/10 border-amber-400/20 text-amber-400"
                              )}>
                                {initial}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-100 uppercase tracking-tight">{player.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={clsx(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                isSurplus 
                                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                                  : isDebt
                                    ? "bg-rose-400/10 text-rose-400 border-rose-400/20"
                                    : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                              )}>
                                {isSurplus ? 'Settled' : isDebt ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-400">{player.lastActivity}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={clsx(
                              "font-mono text-sm font-bold",
                              isSurplus ? "text-emerald-400" : "text-rose-400"
                            )}>
                              {isSurplus ? "+" : "-"}RM{Math.abs(player.balance).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
