"use client";

import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Minus, 
  Plus, 
  Search, 
  LayoutGrid, 
  History, 
  Package, 
  Banknote,
  Clock
} from 'lucide-react';

import { useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { addSession } from "@/lib/actions/sessions";

interface Tube {
  id: string;
  brand: string;
  model: string;
  price_per_tube: number;
  price_per_cock: number;
}

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface MobileLogSessionsProps {
  tubes: Tube[];
  players: Player[];
}

export default function MobileLogSessions({ tubes, players }: MobileLogSessionsProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [selectedTubeId, setSelectedTubeId] = useState<string | null>(tubes[0]?.id || null);
  const [shuttlesUsed, setShuttlesUsed] = useState(0);
  const [attendeeIds, setAttendeeIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTube = tubes.find(t => t.id === selectedTubeId);
  const pricePerCock = selectedTube?.price_per_cock || 0;
  const totalCost = shuttlesUsed * pricePerCock;
  const perPlayerCost = attendeeIds.size > 0 ? totalCost / attendeeIds.size : 0;

  const toggleAttendee = (id: string) => {
    const next = new Set(attendeeIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setAttendeeIds(next);
  };

  const handleSubmit = async () => {
    if (!selectedTubeId || attendeeIds.size === 0) {
      alert("Please select a tube and at least one attendee");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date: new Date().toISOString().split('T')[0],
        location: "Default Court",
        notes: "Stitch UI Session",
        playerIds: Array.from(attendeeIds),
        newPlayerNames: [],
        usage: [
          {
            purchaseId: selectedTubeId,
            quantityUsed: shuttlesUsed
          }
        ]
      };

      await addSession(JSON.stringify(payload));
      router.push('/view/sessions-stitch');
    } catch (error) {
      console.error(error);
      alert("Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 min-h-screen flex flex-col antialiased pb-48">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl bg-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-emerald-400/20 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="text-emerald-400 size-6" />
            </button>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Log Session</h1>
          </div>
          <div className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">Live</div>
        </header>

        <main className="p-4 space-y-8 flex-1 text-left">
          {/* Shuttle Tube Selector */}
          <section>
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 px-1">Select Shuttle Tube</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
              {tubes.length === 0 && <p className="text-slate-500 text-xs px-1">No tubes available. Please buy stock first.</p>}
              {tubes.map((tube) => {
                const isSelected = selectedTubeId === tube.id;
                return (
                  <button 
                    key={tube.id}
                    onClick={() => setSelectedTubeId(tube.id)}
                    className={`flex-none w-[75vw] p-5 rounded-2xl flex flex-col gap-3 snap-center shadow-xl transition-all text-left h-auto min-h-[144px] ${isSelected ? 'bg-emerald-400 text-slate-950 ring-8 ring-emerald-400/10' : 'bg-slate-800 border-2 border-slate-700 text-slate-100'}`}
                  >
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                            <span className="block text-lg font-black leading-tight uppercase line-clamp-1">{tube.brand}</span>
                            <span className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isSelected ? 'opacity-80 text-[#0a130e]/60' : ''}`}>{tube.model}</span>
                        </div>
                        {isSelected ? <CheckCircle2 className="size-8 shrink-0" /> : <Circle className="size-8 opacity-20 text-slate-400 shrink-0" />}
                    </div>
                    
                    <div className={`mt-auto pt-3 border-t ${isSelected ? 'border-slate-950/10' : 'border-slate-700'} flex flex-col gap-0.5`}>
                      <span className={`text-base font-black tracking-tight ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`}>
                          RM{tube.price_per_tube?.toFixed(2) || '0.00'} <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">/ tube</span>
                      </span>
                      <span className={`text-xs font-mono font-bold tracking-tight ${isSelected ? 'opacity-70' : 'text-slate-400'}`}>
                          RM{tube.price_per_cock.toFixed(2)} <span className="text-[8px] uppercase font-bold tracking-widest opacity-80">/ cock</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Shuttle Counter */}
          <section className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-emerald-400/5 dark:bg-emerald-400/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 text-center relative z-10">Shuttle Counter</h2>
            <div className="flex items-center justify-between gap-4 relative z-10">
              <button 
                onClick={() => setShuttlesUsed(Math.max(0, shuttlesUsed - 1))}
                className="size-16 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 flex items-center justify-center rounded-2xl active:scale-90 transition-all shadow-sm"
              >
                <Minus className="size-8 font-black text-slate-400" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-8xl font-black text-slate-100 font-mono tracking-tighter tabular-nums">{shuttlesUsed.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Shuttles Used</span>
              </div>
              <button 
                onClick={() => setShuttlesUsed(shuttlesUsed + 1)}
                className="size-16 bg-emerald-400 flex items-center justify-center rounded-2xl active:scale-90 transition-all shadow-lg shadow-emerald-400/30 group"
              >
                <Plus className="size-8 font-black text-slate-950 group-active:scale-110" />
              </button>
            </div>
          </section>

          {/* Attendee List Section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Attendees ({attendeeIds.size}/{players.length})</h2>
              <button className="text-[10px] font-black text-emerald-400 border-2 border-emerald-400 px-3 py-1 rounded-lg uppercase tracking-[0.15em] active:scale-95 transition-transform" onClick={() => router.push(`${basePath}/payments/record-transaction`)}>ADD PAYMENT</button>
            </div>
            
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5 transition-colors group-focus-within:text-emerald-400" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-slate-600 text-slate-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/5 transition-all outline-none shadow-sm" 
                placeholder="Search players..." 
                type="text" 
              />
            </div>

            {/* Scrollable Player List */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
              {filteredPlayers.length === 0 && <p className="text-slate-500 text-center py-4 text-xs">No players found.</p>}
              {filteredPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-4 bg-white dark:bg-[#0f172a] border-2 rounded-2xl transition-all shadow-sm cursor-pointer ${attendeeIds.has(player.id) ? 'border-[#13ec80]' : 'border-slate-100 dark:border-slate-800 hover:border-[#13ec80]/30'}`}
                  onClick={() => toggleAttendee(player.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full border-2 border-slate-100 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                      {player.avatar ? (
                        <img alt={player.name} className="rounded-full w-full h-full object-cover" src={player.avatar} />
                      ) : (
                        <span className="text-slate-400 font-black italic">{player.name[0]}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm uppercase text-slate-900 dark:text-slate-100">{player.name}</p>
                      <p className={`text-[10px] uppercase font-black tracking-widest leading-none mt-1 ${attendeeIds.has(player.id) ? 'text-[#13ec80]' : 'text-slate-400 dark:text-slate-500'}`}>
                        {attendeeIds.has(player.id) ? 'Attending' : 'Not Attending'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                    <input checked={attendeeIds.has(player.id)} readOnly className="sr-only peer" type="checkbox" />
                    <div className="w-12 h-7 bg-slate-700 rounded-full peer peer-checked:bg-emerald-400 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[19px] after:w-[19px] after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Bottom Navigation Area */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          {/* Summary Bar */}
          <div className="bg-emerald-400 px-6 py-5 flex items-center justify-between text-slate-950 shadow-[0_-12px_40px_rgba(0,0,0,0.3)]">
            <div className="flex gap-10">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">Total</span>
                <span className="text-2xl font-black font-mono tracking-tighter tabular-nums mt-1">RM{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">Per Player</span>
                <span className="text-2xl font-black font-mono tracking-tighter tabular-nums mt-1">RM{perPlayerCost.toFixed(2)}</span>
              </div>
            </div>
            <button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg hover:brightness-110 ${isSubmitting ? 'bg-slate-800 text-slate-500' : 'bg-slate-950 text-emerald-400'}`}
            >
              {isSubmitting ? 'Wait...' : 'SUBMIT'}
            </button>
          </div>
          
          {/* Bottom Nav */}
          <nav className="flex bg-slate-900 border-t border-slate-800 px-2 pb-8 pt-4 shadow-xl">
            <button onClick={() => router.push(basePath)} className="flex flex-1 flex-col items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-colors group">
              <LayoutGrid className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Dash</span>
            </button>
            <button className="flex flex-1 flex-col items-center gap-1.5 text-emerald-400 transition-colors group">
              <History className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Sessions</span>
            </button>
            <button onClick={() => router.push(`${basePath}/purchases`)} className="flex flex-1 flex-col items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-colors group">
              <Package className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Stock</span>
            </button>
            <button onClick={() => router.push(`${basePath}/payments`)} className="flex flex-1 flex-col items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-colors group">
              <Banknote className="size-6 transition-transform group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Payments</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
