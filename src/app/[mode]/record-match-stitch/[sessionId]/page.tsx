import { supabase } from "@/lib/supabase";
import MobileRecordMatch from "@/stitch-designs/mobile/RecordMatch";

export const revalidate = 0;

export default async function RecordMatchStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string; sessionId: string }> 
}) {
  const { sessionId } = await params;

  // 1. Fetch all players
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, name")
    .order("name");

  if (playersError) {
    return <div>Error loading players</div>;
  }

  return <MobileRecordMatch sessionId={sessionId} players={playersData || []} />;
}
