"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ADMIN_SECRET } from "@/lib/constants";

export async function addPayment(formData: FormData, mode?: string) {
    const finalMode = mode || (formData.get("mode") as string);
    if (finalMode !== ADMIN_SECRET) {
        throw new Error("Unauthorized: Admin access required to add payments");
    }
    const date = formData.get("date") as string;
    let player_id = formData.get("player_id") as string;
    const new_player_name = formData.get("new_player_name") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const note = formData.get("note") as string || null;

    if (!date || isNaN(amount) || amount <= 0) {
        throw new Error("Invalid form data");
    }

    // Handle new player creation if provided
    if (new_player_name && new_player_name.trim() !== "") {
        const cleanName = new_player_name.trim();
        // Check if player exists
        const { data: existing } = await supabase.from("players").select("id").ilike("name", cleanName).single();
        if (existing) {
            player_id = existing.id;
        } else {
            const { data: newPlayer, error: newError } = await supabase.from("players").insert([{ name: cleanName }]).select().single();
            if (newError || !newPlayer) {
                throw new Error("Failed to create new player: " + newError?.message);
            }
            player_id = newPlayer.id;
        }
    }

    if (!player_id) {
        throw new Error("A player must be selected or created");
    }

    const { error } = await supabase.from("payments").insert([{
        date,
        player_id,
        amount,
        note,
    }]);

    if (error) {
        throw new Error("Failed to add payment: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/payments");
}

export async function editPayment(id: string, formData: FormData, mode?: string) {
    const finalMode = mode || (formData.get("mode") as string);
    if (finalMode !== ADMIN_SECRET) {
        throw new Error("Unauthorized: Admin access required to edit payments");
    }
    const date = formData.get("date") as string;
    const player_id = formData.get("player_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const note = formData.get("note") as string || null;

    if (!date || isNaN(amount) || amount <= 0 || !player_id) {
        throw new Error("Invalid form data");
    }

    const { error } = await supabase.from("payments").update({
        date,
        player_id,
        amount,
        note,
    }).eq("id", id);

    if (error) {
        throw new Error("Failed to update payment: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/payments");
}

export async function deletePayment(id: string, mode?: string) {
    if (mode !== ADMIN_SECRET) {
        throw new Error("Unauthorized: Admin access required to delete payments");
    }
    const { error } = await supabase.from("payments").delete().eq("id", id);

    if (error) {
        throw new Error("Failed to delete payment: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/payments");
}

export async function quickSettle(playerId: string, amount: number, mode?: string) {
    if (mode !== ADMIN_SECRET) {
        throw new Error("Unauthorized: Admin access required for quick settle");
    }
    if (!playerId || isNaN(amount) || amount <= 0) {
        throw new Error("Invalid settle up parameters");
    }

    const { error } = await supabase.from("payments").insert([{
        date: new Date().toISOString().split('T')[0],
        player_id: playerId,
        amount: amount,
    }]);

    if (error) {
        throw new Error("Failed to quick settle: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/payments");
}
