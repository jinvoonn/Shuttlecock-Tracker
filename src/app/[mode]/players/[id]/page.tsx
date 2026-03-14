import { supabase } from "@/lib/supabase";
import { User, Swords, Activity, ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import { SkillRatingEditor } from "@/components/SkillRatingEditor";
import clsx from "clsx";

export const revalidate = 0;

export default async function PlayerProfilePage({ params }: { params: Promise<{ mode: string, id: string }> }) {
    const { mode, id } = await params;

    // Fetch the player details
    const { data: player, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();

    if (playerError || !player) {
        return (
            <div className="p-8 text-rose-500 flex items-center justify-center min-h-screen">
                Player not found.
            </div>
        );
    }

    // Fetch sessions the player attended
    const { data: attendedSessions } = await supabase
        .from("session_players")
        .select("session_id, sessions(date)")
        .eq("player_id", id);
        
    const totalSessions = attendedSessions?.length || 0;

    // Fetch matches the player participated in
    const { data: matches } = await supabase
        .from("match_players")
        .select(`
            team,
            matches (
                id,
                created_at,
                team_a_score,
                team_b_score,
                sessions ( date ),
                match_players ( player_id, team, players ( name ) )
            )
        `)
        .eq("player_id", id)
        .order("created_at", { ascending: false });

    // Calculate generic stats
    let totalMatches = 0;
    let wins = 0;
    let losses = 0;

    const formattedMatches = (matches || []).map((m: any) => {
        const matchData = m.matches as any;
        if (!matchData) return null;
        
        totalMatches++;
        
        const myTeam = m.team;
        const myScore = myTeam === 'A' ? matchData.team_a_score : matchData.team_b_score;
        const oppScore = myTeam === 'A' ? matchData.team_b_score : matchData.team_a_score;
        
        const isWin = myScore > oppScore;
        const isDraw = myScore === oppScore;

        if (isWin) wins++;
        else if (!isDraw) losses++;
        
        // Find partners and opponents from the nested match_players array
        const allPlayers = matchData.match_players || [];
        const partners = allPlayers.filter((p: any) => p.team === myTeam && p.player_id !== id).map((p: any) => p.players?.name);
        const opponents = allPlayers.filter((p: any) => p.team !== myTeam).map((p: any) => p.players?.name);

        return {
            id: matchData.id,
            date: matchData.sessions?.date || new Date(matchData.created_at).toISOString().split('T')[0],
            isWin,
            isDraw,
            myScore,
            oppScore,
            partners,
            opponents
        };
    }).filter(Boolean);

    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // --- PHASE 11: ADVANCED ANALYTICS ---
    const h2h: Record<string, { name: string, wins: number, losses: number, total: number }> = {};
    const partnersMap: Record<string, { name: string, wins: number, total: number }> = {};

    formattedMatches.forEach((m: any) => {
        if (!m) return;
        // Track Head-to-Head
        m.opponents.forEach((oppName: string) => {
            if (!h2h[oppName]) h2h[oppName] = { name: oppName, wins: 0, losses: 0, total: 0 };
            h2h[oppName].total++;
            if (m.isWin) h2h[oppName].wins++;
            else if (!m.isDraw) h2h[oppName].losses++;
        });

        // Track Partners
        m.partners.forEach((partnerName: string) => {
            if (!partnersMap[partnerName]) partnersMap[partnerName] = { name: partnerName, wins: 0, total: 0 };
            partnersMap[partnerName].total++;
            if (m.isWin) partnersMap[partnerName].wins++;
        });
    });

    const rivals = Object.values(h2h).sort((a, b) => b.total - a.total).slice(0, 3);
    const bestPartner = Object.values(partnersMap)
        .filter(p => p.total >= 3)
        .sort((a, b) => (b.wins / b.total) - (a.wins / a.total) || b.total - a.total)[0];

    const recentForm = formattedMatches.slice(0, 5).map(m => m?.isWin ? "W" : m?.isDraw ? "D" : "L");

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-700">
            <Link href={`/${mode}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-300 mb-6 transition-colors uppercase tracking-tight">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <header className="mb-8 flex items-center gap-4">
                <div className="h-20 w-20 flex-shrink-0 bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-700 shadow-xl overflow-hidden relative">
                    <User className="w-8 h-8 text-slate-400 absolute" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent"></div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 tracking-tight">{player.name}</h1>
                    <div className="flex flex-col mt-2">
                        <SkillRatingEditor playerId={player.id} initialSkill={player.skill_rating || 5} />
                        <span className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest px-1">Player Profile</span>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center pt-2">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><Activity className="w-12 h-12" /></div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1 relative z-10">Matches</p>
                    <p className="text-2xl font-bold font-mono text-slate-200 relative z-10">{totalMatches}</p>
                </div>
                <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden">
                    <p className="text-[10px] font-bold uppercase text-emerald-600/80 mb-1 relative z-10">Win Rate</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400 relative z-10">{winRate}%</p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Recent Form</p>
                    <div className="flex items-center justify-center gap-1.5">
                        {recentForm.map((res, i) => (
                            <span 
                                key={i} 
                                className={clsx(
                                    "w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-md border",
                                    res === "W" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                                    res === "D" ? "bg-slate-700/20 border-slate-600/30 text-slate-400" :
                                    "bg-rose-500/20 border-rose-500/30 text-rose-400"
                                )}
                            >
                                {res}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between text-xs px-2">
                        <span className="text-slate-500 font-bold uppercase">Wins</span>
                        <span className="font-mono text-emerald-400 font-bold">{wins}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs px-2">
                        <span className="text-slate-500 font-bold uppercase">Losses</span>
                        <span className="font-mono text-rose-400 font-bold">{losses}</span>
                    </div>
                </div>
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><User className="w-16 h-16" /></div>
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-sky-500" /> Best Partner
                    </h3>
                    {bestPartner ? (
                        <div>
                            <p className="text-xl font-bold text-slate-200">{bestPartner.name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {bestPartner.wins} wins in {bestPartner.total} sessions together
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                                    {Math.round((bestPartner.wins / bestPartner.total) * 100)}% Win Rate
                                </span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic mt-2 text-center">Not enough data (min. 3 sessions)</p>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Swords className="w-16 h-16" /></div>
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                        <Swords className="w-4 h-4 text-rose-500" /> Rivalries (H2H)
                    </h3>
                    <div className="space-y-3">
                        {rivals.length > 0 ? rivals.map(r => (
                            <div key={r.name} className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-slate-300">{r.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                                            style={{ width: `${(r.wins / r.total) * 100}%` }} 
                                        />
                                        <div 
                                            className="bg-rose-500 h-full shadow-[0_0_8px_rgba(244,63,94,0.3)]" 
                                            style={{ width: `${(r.losses / r.total) * 100}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 font-bold whitespace-nowrap">
                                        {r.wins}W - {r.losses}L
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic mt-2 text-center">No match history found</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold uppercase tracking-tight text-slate-500 mb-4 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-slate-400" /> Match History
                </h2>

                {formattedMatches.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm italic">
                        No matches recorded yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formattedMatches.map((m: any) => (
                            <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                                        <span className="text-[9px] font-bold uppercase text-slate-600 leading-none">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-sm font-bold text-slate-300 font-mono mt-0.5">{new Date(m.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            {m.isWin ? (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">Win</span>
                                            ) : m.isDraw ? (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 uppercase">Draw</span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 uppercase">Loss</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Partner: <span className="text-slate-400">{m.partners.length > 0 ? m.partners.join(" + ") : "None (Singles)"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pl-16 sm:pl-0">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 mb-0.5 uppercase tracking-tight font-bold">vs Opponents</div>
                                        <div className="text-xs text-slate-400">{m.opponents.length > 0 ? m.opponents.join(" + ") : "Unknown"}</div>
                                    </div>
                                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-sm tracking-widest shrink-0">
                                        <span className={m.isWin ? "text-emerald-400 font-bold" : "text-slate-300"}>{m.myScore}</span>
                                        <span className="text-slate-600 mx-1.5">-</span>
                                        <span className={!m.isWin && !m.isDraw ? "text-emerald-400 font-bold" : "text-slate-300"}>{m.oppScore}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
