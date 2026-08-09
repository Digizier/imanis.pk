import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.iolyisuipmprmdeutsht:csKj!jtL*BC&8rA@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database...');

    // 1. Create payment_methods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
        display_name VARCHAR(150) NOT NULL,
        account_title VARCHAR(150),
        account_number VARCHAR(150),
        bank_name VARCHAR(150),
        branch_name VARCHAR(150),
        qr_code_url TEXT,
        instructions TEXT,
        requires_payment_proof BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Enable RLS and create open policy for client access
    await client.query(`
      ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public access to payment_methods" ON payment_methods;
      CREATE POLICY "Allow public access to payment_methods" ON payment_methods FOR ALL USING (true) WITH CHECK (true);
    `);

    // 3. Add payment_receipt_url to orders table
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT DEFAULT NULL;
    `);

    // 4. Seed default payment methods if empty
    const checkRes = await client.query(`SELECT COUNT(*) FROM payment_methods;`);
    if (parseInt(checkRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO payment_methods (name, type, display_name, account_title, account_number, bank_name, instructions, requires_payment_proof, is_active, sort_order)
        VALUES 
          ('Cash on Delivery', 'cod', 'Cash on Delivery (COD)', NULL, NULL, NULL, 'Pay in PKR cash when courier delivers package to your doorstep.', false, true, 1),
          ('Direct Bank Transfer', 'bank_transfer', 'Meezan Bank - Direct Bank Transfer', 'Imanis Collection', '01020304050607 (IBAN: PK64MEZN0001020304050607)', 'Meezan Bank Limited', 'Transfer order total via banking app and upload receipt screenshot below or send on WhatsApp for instant dispatch.', true, true, 2),
          ('EasyPaisa', 'easypaisa', 'EasyPaisa Mobile Wallet', 'Anila Habib', '0312 1222333', 'Telenor Microfinance Bank', 'Transfer payment via EasyPaisa app to 0312 1222333. Upload payment screenshot below for instant verification.', true, true, 3),
          ('JazzCash', 'jazzcash', 'JazzCash Mobile Wallet', 'Anila Habib', '0312 1222333', 'Mobilink Microfinance Bank', 'Transfer payment via JazzCash app to 0312 1222333. Upload payment screenshot below for instant verification.', true, true, 4);
      `);
    }

    console.log('Payment Methods schema & database migration completed successfully!');
  } catch (err) {
    console.error('Error migrating payment_methods schema:', err);
  } finally {
    await client.end();
  }
}

run();
