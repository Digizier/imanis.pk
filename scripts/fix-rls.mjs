import pg from 'pg';

const ref = 'iolyisuipmprmdeutsht';
const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const port = 5432;

const connectionString = `postgres://postgres.${ref}:${pass}@${host}:${port}/postgres`;

async function fixRLS() {
    console.log('Connecting to Supabase to update RLS policies...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
        -- Enable RLS
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

        -- Drop restrictive policies if present
        DROP POLICY IF EXISTS "Public insert product policy" ON public.products;
        DROP POLICY IF EXISTS "Public update product policy" ON public.products;
        DROP POLICY IF EXISTS "Public delete product policy" ON public.products;
        DROP POLICY IF EXISTS "Public full products policy" ON public.products;

        DROP POLICY IF EXISTS "Public full product_variants policy" ON public.product_variants;

        -- Allow full access to products table for admin/all requests
        CREATE POLICY "Public full products policy" ON public.products FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY "Public full product_variants policy" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
        `;

        await client.query(sql);
        console.log('Successfully updated Supabase RLS policies for products and variants!');
    } catch (err) {
        console.error('Error fixing RLS:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

fixRLS();
