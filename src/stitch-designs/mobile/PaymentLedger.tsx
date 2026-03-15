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
  TrendingDown,
  Pencil,
  Trash,
  History as HistoryIcon
} from 'lucide-react';
import { usePathname, useRouter } from "next/navigation";
import { editPayment, deletePayment } from '@/lib/actions/payments';

import { useState } from 'react';
import { DatePicker } from '@/components/DatePicker';

interface PaymentRecord {
  id: string;
  playerName: string;
  playerId: string;
  amount: number;
  date: string;
  note: string;
}

interface MobilePaymentLedgerProps {
  payments: PaymentRecord[];
}

export default function MobilePaymentLedger({ payments }: MobilePaymentLedgerProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredPayments = payments.filter(p =>
    p.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.date.includes(searchTerm)
  );

  const handleDelete = async (id: string, playerName: string) => {
    if (window.confirm(`Are you sure you want to delete this payment from ${playerName}?`)) {
      try {
        await deletePayment(id);
        router.refresh();
      } catch (err) {
        alert("Failed to delete payment");
      }
    }
  };

  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl bg-slate-900">
        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-emerald-400/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Banknote className="text-emerald-400 size-8" />
              <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-emerald-400">PAYMENTS</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-10 pb-40 text-left">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500 size-5 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-6 py-5 bg-slate-800 border border-slate-700 rounded-3xl text-sm focus:ring-4 focus:ring-emerald-400/10 placeholder-slate-500 shadow-sm transition-all text-white outline-none" 
              placeholder="Search players..." 
              type="text" 
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-6 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 size-16 bg-emerald-400/5 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 italic">Total Paid</p>
              <p className="text-2xl font-black italic text-emerald-400 font-mono tracking-tighter leading-none">RM{payments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</p>
              <TrendingUp className="absolute bottom-4 right-4 size-4 text-emerald-400/20" />
            </div>
            <div className="flex flex-col gap-2 p-6 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 size-16 bg-emerald-400/5 rounded-full -translate-y-8 translate-x-8 blur-2xl"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 italic">Records</p>
              <p className="text-2xl font-black italic text-emerald-400 font-mono tracking-tighter leading-none">{payments.length}</p>
            </div>
          </div>

          {/* Player Balances Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">History</h2>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-500 uppercase tracking-widest shadow-inner">{payments.length} Transactions</span>
            </div>

            {/* Player List */}
            <div className="flex flex-col gap-4">
              {filteredPayments.length === 0 && <p className="text-slate-500 text-center py-8">No records found.</p>}
              {filteredPayments.map((p) => (
                <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-[2.5rem] p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 size-24 bg-emerald-400/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-emerald-400/10 transition-colors"></div>
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-black italic shadow-inner">
                          {p.playerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tighter text-lg leading-none mb-1">{p.playerName}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(p.date).toLocaleDateString()}</p>
                          {p.note && <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">{p.note}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black font-mono tracking-tighter text-emerald-400 leading-none mb-1 italic">+RM{p.amount.toFixed(2)}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Amount Paid</p>
                      </div>
                   </div>

                    {editingId === p.id ? (
                      <div className="pt-5 border-t border-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
                        <form action={async (formData) => {
                          await editPayment(p.id, formData);
                          setEditingId(null);
                          router.refresh();
                        }} className="space-y-4">
                          <input type="hidden" name="player_id" value={p.playerId || ""} />
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 text-left">Date</p>
                              <DatePicker name="date" defaultValue={p.date} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 text-left">Amount (RM)</p>
                              <input 
                                type="number" 
                                name="amount" 
                                step="0.01"
                                defaultValue={p.amount}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-400/20 outline-none text-left text-white" 
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 text-left">Notes</p>
                              <input 
                                type="text" 
                                name="note" 
                                defaultValue={p.note}
                                placeholder="Optional notes"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-400/20 outline-none text-left text-white" 
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-700 transition-all">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">Save</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 pt-5 border-t border-slate-700 relative z-10">
                        <button 
                          onClick={() => setEditingId(p.id)}
                          className="size-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-400 active:scale-90 transition-all shadow-sm"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.playerName)}
                          className="size-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-rose-500 active:scale-90 transition-all shadow-sm"
                        >
                          <Trash className="size-4" />
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Action Button */}
        <button 
          onClick={() => router.push(`${basePath}/payments/record-transaction`)}
          className="fixed bottom-32 right-8 size-16 bg-emerald-400 text-slate-950 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center z-40 hover:scale-110 active:scale-90 transition-all border-b-4 border-emerald-600">
          <Plus className="size-8 font-black" />
        </button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button 
              onClick={() => router.push(basePath)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <LayoutGrid className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Dash</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/sessions`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <HistoryIcon className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Sessions</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/purchases`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <Package className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
            </button>
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-emerald-400 relative group">
              <Banknote className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
