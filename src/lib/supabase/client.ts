import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton Supabase Client to reuse connection pool and avoid memory leaks
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const isBrowser = typeof window !== 'undefined';
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

// In-Memory Cache helper for public static data (Categories, Collections)
const memoryCache = new Map<string, { data: any; expiry: number }>();

export const fetchWithCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> => {
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const freshData = await fetcher();
  memoryCache.set(key, {
    data: freshData,
    expiry: Date.now() + ttlSeconds * 1000,
  });
  return freshData;
};
