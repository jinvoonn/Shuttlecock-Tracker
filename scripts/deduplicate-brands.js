/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BRAND_ALIASES = {
    "AS 50": "Yonex AS-50",
    "DimG": "Ling Mei DimGray",
    "LM DG": "Ling Mei DimGray",
    "Felet Orange": "Felet Orange",
    "LM Black": "Ling Mei Black",
    "LM Orange": "Ling Mei Orange",
    "Protech Plat": "Protech Platinum",
    "RCL BG": "RCL Black Gold",
    "RCL BS": "RCL Black Silver",
    "RCL T": "RCL Titanium",
    "RSL C": "RSL Classic",
    "RSL S": "RSL Supreme",
    "RSL S Stream": "RSL S Stream",
    "RSL Smash": "RSL Smash"
};

// Also apply a general normalization rule: trim all spaces, remove trailing numbers.
// Because the user said "Protech Plat 1", "Protech Plat 2" -> "Protech Platinum"
function normalizeName(rawName) {
    let name = rawName.trim();

    // Check direct aliases first
    if (BRAND_ALIASES[name]) return BRAND_ALIASES[name];

    // Remove trailing numbers (e.g. "Protech Plat 1" -> "Protech Plat")
    name = name.replace(/\s+\d+$/, '').trim();
    if (BRAND_ALIASES[name]) return BRAND_ALIASES[name];

    return name;
}

async function deduplicateBrands() {
    console.log("Starting Brand Deduplication...");

    // 1. Fetch all brands
    const { data: brands, error: fetchError } = await supabase.from('brands').select('*');
    if (fetchError) {
        console.error("Failed to fetch brands:", fetchError);
        return;
    }

    console.log(`Found ${brands.length} total brands.`);

    // 2. Group by canonical name
    const groupedBrands = {};
    for (const brand of brands) {
        const canonical = normalizeName(brand.name);
        if (!groupedBrands[canonical]) {
            groupedBrands[canonical] = [];
        }
        groupedBrands[canonical].push(brand);
    }

    let modifiedPurchases = 0;
    let deletedBrands = 0;

    // 3. Merge groups
    for (const [canonicalName, group] of Object.entries(groupedBrands)) {
        if (group.length <= 1) continue; // No duplicates for this name

        console.log(`\nMerging ${group.length} duplicates under canonical name: "${canonicalName}"`);

        // Pick one authoritative ID. If there's already a brand matching the canonical name exactly, use its ID.
        // Otherwise, just use the first one's ID and rename it to the canonical name.
        let authoritativeBrand = group.find(b => b.name === canonicalName);
        if (!authoritativeBrand) {
            authoritativeBrand = group[0];
            console.log(`  -> Renaming authoritative brand ID ${authoritativeBrand.id} to "${canonicalName}"`);
            await supabase.from('brands').update({ name: canonicalName }).eq('id', authoritativeBrand.id);
        } else {
            console.log(`  -> Keeping existing canonical brand: ${authoritativeBrand.id}`);
        }

        const authoritativeId = authoritativeBrand.id;

        // Find the duplicates
        const duplicates = group.filter(b => b.id !== authoritativeId);

        for (const duplicate of duplicates) {
            console.log(`  -> Redirecting purchases from duplicate: "${duplicate.name}" (${duplicate.id})`);

            // Re-point purchases
            const { data: updatedPurchases, error: updateError } = await supabase
                .from('purchases')
                .update({ brand_id: authoritativeId })
                .eq('brand_id', duplicate.id)
                .select();

            if (updateError) {
                console.error("    Error updating purchases:", updateError);
                continue;
            }

            modifiedPurchases += updatedPurchases.length;
            console.log(`    ...Moved ${updatedPurchases.length} purchases.`);

            // Delete orphaned brand
            const { error: deleteError } = await supabase
                .from('brands')
                .delete()
                .eq('id', duplicate.id);

            if (deleteError) {
                console.error("    Error deleting brand:", deleteError);
            } else {
                console.log(`    ...Deleted orphaned brand.`);
                deletedBrands++;
            }
        }
    }

    console.log(`\n\n--- Migration Complete ---`);
    console.log(`Redirected ${modifiedPurchases} total purchases.`);
    console.log(`Deleted ${deletedBrands} orphaned duplicate brand rows.`);
}

deduplicateBrands();
