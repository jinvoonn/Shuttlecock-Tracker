import { supabase } from "@/lib/supabase";
import { User, Swords, Activity, ArrowLeft, Target, LayoutDashboard, CalendarDays, Package, Wallet, Feather, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SkillRatingEditor } from "@/components/SkillRatingEditor";
import { MatchHistory } from "./MatchHistory";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getPlayerProfileStats } from "@/lib/analytics/profile";
import { getPlayerEloHistory } from "@/lib/analytics/eloTrend";
import EloTrendChart from "./EloTrendChart";
import EloRatingCard from "./EloRatingCard";
import { getBestPartner, getWorstPartner, getPartnerStats } from "@/lib/analytics/partner";
import RankBadge from "@/components/ui/RankBadge";
import clsx from "clsx";

export const revalidate = 0;

export default async function PlayerProfilePage({ params }: { params: Promise<{ mode: string, id: string }> }) {
    const { mode, id } = await params;
    const basePath = `/${mode}`;

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
        .from("matches")
        .select(`
            id,
            created_at,
            team_a_score,
            team_b_score,
            team_a_player1,
            team_a_player2,
            team_b_player1,
            team_b_player2,
            sessions ( date )
        `)
        .or(`team_a_player1.eq.${id},team_a_player2.eq.${id},team_b_player1.eq.${id},team_b_player2.eq.${id}`)
        .order("created_at", { ascending: false });

    // Fetch all players to map IDs to names for match history
    const { data: allPlayersData } = await supabase.from("players").select("id, name");
    const playerMap = Object.fromEntries((allPlayersData || []).map(p => [p.id, p.name]));

    // Fetch payments for balance calculation
    const { data: paymentsData } = await supabase.from("payments").select("*").eq("player_id", id).order("date", { ascending: false });
    const totalPayments = (paymentsData || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);

    // Fetch session costs to calculate owed amount
    const playerSessionIds = (attendedSessions || []).map(sp => sp.session_id);
    
    let totalOwed = 0;
    if (playerSessionIds.length > 0) {
        const [
            { data: allUsageForSessions },
            { data: allPlayersForSessions }
        ] = await Promise.all([
            supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)").in("session_id", playerSessionIds),
            supabase.from("session_players").select("session_id").in("session_id", playerSessionIds)
        ]);
        
        const costs: Record<string, number> = {};
        (allUsageForSessions || []).forEach(su => {
            const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
            costs[su.session_id] = (costs[su.session_id] || 0) + (Number(purchase?.price_per_cock || 0) * Number(su.quantity_used || 0));
        });
        
        const counts: Record<string, number> = {};
        (allPlayersForSessions || []).forEach(sp => {
            counts[sp.session_id] = (counts[sp.session_id] || 0) + 1;
        });
        
        playerSessionIds.forEach(sid => {
            const sessionCost = costs[sid] || 0;
            const playerAmount = sessionCost / (counts[sid] || 1);
            totalOwed += playerAmount;
        });
    }

    const currentBalance = totalOwed - totalPayments;

    // --- ANALYTICS ENGINE INTEGRATION ---
    const normalizedMatches = normalizeMatches(matches || [], playerMap);
    const { elo: globalElo, eloHistory } = aggregatePlayerStats(normalizedMatches, Object.fromEntries(Object.keys(playerMap).map(k => [k, playerMap[k]])));
    const profileStats = getPlayerProfileStats(matches || [], playerMap, id);
    const allPartnersStats = getPartnerStats(normalizedMatches);
    const playerPartnerStats = allPartnersStats[id] || {};
    
    const eloTimeline = getPlayerEloHistory(eloHistory, id);

    const totalMatchesCount = profileStats?.totalGames || 0;
    const wins = profileStats?.wins || 0;
    const losses = profileStats?.losses || 0;
    const winRate = profileStats ? Math.round(profileStats.winRate * 100) : 0;
    const winStreak = profileStats?.streak || 0;
    const recentForm = profileStats?.lastResults || [];
    
    // ELO Settings
    const playerElo = Math.round(globalElo[id] || 1200);
    let eloLabel = "Elite";
    let eloColor = "text-emerald-400";
    let eloBg = "bg-emerald-500/5 border-emerald-500/20";
    
    if (playerElo < 1000) {
        eloLabel = "Below Average";
        eloColor = "text-rose-400";
        eloBg = "bg-rose-500/5 border-rose-500/20";
    } else if (playerElo < 1300) {
        eloLabel = "Average";
        eloColor = "text-slate-300";
        eloBg = "bg-slate-800 border-slate-700";
    } else if (playerElo < 1600) {
        eloLabel = "Strong";
        eloColor = "text-sky-400";
        eloBg = "bg-sky-500/5 border-sky-500/20";
    }

    // Map matches for backward compatibility with UI
    const formattedMatches = normalizedMatches.map((m: any) => {
        const isTeamA = m.teamA.includes(id);
        const myScore = isTeamA ? m.scoreA : m.scoreB;
        const oppScore = isTeamA ? m.scoreB : m.scoreA;
        const isWin = (isTeamA && m.winner === "A") || (!isTeamA && m.winner === "B");
        const isDraw = m.winner === "Draw";

        const myPartnerIds = (isTeamA ? m.teamA : m.teamB).filter((pid: string) => pid !== id);
        const opponentIds = isTeamA ? m.teamB : m.teamA;

        return {
            id: m.id,
            date: m.date,
            isWin,
            isDraw,
            myScore,
            oppScore,
            partners: myPartnerIds.map((pid: string) => playerMap[pid] || "Unknown"),
            opponents: opponentIds.map((pid: string) => playerMap[pid] || "Unknown")
        };
    });

    // H2H Logic (Keeping here for now as requested to focus on stats/partners)
    const h2h: Record<string, { name: string, wins: number, losses: number, total: number }> = {};
    formattedMatches.forEach((m: any) => {
        m.opponents.forEach((oppName: string) => {
            if (!h2h[oppName]) h2h[oppName] = { name: oppName, wins: 0, losses: 0, total: 0 };
            h2h[oppName].total++;
            if (m.isWin) h2h[oppName].wins++;
            else if (!m.isDraw) h2h[oppName].losses++;
        });
    });
    const rivals = Object.values(h2h).sort((a, b) => b.total - a.total).slice(0, 3);

    // Partner Intelligence
    const bestPartnerMatch = getBestPartner(allPartnersStats, id, 3);
    const worstPartnerMatch = getWorstPartner(allPartnersStats, id, 3);

    const bestPartner = bestPartnerMatch ? {
        name: playerMap[bestPartnerMatch.partnerId] || "Unknown",
        wins: bestPartnerMatch.stats.wins,
        total: bestPartnerMatch.stats.games,
        winRate: bestPartnerMatch.stats.winRate
    } : null;

    const sadgePartner = worstPartnerMatch ? {
        name: playerMap[worstPartnerMatch.partnerId] || "Unknown",
        wins: worstPartnerMatch.stats.wins,
        total: worstPartnerMatch.stats.games,
        winRate: worstPartnerMatch.stats.winRate
    } : null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-['Lexend',_sans-serif]">
            {/* Cinematic Background Overlay */}
            <div 
                className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
                style={{ backgroundImage: "url('/badminton-bg.png')" }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/95 pointer-events-none" />

            {/* Sidebar Navigation */}
            <aside className="relative z-20 w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md hidden lg:flex flex-col">
                <div className="p-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <Feather className="size-5 text-white transform rotate-45" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-100 tracking-tighter">
                                Cock<span className="text-sky-400">Count</span>
                            </h2>
                        </div>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest pl-1 leading-tight">
                            Because Shuttlecocks Aren't Free
                        </p>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link href={`${basePath}`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <LayoutDashboard className="size-5" />
                        <span className="text-sm font-bold tracking-wide uppercase">DASHBOARD</span>
                    </Link>
                    <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <CalendarDays className="size-5" />
                        <span className="text-sm font-bold tracking-wide uppercase">SESSIONS</span>
                    </Link>
                    <Link href={`${basePath}/purchases`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <Package className="size-5" />
                        <span className="text-sm font-bold tracking-wide uppercase">STOCK</span>
                    </Link>
                    <Link href={`${basePath}/payments`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <Wallet className="size-5" />
                        <span className="text-sm font-bold tracking-wide uppercase">PAYMENTS</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="relative z-20 flex-1 flex flex-col overflow-y-auto">
                <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-700">
                    <Link href={`${basePath}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-300 mb-6 transition-colors uppercase tracking-tight">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>

                    <header className="mb-8 flex items-center gap-4">
                        <div className="h-20 w-20 flex-shrink-0 bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-700 shadow-xl overflow-hidden relative">
                            <User className="w-8 h-8 text-slate-400 absolute" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-50 tracking-tight flex items-center gap-3">
                                {player.name}
                                <RankBadge elo={playerElo} />
                            </h1>
                            <div className="flex flex-col mt-2">
                                {bestPartner && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                                        <p className="text-xs font-bold text-slate-300">
                                            Best Partner: <span className="text-emerald-400">{bestPartner.name}</span>
                                        </p>
                                    </div>
                                )}
                                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest px-1">Player Profile</span>
                            </div>
                        </div>
                    </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 text-center pt-2 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <EloRatingCard 
                    playerElo={playerElo} 
                    eloLabel={eloLabel} 
                    eloColor={eloColor} 
                    eloBg={eloBg} 
                />
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden text-left hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300 cursor-default group">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><Activity className="w-12 h-12" /></div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1 relative z-10">Matches</p>
                    <p className="text-2xl font-bold font-mono text-slate-200 relative z-10">{totalMatchesCount}</p>
                </div>
                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden text-left">
                    <p className="text-[10px] font-bold uppercase text-emerald-400/80 mb-1 relative z-10 font-black tracking-widest leading-none">Win Rate</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400 relative z-10 leading-none mt-1">{winRate}%</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-widest">Win-Streak</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono italic">{winStreak} Wins</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden flex flex-col justify-center text-left">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Balance</p>
                    <p className={clsx(
                        "text-2xl font-black font-mono tracking-tighter italic leading-none",
                        currentBalance > 0 ? "text-rose-400" : "text-emerald-400"
                    )}>
                        {currentBalance > 0 ? "RM" : "CREDIT RM"}{Math.abs(currentBalance).toFixed(2)}
                    </p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col justify-center gap-2 text-left">
                    <div className="flex items-center justify-between text-xs px-2">
                        <span className="text-slate-500 font-bold uppercase">Paid</span>
                        <span className="font-mono text-emerald-400 font-bold whitespace-nowrap">RM{totalPayments.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs px-2">
                        <span className="text-slate-500 font-bold uppercase">Sessions</span>
                        <span className="font-mono text-slate-300 font-bold">{totalSessions}</span>
                    </div>
                </div>
            </div>

            {/* ELO Trend Graph Section */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 text-left shadow-xl hover:border-emerald-500/20 hover:shadow-emerald-500/5 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2 mb-6 italic">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Career ELO Progression
                </h3>
                <EloTrendChart data={eloTimeline} />
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left animate-fade-in-up" style={{ animationDelay: "350ms" }}>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><User className="w-16 h-16" /></div>
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" /> Partner Stats
                    </h3>
                    <div className="space-y-4">
                        {totalMatchesCount === 0 ? (
                            <p className="text-sm text-slate-500 italic mt-2 text-center font-bold font-mono tracking-widest uppercase">No Partner Data</p>
                        ) : (
                            <>
                                {bestPartner ? (
                                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                        <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Best Partner</p>
                                        <p className="text-lg font-bold text-slate-200">
                                            {bestPartner.name} – {Math.round((bestPartner.wins / bestPartner.total) * 100)}%
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">
                                            {bestPartner.wins} Wins / {bestPartner.total} Total
                                        </p>
                                    </div>
                                ) : null}

                                {sadgePartner && (sadgePartner.name !== bestPartner?.name || Object.keys(playerPartnerStats).length === 1) ? (
                                    <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1">Sadge Partner</p>
                                        <p className="text-lg font-bold text-slate-200">
                                            {sadgePartner.name} – {Math.round((sadgePartner.wins / sadgePartner.total) * 100)}%
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">
                                            {sadgePartner.wins} Wins / {sadgePartner.total} Total
                                        </p>
                                    </div>
                                ) : sadgePartner ? (
                                    <p className="text-[10px] text-slate-600 italic uppercase font-bold tracking-tighter text-center">Only one consistent partner found</p>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group text-left animate-fade-in-up" style={{ animationDelay: "450ms" }}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Swords className="w-16 h-16" /></div>
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                        <Swords className="w-4 h-4 text-rose-500" /> Rivalries (H2H)
                    </h3>
                    <div className="space-y-3">
                        {rivals.length > 0 ? rivals.map(r => (
                            <div key={r.name} className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-slate-300">{r.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-1.5 w-24 bg-slate-900 rounded-full overflow-hidden">
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
                            <p className="text-sm text-slate-500 italic mt-2 text-center font-bold font-mono tracking-widest uppercase">No Match History</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 text-left">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-tight text-slate-500 mb-4 flex items-center gap-2 italic">
                        <Swords className="w-5 h-5 text-slate-400" /> Match History
                    </h2>

                    <MatchHistory matches={formattedMatches} />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-tight text-slate-500 mb-4 flex items-center gap-2 italic">
                        <Wallet className="w-5 h-5 text-emerald-400" /> Payment History
                    </h2>

                    {(paymentsData || []).length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm italic">
                            No payments recorded.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(paymentsData || []).map((pay: { id: string, date: string, amount: number }) => (
                                <div key={pay.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700/80">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                            <Wallet className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-200 uppercase tracking-tighter italic">Payment Received</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{pay.date}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black font-mono text-emerald-400 italic">+RM{pay.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </main>
</div>
    );
}
