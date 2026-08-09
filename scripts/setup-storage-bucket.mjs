import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgres://postgres.qrqmibxwibkszosikxbc:csKj!jtL*BC%268rA@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database...');

    const buckets = ['public-products', 'product-images', 'banners', 'payment-proofs'];
    for (const bucket of buckets) {
      await client.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('${bucket}', '${bucket}', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
        ON CONFLICT (id) DO UPDATE SET public = true;
      `);

      await client.query(`
        CREATE POLICY "Allow public select on ${bucket}"
        ON storage.objects FOR SELECT
        USING (bucket_id = '${bucket}');
      `).catch(() => {});

      await client.query(`
        CREATE POLICY "Allow public insert on ${bucket}"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = '${bucket}');
      `).catch(() => {});
    }

    // 2. Add open policy for storage objects
    await client.query(`
      CREATE POLICY "Allow public select on public-products"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'public-products');
    `).catch(() => {});

    await client.query(`
      CREATE POLICY "Allow public insert on public-products"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'public-products');
    `).catch(() => {});

    await client.query(`
      CREATE POLICY "Allow public update on public-products"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'public-products');
    `).catch(() => {});

    console.log('Successfully created public-products bucket in Supabase Storage!');
  } catch (err) {
    console.error('Error creating storage bucket:', err);
  } finally {
    await client.end();
  }
}

run();
