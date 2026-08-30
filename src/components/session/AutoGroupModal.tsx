"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Dices, 
  Scale, 
  Lock, 
  Unlock, 
  Users, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2,
  Play,
  Flame,
  Coffee,
  Trophy,
  Crown,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award
} from "lucide-react";
import clsx from "clsx";
import PlayerName from "@/components/ui/PlayerName";
import { 
  GroupingPlayer, 
  MatchRecommendation, 
  LockedPair,
  CourtAssignment,
  CourtShuffleResult,
  TournamentState,
  TournamentRound,
  TournamentCourtMatch,
  shuffleCourts,
  generateBalanced2v2,
  initializeTournament,
  advanceTournamentRound
} from "@/lib/analytics/autoGroup";

interface AutoGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: {
    id: string;
    name: string;
    elo?: number;
    placementMatchesPlayed?: number;
  }[];
  matchCountPerPlayer?: Record<string, number>;
  onSelectMatchup: (teamAIds: string[], teamBIds: string[]) => void;
}

export function AutoGroupModal({
  isOpen,
  onClose,
  attendees,
  matchCountPerPlayer = {},
  onSelectMatchup
}: AutoGroupModalProps) {
  const [activeTab, setActiveTab] = useState<"shuffler" | "custom">("shuffler");
  const [numCourts, setNumCourts] = useState<number>(1);
  const [lockedPairs, setLockedPairs] = useState<LockedPair[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  
  // Tournament Mode State
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  
  // Custom 4-Player Balancer state
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Format attendees as GroupingPlayers
  const groupingPlayers: GroupingPlayer[] = useMemo(() => {
    return attendees.map(a => ({
      id: a.id,
      name: a.name,
      elo: a.elo ?? 1200,
      placementMatchesPlayed: a.placementMatchesPlayed,
      matchesPlayedInSession: matchCountPerPlayer[a.id] || 0
    }));
  }, [attendees, matchCountPerPlayer]);

  // Run Court Shuffler with Rotation Fairness and Locked Pairs
  const shuffleResult: CourtShuffleResult = useMemo(() => {
    return shuffleCourts(groupingPlayers, matchCountPerPlayer, numCourts, lockedPairs);
  }, [groupingPlayers, matchCountPerPlayer, numCourts, lockedPairs, shuffleSeed]);

  // Custom 4-player combinations
  const customRecommendations: MatchRecommendation[] = useMemo(() => {
    if (selectedCustomIds.length !== 4) return [];
    const chosen = groupingPlayers.filter(p => selectedCustomIds.includes(p.id));
    return generateBalanced2v2(chosen);
  }, [groupingPlayers, selectedCustomIds]);

  if (!isOpen || !mounted) return null;

  const handleReshuffle = () => {
    setShuffleSeed(prev => prev + 1);
  };

  const toggleCustomPlayer = (id: string) => {
    setSelectedCustomIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  // Locked Pairs Helpers
  const addLockedPair = () => {
    if (lockedPairs.length >= 2) return;
    const lockedIds = new Set(lockedPairs.flatMap(p => [p.player1Id, p.player2Id]));
    const available = attendees.filter(a => !lockedIds.has(a.id));
    if (available.length >= 2) {
      setLockedPairs(prev => [
        ...prev,
        { player1Id: available[0].id, player2Id: available[1].id }
      ]);
    }
  };

  const updateLockedPair = (index: number, playerNum: 1 | 2, playerId: string) => {
    setLockedPairs(prev => {
      const next = [...prev];
      if (playerNum === 1) next[index].player1Id = playerId;
      else next[index].player2Id = playerId;
      return next;
    });
  };

  const removeLockedPair = (index: number) => {
    setLockedPairs(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyMatchup = (rec: { teamA: GroupingPlayer[]; teamB: GroupingPlayer[] }) => {
    const teamAIds = rec.teamA.map(p => p.id);
    const teamBIds = rec.teamB.map(p => p.id);
    onSelectMatchup(teamAIds, teamBIds);
    onClose();
  };

  // Tournament Flow Handlers
  const handleStartTournament = () => {
    if (shuffleResult.courtAssignments.length === 0) return;
    const initialTournament = initializeTournament(shuffleResult, numCourts);
    setTournamentState(initialTournament);
  };

  const handleMarkCourtWinner = (courtNumber: number, winner: "A" | "B") => {
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

    const nextState = advanceTournamentRound(tournamentState, tournamentState.currentRound.courts);
    setTournamentState(nextState);
  };

  const handleExitTournament = () => {
    setTournamentState(null);
  };

  const allLockedPlayerIds = new Set(lockedPairs.flatMap(p => [p.player1Id, p.player2Id]));
  const allCourtsDecided = tournamentState?.currentRound.courts.every(c => !!c.winner) ?? false;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col font-['Lexend',_sans-serif] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                  "Court Shuffler & Tournament Mode"
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {tournamentState 
                  ? "King of the Court: Winner vs Winner • Rotation Ladder"
                  : "Fair rotation • Multi-court assignment • King of the court"}
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

        {/* Tab Selector (only when not in live tournament) */}
        {!tournamentState && (
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab("shuffler")}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                activeTab === "shuffler"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Dices className="size-3.5" />
              Random Court Shuffler
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                activeTab === "custom"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Scale className="size-3.5" />
              Custom 4-Player Balancer
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {attendees.length < 4 ? (
            <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
              <Users className="size-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                Need at least 4 attendees to assign court matches.
              </p>
              <p className="text-xs text-slate-600">
                Currently {attendees.length} player(s) joined in this session.
              </p>
            </div>
          ) : tournamentState ? (
            /* ACTIVE TOURNAMENT MODE VIEW */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Tournament Banner & Exit */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                    R{tournamentState.currentRound.roundNumber}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">
                      King of the Court Ladder
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Winners stay / promote • Losers rotate with bench
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExitTournament}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-[10px] font-black uppercase rounded-lg transition-colors"
                >
                  Exit Tournament
                </button>
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
                  const hasWinner = !!court.winner;
                  return (
                    <div
                      key={court.courtNumber}
                      className={clsx(
                        "p-4 rounded-3xl border transition-all space-y-3 relative",
                        hasWinner 
                          ? "bg-slate-950/60 border-slate-800" 
                          : "bg-slate-950 border-amber-400/30 shadow-lg shadow-amber-400/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-400 uppercase tracking-widest text-xs bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                          {court.courtNumber === 1 ? "👑 Court 1 (King Court)" : `🏸 Court ${court.courtNumber}`}
                        </span>

                        {court.winner && (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <Check className="size-3" /> Winner: Team {court.winner}
                          </span>
                        )}
                      </div>

                      {/* Teams Pick Winner Grid */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        {/* Team A Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkCourtWinner(court.courtNumber, "A")}
                          className={clsx(
                            "col-span-2 p-3 rounded-2xl border text-left transition-all relative select-none",
                            court.winner === "A"
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30"
                              : court.winner === "B"
                              ? "bg-slate-900/60 border-slate-800/80 opacity-50"
                              : "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 active:scale-98"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
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
                          onClick={() => handleMarkCourtWinner(court.courtNumber, "B")}
                          className={clsx(
                            "col-span-2 p-3 rounded-2xl border text-left transition-all relative select-none",
                            court.winner === "B"
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30"
                              : court.winner === "A"
                              ? "bg-slate-900/60 border-slate-800/80 opacity-50"
                              : "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 active:scale-98"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
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

                      {/* 1-Tap Record to Session */}
                      <button
                        type="button"
                        onClick={() => handleApplyMatchup({ teamA: court.teamA, teamB: court.teamB })}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Award className="size-3.5" />
                        Log Official Score for Court {court.courtNumber}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Resting Players Queue in Tournament */}
              {tournamentState.currentRound.restingPlayers.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-black uppercase text-slate-400 tracking-wider">
                      <Coffee className="size-3.5 text-sky-400" />
                      <span>Resting / Next Up on Ladder ({tournamentState.currentRound.restingPlayers.length})</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      Will challenge next round
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
                    : "Select Winners on All Courts to Advance Round"}
                </button>
              </div>
            </div>
          ) : activeTab === "shuffler" ? (
            /* RANDOM SHUFFLER VIEW */
            <div className="space-y-5">
              {/* Controls Bar: Number of Courts & Reshuffle */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Courts:</span>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    {[1, 2, 3, 4].map(c => {
                      const isDisabled = attendees.length < c * 4;
                      return (
                        <button
                          key={c}
                          disabled={isDisabled}
                          onClick={() => setNumCourts(c)}
                          className={clsx(
                            "px-3 py-1 rounded-lg text-xs font-black uppercase transition-all",
                            numCourts === c
                              ? "bg-amber-400 text-slate-950 shadow-sm"
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
                  onClick={handleReshuffle}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                >
                  <RefreshCw className="size-3.5" />
                  Reshuffle Pairs
                </button>
              </div>

              {/* Locked Pairs Section */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-amber-400" />
                    <span className="text-xs font-black uppercase text-slate-200 tracking-wider">
                      Force Locked Pairs ({lockedPairs.length}/2)
                    </span>
                  </div>
                  {lockedPairs.length < 2 && attendees.length >= 4 && (
                    <button
                      type="button"
                      onClick={addLockedPair}
                      className="px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <Plus className="size-3" />
                      Add Locked Pair
                    </button>
                  )}
                </div>

                {lockedPairs.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    No locked pairings. All available players will be randomly paired.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lockedPairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black text-amber-400/80 uppercase shrink-0">
                          Pair #{idx + 1}:
                        </span>
                        <select
                          value={pair.player1Id}
                          onChange={(e) => updateLockedPair(idx, 1, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 outline-none flex-1 truncate"
                        >
                          {attendees.map(a => (
                            <option key={a.id} value={a.id} disabled={allLockedPlayerIds.has(a.id) && a.id !== pair.player1Id}>
                              {a.name} ({matchCountPerPlayer[a.id] || 0} played)
                            </option>
                          ))}
                        </select>
                        <span className="text-xs font-black text-slate-600">&</span>
                        <select
                          value={pair.player2Id}
                          onChange={(e) => updateLockedPair(idx, 2, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 outline-none flex-1 truncate"
                        >
                          {attendees.map(a => (
                            <option key={a.id} value={a.id} disabled={allLockedPlayerIds.has(a.id) && a.id !== pair.player2Id}>
                              {a.name} ({matchCountPerPlayer[a.id] || 0} played)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeLockedPair(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove locked pair"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accept & Start Tournament Mode Header Action */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                    <Trophy className="size-4 text-amber-400" />
                    Accept Lineup & Launch Tournament
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Winners face winners • Losers demote or rotate with bench
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartTournament}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer shrink-0"
                >
                  <Play className="size-3.5 fill-slate-950" />
                  Accept & Start
                </button>
              </div>

              {/* Court Assignments Grid */}
              <div className="space-y-3">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Play className="size-3.5 text-emerald-400 fill-emerald-400" />
                  Active Court Lineup
                </div>

                {shuffleResult.courtAssignments.map((assignment) => {
                  const { courtNumber, match } = assignment;
                  return (
                    <div
                      key={courtNumber}
                      className="p-4 bg-slate-950/90 border border-slate-800 rounded-3xl space-y-3 relative group hover:border-amber-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-400 uppercase tracking-widest text-xs bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                          🏸 Court {courtNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Fairness: <span className="font-black text-slate-200">{match.fairnessScore}%</span>
                        </span>
                      </div>

                      {/* Teams Display */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        {/* Team A */}
                        <div className="col-span-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 text-left">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Team A</div>
                          {match.teamA.map(p => (
                            <div key={p.id} className="text-xs font-bold text-slate-200 truncate flex items-center justify-between">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] font-mono text-slate-500">({p.matchesPlayedInSession || 0}g)</span>
                            </div>
                          ))}
                        </div>

                        {/* VS */}
                        <div className="col-span-1 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-black italic text-slate-600 uppercase">VS</span>
                        </div>

                        {/* Team B */}
                        <div className="col-span-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 text-left">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Team B</div>
                          {match.teamB.map(p => (
                            <div key={p.id} className="text-xs font-bold text-slate-200 truncate flex items-center justify-between">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] font-mono text-slate-500">({p.matchesPlayedInSession || 0}g)</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 1-Tap Record Button */}
                      <button
                        type="button"
                        onClick={() => handleApplyMatchup(match)}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                      >
                        <Check className="size-4" />
                        Record Court {courtNumber} Match
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Resting / Next Up Queue */}
              {shuffleResult.restingPlayers.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-black uppercase text-slate-400 tracking-wider">
                      <Coffee className="size-3.5 text-sky-400" />
                      <span>Resting / Next Up ({shuffleResult.restingPlayers.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Prioritized for next round
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {shuffleResult.restingPlayers.map(p => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-300 truncate">{p.name}</span>
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 shrink-0">
                          {p.matchesPlayedInSession || 0} played
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom 4-Player Balancer (Preserved as requested) */
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block">Select Exactly 4 Players to Balance:</span>
                <span>Click 4 players below and the engine will instantly find the fairest 2v2 team split.</span>
              </div>

              {/* Player Picker */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {groupingPlayers.map(p => {
                  const isSelected = selectedCustomIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleCustomPlayer(p.id)}
                      className={clsx(
                        "p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between select-none",
                        isSelected
                          ? "bg-amber-400/10 border-amber-400/50 text-white"
                          : "bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700"
                      )}
                    >
                      <div className="truncate pr-1">
                        <div className="text-xs font-bold truncate text-slate-200">{p.name}</div>
                        <div className="text-[10px] font-mono text-amber-400/80">{p.elo} MMR</div>
                      </div>
                      <div className={clsx(
                        "size-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                        isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-600"
                      )}>
                        {isSelected ? (selectedCustomIds.indexOf(p.id) + 1) : "+"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Balanced Pairings Result */}
              {selectedCustomIds.length === 4 && (
                <div className="pt-2 space-y-3 border-t border-slate-800 animate-in fade-in duration-200">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Scale className="size-4" />
                    Optimal 2v2 Pairings for Selected 4:
                  </div>

                  {customRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={clsx(
                        "p-3.5 rounded-2xl border transition-all space-y-2.5",
                        idx === 0
                          ? "bg-emerald-500/10 border-emerald-500/40"
                          : "bg-slate-950 border-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={clsx(
                          "font-black text-[10px] uppercase px-2 py-0.5 rounded-full",
                          idx === 0 ? "bg-emerald-400/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                        )}>
                          {idx === 0 ? "🏆 Most Balanced Split" : `Option #${idx + 1}`} • {rec.description}
                        </span>
                        <span className="font-mono text-[11px] font-black text-slate-300">
                          Fairness: {rec.fairnessScore}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Team A ({rec.teamAElo} MMR)
                          </span>
                          <span className="font-bold text-slate-200 truncate block">
                            {rec.teamA.map(p => p.name).join(" & ")}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Team B ({rec.teamBElo} MMR)
                          </span>
                          <span className="font-bold text-slate-200 truncate block">
                            {rec.teamB.map(p => p.name).join(" & ")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyMatchup(rec)}
                        className={clsx(
                          "w-full py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2",
                          idx === 0
                            ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-md shadow-emerald-400/20"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        )}
                      >
                        <Check className="size-3.5" />
                        Use This Pairing
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            {attendees.length} players in session
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
