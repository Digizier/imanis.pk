import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://qrqmibxwibkszosikxbc.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk0OTEsImV4cCI6MjEwMTgzNTQ5MX0.pXx-VXrjMisfbS7FWBjlyD_v4MjhpHNegniDAuFwy_U';

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleaned = url.trim().replace(/^["']|["']$/g, '');
  return cleaned.startsWith('http://') || cleaned.startsWith('https://');
};

const getSupabaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (isValidHttpUrl(envUrl)) {
    return envUrl!.trim().replace(/^["']|["']$/g, '');
  }
  return DEFAULT_URL;
};

const getSupabaseAnonKey = (): string => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim() !== '' && envKey !== 'undefined' && envKey !== 'null') {
    return envKey.trim().replace(/^["']|["']$/g, '');
  }
  return DEFAULT_ANON_KEY;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

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
