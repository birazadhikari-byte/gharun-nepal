import { createClient } from '@supabase/supabase-js';

/**
 * Production-safe Supabase client
 * - Uses ENV variables only
 * - Prevents app crash if ENV missing
 * - Stable auth session handling
 */

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate ENV in development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase ENV missing. Check your .env file:\n' +
    'VITE_SUPABASE_URL\n' +
    'VITE_SUPABASE_ANON_KEY'
  );
}

// Create client (safe fallback to empty string prevents crash)
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'gharun-nepal-auth', // prevents session conflicts
    },
    global: {
      headers: {
        'x-client-info': 'gharun-nepal-web',
      },
    },
  }
);
