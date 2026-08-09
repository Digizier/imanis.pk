import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.iolyisuipmprmdeutsht:csKj!jtL*BC%268rA@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function addShowOnHomepageColumn() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL Supabase DB');

    await client.query(`
      ALTER TABLE public.categories 
      ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT false;
    `);
    console.log('Successfully added show_on_homepage column to categories table!');

    // Let's set show_on_homepage = true for at least 1-2 categories initially so user can see it right away!
    await client.query(`
      UPDATE public.categories
      SET show_on_homepage = true
      WHERE slug IN ('women', 'kids', 'activewear');
    `);
    console.log('Updated default categories (women, kids, activewear) to show_on_homepage = true');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

addShowOnHomepageColumn();
