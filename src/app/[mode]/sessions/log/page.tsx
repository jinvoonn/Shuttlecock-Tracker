import { supabase } from "@/lib/supabase";
import DesktopSessions from "@/stitch-designs/desktop/Sessions";
import MobileLogSessions from "@/stitch-designs/mobile/LogSessions";

export const revalidate = 0;

export default async function LogSessionPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
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

  const players = (playersData || []).map(p => ({
    id: p.id,
    name: p.name,
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
