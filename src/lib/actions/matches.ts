"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface AddMatchPayload {
    sessionId: string;
    playerA1: string;
    playerA2: string;
    playerB1: string;
    playerB2: string;
    scoreA: number;
    scoreB: number;
}

export async function addMatch(payloadJson: string) {
    try {
        const payload: AddMatchPayload = JSON.parse(payloadJson);

        // 1. Validation
        if (!payload.playerA1 || !payload.playerB1) {
            return { success: false, error: "Validation error: At least one player per team is required." };
        }

        const allPlayerIds = [payload.playerA1, payload.playerA2, payload.playerB1, payload.playerB2].filter(Boolean);
        const uniquePlayers = new Set(allPlayerIds);
        
        if (uniquePlayers.size !== allPlayerIds.length) {
             return { success: false, error: "Validation error: Players cannot appear twice in the same match." };
        }

        // 2. Insert Match
        const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert([{
                session_id: payload.sessionId,
                player1_id: payload.playerA1,
                player2_id: payload.playerA2 || payload.playerA1,
                player3_id: payload.playerB1,
                player4_id: payload.playerB2 || payload.playerB1,
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

export async function updateMatch(id: string, payloadJson: string) {
    try {
        const payload: Partial<AddMatchPayload> = JSON.parse(payloadJson);

        const updateData: any = {};
        if (payload.playerA1) updateData.player1_id = payload.playerA1;
        if (payload.playerA2) updateData.player2_id = payload.playerA2;
        if (payload.playerB1) updateData.player3_id = payload.playerB1;
        if (payload.playerB2) updateData.player4_id = payload.playerB2;
        if (payload.scoreA !== undefined) updateData.team_a_score = payload.scoreA;
        if (payload.scoreB !== undefined) updateData.team_b_score = payload.scoreB;

        const { error } = await supabase
            .from("matches")
            .update(updateData)
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
