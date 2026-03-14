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
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import AddMatchModal from "@/components/AddMatchModal";

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
  scoreA: number;
  scoreB: number;
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
}

interface DesktopSessionDetailsProps {
  session: SessionMeta;
  matches: Match[];
  attendees: Attendee[];
}

export default function DesktopSessionDetails({ session, matches, attendees }: DesktopSessionDetailsProps) {
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const isLive = new Date(session.date).toDateString() === new Date().toDateString();

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-['Lexend',_sans-serif] min-h-screen pb-24">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#f6f8f7]/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#1e293b] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`${basePath}/sessions`} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="size-5" />
            </Link>
            <Trophy className="text-[#13ec80] size-8" />
            <h1 className="text-xl font-black tracking-tighter italic uppercase">CockCount</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Session Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {isLive ? (
              <span className="inline-block px-2 py-1 bg-[#13ec80]/20 text-[#13ec80] text-xs font-bold rounded mb-2 tracking-widest uppercase">Live Session</span>
            ) : (
              <span className="inline-block px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded mb-2 tracking-widest uppercase">Archived</span>
            )}
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight text-slate-900 dark:text-slate-100">{session.name}</h2>
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
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-[#020617] px-6 py-3 rounded font-bold text-sm uppercase transition-all flex items-center gap-2"
             >
              <Plus className="size-5" />
              Record Match
            </button>
          </div>
        </section>

        {isModalOpen && (
          <AddMatchModal 
            sessionId={session.id}
            players={attendees.map(a => ({ id: a.id, name: a.name }))}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              // The server action handles revalidation
              console.log("Match added successfully");
            }}
          />
        )}

        {/* Key Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="size-12" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Total Shuttles Used</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">{session.shuttlesUsed}</span>
            </div>
          </div>
          <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="size-12" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Cost per Person</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">RM{session.costPerHead.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="size-12" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Total Net</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">RM{session.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Participants */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight mb-4 flex items-center gap-2">
                <Users className="text-[#13ec80] size-6" />
                Participants ({attendees.length})
              </h3>
              <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] rounded-lg divide-y divide-slate-300 dark:divide-[#1e293b] overflow-hidden">
                {attendees.map(attendee => {
                  const initial = attendee.name.charAt(0).toUpperCase();
                  return (
                    <div key={attendee.id} className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs", 
                          attendee.paid ? "bg-[#13ec80]/20 text-[#13ec80]" : "bg-rose-500/20 text-rose-500"
                        )}>
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{attendee.name}</p>
                          <p className={clsx("text-[10px] uppercase font-bold", attendee.paid ? "text-slate-500" : "text-rose-400")}>
                            {attendee.role} • {attendee.paid ? 'Settled' : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <span className={clsx("font-black italic", attendee.paid ? "text-[#13ec80]" : "text-slate-400")}>
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
                <Trophy className="text-[#13ec80] size-6" />
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
                  match.status === 'Completed' ? 'bg-slate-200 dark:bg-[#0f172a] border-slate-300 dark:border-[#1e293b]' : 'bg-slate-200 dark:bg-[#0f172a] border-[#13ec80]/30 shadow-[#13ec80]/10 shadow-[0_0_15px]'
                )}>
                  <div className="p-4 border-b border-slate-300 dark:border-[#1e293b] bg-slate-300/30 dark:bg-slate-800/30 flex justify-between items-center">
                    <span className="text-[10px] font-black italic uppercase tracking-widest text-slate-500">
                      {match.type} • {match.court}
                    </span>
                    <div className="flex items-center gap-3">
                      {match.status === 'Completed' ? (
                        <span className="text-[10px] font-bold text-[#13ec80] flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> COMPLETED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#13ec80] animate-pulse flex items-center gap-1">
                          <AlertCircle className="size-3 fill-current" /> LIVE
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 border-l border-slate-300 dark:border-[#1e293b] ml-2 pl-2">
                          <button 
                            onClick={() => {/* TODO: Implement Edit Match */}}
                            className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this match?")) {
                                // TODO: call deleteMatch
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
                      <p className="text-sm font-black italic">{match.teamA}</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest">TEAM A</p>
                    </div>
                    <div className="col-span-1 flex flex-col items-center">
                      <div className={clsx(
                        "px-2 py-1 font-black italic text-lg rounded leading-tight transition-colors",
                        match.scoreA > match.scoreB && match.status === 'Completed'
                          ? "bg-[#13ec80] text-[#020617]" 
                          : "text-slate-500 dark:text-slate-100"
                      )}>
                        {match.scoreA}
                      </div>
                      <div className="h-4 w-[1px] bg-slate-400/30 my-1"></div>
                      <div className={clsx(
                        "px-2 py-1 font-black italic text-lg rounded leading-tight transition-colors",
                        match.scoreB > match.scoreA && match.status === 'Completed'
                          ? "bg-[#13ec80] text-[#020617]" 
                          : "text-slate-500 dark:text-slate-100"
                      )}>
                        {match.scoreB}
                      </div>
                    </div>
                    <div className="col-span-3 text-left">
                      <p className="text-sm font-black italic">{match.teamB}</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest">TEAM B</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
