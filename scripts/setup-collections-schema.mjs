import pg from 'pg';

const ref = 'iolyisuipmprmdeutsht';
const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const port = 5432;

const connectionString = `postgres://postgres.${ref}:${pass}@${host}:${port}/postgres`;

async function setupCollectionsSchema() {
    console.log('Connecting to Supabase to setup collections table and RLS policies...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
        CREATE TABLE IF NOT EXISTS public.collections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            banner_image TEXT,
            is_featured BOOLEAN DEFAULT true,
            is_active BOOLEAN DEFAULT true,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT 'pink';
        ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

        -- RLS Policies
        ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public full collections policy" ON public.collections;
        CREATE POLICY "Public full collections policy" ON public.collections FOR ALL USING (true) WITH CHECK (true);

        -- Seed initial Collections if empty
        INSERT INTO public.collections (name, slug, description, sort_order, is_active, badge_color)
        VALUES 
            ('Crazy Deals', 'crazy-deals', 'Up to 50% Off Crazy Pakistani Fashion Deals', 1, true, 'red'),
            ('New Arrivals', 'new-arrivals', 'Fresh Seasonal Collection Arrivals', 2, true, 'purple'),
            ('Bundle Offers', 'bundle-offers', 'Save More With Multi-Pack Fashion Bundles', 3, true, 'amber'),
            ('Clearance', 'clearance', 'Final Stock Clearance Sales', 4, true, 'dark'),
            ('Everyday Essentials', 'everyday-essentials', 'Daily Smart Style Essentials', 5, true, 'green')
        ON CONFLICT (slug) DO UPDATE SET is_active = true;
        `;

        await client.query(sql);
        console.log('Successfully set up collections schema & seeded initial collections in Supabase!');
    } catch (err) {
        console.error('Error setting up collections schema:', err);
    } finally {
        await client.end();
    }
}

setupCollectionsSchema();
