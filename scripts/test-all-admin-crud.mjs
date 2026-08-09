import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testAllAdminCrud() {
  console.log('--- TESTING ALL 8 REPAIRED ADMIN MODULES ---');

  // 1. Popup Settings
  const { data: popup, error: popupErr } = await supabase
    .from('popup_settings')
    .upsert({ id: 'default', is_enabled: true, headline: 'Test Headline' })
    .select()
    .single();
  console.log('1. POPUP SETTINGS:', popupErr ? `FAILED: ${popupErr.message}` : `PASS (Headline: ${popup.headline})`);

  // 2. Payment Methods
  const { data: pm, error: pmErr } = await supabase
    .from('payment_methods')
    .select('*')
    .limit(1);
  console.log('2. PAYMENT METHODS:', pmErr ? `FAILED: ${pmErr.message}` : `PASS (Items count: ${pm?.length})`);

  // 3. Store Settings
  const { data: set, error: setErr } = await supabase
    .from('store_settings')
    .upsert({ key: 'general', value: { store_name: "Imani's Test" } }, { onConflict: 'key' })
    .select()
    .single();
  console.log('3. STORE SETTINGS:', setErr ? `FAILED: ${setErr.message}` : `PASS (Store Name: ${set.value.store_name})`);

  // 4. Coupons Description Column
  const { data: coupon, error: couponErr } = await supabase
    .from('coupons')
    .insert({ code: `TEST-${Date.now()}`, discount_type: 'percentage', discount_value: 10, description: 'Test Coupon Description' })
    .select()
    .single();
  console.log('4. COUPONS DESCRIPTION:', couponErr ? `FAILED: ${couponErr.message}` : `PASS (Description: ${coupon.description})`);

  // 5. Categories Image Column
  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .insert({ name: 'Test Category', slug: `test-cat-${Date.now()}`, image: 'https://example.com/image.jpg', show_on_homepage: true })
    .select()
    .single();
  console.log('5. CATEGORIES IMAGE:', catErr ? `FAILED: ${catErr.message}` : `PASS (Image: ${cat.image})`);

  // 6. Collections Badge Color Column
  const { data: col, error: colErr } = await supabase
    .from('collections')
    .insert({ name: 'Test Collection', slug: `test-col-${Date.now()}`, badge_color: 'purple', badge: 'New Deal' })
    .select()
    .single();
  console.log('6. COLLECTIONS BADGE COLOR:', colErr ? `FAILED: ${colErr.message}` : `PASS (Badge Color: ${col.badge_color})`);

  // 7. Orders & Order Items
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .limit(1);
  console.log('7. ORDERS & ITEMS:', orderErr ? `FAILED: ${orderErr.message}` : `PASS (Order Number: ${order?.[0]?.order_number}, Items: ${order?.[0]?.items?.length})`);

  // 8. Products Size Guide Column
  const { data: prod, error: prodErr } = await supabase
    .from('products')
    .insert({ name: 'Test Size Guide Product', slug: `test-sg-${Date.now()}`, regular_price: 1000, size_guide: 'S: Chest 38", Length 27"' })
    .select()
    .single();
  console.log('8. PRODUCTS SIZE GUIDE:', prodErr ? `FAILED: ${prodErr.message}` : `PASS (Size Guide: ${prod.size_guide})`);

  // Cleanup test product/category/collection/coupon
  if (coupon) await supabase.from('coupons').delete().eq('id', coupon.id);
  if (cat) await supabase.from('categories').delete().eq('id', cat.id);
  if (col) await supabase.from('collections').delete().eq('id', col.id);
  if (prod) await supabase.from('products').delete().eq('id', prod.id);
}

testAllAdminCrud();
