import { supabase } from "@/lib/supabase";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, CircleDollarSign, Package } from "lucide-react";
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-emerald-400 mb-2">
          Dashboard
        </h1>
        <p className="text-zinc-400">Overview of group costs and balances.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Group Balance</p>
              <p className={clsx(
                "text-3xl font-semibold mt-1",
                totalPoolBalance >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {totalPoolBalance >= 0 ? "+" : "-"}RM {Math.abs(totalPoolBalance).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-zinc-800/80 text-emerald-400 backdrop-blur-md">
              <CircleDollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 relative z-10">Net sum of all payments minus sessions costs</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Spent on Shuttles</p>
              <p className="text-3xl font-semibold mt-1 text-zinc-100">
                RM {totalPurchasesCost.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-zinc-800/80 text-cyan-400 backdrop-blur-md">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 relative z-10">Sum of all tube purchase prices</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-medium text-zinc-400">Dead Shuttles</p>
              <p className="text-3xl font-semibold mt-1 text-zinc-100">
                {totalDeadShuttles}
              </p>
            </div>
            <div className="p-3 rounded-full bg-zinc-800/80 text-amber-400 backdrop-blur-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 relative z-10">Total shuttles reported dead from sessions</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <h2 className="text-lg font-medium text-zinc-100">Player Balances</h2>
          <span className="text-xs font-medium px-2.5 py-1 bg-zinc-800 rounded-lg text-zinc-400">
            {players.length} Players
          </span>
        </div>

        {players.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            No players recorded yet. Add some sessions and payments!
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {players.map((player) => {
              const isDebt = player.balance < 0;
              const isSettled = Math.abs(player.balance) < 0.01;
              return (
                <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 font-medium text-zinc-300 shrink-0">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-200 truncate">{player.name}</p>
                      <p className="text-xs text-zinc-500 truncate">
                        Paid RM {player.totalPayments.toFixed(2)} • Shared RM {player.totalShares.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                    {isDebt && (
                      <SettleButton
                        playerId={player.id}
                        playerName={player.name}
                        amount={Math.abs(player.balance)}
                      />
                    )}

                    <div className="flex flex-col items-end sm:min-w-[100px]">
                      <div className={clsx(
                        "flex items-center gap-1 font-semibold",
                        isSettled ? "text-zinc-400" : isDebt ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {isSettled ? null : isDebt ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        <span className="text-lg">
                          RM {Math.abs(player.balance).toFixed(2)}
                        </span>
                      </div>
                      {!isSettled && (
                        <span className="text-[10px] uppercase text-zinc-500 font-medium">
                          {isDebt ? "In Debt" : "Credit"}
                        </span>
                      )}
                      {isSettled && (
                        <span className="text-[10px] uppercase text-zinc-500 font-medium text-right w-full">
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
