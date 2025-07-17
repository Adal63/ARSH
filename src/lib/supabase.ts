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
        // 30 second timeout for all requests
        signal: AbortSignal.timeout(30000)
      });
    }
  },
  // Retry configuration
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add connection event listeners
let isReconnecting = false;

supabase.channel('system').on('system', { event: 'reconnect' }, () => {
  console.log('Reconnecting to Supabase...');
  isReconnecting = true;
}).on('system', { event: 'reconnected' }, () => {
  console.log('Reconnected to Supabase!');
  isReconnecting = false;
  // Dispatch a custom event that our app can listen for
  window.dispatchEvent(new CustomEvent('supabase-reconnected'));
}).subscribe();

// Add network event listeners
window.addEventListener('online', () => {
  console.log('Network connection restored. Reconnecting to Supabase...');
  // Dispatch a custom event that our app can listen for
  window.dispatchEvent(new CustomEvent('supabase-network-restored'));
});

window.addEventListener('offline', () => {
  console.warn('Network connection lost. Switching to offline mode...');
  // Dispatch a custom event that our app can listen for
  window.dispatchEvent(new CustomEvent('supabase-network-lost'));
});

// Export connection status helper
export const getConnectionStatus = () => {
  return {
    online: navigator.onLine,
    reconnecting: isReconnecting
  };
};