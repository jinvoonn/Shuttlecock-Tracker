import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import DesktopSessions from "@/stitch-designs/desktop/Sessions";
import MobileLogSessions from "@/stitch-designs/mobile/LogSessions";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getUserRole } from "@/lib/auth";
import { getViewerUnlockState } from "@/lib/actions/viewerPin";
import { redirect } from "next/navigation";
import { VIEWER_PERMISSIONS } from "@/lib/constants";

export const revalidate = 0;

export default async function LogSessionPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  
  // Enforce server-side authorization: Admin OR Unlocked Viewer with ADD_SESSION permission
  const role = await getUserRole(mode);
  if (role !== "admin") {
    const unlockState = await getViewerUnlockState();
    if (!unlockState.unlocked || !unlockState.permissions.includes(VIEWER_PERMISSIONS.ADD_SESSION)) {
      redirect(`/${mode}/sessions`);
    }
  }
  
  if (!isSupabaseConfigured) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-amber-500 bg-[#020617] text-center max-w-md mx-auto">
        <AlertCircle className="size-12 mb-4" />
        <p className="font-black italic uppercase text-2xl tracking-tighter">Configuration Required</p>
        <p className="text-sm text-slate-400 mt-2 font-bold tracking-tight">
          Vercel Environment Variables are missing.
        </p>
      </div>
    );
  }
  
  const [
    { data: playersData, error: playersError },
    { data: purchasesData, error: purchasesError }
  ] = await Promise.all([
    supabase.from("players").select("id, name").order("name"),
    supabase.from("purchases").select("id, tube_number, brands(name), price_per_tube, price_per_cock").gt("remaining_quantity", 0).order("created_at", { ascending: true })
  ]);

  if (playersError || purchasesError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load data
      </div>
    );
  }

  const sortedPurchases = (purchasesData || []).map(p => ({
    id: p.id,
    brand: (Array.isArray(p.brands) 
      ? (p.brands as unknown as {name: string}[])[0]?.name 
      : (p.brands as unknown as {name: string} | null)?.name) || "Unknown Brand",
    model: `Batch #${p.tube_number}`,
    price_per_tube: p.price_per_tube || 0,
    price_per_cock: p.price_per_cock || 0
  }));

  // 2. Fetch matches to compute Elos
  const { data: matchesData } = await supabase.from("matches").select("*").order("created_at", { ascending: true });
  const { data: allPlayers } = await supabase.from("players").select("id, name");
  const playerMap = Object.fromEntries((allPlayers || []).map(p => [p.id, p.name]));
  const normalizedMatches = normalizeMatches(matchesData || [], playerMap);
  const { elo: globalElo } = aggregatePlayerStats(normalizedMatches, playerMap);

  const players = (playersData || []).map(p => ({
    id: p.id,
    name: p.name,
    elo: globalElo[p.id] || 1200
  }));

  return (
    <>
      <div className="block lg:hidden">
        <MobileLogSessions tubes={sortedPurchases} players={players} />
      </div>
      <div className="hidden lg:block">
        <DesktopSessions tubes={sortedPurchases} players={players} />
      </div>
    </>
  );
}
