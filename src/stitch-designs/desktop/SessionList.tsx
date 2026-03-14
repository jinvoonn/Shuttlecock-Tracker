"use client";

import React, { useState } from 'react';
import { 
  Activity,
  LayoutDashboard,
  CalendarDays,
  Package,
  Wallet,
  Plus,
  PlusCircle,
  TrendingUp,
  CreditCard,
  Pencil,
  Trash2,
  Search
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SessionData {
  id: string;
  date: string;
  location: string;
  notes?: string;
  displayNumber?: number;
  status: 'Completed' | 'Outstanding' | 'Archived';
  shuttleUsed: {
    name: string;
    quantity: number;
  };
  costPerPerson: number;
  attendees: string[];
  totalNet: number;
}

interface DesktopSessionsListProps {
  sessions: SessionData[];
}

export default function DesktopSessionList({ sessions }: DesktopSessionsListProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.date.includes(searchTerm) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
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
          <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <CalendarDays className="size-5" />
            <span className="text-sm tracking-wide uppercase">SESSIONS</span>
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
      <main className="relative z-20 flex-1 flex flex-col overflow-y-auto w-full">
        {/* Top Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 w-1/3">
             <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-[#13ec80] transition-colors" />
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 text-sm focus:ring-1 focus:ring-[#13ec80] transition-all text-slate-200 h-10 outline-none shadow-inner"
                placeholder="Search sessions..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href={`${basePath}/sessions/log`} className="bg-[#13ec80] text-[#020617] px-6 py-2 rounded font-black text-xs tracking-tighter hover:brightness-110 transition-all uppercase shadow-lg shadow-[#13ec80]/20 border border-[#13ec80] flex items-center gap-2">
              <Plus className="size-4" /> Log New
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
            <h2 className="text-5xl font-black italic tracking-tighter text-slate-100 uppercase leading-none">Sessions History</h2>
            <p className="text-slate-500 font-medium text-sm tracking-tight uppercase tracking-widest">Active matches & shuttle tracking</p>
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-20 text-slate-500 text-lg font-bold">No sessions found matching your search.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredSessions.map((session) => (
              <Link href={`${basePath}/sessions/${session.id}`} key={session.id} className="block group">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-[#13ec80]/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-tight">
                        {new Date(session.date).toLocaleDateString()} • {session.location}
                      </span>
                      <h3 className="text-2xl font-black italic tracking-tight mt-1 text-slate-100 uppercase group-hover:text-[#13ec80] transition-colors">
                        Session {session.displayNumber || session.id.slice(0, 4)}
                      </h3>
                    </div>
                    <span className={clsx("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                      session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      session.status === 'Outstanding' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    )}>
                      {session.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Shuttle Used</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Activity className="text-[#13ec80] size-4" />
                        {session.shuttleUsed.name} ({session.shuttleUsed.quantity})
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end text-right">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Cost / Person</span>
                      <div className="text-lg font-mono font-black text-slate-100">
                        RM{session.costPerPerson.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex -space-x-2.5">
                      {session.attendees.slice(0, 4).map((name, i) => (
                        <div key={i} className="size-10 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                          {name.slice(0, 2)}
                        </div>
                      ))}
                      {session.attendees.length > 4 && (
                        <div className="size-10 rounded-full border-2 border-[#0f172a] bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300">
                          +{session.attendees.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Total Net</span>
                      <span className={clsx("text-2xl font-mono font-black leading-none", session.totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                        {session.totalNet >= 0 ? '+' : '-'}RM{Math.abs(session.totalNet).toFixed(2)}
                      </span>
                      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                           className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                           onClick={(e) => {
                             e.preventDefault();
                             // TODO: Implement Edit
                           }}
                         >
                             <Pencil className="size-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              if (window.confirm("Are you sure you want to delete this session? This will also restore used shuttlecocks to inventory.")) {
                                 // TODO: Link to deleteSession
                              }
                            }}
                          >
                             <Trash2 className="size-4" />
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
