import pg from 'pg';

const ref = 'iolyisuipmprmdeutsht';
const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const port = 5432;

const connectionString = `postgres://postgres.${ref}:${pass}@${host}:${port}/postgres`;

async function addSizeGuideColumn() {
    console.log('Connecting to Supabase to add size_guide column...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide TEXT;
        `;

        await client.query(sql);
        console.log('Successfully added size_guide column to products table!');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await client.end();
    }
}

addSizeGuideColumn();
