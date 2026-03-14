import { supabase } from "@/lib/supabase";
import DesktopStockInventory from "@/stitch-designs/desktop/StockInventory";
import MobileStockInventory from "@/stitch-designs/mobile/StockInventory";

export const revalidate = 0;

export default async function PurchasesPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
  const [
    { data: purchasesData, error: purchasesError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("purchases").select("*, brands(name)").order("purchase_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("session_usage").select("quantity_used, created_at").gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
  ]);

  if (purchasesError || sessionUsageError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load inventory data
      </div>
    );
  }

  // Calculate Stats
  let totalStock = 0;
  let tubes = 0;
  let lowStock = 0;
  const usedToday = (sessionUsageData || []).reduce((acc, curr) => acc + (curr.quantity_used || 0), 0);

  const activeTubes: any[] = [];
  const history: any[] = [];

  (purchasesData || []).forEach(p => {
    const brandName = (p.brands as any)?.name || "Unknown Brand";
    const name = `${brandName} Tube #${p.tube_number}`;
    
    // Add to history
    history.push({
      id: p.id,
      name,
      date: new Date(p.purchase_date || p.created_at).toLocaleDateString(),
      price: p.price_per_tube || 0
    });

    if (p.remaining_quantity && p.remaining_quantity > 0) {
      totalStock += p.remaining_quantity;
      tubes += 1;
      if (p.remaining_quantity <= 4) lowStock += 1;

      activeTubes.push({
        id: p.id,
        name,
        quantity: p.remaining_quantity,
        total: p.initial_quantity || 12
      });
    }
  });

  const stats = {
    totalStock,
    tubes,
    lowStock,
    usedToday
  };

  return (
    <>
      <div className="block lg:hidden">
        <MobileStockInventory stats={stats} activeTubes={activeTubes} history={history} />
      </div>
      <div className="hidden lg:block">
        <DesktopStockInventory stats={stats} activeTubes={activeTubes} history={history} />
      </div>
    </>
  );
}
