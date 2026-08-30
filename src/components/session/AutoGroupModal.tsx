"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Sparkles, 
  Zap, 
  Scale, 
  ArrowRight, 
  Users, 
  Check, 
  RotateCcw,
  Flame,
  Award
} from "lucide-react";
import clsx from "clsx";
import PlayerName from "@/components/ui/PlayerName";
import { 
  GroupingPlayer, 
  MatchRecommendation, 
  suggestNextMatchFromPool, 
  generateBalanced2v2,
  evaluatePairing
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
  const [activeTab, setActiveTab] = useState<"smart" | "custom">("smart");
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

  // Smart suggestions from full pool
  const smartRecommendations: MatchRecommendation[] = useMemo(() => {
    return suggestNextMatchFromPool(groupingPlayers, matchCountPerPlayer, 3);
  }, [groupingPlayers, matchCountPerPlayer]);

  // Custom 4-player combinations
  const customRecommendations: MatchRecommendation[] = useMemo(() => {
    if (selectedCustomIds.length !== 4) return [];
    const chosen = groupingPlayers.filter(p => selectedCustomIds.includes(p.id));
    return generateBalanced2v2(chosen);
  }, [groupingPlayers, selectedCustomIds]);

  if (!isOpen || !mounted) return null;

  const toggleCustomPlayer = (id: string) => {
    setSelectedCustomIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id]; // rotate oldest selection
      }
      return [...prev, id];
    });
  };

  const handleApplyMatchup = (rec: MatchRecommendation) => {
    const teamAIds = rec.teamA.map(p => p.id);
    const teamBIds = rec.teamB.map(p => p.id);
    onSelectMatchup(teamAIds, teamBIds);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col font-['Lexend',_sans-serif] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-2">
                Auto-Grouping Matchmaker
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Fair 2v2 doubles matchmaking based on Elo ratings
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

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("smart")}
            className={clsx(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
              activeTab === "smart"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Zap className="size-3.5" />
            Suggested Matches ({smartRecommendations.length})
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {attendees.length < 4 ? (
            <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
              <Users className="size-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                Need at least 4 attendees to auto-balance matches.
              </p>
              <p className="text-xs text-slate-600">
                Currently {attendees.length} player(s) joined in this session.
              </p>
            </div>
          ) : activeTab === "smart" ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Court Rotation Optimized</span>
                  <span>Prioritizes players with fewer played matches in this session.</span>
                </div>
                <div className="text-right font-mono text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                  {attendees.length} Attendees Pool
                </div>
              </div>

              {smartRecommendations.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-bold text-xs uppercase">
                  No match combinations available.
                </div>
              ) : (
                smartRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/80 border border-slate-800 hover:border-amber-400/40 rounded-3xl transition-all space-y-3 relative group"
                  >
                    {/* Badge header */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-amber-400 uppercase tracking-widest text-[10px] bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                        Option #{idx + 1} • {rec.description}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-400 font-bold">Fairness:</span>
                        <span className={clsx(
                          "font-black px-2 py-0.5 rounded",
                          rec.fairnessScore >= 85 ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" :
                          rec.fairnessScore >= 70 ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                          "bg-rose-400/10 text-rose-400 border border-rose-400/20"
                        )}>
                          {rec.fairnessScore}%
                        </span>
                      </div>
                    </div>

                    {/* Teams Display */}
                    <div className="grid grid-cols-5 gap-2 items-center">
                      {/* Team A */}
                      <div className="col-span-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 text-left">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                          <span>Team A</span>
                          <span className="font-mono text-emerald-400">{rec.teamAElo} MMR</span>
                        </div>
                        {rec.teamA.map(p => (
                          <div key={p.id} className="truncate">
                            <PlayerName name={p.name} elo={p.elo} placementMatchesPlayed={p.placementMatchesPlayed} showRankName={false} nameClassName="text-xs" />
                          </div>
                        ))}
                      </div>

                      {/* VS Divider */}
                      <div className="col-span-1 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black italic text-slate-600 uppercase">VS</span>
                        <span className="text-[9px] font-mono text-slate-500">Δ {rec.eloDifference}</span>
                      </div>

                      {/* Team B */}
                      <div className="col-span-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5 text-left">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                          <span>Team B</span>
                          <span className="font-mono text-sky-400">{rec.teamBElo} MMR</span>
                        </div>
                        {rec.teamB.map(p => (
                          <div key={p.id} className="truncate">
                            <PlayerName name={p.name} elo={p.elo} placementMatchesPlayed={p.placementMatchesPlayed} showRankName={false} nameClassName="text-xs" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => handleApplyMatchup(rec)}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                    >
                      <Check className="size-4" />
                      Set Up This Match
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
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
            {attendees.length} players available
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
