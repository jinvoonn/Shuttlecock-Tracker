import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import DesktopDashboard from "@/stitch-designs/desktop/Dashboard";
import MobileDashboard from "@/stitch-designs/mobile/Dashboard";
import { AlertCircle } from "lucide-react";
import { ADMIN_SECRET } from "@/lib/constants";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getLeaderboard, getGlobalInsights } from "@/lib/analytics/leaderboard";
import DashboardClient from "@/components/DashboardClient";

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
    { data: playersData, error: playersError },
    { data: paymentsData, error: paymentsError },
    { data: purchasesData, error: purchasesError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError },
    { data: snapshotsData, error: snapshotsError }
  ] = await Promise.all([
    supabase.from("players").select("id, name"),
    supabase.from("payments").select("amount, player_id"),
    supabase.from("purchases").select("price_per_tube, initial_quantity, remaining_quantity, brands(name)"),
    supabase.from("sessions").select(`id, date, session_players ( player_id )`),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)"),
    supabase.from("leaderboard_snapshots").select("player_id, rank, period_end, wins, win_rate, cock_rating").order("period_end", { ascending: false })
  ]);

  if (playersError || paymentsError || purchasesError || sessionsError || sessionUsageError || snapshotsError) {
    console.error("Dashboard Fetch Error:", { playersError, paymentsError, purchasesError, sessionsError, sessionUsageError, snapshotsError });
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

  const basePath = `/${mode}`;
  const isAdminUser = mode === ADMIN_SECRET;

  return (
    <DashboardClient 
      playersData={playersData || []}
      paymentsData={paymentsData || []}
      purchasesData={purchasesData || []}
      sessionsData={sessionsData || []}
      sessionUsageData={sessionUsageData || []}
      snapshotsData={snapshotsData || []}
      isAdmin={isAdminUser}
      basePath={basePath}
    />
  );
}
