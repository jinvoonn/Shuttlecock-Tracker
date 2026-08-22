"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  Loader2,
  Sparkles,
  Zap,
  DollarSign
} from "lucide-react";
import { endAndStartNewSeason } from "@/lib/actions/seasons";
import { Season } from "@/lib/analytics/season";

interface SeasonAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSeason: Season | null;
  totalMatchesCount: number;
  activePlayersCount: number;
}

export default function SeasonAdminModal({
  isOpen,
  onClose,
  activeSeason,
  totalMatchesCount,
  activePlayersCount
}: SeasonAdminModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentNum = activeSeason?.season_number || 1;
  const nextNum = currentNum + 1;

  const handleEndSeason = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await endAndStartNewSeason();
      if (result.success) {
        setSuccessMsg(result.message || `Season ${nextNum} has started!`);
        setTimeout(() => {
          setSuccessMsg(null);
          setIsConfirming(false);
          onClose();
          window.location.reload();
        }, 1800);
      } else {
        setErrorMsg(result.error || "Failed to finalize season.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden font-['Lexend',_sans-serif]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-100">
              Season Management
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Competitive Matchmaking Lifecycle
            </p>
          </div>
        </div>

        {/* Success State */}
        {successMsg && (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-scale-up">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-black italic uppercase text-emerald-400">Season Transition Complete!</h3>
            <p className="text-xs text-slate-300 font-medium">{successMsg}</p>
          </div>
        )}

        {/* Normal / Confirm States */}
        {!successMsg && (
          <div className="space-y-6">
            
            {/* Active Season Overview Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Status</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Season {currentNum} Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Start Date</span>
                  <span className="font-mono text-slate-200 font-bold">{activeSeason?.start_date || "2023-09-13"}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Season Matches</span>
                  <span className="font-mono text-slate-200 font-bold">{totalMatchesCount} matches</span>
                </div>
              </div>
            </div>

            {/* Transition Rules Explanation */}
            {!isConfirming ? (
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed bg-slate-800/30 border border-slate-800/60 p-4 rounded-2xl">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-sky-400" /> Ending Season {currentNum} will:
                </h4>
                <ul className="space-y-2 text-[11px] list-disc list-inside">
                  <li><strong className="text-slate-200">Archive Standings:</strong> Snapshot final Season {currentNum} leaderboard and ranks into an immutable record.</li>
                  <li><strong className="text-slate-200">Soft Reset MMR:</strong> Compress skill ratings toward Base 1200 (e.g. 1800 → 1500, 1600 → 1400).</li>
                  <li><strong className="text-slate-200">Uncertainty Increase:</strong> Add +75 RD so players can recalibrate in the new season.</li>
                  <li className="text-emerald-400 font-bold"><strong className="text-emerald-300">Financial Isolation:</strong> Money owed, payments, and balances will NOT be modified.</li>
                </ul>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase italic">
                  <AlertTriangle className="size-5 shrink-0" />
                  Confirm Season Transition
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to end <strong className="text-white">Season {currentNum}</strong> and launch <strong className="text-emerald-400">Season {nextNum}</strong>?
                </p>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-400 shrink-0" />
                  <span>Money balances will remain 100% untouched.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  if (isConfirming) setIsConfirming(false);
                  else onClose();
                }}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {!isConfirming ? (
                <button
                  onClick={() => setIsConfirming(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2"
                >
                  <span>End & Start Season {nextNum}</span>
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={handleEndSeason}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Finalizing Season...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      <span>Confirm & Launch Season {nextNum}</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
