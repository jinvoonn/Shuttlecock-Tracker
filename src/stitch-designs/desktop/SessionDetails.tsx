"use client";

import React from 'react';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Plus, 
  Users, 
  AlertCircle,
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  CheckCircle2,
  Feather,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import RankBadge from '@/components/ui/RankBadge';
import { usePathname, useRouter } from 'next/navigation';
import AddMatchModal from "@/components/AddMatchModal";
import PlayerName from "@/components/ui/PlayerName";
import { deleteMatch } from "@/lib/actions/matches";
import { useRole } from "@/context/AuthContext";
import { SessionForm } from '@/app/[mode]/sessions/SessionForm';
import { useEffect, useState } from 'react';

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
  teamAPlayers?: { id: string; name: string; elo: number }[];
  teamBPlayers?: { id: string; name: string; elo: number }[];
  scoreA: number;
  scoreB: number;
  team_a_player1: string;
  team_a_player2: string;
  team_b_player1: string;
  team_b_player2: string;
  type: string;
  court: string;
  status: 'Completed' | 'Live';
}

interface Attendee {
  id: string;
  name: string;
  role: string;
  fee: number;
  paid: boolean;
  elo?: number;
}

interface Player { id: string; name: string; }
interface Purchase { id: string; remaining_quantity: number; tube_number: number; brands: { name: string } | null; price_per_tube: number; price_per_cock: number; }
interface InitialData { id: string; date: string; location: string; notes: string; players: string[]; usage: Record<string, number>; }

interface DesktopSessionDetailsProps {
  session: SessionMeta;
  matches: Match[];
  attendees: Attendee[];
  allPlayers: Player[];
  allPurchases: Purchase[];
  initialData: InitialData;
  sessionStats?: {
    mostWins: { id: string; name: string; value: number; suffix?: string; elo?: number }[];
    winRate: { id: string; name: string; value: number; suffix?: string; elo?: number }[];
  }
}

export default function DesktopSessionDetails({ session, matches, attendees, allPlayers, allPurchases, initialData, sessionStats }: DesktopSessionDetailsProps) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<"wins" | "winRate">("wins");
  const { isAdmin } = useRole();

  useEffect(() => {
    if (isEditingSession) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isEditingSession]);

  const isLive = new Date(session.date).toDateString() === new Date().toDateString();

  return (
    <div className="bg-slate-900 text-slate-100 font-['Lexend',_sans-serif] min-h-screen pb-24 text-left">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#f6f8f7]/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#1e293b] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`${basePath}/sessions`} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                  <Feather className="size-4 text-white transform rotate-45" />
                </div>
                <h1 className="text-xl font-black tracking-tighter italic uppercase text-slate-50">
                  Cock<span className="text-emerald-400">Count</span>
                </h1>
              </div>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] pl-1">
                Because Shuttlecocks Aren't Free
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Session Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {isLive ? (
              <span className="inline-block px-2 py-1 bg-emerald-400/20 text-emerald-400 text-xs font-bold rounded mb-2 tracking-widest uppercase italic">Live Session</span>
            ) : (
              <span className="inline-block px-2 py-1 bg-slate-800 text-slate-500 text-xs font-bold rounded mb-2 tracking-widest uppercase italic">Archived</span>
            )}
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">{session.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span className="text-sm font-medium">{session.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
                <span className="text-sm font-medium">{session.time}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             {isAdmin && (
               <button 
                 onClick={() => setIsEditingSession(true)}
                 className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 px-6 py-3 rounded font-bold text-sm uppercase transition-all flex items-center gap-2 relative z-50"
               >
                 <Pencil className="size-5" />
                 Edit Session
               </button>
             )}
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-black text-sm uppercase transition-all flex items-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-95"
             >
              <Plus className="size-5" />
              Record Match
            </button>
          </div>
        </section>

        {(isModalOpen || editingMatch) && (
          <AddMatchModal 
            sessionId={session.id}
            players={attendees.map(a => ({ id: a.id, name: a.name }))}
            onClose={() => {
                setIsModalOpen(false);
                setEditingMatch(null);
            }}
            onSuccess={() => {
              // The server action handles revalidation
              console.log("Match saved successfully");
            }}
            initialMatch={editingMatch ? {
                id: editingMatch.id,
                team_a_player1: editingMatch.team_a_player1,
                team_a_player2: editingMatch.team_a_player2,
                team_b_player1: editingMatch.team_b_player1,
                team_b_player2: editingMatch.team_b_player2,
                team_a_score: editingMatch.scoreA,
                team_b_score: editingMatch.scoreB
            } : undefined}
          />
        )}

        {/* Key Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="size-12" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Total Shuttles Used</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white italic">{session.shuttlesUsed}</span>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="size-12" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Cost per Person</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white italic">RM{session.costPerHead.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="size-12" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Total Net</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white italic">RM{session.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Unified Session Leaderboard */}
        {sessionStats && (sessionStats.mostWins.length > 0) && (
          <section>
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Activity className="size-6 text-emerald-400" />
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-100">Session Leaderboard</h3>
                </div>
                <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setLeaderboardMode("wins")}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                      leaderboardMode === "wins"
                        ? "bg-emerald-400 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Wins
                  </button>
                  <button
                    onClick={() => setLeaderboardMode("winRate")}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                      leaderboardMode === "winRate"
                        ? "bg-emerald-400 text-white shadow-lg"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Win Rate
                  </button>
                </div>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {(leaderboardMode === "wins" ? sessionStats.mostWins : sessionStats.winRate).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-5">
                      <span className={clsx(
                        "text-xl font-black italic w-10",
                        idx === 0 ? "text-emerald-400" : "text-slate-600"
                      )}>
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg uppercase tracking-tight text-slate-100 italic group-hover:text-white transition-colors">
                          {p.name}
                        </span>
                        <span className="text-slate-800 font-light text-sm">|</span>
                        <RankBadge elo={p.elo || 1200} compact />
                      </div>
                    </div>
                    <div className="font-mono font-black italic text-emerald-400 bg-emerald-400/5 px-4 py-1.5 rounded-lg text-lg">
                      {leaderboardMode === "wins" 
                        ? `${p.value} ${p.suffix || 'WINS'}` 
                        : `${((p.value || 0) * 100).toFixed(1)}%`
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Participants */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight mb-4 flex items-center gap-2">
                <Users className="text-[#13ec80] size-6" />
                Participants ({attendees.length})
              </h3>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl divide-y divide-slate-700/50 overflow-hidden">
                {attendees.map(attendee => {
                  const initial = attendee.name.charAt(0).toUpperCase();
                  return (
                    <div key={attendee.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border", 
                          attendee.paid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        )}>
                          {initial}
                        </div>
                        <div>
                          <PlayerName 
                            name={attendee.name} 
                            elo={attendee.elo || 1200} 
                            showRankName={false} 
                            nameClassName="text-sm"
                          />
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">
                            {attendee.role} • {attendee.paid ? 'Settled' : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <span className={clsx("font-black italic text-lg", attendee.paid ? "text-emerald-400" : "text-slate-500")}>
                        RM{attendee.fee.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Matches Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                <Trophy className="text-emerald-400 size-6" />
                Logged Matches
              </h3>
            </div>
            
            <div className="space-y-4">
              {matches.length === 0 && (
                <div className="text-center py-10 bg-slate-200/50 dark:bg-[#0f172a]/50 border border-slate-300 dark:border-[#1e293b] rounded-xl text-slate-500 font-bold">
                  No matches recorded for this session yet.
                </div>
              )}

              {matches.map(match => (
                <div key={match.id} className={clsx(
                  "border rounded-xl overflow-hidden transition-all",
                  match.status === 'Completed' ? 'bg-slate-900 border-white/5' : 'bg-slate-900 border-emerald-400/30 shadow-emerald-400/10 shadow-[0_0_15px]'
                )}>
                  <div className="p-4 border-b border-slate-300 dark:border-[#1e293b] bg-slate-300/30 dark:bg-slate-800/30 flex justify-between items-center">
                    <span className="text-[10px] font-black italic uppercase tracking-widest text-slate-500">
                      {match.type} • {match.court}
                    </span>
                    <div className="flex items-center gap-3">
                      {match.status === 'Completed' ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> COMPLETED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 animate-pulse flex items-center gap-1">
                          <AlertCircle className="size-3 fill-current" /> LIVE
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 border-l border-slate-300 dark:border-[#1e293b] ml-2 pl-2">
                          <button 
                            onClick={() => setEditingMatch(match)}
                            className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this match?")) {
                                await deleteMatch(match.id);
                                window.location.reload();
                              }
                            }}
                            className="p-1 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-7 items-center gap-4">
                    <div className="col-span-3 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {match.teamAPlayers?.map(p => (
                          <PlayerName key={p.id} name={p.name} elo={p.elo} showRankName={false} nameClassName="text-sm" />
                        )) || <p className="text-sm font-black italic">{match.teamA}</p>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">TEAM A</p>
                    </div>
                    <div className="col-span-1 flex flex-col items-center">
                      <div className={clsx(
                        "px-2 py-1 font-black italic text-lg rounded leading-tight transition-colors",
                        match.scoreA > match.scoreB && match.status === 'Completed'
                          ? "bg-emerald-400 text-slate-950" 
                          : "text-slate-100"
                      )}>
                        {match.scoreA}
                      </div>
                      <div className="h-4 w-[1px] bg-slate-400/30 my-1"></div>
                      <div className={clsx(
                        "px-2 py-1 font-black italic text-lg rounded leading-tight transition-colors",
                        match.scoreB > match.scoreA && match.status === 'Completed'
                          ? "bg-emerald-400 text-slate-950" 
                          : "text-slate-100"
                      )}>
                        {match.scoreB}
                      </div>
                    </div>
                    <div className="col-span-3 text-left">
                      <div className="flex flex-col items-start gap-1.5">
                        {match.teamBPlayers?.map(p => (
                          <PlayerName key={p.id} name={p.name} elo={p.elo} showRankName={false} nameClassName="text-sm" />
                        )) || <p className="text-sm font-black italic">{match.teamB}</p>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">TEAM B</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Session Modal */}
      {isEditingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl relative">
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
    </div>
  );
}
