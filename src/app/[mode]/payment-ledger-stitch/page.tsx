import { supabase } from "@/lib/supabase";
import MobilePaymentLedger from "@/stitch-designs/mobile/PaymentLedger";

export const revalidate = 0;

export default async function PaymentLedgerStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string }> 
}) {
  await params;
  
  // Reuse logic from [mode]/page.tsx to calculate balances
  const [
    { data: paymentsData },
    { data: sessionsData },
    { data: sessionUsageData },
    { data: playersData }
  ] = await Promise.all([
    supabase.from("payments").select("player_id, amount, created_at"),
    supabase.from("sessions").select(`id, session_players ( player_id )`),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)"),
    supabase.from("players").select("id, name")
  ]);

  const playerStats: Record<string, { 
    id: string; 
    name: string; 
    totalPayments: number; 
    totalFees: number;
    lastActivity: string;
  }> = {};

  // Initialize players
  (playersData || []).forEach(p => {
    playerStats[p.id] = { 
      id: p.id, 
      name: p.name, 
      totalPayments: 0, 
      totalFees: 0, 
      lastActivity: 'Never'
    };
  });

  // Calculate payments
  (paymentsData || []).forEach(p => {
    if (playerStats[p.player_id]) {
      playerStats[p.player_id].totalPayments += Number(p.amount || 0);
      // Track last activity
      const date = new Date(p.created_at).toLocaleDateString();
      if (playerStats[p.player_id].lastActivity === 'Never' || new Date(p.created_at) > new Date(playerStats[p.player_id].lastActivity)) {
         playerStats[p.player_id].lastActivity = date;
      }
    }
  });

  // Calculate session costs
  const sessionCosts: Record<string, number> = {};
  (sessionUsageData || []).forEach(su => {
    const sId = su.session_id;
    const price_per_cock = Number((su.purchases as any)?.price_per_cock || 0);
    sessionCosts[sId] = (sessionCosts[sId] || 0) + (price_per_cock * su.quantity_used);
  });

  // Distribute session costs
  (sessionsData || []).forEach(s => {
    const totalCost = sessionCosts[s.id] || 0;
    const attendees = s.session_players || [];
    if (attendees.length > 0 && totalCost > 0) {
      const share = totalCost / attendees.length;
      attendees.forEach((sp: any) => {
        if (playerStats[sp.player_id]) {
          playerStats[sp.player_id].totalFees += share;
        }
      });
    }
  });

  const players = Object.values(playerStats).map(p => ({
    id: p.id,
    name: p.name,
    balance: p.totalPayments - p.totalFees,
    lastActivity: p.lastActivity,
    status: (p.totalPayments - p.totalFees) >= 0 ? 'Settled' as const : 'Overdue' as const
  }));

  const poolBalance = players.reduce((acc, p) => acc + p.balance, 0);
  const owedTotal = players.reduce((acc, p) => acc + (p.balance < 0 ? Math.abs(p.balance) : 0), 0);

  return (
    <MobilePaymentLedger 
      poolBalance={poolBalance}
      owedTotal={owedTotal}
      players={players}
    />
  );
}
