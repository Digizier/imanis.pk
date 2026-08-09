import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testCustomSizeAndRLS() {
  console.log('--- TESTING RLS & CUSTOM SIZES (e.g. 5 Year) FOR PRODUCT VARIANTS ---');

  const slug = `custom-size-test-${Date.now()}`;
  
  // 1. Create a Product
  const { data: prod, error: prodErr } = await supabase
    .from('products')
    .insert({
      name: 'Kids Organic Frock 5 Year Edition',
      slug,
      regular_price: 1899,
      sale_price: 1299,
      total_stock: 15,
      main_image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80',
      status: 'active'
    })
    .select()
    .single();

  if (prodErr || !prod) {
    console.error('PRODUCT CREATION FAILED:', prodErr?.message);
    return;
  }

  console.log('1. PRODUCT CREATED: ID =', prod.id);

  // 2. Insert Custom Variant with size = "5 Year" & "3-4 Yrs"
  const customVariants = [
    { product_id: prod.id, size: '5 Year', color: 'Pink Floral', price: 1899, sale_price: 1299, stock: 8, is_active: true },
    { product_id: prod.id, size: '3-4 Yrs', color: 'Yellow Sunflower', price: 1899, sale_price: 1199, stock: 7, is_active: true }
  ];

  const { data: varData, error: varErr } = await supabase
    .from('product_variants')
    .insert(customVariants)
    .select();

  if (varErr) {
    console.error('2. CUSTOM VARIANT SAVE FAILED (RLS or Constraint Error):', varErr.message);
  } else {
    console.log('2. CUSTOM VARIANT SAVE SUCCESS! Saved variants:', varData.map(v => `${v.size} / ${v.color}`));
  }

  // 3. Cleanup
  await supabase.from('product_variants').delete().eq('product_id', prod.id);
  await supabase.from('products').delete().eq('id', prod.id);
}

testCustomSizeAndRLS();
