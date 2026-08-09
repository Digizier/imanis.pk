import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iolyisuipmprmdeutsht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbHlpc3VpcG1wcm1kZXV0c2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mjk3OTksImV4cCI6MjEwMTQwNTc5OX0._dIHubqx6BJAA5Qqgn2k5claHaF1nLkxpDT18r_zgRY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing Product Insertion on Supabase...');
  const testSlug = 'test-organic-kids-romper-' + Date.now();

  const { data: newProd, error } = await supabase.from('products').insert({
    name: 'Test Organic Kids Romper',
    slug: testSlug,
    short_description: 'Organic cotton romper test',
    brand: "Imani's Collection",
    sku: 'TEST-RMP-01',
    regular_price: 1299,
    sale_price: 699,
    total_stock: 40,
    main_image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80',
    status: 'active',
  }).select().single();

  if (error) {
    console.error('INSERT FAILED:', error.message);
  } else {
    console.log('INSERT SUCCESS! Product ID:', newProd.id);

    // Test Delete cleanup
    const { error: delErr } = await supabase.from('products').delete().eq('id', newProd.id);
    if (delErr) console.error('Cleanup delete error:', delErr.message);
    else console.log('CLEANUP DELETE SUCCESS!');
  }
}

testInsert();
