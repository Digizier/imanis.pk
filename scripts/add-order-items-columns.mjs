import pg from 'pg';

const ref = 'iolyisuipmprmdeutsht';
const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const port = 5432;

const connectionString = `postgres://postgres.${ref}:${pass}@${host}:${port}/postgres`;

async function fixOrderItemsSchema() {
    console.log('Connecting to Supabase to add missing columns to order_items table...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
        ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0;
        ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0;
        ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_info TEXT;
        ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
        ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
        `;

        await client.query(sql);
        console.log('Successfully updated order_items table schema in Supabase!');
    } catch (err) {
        console.error('Error updating order_items schema:', err);
    } finally {
        await client.end();
    }
}

fixOrderItemsSchema();
