import { supabase } from "@/lib/supabase";
import DesktopDashboard from "@/stitch-designs/desktop/Dashboard";
import MobileDashboard from "@/stitch-designs/mobile/Dashboard";

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
    supabase.from("purchases").select("price_per_tube, quantity, brand"), // fetch quantity for inventory
    supabase.from("sessions").select(`id, session_players ( players ( id, name ) )`),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)")
  ]);

  if (paymentsError || purchasesError || sessionsError || sessionUsageError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-rose-500 bg-[#020617]">
        <p className="font-black italic uppercase text-2xl tracking-tighter">Failed to fetch data</p>
        <p className="text-sm text-slate-500 mt-2 font-bold tracking-widest uppercase">Database Connection Error</p>
      </div>
    );
  }

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

  // Calculate generic mock stock if not present
  const totalTubes = (purchasesData || []).reduce((acc, curr) => acc + Number(curr.quantity || 1), 0);
  const remainingTubes = Math.max(0, totalTubes - Math.floor(totalShuttlesUsed / 12));
  const totalShuttles = totalTubes * 12;

  const statsProps = {
    totalShuttlesUsed,
    totalSessions,
    totalPoolBalance,
    inventory: {
      totalTubes,
      remainingTubes,
      totalShuttles,
    }
  };

  return (
    <>
      <div className="block lg:hidden">
        <MobileDashboard stats={statsProps} players={players} />
      </div>
      <div className="hidden lg:block">
        <DesktopDashboard stats={statsProps} players={players} />
      </div>
    </>
  );
}
