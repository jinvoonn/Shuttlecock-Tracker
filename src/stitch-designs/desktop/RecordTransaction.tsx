"use client";

import React from 'react';
import { 
  Banknote, 
  X, 
  Search, 
  Calendar, 
  ArrowRight, 
  LayoutGrid, 
  History, 
  Package, 
  Receipt 
} from 'lucide-react';

export default function DesktopRecordTransaction() {
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-['Lexend',_sans-serif] antialiased">
      <div className="relative flex h-screen w-full flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-6 py-4">
          <div className="flex items-center gap-3">
            <Banknote className="text-[#13ec80] size-6" />
            <h1 className="text-xl font-extrabold italic tracking-tight uppercase">Record Transaction</h1>
          </div>
          <button className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="text-slate-500 dark:text-slate-400 size-6" />
          </button>
        </header>

        {/* Main Content (Modal Body) */}
        <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8 max-w-2xl mx-auto w-full text-left">
          {/* Transaction Type Segmented Control */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Transaction Type</p>
            <div className="flex h-12 w-full items-center justify-center rounded-lg bg-white dark:bg-[#0f172a] p-1 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
              <label className="flex h-full flex-1 cursor-pointer items-center justify-center rounded-md transition-all has-[:checked]:bg-[#13ec80] has-[:checked]:text-[#020617] text-slate-500 dark:text-slate-400 font-bold text-sm">
                <span className="truncate">DEPOSIT</span>
                <input defaultChecked className="sr-only" name="tx-type" type="radio" value="DEPOSIT" />
              </label>
              <label className="flex h-full flex-1 cursor-pointer items-center justify-center rounded-md transition-all has-[:checked]:bg-[#13ec80] has-[:checked]:text-[#020617] text-slate-500 dark:text-slate-400 font-bold text-sm">
                <span className="truncate">SETTLEMENT</span>
                <input className="sr-only" name="tx-type" type="radio" value="SETTLEMENT" />
              </label>
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Amount</p>
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-4xl font-bold text-[#34d399] dark:text-[#34d399]">$</span>
              <input 
                className="w-full bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-800 focus:border-[#34d399] outline-none rounded-xl py-6 pl-12 pr-4 text-5xl font-black text-[#34d399] placeholder:text-[#34d399]/20 transition-all shadow-sm" 
                placeholder="0.00" 
                step="0.01" 
                type="number" 
              />
            </div>
          </div>

          {/* Player Selection */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Select Player</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
              <input 
                className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 focus:border-[#13ec80] outline-none rounded-lg py-4 pl-12 pr-4 text-lg font-medium text-slate-900 dark:text-slate-200 shadow-sm" 
                placeholder="Search player name..." 
                type="text" 
              />
            </div>
            {/* Quick Player Suggestions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <button className="flex items-center gap-2 bg-white dark:bg-[#0f172a] p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#13ec80] transition-colors shadow-sm">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">JD</div>
                <span className="text-sm font-medium truncate">J. Doe</span>
              </button>
              <button className="flex items-center gap-2 bg-[#13ec80]/5 dark:bg-[#13ec80]/5 p-3 rounded-lg border border-[#13ec80] transition-colors shadow-sm">
                <div className="size-8 rounded-full bg-[#13ec80] flex items-center justify-center text-xs font-bold text-[#020617] uppercase">MS</div>
                <span className="text-sm font-medium truncate">M. Smith</span>
              </button>
              <button className="flex items-center gap-2 bg-white dark:bg-[#0f172a] p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#13ec80] transition-colors shadow-sm">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">AL</div>
                <span className="text-sm font-medium truncate">A. Lee</span>
              </button>
              <button className="flex items-center gap-2 bg-white dark:bg-[#0f172a] p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#13ec80] transition-colors shadow-sm">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">RK</div>
                <span className="text-sm font-medium truncate">R. Kim</span>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Transaction Date</p>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
              <input 
                className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 focus:border-[#13ec80] outline-none rounded-lg py-4 pl-12 pr-4 text-lg font-medium text-slate-900 dark:text-slate-200 shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                type="date" 
                defaultValue="2023-10-27" 
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 pb-24">
            <button className="w-full bg-[#34d399] hover:bg-[#13ec80] text-[#020617] font-black text-xl py-6 rounded-xl uppercase tracking-tighter italic flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#13ec80]/20">
              Confirm Payment
              <ArrowRight className="font-bold size-6" />
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-6 flex items-center justify-around z-50">
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors">
            <LayoutGrid className="size-6" />
            <span className="text-[10px] font-bold uppercase">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors">
            <History className="size-6" />
            <span className="text-[10px] font-bold uppercase">Sessions</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#13ec80] transition-colors">
            <Package className="size-6" />
            <span className="text-[10px] font-bold uppercase">Stock</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#13ec80]">
            <Receipt className="size-6" fill="currentColor" fillOpacity={1} />
            <span className="text-[10px] font-bold uppercase">Payments</span>
          </button>
        </nav>

        {/* Background Accent Glow */}
        <div className="absolute -bottom-24 -left-24 size-96 bg-[#13ec80]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 size-96 bg-[#34d399]/10 blur-[120px] rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
}
