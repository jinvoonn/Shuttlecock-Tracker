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
  Trash
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { deletePurchase } from '@/lib/actions/purchases';

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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete this purchase (${name})?`)) {
      try {
        await deletePurchase(id);
        router.refresh();
      } catch (err) {
        alert("Failed to delete purchase");
      }
    }
  };

  return (
    <div className="bg-[#020617] font-['Inter',_sans-serif] text-slate-100 antialiased min-h-screen pb-40">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl">
        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-xl px-6 py-8 flex items-center justify-between border-b border-slate-800">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#34d399] uppercase font-['Lexend',_sans-serif]">STOCK</h1>
          <div className="flex gap-3">
            <button className="flex items-center justify-center size-10 rounded-2xl bg-slate-900 border border-slate-800 text-[#34d399] active:scale-95 transition-transform shadow-lg">
              <Search className="size-5" />
            </button>
          </div>
        </header>

        <main className="px-6 mt-10 space-y-10 text-left">
          {/* Quick Stats */}
          <section>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-2 px-2">
              <div className="flex-none w-36 p-5 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:bg-[#34d399]/10 transition-colors"></div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-500">Total Bought</p>
                <p className="text-3xl font-black font-['JetBrains_Mono',_monospace] tracking-tighter text-[#34d399]">{stats.totalTubesBought}</p>
              </div>
              <div className="flex-none w-36 p-5 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:bg-[#34d399]/10 transition-colors"></div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-500">Tubes Left</p>
                <p className="text-3xl font-black font-['JetBrains_Mono',_monospace] tracking-tighter text-slate-100">{stats.tubesLeft}</p>
              </div>
              <div className="flex-none w-36 p-5 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-16 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:bg-[#34d399]/10 transition-colors"></div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-500">Used (30d)</p>
                <p className="text-3xl font-black font-['JetBrains_Mono',_monospace] tracking-tighter text-slate-100">{stats.usedToday}</p>
              </div>
            </div>
          </section>

          {/* Active Tubes Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase font-['Lexend',_sans-serif]">Active Tubes</h2>
              <div className="flex items-center gap-2 bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1.5 rounded-full">
                <div className="size-1.5 rounded-full bg-[#34d399] animate-pulse"></div>
                <span className="text-[10px] font-black text-[#34d399] uppercase tracking-widest leading-none">In Court</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeTubes.length === 0 && <p className="text-slate-500 text-center py-4">No active tubes.</p>}
              {activeTubes.map((tube) => (
                <div key={tube.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group text-left">
                  <div className="absolute top-0 right-0 size-32 bg-[#34d399]/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-[#34d399]/10 transition-colors"></div>
                  <div className="flex items-center gap-5 mb-6 relative z-10">
                    <div className="size-14 rounded-2xl bg-[#020617] border border-slate-800 flex items-center justify-center text-[#34d399] shadow-inner">
                      {tube.quantity <= 3 ? <TrendingDown className="size-6 text-rose-400" /> : <Package className="size-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black italic tracking-tighter text-xl leading-none mb-1 font-['Lexend',_sans-serif] uppercase">{tube.name}</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Tube #{tube.id.slice(0, 4)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black font-['JetBrains_Mono',_monospace] leading-none mb-1 ${tube.quantity <= 3 ? 'text-rose-400' : 'text-[#34d399]'}`}>
                        {tube.quantity}<span className="text-xs text-slate-600">/{tube.total}</span>
                      </p>
                      <p className="text-[9px] uppercase font-black tracking-widest text-slate-600">Shuttles</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#020617] rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${tube.quantity <= 3 ? 'bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.5)]' : 'bg-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.5)]'}`} 
                      style={{ width: `${(tube.quantity / tube.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
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
                <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 flex flex-col gap-5 shadow-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-[#020617] flex items-center justify-center text-[#34d399] border border-slate-800 shadow-inner">
                        <ShoppingCart className="size-5" />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-100 uppercase italic tracking-tighter leading-none">{item.name} #{item.tubeNumber}</p>
                        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-600 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black font-['JetBrains_Mono',_monospace] text-lg text-[#13ec80] tracking-tighter">RM{item.pricePerTube.toFixed(2)}</p>
                      <p className="text-[9px] uppercase font-black tracking-widest text-slate-600">Per Tube</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-800 relative z-10">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remaining:</span>
                       <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.remaining > 0 ? 'bg-[#34d399]/10 text-[#34d399]' : 'bg-rose-500/10 text-rose-500'}`}>
                         {item.remaining} SHUTTLES
                       </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`${basePath}/purchases/edit/${item.id}`)}
                        className="size-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#13ec80] active:scale-90 transition-all"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, `${item.name} #${item.tubeNumber}`)}
                        className="size-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all"
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Action Button */}
        <Link 
          href={`${basePath}/purchases/add`}
          className="fixed bottom-32 right-8 size-16 bg-[#34d399] text-[#020617] rounded-3xl shadow-[0_20px_50px_rgba(52,211,153,0.3)] flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all border-b-4 border-[#059669]"
        >
          <Plus className="size-8 font-black" />
        </Link>
      </div>
    </div>
  );
}
