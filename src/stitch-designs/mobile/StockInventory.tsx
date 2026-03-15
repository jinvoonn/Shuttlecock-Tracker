"use client";

import React from 'react';
import { 
  Search, 
  Package, 
  Plus, 
  Trash2,
  Edit2,
  ShoppingCart,
  TrendingDown,
  ChevronRight,
  Pencil,
  Trash,
  LayoutGrid,
  History as HistoryIcon,
  Banknote
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { editPurchase, deletePurchase } from '@/lib/actions/purchases';
import { useRole } from '@/context/AuthContext';
import { useState } from 'react';
import { DatePicker } from '@/components/DatePicker';

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
}

interface MobileStockInventoryProps {
  stats: StockStats;
  activeTubes: ActiveTube[];
  history: PurchaseHistory[];
}

export default function MobileStockInventory({ stats, activeTubes, history }: MobileStockInventoryProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const { canEdit } = useRole();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete this purchase (${name})?`)) {
      try {
        await deletePurchase(id, currentMode);
        router.refresh();
      } catch (err) {
        alert("Failed to delete purchase");
      }
    }
  };

  return (
    <div className="bg-slate-900 font-['Inter',_sans-serif] text-slate-100 antialiased min-h-screen pb-40">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl">
        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl px-6 py-8 flex items-center justify-between border-b border-slate-800">
          <h1 className="text-4xl font-black italic tracking-tighter text-emerald-400 uppercase font-['Lexend',_sans-serif]">STOCK</h1>
          <div className="flex gap-3">
            <button className="flex items-center justify-center size-10 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 active:scale-95 transition-transform shadow-lg">
              <Search className="size-5" />
            </button>
          </div>
        </header>

        <main className="px-6 mt-10 space-y-10 text-left">
          {/* Quick Stats */}
          <section>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-2 px-2">
              <div className="flex-none w-36 p-5 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:bg-emerald-400/10 transition-colors"></div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-500">Total Bought</p>
                <p className="text-3xl font-black font-['JetBrains_Mono',_monospace] tracking-tighter text-emerald-400">{stats.totalTubesBought}</p>
              </div>
              <div className="flex-none w-36 p-5 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:bg-emerald-400/10 transition-colors"></div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-500">Tubes Left</p>
                <p className="text-3xl font-black font-['JetBrains_Mono',_monospace] tracking-tighter text-slate-100">{stats.tubesLeft}</p>
              </div>
              <div className="flex-none w-36 p-5 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:bg-emerald-400/10 transition-colors"></div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-500">Used (30d)</p>
                <p className="text-3xl font-black font-['JetBrains_Mono',_monospace] tracking-tighter text-slate-100">{stats.usedToday}</p>
              </div>
            </div>
          </section>

          {/* Active Tubes Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase font-['Lexend',_sans-serif]">Active Tubes</h2>
              <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">In Court</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeTubes.length === 0 && <p className="text-slate-500 text-center py-4">No active tubes.</p>}
              {activeTubes.map((tube) => {
                const isEditing = activeEditingId === tube.id;

                return (
                  <div key={tube.id} className="bg-slate-800 p-6 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden group text-left">
                    <div className="absolute top-0 right-0 size-32 bg-emerald-400/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-emerald-400/10 transition-colors"></div>
                    
                    {isEditing ? (
                      <div className="relative z-10 w-full animate-in fade-in slide-in-from-top-1 duration-200">
                        <h3 className="font-black italic tracking-tighter text-xl leading-none mb-4 font-['Lexend',_sans-serif] uppercase">{tube.name}</h3>
                        <form action={async (formData) => {
                          await editPurchase(tube.id, formData, currentMode);
                          setActiveEditingId(null);
                          router.refresh();
                        }} className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Date</p>
                              <DatePicker name="date" defaultValue={tube.date} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Price</p>
                                <input 
                                  type="number" 
                                  name="price" 
                                  step="0.01"
                                  defaultValue={tube.pricePerTube}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-400/20 outline-none" 
                                />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Remaining</p>
                                <input 
                                  type="number" 
                                  name="quantity" 
                                  defaultValue={tube.quantity}
                                  max={tube.total}
                                  min={0}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-400/20 outline-none" 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => setActiveEditingId(null)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-700 transition-all">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">Save</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        {canEdit('purchases') && (
                          <div className="absolute top-0 left-0 flex gap-2">
                            <button 
                              onClick={() => setActiveEditingId(tube.id)}
                              className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 active:scale-90 transition-all shadow-inner"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(tube.id, tube.name)}
                              className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all shadow-inner"
                            >
                              <Trash className="size-4" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-5 mb-6 pt-14">
                          <div className="flex-1">
                            <h3 className="font-black italic tracking-tighter text-xl leading-none mb-1 font-['Lexend',_sans-serif] uppercase">{tube.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-emerald-400 text-xs font-mono font-black tracking-tight">RM{tube.pricePerTube.toFixed(2)}</p>
                              <span className="text-slate-600 text-[10px] px-1">•</span>
                              <p className="text-slate-400 text-[10px] font-mono tracking-tight">RM{tube.pricePerCock.toFixed(2)}/cock</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-black font-['JetBrains_Mono',_monospace] leading-none mb-1 ${tube.quantity <= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {tube.quantity}<span className="text-xs text-slate-600">/{tube.total}</span>
                            </p>
                            <p className="text-[9px] uppercase font-black tracking-widest text-slate-600">Shuttles</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${tube.quantity <= 3 ? 'bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.5)]' : 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'}`} 
                            style={{ width: `${(tube.quantity / tube.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Purchase History Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase font-['Lexend',_sans-serif]">History</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {history.length === 0 && <p className="text-slate-500 py-6 text-center">No history found.</p>}
              {history.map((item) => (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-[2.5rem] p-6 flex flex-col gap-5 shadow-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 border border-slate-800 shadow-inner">
                        <ShoppingCart className="size-5" />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-100 uppercase italic tracking-tighter leading-none">{item.name} #{item.tubeNumber}</p>
                        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-600 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black font-['JetBrains_Mono',_monospace] text-lg text-emerald-400 tracking-tighter">RM{item.pricePerTube.toFixed(2)}</p>
                      <p className="text-[9px] uppercase font-black tracking-widest text-slate-600">Per Tube</p>
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <div className="pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
                      <form action={async (formData) => {
                        await editPurchase(item.id, formData, currentMode);
                        setEditingId(null);
                        router.refresh();
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Purchase Date</p>
                            <DatePicker name="date" defaultValue={item.date} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 text-left">Price (RM)</p>
                            <input 
                              type="number" 
                              name="price" 
                              step="0.01"
                              defaultValue={item.pricePerTube}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-400/20 outline-none" 
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
                    <div className="flex items-center justify-between pt-5 border-t border-slate-700 relative z-10 text-left">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remaining:</span>
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.remaining > 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>
                           {item.remaining} SHUTTLES
                         </span>
                      </div>
                      
                      {canEdit('purchases') && (
                        <div className="flex gap-2 text-left">
                          <button 
                            onClick={() => setEditingId(item.id)}
                            className="size-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 active:scale-90 transition-all"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, `${item.name} #${item.tubeNumber}`)}
                            className="size-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all"
                          >
                            <Trash className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>

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
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-emerald-400 relative group">
              <Package className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/payments`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <Banknote className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
