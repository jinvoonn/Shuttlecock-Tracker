import { supabase } from "@/lib/supabase";
import MobileRecordTransaction from "@/stitch-designs/mobile/RecordTransaction";

export const revalidate = 0;

export default async function RecordTransactionStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string }> 
}) {
  await params;
  
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name")
    .order("name");

  if (error) {
    return <div>Failed to load players</div>;
  }

  return (
    <MobileRecordTransaction players={players || []} />
  );
}
