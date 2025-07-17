import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create client with auto-refresh and persistent sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Set reasonable timeouts
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // 10 second timeout for all requests
        signal: AbortSignal.timeout(10000)
      });
    }
  },
  // Retry failed requests
  db: {
    schema: 'public'
  }
});

// Add error event listener
window.addEventListener('online', () => {
  console.log('Network connection restored. Reconnecting to Supabase...');
  // The next request will automatically reconnect
});

window.addEventListener('offline', () => {
  console.warn('Network connection lost. Switching to offline mode...');
});