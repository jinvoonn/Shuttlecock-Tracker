"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet, 
  Users,
  Feather
} from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import { addMatch } from "@/lib/actions/matches";
import clsx from 'clsx';
import PlayerName from "@/components/ui/PlayerName";
import Link from 'next/link';
import { useMatches } from "@/context/MatchesContext";

interface Player {
  id: string;
  name: string;
  elo?: number;
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
  const { addOptimisticMatch } = useMatches();

  const [playerTeams, setPlayerTeams] = useState<Record<string, number>>({});
  // 0 = unselected, 1 = Team A, 2 = Team B
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(19);
  const [matchType, setMatchType] = useState("Men's Doubles");
  const [court, setCourt] = useState("1");
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

      // Optimistic Update
      addOptimisticMatch({
        session_id: sessionId,
        team_a_player1: teamAIds[0],
        team_a_player2: teamAIds[1] || null,
        team_b_player1: teamBIds[0],
        team_b_player2: teamBIds[1] || null,
        team_a_score: scoreA,
        team_b_score: scoreB
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
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-['Lexend',_sans-serif]">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
        style={{ backgroundImage: "url('/badminton-bg.png')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/95 pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="relative z-20 w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Feather className="size-5 text-white transform rotate-45" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tighter uppercase italic">
                Cock<span className="text-emerald-400">Count</span>
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
          <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-400 text-slate-950 font-black transition-all shadow-lg shadow-emerald-400/10">
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
        <header className="sticky top-0 z-50 h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-8 flex items-center" />

        <div className="p-8 lg:p-12 w-full max-w-6xl mx-auto flex-1">
          {/* Header Section */}
          <header className="mb-10 flex justify-between items-end border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-5xl font-black italic text-slate-100 uppercase tracking-tighter leading-none mb-2">Log Match Result</h2>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CalendarDays className="size-4" />
                <span className="text-sm uppercase tracking-widest font-bold text-slate-500">Session • {sessionId.slice(0, 8)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href={`${basePath}/sessions/${sessionId}`} className="px-6 py-3 border border-slate-800 text-sm font-bold text-slate-400 hover:text-slate-100 rounded-lg uppercase tracking-wider transition-colors">Discard</Link>
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-400 text-slate-950 text-sm font-black rounded-lg uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-emerald-400/20 disabled:opacity-50"
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
                        ? "bg-emerald-400/10 border-emerald-400/50"
                        : "bg-slate-950 border-slate-800 hover:border-emerald-400/30"
                    )}>
                      <div className={clsx(
                        "size-4 rounded-full border-2 flex items-center justify-center",
                        matchType === type ? "border-emerald-400" : "border-slate-600"
                      )}>
                        {matchType === type && <div className="size-2 bg-emerald-400 rounded-full" />}
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
                        matchType === type ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
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
                          ? "bg-emerald-400 text-slate-900 border-emerald-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-400/50 hover:text-slate-200"
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
                        scoreA >= scoreB ? "border-emerald-400/50 text-emerald-400" : "border-slate-800 text-slate-400 focus:border-emerald-400/50"
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
                        scoreB > scoreA ? "border-emerald-400/50 text-emerald-400" : "border-slate-800 text-slate-400 focus:border-emerald-400/50"
                      )}
                      type="number" 
                      min="0"
                      value={scoreB}
                      onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </section>

              {/* Team Selection - Cycle Based */}
              <section className="bg-slate-900/60 p-8 rounded-xl border border-slate-800 shadow-sm grow relative">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Player Assignment</h3>
                  <span className="text-[10px] text-slate-600 italic font-medium">Click to cycle: Team A → Team B → Out</span>
                </div>

                {/* Player Grid */}
                <div className="flex flex-wrap gap-2 mb-6 min-h-[80px] p-1">
                  {players.map(p => {
                    const state = playerTeams[p.id] ?? 0;
                    const isTeamA = state === 1;
                    const isTeamB = state === 2;
                    return (
                      <button
                        key={p.id}
                        onClick={() => cyclePlayer(p.id)}
                        className={clsx(
                          "px-4 py-2.5 rounded-xl text-sm font-bold transition-all border active:scale-95 flex items-center gap-2",
                          isTeamA
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
                            : isTeamB
                              ? "bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-slate-100"
                        )}
                      >
                      <PlayerName 
                        name={p.name} 
                        elo={p.elo || 1200} 
                        showRankName={false} 
                        nameClassName="text-sm"
                      />
                        {isTeamA && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-black">A</span>}
                        {isTeamB && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-black">B</span>}
                      </button>
                    );
                  })}
                  {players.length === 0 && (
                    <div className="text-slate-600 text-sm font-medium flex items-center gap-2">
                      <Users className="size-4" /> No players in this session.
                    </div>
                  )}
                </div>

                {/* Team Preview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Team Alpha ({teamAIds.length})</div>
                    {teamAIds.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">No players selected</p>
                    ) : (
                      <div className="space-y-1">
                        {teamAIds.map(id => {
                          const p = players.find(pl => pl.id === id);
                          return p ? (
                            <div key={id} className="text-sm font-bold text-emerald-200 flex items-center gap-1.5 py-0.5">
                              <PlayerName 
                                name={p.name} 
                                elo={p.elo || 1200} 
                                showRankName={false} 
                                nameClassName="text-sm"
                              />
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-4">
                    <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Team Bravo ({teamBIds.length})</div>
                    {teamBIds.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">No players selected</p>
                    ) : (
                      <div className="space-y-1">
                        {teamBIds.map(id => {
                          const p = players.find(pl => pl.id === id);
                          return p ? (
                            <div key={id} className="text-sm font-bold text-sky-200 flex items-center gap-1.5 py-0.5">
                              <PlayerName 
                                name={p.name} 
                                elo={p.elo || 1200} 
                                showRankName={false} 
                                nameClassName="text-sm"
                              />
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
