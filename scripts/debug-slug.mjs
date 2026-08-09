import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iolyisuipmprmdeutsht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbHlpc3VpcG1wcm1kZXV0c2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mjk3OTksImV4cCI6MjEwMTQwNTc5OX0._dIHubqx6BJAA5Qqgn2k5claHaF1nLkxpDT18r_zgRY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSlug() {
  const slug = 'polo-republica-mens-drop-shoulder-oversized-tee';
  console.log('Testing query for slug:', slug);

  const { data: p1, error: e1 } = await supabase.from('products').select('*').eq('slug', slug).single();
  console.log('Direct product query:', p1 ? 'FOUND' : 'NOT FOUND', e1?.message || '');

  const { data: p2, error: e2 } = await supabase.from('products').select('*, category:categories(*), variants:product_variants(*)').eq('slug', slug).single();
  console.log('Joined query:', p2 ? 'FOUND' : 'NOT FOUND', e2?.message || '');
}

checkSlug();
