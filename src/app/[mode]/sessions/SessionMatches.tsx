"use client";

import { useState } from "react";
import { addMatch, deleteMatch } from "@/lib/actions/matches";
import { PlusCircle, Target, Users, X, Check, Trash2, Swords } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";
import { generateAutoMatch } from "@/lib/grouping";

export function SessionMatches({ sessionId, sessionPlayers, matches }: { sessionId: string, sessionPlayers: any[], matches: any[] }) {
    const { isAdmin } = useRole();
    const [isAdding, setIsAdding] = useState(false);

    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [scoreA, setScoreA] = useState<string>("");
    const [scoreB, setScoreB] = useState<string>("");

    const availablePlayers = sessionPlayers.map(sp => ({
        id: sp.players?.id,
        name: sp.players?.name
    })).filter(p => p.id && p.name);

    const [balanceSkill, setBalanceSkill] = useState(true);
    const [avoidRepeatPartners, setAvoidRepeatPartners] = useState(true);

    const togglePlayer = (team: "A" | "B", playerId: string) => {
        if (team === "A") {
            if (teamA.includes(playerId)) setTeamA(teamA.filter(id => id !== playerId));
            else {
                setTeamB(teamB.filter(id => id !== playerId));
                setTeamA([...teamA, playerId]);
            }
        } else {
            if (teamB.includes(playerId)) setTeamB(teamB.filter(id => id !== playerId));
            else {
                setTeamA(teamA.filter(id => id !== playerId));
                setTeamB([...teamB, playerId]);
            }
        }
    };

    const handleGenerate = () => {
        const statsPlayers = sessionPlayers.map(sp => ({
            id: sp.players?.id,
            name: sp.players?.name,
            skill_rating: sp.players?.skill_rating || 5
        })).filter(p => p.id && p.name);

        const result = generateAutoMatch(statsPlayers, matches, {
            balanceSkill,
            avoidRepeatPartners,
            playersPerTeam: 2
        });

        setTeamA(result.teamA.map(p => p.id));
        setTeamB(result.teamB.map(p => p.id));
        setScoreA("");
        setScoreB("");
    };

    const handleSave = async () => {
        if (teamA.length === 0 || teamB.length === 0) {
            alert("Both teams must have at least one player.");
            return;
        }

        const payload = {
            sessionId,
            teamA,
            teamB,
            scoreA: parseInt(scoreA) || 0,
            scoreB: parseInt(scoreB) || 0
        };

        try {
            await addMatch(JSON.stringify(payload));
            setIsAdding(false);
            setTeamA([]);
            setTeamB([]);
            setScoreA("");
            setScoreB("");
        } catch (err: any) {
            alert("Failed to save match: " + err.message);
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
                <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-4 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300">New Match</span>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300 hover:text-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={balanceSkill}
                                    onChange={(e) => setBalanceSkill(e.target.checked)}
                                    className="rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                                />
                                Balance Skill
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300 hover:text-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={avoidRepeatPartners}
                                    onChange={(e) => setAvoidRepeatPartners(e.target.checked)}
                                    className="rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                                />
                                Avoid Same Partners
                            </label>
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
                        >
                            <Target className="w-3.5 h-3.5" /> Auto Fill Players
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Team A */}
                        <div className="space-y-2 bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-400">Team A</span>
                                <input
                                    type="number"
                                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-sm text-slate-200"
                                    placeholder="0"
                                    value={scoreA}
                                    onChange={e => setScoreA(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {availablePlayers.map(p => {
                                    const isSelected = teamA.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => togglePlayer("A", p.id)}
                                            className={clsx(
                                                "text-xs px-2 py-1 rounded-md border transition-all",
                                                isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                            )}
                                        >
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Team B */}
                        <div className="space-y-2 bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400">Team B</span>
                                <input
                                    type="number"
                                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-sm text-slate-200"
                                    placeholder="0"
                                    value={scoreB}
                                    onChange={e => setScoreB(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {availablePlayers.map(p => {
                                    const isSelected = teamB.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => togglePlayer("B", p.id)}
                                            className={clsx(
                                                "text-xs px-2 py-1 rounded-md border transition-all",
                                                isSelected ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                            )}
                                        >
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                        >
                            <Check className="w-3.5 h-3.5" /> Save Match
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {sortedMatches.map((m: any, idx: number) => {
                    const teamAPlayers = m.match_players?.filter((mp: any) => mp.team === 'A').map((mp: any) => mp.players?.name) || [];
                    const teamBPlayers = m.match_players?.filter((mp: any) => mp.team === 'B').map((mp: any) => mp.players?.name) || [];

                    const isAWin = m.team_a_score > m.team_b_score;
                    const isBWin = m.team_b_score > m.team_a_score;

                    return (
                        <div key={m.id} className="flex flex-col bg-slate-950/50 rounded-xl border border-slate-800/80 p-3 relative group">
                            {isAdmin && (
                                <button
                                    onClick={() => deleteMatch(m.id)}
                                    className="absolute -top-2 -right-2 bg-rose-500/10 text-rose-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-rose-500/20 hover:bg-rose-500/20 hover:scale-110"
                                    title="Delete Match"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}

                            <div className="text-[9px] uppercase font-bold text-slate-600 mb-1 absolute top-2 left-3">Match {idx + 1}</div>

                            <div className="flex items-center justify-between gap-4 mt-3">
                                <div className={clsx("flex-1 text-right text-xs", isAWin ? "text-slate-200 font-bold" : "text-slate-400")}>
                                    {teamAPlayers.join(" + ")}
                                </div>
                                <div className="shrink-0 flex items-center justify-center font-mono">
                                    <span className={clsx("text-sm", isAWin ? "text-indigo-400 font-bold" : "text-slate-500")}>{m.team_a_score}</span>
                                    <span className="text-slate-600 mx-1.5 text-[10px]">-</span>
                                    <span className={clsx("text-sm", isBWin ? "text-emerald-400 font-bold" : "text-slate-500")}>{m.team_b_score}</span>
                                </div>
                                <div className={clsx("flex-1 text-left text-xs", isBWin ? "text-slate-200 font-bold" : "text-slate-400")}>
                                    {teamBPlayers.join(" + ")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
