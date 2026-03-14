import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import DesktopDashboard from "@/stitch-designs/desktop/Dashboard";
import MobileDashboard from "@/stitch-designs/mobile/Dashboard";
import { AlertCircle } from "lucide-react";
import { ADMIN_SECRET } from "@/lib/constants";

export const revalidate = 0;

export default async function DashboardPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  const isAdmin = mode === ADMIN_SECRET;

  if (!isSupabaseConfigured) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-amber-500 bg-[#020617] text-center max-w-md mx-auto">
        <AlertCircle className="size-12 mb-4" />
        <p className="font-black italic uppercase text-2xl tracking-tighter">Configuration Required</p>
        <p className="text-sm text-slate-400 mt-2 font-bold tracking-tight">
          Vercel Environment Variables are missing. Please add <code className="text-[#13ec80]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[#13ec80]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Project Settings.
        </p>
      </div>
    );
  }

  const [
    { data: paymentsData, error: paymentsError },
    { data: purchasesData, error: purchasesError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("payments").select("amount, players(id, name)"),
    supabase.from("purchases").select("price_per_tube, initial_quantity, remaining_quantity, brands(name)"),
    supabase.from("sessions").select(`id, session_players ( players ( id, name ) )`),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)")
  ]);

  if (paymentsError || purchasesError || sessionsError || sessionUsageError) {
    console.error("Dashboard Fetch Error:", { paymentsError, purchasesError, sessionsError, sessionUsageError });
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-rose-500 bg-[#020617]">
        <p className="font-black italic uppercase text-2xl tracking-tighter">Failed to fetch data</p>
        <p className="text-sm text-slate-500 mt-2 font-bold tracking-widest uppercase">Database Connection Error</p>
        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-500 max-w-lg overflow-auto">
           {JSON.stringify({ paymentsError, purchasesError, sessionsError, sessionUsageError }, null, 2)}
        </div>
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

  const players = Object.values(playerBalances).map(stats => ({
    ...stats,
    balance: stats.totalPayments - stats.totalShares,
  }));

  const totalPoolBalance = players.reduce((acc, p) => acc + p.balance, 0);

  // Calculate inventory based on remaining values
  const totalTubes = (purchasesData || []).filter(p => (p.remaining_quantity || 0) > 0).length;
  const totalShuttles = (purchasesData || []).reduce((acc, curr) => acc + Number(curr.remaining_quantity || 0), 0);

  const statsProps = {
    totalShuttlesUsed,
    totalSessions,
    totalPoolBalance,
    inventory: {
      totalTubes,
      remainingTubes: totalTubes, // Add this for type compatibility temporarily or update the component interface
      totalShuttles,
    }
  };

  return (
    <>
      <div className="block lg:hidden">
        <MobileDashboard stats={statsProps} players={players} />
      </div>
      <div className="hidden lg:block">
        <DesktopDashboard stats={statsProps} players={players} isAdmin={isAdmin} />
      </div>
    </>
  );
}
