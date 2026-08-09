import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.iolyisuipmprmdeutsht:csKj!jtL*BC%268rA@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function fixPolicies() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL Supabase DB');

    // Drop restrictive policies and add full ALL/DELETE policy for newsletter_subscribers
    await client.query(`
      ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public delete newsletter_subscribers" ON public.newsletter_subscribers;
      CREATE POLICY "Public delete newsletter_subscribers" ON public.newsletter_subscribers FOR DELETE USING (true);

      DROP POLICY IF EXISTS "Public all newsletter_subscribers" ON public.newsletter_subscribers;
      CREATE POLICY "Public all newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true);
    `);
    console.log('Successfully created FOR DELETE and FOR ALL policies on newsletter_subscribers!');

  } catch (err) {
    console.error('Policy migration error:', err);
  } finally {
    await client.end();
  }
}

fixPolicies();
