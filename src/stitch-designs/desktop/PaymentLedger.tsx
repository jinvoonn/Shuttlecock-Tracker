"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard,
  CalendarDays,
  Package,
  Wallet,
  Pencil,
  Trash2,
  Feather,
  Plus
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { editPayment, deletePayment } from '@/lib/actions/payments';
import { useRole } from '@/context/AuthContext';
import { DatePicker } from '@/components/DatePicker';
import PlayerName from '@/components/ui/PlayerName';

interface PaymentRecord {
  id: string;
  playerName: string;
  playerId: string;
  amount: number;
  date: string;
  note: string;
  elo?: number;
}

interface DesktopPaymentLedgerProps {
  payments: PaymentRecord[];
}

export default function DesktopPaymentLedger({ payments }: DesktopPaymentLedgerProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const { canEdit } = useRole();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedPayments, setExpandedPayments] = useState(false);

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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Feather className="size-5 text-white transform rotate-45" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tighter">
                Cock<span className="text-sky-400">Count</span>
              </h2>
            </div>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest pl-1 leading-tight">
              Because Shuttlecocks Aren't Free
            </p>
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
        <div className="px-8 py-8 md:py-12 space-y-8 flex-1 max-w-6xl mx-auto w-full">
          {/* Hero Title & Actions */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 text-left">
              <h2 className="text-5xl font-black italic tracking-tighter text-slate-100 uppercase leading-none">Payment History</h2>
              <p className="text-slate-500 font-medium text-sm tracking-tight uppercase">Recent transactions & top-ups</p>
            </div>
            {canEdit('payments') && (
              <Link 
                href={`${basePath}/payments/record-transaction`}
                className="bg-[#13ec80] text-slate-950 font-black px-6 py-3 rounded uppercase tracking-tighter flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#13ec80]/20 cursor-pointer"
              >
                <Plus className="size-5" />
                Record Payment
              </Link>
            )}
          </div>

          {/* Stats Bar (Simplified) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:border-[#13ec80]/50 transition-all">
              <div>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Total Payments Logged</p>
                <p className="font-mono text-4xl font-bold text-[#13ec80]">
                  RM{payments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Recent Transactions</p>
                <p className="font-mono text-4xl font-bold text-slate-100">{payments.length}</p>
              </div>
            </div>
          </div>

          {/* Payment List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-100">Transaction Log</h3>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-left">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/30 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Player Name</th>
                      <th className="px-6 py-4">Payment Date</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Amount</th>
                      {canEdit('payments') && <th className="px-6 py-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 font-bold">No payments found.</td>
                      </tr>
                    )}
                    {(expandedPayments ? payments : payments.slice(0, 6)).map(p => {
                      if (editingId === p.id) {
                        return (
                          <tr key={p.id} className="bg-slate-900/80">
                            <td colSpan={4} className="px-6 py-4">
                              <form action={async (formData) => {
                                await editPayment(p.id, formData);
                                setEditingId(null);
                              }} className="flex items-center gap-4">
                                <input type="hidden" name="player_id" value={p.playerId} />
                                <div className="w-1/4">
                                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Date</p>
                                  <DatePicker name="date" defaultValue={p.date} />
                                </div>
                                <div className="w-1/4">
                                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Amount (RM)</p>
                                  <input 
                                    type="number" 
                                    name="amount" 
                                    step="0.01" 
                                    defaultValue={p.amount} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none" 
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-1">Notes</p>
                                  <input 
                                    type="text" 
                                    name="note" 
                                    defaultValue={p.note} 
                                    placeholder="Optional notes" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none placeholder-slate-600" 
                                  />
                                </div>
                                <div className="flex gap-2 self-end mb-0.5">
                                  <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                    Cancel
                                  </button>
                                  <button type="submit" className="px-6 py-2 bg-[#13ec80] text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#13ec80]/10 border border-[#13ec80]">
                                    Save
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        );
                      }
                      
                      return (
                        <tr key={p.id} className="hover:bg-slate-950/50 transition-colors">
                          <td className="px-6 py-4">
                            <PlayerName 
                              name={p.playerName} 
                              elo={p.elo || 1200} 
                              showRankName={false} 
                              nameClassName="text-sm"
                            />
                            {p.note && <p className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">{p.note}</p>}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-400">{p.date}</td>
                           <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span className="font-mono text-sm font-bold text-[#13ec80]">
                              +RM{p.amount.toFixed(2)}
                            </span>
                          </td>
                          {canEdit('payments') && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setEditingId(p.id)}
                                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete this payment record?")) {
                                      await deletePayment(p.id, currentMode);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {payments.length > 6 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setExpandedPayments(!expandedPayments)}
                  className="text-emerald-400 text-sm font-bold uppercase tracking-widest hover:underline transition-all px-6 py-2 rounded-xl border border-emerald-400/20 hover:bg-emerald-400/5"
                >
                  {expandedPayments ? 'Collapse' : `Expand All (${payments.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
