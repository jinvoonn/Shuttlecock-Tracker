import { supabase } from "@/lib/supabase";
import MobileStockInventory from "@/stitch-designs/mobile/StockInventory";

export const revalidate = 0;

export default async function StockInventoryStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string }> 
}) {
  const { mode } = await params;

  // 1. Fetch brands
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  // 2. Fetch purchases (history)
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("*, brands(name)")
    .order("purchase_date", { ascending: false });

  // 3. Fetch active tubes (inventory)
  // We'll calculate current stock from purchases and sessions (shuttles used)
  // Simplified for now: just show active brands/tubes
  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory")
    .select("*, brands(name)");

  const stats = {
    totalStock: inventory?.reduce((acc, item) => acc + item.quantity, 0) || 0,
    tubes: inventory?.length || 0,
    lowStock: inventory?.filter(item => item.quantity <= 3).length || 0,
    usedToday: 0 // This would need session data for the last 30 days
  };

  const activeTubes = inventory?.map(item => ({
    id: item.id,
    name: item.brands?.name || "Unknown Brand",
    quantity: item.quantity,
    total: 12 // Standard tube size
  })) || [];

  const history = purchases?.map(p => ({
    id: p.id,
    name: p.brands?.name || "Unknown Brand",
    date: p.purchase_date,
    price: p.price
  })) || [];

  return (
    <MobileStockInventory 
      stats={stats}
      activeTubes={activeTubes}
      history={history}
    />
  );
}
