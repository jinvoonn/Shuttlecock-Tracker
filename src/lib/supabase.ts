import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time on Vercel, environment variables might be missing.
// We provide a fallback to prevent createClient from throwing an error,
// ensuring the build completes successfully. 
const activeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const activeKey = supabaseKey || 'placeholder';

if (!supabaseUrl || !supabaseKey) {
    console.warn(
        '⚠️ Supabase environment variables are missing. This is expected during a Vercel build if they are not yet set, but the site will not work until they are added to Vercel Settings.'
    );
}

export const supabase = createClient(activeUrl, activeKey);
