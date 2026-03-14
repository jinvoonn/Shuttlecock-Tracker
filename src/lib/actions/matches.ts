"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface AddMatchPayload {
    sessionId: string;
    teamAIds: string[];
    teamBIds: string[];
    scoreA: number;
    scoreB: number;
}

export async function addMatch(payloadJson: string) {
    try {
        const payload: AddMatchPayload = JSON.parse(payloadJson);

        // 1. Validation
        if (!payload.teamAIds.length || !payload.teamBIds.length) {
            return { success: false, error: "Validation error: Each team must have at least 1 player." };
        }

        const allPlayerIds = [...payload.teamAIds, ...payload.teamBIds];
        const uniquePlayers = new Set(allPlayerIds);
        
        if (uniquePlayers.size !== allPlayerIds.length) {
             return { success: false, error: "Validation error: Players cannot appear twice in the same match." };
        }

        if (isNaN(payload.scoreA) || isNaN(payload.scoreB)) {
            return { success: false, error: "Validation error: Both scores must be valid numbers." };
        }

        // 2. Insert Match (Flexible Structure)
        const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert([{
                session_id: payload.sessionId,
                team_a_ids: payload.teamAIds,
                team_b_ids: payload.teamBIds,
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
        if (payload.teamAIds) updateData.team_a_ids = payload.teamAIds;
        if (payload.teamBIds) updateData.team_b_ids = payload.teamBIds;
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
