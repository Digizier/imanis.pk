import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanDuplicateHomepageSections() {
  console.log('--- CLEANING DUPLICATE HOMEPAGE SECTIONS IN SUPABASE ---');

  // Fetch all sections
  const { data: allSecs, error: fetchErr } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('created_at', { ascending: true });

  if (fetchErr || !allSecs) {
    console.error('FETCH ERROR:', fetchErr?.message);
    return;
  }

  console.log(`Total sections currently in DB: ${allSecs.length}`);

  // Deduplicate by internal_name / section_type
  const seenTypes = new Set();
  const keepIds = [];
  const deleteIds = [];

  allSecs.forEach((sec) => {
    const key = `${sec.section_type}_${sec.internal_name}`;
    if (!seenTypes.has(key)) {
      seenTypes.add(key);
      keepIds.push(sec.id);
    } else {
      deleteIds.push(sec.id);
    }
  });

  console.log(`Unique sections to keep: ${keepIds.length}`);
  console.log(`Duplicate section rows to delete: ${deleteIds.length}`);

  if (deleteIds.length > 0) {
    const { error: delErr } = await supabase
      .from('homepage_sections')
      .delete()
      .in('id', deleteIds);

    if (delErr) {
      console.error('DELETE DUPLICATES ERROR:', delErr.message);
    } else {
      console.log(`SUCCESSFULLY DELETED ${deleteIds.length} DUPLICATE ROWS FROM SUPABASE!`);
    }
  }

  // Re-order remaining sections nicely
  const { data: remainingSecs } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (remainingSecs) {
    for (let i = 0; i < remainingSecs.length; i++) {
      await supabase
        .from('homepage_sections')
        .update({ sort_order: i + 1 })
        .eq('id', remainingSecs[i].id);
    }
  }

  console.log('--- CLEANUP COMPLETE ---');
}

cleanDuplicateHomepageSections();
