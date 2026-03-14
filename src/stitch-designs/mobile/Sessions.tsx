"use client";

import React from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Activity, 
  LayoutGrid, 
  History, 
  Package, 
  Banknote,
  ChevronRight
} from 'lucide-react';

interface SessionData {
  id: string;
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
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl pb-24">
        {/* Header Section */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black italic tracking-tighter text-[#13ec80] uppercase">Sessions</h1>
            <button className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#13ec80]/20 active:scale-95 transition-all">
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
            <div key={session.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                    {new Date(session.date).toLocaleDateString()} • {session.location}
                  </span>
                  <h3 className="text-xl font-black italic tracking-tight mt-1 text-slate-900 dark:text-slate-100 uppercase">
                    Session {session.id.slice(0, 4)}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  session.status === 'Outstanding' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' :
                  'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {session.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Shuttle Used</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Activity className="text-[#13ec80] size-4" />
                    {session.shuttleUsed.name} ({session.shuttleUsed.quantity})
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end text-right">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Cost / Person</span>
                  <div className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                    ${session.costPerPerson.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2.5">
                  {session.attendees.slice(0, 3).map((name, i) => (
                    <div key={i} className="size-9 rounded-full border-2 border-white dark:border-[#0f172a] bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">
                      {name.slice(0, 2)}
                    </div>
                  ))}
                  {session.attendees.length > 3 && (
                    <div className="size-9 rounded-full border-2 border-white dark:border-[#0f172a] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                      +{session.attendees.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Total Net</span>
                  <span className={`text-xl font-mono font-black leading-none ${session.totalNet >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {session.totalNet >= 0 ? '+' : '-'}${Math.abs(session.totalNet).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* Navigation Bar content... same as before */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-20 px-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
          <button className="flex flex-col items-center gap-1 group">
            <LayoutGrid className="size-6 text-slate-400 dark:text-slate-500 group-hover:text-[#13ec80] transition-colors" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 group-hover:text-[#13ec80] tracking-widest uppercase transition-colors">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <History className="size-6 text-[#13ec80]" />
            <span className="text-[9px] font-black text-[#13ec80] tracking-widest uppercase">Sessions</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <Package className="size-6 text-slate-400 dark:text-slate-500 group-hover:text-[#13ec80] transition-colors" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 group-hover:text-[#13ec80] tracking-widest uppercase transition-colors">Stock</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <Banknote className="size-6 text-slate-400 dark:text-slate-500 group-hover:text-[#13ec80] transition-colors" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 group-hover:text-[#13ec80] tracking-widest uppercase transition-colors">Payments</span>
          </button>
        </nav>

        {/* Floating Action Button content... same as before */}
        <button className="fixed right-6 bottom-24 size-16 bg-[#13ec80] text-slate-950 rounded-2xl shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform shadow-[#13ec80]/30">
          <Plus className="size-8 font-black" />
        </button>
      </div>
    </div>
  );
}
