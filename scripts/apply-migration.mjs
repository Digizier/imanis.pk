import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgres://postgres.qrqmibxwibkszosikxbc:csKj!jtL*BC%268rA@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

async function runMigration() {
    console.log('Connecting to Supabase via Pooler (aws-0-ap-northeast-1)...');
    const client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Successfully connected to Supabase DB!');

        console.log('Reading migration schema SQL...');
        const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20260805_init_schema.sql'), 'utf-8');
        console.log('Executing migration schema...');
        await client.query(schemaSql);
        console.log('Schema migration executed successfully!');

        console.log('Reading reconciliation schema SQL...');
        const reconcileSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20260809_reconcile_schema.sql'), 'utf-8');
        console.log('Executing reconciliation schema...');
        await client.query(reconcileSql);
        console.log('Reconciliation schema executed successfully!');

        console.log('Reading seed SQL...');
        const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'seed.sql'), 'utf-8');
        console.log('Executing seed script...');
        await client.query(seedSql);
        console.log('Database seeded successfully!');

    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

runMigration();
