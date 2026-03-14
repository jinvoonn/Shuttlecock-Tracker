"use client";

import React from 'react';
import {
  Plus,
  Search,
  Calendar,
  Activity,
  LayoutGrid,
  History as HistoryIcon,
  Package,
  Banknote,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SessionData {
  id: string;
  displayNumber: number;
  date: string;
  location: string;
  status: 'Completed' | 'Outstanding' | 'Archived';
  shuttleUsed: {
    name: string;
    quantity: number;
  };
  costPerPerson: number;
  attendees: string[];
  totalNet: number;
}

interface MobileSessionsProps {
  sessions: SessionData[];
}

export default function MobileSessions({ sessions }: MobileSessionsProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl pb-24">
        {/* Header Section */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black italic tracking-tighter text-[#13ec80] uppercase">Sessions</h1>
            <button
              onClick={() => router.push(`${basePath}/sessions/new`)}
              className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#13ec80]/20 active:scale-95 transition-all">
              <Plus className="size-4" />
              LOG NEW
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-[#13ec80] transition-colors" />
              <input 
                className="w-full bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#13ec80]/20 focus:border-[#13ec80] placeholder:text-slate-500 transition-all outline-none" 
                placeholder="Search sessions..." 
                type="text" 
              />
            </div>
          </div>
        </header>

        {/* Main Content: Session List */}
        <main className="flex-1 px-4 py-6 space-y-6 text-left">
          <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">History</h2>
          
          {sessions.length === 0 && (
            <div className="text-center py-10 text-slate-500">No sessions found.</div>
          )}

          {sessions.map((session) => (
            <div key={session.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#13ec80] uppercase tracking-widest bg-[#13ec80]/10 px-2 py-0.5 rounded">Session {session.displayNumber}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-slate-100 uppercase mt-1">
                    {session.location}
                  </h3>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                  session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  session.status === 'Outstanding' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' :
                  'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {session.status}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 py-5 border-y border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Shuttle Used</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Activity className="text-[#13ec80] size-4" />
                    <span className="truncate">{session.shuttleUsed.name} ({session.shuttleUsed.quantity})</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end text-right">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Cost / Person</span>
                  <div className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                    RM {session.costPerPerson.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex -space-x-3">
                  {session.attendees.slice(0, 3).map((name, i) => (
                    <div key={i} className="size-10 rounded-full border-2 border-white dark:border-[#0f172a] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase shadow-sm">
                      {name.slice(0, 2)}
                    </div>
                  ))}
                  {session.attendees.length > 3 && (
                    <div className="size-10 rounded-full border-2 border-white dark:border-[#0f172a] bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400">
                      +{session.attendees.length - 3}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                  className="bg-slate-900 dark:bg-slate-800 text-[#13ec80] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#13ec80] hover:text-slate-950 transition-all active:scale-95 shadow-lg"
                >
                  OPEN SESSION
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button 
              onClick={() => router.push(basePath)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group"
            >
              <LayoutGrid className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Dash</span>
            </button>
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-[#13ec80] relative group">
              <HistoryIcon className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Sessions</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-[#13ec80] shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/purchases`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group"
            >
              <Package className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/payments`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group"
            >
              <Banknote className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
            </button>
          </div>
        </nav>

        {/* Floating Action Button content... same as before */}
        <button className="fixed right-6 bottom-24 size-16 bg-[#13ec80] text-slate-950 rounded-2xl shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform shadow-[#13ec80]/30">
          <Plus className="size-8 font-black" />
        </button>
      </div>
    </div>
  );
}
