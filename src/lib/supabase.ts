import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time on Vercel, environment variables might be missing.
// We provide a fallback to prevent createClient from throwing an error,
// ensuring the build completes successfully. 
const activeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const activeKey = supabaseKey || 'placeholder';

export const supabase = createClient(activeUrl, activeKey);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co';
