import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Regions to test for pooler
const regions = [
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com'
];

const pass = encodeURIComponent('csKj!jtL*BC&8rA');
const ref = 'iolyisuipmprmdeutsht';

async function testPoolers() {
    for (const host of regions) {
        const connStr = `postgres://postgres.${ref}:${pass}@${host}:6543/postgres`;
        console.log(`Trying ${host}...`);
        const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
        try {
            await client.connect();
            console.log(`SUCCESS! Connected via ${host}`);
            
            console.log('Reading migration schema SQL...');
            const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '20260805_init_schema.sql'), 'utf-8');
            console.log('Executing migration schema...');
            await client.query(schemaSql);
            console.log('Schema migration executed successfully!');

            console.log('Reading seed SQL...');
            const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'seed.sql'), 'utf-8');
            console.log('Executing seed script...');
            await client.query(seedSql);
            console.log('Database seeded successfully!');
            await client.end();
            return;
        } catch (err) {
            console.log(`Failed ${host}:`, err.message);
        }
    }
}

testPoolers();
