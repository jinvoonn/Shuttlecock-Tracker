import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchData() {
    const { data: brands } = await supabase.from('brands').select('name');
    const { data: players } = await supabase.from('players').select('name');

    console.log('--- SUPABASE BRANDS ---');
    console.log(JSON.stringify(brands?.map(b => b.name) || []));

    console.log('\n--- SUPABASE PLAYERS ---');
    console.log(JSON.stringify(players?.map(p => p.name) || []));
}

fetchData();
