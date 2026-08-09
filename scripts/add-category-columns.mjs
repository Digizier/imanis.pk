import pg from 'pg';

const ref = 'iolyisuipmprmdeutsht';
const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const port = 5432;

const connectionString = `postgres://postgres.${ref}:${pass}@${host}:${port}/postgres`;

async function addCategoryColumns() {
    console.log('Connecting to Supabase to add parent_id, image, is_active to categories table...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
        ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
        ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT;
        ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

        -- RLS policy for categories table
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public full categories policy" ON public.categories;
        CREATE POLICY "Public full categories policy" ON public.categories FOR ALL USING (true) WITH CHECK (true);
        `;

        await client.query(sql);
        console.log('Successfully updated categories schema on Supabase!');
    } catch (err) {
        console.error('Error updating categories schema:', err);
    } finally {
        await client.end();
    }
}

addCategoryColumns();
