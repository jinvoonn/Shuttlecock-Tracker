import { supabase } from "@/lib/supabase";
import DesktopRecordTransaction from "@/stitch-designs/desktop/RecordTransaction";
import MobileRecordTransaction from "@/stitch-designs/mobile/RecordTransaction";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";

export const revalidate = 0;

export default async function RecordTransactionPage({ params, searchParams }: { params: Promise<{ mode: string }>, searchParams?: Promise<{ sessionId?: string }> }) {
  await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const sessionId = resolvedSearchParams.sessionId;
  
  const { data: playersData, error: playersError } = await supabase.from("players").select("id, name").order("name");

  if (playersError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load players
      </div>
    );
  }

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
        <MobileRecordTransaction players={players} sessionId={sessionId} />
      </div>
      <div className="hidden lg:block">
        <DesktopRecordTransaction players={players} sessionId={sessionId} />
      </div>
    </>
  );
}
