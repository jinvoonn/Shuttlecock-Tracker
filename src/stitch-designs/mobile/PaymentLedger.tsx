"use client";

import React from 'react';
import { 
  Banknote, 
  Bell, 
  Search, 
  Plus, 
  LayoutGrid, 
  History, 
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

import { useState } from 'react';
import { useRouter } from "next/navigation";

interface PaymentRecord {
  id: string;
  playerName: string;
  amount: number;
  date: string;
}

interface MobilePaymentLedgerProps {
  payments: PaymentRecord[];
}

export default function MobilePaymentLedger({ payments }: MobilePaymentLedgerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(p => 
    p.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.date.includes(searchTerm)
  );

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-50 dark:bg-[#020617]">
        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Banknote className="text-[#13ec80] size-8" />
              <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-slate-900 dark:text-white">PAYMENTS</h1>
            </div>
            <button className="flex items-center justify-center size-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative group transition-all active:scale-90">
              <Bell className="size-6 text-slate-600 dark:text-slate-400 group-hover:text-[#13ec80] transition-colors" />
              <div className="absolute top-3 right-3 size-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-10 pb-40 text-left">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400 size-5 group-focus-within:text-[#13ec80] transition-colors" />
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm focus:ring-4 focus:ring-[#13ec80]/10 placeholder-slate-500 shadow-sm transition-all dark:text-white" 
              placeholder="Search players..." 
              type="text" 
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 size-16 bg-[#13ec80]/5 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 italic">Total Paid</p>
              <p className="text-2xl font-black italic text-[#13ec80] font-mono tracking-tighter leading-none">RM{payments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</p>
              <TrendingUp className="absolute bottom-4 right-4 size-4 text-[#13ec80]/20" />
            </div>
            <div className="flex flex-col gap-2 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 size-16 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 italic">Records</p>
              <p className="text-2xl font-black italic text-blue-500 font-mono tracking-tighter leading-none">{payments.length}</p>
            </div>
          </div>

          {/* Player Balances Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 italic">History</h2>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-widest shadow-inner">{payments.length} Transactions</span>
            </div>

            {/* Player List */}
            <div className="space-y-3">
              {filteredPayments.length === 0 && <p className="text-slate-500 text-center py-8">No records found.</p>}
              {filteredPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-[1.75rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-inner group-hover:scale-105 transition-transform flex items-center justify-center">
                      <span className="text-[#13ec80] font-black uppercase italic">{p.playerName.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1 uppercase italic">{p.playerName}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{p.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black font-mono tracking-tighter text-[#13ec80] leading-none mb-1 italic">
                      +RM{p.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Action Button */}
        <button className="fixed bottom-32 right-8 size-16 bg-[#13ec80] text-slate-950 rounded-3xl shadow-[0_20px_50px_rgba(19,236,128,0.3)] flex items-center justify-center z-40 hover:scale-110 active:scale-90 transition-all border-b-4 border-[#059669]">
          <Plus className="size-8 font-black" />
        </button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button onClick={() => router.push('/view/dashboard-stitch')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group">
              <LayoutGrid className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Dash</span>
            </button>
            <button onClick={() => router.push('/view/sessions-stitch')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group">
              <History className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">History</span>
            </button>
            <button onClick={() => router.push('/view/stock-inventory-stitch')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group">
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
            </button>
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-[#13ec80] relative">
              <Banknote className="size-7 fill-current" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-[#13ec80] shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
