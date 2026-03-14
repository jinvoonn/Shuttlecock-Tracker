"use client";

import React from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Package, 
  PlusCircle, 
  LayoutGrid, 
  Activity, 
  Banknote,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  TrendingUp,
  Share2,
  History as HistoryIcon
} from 'lucide-react';

import { useRouter, usePathname } from "next/navigation";

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

interface MobileSessionDetailsProps {
  session: SessionMeta;
  matches: Match[];
  attendees: Attendee[];
}

export default function MobileSessionDetails({ session, matches, attendees }: MobileSessionDetailsProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#102219] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-200 dark:border-slate-800 shadow-2xl pb-32">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#102219]/80 backdrop-blur-md border-b border-[#13ec80]/10">
          <div className="flex items-center p-4 justify-between">
            <button onClick={() => router.back()} className="text-[#13ec80] flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#13ec80]/10 active:scale-95 transition-transform">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex-1 px-4 text-center">
              <h1 className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tight uppercase italic truncate">{session.name}</h1>
            </div>
            <div className="size-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="p-4">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-800 dark:bg-slate-900 aspect-[16/10] mb-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-[#102219] via-[#102219]/20 to-transparent z-10"></div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAl91YTHAMekTqLihKMJ5IYSfEdcIo0J6a8vUPUm5Kb-ldnERhYcMbv9a8yspM10OCYm2T4jUrAgIgCEq9XCTAfZ24Fl5NmdrOeGG10_LP2LYiMlf5Ju3f4Vl9zOEhjj_oxH0HsVcoBcoaGHwvsnvqmkV2meaGc95a-S3U5yIBqWJZl0qOm3vOuvO-yCEFJ1N-ruyGjL9zlTCUFa23ejlZdoUVDoD3JNKFd1xf5_0_YSMFFxMIgPahv4ePfTguXPJxTPFSvsCwGcd4"
                alt="Badminton Court"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#13ec80] text-[10px] font-black tracking-[0.2em] uppercase bg-[#13ec80]/10 backdrop-blur-md px-2 py-1 rounded">{session.division}</span>
                  <div className="size-1.5 rounded-full bg-[#13ec80] animate-pulse"></div>
                </div>
                <h2 className="text-white text-3xl font-black italic uppercase leading-tight tracking-tighter">{session.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-xs mt-3 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="size-3" /> {session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {session.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {session.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className={`flex flex-col gap-1 rounded-2xl p-4 bg-white dark:bg-slate-900 border-l-4 border-[#13ec80] shadow-sm text-left`}>
                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">Shuttles</p>
                <p className="text-slate-900 dark:text-slate-100 text-xl font-black italic leading-none mt-1">
                  {session.shuttlesUsed} 
                  <span className="text-[10px] not-italic font-bold text-slate-400 ml-1 uppercase">Units</span>
                </p>
              </div>
              <div className={`flex flex-col gap-1 rounded-2xl p-4 bg-white dark:bg-slate-900 border-l-4 border-blue-500 shadow-sm text-left`}>
                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">Cost/Head</p>
                <p className="text-slate-900 dark:text-slate-100 text-xl font-black italic leading-none mt-1">
                  ${session.costPerHead.toFixed(2)}
                </p>
              </div>
              <div className={`flex flex-col gap-1 rounded-2xl p-4 bg-white dark:bg-slate-900 border-l-4 border-purple-500 shadow-sm text-left`}>
                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest">Total</p>
                <p className="text-slate-900 dark:text-slate-100 text-xl font-black italic leading-none mt-1">
                  ${session.totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Attendees */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-slate-900 dark:text-slate-100 text-sm font-black uppercase tracking-[0.15em] italic">Attendees ({attendees.length})</h3>
              </div>
              <div className="flex flex-col gap-2">
                {attendees.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No attendees listed.</p>}
                {attendees.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 group">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center border border-[#13ec80]/20 text-[#13ec80] font-black text-xs uppercase">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase">{person.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{person.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#13ec80]">${person.fee.toFixed(2)}</p>
                      <p className={`text-[10px] font-black uppercase italic tracking-widest ${person.paid ? 'text-emerald-500' : 'text-amber-500'}`}>
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
                  className="text-[#13ec80] flex items-center gap-1.5 active:scale-95 transition-transform bg-[#13ec80]/10 px-3 py-1.5 rounded-lg border border-[#13ec80]/20"
                >
                  <PlusCircle className="size-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Log Result</span>
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {matches.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No matches recorded yet.</p>}
                {matches.map((match) => (
                  <div key={match.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-lg group hover:border-[#13ec80]/30 transition-all text-left">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                         {match.status === 'Completed' ? <TrendingUp className="size-3 text-[#13ec80]" /> : <Activity className="size-3 text-amber-500" />}
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{match.type}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter italic ${match.status === 'Completed' ? 'text-[#13ec80] bg-[#13ec80]/10' : 'text-amber-500 bg-amber-500/10'}`}>
                        {match.status}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                      <div className="flex-1 w-full flex flex-col gap-3">
                        <div className="flex justify-between items-center group/team">
                          <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate max-w-[140px] italic">{match.teamA}</span>
                          <span className={`text-3xl font-black italic leading-none tabular-nums ${match.scoreA >= match.scoreB && match.status === 'Completed' ? 'text-[#13ec80]' : 'text-slate-300 dark:text-slate-700'}`}>{match.scoreA}</span>
                        </div>
                        <div className="flex justify-between items-center group/team">
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate max-w-[140px] italic">{match.teamB}</span>
                          <span className={`text-3xl font-black italic leading-none tabular-nums ${match.scoreB >= match.scoreA && match.status === 'Completed' ? 'text-[#13ec80]' : 'text-slate-300 dark:text-slate-700'}`}>{match.scoreB}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block w-[1px] h-12 bg-slate-100 dark:bg-slate-800"></div>
                      <div className="sm:text-center shrink-0 flex sm:flex-col items-center gap-2 sm:gap-1 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 dark:border-slate-800">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Court</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100 italic leading-none">{match.court}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button 
              onClick={() => router.push(basePath)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group"
            >
              <LayoutGrid className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Dash</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/sessions`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[#13ec80] relative group"
            >
              <HistoryIcon className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Sessions</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-[#13ec80] shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/purchases`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group"
            >
              <Package className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/payments`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#13ec80] transition-colors group"
            >
              <Banknote className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
