import pg from 'pg';

const ref = 'qrqmibxwibkszosikxbc';
const pass = 'csKj!jtL*BC&8rA';

const poolers = [
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com'
];

async function findRegion() {
  for (const host of poolers) {
    for (const port of [5432, 6543]) {
      for (const user of [`postgres.${ref}`, 'postgres']) {
        const connStr = `postgres://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres`;
        const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
        try {
          await client.connect();
          console.log(`FOUND WORKING CONNECTION! Host: ${host}, Port: ${port}, User: ${user}`);
          await client.end();
          return { host, port, user };
        } catch (e) {
          // ignore
        }
      }
    }
  }
  console.log('No direct pooler connection found. Checking alternative method...');
}

findRegion();
