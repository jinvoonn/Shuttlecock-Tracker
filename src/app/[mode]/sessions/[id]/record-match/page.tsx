import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import DesktopRecordMatch from "@/stitch-designs/desktop/RecordMatch";
import MobileRecordMatch from "@/stitch-designs/mobile/RecordMatch";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";

export const revalidate = 0;

export default async function RecordMatchPage({ params }: { params: Promise<{ mode: string, id: string }> }) {
  const { mode, id } = await params;
  
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

  const { data: sessionPlayers, error: playersError } = await supabase
    .from("session_players")
    .select("players(id, name)")
    .eq("session_id", id);

  const { data: session } = await supabase.from("sessions").select("date").eq("id", id).single();
  const sessionDate = session?.date || new Date().toISOString().split('T')[0];

  if (playersError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load session players
      </div>
    );
  }

  // 2. Fetch all matches to compute Elos
  const { data: matchesData } = await supabase.from("matches").select("*").order("created_at", { ascending: true });
  const { data: allPlayers } = await supabase.from("players").select("id, name");
  const playerMap = Object.fromEntries((allPlayers || []).map(p => [p.id, p.name]));
  const normalizedMatches = normalizeMatches(matchesData || [], playerMap);
  const { elo: globalElo } = aggregatePlayerStats(normalizedMatches, playerMap);

  const players = (sessionPlayers || []).map((sp: any) => {
    const p = Array.isArray(sp.players) ? sp.players[0] : sp.players;
    if (!p) return null;
    return {
      ...p,
      elo: globalElo[p.id] || 1200
    };
  }).filter(Boolean);

  Object.fromEntries(players.map((p: { id: string, name: string }) => [p.id, p.name]));

  return (
    <>
      <div className="block lg:hidden">
        <MobileRecordMatch sessionId={id} players={players} sessionDate={sessionDate} />
      </div>
      <div className="hidden lg:block">
        <DesktopRecordMatch sessionId={id} players={players} sessionDate={sessionDate} />
      </div>
    </>
  );
}
