import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function cleanup() {
    console.log('Cleaning up partial migration data...');

    // Delete in order of dependencies (leaves first)
    await supabase.from('session_usage').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('session_players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // We'll keep players and brands for now as they are idempotent or we can handle them.
    // Actually, let's keep the brands we found.

    console.log('Cleanup complete.');
}

cleanup();
