import { supabase } from "@/lib/supabase";
import MobileLogSessions from "@/stitch-designs/mobile/LogSessions";

export const revalidate = 0;

export default async function LogSessionsStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string }> 
}) {
  await params;
  
  const [
    { data: tubes, error: tubesError },
    { data: players, error: playersError }
  ] = await Promise.all([
    supabase
      .from("purchases")
      .select("id, brand, model, price_per_cock")
      .gt("remaining_quantity", 0)
      .order("created_at", { ascending: false }),
    supabase
      .from("players")
      .select("id, name")
      .order("name", { ascending: true })
  ]);

  if (tubesError || playersError) {
    return <div>Failed to load data</div>;
  }

  return (
    <MobileLogSessions 
      tubes={tubes || []} 
      players={players || []} 
    />
  );
}
