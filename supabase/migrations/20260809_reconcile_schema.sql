-- IMANI'S COLLECTION DATABASE SCHEMA RECONCILIATION MIGRATION
-- Migration: 20260809_reconcile_schema.sql

-- 1. PRODUCTS TABLE MISSING COLUMNS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide TEXT;

-- 2. CATEGORIES TABLE MISSING COLUMNS
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT FALSE;

-- 3. COLLECTIONS TABLE MISSING COLUMNS
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT 'pink';
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT FALSE;

-- 4. COUPONS TABLE MISSING COLUMNS & FIX CONSTRAINTS
ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;

-- 5. ORDERS & ORDER ITEMS TABLE MISSING COLUMNS & FIX CONSTRAINTS
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Drop restrictive CHECK constraints on orders if present
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) DEFAULT 0;

-- 6. POPUP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.popup_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    is_enabled BOOLEAN DEFAULT TRUE,
    delay_seconds INT DEFAULT 2,
    headline TEXT DEFAULT 'Get Exclusive Discounts on Your First Order!',
    description TEXT DEFAULT 'Subscribe to unlock instant public promo coupons, secret deal alerts & VIP offers!',
    button_text TEXT DEFAULT 'Unlock Promo Coupons 🎉',
    discount_badge_text TEXT DEFAULT 'Welcome Offer',
    require_whatsapp BOOLEAN DEFAULT FALSE,
    frequency_days INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default popup settings row
INSERT INTO public.popup_settings (id, is_enabled, delay_seconds, headline, description, button_text, discount_badge_text, require_whatsapp, frequency_days)
VALUES ('default', true, 2, 'Get Exclusive Discounts on Your First Order!', 'Subscribe to unlock instant public promo coupons, secret deal alerts & VIP offers!', 'Unlock Promo Coupons 🎉', 'Welcome Offer', false, 1)
ON CONFLICT (id) DO NOTHING;

-- 7. PAYMENT METHODS TABLE
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'bank_transfer',
    display_name TEXT NOT NULL,
    account_title TEXT,
    account_number TEXT,
    bank_name TEXT,
    branch_name TEXT,
    qr_code_url TEXT,
    instructions TEXT,
    requires_payment_proof BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default payment methods
INSERT INTO public.payment_methods (id, name, type, display_name, account_title, account_number, bank_name, branch_name, instructions, requires_payment_proof, is_active, sort_order) VALUES
('d0000001-0000-0000-0000-000000000001', 'Cash on Delivery (COD)', 'cod', 'Cash on Delivery (COD)', NULL, NULL, NULL, NULL, 'Pay comfortably in cash when courier delivers package to your doorstep.', false, true, 1),
('d0000001-0000-0000-0000-000000000002', 'Meezan Bank Transfer', 'bank_transfer', 'Meezan Bank - Direct Bank Transfer', 'Imani Collection', '0102030405060708', 'Meezan Bank', 'F-10 Markaz Islamabad', 'Please transfer order total to our Meezan Bank account and upload transfer screenshot/receipt below.', true, true, 2),
('d0000001-0000-0000-0000-000000000003', 'EasyPaisa Mobile Wallet', 'easypaisa', 'EasyPaisa Mobile Wallet', 'Anila / Imani Collection', '03121222333', 'EasyPaisa', NULL, 'Send total amount to EasyPaisa number 03121222333 and upload proof screenshot.', true, true, 3),
('d0000001-0000-0000-0000-000000000004', 'JazzCash Mobile Wallet', 'jazzcash', 'JazzCash Mobile Wallet', 'Anila / Imani Collection', '03121222333', 'JazzCash', NULL, 'Send total amount to JazzCash number 03121222333 and upload proof screenshot.', true, true, 4)
ON CONFLICT (id) DO NOTHING;

-- 8. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT,
    source TEXT DEFAULT 'popup',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RE-CONFIGURE RLS POLICIES FOR ALL TABLES
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Public store_settings read policy" ON public.store_settings;
DROP POLICY IF EXISTS "Allow all for store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow all for popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Allow all for payment_methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Allow all for newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow all for coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow all for categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all for collections" ON public.collections;
DROP POLICY IF EXISTS "Allow all for products" ON public.products;
DROP POLICY IF EXISTS "Allow all for orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all for order_items" ON public.order_items;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public product_variants read policy" ON public.product_variants;
CREATE POLICY "Allow all for product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- Universal Read & Write Policies for Application Contract
CREATE POLICY "Allow all for store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for popup_settings" ON public.popup_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for payment_methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Seed active public coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_spend, is_public, is_active) VALUES
('CRAZY500', 'Rs. 500 OFF on orders Rs. 2,999+', 'fixed_amount', 500.00, 2999.00, true, true),
('IMANI10', '10% OFF on orders Rs. 1,000+', 'percentage', 10.00, 1000.00, true, true)
ON CONFLICT (code) DO UPDATE SET is_public = true, is_active = true, min_spend = EXCLUDED.min_spend;
