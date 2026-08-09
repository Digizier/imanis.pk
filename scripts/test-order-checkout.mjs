import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTk0OTEsImV4cCI6MjEwMTgzNTQ5MX0.pXx-VXrjMisfbS7FWBjlyD_v4MjhpHNegniDAuFwy_U';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOrderCheckout() {
  console.log('Testing Order Insertion on Supabase...');
  const orderNumber = `IMP-${Math.floor(100000 + Math.random() * 900000)}`;

  const { data: newOrder, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: 'Baitullah Repair',
      customer_phone: '03121222333',
      customer_email: 'baitullahrepair@gmail.com',
      province: 'Punjab',
      city: 'Lahore',
      full_address: 'Main Boulevard Gulberg III, Lahore',
      subtotal: 1400,
      shipping_fee: 200,
      discount_amount: 0,
      total_amount: 1600,
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('ORDER INSERT FAILED:', error.message);
  } else {
    console.log('ORDER INSERT SUCCESS! Order ID:', newOrder.id, 'Order Number:', newOrder.order_number);

    // Insert Order Item with both price and unit_price
    const { data: itemData, error: itemErr } = await supabase.from('order_items').insert({
      order_id: newOrder.id,
      product_name: 'Nadir Habib',
      variant_info: 'Size: S / White',
      unit_price: 350,
      price: 350,
      quantity: 1,
      total_price: 350,
    });

    if (itemErr) {
      console.error('ORDER ITEM INSERT FAILED:', itemErr.message);
    } else {
      console.log('ORDER ITEM INSERT SUCCESS!');
    }
  }
}

testOrderCheckout();
