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
  const [teamAIds, setTeamAIds] = useState<string[]>([]);
  const [teamBIds, setTeamBIds] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(19);
  const [isSearching, setIsSearching] = useState<{ active: boolean; team: 'A' | 'B' | null }>({ active: false, team: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !teamAIds.includes(p.id) && 
    !teamBIds.includes(p.id)
  );

  const handleAddPlayer = (playerId: string) => {
    if (isSearching.team === 'A') {
      setTeamAIds([...teamAIds, playerId]);
    } else if (isSearching.team === 'B') {
      setTeamBIds([...teamBIds, playerId]);
    }
    setIsSearching({ active: false, team: null });
    setSearchTerm('');
  };

  const handleRemovePlayer = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamAIds(teamAIds.filter(id => id !== playerId));
    } else {
      setTeamBIds(teamBIds.filter(id => id !== playerId));
    }
  };

  const handleConfirm = async () => {
    if (teamAIds.length === 0 || teamBIds.length === 0) {
      alert("Please select at least one player for each team.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = JSON.stringify({
        sessionId,
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
          {/* Teams Section */}
          <div className="px-6 space-y-6 pt-8">
            {/* Team A */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-black text-[#34d399] uppercase tracking-[0.2em]">Team A</span>
                <Users className="size-4 text-slate-400" />
              </div>
              <div className="space-y-3">
                {teamAIds.map(id => {
                  const player = players.find(p => p.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                      <span className="text-sm font-bold uppercase">{player?.name}</span>
                      <button onClick={() => handleRemovePlayer(id, 'A')} className="text-slate-400 hover:text-red-500">
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
                <button 
                  onClick={() => setIsSearching({ active: true, team: 'A' })}
                  className="w-full flex items-center justify-between bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left hover:border-[#34d399]/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[#34d399]/10 flex items-center justify-center group-hover:bg-[#34d399]/20 transition-colors text-[#34d399]">
                      <UserPlus className="size-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 italic uppercase">Add Player</span>
                  </div>
                  <PlusCircle className="size-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Team B */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-black text-[#34d399] uppercase tracking-[0.2em]">Team B</span>
                <Users className="size-4 text-slate-400" />
              </div>
              <div className="space-y-3">
                {teamBIds.map(id => {
                  const player = players.find(p => p.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                      <span className="text-sm font-bold uppercase">{player?.name}</span>
                      <button onClick={() => handleRemovePlayer(id, 'B')} className="text-slate-400 hover:text-red-500">
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
                <button 
                  onClick={() => setIsSearching({ active: true, team: 'B' })}
                  className="w-full flex items-center justify-between bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left hover:border-[#34d399]/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[#34d399]/10 flex items-center justify-center group-hover:bg-[#34d399]/20 transition-colors text-[#34d399]">
                      <UserPlus className="size-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 italic uppercase">Add Player</span>
                  </div>
                  <PlusCircle className="size-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Score Entry */}
          <div className="mt-10 px-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Final Score</h3>
            <div className="flex items-center justify-center gap-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] py-10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 size-32 bg-[#34d399]/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
              
              <div className="flex flex-col items-center gap-5 relative z-10">
                <button onClick={() => setScoreA(s => s + 1)} className="size-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] flex items-center justify-center hover:border-[#34d399] transition-all active:scale-90 text-[#34d399]">
                  <Plus className="size-7 font-black" />
                </button>
                <div className="text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums leading-none">{scoreA}</div>
                <button onClick={() => setScoreA(s => Math.max(0, s - 1))} className="size-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] flex items-center justify-center hover:border-red-500/50 transition-all active:scale-90 text-slate-400 hover:text-red-500/50">
                  <Minus className="size-7 font-black" />
                </button>
              </div>

              <div className="text-4xl font-black text-slate-200 dark:text-slate-800 italic relative z-10">VS</div>

              <div className="flex flex-col items-center gap-5 relative z-10">
                <button onClick={() => setScoreB(s => s + 1)} className="size-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] flex items-center justify-center hover:border-[#34d399] transition-all active:scale-90 text-[#34d399]">
                  <Plus className="size-7 font-black" />
                </button>
                <div className="text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums leading-none">{scoreB}</div>
                <button onClick={() => setScoreB(s => Math.max(0, s - 1))} className="size-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] flex items-center justify-center hover:border-red-500/50 transition-all active:scale-90 text-slate-400 hover:text-red-500/50">
                  <Minus className="size-7 font-black" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Action Area */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40">
           <div className="px-6 py-10 bg-gradient-to-t from-white dark:from-[#020617] via-white/90 dark:via-[#020617]/90 to-transparent">
              <button 
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="w-full bg-[#34d399] text-[#020617] font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#34d399]/20 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Match Result'}
              </button>
           </div>
        </div>

        {/* Search Overlay */}
        {isSearching.active && (
          <div className="fixed inset-0 bg-[#020617]/98 backdrop-blur-xl z-[60] flex flex-col p-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <Search className="text-[#34d399] size-6" />
              <input 
                autoFocus
                className="bg-transparent border-none text-2xl focus:ring-0 text-white w-full font-black uppercase placeholder:text-slate-700 italic" 
                placeholder="Find Player..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => setIsSearching({ active: false, team: null })} className="p-2 bg-slate-900 rounded-full text-slate-400">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pb-10">
              {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
                <button 
                  key={player.id} 
                  onClick={() => handleAddPlayer(player.id)}
                  className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between group active:bg-[#34d399]/10 active:border-[#34d399]/30 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                     <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-[#34d399] font-black uppercase text-xs">
                       {player.name.slice(0, 2)}
                     </div>
                     <span className="font-black text-slate-100 uppercase italic tracking-tight">{player.name}</span>
                  </div>
                  <PlusCircle className="text-slate-700 group-hover:text-[#34d399] size-6 transition-colors" />
                </button>
              )) : (
                <p className="text-center text-slate-500 py-10">No players found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
