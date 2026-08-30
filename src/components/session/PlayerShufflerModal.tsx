"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Dices, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Trophy, 
  Crown, 
  Coffee, 
  Play, 
  Sparkles, 
  Award, 
  AlertTriangle,
  RotateCcw,
  Users
} from "lucide-react";
import clsx from "clsx";
import { 
  ShufflerPlayer, 
  ShufflerOption, 
  TournamentState, 
  TournamentMatch 
} from "@/lib/tournament/types";
import { generatePairingOptions } from "@/lib/tournament/pairing";
import { initializeTournamentState, advanceTournamentState } from "@/lib/tournament/progression";

interface PlayerShufflerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionDate: string;
  attendees: {
    id: string;
    name: string;
    elo?: number;
    skillRating?: number;
  }[];
  pastMatches?: any[];
  onSelectMatchup: (teamAIds: string[], teamBIds: string[]) => void;
}

export function PlayerShufflerModal({
  isOpen,
  onClose,
  sessionId,
  sessionDate,
  attendees,
  pastMatches = [],
  onSelectMatchup
}: PlayerShufflerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [numCourts, setNumCourts] = useState<number>(1);
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number>(0);
  const [generatedOptions, setGeneratedOptions] = useState<ShufflerOption[]>([]);
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);

  // Confirm Dialogs
  const [confirmAction, setConfirmAction] = useState<"exit" | "reshuffle" | null>(null);

  useEffect(() => {
    setMounted(true);
    // Recover active tournament state from sessionStorage if exists
    try {
      const saved = sessionStorage.getItem(`tournament_state_${sessionId}`);
      if (saved) {
        setTournamentState(JSON.parse(saved));
      }
    } catch {}
  }, [sessionId]);

  // Sync tournament state to sessionStorage
  useEffect(() => {
    if (!sessionId) return;
    try {
      if (tournamentState) {
        sessionStorage.setItem(`tournament_state_${sessionId}`, JSON.stringify(tournamentState));
      } else {
        sessionStorage.removeItem(`tournament_state_${sessionId}`);
      }
    } catch {}
  }, [tournamentState, sessionId]);

  // Map attendees
  const shufflerPlayers: ShufflerPlayer[] = useMemo(() => {
    return attendees.map(a => ({
      id: a.id,
      name: a.name,
      elo: a.elo ?? 1200,
      skillRating: a.skillRating
    }));
  }, [attendees]);

  // Generate options on mount or when court count changes
  const handleGenerate = () => {
    const options = generatePairingOptions(
      shufflerPlayers,
      numCourts,
      5,
      pastMatches,
      tournamentState?.restHistory || {}
    );
    setGeneratedOptions(options);
    setCurrentOptionIndex(0);
  };

  useEffect(() => {
    if (isOpen && !tournamentState) {
      handleGenerate();
    }
  }, [isOpen, numCourts, shufflerPlayers.length]);

  if (!isOpen || !mounted) return null;

  const currentOption: ShufflerOption | undefined = generatedOptions[currentOptionIndex];

  // Navigation handlers
  const handlePrev = () => {
    if (generatedOptions.length === 0) return;
    setCurrentOptionIndex(prev => (prev === 0 ? generatedOptions.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (generatedOptions.length === 0) return;
    setCurrentOptionIndex(prev => (prev === generatedOptions.length - 1 ? 0 : prev + 1));
  };

  // Tournament Starters
  const handleAcceptPairing = () => {
    if (!currentOption) return;
    const isSingles = attendees.length < 4;
    const initialTournament = initializeTournamentState(
      sessionId,
      currentOption,
      numCourts,
      isSingles ? 1 : 2
    );
    setTournamentState(initialTournament);
  };

  const handleMarkWinner = (courtNumber: number, winner: "A" | "B") => {
    if (!tournamentState) return;
    setTournamentState(prev => {
      if (!prev) return null;
      const updatedCourts = prev.currentRound.courts.map(c => {
        if (c.courtNumber === courtNumber) {
          return { ...c, winner };
        }
        return c;
      });
      return {
        ...prev,
        currentRound: {
          ...prev.currentRound,
          courts: updatedCourts
        }
      };
    });
  };

  const handleAdvanceTournament = () => {
    if (!tournamentState) return;
    const allDecided = tournamentState.currentRound.courts.every(c => !!c.winner);
    if (!allDecided) return;

    const nextState = advanceTournamentState(tournamentState, tournamentState.currentRound.courts);
    setTournamentState(nextState);
  };

  const handleRecordCourtScore = (teamA: ShufflerPlayer[], teamB: ShufflerPlayer[]) => {
    onSelectMatchup(teamA.map(p => p.id), teamB.map(p => p.id));
    onClose();
  };

  const handleConfirmExit = () => {
    setTournamentState(null);
    setConfirmAction(null);
  };

  const handleConfirmReshuffle = () => {
    setTournamentState(null);
    setConfirmAction(null);
    handleGenerate();
  };

  const allCourtsDecided = tournamentState?.currentRound.courts.every(c => !!c.winner) ?? false;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col font-['Lexend',_sans-serif] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "size-10 rounded-2xl border flex items-center justify-center shadow-lg transition-all",
              tournamentState 
                ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-400 shadow-amber-500/10" 
                : "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
            )}>
              {tournamentState ? <Trophy className="size-5" /> : <Dices className="size-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-2">
                {tournamentState ? (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Crown className="size-4" /> Tournament • Round {tournamentState.currentRound.roundNumber}
                  </span>
                ) : (
                  "Player Shuffler"
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {tournamentState 
                  ? "Winner vs Winner • Loser vs Loser • Fair Rotation" 
                  : `Session: ${sessionDate} • ${attendees.length} Players`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Confirmation Modal Layer */}
        {confirmAction && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="size-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="size-6" />
            </div>
            <h4 className="text-base font-black uppercase text-slate-100">
              {confirmAction === "exit" ? "End Tournament?" : "Reshuffle Players?"}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              {confirmAction === "exit" 
                ? "Current active tournament progress will be lost. Already logged matches in session history remain intact." 
                : "This will reset current pairings and generate new combinations."}
            </p>
            <div className="flex gap-3 pt-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction === "exit" ? handleConfirmExit : handleConfirmReshuffle}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg shadow-rose-500/20"
              >
                {confirmAction === "exit" ? "End Tournament" : "Reshuffle"}
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {attendees.length < 2 ? (
            <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
              <Users className="size-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                Need at least 2 attendees to shuffle pairings.
              </p>
            </div>
          ) : tournamentState ? (
            /* ========================================================================= */
            /* 1. ACTIVE TOURNAMENT MODE VIEW                                            */
            /* ========================================================================= */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Tournament Banner & Actions */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                    R{tournamentState.currentRound.roundNumber}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">
                      Tournament Ladder Progression
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Winners advance • Losers rotate with bench
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmAction("reshuffle")}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 rounded-lg transition-colors"
                    title="Reshuffle tournament"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction("exit")}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-[10px] font-black uppercase rounded-lg transition-colors"
                  >
                    End
                  </button>
                </div>
              </div>

              {/* Tournament Courts List */}
              <div className="space-y-4">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Play className="size-3.5 text-amber-400 fill-amber-400" />
                    Round {tournamentState.currentRound.roundNumber} Matchups
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Select winner to advance
                  </span>
                </div>

                {tournamentState.currentRound.courts.map((court) => {
                  return (
                    <div
                      key={court.courtNumber}
                      className={clsx(
                        "p-4 rounded-3xl border transition-all space-y-3 relative",
                        court.winner 
                          ? "bg-slate-950/60 border-slate-800" 
                          : "bg-slate-950 border-amber-400/30 shadow-lg shadow-amber-400/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-400 uppercase tracking-widest text-xs bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                          {court.courtNumber === 1 ? "👑 Court 1" : `🏸 Court ${court.courtNumber}`}
                        </span>

                        {court.winner && (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <Check className="size-3" /> Winner: Team {court.winner}
                          </span>
                        )}
                      </div>

                      {/* Teams Winner Selector Grid */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        {/* Team A Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkWinner(court.courtNumber, "A")}
                          className={clsx(
                            "col-span-2 p-3 rounded-2xl border text-left transition-all relative select-none",
                            court.winner === "A"
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30"
                              : court.winner === "B"
                              ? "bg-slate-900/60 border-slate-800/80 opacity-50"
                              : "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 active:scale-98"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase">Team A</span>
                            {court.winner === "A" && <Crown className="size-3.5 text-amber-400" />}
                          </div>
                          {court.teamA.map(p => (
                            <div key={p.id} className="text-xs font-bold text-slate-200 truncate">
                              {p.name}
                            </div>
                          ))}
                          <div className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {court.winner === "A" ? "✓ Won Match" : "Click if Won"}
                          </div>
                        </button>

                        {/* VS */}
                        <div className="col-span-1 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-black italic text-slate-600 uppercase">VS</span>
                        </div>

                        {/* Team B Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkWinner(court.courtNumber, "B")}
                          className={clsx(
                            "col-span-2 p-3 rounded-2xl border text-left transition-all relative select-none",
                            court.winner === "B"
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30"
                              : court.winner === "A"
                              ? "bg-slate-900/60 border-slate-800/80 opacity-50"
                              : "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 active:scale-98"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase">Team B</span>
                            {court.winner === "B" && <Crown className="size-3.5 text-amber-400" />}
                          </div>
                          {court.teamB.map(p => (
                            <div key={p.id} className="text-xs font-bold text-slate-200 truncate">
                              {p.name}
                            </div>
                          ))}
                          <div className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {court.winner === "B" ? "✓ Won Match" : "Click if Won"}
                          </div>
                        </button>
                      </div>

                      {/* Log Official Score to Session */}
                      <button
                        type="button"
                        onClick={() => handleRecordCourtScore(court.teamA, court.teamB)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Award className="size-3.5" />
                        Log Score to Session
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Waiting Pairs Queue */}
              {tournamentState.currentRound.waitingPairs.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-black uppercase text-amber-400 tracking-wider">
                      <Coffee className="size-3.5 text-amber-400" />
                      <span>Waiting Pairs ({tournamentState.currentRound.waitingPairs.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Will play next round
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {tournamentState.currentRound.waitingPairs.map((w, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">
                          {w.players.map(p => p.name).join(" + ")}
                        </span>
                        <span className="text-[10px] font-black text-amber-400 uppercase">
                          Queue #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resting Players Queue */}
              {tournamentState.currentRound.restingPlayers.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-black uppercase text-slate-400 tracking-wider">
                      <Coffee className="size-3.5 text-sky-400" />
                      <span>Resting ({tournamentState.currentRound.restingPlayers.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Next up rotation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {tournamentState.currentRound.restingPlayers.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-300 truncate">{p.name}</span>
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 shrink-0">
                          Resting
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advance Round Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!allCourtsDecided}
                  onClick={handleAdvanceTournament}
                  className={clsx(
                    "w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl",
                    allCourtsDecided
                      ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-400/20 cursor-pointer"
                      : "bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed"
                  )}
                >
                  <Sparkles className="size-4" />
                  {allCourtsDecided 
                    ? `Advance to Round ${tournamentState.currentRound.roundNumber + 1}` 
                    : "Select Winners on All Courts to Advance"}
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. PLAYER SHUFFLER BROWSER VIEW (Options 1/5)                             */
            /* ========================================================================= */
            <div className="space-y-5">
              {/* Top Controls: Court Selector */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Courts:</span>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    {[1, 2, 3, 4].map(c => {
                      const isDisabled = attendees.length < c * 2;
                      return (
                        <button
                          key={c}
                          disabled={isDisabled}
                          onClick={() => setNumCourts(c)}
                          className={clsx(
                            "px-3 py-1 rounded-lg text-xs font-black uppercase transition-all",
                            numCourts === c
                              ? "bg-emerald-400 text-slate-950 shadow-sm"
                              : isDisabled
                              ? "text-slate-700 opacity-40 cursor-not-allowed"
                              : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          {c} {c === 1 ? "Court" : "Courts"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-emerald-400 border border-emerald-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                >
                  <Dices className="size-3.5" />
                  Shuffle Players
                </button>
              </div>

              {/* Option Carousel Navigator */}
              {generatedOptions.length > 0 && currentOption && (
                <div className="space-y-4">
                  {/* Option Header Pagination */}
                  <div className="flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
                    >
                      <ChevronLeft className="size-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Indicators */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                        Pairing Option {currentOptionIndex + 1} / {generatedOptions.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {generatedOptions.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentOptionIndex(idx)}
                            className={clsx(
                              "size-2 rounded-full cursor-pointer transition-all",
                              idx === currentOptionIndex 
                                ? "bg-emerald-400 w-4 shadow-sm shadow-emerald-400/50" 
                                : "bg-slate-800 hover:bg-slate-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Option Card Details */}
                  <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative animate-in fade-in zoom-in-98 duration-150">
                    {/* Court Matches */}
                    <div className="space-y-3">
                      {currentOption.courtMatches.map((court) => (
                        <div
                          key={court.courtNumber}
                          className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Court {court.courtNumber}
                          </span>

                          <div className="grid grid-cols-5 gap-2 items-center pt-1">
                            <div className="col-span-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-left">
                              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Team A</span>
                              <span className="text-xs font-bold text-slate-200 truncate block">
                                {court.teamA.map(p => p.name).join(" + ")}
                              </span>
                            </div>

                            <div className="col-span-1 text-center">
                              <span className="text-xs font-black italic text-slate-600">VS</span>
                            </div>

                            <div className="col-span-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-left">
                              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Team B</span>
                              <span className="text-xs font-bold text-slate-200 truncate block">
                                {court.teamB.map(p => p.name).join(" + ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Waiting Pairs (if any) */}
                    {currentOption.waitingPairs.length > 0 && (
                      <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                          <Coffee className="size-3" /> Waiting Next ({currentOption.waitingPairs.length} Pair)
                        </span>
                        <div className="space-y-1">
                          {currentOption.waitingPairs.map((w, idx) => (
                            <div key={idx} className="text-xs font-bold text-slate-300">
                              • {w.players.map(p => p.name).join(" + ")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resting Players (if any) */}
                    {currentOption.restingPlayers.length > 0 && (
                      <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider flex items-center gap-1">
                          <Coffee className="size-3" /> Rest:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {currentOption.restingPlayers.map(p => (
                            <span key={p.id} className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Accept Pairing Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAcceptPairing}
                        className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 cursor-pointer"
                      >
                        <Check className="size-4" />
                        Accept Pairing & Start Tournament
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            {attendees.length} session players
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
