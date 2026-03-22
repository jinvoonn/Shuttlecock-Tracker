"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, LayoutDashboard, CalendarDays, Package, Wallet, Plus, Pencil, Trash2, Feather
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { deleteSession } from "@/lib/actions/sessions";
import { useRole } from '@/context/AuthContext';
import { SessionForm } from '@/app/[mode]/sessions/SessionForm';

// Interfaces
interface Player { id: string; name: string; }
interface Purchase { id: string; remaining_quantity: number; tube_number: number; brands: { name: string } | null; price_per_tube: number; price_per_cock: number; }
interface SessionData {
  id: string; date: string; location: string; notes?: string; displayNumber?: number;
  status: 'Completed' | 'Outstanding' | 'Archived';
  shuttleUsed: { name: string; quantity: number; };
  costPerPerson: number; attendees: string[]; playerIds: string[];
  usageMap: Record<string, number>; totalNet: number;
}
interface DesktopSessionsListProps {
  sessions: SessionData[];
  allPlayers: Player[];
  allPurchases: Purchase[];
}

export default function SessionListUI({ sessions, allPlayers, allPurchases }: DesktopSessionsListProps) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { isAdmin } = useRole();
  const [expanded, setExpanded] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionData | null>(null);

  useEffect(() => {
    if (editingSession) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [editingSession]);

  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 font-['Lexend',_sans-serif]">
      {/* Background Overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center" style={{ backgroundImage: "url('/badminton-bg.png')" }} />
      <div className="fixed inset-0 bg-gradient-to-b from-[#020617]/90 to-[#020617]/95 pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="relative z-20 w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-lg shadow-sky-500/20">
                <Feather className="size-5 transform text-white rotate-45" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-slate-100">
                Cock<span className="text-sky-400">Count</span>
              </h2>
            </div>
            <p className="pl-1 text-[9px] font-bold uppercase leading-tight tracking-widest text-slate-500">
              Because Shuttlecocks Aren't Free
            </p>
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col space-y-2 px-4">
          <Link href={`${basePath}`} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <LayoutDashboard className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">DASHBOARD</span>
          </Link>
          <Link href={`${basePath}/sessions`} className="flex w-full items-center gap-3 rounded-xl bg-[#13ec80] px-4 py-3 font-black text-slate-950 shadow-lg shadow-[#13ec80]/10 transition-all">
            <CalendarDays className="size-5" />
            <span className="text-sm uppercase tracking-wide">SESSIONS</span>
          </Link>
          <Link href={`${basePath}/purchases`} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <Package className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">STOCK</span>
          </Link>
          <Link href={`${basePath}/payments`} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <Wallet className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">PAYMENTS</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-20 flex w-full flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-8 px-8 py-8 md:py-12">
          {/* Hero Title & Actions */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 text-left">
              <h2 className="text-5xl font-black italic uppercase leading-none tracking-tighter text-slate-100">
                Sessions History
              </h2>
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
                Active matches & shuttle tracking
              </p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => router.push(`${basePath}/sessions/log`)}
                className="flex items-center gap-2 rounded border border-[#13ec80] bg-[#13ec80] px-6 py-3 text-xs font-black uppercase tracking-tighter text-[#020617] shadow-lg shadow-[#13ec80]/20 transition-all hover:brightness-110">
                <Plus className="size-4" /> Log New
              </button>
            )}
          </div>

          {sessions.length === 0 && (
            <div className="pt-10 text-center text-lg font-bold text-slate-500">No sessions found.</div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {(expanded ? sessions : sessions.slice(0, 6)).map((session) => (
              <div 
                key={session.id} 
                className="group block cursor-pointer"
                onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
              >
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition-all hover:border-[#13ec80]/50">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-tight text-slate-500">
                        {new Date(session.date).toLocaleDateString()} • {session.location}
                      </span>
                      <h3 className="mt-1 text-2xl font-black italic uppercase tracking-tight text-slate-100 transition-colors group-hover:text-[#13ec80]">
                        Session {session.displayNumber || session.id.slice(0, 4)}
                      </h3>
                    </div>
                    <span className={clsx("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                        session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        session.status === 'Outstanding' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      )}>
                      {session.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-slate-800/80 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Shuttle Used</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Activity className="size-4 text-[#13ec80]" />
                        {session.shuttleUsed.name} ({session.shuttleUsed.quantity})
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cost / Person</span>
                      <div className="font-mono text-lg font-black text-slate-100">
                        RM{session.costPerPerson.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex -space-x-2.5">
                      {session.attendees.slice(0, 4).map((name, i) => (
                        <div key={i} className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">
                          {name.slice(0, 2)}
                        </div>
                      ))}
                      {session.attendees.length > 4 && (
                        <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-700 text-[10px] font-black text-slate-300">
                          +{session.attendees.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Net</span>
                      <span className={clsx("font-mono text-2xl font-black leading-none", session.totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                        {session.totalNet >= 0 ? '+' : '-'}RM{Math.abs(session.totalNet).toFixed(2)}
                      </span>
                      {isAdmin && (
                        <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingSession(session);
                            }}
                            className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button 
                             onClick={async (e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               if (window.confirm("Are you sure you want to delete this session? This will also restore used shuttlecocks to inventory.")) {
                                  await deleteSession(session.id);
                                  window.location.reload();
                               }
                             }}
                             className="rounded p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                           >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sessions.length > 6 && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setExpanded(!expanded)}
                className="rounded-xl border border-emerald-400/20 px-6 py-2 text-sm font-bold uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-400/5 hover:underline"
              >
                {expanded ? 'Collapse' : `Expand All (${sessions.length})`}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl relative">
            <SessionForm
              players={allPlayers}
              purchases={allPurchases}
              initialData={{
                id: editingSession.id,
                date: editingSession.date,
                location: editingSession.location,
                notes: editingSession.notes || "",
                players: editingSession.playerIds,
                usage: editingSession.usageMap
              }}
              isEdit={true}
              onCancel={() => setEditingSession(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
