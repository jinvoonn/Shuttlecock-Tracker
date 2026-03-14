"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface AddMatchPayload {
    sessionId: string;
    teamA: string[]; // Player IDs
    teamB: string[]; // Player IDs
    scoreA: number;
    scoreB: number;
}

export async function addMatch(payloadJson: string) {
    try {
        const payload: AddMatchPayload = JSON.parse(payloadJson);

        // 1. Insert Match
        const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert([{
                session_id: payload.sessionId,
                team_a_score: payload.scoreA || 0,
                team_b_score: payload.scoreB || 0
            }])
            .select()
            .single();

        if (matchError || !match) {
            console.error("Match insert error:", matchError);
            return { success: false, error: "Database error (matches): " + (matchError?.message || "Insert failed") };
        }

        // 2. Insert Match Players
        const matchPlayers = [
            ...payload.teamA.map(playerId => ({ match_id: match.id, player_id: playerId, team: "A" })),
            ...payload.teamB.map(playerId => ({ match_id: match.id, player_id: playerId, team: "B" }))
        ];

        if (matchPlayers.length > 0) {
            const { error: playersError } = await supabase
                .from("match_players")
                .insert(matchPlayers);

            if (playersError) {
                console.error("Match players insert error:", playersError);
                return { success: false, error: "Database error (match_players): " + playersError.message };
            }
        }

        revalidatePath("/");
        revalidatePath("/sessions");
        return { success: true };
    } catch (err: any) {
        console.error("addMatch unexpected error:", err);
        return { success: false, error: err.message || "An unexpected error occurred" };
    }
}

export async function deleteMatch(id: string) {
    try {
        const { error } = await supabase
            .from("matches")
            .delete()
            .eq("id", id);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/sessions");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred" };
    }
}
