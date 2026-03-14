import { supabase } from "@/lib/supabase";
import DesktopPaymentLedger from "@/stitch-designs/desktop/PaymentLedger";
import MobilePaymentLedger from "@/stitch-designs/mobile/PaymentLedger";

export const revalidate = 0;

export default async function PaymentsPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("id, amount, date, players(id, name)")
    .order('date', { ascending: false });

  if (paymentsError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load payment history
      </div>
    );
  }

  const payments = (paymentsData || []).map((p: any) => ({
    id: p.id,
    amount: p.amount,
    date: p.date,
    playerName: p.players?.name || "Unknown"
  }));

  return (
    <>
      <div className="block lg:hidden">
        <MobilePaymentLedger payments={payments} />
      </div>
      <div className="hidden lg:block">
        <DesktopPaymentLedger payments={payments} />
      </div>
    </>
  );
}
