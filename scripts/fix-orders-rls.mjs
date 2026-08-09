import pg from 'pg';

const ref = 'iolyisuipmprmdeutsht';
const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const port = 5432;

const connectionString = `postgres://postgres.${ref}:${pass}@${host}:${port}/postgres`;

async function fixOrdersRLS() {
    console.log('Connecting to Supabase to update Orders RLS policies...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
        -- Enable RLS
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

        -- Drop existing restrictive policies
        DROP POLICY IF EXISTS "Public insert orders policy" ON public.orders;
        DROP POLICY IF EXISTS "Public select orders policy" ON public.orders;
        DROP POLICY IF EXISTS "Public full orders policy" ON public.orders;

        DROP POLICY IF EXISTS "Public insert order_items policy" ON public.order_items;
        DROP POLICY IF EXISTS "Public select order_items policy" ON public.order_items;
        DROP POLICY IF EXISTS "Public full order_items policy" ON public.order_items;

        -- Create full permissive access policies for orders and order_items
        CREATE POLICY "Public full orders policy" ON public.orders FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY "Public full order_items policy" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
        `;

        await client.query(sql);
        console.log('Successfully updated Supabase RLS policies for orders and order_items!');
    } catch (err) {
        console.error('Error fixing orders RLS:', err);
    } finally {
        await client.end();
    }
}

fixOrdersRLS();
