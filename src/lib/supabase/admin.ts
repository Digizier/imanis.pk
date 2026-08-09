import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://qrqmibxwibkszosikxbc.supabase.co';
const DEFAULT_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';

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

const getServiceRoleKey = (): string => {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (envKey && envKey.trim() !== '' && envKey !== 'undefined' && envKey !== 'null') {
    return envKey.trim().replace(/^["']|["']$/g, '');
  }
  return DEFAULT_SERVICE_KEY;
};

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = getServiceRoleKey();

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
