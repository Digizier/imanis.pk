import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testVariantSavingAndUserPanel() {
  console.log('--- TESTING VARIANT SAVING & USER PANEL PRICE MATCHER ---');

  const slug = `variant-test-product-${Date.now()}`;
  
  // 1. Create a Product with Variants (S @ 350 PKR, L @ 700 PKR)
  const { data: prod, error: prodErr } = await supabase
    .from('products')
    .insert({
      name: 'Polo Republica Oversized Tee',
      slug,
      regular_price: 1499,
      sale_price: 999,
      total_stock: 20,
      main_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      status: 'active'
    })
    .select()
    .single();

  if (prodErr || !prod) {
    console.error('FAILED TO CREATE TEST PRODUCT:', prodErr?.message);
    return;
  }

  console.log('1. PRODUCT CREATED IN SUPABASE: ID =', prod.id);

  // 2. Insert Custom Variants (S: 350 PKR, L: 700 PKR)
  const variantsData = [
    { product_id: prod.id, size: 'S', color: 'White', price: 1499, sale_price: 350, stock: 11, is_active: true },
    { product_id: prod.id, size: 'L', color: 'Black', price: 1499, sale_price: 700, stock: 9, is_active: true }
  ];

  const { data: varData, error: varErr } = await supabase
    .from('product_variants')
    .insert(variantsData)
    .select();

  if (varErr) {
    console.error('2. VARIANT SAVE FAILED:', varErr.message);
  } else {
    console.log('2. VARIANT SAVE SUCCESS! Saved variants count:', varData.length);
  }

  // 3. User Panel Query Simulation (Fetching Product + Variants from Supabase)
  const { data: fetchedProd } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', prod.id)
    .single();

  if (fetchedProd && fetchedProd.variants) {
    console.log('3. USER PANEL QUERY SUCCESS!');
    console.log('   Fetched Variants for Product:', fetchedProd.variants.map(v => `${v.size}/${v.color}: Rs. ${v.sale_price}`));

    const availableSizes = Array.from(new Set(fetchedProd.variants.map((v) => v.size)));
    console.log('   Exact User Panel Selectable Sizes:', availableSizes);
    if (availableSizes.length === 2 && availableSizes.includes('S') && availableSizes.includes('L')) {
      console.log('   RESULT: PASS! Only exact sizes (S, L) appear for this product!');
    }
  }

  // Cleanup test product
  await supabase.from('product_variants').delete().eq('product_id', prod.id);
  await supabase.from('products').delete().eq('id', prod.id);
}

testVariantSavingAndUserPanel();
