import { supabase } from "@/lib/supabase";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, CircleDollarSign, Package, User, CalendarDays } from "lucide-react";
import { SettleButton } from "@/components/SettleButton";
import { DashboardClient } from "@/components/DashboardClient";
import clsx from "clsx";

export const revalidate = 0;

export default async function DashboardPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  const [
    { data: paymentsData, error: paymentsError },
    { data: purchasesData, error: purchasesError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("payments").select("amount, players(id, name)"),
    supabase.from("purchases").select("price_per_tube"),
    supabase.from("sessions").select(`id, session_players ( players ( id, name ) )`),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)")
  ]);

  if (paymentsError || purchasesError || sessionsError || sessionUsageError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>Failed to fetch dashboard data.</p>
        <p className="text-sm">Did you run the <code className="bg-rose-900/50 px-2 py-0.5 rounded">schema_v2.sql</code> file to upgrade your database?</p>
      </div>
    );
  }

  const totalPurchasesCost = (purchasesData || []).reduce((acc, curr) => acc + Number(curr.price_per_tube || 0), 0);
  const totalShuttlesUsed = (sessionUsageData || []).reduce((acc, curr) => acc + Number(curr.quantity_used || 0), 0);
  const totalSessions = (sessionsData || []).length;

  const playerBalances: Record<string, { name: string; id: string; totalShares: number; totalPayments: number; balance: number }> = {};

  (paymentsData || []).forEach(p => {
    // @ts-expect-error type mismatches
    const id = p.players?.id || "unknown";
    // @ts-expect-error type mismatches
    const name = p.players?.name || "Unknown";
    if (!playerBalances[id]) playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, balance: 0 };
    playerBalances[id].totalPayments += Number(p.amount || 0);
  });

  const sessionCosts: Record<string, number> = {};
  (sessionUsageData || []).forEach(su => {
    const sId = su.session_id;
    // @ts-expect-error type mismatches
    const price_per_cock = Number(su.purchases?.price_per_cock || 0);
    sessionCosts[sId] = (sessionCosts[sId] || 0) + (price_per_cock * su.quantity_used);
  });

  (sessionsData || []).forEach(s => {
    const totalCost = sessionCosts[s.id] || 0;
    const attendees = s.session_players || [];
    if (attendees.length > 0 && totalCost > 0) {
      const share = totalCost / attendees.length;
      attendees.forEach((sp: any) => {
        const id = sp.players?.id;
        const name = sp.players?.name;
        if (id) {
          if (!playerBalances[id]) playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, balance: 0 };
          playerBalances[id].totalShares += share;
        }
      });
    }
  });

  const players = Object.values(playerBalances).map(stats => ({
    ...stats,
    balance: stats.totalPayments - stats.totalShares,
  }));

  const totalPoolBalance = players.reduce((acc, p) => acc + p.balance, 0);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="sticky top-0 z-10 flex items-center justify-between py-6 bg-navy-950/80 backdrop-blur-md mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h1 className="text-3xl italic-header text-white">COCKCOUNT</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 w-11 h-11 hover:border-sky-500/50 transition-all active:scale-95 text-slate-400">
            <ArrowDownRight className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 w-11 h-11 hover:border-sky-500/50 transition-all active:scale-95 text-sky-400">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-8">
        {/* Top Metrics Grid (2x2) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-900 p-6 border border-slate-800 transition-all hover:border-sky-500/30">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
              <p className="stat-label">Shuttles Used</p>
            </div>
            <p className="font-mono text-4xl font-black text-white tracking-tighter">{totalShuttlesUsed}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-900 p-6 border border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
              <p className="stat-label">Sessions</p>
            </div>
            <p className="font-mono text-4xl font-black text-white tracking-tighter">{totalSessions}</p>
          </div>
        </div>

        {/* Dashboard Stats Grid (Financials) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-900 p-6 border border-slate-800">
            <div className="flex items-center gap-2">
              <CircleDollarSign className={clsx("w-3.5 h-3.5", totalPoolBalance >= 0 ? "text-emerald-400" : "text-rose-400")} />
              <p className="stat-label">Pool Balance</p>
            </div>
            <p className={clsx("font-mono text-2xl font-black tracking-tighter", totalPoolBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {totalPoolBalance >= 0 ? "+" : "-"}RM {Math.abs(totalPoolBalance).toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-900 p-6 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Package className="w-3.5 h-3.5 text-rose-400" />
              <p className="stat-label uppercase tracking-widest">Stock Tubes</p>
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-black text-white leading-none">{(purchasesData || []).length} Tubes</p>
              <p className="text-[10px] font-black text-rose-400 mt-2 uppercase tracking-widest opacity-80">Remaining</p>
            </div>
          </div>
        </div>

        {/* Next Session Banner Placeholder - Matching Proposal Structure */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 group h-44 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10"></div>
          <div className="relative z-20 flex flex-col justify-center h-full gap-4 p-8">
            <div>
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Next Active Session</p>
              <h3 className="text-4xl italic-header text-white leading-none mt-2">BADMINTON AM</h3>
              <p className="text-slate-500 text-xs font-bold mt-3 flex items-center gap-2 tracking-tight">
                <CalendarDays className="w-4 h-4 text-sky-500" /> Active Session Records Found
              </p>
            </div>
          </div>
          {/* Faded Background Image */}
          <div className="absolute top-0 right-0 w-3/5 h-full bg-cover bg-center opacity-10 grayscale-100 group-hover:opacity-20 transition-all duration-700 pointer-events-none" style={{ backgroundImage: "url('/badminton-bg.png')" }} />
        </div>

        {/* Player Balances - The Ledger */}
        <DashboardClient players={players} />
      </main>
    </div>
  );
}
