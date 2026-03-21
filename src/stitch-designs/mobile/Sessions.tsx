"use client";

import React from 'react';
import {
  Plus,
  Calendar,
  Activity,
  LayoutGrid,
  History as HistoryIcon,
  Package,
  Banknote,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Trash,
  Target,
  Feather
} from 'lucide-react';
import { deleteSession } from '@/lib/actions/sessions';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRole } from '@/context/AuthContext';
import { SessionForm } from '@/app/[mode]/sessions/SessionForm';

interface Player { id: string; name: string; }
interface Purchase { id: string; remaining_quantity: number; tube_number: number; brands: { name: string } | null; price_per_tube: number; price_per_cock: number; }

interface SessionData {
  id: string;
  displayNumber: number;
  date: string;
  location: string;
  notes?: string;
  status: 'Completed' | 'Outstanding' | 'Archived';
  shuttleUsed: {
    name: string;
    quantity: number;
  };
  costPerPerson: number;
  attendees: string[];
  playerIds: string[];
  usageMap: Record<string, number>;
  totalNet: number;
}

interface MobileSessionsProps {
  sessions: SessionData[];
  allPlayers: Player[];
  allPurchases: Purchase[];
}

export default function MobileSessions({ sessions, allPlayers, allPurchases }: MobileSessionsProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const { isAdmin } = useRole();
  const [editingSession, setEditingSession] = useState<SessionData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (editingSession) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [editingSession]);

  const handleDelete = async (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to delete session at ${label}?`)) {
      try {
        await deleteSession(id);
        router.refresh();
      } catch (err) {
        alert("Failed to delete session");
      }
    }
  };

  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 min-h-screen flex flex-col antialiased">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl pb-24">
        {/* Header Section */}
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
        </header>


        {/* Main Content: Session List */}
        <main className="flex-1 px-4 py-6 space-y-6 text-left">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">History</h2>
          
          {sessions.length === 0 && (
            <div className="text-center py-10 text-slate-500">No sessions found.</div>
          )}

          {(expanded ? sessions : sessions.slice(0, 6)).map((session) => (
            <div key={session.id} className="bg-slate-800 border border-slate-700 rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded">Session {session.displayNumber}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-xl font-black italic tracking-tight text-slate-100 uppercase mt-1">
                    {session.location}
                  </h3>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    session.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-400' :
                    session.status === 'Outstanding' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {session.status}
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => router.push(`${basePath}/sessions/${session.id}/record-match`)}
                      className="size-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center active:scale-90 transition-all border border-orange-500/20"
                      title="Log Match"
                    >
                      <Target className="size-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => setEditingSession(session)}
                          className="relative z-50 size-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center active:scale-90 transition-all border border-slate-800"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(session.id, session.location)}
                          className="size-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-90 transition-all border border-rose-500/10"
                        >
                          <Trash className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 py-5 border-y border-slate-700">
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Shuttle Used</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Activity className="text-emerald-400 size-4" />
                    <span className="truncate">{session.shuttleUsed.name} ({session.shuttleUsed.quantity})</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end text-right">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Cost / Person</span>
                  <div className="text-sm font-mono font-black text-slate-100">
                    RM {session.costPerPerson.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex -space-x-3">
                  {session.attendees.slice(0, 3).map((name, i) => (
                    <div key={i} className="size-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase shadow-sm">
                      {name.slice(0, 2)}
                    </div>
                  ))}
                  {session.attendees.length > 3 && (
                    <div className="size-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                      +{session.attendees.length - 3}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                  className="bg-slate-900 text-emerald-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 hover:text-slate-950 transition-all active:scale-95 shadow-lg"
                >
                  OPEN SESSION
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ))}

          {sessions.length > 6 && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-emerald-400 text-sm font-bold uppercase tracking-widest hover:underline transition-all px-6 py-3 rounded-2xl border border-emerald-400/20 hover:bg-emerald-400/5 bg-slate-800 w-full"
              >
                {expanded ? 'Collapse' : `Expand All (${sessions.length})`}
              </button>
            </div>
          )}
        </main>
  
        {/* Floating Action Button */}
        {isAdmin && (
          <button 
            onClick={() => router.push(`${basePath}/sessions/log`)}
            className="fixed bottom-32 right-8 size-16 bg-emerald-400 text-slate-950 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center z-40 hover:scale-110 active:scale-90 transition-all border-b-4 border-emerald-600">
            <Plus className="size-8 font-black" />
          </button>
        )}
  
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex h-24 items-stretch px-4 max-w-[480px] mx-auto">
            <button 
              onClick={() => router.push(basePath)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <LayoutGrid className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Dash</span>
            </button>
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-emerald-400 relative group">
              <HistoryIcon className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Sessions</span>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/purchases`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <Package className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Stock</span>
            </button>
            <button 
              onClick={() => router.push(`${basePath}/payments`)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <Banknote className="size-6 group-active:scale-90" />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic leading-none mt-1">Payments</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl relative">
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
