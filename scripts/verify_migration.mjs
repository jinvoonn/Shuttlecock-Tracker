import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verify() {
    const tables = ['players', 'brands', 'purchases', 'sessions', 'session_players', 'session_usage', 'payments'];
    for (const table of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        console.log(`${table}: ${count} records`);
    }
}

verify();
