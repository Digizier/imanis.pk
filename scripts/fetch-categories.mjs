import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iolyisuipmprmdeutsht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbHlpc3VpcG1wcm1kZXV0c2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mjk3OTksImV4cCI6MjEwMTQwNTc5OX0._dIHubqx6BJAA5Qqgn2k5claHaF1nLkxpDT18r_zgRY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  console.log('Categories:', data, error?.message || '');
}

getCategories();
