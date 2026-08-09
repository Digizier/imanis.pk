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

    // Drop orders_payment_method_check constraint to allow any dynamic payment method name
    await client.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
    `);

    console.log('Successfully dropped orders_payment_method_check constraint!');
  } catch (err) {
    console.error('Error dropping constraint:', err);
  } finally {
    await client.end();
  }
}

run();
