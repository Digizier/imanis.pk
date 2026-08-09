import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function removeUnnecessarySections() {
  console.log('--- REMOVING UNNECESSARY HOMEPAGE SECTIONS FROM SUPABASE ---');

  // Delete hero_carousel from homepage_sections table
  const { error: delErr } = await supabase
    .from('homepage_sections')
    .delete()
    .eq('section_type', 'hero_carousel');

  if (delErr) {
    console.error('DELETE ERROR:', delErr.message);
  } else {
    console.log('UNNECESSARY HERO CAROUSEL LAYOUT SECTIONS DELETED FROM SUPABASE!');
  }
}

removeUnnecessarySections();
