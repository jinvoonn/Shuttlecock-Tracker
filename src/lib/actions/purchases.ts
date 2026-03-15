"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
export async function addPurchase(formData: FormData) {
    const purchase_date = formData.get("date") as string;
    const brand_id = formData.get("brand_id") as string;
    const new_brand_name = (formData.get("new_brand_name") || formData.get("brand")) as string;
    const notes = formData.get("notes") as string;
    const price_per_tube = parseFloat(formData.get("price_per_tube") as string) || parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string) || 1;

    if (!purchase_date || isNaN(price_per_tube)) {
        throw new Error("Date and price are required");
    }

    const price_per_cock = Number((price_per_tube / 12).toFixed(2));

    let finalBrandId = brand_id;

    // 1. Create new brand if needed
    if (new_brand_name && new_brand_name.trim() !== "") {
        const cleanBrandName = new_brand_name.trim();

        // Check if brand already exists to prevent duplicate failures
        const { data: existingBrand } = await supabase
            .from("brands")
            .select("id")
            .ilike("name", cleanBrandName)
            .single();

        if (existingBrand) {
            finalBrandId = existingBrand.id;
        } else {
            const { data: newBrand, error: brandError } = await supabase
                .from("brands")
                .insert([{ name: cleanBrandName }])
                .select()
                .single();

            if (brandError || !newBrand) {
                throw new Error("Failed to create new brand: " + brandError?.message);
            }
            finalBrandId = newBrand.id;
        }
    }

    if (!finalBrandId) {
        throw new Error("A brand must be selected or created");
    }

    // 2. Generate tube number
    // Find highest tube number among this brand ID
    const { data: pastPurchases, error: countError } = await supabase
        .from("purchases")
        .select("tube_number")
        .eq("brand_id", finalBrandId)
        .order("tube_number", { ascending: false })
        .limit(1);

    if (countError) {
        throw new Error("Failed to generate tube number: " + countError.message);
    }

    const maxTubeNumber = pastPurchases && pastPurchases.length > 0 ? pastPurchases[0].tube_number : 0;
    
    // 3. Insert purchases (multiple tubes)
    const purchasesToInsert = [];
    for (let i = 0; i < quantity; i++) {
        purchasesToInsert.push({
            brand_id: finalBrandId,
            purchase_date,
            tube_number: maxTubeNumber + i + 1,
            notes: notes ? notes.trim() : null,
            initial_quantity: 12,
            remaining_quantity: 12,
            price_per_tube,
            price_per_cock
        });
    }

    const { error: purchaseError } = await supabase
        .from("purchases")
        .insert(purchasesToInsert);

    if (purchaseError) {
        throw new Error("Failed to add purchases: " + purchaseError.message);
    }

    revalidatePath("/");
    revalidatePath("/purchases");
}

export async function editPurchase(id: string, formData: FormData) {
    const purchase_date = formData.get("date") as string;
    const brand_id = formData.get("brand_id") as string;
    const notes = formData.get("notes") as string;
    const price_per_tube = parseFloat(formData.get("price") as string);
    const remaining_quantity_str = formData.get("quantity") as string;
    
    // We make brand_id optional here so Active Tubes can be edited in-place
    // without having to re-select or pass the brand down the component tree.
    if (!purchase_date || isNaN(price_per_tube)) {
        throw new Error("Date and price are required");
    }

    const price_per_cock = Number((price_per_tube / 12).toFixed(2));

    interface PurchaseUpdatePayload {
        purchase_date: string;
        notes: string | null;
        price_per_tube: number;
        price_per_cock: number;
        brand_id?: string;
        remaining_quantity?: number;
    }

    const updatePayload: PurchaseUpdatePayload = {
        purchase_date,
        notes: notes ? notes.trim() : null,
        price_per_tube,
        price_per_cock
    };

    if (brand_id) {
        updatePayload.brand_id = brand_id;
    }

    if (remaining_quantity_str) {
        const remaining_quantity = parseInt(remaining_quantity_str);
        if (!isNaN(remaining_quantity)) {
            updatePayload.remaining_quantity = remaining_quantity;
        }
    }

    const { error } = await supabase
        .from("purchases")
        .update(updatePayload)
        .eq("id", id);

    if (error) {
        throw new Error("Failed to update purchase: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/purchases");
}

export async function deletePurchase(id: string) {
    const { error } = await supabase.from("purchases").delete().eq("id", id);

    if (error) {
        throw new Error("Failed to delete purchase: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/purchases");
}
