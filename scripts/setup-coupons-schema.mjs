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

    // Drop check constraint if present
    await client.query(`
      ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
    `);

    // Add missing columns including updated_at, created_at, etc.
    await client.query(`
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount NUMERIC DEFAULT NULL;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INT DEFAULT NULL;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ DEFAULT NULL;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ DEFAULT NULL;
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    `);

    // 2. Enable RLS and create open policy for client access
    await client.query(`
      ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public access to coupons" ON coupons;
      CREATE POLICY "Allow public access to coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('Coupons schema & policies updated with updated_at column successfully!');
  } catch (err) {
    console.error('Error migrating coupons schema:', err);
  } finally {
    await client.end();
  }
}

run();
