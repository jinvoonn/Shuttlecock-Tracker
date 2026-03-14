"use client";

import React from 'react';
import { 
  PlusCircle, 
  Settings, 
  Package, 
  Minus, 
  Plus, 
  Search, 
  Zap, 
  LayoutGrid, 
  History, 
  Wallet 
} from 'lucide-react';

export default function DesktopSessions() {
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pb-32">
        {/* Header Section */}
        <header className="flex items-center justify-between py-8 border-b border-slate-200 dark:border-[#1e293b] mb-8">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-[#34d399] size-8" />
            <h1 className="text-3xl font-extrabold italic tracking-tighter uppercase dark:text-slate-100">LOG NEW SESSION</h1>
          </div>
          <button className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-2 hover:border-[#34d399] transition-colors rounded">
            <Settings className="text-slate-400 size-6" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-10">
            {/* Section: Shuttle Selection */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase italic">01. Select Shuttle Tube</h2>
                <div className="relative">
                  <Package className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                  <input 
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-[#1e293b] text-[10px] pl-8 pr-4 py-1.5 focus:ring-1 focus:ring-[#34d399] w-40 placeholder:text-slate-600 font-bold uppercase tracking-wider outline-none rounded" 
                    placeholder="SEARCH STOCK..." 
                    type="text" 
                  />
                </div>
              </div>
              
              {/* Horizontally Scrollable Tube Area */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {/* Tube Card 1 */}
                <div className="min-w-[200px] bg-white dark:bg-[#0f172a] border-2 border-[#34d399] p-4 cursor-pointer snap-start relative group rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                      <Package className="text-[#34d399] size-6" />
                    </div>
                    <span className="bg-[#34d399]/10 text-[#34d399] text-[10px] px-2 py-1 font-bold rounded">SELECTED</span>
                  </div>
                  <h3 className="font-bold text-base">Yonex AS-30</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">12 tubes left</p>
                </div>

                {/* Tube Card 2 */}
                <div className="min-w-[200px] bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-[#1e293b] p-4 cursor-pointer snap-start hover:border-slate-400 dark:hover:border-slate-700 transition-colors rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                      <Package className="text-slate-500 size-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Victor Gold</h3>
                  <p className="text-slate-500 text-xs">8 tubes left</p>
                </div>

                {/* Tube Card 3 */}
                <div className="min-w-[200px] bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-[#1e293b] p-4 cursor-pointer snap-start hover:border-slate-400 dark:hover:border-slate-700 transition-colors rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                      <Package className="text-slate-500 size-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">RSL Tourney No.1</h3>
                  <p className="text-slate-500 text-xs">24 tubes left</p>
                </div>

                {/* Tube Card 4 */}
                <div className="min-w-[200px] bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-[#1e293b] p-4 cursor-pointer snap-start hover:border-slate-400 dark:hover:border-slate-700 transition-colors rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                      <Package className="text-slate-500 size-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Aeroplane EG1130</h3>
                  <p className="text-slate-500 text-xs">5 tubes left</p>
                </div>
              </div>
            </section>

            {/* Section: Usage Tracker */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase italic">02. Shuttles Used</h2>
                <span className="text-xs text-slate-500 font-mono italic uppercase">Session_Active</span>
              </div>
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-8 flex flex-col items-center justify-center gap-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-12">
                  <button className="w-16 h-16 rounded-full border border-slate-200 dark:border-[#1e293b] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Minus className="text-3xl size-8" />
                  </button>
                  <div className="text-8xl font-mono font-bold text-[#34d399] tabular-nums tracking-tighter">06</div>
                  <button className="w-16 h-16 rounded-full border border-slate-200 dark:border-[#1e293b] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Plus className="text-[#34d399] size-8" />
                  </button>
                </div>
                <p className="text-slate-500 uppercase text-[10px] tracking-[0.2em] font-bold">Manual Count Increment</p>
              </div>
            </section>

            {/* Section: Attendee Selection */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase italic">03. Attendees</h2>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                  <input 
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-[#1e293b] text-[10px] pl-8 pr-4 py-1.5 focus:ring-1 focus:ring-[#34d399] w-40 placeholder:text-slate-600 font-bold uppercase tracking-wider outline-none rounded" 
                    placeholder="SEARCH PLAYERS..." 
                    type="text" 
                  />
                </div>
              </div>
              
              {/* Scrollable Grid for 20+ Players */}
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-[#1e293b] p-4 max-h-[400px] overflow-y-auto rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {/* Player 1 (Selected) */}
                  <div className="bg-[#34d399] border border-[#34d399] p-3 flex flex-col items-center gap-2 cursor-pointer transition-all rounded shadow-sm">
                    <div className="size-12 rounded-full overflow-hidden border-2 border-slate-950">
                      <img alt="User" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-950 uppercase text-center truncate w-full">M. Felix</span>
                  </div>
                  
                  {/* Player 2 */}
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-[#34d399]/50 transition-all rounded shadow-sm">
                    <div className="size-12 rounded-full overflow-hidden grayscale opacity-70">
                      <img alt="User" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center truncate w-full">S. Chen</span>
                  </div>
                  
                  {/* Player 3 (Selected) */}
                  <div className="bg-[#34d399] border border-[#34d399] p-3 flex flex-col items-center gap-2 cursor-pointer transition-all rounded shadow-sm">
                    <div className="size-12 rounded-full overflow-hidden border-2 border-slate-950">
                      <img alt="User" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-950 uppercase text-center truncate w-full">J. Wilson</span>
                  </div>
                  
                  {/* More Players... */}
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-[#34d399]/50 transition-all rounded shadow-sm">
                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">BT</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center truncate w-full">B. Tan</span>
                  </div>
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-[#34d399]/50 transition-all rounded shadow-sm">
                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">RK</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center truncate w-full">R. Kumar</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Live Calculation (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white dark:bg-[#0f172a] border-l-4 border-l-[#34d399] border border-slate-200 dark:border-[#1e293b] p-6 shadow-xl rounded-r-lg">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 italic">Live Session Summary</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-xs font-medium uppercase">Total Cost</span>
                    <span className="text-3xl font-mono font-bold text-[#34d399] tracking-tighter">$42.00</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
                    <span className="text-slate-400 text-xs font-medium uppercase">Cost Per Person</span>
                    <span className="text-3xl font-mono font-bold text-[#34d399] tracking-tighter">$21.00</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">Shuttles (6)</span>
                    <span className="text-slate-700 dark:text-slate-300">$18.00</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">Court Fee</span>
                    <span className="text-slate-700 dark:text-slate-300">$24.00</span>
                  </div>
                </div>
                <button className="w-full mt-8 bg-[#34d399] hover:bg-[#34d399]/90 text-[#020617] font-black py-4 rounded uppercase tracking-tighter transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#34d399]/20">
                  <span>Finalize Session</span>
                  <Zap className="size-5 fill-current" />
                </button>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-[#1e293b] rounded-lg">
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  Cost is calculated based on current shuttle usage ($3.00/unit) and base court entry for 2 participants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-[#1e293b] px-6 py-3 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 group">
            <LayoutGrid className="text-slate-500 group-hover:text-[#34d399] transition-colors size-5" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#34d399] transition-colors">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 group relative">
            <History className="text-[#34d399] size-5" />
            <span className="text-[9px] font-bold text-[#34d399] uppercase tracking-widest">Sessions</span>
            <div className="absolute -top-3 w-8 h-1 bg-[#34d399] rounded-full"></div>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <Package className="text-slate-500 group-hover:text-[#34d399] transition-colors size-5" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#34d399] transition-colors">Stock</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <Wallet className="text-slate-500 group-hover:text-[#34d399] transition-colors size-5" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#34d399] transition-colors">Payments</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #34d399;
        }
      `}</style>
    </div>
  );
}
