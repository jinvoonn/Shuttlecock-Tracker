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
  DollarSign,
  RotateCcw,
  Clock
} from "lucide-react";
import { endAndStartNewSeason, rollbackToPreviousSeason } from "@/lib/actions/seasons";
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRollbackConfirming, setIsRollbackConfirming] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(todayStr);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentNum = activeSeason?.season_number || 1;
  const nextNum = currentNum + 1;
  const canRollback = currentNum > 1 && totalMatchesCount === 0;

  const handleEndSeason = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await endAndStartNewSeason(customStartDate);
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

  const handleRollback = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await rollbackToPreviousSeason();
      if (result.success) {
        setSuccessMsg(result.message || `Rolled back to Season ${currentNum - 1}!`);
        setTimeout(() => {
          setSuccessMsg(null);
          setIsRollbackConfirming(false);
          onClose();
          window.location.reload();
        }, 1800);
      } else {
        setErrorMsg(result.error || "Failed to rollback season.");
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
            <h3 className="text-lg font-black italic uppercase text-emerald-400">Operation Successful!</h3>
            <p className="text-xs text-slate-300 font-medium">{successMsg}</p>
          </div>
        )}

        {/* Normal / Confirm States */}
        {!successMsg && (
          <div className="space-y-5">
            
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

            {/* Custom Season Start Date Selector */}
            {!isRollbackConfirming && (
              <div className="bg-slate-800/40 border border-slate-800/80 p-4 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-emerald-400" />
                    Season {nextNum} Official Start Date
                  </span>
                  <span className="text-[9px] text-slate-500 normal-case font-normal">Custom date allowed</span>
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  disabled={isLoading || isConfirming}
                  className="w-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                />
              </div>
            )}

            {/* Transition Rules Explanation */}
            {!isConfirming && !isRollbackConfirming && (
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed bg-slate-800/30 border border-slate-800/60 p-4 rounded-2xl">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-sky-400" /> Ending Season {currentNum} will:
                </h4>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                  <li><strong className="text-slate-200">Archive Standings:</strong> Snapshot final Season {currentNum} leaderboard and ranks into an immutable record.</li>
                  <li><strong className="text-slate-200">Asymmetric Soft Reset:</strong> Compress high MMRs ($&gt;1200$) 50% toward 1200 (min 1200), preserving sub-1200 MMRs.</li>
                  <li><strong className="text-slate-200">Uncertainty (+75 RD):</strong> Recalibrates uncertainty for rapid initial mobility.</li>
                  <li className="text-emerald-400 font-bold"><strong className="text-emerald-300">Financial Isolation:</strong> Balances & payments remain 100% untouched.</li>
                </ul>
              </div>
            )}

            {/* End Season Confirmation Prompt */}
            {isConfirming && (
              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase italic">
                  <AlertTriangle className="size-5 shrink-0" />
                  Confirm Season Transition
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to end <strong className="text-white">Season {currentNum}</strong> and launch <strong className="text-emerald-400">Season {nextNum}</strong> starting on <strong className="text-emerald-300">{customStartDate}</strong>?
                </p>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-400 shrink-0" />
                  <span>Financial accounts & debts will remain 100% untouched.</span>
                </div>
              </div>
            )}

            {/* Rollback Confirmation Prompt */}
            {isRollbackConfirming && (
              <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase italic">
                  <RotateCcw className="size-5 shrink-0" />
                  Rollback to Season {currentNum - 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This will delete empty <strong className="text-white">Season {currentNum}</strong> and re-open <strong className="text-amber-400">Season {currentNum - 1}</strong> as active.
                </p>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                  <span>Zero match data will be lost because Season {currentNum} has 0 matches.</span>
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
            <div className="flex items-center justify-between pt-2">
              {/* Rollback Trigger (if eligible) */}
              <div>
                {!isConfirming && !isRollbackConfirming && canRollback && (
                  <button
                    onClick={() => setIsRollbackConfirming(true)}
                    disabled={isLoading}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                    title={`Revert to Season ${currentNum - 1}`}
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Rollback Season</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isConfirming) setIsConfirming(false);
                    else if (isRollbackConfirming) setIsRollbackConfirming(false);
                    else onClose();
                  }}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* Normal State: Show End Season Button */}
                {!isConfirming && !isRollbackConfirming && (
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2"
                  >
                    <span>End & Start Season {nextNum}</span>
                    <ArrowRight className="size-4" />
                  </button>
                )}

                {/* Confirming End Season */}
                {isConfirming && (
                  <button
                    onClick={handleEndSeason}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        <span>Launch Season {nextNum}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Confirming Rollback */}
                {isRollbackConfirming && (
                  <button
                    onClick={handleRollback}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Reverting...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="size-4" />
                        <span>Confirm Rollback</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
