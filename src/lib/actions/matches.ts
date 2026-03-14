"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface AddMatchPayload {
    sessionId: string;
    teamAPlayer1: string;
    teamAPlayer2: string;
    teamBPlayer1: string;
    teamBPlayer2: string;
    scoreA: number;
    scoreB: number;
}

export async function addMatch(payloadJson: string) {
    try {
        const payload: AddMatchPayload = JSON.parse(payloadJson);

        // 1. Validation
        const playerIds = [payload.teamAPlayer1, payload.teamAPlayer2, payload.teamBPlayer1, payload.teamBPlayer2];
        const uniquePlayers = new Set(playerIds);
        
        if (uniquePlayers.size !== 4) {
             return { success: false, error: "Validation error: You must select 4 unique players." };
        }

        if (isNaN(payload.scoreA) || isNaN(payload.scoreB)) {
            return { success: false, error: "Validation error: Both scores must be valid numbers." };
        }

        // 2. Insert Match (Flat Structure)
        const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert([{
                session_id: payload.sessionId,
                team_a_player1: payload.teamAPlayer1,
                team_a_player2: payload.teamAPlayer2,
                team_b_player1: payload.teamBPlayer1,
                team_b_player2: payload.teamBPlayer2,
                team_a_score: payload.scoreA,
                team_b_score: payload.scoreB
            }])
            .select()
            .single();

        if (matchError || !match) {
            console.error("Match insert error:", matchError);
            return { success: false, error: "Database error: " + (matchError?.message || "Failed to save match") };
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
