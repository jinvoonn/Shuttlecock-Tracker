import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrands() {
    const brandsToCheck = ['DimGray', 'LM DG2', 'RCL BG2', 'RCL BS2', 'RSL S20', 'RSL S21', 'RSL S22'];
    
    const { data: brands, error: bErr } = await supabase
        .from('brands')
        .select('id, name')
        .in('name', brandsToCheck);
        
    if (bErr) {
        console.error('Error fetching brands:', bErr);
        return;
    }
    
    console.log('--- Brand Usage ---');
    for (const brand of brands) {
        const { count, error: cErr } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id);
            
        if (cErr) {
            console.error(`Error counting for ${brand.name}:`, cErr);
        } else {
            console.log(`${brand.name} (${brand.id}): ${count} purchases`);
        }
    }
}

checkBrands();
