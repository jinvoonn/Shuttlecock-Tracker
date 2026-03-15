import { supabase } from "@/lib/supabase";
import DesktopSessions from "@/stitch-designs/desktop/Sessions";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function EditSessionPage({ params }: { params: Promise<{ mode: string, id: string }> }) {
  const { mode, id } = await params;
  
  const [
    { data: session, error: sessionError },
    { data: playersData, error: playersError },
    { data: purchasesData, error: purchasesError }
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select(`
        *,
        session_players ( player_id ),
        session_usage ( purchase_id, quantity_used )
      `)
      .eq("id", id)
      .single(),
    supabase.from("players").select("id, name").order("name"),
    supabase.from("purchases").select("id, tube_number, brands(name), price_per_tube, price_per_cock, remaining_quantity").gt("remaining_quantity", 0).order("created_at", { ascending: true })
  ]);

  if (sessionError || !session || playersError || purchasesError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load session data for editing
      </div>
    );
  }

  // Restore inventory for the current session's usage so the editor shows correct availability
  const initialUsage = session.session_usage || [];
  const sortedPurchases = (purchasesData || []).map(p => {
    const usedInThisSession = initialUsage.find((u: { purchase_id: string }) => u.purchase_id === p.id)?.quantity_used || 0;
    return {
      id: p.id,
      brand: (Array.isArray(p.brands) 
        ? (p.brands as unknown as {name: string}[])[0]?.name 
        : (p.brands as unknown as {name: string} | null)?.name) || "Unknown Brand",
      model: `Batch #${p.tube_number}`,
      price_per_tube: p.price_per_tube || 0,
      price_per_cock: p.price_per_cock || 0,
      remaining_quantity: p.remaining_quantity + usedInThisSession
    };
  });

  const players = (playersData || []).map(p => ({
    id: p.id,
    name: p.name,
  }));

  const initialData = {
    id: session.id,
    date: session.date,
    location: session.location || "",
    notes: session.notes || "",
    playerIds: session.session_players?.map((sp: { player_id: string }) => sp.player_id) || [],
    usage: initialUsage.map((u: { purchase_id: string, quantity_used: number }) => ({ purchaseId: u.purchase_id, quantityUsed: u.quantity_used }))
  };

  return (
    <div className="hidden lg:block">
      <DesktopSessions tubes={sortedPurchases} players={players} initialData={initialData} />
    </div>
  );
}
