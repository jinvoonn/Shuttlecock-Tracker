"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard,
  CalendarDays,
  Package, 
  Wallet, 
  Search,
  ChevronDown,
  Feather
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { addPurchase } from "@/lib/actions/purchases";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Brand {
  id: string;
  name: string;
}

export default function DesktopAddNewStock({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [tubeCount, setTubeCount] = useState(1);
  const [pricePerTube, setPricePerTube] = useState(28.50);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const estimatedTotal = tubeCount * pricePerTube;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("date", date);
      if (showNewBrandInput) {
        formData.append("new_brand_name", newBrandName);
      } else {
        formData.append("brand_id", selectedBrandId);
      }
      formData.append("quantity", tubeCount.toString());
      formData.append("price_per_tube", pricePerTube.toString());
      formData.append("notes", notes);

      await addPurchase(formData);
      router.push(`${basePath}/purchases`);
    } catch (error) {
      console.error(error);
      alert("Failed to log stock");
    } finally {
      setIsSubmitting(false);
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 text-sm focus:ring-1 focus:ring-[#13ec80] transition-all text-slate-200 h-10 outline-none shadow-inner cursor-not-allowed" 
                placeholder="Global Search disabled..." 
                type="text" 
                disabled
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-100 uppercase">Shuttle Tracker</p>
                <p className="text-[10px] text-[#13ec80] font-black uppercase tracking-tighter">{currentMode}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 flex-1 max-w-4xl mx-auto w-full">
          {/* Add Stock Form Section */}
          <section className="flex-1">
            <div className="mb-8">
              <h3 className="font-black italic uppercase text-3xl mb-2 text-slate-100 tracking-tighter">Add New Stock</h3>
              <p className="text-slate-500 font-medium">Register shuttlecock procurement for the current season.</p>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-xl shadow-sm">
              <form className="space-y-6" onSubmit={handleConfirm}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Date */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Purchase Date</label>
                    <div className="relative">
                      <input 
                        className="w-full font-mono bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none" 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Brand Selector */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Brand</label>
                    <div className="relative">
                      {!showNewBrandInput ? (
                        <>
                          <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none appearance-none"
                            value={selectedBrandId}
                            onChange={(e) => {
                              if (e.target.value === 'NEW') {
                                setShowNewBrandInput(true);
                              } else {
                                setSelectedBrandId(e.target.value);
                              }
                            }}
                            required
                          >
                            <option value="">Select Brand</option>
                            {brands.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                            <option value="NEW">+ Create New Brand</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 size-5" />
                        </>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none"
                            placeholder="Type new brand name..."
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            autoFocus
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowNewBrandInput(false)}
                            className="px-4 text-[10px] font-black uppercase text-rose-500 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Quantity of Tubes</label>
                    <div className="relative">
                      <input 
                        className="w-full font-mono bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none" 
                        type="number" 
                        min="1"
                        value={tubeCount}
                        onChange={(e) => setTubeCount(parseInt(e.target.value) || 1)}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 tracking-wider">TUBES</span>
                    </div>
                  </div>
                  
                  {/* Price per Tube */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Price per Tube</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-500">RM</span>
                      <input 
                        className="w-full font-mono bg-slate-950 border border-slate-800 rounded-lg p-4 pl-10 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none" 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={pricePerTube}
                        onChange={(e) => setPricePerTube(parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notes</label>
                    <textarea 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none h-24 resize-none"
                      placeholder="Special batch, supplier details, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="pt-8 border-t border-slate-800 flex justify-end gap-4 mt-8">
                  <button 
                    onClick={() => router.push(`${basePath}/purchases`)}
                    className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-100 transition-colors" 
                    type="button"
                  >
                    Discard
                  </button>
                  <button 
                    className="px-10 py-3 bg-[#13ec80] text-[#020617] font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all rounded shadow-lg shadow-[#13ec80]/20 disabled:opacity-50" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
