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

    const togglePlayer = (id: string, team: 'A1' | 'A2' | 'B1' | 'B2') => {
        if (team === 'A1') setTeamA1(teamA1 === id ? "" : id);
        if (team === 'A2') setTeamA2(teamA2 === id ? "" : id);
        if (team === 'B1') setTeamB1(teamB1 === id ? "" : id);
        if (team === 'B2') setTeamB2(teamB2 === id ? "" : id);
    };

    const selectedPlayerIds = [teamA1, teamA2, teamB1, teamB2].filter(Boolean);

    const PlayerChips = ({ selected, onSelect, label }: { selected: string, onSelect: (id: string) => void, label: string }) => (
        <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">{label}</span>
            <div className="flex flex-wrap gap-2">
                {availablePlayers.map(p => {
                    const isSelectedElsewhere = selectedPlayerIds.includes(p.id!) && selected !== p.id;
                    return (
                        <button
                            key={p.id}
                            disabled={isSelectedElsewhere}
                            onClick={() => onSelect(p.id!)}
                            className={clsx(
                                "px-3 py-2 rounded-xl text-xs font-bold transition-all border active:scale-95",
                                selected === p.id 
                                    ? "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20" 
                                    : isSelectedElsewhere 
                                        ? "bg-slate-900/50 text-slate-700 border-slate-800/50 cursor-not-allowed opacity-30"
                                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                            )}
                        >
                            {p.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const handleSave = async () => {
        // Validation
        const playerIds = [teamA1, teamA2, teamB1, teamB2];
        if (playerIds.some(id => !id)) {
            alert("Please select all 4 players.");
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
                            <Users className="w-5 h-5 text-sky-400" /> Match Entry
                        </span>
                        <button onClick={() => setIsAdding(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team A Selection */}
                        <div className="space-y-6 bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10">
                            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
                                <span className="text-sm font-black text-indigo-400 uppercase tracking-tighter italic">Team A</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Score</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-mono text-lg text-slate-100 focus:ring-2 focus:ring-indigo-500/50 border-none outline-none"
                                        placeholder="0"
                                        value={scoreA}
                                        onChange={e => setScoreA(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <PlayerChips label="Player 1" selected={teamA1} onSelect={(id) => setTeamA1(id)} />
                                <PlayerChips label="Player 2" selected={teamA2} onSelect={(id) => setTeamA2(id)} />
                            </div>
                        </div>

                        {/* Team B Selection */}
                        <div className="space-y-6 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
                                <span className="text-sm font-black text-emerald-400 uppercase tracking-tighter italic">Team B</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Score</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-mono text-lg text-slate-100 focus:ring-2 focus:ring-emerald-500/50 border-none outline-none"
                                        placeholder="0"
                                        value={scoreB}
                                        onChange={e => setScoreB(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <PlayerChips label="Player 1" selected={teamB1} onSelect={(id) => setTeamB1(id)} />
                                <PlayerChips label="Player 2" selected={teamB2} onSelect={(id) => setTeamB2(id)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs px-6 py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
                        >
                            <Check className="w-4 h-4" /> Finalize Match
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
