import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Supabase Direct & Pooler Connection Strings
const connectionStrings = [
    'postgres://postgres.qrqmibxwibkszosikxbc:csKj!jtL*BC%268rA@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    'postgres://postgres.qrqmibxwibkszosikxbc:csKj!jtL*BC%268rA@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres:csKj!jtL*BC&8rA@db.qrqmibxwibkszosikxbc.supabase.co:5432/postgres'
];

async function applyMarketingMigration() {
    let client = null;
    let connected = false;

    for (const connStr of connectionStrings) {
        try {
            console.log(`Attempting connection with: ${connStr.replace(/:[^:]*@/, ':***@')}`);
            client = new pg.Client({
                connectionString: connStr,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();
            connected = true;
            console.log('✅ Connected successfully to Supabase PostgreSQL!');
            break;
        } catch (connErr) {
            console.warn('Connection failed, trying next pooler...', connErr.message);
        }
    }

    if (!connected || !client) {
        throw new Error('Could not establish connection to Supabase database.');
    }

    try {
        const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260831_marketing_and_catalog.sql');
        console.log(`Reading SQL Migration from ${sqlPath}...`);
        const migrationSql = fs.readFileSync(sqlPath, 'utf-8');

        console.log('Executing Marketing & Meta Catalog Migration...');
        await client.query(migrationSql);
        console.log('✅ Migration executed successfully!');

        // Verify marketing_settings
        const mRes = await client.query('SELECT * FROM public.marketing_settings LIMIT 5');
        console.log('\n📊 marketing_settings verification:');
        console.table(mRes.rows);

        // Verify facebook_catalog_items count & sample rows
        const cRes = await client.query('SELECT count(*) as total_items FROM public.facebook_catalog_items');
        console.log(`\n📦 Total items in facebook_catalog_items: ${cRes.rows[0].total_items}`);

        const sampleRes = await client.query('SELECT id, title, price, sale_price, availability, brand FROM public.facebook_catalog_items LIMIT 5');
        console.log('\n🔍 Sample synced catalog items:');
        console.table(sampleRes.rows);

    } catch (err) {
        console.error('❌ Error executing SQL migration:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

applyMarketingMigration();
