import { supabase } from "@/lib/supabase";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, CircleDollarSign, Package, User } from "lucide-react";
import { SettleButton } from "@/components/SettleButton";
import clsx from "clsx";

export const revalidate = 0; // Disable static rendering for this page

export default async function DashboardPage() {
  // Fetch overall totals
  const [
    { data: paymentsData, error: paymentsError },
    { data: purchasesData, error: purchasesError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("payments").select("amount, players(id, name)"),
    supabase.from("purchases").select("price_per_tube"),
    supabase.from("sessions").select(`
      id,
      session_players ( players ( id, name ) )
    `),
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

  const totalPurchasesCost = (purchasesData || []).reduce(
    (acc, curr) => acc + Number(curr.price_per_tube || 0),
    0
  );

  const totalDeadShuttles = (sessionUsageData || []).reduce(
    (acc, curr) => acc + Number(curr.quantity_used || 0),
    0
  );

  // Calculate balances per player
  const playerBalances: Record<string, { name: string; id: string; totalShares: number; totalPayments: number; balance: number }> = {};

  // Payments processing
  (paymentsData || []).forEach(p => {
    // @ts-expect-error type mismatches
    const id = p.players?.id || "unknown";
    // @ts-expect-error type mismatches
    const name = p.players?.name || "Unknown";

    if (!playerBalances[id]) {
      playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, balance: 0 };
    }
    playerBalances[id].totalPayments += Number(p.amount || 0);
  });

  // Calculate cost of each session and distribute to its players
  const sessionCosts: Record<string, number> = {};

  (sessionUsageData || []).forEach(su => {
    const sId = su.session_id;
    // @ts-expect-error type mismatches
    const price_per_cock = Number(su.purchases?.price_per_cock || 0);
    const usageCost = price_per_cock * su.quantity_used;

    sessionCosts[sId] = (sessionCosts[sId] || 0) + usageCost;
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
          if (!playerBalances[id]) {
            playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, balance: 0 };
          }
          playerBalances[id].totalShares += share;
        }
      });
    }
  });

  const players = Object.values(playerBalances).map(stats => ({
    ...stats,
    balance: stats.totalPayments - stats.totalShares,
  }));

  // Sort: Debtors (most negative balance) first
  players.sort((a, b) => a.balance - b.balance);

  const totalPoolBalance = players.reduce((acc, p) => acc + p.balance, 0);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-sky-100 to-sky-400 mb-2 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 font-medium">Overview of group costs and balances.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Pool Balance</p>
              <p className={clsx(
                "text-3xl font-black font-mono tracking-tighter",
                totalPoolBalance >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {totalPoolBalance >= 0 ? "+" : "-"}RM {Math.abs(totalPoolBalance).toFixed(2)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner">
              <CircleDollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight relative z-10">Net sum of all payments minus costs</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Spent</p>
              <p className="text-3xl font-black font-mono tracking-tighter text-slate-50">
                RM {totalPurchasesCost.toFixed(2)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800 text-sky-400 border border-slate-700 shadow-inner">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight relative z-10">Sum of all tube purchase prices</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-slate-900/60">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Dead Shuttles</p>
              <p className="text-3xl font-black font-mono tracking-tighter text-slate-50">
                {totalDeadShuttles}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800 text-violet-400 border border-slate-700 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight relative z-10">Total reported used in sessions</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-slate-950/50">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <h2 className="text-lg font-bold uppercase tracking-tight text-slate-200">Player Balances</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-slate-800/80 rounded-full text-slate-500 border border-slate-700/50">
            {players.length} Registered
          </span>
        </div>

        {players.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-slate-600">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-slate-300 font-bold mb-1">No players found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              No data recorded yet. Add some sessions and payments to see balances!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {players.map((player) => {
              const isDebt = player.balance < 0;
              const isSettled = Math.abs(player.balance) < 0.01;
              return (
                <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-slate-800/30 transition-all gap-5 group/item">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-slate-400 shrink-0 group-hover/item:border-slate-600 group-hover/item:text-slate-200 transition-all shadow-inner">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 truncate group-hover/item:text-slate-50 transition-colors">{player.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">Paid RM {player.totalPayments.toFixed(2)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">Shared RM {player.totalShares.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-10 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/50 pt-4 sm:pt-0">
                    {isDebt && (
                      <SettleButton
                        playerId={player.id}
                        playerName={player.name}
                        amount={Math.abs(player.balance)}
                      />
                    )}

                    <div className="flex flex-col items-end sm:min-w-[120px]">
                      <div className={clsx(
                        "flex items-center gap-1.5 font-bold font-mono tracking-tighter",
                        isSettled ? "text-slate-500" : isDebt ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {isSettled ? null : isDebt ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        <span className="text-xl">
                          RM {Math.abs(player.balance).toFixed(2)}
                        </span>
                      </div>
                      {!isSettled && (
                        <span className={clsx(
                          "text-[10px] uppercase font-bold tracking-widest mt-0.5",
                          isDebt ? "text-rose-500/50" : "text-emerald-500/50"
                        )}>
                          {isDebt ? "In Debt" : "Credit"}
                        </span>
                      )}
                      {isSettled && (
                        <span className="text-[10px] uppercase text-slate-600 font-bold tracking-widest mt-0.5">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

  );
}
