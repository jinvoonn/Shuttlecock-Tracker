"use client";

import { useState } from "react";
import { addMatch, deleteMatch } from "@/lib/actions/matches";
import { PlusCircle, X, Check, Trash2, Swords, Users } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";

export function SessionMatches({ sessionId, sessionPlayers, matches }: { sessionId: string, sessionPlayers: any[], matches: any[] }) {
    const { isAdmin } = useRole();
    const [isAdding, setIsAdding] = useState(false);

    const [teamA1, setTeamA1] = useState<string>("");
    const [teamA2, setTeamA2] = useState<string>("");
    const [teamB1, setTeamB1] = useState<string>("");
    const [teamB2, setTeamB2] = useState<string>("");
    
    const [scoreA, setScoreA] = useState<string>("");
    const [scoreB, setScoreB] = useState<string>("");

    const availablePlayers = sessionPlayers.map(sp => ({
        id: sp.players?.id,
        name: sp.players?.name
    })).filter(p => p.id && p.name);

    const handleSave = async () => {
        // Validation
        const playerIds = [teamA1, teamA2, teamB1, teamB2];
        if (playerIds.some(id => !id)) {
            alert("All 4 players must be selected.");
            return;
        }

        const uniquePlayers = new Set(playerIds);
        if (uniquePlayers.size !== 4) {
            alert("Players cannot appear twice in the same match.");
            return;
        }

        if (scoreA === "" || scoreB === "") {
            alert("Both scores are required.");
            return;
        }

        const payload = {
            sessionId,
            teamAPlayer1: teamA1,
            teamAPlayer2: teamA2,
            teamBPlayer1: teamB1,
            teamBPlayer2: teamB2,
            scoreA: parseInt(scoreA) || 0,
            scoreB: parseInt(scoreB) || 0
        };

        try {
            const result = await addMatch(JSON.stringify(payload));
            if (result && !result.success) {
                alert("Failed to save match: " + result.error);
                return;
            }
            
            setIsAdding(false);
            setTeamA1("");
            setTeamA2("");
            setTeamB1("");
            setTeamB2("");
            setScoreA("");
            setScoreB("");
        } catch (err: any) {
            alert("Unexpected error: " + err.message);
        }
    };

    const sortedMatches = (matches || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return (
        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                    <Swords className="w-4 h-4" /> Matches ({matches?.length || 0})
                </h4>
                {isAdmin && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-xs flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 px-2 py-1.5 rounded-lg border border-sky-500/20"
                    >
                        <PlusCircle className="w-3.5 h-3.5" /> Log Match
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-sky-400" /> New Manual Match
                        </span>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Team A Selection */}
                        <div className="space-y-3 bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Team A</span>
                                <input
                                    type="number"
                                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono text-sm text-slate-100 placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Score"
                                    value={scoreA}
                                    onChange={e => setScoreA(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500"
                                    value={teamA1}
                                    onChange={e => setTeamA1(e.target.value)}
                                >
                                    <option value="">Select Player 1</option>
                                    {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500"
                                    value={teamA2}
                                    onChange={e => setTeamA2(e.target.value)}
                                >
                                    <option value="">Select Player 2</option>
                                    {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Team B Selection */}
                        <div className="space-y-3 bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Team B</span>
                                <input
                                    type="number"
                                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono text-sm text-slate-100 placeholder:text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    placeholder="Score"
                                    value={scoreB}
                                    onChange={e => setScoreB(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
                                    value={teamB1}
                                    onChange={e => setTeamB1(e.target.value)}
                                >
                                    <option value="">Select Player 1</option>
                                    {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500"
                                    value={teamB2}
                                    onChange={e => setTeamB2(e.target.value)}
                                >
                                    <option value="">Select Player 2</option>
                                    {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95"
                        >
                            <Check className="w-4 h-4" /> Save Match Result
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {sortedMatches.map((m: any, idx: number) => {
                    const isAWin = m.team_a_score > m.team_b_score;
                    const isBWin = m.team_b_score > m.team_a_score;

                    return (
                        <div key={m.id} className="flex flex-col bg-slate-950/50 rounded-xl border border-slate-800/80 p-3.5 relative group">
                            {isAdmin && (
                                <button
                                    onClick={() => deleteMatch(m.id)}
                                    className="absolute -top-2 -right-2 bg-rose-500/10 text-rose-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-rose-500/20 hover:bg-rose-500/20 hover:scale-110 shadow-xl backdrop-blur-md"
                                    title="Delete Match"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}

                            <div className="text-[9px] uppercase font-bold text-slate-600 mb-2 absolute top-2 left-3.5">Match {idx + 1}</div>

                            <div className="flex items-center justify-between gap-4 mt-4">
                                <div className={clsx("flex-1 text-right text-xs", isAWin ? "text-slate-100 font-bold" : "text-slate-500")}>
                                    <div className="truncate">{m.players_a1?.name || 'Unkn'}</div>
                                    <div className="truncate text-[10px] opacity-70">+{m.players_a2?.name || 'Unkn'}</div>
                                </div>
                                <div className="shrink-0 flex items-center justify-center font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shadow-inner">
                                    <span className={clsx("text-sm", isAWin ? "text-indigo-400 font-bold" : "text-slate-500")}>{m.team_a_score}</span>
                                    <span className="text-slate-700 mx-2 text-[10px]">VS</span>
                                    <span className={clsx("text-sm", isBWin ? "text-emerald-400 font-bold" : "text-slate-500")}>{m.team_b_score}</span>
                                </div>
                                <div className={clsx("flex-1 text-left text-xs", isBWin ? "text-slate-100 font-bold" : "text-slate-500")}>
                                    <div className="truncate">{m.players_b1?.name || 'Unkn'}</div>
                                    <div className="truncate text-[10px] opacity-70">+{m.players_b2?.name || 'Unkn'}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
