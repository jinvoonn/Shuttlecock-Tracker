import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteBrands() {
    const brandsToDelete = ['DimGray', 'LM DG2', 'RCL BG2', 'RCL BS2', 'RSL S20', 'RSL S21', 'RSL S22'];
    
    console.log(`Attempting to delete brands: ${brandsToDelete.join(', ')}`);
    
    const { data, error } = await supabase
        .from('brands')
        .delete()
        .in('name', brandsToDelete)
        .select();
        
    if (error) {
        console.error('Error deleting brands:', error);
    } else {
        console.log('Successfully deleted brands:', data?.map(b => b.name) || []);
    }
}

deleteBrands();
