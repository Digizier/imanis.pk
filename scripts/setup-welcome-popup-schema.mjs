import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.iolyisuipmprmdeutsht:csKj!jtL*BC%268rA@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function setupSchema() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL Supabase DB');

    // 1. Create popup_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.popup_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        delay_seconds INTEGER NOT NULL DEFAULT 2,
        headline TEXT NOT NULL DEFAULT 'Get Exclusive Discounts on Your First Order!',
        description TEXT NOT NULL DEFAULT 'Subscribe to unlock instant public promo coupons, secret deal alerts & VIP offers!',
        button_text TEXT NOT NULL DEFAULT 'Unlock Promo Coupons 🎉',
        discount_badge_text TEXT NOT NULL DEFAULT 'Welcome Offer',
        require_whatsapp BOOLEAN NOT NULL DEFAULT false,
        frequency_days INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created popup_settings table');

    // Insert default settings row if not exists
    await client.query(`
      INSERT INTO public.popup_settings (id, is_enabled, delay_seconds, headline, description, button_text, discount_badge_text, require_whatsapp, frequency_days)
      VALUES ('default', true, 2, 'Get Exclusive Discounts on Your First Order!', 'Subscribe to unlock instant public promo coupons, secret deal alerts & VIP offers!', 'Unlock Promo Coupons 🎉', 'Welcome Offer', false, 1)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Seeded default popup_settings');

    // 2. Create newsletter_subscribers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        whatsapp_number TEXT,
        source TEXT DEFAULT 'welcome_popup',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created newsletter_subscribers table');

    // Enable RLS and public policies
    await client.query(`
      ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public select popup_settings" ON public.popup_settings;
      CREATE POLICY "Public select popup_settings" ON public.popup_settings FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public update popup_settings" ON public.popup_settings;
      CREATE POLICY "Public update popup_settings" ON public.popup_settings FOR ALL USING (true);

      DROP POLICY IF EXISTS "Public insert newsletter_subscribers" ON public.newsletter_subscribers;
      CREATE POLICY "Public insert newsletter_subscribers" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Public select newsletter_subscribers" ON public.newsletter_subscribers;
      CREATE POLICY "Public select newsletter_subscribers" ON public.newsletter_subscribers FOR SELECT USING (true);
    `);
    console.log('Enabled RLS & created policies for popup_settings & newsletter_subscribers');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

setupSchema();
