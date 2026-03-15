import { supabase } from "@/lib/supabase";
import { User, Swords, Activity, ArrowLeft, Target, LayoutDashboard, CalendarDays, Package, Wallet } from "lucide-react";
import Link from "next/link";
import { SkillRatingEditor } from "@/components/SkillRatingEditor";
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

    // Calculate generic stats
    let totalMatchesCount = 0;
    let wins = 0;
    let losses = 0;

    const formattedMatches = (matches || []).map((m: { id: string, created_at: string, team_a_score: number, team_b_score: number, team_a_player1: string, team_a_player2: string, team_b_player1: string, team_b_player2: string, sessions: { date: string } | { date: string }[] | null }) => {
        totalMatchesCount++;
        
        const isTeamA = m.team_a_player1 === id || m.team_a_player2 === id;
        
        const myScore = isTeamA ? m.team_a_score : m.team_b_score;
        const oppScore = isTeamA ? m.team_b_score : m.team_a_score;
        
        const isWin = myScore > oppScore;
        const isDraw = myScore === oppScore;

        if (isWin) wins++;
        else if (!isDraw) losses++;
        
        const myPartnerId = isTeamA 
            ? (m.team_a_player1 === id ? m.team_a_player2 : m.team_a_player1)
            : (m.team_b_player1 === id ? m.team_b_player2 : m.team_b_player1);
        
        const opponentsIds = isTeamA 
            ? [m.team_b_player1, m.team_b_player2]
            : [m.team_a_player1, m.team_a_player2];

        const myPartners = myPartnerId && myPartnerId !== id ? [myPartnerId] : [];
        const opponents = opponentsIds.filter(Boolean);

        return {
            id: m.id,
            date: (Array.isArray(m.sessions) ? m.sessions[0]?.date : m.sessions?.date) || new Date(m.created_at).toISOString().split('T')[0],
            isWin,
            isDraw,
            myScore,
            oppScore,
            partners: myPartners.map((pid: string) => playerMap[pid] || "Unknown"),
            opponents: opponents.map((pid: string) => playerMap[pid] || "Unknown")
        };
    });

    const winRate = totalMatchesCount > 0 ? Math.round((wins / totalMatchesCount) * 100) : 0;

    // --- PHASE 11: ADVANCED ANALYTICS ---
    const h2h: Record<string, { name: string, wins: number, losses: number, total: number }> = {};
    const partnersMap: Record<string, { name: string, wins: number, total: number }> = {};

    formattedMatches.forEach((m: { isWin: boolean, isDraw: boolean, opponents: string[], partners: string[] }) => {
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
                    <div className="flex items-center gap-3 text-[#13ec80]">
                        <div className="size-8 bg-[#13ec80]/10 rounded-lg flex items-center justify-center border border-[#13ec80]/20">
                            <Activity className="size-5 font-bold" />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-slate-100 uppercase">COCKCOUNT</h2>
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
                            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">{player.name}</h1>
                            <div className="flex flex-col mt-2">
                                <SkillRatingEditor playerId={player.id} initialSkill={player.skill_rating || 5} />
                                <span className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest px-1">Player Profile</span>
                            </div>
                        </div>
                    </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center pt-2">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><Activity className="w-12 h-12" /></div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1 relative z-10">Matches</p>
                    <p className="text-2xl font-bold font-mono text-slate-200 relative z-10">{totalMatchesCount}</p>
                </div>
                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden text-left">
                    <p className="text-[10px] font-bold uppercase text-emerald-400/80 mb-1 relative z-10 font-black tracking-widest leading-none">Win Rate</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400 relative z-10 leading-none mt-1">{winRate}%</p>
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

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><User className="w-16 h-16" /></div>
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" /> Best Partner
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

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group text-left">
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
                            <p className="text-sm text-slate-500 italic mt-2 text-center">No match history found</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 text-left">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-tight text-slate-500 mb-4 flex items-center gap-2 italic">
                        <Swords className="w-5 h-5 text-slate-400" /> Match History
                    </h2>

                    {formattedMatches.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm italic">
                            No matches recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formattedMatches.map((m: { id: string, date: string, isWin: boolean, isDraw: boolean, myScore: number, oppScore: number, partners: string[], opponents: string[] }) => (
                                <div key={m.id} className="flex flex-col bg-slate-900 p-4 rounded-xl border border-slate-700/80 gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                                                <span className="text-[11px] font-black text-slate-300 font-mono">{new Date(m.date).getDate()}</span>
                                                <span className="text-[8px] font-bold uppercase text-slate-600 leading-none">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div>
                                                {m.isWin ? (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase italic">Win</span>
                                                ) : m.isDraw ? (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 uppercase italic">Draw</span>
                                                ) : (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 uppercase italic">Loss</span>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] tracking-tight">
                                                    <span className={m.isWin ? "text-emerald-400 font-bold" : "text-slate-300"}>{m.myScore}</span>
                                                    <span className="text-slate-600">-</span>
                                                    <span className={!m.isWin && !m.isDraw ? "text-emerald-400 font-bold" : "text-slate-300"}>{m.oppScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-tight">
                                        <p className="mb-1 uppercase tracking-tighter">Partner: <span className="text-slate-300">{m.partners.length > 0 ? m.partners.join(" + ") : "None"}</span></p>
                                        <p className="uppercase tracking-tighter">Opponents: <span className="text-slate-300">{m.opponents.join(" + ")}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
