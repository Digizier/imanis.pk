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

    // Drop any status check constraints to allow 'Under Payment Verification' status
    await client.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
    `);

    console.log('Successfully dropped status check constraints on orders table!');
  } catch (err) {
    console.error('Error dropping status constraints:', err);
  } finally {
    await client.end();
  }
}

run();
