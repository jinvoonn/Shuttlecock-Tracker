"use client";

import { useState } from "react";
import { addMatch, updateMatch, deleteMatch } from "@/lib/actions/matches";
import { PlusCircle, X, Check, Trash2, Swords, Users, Edit3 } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";

interface SessionPlayer {
    players: { id: string, name: string } | null;
    player_id: string;
}

interface Match {
    id: string;
    team_a_score: number;
    team_b_score: number;
    team_a_player1: string;
    team_a_player2: string;
    team_b_player1: string;
    team_b_player2: string;
    created_at: string;
}

export function SessionMatches({ sessionId, sessionPlayers, matches }: { sessionId: string, sessionPlayers: SessionPlayer[], matches: Match[] }) {
    const { isAdmin } = useRole();
    const [isAdding, setIsAdding] = useState(false);
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

    const [teamAIds, setTeamAIds] = useState<string[]>([]);
    const [teamBIds, setTeamBIds] = useState<string[]>([]);
    const [scoreA, setScoreA] = useState<string>("");
    const [scoreB, setScoreB] = useState<string>("");

    const availablePlayers = sessionPlayers.map(sp => ({
        id: sp.players?.id || sp.player_id,
        name: sp.players?.name || "Unknown"
    })).filter(p => p.id);

    // Map all player IDs to names for quick lookup in match history
    const playerMap = Object.fromEntries(availablePlayers.map(p => [p.id, p.name]));

    const togglePlayer = (id: string) => {
        if (teamAIds.includes(id)) {
            // Move from A to B
            setTeamAIds(teamAIds.filter(pid => pid !== id));
            setTeamBIds([...teamBIds, id]);
        } else if (teamBIds.includes(id)) {
            // Deselect
            setTeamBIds(teamBIds.filter(pid => pid !== id));
        } else {
            // Add to A
            setTeamAIds([...teamAIds, id]);
        }
    };

    const startEdit = (match: { id: string, team_a_ids?: string[], team_b_ids?: string[], team_a_player1?: string, team_a_player2?: string, team_b_player1?: string, team_b_player2?: string, team_a_score: number, team_b_score: number }) => {
        setEditingMatchId(match.id);
        setTeamAIds(match.team_a_ids || [match.team_a_player1, match.team_a_player2].filter((p): p is string => !!p));
        setTeamBIds(match.team_b_ids || [match.team_b_player1, match.team_b_player2].filter((p): p is string => !!p));
        setScoreA(match.team_a_score.toString());
        setScoreB(match.team_b_score.toString());
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingMatchId(null);
        setTeamAIds([]);
        setTeamBIds([]);
        setScoreA("");
        setScoreB("");
    };

    const handleSave = async () => {
        if (!teamAIds.length || !teamBIds.length) {
            alert("Each team must have at least 1 player.");
            return;
        }

        const payload = {
            sessionId,
            teamAIds,
            teamBIds,
            scoreA: parseInt(scoreA) || 0,
            scoreB: parseInt(scoreB) || 0
        };

        try {
            const result = editingMatchId 
                ? await updateMatch(editingMatchId, JSON.stringify(payload))
                : await addMatch(JSON.stringify(payload));
                
            if (result && !result.success) {
                alert("Failed to save match: " + result.error);
                return;
            }
            resetForm();
        } catch (err: unknown) {
            const e = err as Error;
            alert("Unexpected error: " + (e.message || "Unknown error"));
        }
    };

    const sortedMatches = (matches || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return (
        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                    <Swords className="w-4 h-4" /> Matches ({matches?.length || 0})
                </h4>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-xs flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 px-2 py-1.5 rounded-lg border border-sky-500/20"
                    >
                        <PlusCircle className="w-3.5 h-3.5" /> Log Match
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 md:p-6 space-y-6 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-100 flex items-center gap-2 uppercase tracking-tighter">
                            <Users className="w-5 h-5 text-sky-400" /> {editingMatchId ? "Edit Match" : "New Match"}
                        </span>
                        <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6">
                        {/* Player Selection instructions */}
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600 px-1">
                            <span>Tap player to cycle: Team A ➔ Team B ➔ Out</span>
                        </div>

                        {/* Player Selection Area */}
                        <div className="flex flex-wrap gap-2 min-h-[80px] p-1">
                            {availablePlayers.map(p => {
                                const isTeamA = teamAIds.includes(p.id!);
                                const isTeamB = teamBIds.includes(p.id!);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlayer(p.id!)}
                                        className={clsx(
                                            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border active:scale-95 flex items-center gap-2",
                                            isTeamA 
                                                ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20" 
                                                : isTeamB
                                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
                                                    : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                                        )}
                                    >
                                        {p.name}
                                        {isTeamA && <span className="bg-white/20 px-1 rounded text-[8px]">A</span>}
                                        {isTeamB && <span className="bg-white/20 px-1 rounded text-[8px]">B</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Preview / Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Team A Score</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-mono text-lg text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        placeholder="0"
                                        value={scoreA}
                                        onChange={e => setScoreA(e.target.value)}
                                    />
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    {teamAIds.length > 0 ? teamAIds.map(id => playerMap[id]).join(", ") : "Select players..."}
                                </div>
                            </div>

                            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Team B Score</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-mono text-lg text-slate-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="0"
                                        value={scoreB}
                                        onChange={e => setScoreB(e.target.value)}
                                    />
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                    {teamBIds.length > 0 ? teamBIds.map(id => playerMap[id]).join(", ") : "Select players..."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={resetForm}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs px-6 py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
                        >
                            <Check className="w-4 h-4" /> {editingMatchId ? "Update Match" : "Finalize Match"}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {sortedMatches.map((m: { id: string, team_a_score: number, team_b_score: number, team_a_player1: string, team_a_player2: string, team_b_player1: string, team_b_player2: string }, idx: number) => {
                    const isAWin = m.team_a_score > m.team_b_score;
                    const isBWin = m.team_b_score > m.team_a_score;
                    
                    const tA = [m.team_a_player1, m.team_a_player2].filter((p): p is string => !!p);
                    const tB = [m.team_b_player1, m.team_b_player2].filter((p): p is string => !!p);

                    return (
                        <div key={m.id} className="flex flex-col bg-slate-950/50 rounded-xl border border-slate-800/80 p-3.5 relative group">
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(m)}
                                    className="bg-slate-800 text-slate-400 p-1.5 rounded-full border border-slate-700 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
                                    title="Edit Match"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => deleteMatch(m.id)}
                                        className="bg-rose-500/10 text-rose-500 p-1.5 rounded-full border border-rose-500/20 hover:bg-rose-500/20 hover:scale-110 shadow-xl backdrop-blur-md"
                                        title="Delete Match"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="text-[9px] uppercase font-bold text-slate-600 mb-2 absolute top-2 left-3.5">Match {idx + 1}</div>

                            <div className="flex items-center justify-between gap-4 mt-6">
                                <div className={clsx("flex-1 text-right text-xs", isAWin ? "text-slate-100 font-bold" : "text-slate-500")}>
                                    {tA.map((id: string, i: number) => (
                                        <div key={id} className={clsx("truncate", i > 0 && "text-[10px] opacity-70 mt-0.5")}>
                                            {playerMap[id] || '...'}
                                        </div>
                                    ))}
                                </div>
                                <div className="shrink-0 flex items-center justify-center font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shadow-inner">
                                    <span className={clsx("text-sm", isAWin ? "text-indigo-400 font-bold" : "text-slate-500")}>{m.team_a_score}</span>
                                    <span className="text-slate-700 mx-2 text-[10px]">VS</span>
                                    <span className={clsx("text-sm", isBWin ? "text-emerald-400 font-bold" : "text-slate-500")}>{m.team_b_score}</span>
                                </div>
                                <div className={clsx("flex-1 text-left text-xs", isBWin ? "text-slate-100 font-bold" : "text-slate-500")}>
                                    {tB.map((id: string, i: number) => (
                                        <div key={id} className={clsx("truncate", i > 0 && "text-[10px] opacity-70 mt-0.5")}>
                                            {playerMap[id] || '...'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
