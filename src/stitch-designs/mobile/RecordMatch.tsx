"use client";

import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  ChevronRight, 
  Plus, 
  Minus, 
  LayoutGrid, 
  Activity, 
  Package, 
  Banknote,
  Search,
  X,
  PlusCircle
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
}

interface MobileRecordMatchProps {
  sessionId: string;
  players: Player[];
}

import { useState } from 'react';
import { addMatch } from "@/lib/actions/matches";
import { useRouter } from "next/navigation";

export default function MobileRecordMatch({ sessionId, players }: MobileRecordMatchProps) {
  const router = useRouter();
  const [playerTeams, setPlayerTeams] = useState<Record<string, number>>({});
  // 0 = unselected, 1 = Team A, 2 = Team B
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(19);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cycle: None (0) → Team A (1) → Team B (2) → None (0)
  const cyclePlayer = (id: string) => {
    setPlayerTeams(prev => {
      const current = prev[id] ?? 0;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  const teamAIds = Object.entries(playerTeams).filter(([, v]) => v === 1).map(([k]) => k);
  const teamBIds = Object.entries(playerTeams).filter(([, v]) => v === 2).map(([k]) => k);

  const handleConfirm = async () => {
    if (teamAIds.length === 0 || teamBIds.length === 0) {
      alert("Please select at least one player for each team.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = JSON.stringify({
        sessionId,
        teamIds: [...teamAIds, ...teamBIds], // This matches the expected backend structure for flexible teams if evolved, but let's stick to what actions expect:
        teamAIds,
        teamBIds,
        scoreA,
        scoreB
      });
      const result = await addMatch(payload);
      if (result.success) {
        router.back();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <header className="flex items-center bg-white dark:bg-[#020617] px-4 py-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => router.back()} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors active:scale-95">
            <ArrowLeft className="size-6 text-slate-900 dark:text-slate-100" />
          </button>
          <h1 className="flex-1 text-center text-xl font-black tracking-tighter uppercase italic">Log Match</h1>
          <div className="size-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto pb-48 text-left">
          {/* Header Legend */}
          <div className="px-6 py-6 flex gap-4 justify-center bg-white dark:bg-[#020617] border-b border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#13ec80]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team A</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team B</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Open</span>
             </div>
          </div>

          {/* Player Toggle Grid */}
          <div className="px-6 py-8">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Select Players</h3>
            <div className="grid grid-cols-2 gap-3">
               {players.map(player => {
                 const state = playerTeams[player.id] ?? 0;
                 const isA = state === 1;
                 const isB = state === 2;
                 return (
                   <button 
                     key={player.id}
                     onClick={() => cyclePlayer(player.id)}
                     className={`p-4 rounded-2xl border-2 transition-all active:scale-95 text-left flex items-center justify-between group h-16 ${
                       isA ? 'bg-sky-500 border-sky-500 text-white' :
                       isB ? 'bg-emerald-500 border-emerald-500 text-white' :
                       'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                     }`}
                   >
                     <span className={`text-xs font-black uppercase italic truncate pr-2 ${isA || isB ? '' : 'group-hover:text-sky-500'}`}>
                       {player.name}
                     </span>
                     <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                       isA ? 'border-white/30 bg-white/20' :
                       isB ? 'border-white/30 bg-white/20' :
                       'border-slate-200 dark:border-slate-600'
                     }`}>
                        {isA && <span className="text-[8px] font-bold text-white uppercase">A</span>}
                        {isB && <span className="text-[8px] font-bold text-white uppercase">B</span>}
                     </div>
                   </button>
                 );
               })}
            </div>
          </div>

          {/* Final Score Section */}
          <div className="mt-4 px-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Final Score</h3>
            <div className="flex items-center justify-center gap-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] py-10 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 size-48 bg-[#13ec80]/5 rounded-full -translate-y-24 translate-x-24 blur-3xl"></div>
              
               <div className="flex flex-col items-center gap-6 relative z-10 w-24">
                 <button onClick={() => setScoreA(s => s + 1)} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-[#13ec80] shadow-xl">
                   <Plus className="size-8 font-black" />
                 </button>
                 <div className="text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums leading-none italic">{scoreA}</div>
                 <button onClick={() => setScoreA(s => Math.max(0, s - 1))} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-slate-500 shadow-xl">
                   <Minus className="size-8 font-black" />
                 </button>
               </div>

               <div className="text-3xl font-black text-slate-200 dark:text-slate-800 italic relative z-10 mt-2 tracking-tighter">VS</div>

               <div className="flex flex-col items-center gap-6 relative z-10 w-24">
                 <button onClick={() => setScoreB(s => s + 1)} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-[#13ec80] shadow-xl">
                   <Plus className="size-8 font-black" />
                 </button>
                 <div className="text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums leading-none italic">{scoreB}</div>
                 <button onClick={() => setScoreB(s => Math.max(0, s - 1))} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-slate-500 shadow-xl">
                   <Minus className="size-8 font-black" />
                 </button>
               </div>
            </div>
          </div>
        </main>

        {/* Fixed Submit Button Area */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              isSubmitting 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-[#13ec80] text-[#020617] shadow-[#13ec80]/20 hover:brightness-105'
            }`}
          >
            {isSubmitting ? (
              <div className="size-5 border-2 border-[#020617]/20 border-t-[#020617] rounded-full animate-spin"></div>
            ) : (
              <PlusCircle className="size-5" />
            )}
            {isSubmitting ? 'PERSISTING...' : 'CONFIRM MATCH'}
          </button>
        </div>
      </div>
    </div>
  );
}
