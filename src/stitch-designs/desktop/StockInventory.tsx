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
  PlusCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/AuthContext';

interface StockStats {
  totalTubesBought: number;
  tubesLeft: number;
  usedToday: number;
}

interface ActiveTube {
  id: string;
  name: string;
  quantity: number;
  total: number;
  pricePerTube: number;
  pricePerCock: number;
  date: string;
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

import { editPurchase, deletePurchase } from '@/lib/actions/purchases';
import { DatePicker } from '@/components/DatePicker';

export default function DesktopStockInventory({ stats, activeTubes, history }: DesktopStockInventoryProps) {
  const { canEdit } = useRole();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeEditingId, setActiveEditingId] = React.useState<string | null>(null);
  const [historyEditingId, setHistoryEditingId] = React.useState<string | null>(null);

  const filteredHistory = history.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.date.includes(searchTerm)
  );
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete this purchase (${name})?`)) {
      try {
        await deletePurchase(id, currentMode);
      } catch (err) {
        alert("Failed to delete purchase");
      }
    }
  };

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
            {canEdit('purchases') && (
              <Link href={`${basePath}/purchases/add`} className="bg-[#13ec80] text-[#020617] px-6 py-2 rounded font-black text-xs tracking-tighter hover:brightness-110 transition-all uppercase shadow-lg shadow-[#13ec80]/20 border border-[#13ec80]">
                Add New Stock
              </Link>
            )}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic uppercase text-slate-100 tracking-tighter">Active Tubes</h2>
            </div>
            {canEdit('purchases') && (
              <Link 
                href={`${basePath}/purchases/add`}
                className="bg-[#13ec80] text-slate-950 font-black px-6 py-3 rounded uppercase tracking-tighter flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#13ec80]/20"
              >
                <PlusSquare className="size-5" />
                Add New Stock
              </Link>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-6 border-l-4 border-[#13ec80] border-slate-800 rounded-lg shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Tubes Bought</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-slate-100">{stats.totalTubesBought}</span>
              </div>
            </div>
            
            <div className="bg-slate-900/60 p-6 border-l-4 border-[#13ec80] border-slate-800 rounded-lg shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Tubes Left</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-slate-100">{stats.tubesLeft}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 border-l-4 border-amber-500 border-slate-800 rounded-lg shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Shuttle Used Today</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-slate-100">{stats.usedToday}</span>
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
                const isEditing = activeEditingId === tube.id;

                return (
                  <div key={tube.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl group hover:border-[#13ec80]/50 transition-colors shadow-sm relative">
                    <div className="flex justify-between items-start mb-4">
                      {isEditing ? (
                        <div className="w-full">
                          <h3 className="text-slate-100 font-bold text-lg uppercase mb-3">{tube.name}</h3>
                          <form 
                            action={async (formData) => {
                              await editPurchase(tube.id, formData);
                              setActiveEditingId(null);
                            }}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Date</label>
                                <input type="date" name="date" defaultValue={tube.date} required className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none" />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Price</label>
                                <input type="number" step="0.01" name="price" defaultValue={tube.pricePerTube} required className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none" />
                              </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Remaining Shuttles</label>
                                <input type="number" name="quantity" defaultValue={tube.quantity} max={tube.total} min={0} required className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none" />
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                               <button type="button" onClick={() => setActiveEditingId(null)} className="px-3 py-1.5 rounded text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-800">Cancel</button>
                               <button type="submit" className="px-3 py-1.5 rounded text-[10px] font-bold uppercase bg-[#13ec80] text-slate-950">Save</button>
                            </div>
                          </form>
                        </div>
                      ) : (
                         <>
                          {canEdit('purchases') && (
                            <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button 
                                onClick={() => setActiveEditingId(tube.id)}
                                className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-md text-slate-400 hover:text-white transition-colors backdrop-blur-sm"
                              >
                                <Pencil className="size-3" />
                              </button>
                              <button 
                                onClick={() => handleDelete(tube.id, tube.name)}
                                className="p-1.5 bg-slate-800/80 hover:bg-rose-500/20 rounded-md text-slate-400 hover:text-rose-400 transition-colors backdrop-blur-sm"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          )}
                          <div className={canEdit('purchases') ? "pl-16" : "pl-0"}>
                            <h3 className="text-slate-100 font-bold text-lg uppercase leading-tight">{tube.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[#13ec80] text-xs font-mono font-bold tracking-tight">RM{tube.pricePerTube.toFixed(2)}</p>
                              <span className="text-slate-600 text-[10px] px-1">•</span>
                              <p className="text-slate-400 text-[10px] font-mono tracking-tight">RM{tube.pricePerCock.toFixed(2)}/cock</p>
                            </div>
                          </div>
                          <span className={clsx(
                            "text-[10px] font-bold px-2 py-1 rounded-md uppercase ml-2 h-fit whitespace-nowrap",
                            isLow ? "bg-rose-500/10 text-rose-500" : "bg-[#13ec80]/10 text-[#13ec80]"
                          )}>
                            {isLow ? 'Low' : 'Stocked'}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="mb-2 mt-4">
                        <div className="flex justify-between text-[10px] mb-1.5 uppercase font-bold font-mono tracking-wider">
                          <span className="text-slate-500">Remaining</span>
                          <span className="text-slate-100">{tube.quantity}/{tube.total}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={clsx("h-full rounded-full", isLow ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-[#13ec80] shadow-[0_0_10px_rgba(19,236,128,0.5)]")} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}


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
                    <th className="px-6 py-4">Brand / Tube #</th>
                    <th className="px-6 py-4">Purchase Date</th>
                    <th className="px-6 py-4 text-center">Remaining</th>
                    <th className="px-6 py-4 text-right">Price/Tube</th>
                    <th className="px-6 py-4 text-right">Price/Cock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-bold">No purchase history available.</td>
                    </tr>
                  )}
                  {filteredHistory.map(item => {
                    const isEditing = historyEditingId === item.id;
                    
                    if (isEditing) {
                      return (
                        <tr key={item.id} className="bg-slate-800/30">
                          <td colSpan={6} className="p-4">
                            <form 
                              action={async (formData) => {
                                await editPurchase(item.id, formData);
                                setHistoryEditingId(null);
                              }}
                              className="flex items-center gap-4 w-full"
                            >
                              <div className="flex-1">
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date</p>
                                 <input type="date" name="date" defaultValue={item.date} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 outline-none" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Price (RM)</p>
                                 <input type="number" step="0.01" name="price" defaultValue={item.pricePerTube} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 outline-none" />
                              </div>
                              <div className="flex items-end gap-2 pt-4">
                                <button type="button" onClick={() => setHistoryEditingId(null)} className="px-4 py-2 rounded text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-800">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded text-[10px] font-bold uppercase bg-[#13ec80] text-slate-950">Save</button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-100 italic uppercase tracking-tight">
                          {item.name} <span className="text-[#13ec80]">#{item.tubeNumber}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs italic">{item.date}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={clsx(
                            "font-mono text-xs px-2 py-0.5 rounded",
                            item.remaining <= 4 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                          )}>
                            {item.remaining} / 12
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-300">RM{item.pricePerTube.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-[#13ec80]">RM{item.pricePerCock.toFixed(2)}</td>
                        {canEdit('purchases') && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-1.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white transition-colors"
                                onClick={() => setHistoryEditingId(item.id)}
                                title="Edit Record"
                              >
                                 <Pencil className="size-3.5" />
                              </button>
                              <button 
                                className="p-1.5 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-colors"
                                onClick={() => handleDelete(item.id, `${item.name} #${item.tubeNumber}`)}
                                title="Delete Record"
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
          </section>

        </div>
      </main>
    </div>
  );
}
