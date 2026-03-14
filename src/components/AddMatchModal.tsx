"use client";

import React, { useState } from 'react';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { addMatch } from "@/lib/actions/matches";
import clsx from 'clsx';

interface Player {
  id: string;
  name: string;
}

interface MatchModalProps {
  sessionId: string;
  players: Player[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMatchModal({ sessionId, players, onClose, onSuccess }: MatchModalProps) {
  const [teamA, setTeamA] = useState<string[]>(['', '']);
  const [teamB, setTeamB] = useState<string[]>(['', '']);
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const teamAIds = teamA.filter(Boolean);
    const teamBIds = teamB.filter(Boolean);

    if (teamAIds.length === 0 || teamBIds.length === 0) {
      setError("Each team needs at least one player.");
      return;
    }

    const allIds = [...teamAIds, ...teamBIds];
    if (new Set(allIds).size !== allIds.length) {
      setError("A player cannot be in two teams at once.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        sessionId,
        teamAIds,
        teamBIds,
        scoreA,
        scoreB
      };
      
      const result = await addMatch(JSON.stringify(payload));
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to save match.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
          <div className="flex items-center gap-3">
             <Trophy className="text-[#13ec80] size-6" />
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-100">Record New Match</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <X className="size-6" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-bold uppercase tracking-tight">
              <AlertCircle className="size-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Team A */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                 <span className="text-xs font-black uppercase tracking-widest text-[#13ec80]">Team A</span>
                 <input 
                   type="number" 
                   value={scoreA}
                   onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                   className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-black text-xl text-[#13ec80] outline-none focus:ring-1 focus:ring-[#13ec80]"
                 />
              </div>
              <div className="space-y-3">
                {[0, 1].map(i => (
                  <select
                    key={i}
                    value={teamA[i]}
                    onChange={(e) => {
                      const next = [...teamA];
                      next[i] = e.target.value;
                      setTeamA(next);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-bold uppercase text-xs focus:ring-1 focus:ring-[#13ec80] outline-none appearance-none"
                  >
                    <option value="">Select Player {i + 1}...</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-400">Team B</span>
                 <input 
                   type="number" 
                   value={scoreB}
                   onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                   className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-black text-xl text-slate-100 outline-none focus:ring-1 focus:ring-slate-500"
                 />
              </div>
              <div className="space-y-3">
                {[0, 1].map(i => (
                  <select
                    key={i}
                    value={teamB[i]}
                    onChange={(e) => {
                      const next = [...teamB];
                      next[i] = e.target.value;
                      setTeamB(next);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-bold uppercase text-xs focus:ring-1 focus:ring-slate-500 outline-none appearance-none"
                  >
                    <option value="">Select Player {i + 1}...</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-slate-950 px-12 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#13ec80]/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
