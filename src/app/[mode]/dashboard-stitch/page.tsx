import { supabase } from "@/lib/supabase";
import MobileDashboard from "@/stitch-designs/mobile/Dashboard";

export const revalidate = 0;

export default async function DashboardStitchPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;

  // 1. Fetch all raw data
  const [
    { data: paymentsData, error: paymentsError },
    { data: purchasesData, error: purchasesError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("payments").select("amount, players(id, name)"),
    supabase.from("purchases").select("id, price_per_tube, remaining_quantity, initial_quantity"),
    supabase.from("sessions").select(`id, date, location, session_players ( players ( id, name ) )`).order('date', { ascending: false }),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)")
  ]);

  if (paymentsError || purchasesError || sessionsError || sessionUsageError) {
    return <div>Error loading data</div>;
  }

  // 2. Calculate Stats (reusing logic from existing dashboard)
  const totalSessions = (sessionsData || []).length;
  const totalShuttlesUsed = (sessionUsageData || []).reduce((acc, curr) => acc + Number(curr.quantity_used || 0), 0);
  
  const playerBalances: Record<string, { name: string; id: string; totalShares: number; totalPayments: number; balance: number }> = {};

  (paymentsData || []).forEach(p => {
    // @ts-expect-error type mismatch
    const id = p.players?.id || "unknown";
    // @ts-expect-error type mismatch
    const name = p.players?.name || "Unknown";
    if (!playerBalances[id]) playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, balance: 0 };
    playerBalances[id].totalPayments += Number(p.amount || 0);
  });

  const sessionCosts: Record<string, number> = {};
  (sessionUsageData || []).forEach(su => {
    const sId = su.session_id;
    // @ts-expect-error type mismatch
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
  })).sort((a, b) => b.balance - a.balance);

  const totalPoolBalance = players.reduce((acc, p) => acc + p.balance, 0);

  // 3. Inventory Stats
  const totalTubes = (purchasesData || []).length;
  const totalShuttles = (purchasesData || []).reduce((acc, curr) => acc + Number(curr.remaining_quantity || 0), 0);
  const remainingTubesCount = (purchasesData || []).filter(p => (p.remaining_quantity || 0) > 0).length;

  // 4. Upcoming Session (Most Recent/First in list since ordered by date desc)
  const upcomingSession = sessionsData && sessionsData.length > 0 ? {
    location: sessionsData[0].location || "Main Court",
    date: sessionsData[0].date
  } : undefined;

  const dashboardProps = {
    stats: {
      totalShuttlesUsed,
      totalSessions,
      totalPoolBalance,
      inventory: {
        totalTubes,
        remainingTubes: remainingTubesCount,
        totalShuttles
      }
    },
    players: players,
    upcomingSession
  };

  return <MobileDashboard {...dashboardProps} />;
}
