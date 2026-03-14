"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Wallet, 
  Search, 
  PlusCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function DesktopRecordMatch() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-[#13ec80] text-xl font-bold tracking-tight">CockCount</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest">Sports Management</p>
          </div>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors rounded-lg">
              <LayoutDashboard className="size-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 bg-[#13ec80]/10 text-[#13ec80] rounded-lg">
              <Calendar className="size-5" />
              <span className="text-sm font-medium">Sessions</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors rounded-lg">
              <Package className="size-5" />
              <span className="text-sm font-medium">Stock</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors rounded-lg">
              <Wallet className="size-5" />
              <span className="text-sm font-medium">Payments</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">JD</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">John Doe</span>
              <span className="text-[10px] text-slate-500 uppercase">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:px-12 bg-[#f6f8f7] dark:bg-[#020617]">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <header className="mb-10 flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-5xl font-black italic text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-none mb-2">Log Match Result</h2>
              <div className="flex items-center gap-2 text-[#13ec80] font-medium">
                <Calendar className="size-4" />
                <span className="text-sm">Friday Night Smash • Court 4</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 uppercase tracking-wider transition-colors">Discard</button>
              <button className="px-8 py-2 bg-[#13ec80] text-slate-950 text-sm font-bold rounded uppercase tracking-wider hover:bg-[#13ec80]/90 transition-all shadow-[4px_4px_0px_0px_rgba(19,236,128,0.2)]">Save Match Result</button>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Settings */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
              {/* Match Type */}
              <section className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Match Type Selection</h3>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center gap-3 p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#13ec80] group transition-colors">
                    <input defaultChecked className="text-[#13ec80] focus:ring-[#13ec80] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-full" name="match_type" type="radio" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#13ec80]">Men's Doubles</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#13ec80] group transition-colors">
                    <input className="text-[#13ec80] focus:ring-[#13ec80] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-full" name="match_type" type="radio" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#13ec80]">Women's Doubles</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#13ec80] group transition-colors">
                    <input className="text-[#13ec80] focus:ring-[#13ec80] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-full" name="match_type" type="radio" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#13ec80]">Mixed Doubles</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#13ec80] group transition-colors">
                    <input className="text-[#13ec80] focus:ring-[#13ec80] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-full" name="match_type" type="radio" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#13ec80]">Singles</span>
                  </label>
                </div>
              </section>

              {/* Court Selection */}
              <section className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Court Selection</h3>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map(n => (
                    <button key={n} className="w-10 h-10 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-sm font-bold hover:border-[#13ec80] transition-colors">
                      {n}
                    </button>
                  ))}
                  <button className="w-10 h-10 rounded border border-[#13ec80] bg-[#13ec80]/10 text-[#13ec80] flex items-center justify-center text-sm font-bold">4</button>
                  {[5, 6].map(n => (
                    <button key={n} className="w-10 h-10 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-sm font-bold hover:border-[#13ec80] transition-colors">
                      {n}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Middle Column: Team Selection & Score */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              {/* Score Entry */}
              <section className="bg-white dark:bg-[#0f172a] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between gap-12">
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-[#13ec80] tracking-widest">Team Alpha</span>
                    <input 
                      className="w-full text-center text-7xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 focus:border-[#13ec80] focus:ring-0 text-slate-900 dark:text-slate-100 outline-none transition-all" 
                      type="number" 
                      defaultValue="0" 
                    />
                  </div>
                  <div className="text-4xl font-black text-slate-300 dark:text-slate-700 pt-8 italic">VS</div>
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Team Bravo</span>
                    <input 
                      className="w-full text-center text-7xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 focus:border-[#13ec80] focus:ring-0 text-slate-900 dark:text-slate-100 outline-none transition-all" 
                      type="number" 
                      defaultValue="0" 
                    />
                  </div>
                </div>
              </section>

              {/* Team Selection */}
              <section className="bg-white dark:bg-[#0f172a] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Select Players</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm pl-10 pr-4 py-2 focus:border-[#13ec80] focus:ring-0 outline-none text-slate-900 dark:text-slate-100 transition-all" 
                      placeholder="Search attendees..." 
                      type="text" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {/* Alpha Players Selection */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 px-1">Team Alpha (0/2)</div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#13ec80]/50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">MK</div>
                          <span className="text-sm font-medium">Marcus Kim</span>
                        </div>
                        <PlusCircle className="text-slate-400 size-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#13ec80]/5 border border-[#13ec80]/40 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#13ec80] text-slate-950 flex items-center justify-center text-xs font-black">JS</div>
                          <span className="text-sm font-bold text-[#13ec80]">Jordan Smith</span>
                        </div>
                        <CheckCircle2 className="text-[#13ec80] size-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#13ec80]/50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">AL</div>
                          <span className="text-sm font-medium">Alex Lee</span>
                        </div>
                        <PlusCircle className="text-slate-400 size-5" />
                      </div>
                    </div>
                  </div>

                  {/* Bravo Players Selection */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-3 px-1">Team Bravo (0/2)</div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#13ec80]/50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">SP</div>
                          <span className="text-sm font-medium">Sarah Park</span>
                        </div>
                        <PlusCircle className="text-slate-400 size-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#13ec80]/50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">DW</div>
                          <span className="text-sm font-medium">David Wu</span>
                        </div>
                        <PlusCircle className="text-slate-400 size-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-[#13ec80]/50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">RC</div>
                          <span className="text-sm font-medium">Riley Chen</span>
                        </div>
                        <PlusCircle className="text-slate-400 size-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #13ec80;
        }
      `}</style>
    </div>
  );
}
