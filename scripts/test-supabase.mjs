import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
    console.log('Testing Supabase REST Client connection...');
    const { data, error } = await supabase.from('products').select('*').limit(5);
    if (error) {
        console.log('Query result:', error.message);
    } else {
        console.log('Successfully queried products table! Items count:', data?.length);
    }
}

testConnection();
