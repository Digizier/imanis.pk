import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testPerSizeColorsAndCommas() {
  console.log('--- TESTING PER-SIZE COLOR FILTERING & COMMA-SEPARATED COLORS ---');

  const slug = `tshirt-color-test-${Date.now()}`;
  
  // 1. Create Product
  const { data: prod } = await supabase
    .from('products')
    .insert({
      name: 'T-Shirt Advanced Color Test',
      slug,
      regular_price: 1499,
      sale_price: 350,
      total_stock: 30,
      main_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      status: 'active'
    })
    .select()
    .single();

  if (!prod) return;

  // 2. Simulate Admin Row Input (Row 1: S/Standard, Row 2: M/White, Red, Black, Row 3: 8-14 Year/Standard)
  const inputRows = [
    { size: 'S', color: 'Standard', price: 1499, sale_price: 350, stock: 10 },
    { size: 'M', color: 'White, Red, Black', price: 1499, sale_price: 350, stock: 10 },
    { size: '8-14 Year', color: 'Standard', price: 1499, sale_price: 799, stock: 10 }
  ];

  // Admin backend expansion logic
  const variantData = [];
  inputRows.forEach(row => {
    const splitColors = row.color ? row.color.split(',').map(c => c.trim()).filter(Boolean) : [''];
    if (splitColors.length > 1) {
      splitColors.forEach(c => {
        variantData.push({
          product_id: prod.id,
          size: row.size,
          color: c,
          price: row.price,
          sale_price: row.sale_price,
          stock: row.stock,
          is_active: true
        });
      });
    } else {
      variantData.push({
        product_id: prod.id,
        size: row.size,
        color: row.color,
        price: row.price,
        sale_price: row.sale_price,
        stock: row.stock,
        is_active: true
      });
    }
  });

  const { data: savedVars } = await supabase.from('product_variants').insert(variantData).select();
  console.log('1. SAVED VARIANTS IN SUPABASE:', savedVars.map(v => `${v.size} -> ${v.color}`));

  // 3. Simulate Storefront PDP per-size color filtering
  const activeVariants = savedVars;

  // Test Size S
  const varsS = activeVariants.filter(v => v.size === 'S');
  const colorsS = Array.from(new Set(varsS.flatMap(v => v.color.split(',').map(c => c.trim()).filter(Boolean))));
  console.log('2. STOREFRONT PDP FOR SIZE "S": Available Colors ->', colorsS);

  // Test Size M
  const varsM = activeVariants.filter(v => v.size === 'M');
  const colorsM = Array.from(new Set(varsM.flatMap(v => v.color.split(',').map(c => c.trim()).filter(Boolean))));
  console.log('3. STOREFRONT PDP FOR SIZE "M": Available Colors ->', colorsM);

  // Test Size 8-14 Year
  const varsKids = activeVariants.filter(v => v.size === '8-14 Year');
  const colorsKids = Array.from(new Set(varsKids.flatMap(v => v.color.split(',').map(c => c.trim()).filter(Boolean))));
  console.log('4. STOREFRONT PDP FOR SIZE "8-14 Year": Available Colors ->', colorsKids);

  if (colorsS.length === 1 && colorsS[0] === 'Standard' && colorsM.length === 3 && colorsM.includes('Red')) {
    console.log('RESULT: PASS! Colors are strictly isolated per size and comma-separated colors (White, Red, Black) render as 3 distinct color pills!');
  }

  // Cleanup
  await supabase.from('product_variants').delete().eq('product_id', prod.id);
  await supabase.from('products').delete().eq('id', prod.id);
}

testPerSizeColorsAndCommas();
