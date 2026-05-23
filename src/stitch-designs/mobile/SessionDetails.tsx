"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Package, 
  PlusCircle, 
  LayoutGrid, 
  Activity, 
  Banknote,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  History as HistoryIcon,
  Pencil,
  Trash2,
  Check,
  X,
  Feather,
  Trophy,
  Camera
} from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import PlayerName from "@/components/ui/PlayerName";
import { deleteMatch, updateMatch } from "@/lib/actions/matches";
import clsx from "clsx";
import RankBadge from '@/components/ui/RankBadge';
import Link from 'next/link';
import { useRole } from "@/context/AuthContext";
import { useEffect } from 'react';
import { SessionForm } from '@/app/[mode]/sessions/SessionForm';
import { StoryPreviewModal } from '@/components/story/StoryPreviewModal';

interface SessionMeta {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  division: string;
  shuttlesUsed: number;
  costPerHead: number;
  totalCost: number;
}

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  teamAPlayers?: { id: string; name: string; elo: number; placementMatchesPlayed?: number; ratingDelta?: number }[];
  teamBPlayers?: { id: string; name: string; elo: number; placementMatchesPlayed?: number; ratingDelta?: number }[];
  scoreA: number;
  scoreB: number;
  type: string;
  court: string;
  status: 'Completed' | 'Live';
  team_a_player1?: string;
  team_a_player2?: string;
  team_b_player1?: string;
  team_b_player2?: string;
  played_at: string | null;
  created_at: string;
}

interface Attendee {
  id: string;
  name: string;
  role: string;
  fee: number;
  paid: boolean;
  elo?: number;
  placementMatchesPlayed?: number;
}

interface SessionPlayer {
  id: string;
  name: string;
}

interface Player { id: string; name: string; }
interface Purchase { id: string; remaining_quantity: number; tube_number: number; brands: { name: string } | null; price_per_tube: number; price_per_cock: number; }
interface InitialData { id: string; date: string; location: string; notes: string; players: string[]; usage: Record<string, number>; }

interface MobileSessionDetailsProps {
  session: SessionMeta;
  matches: Match[];
  attendees: Attendee[];
  sessionPlayers?: SessionPlayer[];
  allPlayers: Player[];
  allPurchases: Purchase[];
  initialData: InitialData;
  sessionStats?: {
    mostWins: { id: string; name: string; value: number; suffix?: string; elo?: number; placementMatchesPlayed?: number }[];
    winRate: { id: string; name: string; value: number; suffix?: string; elo?: number; placementMatchesPlayed?: number }[];
  }
}

export default function MobileSessionDetails({ session, matches, attendees, sessionPlayers = [], allPlayers, allPurchases, initialData, sessionStats }: MobileSessionDetailsProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [playerTeams, setPlayerTeams] = useState<Record<string, number>>({});
  const [editScoreA, setEditScoreA] = useState("");
  const [editScoreB, setEditScoreB] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = React.useState<"wins" | "winRate">("wins");
  const { isAdmin } = useRole();

  useEffect(() => {
    if (isEditingSession) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isEditingSession]);

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

  const startEdit = (match: Match) => {
    const teams: Record<string, number> = {};
    if (match.team_a_player1) teams[match.team_a_player1] = 1;
    if (match.team_a_player2 && match.team_a_player2 !== match.team_a_player1) teams[match.team_a_player2] = 1;
    if (match.team_b_player1) teams[match.team_b_player1] = 2;
    if (match.team_b_player2 && match.team_b_player2 !== match.team_b_player1) teams[match.team_b_player2] = 2;
    setPlayerTeams(teams);
    setEditScoreA(match.scoreA.toString());
    setEditScoreB(match.scoreB.toString());
    setEditingMatchId(match.id);
  };

  const cancelEdit = () => {
    setEditingMatchId(null);
    setPlayerTeams({});
    setEditScoreA("");
    setEditScoreB("");
  };

  const handleSave = async () => {
    if (!editingMatchId) return;
    if (!teamAIds.length || !teamBIds.length) {
      alert("Each team must have at least 1 player.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = JSON.stringify({
        sessionId: session.id,
        teamAIds,
        teamBIds,
        scoreA: parseInt(editScoreA) || 0,
        scoreB: parseInt(editScoreB) || 0,
        playedAt: matches.find(m => m.id === editingMatchId)?.played_at
      });
      const result = await updateMatch(editingMatchId, payload);
      if (result && !result.success) {
        alert("Failed to save: " + result.error);
        return;
      }
      cancelEdit();
      router.refresh();
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      const result = await deleteMatch(matchId);
      if (result && !result.success) {
        alert("Failed to delete: " + result.error);
        return;
      }
      router.refresh();
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const playerMap = Object.fromEntries(sessionPlayers.map(p => [p.id, p.name]));

  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl pb-32">
        <header className="sticky top-0 z-20 flex flex-col items-center justify-center px-6 py-5 bg-slate-900/80 backdrop-blur-md border-b border-sky-400/10">
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
          <button onClick={() => router.back()} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-xl bg-slate-800 border border-slate-700 transition-all active:scale-95 shadow-sm">
            <ArrowLeft className="size-5 text-slate-100" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="p-4">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-800 aspect-[16/10] mb-6 shadow-2xl text-left">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10"></div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAl91YTHAMekTqLihKMJ5IYSfEdcIo0J6a8vUPUm5Kb-ldnERhYcMbv9a8yspM10OCYm2T4jUrAgIgCEq9XCTAfZ24Fl5NmdrOeGG10_LP2LYiMlf5Ju3f4Vl9zOEhjj_oxH0HsVcoBcoaGHwvsnvqmkV2meaGc95a-S3U5yIBqWJZl0qOm3vOuvO-yCEFJ1N-ruyGjL9zlTCUFa23ejlZdoUVDoD3JNKFd1xf5_0_YSMFFxMIgPahv4ePfTguXPJxTPFSvsCwGcd4"
                alt="Badminton Court"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase bg-emerald-400/10 backdrop-blur-md px-2 py-1 rounded">{session.division}</span>
                    <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                  <div className="flex z-50 gap-2 relative">
                    <button 
                      onClick={() => setIsStoryModalOpen(true)}
                      className="bg-slate-800/80 backdrop-blur-md text-[#13ec80] border border-[#13ec80]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Camera className="size-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Story</span>
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => setIsEditingSession(true)}
                        className="bg-slate-800/80 backdrop-blur-md text-emerald-400 border border-emerald-400/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <Pencil className="size-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="text-white text-3xl font-black italic uppercase leading-tight tracking-tighter mt-1">{session.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-xs mt-3 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="size-3" /> {session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {session.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {session.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-800 border-l-4 border-emerald-400 shadow-xl text-left">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Shuttles</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-slate-100 text-xl font-black italic leading-none">{session.shuttlesUsed}</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase">PCS</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-800 border-l-4 border-emerald-400 shadow-xl text-left">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Cost/Head</p>
                <p className="text-slate-100 text-xl font-black italic leading-none mt-1">
                  RM{session.costPerHead.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl p-4 bg-slate-800 border-l-4 border-emerald-400 shadow-xl text-left">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Total</p>
                <p className="text-slate-100 text-xl font-black italic leading-none mt-1">
                  RM{session.totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Unified Session Leaderboard */}
            {sessionStats && (sessionStats.mostWins.length > 0) && (
              <div className="flex flex-col gap-4 rounded-[2rem] bg-slate-800 p-6 border border-slate-700 shadow-xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-emerald-400" />
                    <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Session Leaderboard</h3>
                  </div>
                  <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
                    <button
                      onClick={() => setLeaderboardMode("wins")}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-200 active:scale-95",
                        leaderboardMode === "wins"
                          ? "bg-emerald-400 text-white shadow-sm"
                          : "text-slate-500"
                      )}
                    >
                      Wins
                    </button>
                    <button
                      onClick={() => setLeaderboardMode("winRate")}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-200 active:scale-95",
                        leaderboardMode === "winRate"
                          ? "bg-emerald-400 text-white shadow-sm"
                          : "text-slate-500"
                      )}
                    >
                      Rate
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
                  {(leaderboardMode === "wins" ? sessionStats.mostWins : sessionStats.winRate).map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-4">
                        <span className={clsx("text-xs font-black italic w-4", idx === 0 ? "text-emerald-400" : "text-slate-500")}>#{idx + 1}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-black italic uppercase tracking-tight text-slate-100">{p.name}</span>
                          <RankBadge elo={p.elo || 1200} placementMatchesPlayed={p.placementMatchesPlayed} compact />
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-black italic bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded">
                        {leaderboardMode === "wins" 
                          ? `${p.value} ${p.value === 1 ? 'WIN' : 'WINS'}` 
                          : `${((p.value || 0) * 100).toFixed(1)}%`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendees */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-slate-100 text-sm font-black uppercase tracking-[0.15em] italic">Attendees ({attendees.length})</h3>
              </div>
              <div className="flex flex-col gap-2">
                {attendees.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No attendees listed.</p>}
                {attendees.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-sm text-left">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20 text-emerald-400 font-black text-xs uppercase">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <PlayerName 
                          name={person.name} 
                          elo={person.elo || 1200} 
                          placementMatchesPlayed={person.placementMatchesPlayed}
                          showRankName={false} 
                          nameClassName="text-sm"
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{person.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">RM{person.fee.toFixed(2)}</p>
                      <p className={`text-[10px] font-black uppercase italic tracking-widest ${person.paid ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {person.paid ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Match Results */}
            <section className="mb-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-slate-900 dark:text-slate-100 text-sm font-black uppercase tracking-[0.15em] italic">Match Results</h3>
                <button 
                  onClick={() => router.push(`${basePath}/sessions/${session.id}/record-match`)}
                  className="text-emerald-400 flex items-center gap-1.5 active:scale-95 transition-transform bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20"
                >
                  <PlusCircle className="size-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Log Result</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {matches.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No matches recorded yet.</p>}
                {matches.map((match) => (
                  <div key={match.id} className="bg-slate-800 rounded-[2rem] border border-slate-700 shadow-lg overflow-hidden">
                    
                    {/* Match Card Content */}
                    <div className="p-6 text-left">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {match.status === 'Completed' ? <TrendingUp className="size-3 text-emerald-400" /> : <Activity className="size-3 text-amber-500" />}
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{match.type} • {new Date(match.played_at || match.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(match)}
                            className="flex items-center justify-center size-8 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(match.id)}
                            className="flex items-center justify-center size-8 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1.5">
                              {match.teamAPlayers?.map(p => (
                                <div key={p.id} className="flex items-center gap-1.5">
                                  <PlayerName name={p.name} elo={p.elo} placementMatchesPlayed={p.placementMatchesPlayed} showRankName={false} nameClassName="text-xs" />
                                  {p.ratingDelta !== undefined && (
                                    <span className={clsx(
                                      "text-[9px] font-black px-1.5 py-0.5 rounded border font-mono shrink-0",
                                      p.ratingDelta > 0 ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
                                      p.ratingDelta < 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                      "bg-slate-800 text-slate-500 border-slate-700"
                                    )}>
                                      {p.ratingDelta > 0 ? `+${p.ratingDelta}` : p.ratingDelta === 0 ? "±0" : `${p.ratingDelta}`}
                                    </span>
                                  )}
                                </div>
                              )) || <span className="text-sm font-black text-slate-300 uppercase tracking-tight truncate max-w-[160px] italic">{match.teamA}</span>}
                            </div>
                            <span className={`text-3xl font-black italic leading-none tabular-nums ${match.scoreA >= match.scoreB && match.status === 'Completed' ? 'text-emerald-400' : 'text-slate-700'}`}>{match.scoreA}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1.5">
                              {match.teamBPlayers?.map(p => (
                                <div key={p.id} className="flex items-center gap-1.5">
                                  <PlayerName name={p.name} elo={p.elo} placementMatchesPlayed={p.placementMatchesPlayed} showRankName={false} nameClassName="text-xs" />
                                  {p.ratingDelta !== undefined && (
                                    <span className={clsx(
                                      "text-[9px] font-black px-1.5 py-0.5 rounded border font-mono shrink-0",
                                      p.ratingDelta > 0 ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
                                      p.ratingDelta < 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                      "bg-slate-800 text-slate-500 border-slate-700"
                                    )}>
                                      {p.ratingDelta > 0 ? `+${p.ratingDelta}` : p.ratingDelta === 0 ? "±0" : `${p.ratingDelta}`}
                                    </span>
                                  )}
                                </div>
                              )) || <span className="text-sm font-bold text-slate-500 uppercase tracking-tight truncate max-w-[160px] italic">{match.teamB}</span>}
                            </div>
                            <span className={`text-3xl font-black italic leading-none tabular-nums ${match.scoreB >= match.scoreA && match.status === 'Completed' ? 'text-emerald-400' : 'text-slate-700'}`}>{match.scoreB}</span>
                          </div>
                        </div>
                    </div>

                    {/* Inline Edit Panel */}
                    {editingMatchId === match.id && (
                      <div className="border-t border-slate-700 bg-slate-900/60 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to cycle: A → B → Out</p>

                        {/* Player Cycle Grid */}
                        {sessionPlayers.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sessionPlayers.map(p => {
                              const state = playerTeams[p.id] ?? 0;
                              const isA = state === 1;
                              const isB = state === 2;
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => cyclePlayer(p.id)}
                                  className={clsx(
                                    "px-3 py-2 rounded-xl text-xs font-bold transition-all border active:scale-95 flex items-center gap-1.5",
                                    isA ? "bg-emerald-400 text-slate-950 border-emerald-300" :
                                    isB ? "bg-emerald-600 text-white border-emerald-500" :
                                    "bg-slate-700 text-slate-400 border-slate-600"
                                  )}
                                >
                                  {p.name}
                                  {isA && <span className="bg-white/20 px-1 rounded text-[8px] font-black">A</span>}
                                  {isB && <span className="bg-white/20 px-1 rounded text-[8px] font-black">B</span>}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No player data available for editing.</p>
                        )}

                        {/* Score Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-3 space-y-1 text-left">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                              Team A — {teamAIds.map(id => playerMap[id] || id).join(", ") || "none"}
                            </p>
                            <input
                              type="number"
                              className="w-full bg-transparent text-slate-100 text-lg font-black outline-none"
                              value={editScoreA}
                              onChange={e => setEditScoreA(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-3 space-y-1">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                              Team B — {teamBIds.map(id => playerMap[id] || id).join(", ") || "none"}
                            </p>
                            <input
                              type="number"
                              className="w-full bg-transparent text-slate-100 text-lg font-black outline-none"
                              value={editScoreB}
                              onChange={e => setEditScoreB(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Save / Cancel */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-emerald-400/20"
                          >
                            <Check className="size-4" />
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center justify-center size-12 bg-slate-700 text-slate-300 rounded-xl active:scale-95 transition-all outline-none border border-slate-600"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button onClick={() => router.push(basePath)} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group">
              <LayoutGrid className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Dash</span>
            </button>
            <button onClick={() => router.push(`${basePath}/sessions`)} className="flex flex-1 flex-col items-center justify-center gap-1 text-emerald-400 relative group">
              <HistoryIcon className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Sessions</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
            <button onClick={() => router.push(`${basePath}/purchases`)} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group">
              <Package className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
            </button>
            <button onClick={() => router.push(`${basePath}/payments`)} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group">
              <Banknote className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Edit Session Modal */}
      {isEditingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl relative">
            <SessionForm
              players={allPlayers}
              purchases={allPurchases}
              initialData={initialData}
              isEdit={true}
              onCancel={() => setIsEditingSession(false)}
            />
          </div>
        </div>
      )}

      {/* Story Export Modal */}
      <StoryPreviewModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        session={session}
        matches={matches}
        sessionStats={sessionStats || { mostWins: [] }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
