"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet, 
  Search, 
  PlusCircle, 
  CheckCircle2,
  X,
  Users
} from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import { addMatch } from "@/lib/actions/matches";
import clsx from 'clsx';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
}

interface DesktopRecordMatchProps {
  sessionId: string;
  players: Player[];
}

export default function DesktopRecordMatch({ sessionId, players }: DesktopRecordMatchProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  const [teamAIds, setTeamAIds] = useState<string[]>([]);
  const [teamBIds, setTeamBIds] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(19);
  const [matchType, setMatchType] = useState("Men's Doubles");
  const [court, setCourt] = useState("1");
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
      alert("Both teams require at least 1 player.");
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
        router.push(`${basePath}/sessions/${sessionId}`);
        router.refresh();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to record match");
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
          <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <CalendarDays className="size-5" />
            <span className="text-sm tracking-wide uppercase">SESSIONS</span>
          </Link>
          <Link href={`${basePath}/purchases`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Package className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">STOCK</span>
          </Link>
          <Link href={`${basePath}/payments`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Wallet className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">PAYMENTS</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex flex-col overflow-y-auto">
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
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-100 uppercase">Shuttle Tracker</p>
              <p className="text-[10px] text-[#13ec80] font-black uppercase tracking-tighter">{currentMode}</p>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 w-full max-w-6xl mx-auto flex-1">
          {/* Header Section */}
          <header className="mb-10 flex justify-between items-end border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-5xl font-black italic text-slate-100 uppercase tracking-tighter leading-none mb-2">Log Match Result</h2>
              <div className="flex items-center gap-2 text-[#13ec80] font-medium">
                <CalendarDays className="size-4" />
                <span className="text-sm uppercase tracking-widest font-bold text-slate-500">Session • {sessionId.slice(0, 8)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href={`${basePath}/sessions/${sessionId}`} className="px-6 py-3 border border-slate-800 text-sm font-bold text-slate-400 hover:text-slate-100 rounded-lg uppercase tracking-wider transition-colors">Discard</Link>
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#13ec80] text-[#020617] text-sm font-black rounded-lg uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-[#13ec80]/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Match Result'}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Settings */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
              {/* Match Type */}
              <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Match Type Selection</h3>
                <div className="grid grid-cols-1 gap-2">
                  {["Men's Doubles", "Women's Doubles", "Mixed Doubles", "Singles"].map((type) => (
                    <label key={type} className={clsx(
                      "flex items-center gap-3 p-4 rounded-lg border cursor-pointer group transition-all",
                      matchType === type
                        ? "bg-[#13ec80]/10 border-[#13ec80]/50"
                        : "bg-slate-950 border-slate-800 hover:border-[#13ec80]/30"
                    )}>
                      <div className={clsx(
                        "size-4 rounded-full border-2 flex items-center justify-center",
                        matchType === type ? "border-[#13ec80]" : "border-slate-600"
                      )}>
                        {matchType === type && <div className="size-2 bg-[#13ec80] rounded-full" />}
                      </div>
                      <input 
                        type="radio"
                        name="match_type" 
                        value={type}
                        checked={matchType === type}
                        onChange={(e) => setMatchType(e.target.value)}
                        className="hidden"
                      />
                      <span className={clsx(
                        "text-sm font-bold",
                        matchType === type ? "text-[#13ec80]" : "text-slate-400 group-hover:text-slate-200"
                      )}>{type}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Court Selection */}
              <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Court Selection</h3>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button 
                      key={n} 
                      onClick={() => setCourt(n.toString())}
                      className={clsx(
                        "w-12 h-12 rounded-lg border flex items-center justify-center text-sm font-black transition-all",
                        court === n.toString()
                          ? "bg-[#13ec80] text-[#020617] border-[#13ec80]"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-[#13ec80]/50 hover:text-slate-200"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Middle Column: Team Selection & Score */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              {/* Score Entry */}
              <section className="bg-slate-900/60 p-8 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#13ec80]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between gap-12 relative z-10">
                  <div className="flex flex-col items-center gap-6 flex-1">
                    <span className={clsx("text-xs font-black uppercase tracking-widest", scoreA >= scoreB ? "text-[#13ec80]" : "text-slate-500")}>Team Alpha</span>
                    <input 
                      className={clsx(
                        "w-full text-center text-7xl font-black bg-slate-950 border-2 rounded-xl p-6 focus:ring-0 outline-none transition-all",
                        scoreA >= scoreB ? "border-[#13ec80]/50 text-[#13ec80]" : "border-slate-800 text-slate-400 focus:border-[#13ec80]/50"
                      )}
                      type="number" 
                      min="0"
                      value={scoreA}
                      onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="text-4xl font-black text-slate-800 pt-8 italic">VS</div>
                  <div className="flex flex-col items-center gap-6 flex-1">
                    <span className={clsx("text-xs font-black uppercase tracking-widest", scoreB > scoreA ? "text-[#13ec80]" : "text-slate-500")}>Team Bravo</span>
                    <input 
                      className={clsx(
                        "w-full text-center text-7xl font-black bg-slate-950 border-2 rounded-xl p-6 focus:ring-0 outline-none transition-all",
                        scoreB > scoreA ? "border-[#13ec80]/50 text-[#13ec80]" : "border-slate-800 text-slate-400 focus:border-[#13ec80]/50"
                      )}
                      type="number" 
                      min="0"
                      value={scoreB}
                      onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </section>

              {/* Team Selection */}
              <section className="bg-slate-900/60 p-8 rounded-xl border border-slate-800 shadow-sm grow relative">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Team Rosters</h3>
                </div>

                {isSearching.active && (
                  <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 p-8 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold text-[#13ec80] uppercase tracking-widest">
                        Adding to Team {isSearching.team}
                      </h4>
                      <button onClick={() => { setIsSearching({ active: false, team: null }); setSearchTerm(''); }} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors">
                        <X className="size-5" />
                      </button>
                    </div>
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
                      <input 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg text-lg pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#13ec80] outline-none text-slate-100 placeholder:text-slate-600 transition-all font-bold" 
                        placeholder="Search by name..." 
                        type="text" 
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {filteredPlayers.length === 0 && (
                        <div className="text-center py-10 text-slate-500 font-bold">No players found.</div>
                      )}
                      {filteredPlayers.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => handleAddPlayer(p.id)}
                          className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-[#13ec80]/50 cursor-pointer transition-all hover:bg-[#13ec80]/5 group"
                        >
                          <span className="text-lg font-bold uppercase tracking-tight text-slate-300 group-hover:text-white">{p.name}</span>
                          <PlusCircle className="text-slate-600 group-hover:text-[#13ec80] size-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  {/* Alpha Players Selection */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                    <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Alpha</span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">{teamAIds.length} Players</span>
                    </div>
                    <div className="p-4 space-y-2 flex-1 min-h-[200px]">
                      {teamAIds.map(id => {
                        const player = players.find(p => p.id === id);
                        return player ? (
                          <div key={id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800 relative group overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#13ec80]" />
                            <span className="text-sm font-bold uppercase ml-2">{player.name}</span>
                            <button 
                              onClick={() => handleRemovePlayer(id, 'A')}
                              className="text-slate-600 hover:text-rose-500 p-1 rounded-md transition-colors"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                      <button 
                        onClick={() => setIsSearching({ active: true, team: 'A' })}
                        className="w-full py-4 border-2 border-dashed border-slate-800 rounded-lg text-slate-500 hover:text-[#13ec80] hover:border-[#13ec80]/50 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Users className="size-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Player</span>
                      </button>
                    </div>
                  </div>

                  {/* Bravo Players Selection */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                    <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Bravo</span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">{teamBIds.length} Players</span>
                    </div>
                    <div className="p-4 space-y-2 flex-1 min-h-[200px]">
                      {teamBIds.map(id => {
                        const player = players.find(p => p.id === id);
                        return player ? (
                          <div key={id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800 relative group overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-500" />
                            <span className="text-sm font-bold uppercase ml-2">{player.name}</span>
                            <button 
                              onClick={() => handleRemovePlayer(id, 'B')}
                              className="text-slate-600 hover:text-rose-500 p-1 rounded-md transition-colors"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                      <button 
                        onClick={() => setIsSearching({ active: true, team: 'B' })}
                        className="w-full py-4 border-2 border-dashed border-slate-800 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500/50 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Users className="size-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Player</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #13ec80;
        }
      `}</style>
    </div>
  );
}
