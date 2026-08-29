/**
 * Centralized Balance & Session Cost Calculations
 * Single source of truth for debt, payments, and session shares.
 */

export interface SessionCostItem {
  session_id: string;
  quantity_used: number;
  purchases?: { price_per_cock: number } | { price_per_cock: number }[] | null;
}

export interface SessionPlayerItem {
  session_id: string;
  player_id?: string;
}

export interface PaymentItem {
  player_id: string;
  amount: number;
}

export interface PlayerBalanceSummary {
  playerId: string;
  totalOwed: number;
  totalPaid: number;
  balance: number; // positive = owes money, negative = credit
}

/**
 * Calculates the total cost for each session based on shuttlecock usage and purchase price per cock.
 */
export function calculateSessionCosts(sessionUsageData: SessionCostItem[]): Record<string, number> {
  const costs: Record<string, number> = {};
  
  (sessionUsageData || []).forEach(su => {
    const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
    const pricePerCock = Number(purchase?.price_per_cock || 0);
    const quantity = Number(su.quantity_used || 0);
    costs[su.session_id] = (costs[su.session_id] || 0) + pricePerCock * quantity;
  });

  return costs;
}

/**
 * Calculates the attendee count for each session.
 */
export function calculateSessionAttendeeCounts(sessionPlayersData: SessionPlayerItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  (sessionPlayersData || []).forEach(sp => {
    counts[sp.session_id] = (counts[sp.session_id] || 0) + 1;
  });

  return counts;
}

/**
 * Calculates the cost share per attendee for a specific session.
 */
export function calculateSessionShare(sessionCost: number, attendeeCount: number): number {
  if (!attendeeCount || attendeeCount <= 0) return 0;
  return sessionCost / attendeeCount;
}

/**
 * Computes individual player balances across all sessions and payments.
 */
export function calculateAllPlayerBalances(params: {
  players: { id: string; name?: string }[];
  sessionPlayers: SessionPlayerItem[];
  sessionUsage: SessionCostItem[];
  payments: PaymentItem[];
}): Record<string, PlayerBalanceSummary> {
  const { players, sessionPlayers, sessionUsage, payments } = params;

  const sessionCosts = calculateSessionCosts(sessionUsage);
  const sessionAttendeeCounts = calculateSessionAttendeeCounts(sessionPlayers);

  // 1. Group attended session IDs per player
  const playerSessions: Record<string, string[]> = {};
  (players || []).forEach(p => {
    playerSessions[p.id] = [];
  });

  (sessionPlayers || []).forEach(sp => {
    if (sp.player_id) {
      if (!playerSessions[sp.player_id]) playerSessions[sp.player_id] = [];
      playerSessions[sp.player_id].push(sp.session_id);
    }
  });

  // 2. Sum payments per player
  const playerPayments: Record<string, number> = {};
  (payments || []).forEach(p => {
    playerPayments[p.player_id] = (playerPayments[p.player_id] || 0) + Number(p.amount || 0);
  });

  // 3. Compute total owed and net balance per player
  const summaries: Record<string, PlayerBalanceSummary> = {};

  (players || []).forEach(p => {
    const sids = playerSessions[p.id] || [];
    let totalOwed = 0;

    sids.forEach(sid => {
      const cost = sessionCosts[sid] || 0;
      const count = sessionAttendeeCounts[sid] || 1;
      totalOwed += cost / count;
    });

    const totalPaid = playerPayments[p.id] || 0;
    const balance = totalOwed - totalPaid;

    summaries[p.id] = {
      playerId: p.id,
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      balance: Math.round(balance * 100) / 100
    };
  });

  return summaries;
}
