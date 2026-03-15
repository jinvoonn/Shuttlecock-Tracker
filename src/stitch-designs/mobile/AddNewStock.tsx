"use client";

import React from 'react';
import { 
  ArrowLeft, 
  Award, 
  Star, 
  Zap, 
  Activity, 
  Minus, 
  Plus, 
  Calendar, 
  LayoutGrid, 
  History, 
  Package, 
  Banknote,
  DollarSign
} from 'lucide-react';

import { useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { addPurchase } from "@/lib/actions/purchases";

interface Brand {
  id: string;
  name: string;
}

export default function MobileAddNewStock({ brands: serverBrands }: { brands: Brand[] }) {
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

  const handleConfirm = async () => {
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
      router.push('/view/purchases');
    } catch (error) {
      console.error(error);
      alert("Failed to log stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const brands = [
    { name: 'YONEX', icon: Award },
    { name: 'VICTOR', icon: Star },
    { name: 'LI-NING', icon: Zap },
    { name: 'RSL', icon: Activity },
  ];

  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl bg-slate-900">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-emerald-400/10 bg-slate-900 sticky top-0 z-30 text-left">
          <button onClick={() => router.back()} className="flex items-center justify-center size-10 rounded-xl bg-slate-800 border border-slate-700 transition-all active:scale-95 shadow-sm">
            <ArrowLeft className="size-5 text-slate-100" />
          </button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-emerald-400">Add New Stock</h1>
          <div className="size-10"></div>
        </header>

        <main className="flex-1 p-6 space-y-10 pb-40 text-left">
          {/* Brand Selection Section */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Brand Selection</h2>
            <div className="grid grid-cols-2 gap-3">
              {serverBrands.map((brand) => (
                <button 
                  key={brand.id}
                  onClick={() => {
                    setSelectedBrandId(brand.id);
                    setShowNewBrandInput(false);
                  }}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all active:scale-95 ${selectedBrandId === brand.id && !showNewBrandInput ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-500'}`}
                >
                  <Package className="size-8 mb-2" />
                  <span className="text-[10px] font-black tracking-widest uppercase italic">{brand.name}</span>
                </button>
              ))}
              <button 
                onClick={() => setShowNewBrandInput(true)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all active:scale-95 ${showNewBrandInput ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-500'}`}
              >
                <Plus className="size-8 mb-2" />
                <span className="text-[10px] font-black tracking-widest uppercase italic">New Brand</span>
              </button>
            </div>

            {showNewBrandInput && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                <input 
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-slate-100 font-mono focus:border-emerald-400 outline-none transition-all"
                  placeholder="Enter brand name..."
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </section>

          {/* Tube Count Stepper */}
          <section className="space-y-5 p-8 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 size-32 bg-emerald-400/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 relative z-10">Tube Count</h2>
            <div className="flex items-center justify-between gap-6 relative z-10">
              <button 
                onClick={() => setTubeCount(Math.max(1, tubeCount - 1))}
                className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center active:scale-90 transition-all border border-slate-700 text-slate-500"
              >
                <Minus className="size-8 font-black" />
              </button>
              <div className="flex-1 text-center">
                <span className="font-mono text-7xl font-black text-white tracking-tighter tabular-nums leading-none">{tubeCount}</span>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2 italic">Tubes</p>
              </div>
              <button 
                onClick={() => setTubeCount(tubeCount + 1)}
                className="size-16 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-emerald-400/20"
              >
                <Plus className="size-8 font-black" />
              </button>
            </div>
          </section>

          {/* Price Input */}
          <section className="space-y-5 p-8 rounded-[2rem] bg-slate-800 border border-slate-700 shadow-xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Price per Tube</h2>
            <div className="relative flex items-center group">
              <DollarSign className="absolute left-4 size-6 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                value={pricePerTube}
                onChange={(e) => setPricePerTube(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border-none rounded-2xl font-mono text-5xl py-8 pl-14 text-right focus:ring-4 focus:ring-emerald-400/20 text-white transition-all shadow-inner outline-none" 
                placeholder="0.00" 
                type="number" 
              />
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">Estimated Total</span>
              <span className="font-mono text-2xl text-emerald-400 font-black tracking-tighter italic">${estimatedTotal.toFixed(2)}</span>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-4 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Notes</h2>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 text-slate-100 min-h-[100px] focus:ring-1 focus:ring-emerald-400 outline-none"
              placeholder="Batch details, vendor, etc."
            />
          </section>

          {/* Purchase Date */}
          <section className="space-y-4 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Purchase Date</h2>
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg group">
              <Calendar className="text-emerald-400 size-6 group-focus-within:scale-110 transition-transform" />
              <input 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-slate-100 font-mono text-lg w-full focus:ring-0 uppercase tracking-tighter" 
                type="date" 
              />
            </div>
          </section>

          {/* Main Action */}
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-full font-black italic uppercase text-lg tracking-[0.1em] py-6 rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.2)] active:translate-y-1 active:shadow-none transition-all hover:brightness-110 ${isSubmitting ? 'bg-slate-800 text-slate-500' : 'bg-emerald-400 text-slate-950'}`}
          >
            {isSubmitting ? 'Wait...' : 'Confirm & Log Stock'}
          </button>
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
              <History className="size-6 group-active:scale-90" />
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
