import { supabase } from "@/lib/supabase";
import DesktopPaymentLedger from "@/stitch-designs/desktop/PaymentLedger";
import MobilePaymentLedger from "@/stitch-designs/mobile/PaymentLedger";

export const revalidate = 0;

export default async function PaymentsPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
  const [
    { data: paymentsData, error: paymentsError },
    { data: sessionsData, error: sessionsError },
    { data: sessionUsageData, error: sessionUsageError }
  ] = await Promise.all([
    supabase.from("payments").select("id, amount, created_at, players(id, name)").order('created_at', { ascending: false }),
    supabase.from("sessions").select("id, created_at, session_players ( players ( id, name ) )"),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)")
  ]);

  if (paymentsError || sessionsError || sessionUsageError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load ledger data
      </div>
    );
  }

  const playerBalances: Record<string, { id: string; name: string; totalShares: number; totalPayments: number; lastActivity: string }> = {};

  (paymentsData || []).forEach(p => {
    // @ts-expect-error type mishmash
    const id = p.players?.id || "unknown";
    // @ts-expect-error type mishmash
    const name = p.players?.name || "Unknown";
    
    if (!playerBalances[id]) {
      playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, lastActivity: p.created_at };
    }
    playerBalances[id].totalPayments += Number(p.amount || 0);

    // Update last activity to the latest payment date if it's newer
    if (new Date(p.created_at) > new Date(playerBalances[id].lastActivity)) {
        playerBalances[id].lastActivity = p.created_at;
    }
  });

  const sessionCosts: Record<string, number> = {};
  (sessionUsageData || []).forEach(su => {
    const sId = su.session_id;
    // @ts-expect-error type mishmash
    const price_per_cock = Number(su.purchases?.price_per_cock || 0);
    sessionCosts[sId] = (sessionCosts[sId] || 0) + (price_per_cock * su.quantity_used);
  });

  (sessionsData || []).forEach(s => {
    const totalCost = sessionCosts[s.id] || 0;
    const attendees = s.session_players || [];
    if (attendees.length > 0 && totalCost > 0) {
      const share = totalCost / attendees.length;
      attendees.forEach((sp: any) => {
        const id = sp.players?.id;
        const name = sp.players?.name;
        if (id) {
          if (!playerBalances[id]) {
            playerBalances[id] = { id, name, totalShares: 0, totalPayments: 0, lastActivity: s.created_at };
          }
          playerBalances[id].totalShares += share;
          
          if (new Date(s.created_at) > new Date(playerBalances[id].lastActivity)) {
             playerBalances[id].lastActivity = s.created_at;
          }
        }
      });
    }
  });

  const players = Object.values(playerBalances).map(stats => {
    const balance = stats.totalPayments - stats.totalShares;
    let status: 'Settled' | 'Overdue' | 'Neutral' = 'Neutral';
    if (balance > 0) status = 'Settled';
    if (balance < -10) status = 'Overdue'; // Setting threshold for overdue at -10

    return {
      id: stats.id,
      name: stats.name,
      balance,
      lastActivity: new Date(stats.lastActivity).toLocaleDateString(),
      status
    };
  }).sort((a, b) => a.balance - b.balance);

  const poolBalance = players.reduce((acc, p) => acc + p.balance, 0);
  const owedTotal = players.filter(p => p.balance < 0).reduce((acc, p) => acc + Math.abs(p.balance), 0);

  return (
    <>
      <div className="block lg:hidden">
        <MobilePaymentLedger poolBalance={poolBalance} owedTotal={owedTotal} players={players} />
      </div>
      <div className="hidden lg:block">
        <DesktopPaymentLedger poolBalance={poolBalance} owedTotal={owedTotal} players={players} />
      </div>
    </>
  );
}
