import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'CRITICAL: Missing Supabase environment variables. Please check your .env.local or Vercel project settings.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
