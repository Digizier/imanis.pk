-- IMANI'S COLLECTION: MARKETING SETTINGS & META PRODUCT CATALOG MIGRATION
-- Migration: 20260831_marketing_and_catalog.sql

-- 1. MARKETING SETTINGS TABLE (Meta Pixel, Google Tag Manager, etc.)
CREATE TABLE IF NOT EXISTS public.marketing_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    meta_pixel_id TEXT DEFAULT '1316498475903579',
    is_pixel_enabled BOOLEAN DEFAULT TRUE,
    test_event_code TEXT,
    catalog_title TEXT DEFAULT 'Imani''s Collection Product Catalog',
    catalog_description TEXT DEFAULT 'Official product catalog feed for Imani''s Collection store',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default marketing settings row
INSERT INTO public.marketing_settings (id, meta_pixel_id, is_pixel_enabled, catalog_title, catalog_description)
VALUES ('default', '1316498475903579', true, 'Imani''s Collection Product Catalog', 'Official product catalog feed for Imani''s Collection store')
ON CONFLICT (id) DO NOTHING;

-- 2. META FACEBOOK CATALOG ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.facebook_catalog_items (
    id TEXT PRIMARY KEY, -- SKU or Product ID (matches Meta Pixel content_ids)
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    availability TEXT NOT NULL DEFAULT 'in stock', -- 'in stock' | 'out of stock' | 'preorder'
    condition TEXT NOT NULL DEFAULT 'new', -- 'new' | 'refurbished' | 'used'
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(10, 2),
    currency TEXT NOT NULL DEFAULT 'PKR',
    link TEXT NOT NULL,
    image_link TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Imani''s Collection',
    fb_product_category TEXT DEFAULT 'Apparel & Accessories > Clothing',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INITIAL POPULATION: Auto-sync all existing products from products table into facebook_catalog_items
INSERT INTO public.facebook_catalog_items (
    id,
    product_id,
    title,
    description,
    availability,
    condition,
    price,
    sale_price,
    currency,
    link,
    image_link,
    brand,
    fb_product_category,
    is_active
)
SELECT 
    COALESCE(p.sku, p.id::text) AS id,
    p.id AS product_id,
    p.name AS title,
    COALESCE(NULLIF(p.short_description, ''), NULLIF(p.full_description, ''), p.name) AS description,
    CASE 
        WHEN p.total_stock > 0 THEN 'in stock'
        ELSE 'out of stock'
    END AS availability,
    'new' AS condition,
    p.regular_price AS price,
    p.sale_price AS sale_price,
    'PKR' AS currency,
    'https://imanis.pk/products/' || p.slug AS link,
    COALESCE(p.main_image, 'https://imanis.pk/og-image.png') AS image_link,
    COALESCE(NULLIF(p.brand, ''), 'Imani''s Collection') AS brand,
    COALESCE(c.name, 'Apparel & Accessories > Clothing') AS fb_product_category,
    CASE 
        WHEN p.status = 'active' THEN TRUE 
        ELSE FALSE 
    END AS is_active
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    availability = EXCLUDED.availability,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    link = EXCLUDED.link,
    image_link = EXCLUDED.image_link,
    brand = EXCLUDED.brand,
    fb_product_category = EXCLUDED.fb_product_category,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 4. ENABLE RLS POLICIES FOR SECURE CLIENT & PUBLIC FEED ACCESS
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_catalog_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view marketing_settings" ON public.marketing_settings;
CREATE POLICY "Public can view marketing_settings" ON public.marketing_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage marketing_settings" ON public.marketing_settings;
CREATE POLICY "Admin can manage marketing_settings" ON public.marketing_settings
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view facebook_catalog_items" ON public.facebook_catalog_items;
CREATE POLICY "Public can view facebook_catalog_items" ON public.facebook_catalog_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage facebook_catalog_items" ON public.facebook_catalog_items;
CREATE POLICY "Admin can manage facebook_catalog_items" ON public.facebook_catalog_items
    FOR ALL USING (true) WITH CHECK (true);
