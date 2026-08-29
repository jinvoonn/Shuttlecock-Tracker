import { supabase } from "@/lib/supabase";
import { User, Swords, Activity, ArrowLeft, Target, LayoutDashboard, CalendarDays, Package, Wallet, Feather, TrendingUp, Trophy, Medal, Award } from "lucide-react";
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
import { getCockRank } from "@/lib/analytics/rank";
import RankBadge from "@/components/ui/RankBadge";
import PlayerName from "@/components/ui/PlayerName";
import PlayerCard from "@/components/player/PlayerCard";
import { calculateSessionCosts, calculateSessionAttendeeCounts } from "@/lib/calculations/balance";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

    // Fetch ALL matches to ensure global ELO consistency
    const { data: allMatchesData } = await supabase
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
        .order("created_at", { ascending: true });

    const matches = allMatchesData || [];

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
        
        const costs = calculateSessionCosts((allUsageForSessions as any) || []);
        const counts = calculateSessionAttendeeCounts((allPlayersForSessions as any) || []);
        
        playerSessionIds.forEach(sid => {
            const sessionCost = costs[sid] || 0;
            const attendeeCount = counts[sid] || 1;
            totalOwed += sessionCost / attendeeCount;
        });
    }

    const currentBalance = totalOwed - totalPayments;

    // --- SEASON DATA & BADGES ---
    // Fetch active season for dynamic season badge
    let activeSeason: { season_number: number; name: string; status: string } | null = null;
    let seasonBadges: Array<{
        season_number: number;
        season_name: string;
        final_rank: number;
        final_cock_rating: number;
        wins: number;
        losses: number;
    }> = [];

    try {
        const [
            { data: seasonData },
            { data: pastResultsData }
        ] = await Promise.all([
            supabase
                .from("seasons")
                .select("season_number, name, status")
                .eq("status", "active")
                .maybeSingle(),
            supabase
                .from("season_player_results")
                .select("final_rank, final_cock_rating, wins, losses, seasons(season_number, name)")
                .eq("player_id", id)
        ]);

        activeSeason = seasonData;

        if (pastResultsData && pastResultsData.length > 0) {
            seasonBadges = pastResultsData.map((r: any) => {
                const s = Array.isArray(r.seasons) ? r.seasons[0] : r.seasons;
                return {
                    season_number: s?.season_number || 1,
                    season_name: s?.name || `Season ${s?.season_number || 1}`,
                    final_rank: r.final_rank,
                    final_cock_rating: r.final_cock_rating,
                    wins: r.wins,
                    losses: r.losses
                };
            }).sort((a, b) => b.season_number - a.season_number);
        }
    } catch {
        // Seasons table may not exist yet, fallback gracefully
    }
    const seasonNumber = activeSeason?.season_number ?? 1;
    const seasonEdition = `Season ${seasonNumber} Edition`;

    // --- ANALYTICS ENGINE INTEGRATION ---
    const normalizedMatches = normalizeMatches(matches || [], playerMap);
    const { stats: allStats, elo: globalElo, eloHistory, deltas } = aggregatePlayerStats(normalizedMatches, playerMap);
    const currentPlayerStats = allStats[id];
    
    // Explicitly derive placement status
    const placementMatchesPlayed = currentPlayerStats?.placementMatchesPlayed ?? 0;
    const isUnranked = placementMatchesPlayed < 5;
    
    const allPartnersStats = getPartnerStats(normalizedMatches);
    const playerPartnerStats = allPartnersStats[id] || {};
    
    const eloTimeline = getPlayerEloHistory(eloHistory, id);

    const totalMatchesCount = currentPlayerStats?.totalGames || 0;
    const wins = currentPlayerStats?.wins || 0;
    const losses = currentPlayerStats?.losses || 0;
    const winRate = currentPlayerStats ? Math.round(currentPlayerStats.winRate * 100) : 0;
    const winStreak = currentPlayerStats?.streak || 0;
    const recentForm = currentPlayerStats?.lastResults || [];
    
    // ELO Settings
    const playerElo = Math.round(globalElo[id] || 1200);
    const rank = getCockRank(playerElo, placementMatchesPlayed);

    // Map matches for backward compatibility with UI - ONLY for this player
    const formattedMatches = normalizedMatches
        .filter((m: any) => m.teamA.includes(id) || m.teamB.includes(id))
        .reverse() // Newest first
        .map((m: any) => {
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
            ratingDelta: deltas?.[m.id]?.[id],
            partners: myPartnerIds.map((pid: string) => ({
                id: pid,
                name: playerMap[pid] || "Unknown",
                elo: Math.round(globalElo[pid] || 1200)
            })),
            opponents: opponentIds.map((pid: string) => ({
                id: pid,
                name: playerMap[pid] || "Unknown",
                elo: Math.round(globalElo[pid] || 1200)
            }))
        };
    });

    // H2H Logic
    const h2h: Record<string, { name: string, wins: number, losses: number, total: number }> = {};
    formattedMatches.forEach((m: any) => {
        m.opponents.forEach((opp: any) => {
            const oppName = typeof opp === 'string' ? opp : opp.name;
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
        <ErrorBoundary fallback={
            <div className="p-8 text-rose-500 flex flex-col items-center justify-center min-h-screen bg-slate-900">
                <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">Something went wrong</h2>
                <p className="text-slate-400 mb-6">We couldn't load this player profile.</p>
                <Link href={basePath} className="px-6 py-3 bg-slate-800 rounded-xl text-white font-bold hover:bg-slate-700 transition-all">
                    Back to Dashboard
                </Link>
            </div>
        }>
            <PlayerProfileContent />
        </ErrorBoundary>
    );

    function PlayerProfileContent() {
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

                    <header className="mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* THE HERO CARD */}
                        <div className="flex-shrink-0 animate-in slide-in-from-left duration-700">
                             <PlayerCard 
                                player={{ id, name: player.name }}
                                stats={{
                                    elo: playerElo,
                                    winRate,
                                    wins,
                                    streak: winStreak,
                                    placementMatchesPlayed
                                }}
                                seasonEdition={seasonEdition}
                             />
                        </div>

                        {/* Profile Info Overlay (Desktop only side car) */}
                        <div className="flex-1 space-y-6 py-4">
                            <div>
                                <h1 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Official Bio</h1>
                                <PlayerName 
                                    name={player.name} 
                                    elo={playerElo} 
                                    placementMatchesPlayed={placementMatchesPlayed}
                                    showRankName={true} 
                                    nameClassName="text-4xl"
                                />
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {id.slice(0,8)}</p>
                                    </div>
                                    {isUnranked && (
                                        <span className="text-[10px] text-amber-500/80 font-black uppercase tracking-tighter">
                                            • Placement {placementMatchesPlayed}/5
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 max-w-xs">
                                {bestPartner && (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                        <Target className="w-4 h-4 text-emerald-400" />
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase">Best Synergy</p>
                                            <p className="text-xs font-bold text-slate-300">
                                                <span className="text-emerald-400">{bestPartner.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Season {seasonNumber} Active</span>
                                <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Ranking</span>
                                
                                {/* Historical Season Achievements / Badges */}
                                {seasonBadges.map((b) => {
                                    const isChamp = b.final_rank === 1;
                                    const isRunnerUp = b.final_rank === 2;
                                    const isThird = b.final_rank === 3;
                                    const isTop5 = b.final_rank <= 5 && b.final_rank > 3;

                                    return (
                                        <div 
                                            key={b.season_number}
                                            className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm transition-transform hover:scale-105",
                                                isChamp && "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-400/40 shadow-amber-500/10",
                                                isRunnerUp && "bg-gradient-to-r from-slate-300/20 to-slate-400/20 text-slate-200 border-slate-300/40",
                                                isThird && "bg-gradient-to-r from-amber-700/20 to-orange-700/20 text-orange-300 border-orange-500/40",
                                                isTop5 && "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                                                !isChamp && !isRunnerUp && !isThird && !isTop5 && "bg-slate-800/80 text-slate-400 border-slate-700"
                                            )}
                                            title={`Season ${b.season_number} Rank #${b.final_rank} (${b.final_cock_rating} CR)`}
                                        >
                                            {isChamp && <Trophy className="size-3 text-amber-400 animate-pulse" />}
                                            {isRunnerUp && <Medal className="size-3 text-slate-300" />}
                                            {isThird && <Medal className="size-3 text-orange-400" />}
                                            {isTop5 && <Award className="size-3 text-emerald-400" />}
                                            <span>
                                                {isChamp 
                                                    ? `S${b.season_number} Champion 🥇` 
                                                    : isRunnerUp 
                                                    ? `S${b.season_number} Runner-Up 🥈` 
                                                    : isThird 
                                                    ? `S${b.season_number} 3rd Place 🥉` 
                                                    : isTop5 
                                                    ? `S${b.season_number} Top 5 (#${b.final_rank})` 
                                                    : `S${b.season_number} Rank #${b.final_rank}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 text-center pt-2 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <EloRatingCard 
                    playerElo={playerElo} 
                    placementMatchesPlayed={placementMatchesPlayed}
                    eloLabel={rank.name} 
                    eloColor={rank.color} 
                    eloBg={rank.color} 
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
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> CockRating Progression
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
}
