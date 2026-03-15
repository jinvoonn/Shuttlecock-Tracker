"use client";

import React, { useState } from 'react';
import { X, Trophy, AlertCircle, Check, Trash2 } from 'lucide-react';
import { addMatch, updateMatch, deleteMatch } from "@/lib/actions/matches";
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
  initialMatch?: {
    id?: string;
    team_a_player1: string;
    team_a_player2: string;
    team_b_player1: string;
    team_b_player2: string;
    team_a_score: number;
    team_b_score: number;
  };
}

export default function AddMatchModal({ sessionId, players, onClose, onSuccess, initialMatch }: MatchModalProps) {
  const isEdit = !!initialMatch;
  const [playerTeams, setPlayerTeams] = useState<Record<string, number>>(() => {
    if (!initialMatch) return {};
    const teams: Record<string, number> = {};
    if (initialMatch.team_a_player1) teams[initialMatch.team_a_player1] = 1;
    if (initialMatch.team_a_player2 && initialMatch.team_a_player2 !== initialMatch.team_a_player1) teams[initialMatch.team_a_player2] = 1;
    if (initialMatch.team_b_player1) teams[initialMatch.team_b_player1] = 2;
    if (initialMatch.team_b_player2 && initialMatch.team_b_player2 !== initialMatch.team_b_player1) teams[initialMatch.team_b_player2] = 2;
    return teams;
  });

  const [scoreA, setScoreA] = useState<number>(isEdit ? initialMatch.team_a_score : 0);
  const [scoreB, setScoreB] = useState<number>(isEdit ? initialMatch.team_b_score : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cycle: None (0) → Team A (1) → Team B (2) → None (0)
  const cyclePlayer = (id: string) => {
    setError(null);
    setPlayerTeams(prev => {
      const current = prev[id] ?? 0;
      const next = (current + 1) % 3;
      return { ...prev, [id]: next };
    });
  };

  const teamAIds = Object.entries(playerTeams).filter(([, v]) => v === 1).map(([k]) => k);
  const teamBIds = Object.entries(playerTeams).filter(([, v]) => v === 2).map(([k]) => k);

  const handleSave = async () => {
    if (teamAIds.length === 0 || teamBIds.length === 0) {
      setError("Each team needs at least one player.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = JSON.stringify({
        sessionId,
        teamAIds,
        teamBIds,
        scoreA,
        scoreB
      });
      
      const result = (isEdit && initialMatch?.id)
        ? await updateMatch(initialMatch.id, payload)
        : await addMatch(payload);

      if (result && result.success) {
        onSuccess();
        onClose();
        // Since this is desktop, we might want a reload to show changes in the parent
        window.location.reload();
      } else {
        setError(result?.error || "Failed to save match.");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to save match");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialMatch?.id) return;
    if (!confirm("Are you sure you want to delete this match?")) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await deleteMatch(initialMatch.id);
      if (result && result.success) {
        onSuccess();
        onClose();
        window.location.reload();
      } else {
        setError(result?.error || "Failed to delete match.");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to delete match");
    } finally {
      setIsSubmitting(false);
    }
  };

  const playerMap = Object.fromEntries(players.map(p => [p.id, p.name]));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
          <div className="flex items-center gap-3">
             <Trophy className="text-[#13ec80] size-6" />
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-100">{isEdit ? 'Edit Match' : 'Record New Match'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <X className="size-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-bold uppercase tracking-tight">
              <AlertCircle className="size-5" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tap to cycle: A → B → Out</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {players.map(p => {
                const state = playerTeams[p.id] ?? 0;
                const isA = state === 1;
                const isB = state === 2;

                return (
                  <button
                    key={p.id}
                    onClick={() => cyclePlayer(p.id)}
                    className={clsx(
                      "p-3 rounded-xl border text-left transition-all relative group flex flex-col items-center justify-center gap-1",
                      isA ? "bg-sky-500/10 border-sky-500/50 text-sky-400" :
                      isB ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" :
                      "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-tight truncate w-full text-center">{p.name}</p>
                    {isA && <span className="text-[10px] font-black bg-sky-500 text-white px-2 py-0.5 rounded italic">TEAM A</span>}
                    {isB && <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded italic">TEAM B</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-800/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase italic">Team A Score</span>
                <input 
                  type="number" 
                  value={scoreA}
                  onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-black text-xl text-sky-400 outline-none"
                />
              </div>
              <div className="space-y-1">
                {teamAIds.length > 0 ? teamAIds.map(id => (
                  <p key={id} className="text-[10px] font-black text-slate-300 uppercase italic">
                    • {playerMap[id]}
                  </p>
                )) : (
                  <p className="text-[10px] font-bold text-slate-600 uppercase italic">No players</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase italic">Team B Score</span>
                <input 
                  type="number" 
                  value={scoreB}
                  onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-black text-xl text-emerald-400 outline-none"
                />
              </div>
              <div className="space-y-1">
                {teamBIds.length > 0 ? teamBIds.map(id => (
                  <p key={id} className="text-[10px] font-black text-slate-300 uppercase italic">
                    • {playerMap[id]}
                  </p>
                )) : (
                  <p className="text-[10px] font-bold text-slate-600 uppercase italic">No players</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center gap-3">
            <div>
              {isEdit && (
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2 disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                  Delete Match
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting || teamAIds.length === 0 || teamBIds.length === 0}
                className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-slate-950 px-12 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#13ec80]/20 disabled:opacity-30 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="size-4" />
                    Save Match
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
