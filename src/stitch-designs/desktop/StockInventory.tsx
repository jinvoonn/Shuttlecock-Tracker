"use client";

import React from 'react';
import { 
  Activity, 
  Bell, 
  PlusSquare, 
  Package, 
  History, 
  LayoutGrid, 
  Sword, 
  Wallet, 
  PlusCircle 
} from 'lucide-react';

export default function DesktopStockInventory() {
  return (
    <div className="bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-['Lexend',_sans-serif] min-h-screen pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-[#1e293b] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md px-4 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-[#34d399] flex items-center justify-center rounded">
            <Activity className="text-slate-950 size-5" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter uppercase">CockCount</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] text-slate-500 dark:text-slate-400 hover:text-[#34d399] transition-colors">
            <Bell className="size-5" />
          </button>
          <div className="size-10 rounded-full border-2 border-[#34d399] overflow-hidden">
            <img 
              alt="Profile" 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:p-10 space-y-8">
        {/* Header & Primary Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic uppercase text-slate-900 dark:text-slate-100 tracking-tighter">Stock Inventory</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest text-xs font-bold">Asset management & consumption tracking</p>
          </div>
          <button className="bg-[#34d399] text-slate-950 font-black px-6 py-3 rounded uppercase tracking-tighter flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#34d399]/20">
            <PlusSquare className="size-5" />
            Add New Stock
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#0f172a] p-6 border-l-4 border-[#34d399] rounded-lg shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Total Tubes</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white">42</span>
              <span className="text-[#34d399] text-sm font-bold uppercase">Units</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] p-6 border-l-4 border-[#34d399]/40 rounded-lg shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Total Individual Shuttles</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white">496</span>
              <span className="text-[#34d399] text-sm font-bold uppercase">Ready</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] p-6 border-l-4 border-[#34d399]/20 rounded-lg shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Avg Cost/Shuttle</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white">2.45</span>
              <span className="text-[#34d399] text-sm font-bold uppercase">USD</span>
            </div>
          </div>
        </div>

        {/* Active Stock Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="text-[#34d399] size-6" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Active Tubes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-5 rounded-xl group hover:border-[#34d399]/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg uppercase">Yonex AS-30</h3>
                  <p className="text-slate-500 text-xs uppercase font-mono">Serial: YNX-882-01</p>
                </div>
                <span className="bg-[#34d399]/10 text-[#34d399] text-[10px] font-bold px-2 py-1 rounded uppercase">Premium</span>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400 uppercase">Remaining Shuttles</span>
                  <span className="text-slate-900 dark:text-white font-mono">8/12</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#34d399] h-full w-[66%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm">
                  <span className="text-slate-400">$</span><span className="text-slate-900 dark:text-white">2.80</span><span className="text-slate-400">/ea</span>
                </div>
                <button className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-300 hover:text-white hover:bg-red-500 hover:border-red-500 px-4 py-2 rounded text-xs font-bold uppercase transition-all">
                  Deplete
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-5 rounded-xl group hover:border-[#34d399]/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg uppercase">Victor Gold</h3>
                  <p className="text-slate-500 text-xs uppercase font-mono">Serial: VCT-092-44</p>
                </div>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Standard</span>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400 uppercase">Remaining Shuttles</span>
                  <span className="text-slate-900 dark:text-white font-mono">3/12</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[25%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm">
                  <span className="text-slate-400">$</span><span className="text-slate-900 dark:text-white">2.10</span><span className="text-slate-400">/ea</span>
                </div>
                <button className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-[#1e293b] text-slate-700 dark:text-slate-300 hover:text-white hover:bg-red-500 hover:border-red-500 px-4 py-2 rounded text-xs font-bold uppercase transition-all">
                  Deplete
                </button>
              </div>
            </div>

            {/* Card 3 (Empty State) */}
            <div className="bg-slate-50 dark:bg-[#0f172a] border-2 border-dashed border-slate-200 dark:border-[#1e293b] p-5 rounded-xl flex flex-col items-center justify-center min-h-[180px] hover:border-[#34d399]/50 cursor-pointer transition-all group shadow-sm">
              <PlusCircle className="text-slate-300 dark:text-slate-700 group-hover:text-[#34d399] size-10 mb-2 transition-colors" />
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs group-hover:text-slate-900 dark:group-hover:text-slate-300">Open New Tube</p>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="text-[#34d399] size-6" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Purchase History</h2>
            </div>
            <button className="text-[#34d399] text-xs font-bold uppercase hover:underline">View All</button>
          </div>
          <div className="overflow-hidden border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-sm">
            <table className="w-full text-left bg-white dark:bg-[#0f172a] border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200 dark:border-[#1e293b]">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Brand/Model</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b] text-sm">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500 italic">Oct 24, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Yonex AS-50 (Premium)</td>
                  <td className="px-6 py-4 text-center font-mono text-[#34d399]">10 Tubes</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">$340.00</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500 italic">Oct 18, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Victor Gold No.1</td>
                  <td className="px-6 py-4 text-center font-mono text-[#34d399]">05 Tubes</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">$125.00</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500 italic">Oct 12, 2023</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">RSL Ultimate</td>
                  <td className="px-6 py-4 text-center font-mono text-[#34d399]">02 Tubes</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">$68.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-[#1e293b] px-4 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 group">
            <LayoutGrid className="text-slate-500 group-hover:text-[#34d399] transition-colors size-5" />
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-[#34d399]">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <Sword className="text-slate-500 group-hover:text-[#34d399] transition-colors size-5" />
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-[#34d399]">Sessions</span>
          </button>
          <button className="flex flex-col items-center gap-1 group text-[#34d399]">
            <div className="bg-[#34d399]/10 px-4 py-1 rounded-full flex flex-col items-center">
              <Package className="size-5" />
              <span className="text-[10px] font-black uppercase">Stock</span>
            </div>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <Wallet className="text-slate-500 group-hover:text-[#34d399] transition-colors size-5" />
            <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-[#34d399]">Payments</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
