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
  X, 
  PlusCircle, 
  Feather,
  Scale
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  elo?: number;
  placementMatchesPlayed?: number;
}

interface MobileRecordMatchProps {
  sessionId: string;
  players: Player[];
  sessionDate: string;
}

import { useState } from 'react';
import { addMatch } from "@/lib/actions/matches";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerName from "@/components/ui/PlayerName";
import { generateBalanced2v2, GroupingPlayer } from "@/lib/analytics/autoGroup";

export default function MobileRecordMatch({ sessionId, players, sessionDate }: MobileRecordMatchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetTeamA = searchParams?.get('teamA')?.split(',').filter(Boolean);
  const presetTeamB = searchParams?.get('teamB')?.split(',').filter(Boolean);

  const [playerTeams, setPlayerTeams] = useState<Record<string, number>>(() => {
    const teams: Record<string, number> = {};
    presetTeamA?.forEach(id => { teams[id] = 1; });
    presetTeamB?.forEach(id => { teams[id] = 2; });
    return teams;
  });
  // 0 = unselected, 1 = Team A, 2 = Team B
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(19);
  const [playedAt, setPlayedAt] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-balance selected players if exactly 4 are selected
  const handleAutoBalance = () => {
    const selectedIds = Object.entries(playerTeams).filter(([, v]) => v === 1 || v === 2).map(([k]) => k);
    if (selectedIds.length !== 4) return;

    const chosen: GroupingPlayer[] = players
      .filter(p => selectedIds.includes(p.id))
      .map(p => ({ id: p.id, name: p.name, elo: p.elo ?? 1200, placementMatchesPlayed: p.placementMatchesPlayed }));

    const recommendations = generateBalanced2v2(chosen);
    if (recommendations.length > 0) {
      const best = recommendations[0];
      const newTeams: Record<string, number> = {};
      best.teamA.forEach(p => { newTeams[p.id] = 1; });
      best.teamB.forEach(p => { newTeams[p.id] = 2; });
      setPlayerTeams(newTeams);
    }
  };

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
      const [hours, minutes] = playedAt.split(':');
      const timeDate = new Date(`${sessionDate}T00:00:00`);
      timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const isoPlayedAt = timeDate.toISOString(); 

      const payload = JSON.stringify({
        sessionId,
        teamIds: [...teamAIds, ...teamBIds], 
        teamAIds,
        teamBIds,
        scoreA,
        scoreB,
        playedAt: isoPlayedAt
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
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl pb-24">
        {/* Header */}
        <header className="sticky top-0 z-20 flex flex-col items-center justify-center px-6 py-5 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Feather className="size-5 text-white transform rotate-45" />
            </div>
            <h1 className="text-2xl font-black text-slate-50 tracking-tighter">
              Cock<span className="text-sky-400">Count</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
             Because Shuttlecocks Aren't Free
          </p>
          <button onClick={() => router.back()} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-xl bg-slate-800 border border-slate-700 transition-all active:scale-95 shadow-sm overflow-hidden">
            <ArrowLeft className="size-5 text-slate-100" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-48 text-left">
          {/* Header Legend */}
          <div className="px-6 py-6 flex gap-4 justify-center bg-slate-900 border-b border-slate-800">
             <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team A</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-sky-500"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team B</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-slate-700"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Open</span>
             </div>
          </div>

          {/* Player Toggle Grid */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-4 ml-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Players</h3>
              {Object.values(playerTeams).filter(v => v === 1 || v === 2).length === 4 && (
                <button
                  type="button"
                  onClick={handleAutoBalance}
                  className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 active:scale-95 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Scale className="size-3.5" />
                  Auto-Balance 2v2
                </button>
              )}
            </div>
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
                       isA ? 'bg-emerald-400 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20' :
                       isB ? 'bg-sky-400 border-sky-400 text-slate-950 shadow-lg shadow-sky-400/20' :
                       'bg-slate-800 border-slate-700 text-slate-300'
                     }`}
                   >
                     <div className={`pr-2 overflow-hidden ${isA || isB ? 'text-slate-950' : ''}`}>
                       <PlayerName 
                         name={player.name} 
                         elo={player.elo || 1200} 
                         showRankName={false} 
                         nameClassName="text-xs font-black"
                       />
                     </div>
                     <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                       isA ? 'border-white/30 bg-white/20' :
                       isB ? 'border-white/30 bg-white/20' :
                       'border-slate-700'
                     }`}>
                        {isA && <span className="text-[8px] font-bold text-white uppercase">A</span>}
                        {isB && <span className="text-[8px] font-bold text-white uppercase">B</span>}
                     </div>
                   </button>
                 );
               })}
            </div>
          </div>

          {/* Match Time Section */}
          <div className="mt-8 px-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Match Time</h3>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg">
              <input 
                type="time" 
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 font-bold focus:border-emerald-400/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Final Score Section */}
          <div className="mt-8 px-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Final Score</h3>
            <div className="flex items-center justify-center gap-6 bg-slate-800 border border-slate-700 rounded-[2.5rem] py-10 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 size-48 bg-emerald-400/5 rounded-full -translate-y-24 translate-x-24 blur-3xl"></div>
              
               <div className="flex flex-col items-center gap-6 relative z-10 w-24">
                 <button onClick={() => setScoreA(s => s + 1)} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-emerald-400 shadow-xl">
                   <Plus className="size-8 font-black" />
                 </button>
                 <div className="text-7xl font-black text-slate-100 font-mono tracking-tighter tabular-nums leading-none italic">{scoreA}</div>
                 <button onClick={() => setScoreA(s => Math.max(0, s - 1))} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-slate-500 shadow-xl">
                   <Minus className="size-8 font-black" />
                 </button>
               </div>

               <div className="text-3xl font-black text-slate-700 italic relative z-10 mt-2 tracking-tighter">VS</div>

               <div className="flex flex-col items-center gap-6 relative z-10 w-24">
                 <button onClick={() => setScoreB(s => s + 1)} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-emerald-400 shadow-xl">
                   <Plus className="size-8 font-black" />
                 </button>
                 <div className="text-7xl font-black text-slate-100 font-mono tracking-tighter tabular-nums leading-none italic">{scoreB}</div>
                 <button onClick={() => setScoreB(s => Math.max(0, s - 1))} className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center active:scale-90 transition-transform text-slate-500 shadow-xl">
                   <Minus className="size-8 font-black" />
                 </button>
               </div>
            </div>
          </div>
        </main>

        {/* Fixed Submit Button Area */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              isSubmitting 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-400 text-slate-950 shadow-emerald-400/20 hover:brightness-105'
            }`}
          >
            {isSubmitting ? (
              <div className="size-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
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
