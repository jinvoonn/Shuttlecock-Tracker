import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import DesktopStockInventory from "@/stitch-designs/desktop/StockInventory";
import MobileStockInventory from "@/stitch-designs/mobile/StockInventory";
import { AlertCircle } from "lucide-react";

export const revalidate = 0;

export default async function PurchasesPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
  if (!isSupabaseConfigured) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-amber-500 bg-[#020617] text-center max-w-md mx-auto">
        <AlertCircle className="size-12 mb-4" />
        <p className="font-black italic uppercase text-2xl tracking-tighter">Configuration Required</p>
        <p className="text-sm text-slate-400 mt-2 font-bold tracking-tight">
          Vercel Environment Variables are missing. Please add <code className="text-[#13ec80]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[#13ec80]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Project Settings.
        </p>
      </div>
    );
  }

  const [
    { data: purchasesData, error: purchasesError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("purchases").select("*, brands(name)").order("tube_number", { ascending: false }),
    supabase.from("session_usage").select("quantity_used")
  ]);

  if (purchasesError || sessionUsageError) {
    console.error("Stock Fetch Error:", { purchasesError, sessionUsageError });
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-rose-500 bg-[#020617]">
        <p className="font-black italic uppercase text-2xl tracking-tighter">Failed to load data</p>
        <p className="text-sm text-slate-500 mt-2 font-bold tracking-widest uppercase">Database Connection Error</p>
        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-500 max-w-lg overflow-auto">
           {JSON.stringify({ purchasesError, sessionUsageError }, null, 2)}
        </div>
      </div>
    );
  }

  // Calculate Stats
  const totalTubesBought = (purchasesData || []).length;
  const tubesLeft = (purchasesData || []).filter(p => (p.remaining_quantity || 0) > 0).length;
  const usedToday = (sessionUsageData || []).reduce((acc, curr) => acc + (curr.quantity_used || 0), 0);

  const activeTubes: { id: string, name: string, quantity: number, total: number, pricePerTube: number, pricePerCock: number, date: string }[] = [];
  const history: { id: string, name: string, brandName: string, tubeNumber: number, date: string, remaining: number, pricePerTube: number, pricePerCock: number }[] = [];

  (purchasesData || []).forEach(p => {
    const brandName = (p.brands as { name: string } | null)?.name || "Unknown Brand";
    const name = `${brandName} Tube #${p.tube_number}`;
    
    // Add to history
    history.push({
      id: p.id,
      name: brandName,
      brandName: brandName, // Added for clarity
      tubeNumber: p.tube_number || 0,
      date: new Date(p.purchase_date || p.created_at).toISOString().split('T')[0],
      remaining: p.remaining_quantity || 0,
      pricePerTube: p.price_per_tube || 0,
      pricePerCock: p.price_per_cock || 0
    });

    if (p.remaining_quantity && p.remaining_quantity > 0) {
      activeTubes.push({
        id: p.id,
        name,
        quantity: p.remaining_quantity,
        total: p.initial_quantity || 12,
        pricePerTube: p.price_per_tube || 0,
        pricePerCock: p.price_per_cock || 0,
        date: new Date(p.purchase_date || p.created_at).toISOString().split('T')[0]
      });
    }
  });

  const stats = {
    totalTubesBought,
    tubesLeft,
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
