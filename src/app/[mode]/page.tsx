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
      <header className="mb-10">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-sky-100 to-sky-400 mb-2 tracking-tighter">
          CockCount
        </h1>
        <p className="text-slate-400 font-bold tracking-tight text-sm">
          "Because Shuttlecocks Aren’t Free."
        </p>
      </header>

      {/* Summary Cards - now 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60 hover:border-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pool Balance</p>
              <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                <CircleDollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className={clsx("text-2xl font-black font-mono tracking-tighter", totalPoolBalance >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {totalPoolBalance >= 0 ? "+" : "-"}RM {Math.abs(totalPoolBalance).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight mt-2">Net payments minus costs</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60 hover:border-sky-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Spent</p>
              <div className="p-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-700">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tracking-tighter text-slate-50">RM {totalPurchasesCost.toFixed(2)}</p>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight mt-2">Sum of all tube purchases</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60 hover:border-violet-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Shuttles Used</p>
              <div className="p-2 rounded-xl bg-slate-800 text-violet-400 border border-slate-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tracking-tighter text-slate-50">{totalShuttlesUsed}</p>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight mt-2">Total used across all sessions</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60 hover:border-amber-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Sessions</p>
              <div className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tracking-tighter text-slate-50">{totalSessions}</p>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight mt-2">Games played together</p>
          </div>
        </div>
      </div>

      {/* Player Balances Table — delegated to client component for sort toggle */}
      <DashboardClient players={players} />
    </div>
  );
}
