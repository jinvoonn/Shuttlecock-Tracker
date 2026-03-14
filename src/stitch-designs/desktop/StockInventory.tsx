"use client";

import React from 'react';
import { 
  Activity, 
  Search,
  PlusSquare, 
  Package, 
  History, 
  LayoutDashboard,
  CalendarDays,
  Wallet, 
  PlusCircle 
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StockStats {
  totalStock: number;
  tubes: number;
  lowStock: number;
  usedToday: number;
}

interface ActiveTube {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

interface PurchaseHistory {
  id: string;
  name: string;
  tubeNumber: number;
  date: string;
  remaining: number;
  pricePerTube: number;
  pricePerCock: number;
}

interface DesktopStockInventoryProps {
  stats: StockStats;
  activeTubes: ActiveTube[];
  history: PurchaseHistory[];
}

export default function DesktopStockInventory({ stats, activeTubes, history }: DesktopStockInventoryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredHistory = history.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.date.includes(searchTerm)
  );
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

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
          <Link href={`${basePath}/purchases`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <Package className="size-5" />
            <span className="text-sm tracking-wide uppercase">STOCK</span>
          </Link>
          <Link href={`${basePath}/payments`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Wallet className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">PAYMENTS</span>
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
                placeholder="Search stock..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href={`${basePath}/add-new-stock-stitch`} className="bg-[#13ec80] text-[#020617] px-6 py-2 rounded font-black text-xs tracking-tighter hover:brightness-110 transition-all uppercase shadow-lg shadow-[#13ec80]/20 border border-[#13ec80]">
              Add New Stock
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
          {/* Hero Title & Primary Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black italic uppercase text-slate-100 tracking-tighter">Stock Inventory</h1>
              <p className="text-slate-500 mt-2 uppercase tracking-widest text-xs font-bold">Asset management & consumption tracking</p>
            </div>
            <Link 
              href={`${basePath}/add-new-stock-stitch`}
              className="bg-[#13ec80] text-slate-950 font-black px-6 py-3 rounded uppercase tracking-tighter flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#13ec80]/20"
            >
              <PlusSquare className="size-5" />
              Add New Stock
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-6 border-l-4 border-[#13ec80] border-slate-800 rounded-lg shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Tubes</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-slate-100">{stats.tubes}</span>
                <span className="text-[#13ec80] text-sm font-bold uppercase">Units</span>
              </div>
            </div>
            <div className="bg-slate-900/60 p-6 border-l-4 border-[#13ec80]/40 border-slate-800 rounded-lg shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Individual Shuttles</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-slate-100">{stats.totalStock}</span>
                <span className="text-[#13ec80] text-sm font-bold uppercase">Ready</span>
              </div>
            </div>
            <div className="bg-slate-900/60 p-6 border-l-4 border-[#13ec80]/20 border-slate-800 rounded-lg shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Used This Session</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-rose-400">{stats.usedToday}</span>
                <span className="text-rose-400 text-sm font-bold uppercase">Cocks</span>
              </div>
            </div>
          </div>

          {/* Active Stock Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="text-[#13ec80] size-6" />
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-100">Active Tubes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTubes.map(tube => {
                const percentage = (tube.quantity / tube.total) * 100;
                const isLow = percentage <= 25;

                return (
                  <div key={tube.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl group hover:border-[#13ec80]/50 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-slate-100 font-bold text-lg uppercase">{tube.name}</h3>
                        <p className="text-slate-500 text-xs uppercase font-mono">ID: {tube.id.slice(0, 8)}</p>
                      </div>
                      <span className={clsx(
                        "text-[10px] font-bold px-2 py-1 rounded uppercase",
                        isLow ? "bg-rose-500/10 text-rose-500" : "bg-[#13ec80]/10 text-[#13ec80]"
                      )}>
                        {isLow ? 'Low' : 'Stocked'}
                      </span>
                    </div>
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 uppercase">Remaining Shuttles</span>
                        <span className="text-slate-100 font-mono">{tube.quantity}/{tube.total}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={clsx("h-full", isLow ? "bg-rose-500" : "bg-[#13ec80]")} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State / Add New */}
              <Link href={`${basePath}/add-new-stock-stitch`} className="bg-[#0f172a]/30 border-2 border-dashed border-slate-800 p-5 rounded-xl flex flex-col items-center justify-center min-h-[180px] hover:border-[#13ec80]/50 cursor-pointer transition-all group shadow-sm">
                <PlusCircle className="text-slate-700 group-hover:text-[#13ec80] size-10 mb-2 transition-colors" />
                <p className="text-slate-500 font-bold uppercase text-xs group-hover:text-slate-300">Register New Tube</p>
              </Link>
            </div>
          </section>

          {/* History Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="text-[#13ec80] size-6" />
                <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-100">Purchase History</h2>
              </div>
            </div>
            <div className="overflow-hidden border border-slate-800 rounded-xl shadow-sm">
              <table className="w-full text-left bg-slate-900/60 border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-800">
                    <th className="px-6 py-4">Brand/Model (#)</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Remaining</th>
                    <th className="px-6 py-4 text-right">Price/Tube</th>
                    <th className="px-6 py-4 text-right">Price/Cock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-bold">No purchase history available.</td>
                    </tr>
                  )}
                  {filteredHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">{item.name} ({item.tubeNumber})</td>
                      <td className="px-6 py-4 font-mono text-slate-400 italic">{item.date}</td>
                      <td className="px-6 py-4 text-center font-mono text-[#13ec80]">{item.remaining} cocks</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-100">RM{item.pricePerTube.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-[#13ec80]">RM{item.pricePerCock.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
