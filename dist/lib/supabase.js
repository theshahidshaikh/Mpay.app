import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';
// For demo purposes, we'll create a client even without real credentials
// In production, you should always validate these environment variables
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://demo.supabase.co') {
    console.warn('⚠️ Using demo Supabase credentials. Please connect to Supabase for full functionality.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
window.supabase = supabase;
