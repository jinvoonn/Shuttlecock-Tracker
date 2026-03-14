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

interface PaymentRecord {
  id: string;
  playerName: string;
  amount: number;
  date: string;
}

interface DesktopPaymentLedgerProps {
  payments: PaymentRecord[];
}

export default function DesktopPaymentLedger({ payments }: DesktopPaymentLedgerProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(p => 
    p.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.date.includes(searchTerm)
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
            <h2 className="text-5xl font-black italic tracking-tighter text-slate-100 uppercase leading-none">Payment History</h2>
            <p className="text-slate-500 font-medium text-sm tracking-tight uppercase">Recent transactions & top-ups</p>
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
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 font-bold">No payments found.</td>
                      </tr>
                    )}
                    {filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-100 uppercase tracking-tight">{p.playerName}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-400">{p.date}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="font-mono text-sm font-bold text-[#13ec80]">
                            +RM{p.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {/* TODO: Implement Edit */}}
                              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                            >
                              <Search className="size-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this payment record?")) {
                                  // TODO: call deletePayment
                                }
                              }}
                              className="p-1.5 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Package className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
