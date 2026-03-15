"use client";

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Settings, 
  Package, 
  Minus, 
  Plus, 
  Search, 
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { addSession, editSession } from "@/lib/actions/sessions";
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tube {
  id: string;
  brand: string;
  model: string;
  price_per_cock: number;
}

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface DesktopLogSessionsProps {
  tubes: Tube[];
  players: Player[];
  initialData?: {
    id: string;
    date: string;
    location: string;
    notes: string;
    playerIds: string[];
    usage: { purchaseId: string; quantityUsed: number }[];
  };
}

export default function DesktopSessions({ tubes, players, initialData }: DesktopLogSessionsProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  const isEdit = !!initialData;

  const [selectedTubeId, setSelectedTubeId] = useState<string | null>(
    initialData?.usage[0]?.purchaseId || tubes[0]?.id || null
  );
  const [shuttlesUsed, setShuttlesUsed] = useState(initialData?.usage[0]?.quantityUsed || 0);
  const [attendeeIds, setAttendeeIds] = useState<Set<string>>(new Set(initialData?.playerIds || []));
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

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreateSession = async () => {
    if (!selectedTubeId) {
      alert("Please select a shuttle tube");
      return;
    }
    if (shuttlesUsed <= 0) {
      alert("Please enter shutting used > 0");
      return;
    }
    if (attendeeIds.size === 0) {
      alert("Please select at least 1 attendee");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = JSON.stringify({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        location: initialData?.location || "Main Court",
        notes: initialData?.notes || "Stitch UI Session",
        playerIds: Array.from(attendeeIds),
        newPlayerNames: [],
        usage: [
          {
            purchaseId: selectedTubeId,
            quantityUsed: shuttlesUsed
          }
        ]
      });
      
      if (isEdit) {
        await editSession(initialData.id, payload);
      } else {
        await addSession(payload);
      }
      
      router.push(`${basePath}/sessions`);
      router.refresh();
    } catch (e: unknown) {
      const err = e as Error;
      alert("An unexpected error occurred: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pb-32 pt-8">
        {/* Header Section */}
        <header className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-[#1e293b] mb-8">
          <div className="flex items-center gap-4">
            <Link href={`${basePath}/sessions`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden lg:block">
              <ArrowLeft className="size-6 text-slate-400" />
            </Link>
            <PlusCircle className="text-[#13ec80] size-8" />
            <h1 className="text-3xl font-black italic tracking-tighter uppercase dark:text-slate-100">
              {isEdit ? "EDIT SESSION" : "LOG NEW SESSION"}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-10">
            {/* Section: Shuttle Selection */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase italic">01. Select Shuttle Tube</h2>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {tubes.length === 0 && (
                  <p className="text-slate-500 text-sm">No active tubes found. Please register stock first.</p>
                )}
                {tubes.map(tube => {
                  const isSelected = selectedTubeId === tube.id;
                  return (
                    <div 
                      key={tube.id}
                      onClick={() => setSelectedTubeId(tube.id)}
                      className={clsx(
                        "min-w-[200px] p-4 cursor-pointer snap-start relative group rounded-lg shadow-sm transition-all border-2",
                        isSelected 
                          ? "bg-white dark:bg-[#0f172a] border-[#13ec80]" 
                          : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-[#1e293b] hover:border-slate-400 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                          <Package className={clsx("size-6", isSelected ? "text-[#13ec80]" : "text-slate-500")} />
                        </div>
                        {isSelected && (
                          <span className="bg-[#13ec80]/10 text-[#13ec80] text-[10px] px-2 py-1 font-bold rounded">SELECTED</span>
                        )}
                      </div>
                      <h3 className={clsx("font-bold text-base", isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                        {tube.brand} {tube.model}
                      </h3>
                      <p className="text-slate-500 text-xs">RM{tube.price_per_cock.toFixed(2)}/cock</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: Usage Tracker */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase italic">02. Shuttles Used</h2>
              </div>
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-8 flex flex-col items-center justify-center gap-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-12">
                  <button 
                    onClick={() => setShuttlesUsed(Math.max(0, shuttlesUsed - 1))}
                    className="w-16 h-16 rounded-full border border-slate-200 dark:border-[#1e293b] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="text-3xl size-8" />
                  </button>
                  <div className="text-8xl font-mono font-bold text-[#13ec80] tabular-nums tracking-tighter w-32 text-center">
                    {shuttlesUsed.toString().padStart(2, '0')}
                  </div>
                  <button 
                    onClick={() => setShuttlesUsed(shuttlesUsed + 1)}
                    className="w-16 h-16 rounded-full border border-slate-200 dark:border-[#1e293b] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="text-[#13ec80] size-8" />
                  </button>
                </div>
                <p className="text-slate-500 uppercase text-[10px] tracking-[0.2em] font-bold">Total quantity used</p>
              </div>
            </section>

            {/* Section: Attendee Selection */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase italic">03. Attendees</h2>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                  <input 
                    className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-[#1e293b] text-[10px] pl-8 pr-4 py-1.5 focus:ring-1 focus:ring-[#13ec80] w-40 placeholder:text-slate-600 font-bold uppercase tracking-wider outline-none rounded" 
                    placeholder="SEARCH PLAYERS..." 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-[#1e293b] p-4 max-h-[400px] overflow-y-auto rounded-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredPlayers.map(player => {
                    const isSelected = attendeeIds.has(player.id);
                    const initial = player.name.charAt(0).toUpperCase();

                    return (
                      <div 
                        key={player.id}
                        onClick={() => toggleAttendee(player.id)}
                        className={clsx(
                          "p-3 flex flex-col items-center gap-2 cursor-pointer transition-all rounded shadow-sm",
                          isSelected 
                            ? "bg-[#13ec80] border border-[#13ec80]" 
                            : "bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] hover:border-[#13ec80]/50"
                        )}
                      >
                        <div className={clsx(
                          "size-12 rounded-full flex items-center justify-center font-black text-lg",
                          isSelected 
                            ? "border-2 border-slate-950 bg-slate-950 text-[#13ec80]" 
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        )}>
                          {initial}
                        </div>
                        <span className={clsx(
                          "text-[10px] font-bold uppercase text-center w-full truncate",
                          isSelected ? "text-slate-950" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {player.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Live Calculation (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white dark:bg-[#0f172a] border-l-4 border-l-[#13ec80] border border-slate-200 dark:border-[#1e293b] p-6 shadow-xl rounded-r-lg">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 italic">Live Session Summary</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-xs font-medium uppercase">Total Cost</span>
                    <span className="text-3xl font-mono font-bold text-[#13ec80] tracking-tighter">RM{totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
                    <span className="text-slate-400 text-xs font-medium uppercase">Cost Per Person</span>
                    <span className="text-3xl font-mono font-bold text-[#13ec80] tracking-tighter">RM{perPlayerCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">Shuttles ({shuttlesUsed})</span>
                    <span className="text-slate-700 dark:text-slate-300">RM{totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">Attendees</span>
                    <span className="text-slate-700 dark:text-slate-300">{attendeeIds.size} Players</span>
                  </div>
                </div>
                <button 
                  onClick={handleCreateSession}
                  disabled={isSubmitting || shuttlesUsed === 0 || attendeeIds.size === 0}
                  className="w-full mt-8 bg-[#13ec80] disabled:bg-slate-300 dark:disabled:bg-slate-800 hover:bg-[#13ec80]/90 text-slate-950 font-black py-4 rounded uppercase tracking-tighter transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#13ec80]/20 disabled:shadow-none"
                >
                  <span>{isSubmitting ? 'Finalizing...' : isEdit ? 'Update Session' : 'Finalize Session'}</span>
                  <Zap className="size-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
