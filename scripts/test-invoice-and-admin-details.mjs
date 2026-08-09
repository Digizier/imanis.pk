import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testInvoiceAndAdminDetails() {
  console.log('--- TESTING ADMIN DETAILS INVOICE SETTINGS SAVE ---');

  const testSettings = {
    companyName: "Imani's Collection Official",
    tagline: 'Smart Style, Everyday Savings',
    ntnNumber: 'NTN-8472910-3',
    address: 'Shop 1&2 Meharma Market, Street 1A, Shah Allah Ditta Town, Adjacent D12/2, Islamabad, Pakistan',
    phone: '0312 1222333',
    email: 'imanisbyanila@gmail.com',
    bankDetails: 'Meezan Bank | Account Title: Imani Collection | Account #: 0102030405060708',
    invoiceNotes: 'Thank you for shopping with Imani\'s! 7-day return policy valid with original receipt.'
  };

  // 1. Save Settings
  const { error: upsertErr } = await supabase
    .from('store_settings')
    .upsert({ key: 'invoice_settings', value: testSettings }, { onConflict: 'key' });

  if (upsertErr) {
    console.error('SAVING INVOICE SETTINGS FAILED:', upsertErr.message);
    return;
  }
  console.log('1. INVOICE SETTINGS UPSERTED SUCCESSFULLY!');

  // 2. Query Settings
  const { data: fetchRes, error: fetchErr } = await supabase
    .from('store_settings')
    .select('*')
    .eq('key', 'invoice_settings')
    .single();

  if (fetchErr || !fetchRes) {
    console.error('FETCH INVOICE SETTINGS FAILED:', fetchErr?.message);
    return;
  }

  console.log('2. FETCHED INVOICE SETTINGS FROM SUPABASE:');
  console.log('   Company Name:', fetchRes.value.companyName);
  console.log('   Helpline Phone:', fetchRes.value.phone);
  console.log('   Email:', fetchRes.value.email);
  console.log('   Address:', fetchRes.value.address);

  if (fetchRes.value.companyName === testSettings.companyName && fetchRes.value.phone === testSettings.phone) {
    console.log('RESULT: PASS! Admin Details Invoice settings are 100% saved, connected, and live in Supabase!');
  }
}

testInvoiceAndAdminDetails();
