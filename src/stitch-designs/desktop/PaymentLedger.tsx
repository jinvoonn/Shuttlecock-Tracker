"use client";

import React from 'react';
import { 
  Activity, 
  Search, 
  User, 
  TrendingUp, 
  Clock, 
  Users, 
  Filter, 
  Download, 
  PlusCircle, 
  MinusCircle, 
  HelpCircle, 
  Settings 
} from 'lucide-react';

export default function DesktopPaymentLedger() {
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      {/* Header Section */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-[#1e293b] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <Activity className="text-[#13ec80] size-8" />
              <h1 className="text-xl font-black italic tracking-tighter uppercase">CockCount</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors uppercase">Dashboard</button>
              <button className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors uppercase">Sessions</button>
              <button className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors uppercase">Stock</button>
              <button className="text-xs font-bold tracking-widest text-[#13ec80] border-b-2 border-[#13ec80] pb-1 uppercase">Payments</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
              <input 
                className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#13ec80] focus:border-transparent outline-none w-64 text-slate-900 dark:text-slate-100 placeholder:text-slate-400" 
                placeholder="Global Search..." 
                type="text" 
              />
            </div>
            <button className="bg-[#13ec80] text-[#020617] px-6 py-2 rounded font-black text-xs tracking-tighter hover:brightness-110 transition-all uppercase shadow-lg shadow-[#13ec80]/20">
              Record Payment
            </button>
            <div className="size-10 rounded-full border-2 border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              <User className="text-slate-500 dark:text-slate-400 size-6" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 lg:px-20 py-8 space-y-8 flex-1">
        {/* Hero Title */}
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-slate-100 uppercase leading-none">Payment Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-tight uppercase">Squad financial status & transaction history</p>
        </div>

        {/* Pool Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-6 rounded-xl shadow-sm flex flex-col justify-between group hover:border-[#13ec80]/50 transition-all">
            <div>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Total Group Balance</p>
              <p className="font-mono text-4xl font-bold text-emerald-500 dark:text-emerald-400">$12,450.80</p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-emerald-500 dark:text-emerald-400/80 text-xs font-bold">
              <TrendingUp className="size-4" />
              <span className="uppercase tracking-tight">+14.2% FROM LAST MONTH</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Pending Settlements</p>
              <p className="font-mono text-4xl font-bold text-rose-500 dark:text-rose-400">$3,120.00</p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
              <Clock className="size-4" />
              <span>8 PAYMENTS OUTSTANDING</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Active Players</p>
              <p className="font-mono text-4xl font-bold text-slate-900 dark:text-slate-100">24</p>
            </div>
            <button className="flex items-center gap-2 mt-4 text-[#13ec80] text-xs font-bold uppercase tracking-widest hover:brightness-110">
              <Users className="size-4" />
              <span>View All Profiles</span>
            </button>
          </div>
        </div>

        {/* Player Balance List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-red-100">Squad Standings</h3>
            <div className="flex gap-2">
              <button className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Filter className="text-slate-500 dark:text-slate-400 size-5" />
              </button>
              <button className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Download className="text-slate-500 dark:text-slate-400 size-5" />
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-sm text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200 dark:border-[#1e293b]">
                  <tr>
                    <th className="px-6 py-4">Player Details</th>
                    <th className="px-6 py-4">Total Paid</th>
                    <th className="px-6 py-4">Cost Share</th>
                    <th className="px-6 py-4 text-right">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]/50">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#13ec80]/10 flex items-center justify-center border border-[#13ec80]/20 text-[#13ec80] font-bold text-xs uppercase">AM</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Alex Miller</p>
                          <p className="text-[10px] text-slate-500 font-mono">#PLR-4820</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">$1,200.00</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">$850.00</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-sm font-bold text-emerald-500 dark:text-emerald-400">+$350.00</span>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500 font-bold text-xs uppercase">JS</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">John Smith</p>
                          <p className="text-[10px] text-slate-500 font-mono">#PLR-9912</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">$450.00</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">$625.00</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-sm font-bold text-rose-500">-$175.00</span>
                    </td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-[#1e293b] text-slate-600 dark:text-slate-300 font-bold text-xs uppercase">RK</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Ryan King</p>
                          <p className="text-[10px] text-slate-500 font-mono">#PLR-3301</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">$890.00</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">$890.00</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-sm font-bold text-slate-500">$0.00</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 text-left">
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-slate-100">Live Ledger Feed</h3>
            <div className="space-y-2">
              {/* Transaction Entry */}
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 group transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-lg">
                    <PlusCircle className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">Deposit - Alex Miller</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">24 Oct, 2023 • 14:45 • REF: 90210</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-emerald-500 dark:text-emerald-400">+$200.00</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Approved</p>
                </div>
              </div>
              {/* Transaction Entry */}
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 group transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-lg">
                    <MinusCircle className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">Equipment Fee - Shared</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">23 Oct, 2023 • 09:12 • REF: 88412</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-rose-500 dark:text-rose-400">-$45.00</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Debit</p>
                </div>
              </div>
              {/* Transaction Entry */}
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 group transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-lg">
                    <PlusCircle className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">Deposit - Sarah Jenkins</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">22 Oct, 2023 • 18:30 • REF: 77102</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-emerald-500 dark:text-emerald-400">+$500.00</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Tool: Quick Stats */}
          <div className="space-y-6 text-left">
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-slate-100">Insights</h3>
            <div className="bg-white dark:bg-[#0f172a] border-l-4 border-l-[#13ec80] border border-slate-200 dark:border-[#1e293b] p-6 space-y-4 rounded-r-xl shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Net Profit Margin</span>
                <span className="font-mono text-sm text-[#13ec80]">68%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#13ec80] h-full w-[68%]" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Group profitability is up by <span className="text-[#13ec80] font-bold">8%</span> this session cycle due to lower operating costs.</p>
            </div>
            <div className="bg-[#13ec80]/5 dark:bg-[#13ec80]/10 border border-[#13ec80]/20 p-6 rounded-xl space-y-4 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#13ec80]">Need Support?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Reconcile payments faster with automated bank sync (Pro Plan).</p>
              <button className="w-full py-2 border border-[#13ec80]/50 text-[#13ec80] text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-[#13ec80]/10 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Bottom Nav */}
      <footer className="mt-8 border-t border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a]/50 px-6 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50 contrast-125 dark:invert">
            <Activity className="size-6" />
            <h1 className="text-lg font-black italic tracking-tighter uppercase">CockCount</h1>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center md:text-left">
            © 2023 CockCount Sports-Tech Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors"><HelpCircle className="size-5" /></button>
            <button className="text-slate-500 dark:text-slate-400 hover:text-[#13ec80] transition-colors"><Settings className="size-5" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
