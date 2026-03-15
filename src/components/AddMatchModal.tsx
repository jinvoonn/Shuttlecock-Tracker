"use client";

import React, { useState } from 'react';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { addMatch, updateMatch } from "@/lib/actions/matches";
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
    id: string;
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
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    isEdit ? [initialMatch.team_a_player1, initialMatch.team_a_player2, initialMatch.team_b_player1, initialMatch.team_b_player2].filter(Boolean) : []
  );
  const [teamA, setTeamA] = useState<string[]>(
    isEdit ? [initialMatch.team_a_player1, initialMatch.team_a_player2].filter(Boolean) : []
  );
  const [teamB, setTeamB] = useState<string[]>(
    isEdit ? [initialMatch.team_b_player1, initialMatch.team_b_player2].filter(Boolean) : []
  );
  const [scoreA, setScoreA] = useState<number>(isEdit ? initialMatch.team_a_score : 0);
  const [scoreB, setScoreB] = useState<number>(isEdit ? initialMatch.team_b_score : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlayer = (id: string) => {
    setError(null);
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(prev => prev.filter(pid => pid !== id));
      setTeamA(prev => prev.filter(pid => pid !== id));
      setTeamB(prev => prev.filter(pid => pid !== id));
    } else {
      if (selectedPlayerIds.length >= 4) {
        setError("Maximum 4 players allowed per match.");
        return;
      }
      setSelectedPlayerIds(prev => [...prev, id]);
    }
  };

  const assignToTeam = (id: string, team: 'A' | 'B') => {
    if (team === 'A') {
      if (teamA.length >= 2) return;
      setTeamA(prev => [...prev, id]);
      setTeamB(prev => prev.filter(pid => pid !== id));
    } else {
      if (teamB.length >= 2) return;
      setTeamB(prev => [...prev, id]);
      setTeamA(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleSave = async () => {
    if (teamA.length === 0 || teamB.length === 0) {
      setError("Each team needs at least one player.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        sessionId,
        playerA1: teamA[0],
        playerA2: teamA[1] || "",
        playerB1: teamB[0],
        playerB2: teamB[1] || "",
        scoreA,
        scoreB
      };
      
      const result = isEdit 
        ? await updateMatch(initialMatch.id, JSON.stringify(payload))
        : await addMatch(JSON.stringify(payload));

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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Select Players (2-4)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map(p => {
                const isSelected = selectedPlayerIds.includes(p.id);
                const team = teamA.includes(p.id) ? 'A' : teamB.includes(p.id) ? 'B' : null;

                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlayer(p.id)}
                    className={clsx(
                      "p-3 rounded-xl border text-left transition-all relative group",
                      isSelected 
                        ? "bg-[#13ec80]/10 border-[#13ec80]/50 text-slate-100" 
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                    )}
                  >
                    <p className="text-xs font-bold uppercase tracking-tight truncate">{p.name}</p>
                    {isSelected && (
                      <div className="mt-2 flex gap-1">
                        <span 
                          onClick={(e) => { e.stopPropagation(); assignToTeam(p.id, 'A'); }}
                          className={clsx(
                            "text-[8px] font-black px-1.5 py-0.5 rounded cursor-pointer",
                            team === 'A' ? "bg-[#13ec80] text-[#020617]" : "bg-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          T.A
                        </span>
                        <span 
                          onClick={(e) => { e.stopPropagation(); assignToTeam(p.id, 'B'); }}
                          className={clsx(
                            "text-[8px] font-black px-1.5 py-0.5 rounded cursor-pointer",
                            team === 'B' ? "bg-slate-400 text-[#020617]" : "bg-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          T.B
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-800/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-[#13ec80] uppercase italic">Team A Score</span>
                <input 
                  type="number" 
                  value={scoreA}
                  onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-black text-xl text-[#13ec80] outline-none"
                />
              </div>
              <div className="space-y-1">
                {teamA.map(id => (
                  <p key={id} className="text-[10px] font-black text-slate-300 uppercase italic">
                    • {players.find(p => p.id === id)?.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Team B Score</span>
                <input 
                  type="number" 
                  value={scoreB}
                  onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center font-mono font-black text-xl text-slate-100 outline-none"
                />
              </div>
              <div className="space-y-1">
                {teamB.map(id => (
                  <p key={id} className="text-[10px] font-black text-slate-300 uppercase italic">
                    • {players.find(p => p.id === id)?.name}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting || teamA.length === 0 || teamB.length === 0}
              className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-slate-950 px-12 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#13ec80]/20 disabled:opacity-30"
            >
              {isSubmitting ? 'Saving...' : 'Save Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
