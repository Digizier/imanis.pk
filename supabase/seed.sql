-- IMANI'S E-COMMERCE SEED DATA SCRIPT
-- Seed: seed.sql

-- 1. SEED STORE SETTINGS
INSERT INTO public.store_settings (key, value) VALUES
('general', '{
    "store_name": "Imani''s",
    "legal_name": "Imani''s Collection (imanisbyanila)",
    "tagline": "Smart Style, Everyday Savings",
    "phone": "0312 1222333",
    "whatsapp": "0312 1222333",
    "email": "imanisbyanila@gmail.com",
    "address": "Shop 1&2 Meharma Market, Street 1A, Shah Allah Ditta Town, Adjacent D12/2, Islamabad, Pakistan",
    "announcement_text": "⚡ FREE SHIPPING ON RS. 2999+ ORDERS ACROSS PAKISTAN | 7-DAY RETURN POLICY",
    "free_shipping_threshold": 2999,
    "delivery_days": "3-5 Working Days",
    "facebook": "https://www.facebook.com/imanisbyanila",
    "instagram": "https://www.instagram.com/imanisbyanila",
    "tiktok": "https://www.tiktok.com/imanis.collection"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, sort_order, is_featured, is_active) VALUES
('a0000001-0000-0000-0000-000000000001', 'Men', 'men', 'Men''s apparel, activewear, tees, polos and shorts', 1, true, true),
('a0000001-0000-0000-0000-000000000002', 'Women', 'women', 'Women''s tops, ready to wear, activewear and innerwear', 2, true, true),
('a0000001-0000-0000-0000-000000000003', 'Kids', 'kids', 'Boys, girls and baby rompers, frocks and twin sets', 3, true, true),
('a0000001-0000-0000-0000-000000000004', 'Activewear', 'activewear', 'Breathable performance t-shirts, shorts and sets', 4, true, true),
('a0000001-0000-0000-0000-000000000005', 'Footwear', 'footwear', 'Casual shoes, sandals and comfortable socks', 5, true, true),
('a0000001-0000-0000-0000-000000000006', 'Accessories', 'accessories', 'Caps, hats, belts, underwear and grooming', 6, true, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED COLLECTIONS
INSERT INTO public.collections (id, name, slug, description, sort_order, is_featured, is_active) VALUES
('b0000001-0000-0000-0000-000000000001', 'Crazy Deals', 'crazy-deals', 'Unbeatable discounts on high quality fashion essentials', 1, true, true),
('b0000001-0000-0000-0000-000000000002', 'New Arrivals', 'new-arrivals', 'Fresh Pakistani summer and casual fashion styles', 2, true, true),
('b0000001-0000-0000-0000-000000000003', 'Bundle Offers', 'bundle-offers', 'Save more when you buy multi-pack items', 3, true, true),
('b0000001-0000-0000-0000-000000000004', 'Clearance', 'clearance', 'Final stock cut label items at lowest prices', 4, true, true),
('b0000001-0000-0000-0000-000000000005', 'Everyday Essentials', 'everyday-essentials', 'Must-have daily wear tees, shorts and rompers', 5, true, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED PRODUCTS
INSERT INTO public.products (
    id, name, slug, short_description, full_description, brand, sku,
    status, is_featured, is_new_arrival, is_clearance, is_crazy_deal, is_bundle_offer,
    regular_price, sale_price, compare_at_price, category_id, gender, age_group, product_type,
    tags, main_image, gallery_images, total_stock
) VALUES
(
    'c0000001-0000-0000-0000-000000000001',
    'MyMixTrendz Kids Wear Twin Set',
    'mymix-trendz-kids-wear-twin-set',
    'Ultra-soft 100% breathable organic cotton twin set for kids.',
    'Keep your young ones stylish and comfortable all day with our premium MyMixTrendz Kids Wear Twin Set. Made with 100% combed cotton, ideal for active play.',
    'Imani''s Collection',
    'KID-TWIN-001',
    'active', true, true, false, true, true,
    1499.00, 799.00, 1499.00,
    'a0000001-0000-0000-0000-000000000003', 'Unisex', 'Kids', 'Sets',
    ARRAY['Kids', 'Twin Set', 'Summer', 'Crazy Deal'],
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80'],
    45
),
(
    'c0000001-0000-0000-0000-000000000002',
    'Lupilu Organic Cotton Frock',
    'lupilu-organic-cotton-frock',
    'Cute & breezy printed organic cotton summer frock for baby girls.',
    'Charming Lupilu organic cotton frock featuring soft pastel tones and skin-friendly stitching. Perfect for daily summer wear.',
    'Imani''s Collection',
    'KID-FRK-002',
    'active', true, true, false, true, false,
    1199.00, 599.00, 1199.00,
    'a0000001-0000-0000-0000-000000000003', 'Girls', 'Kids', 'Dresses',
    ARRAY['Girls', 'Frock', 'Cotton', 'Crazy Deal'],
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80'],
    30
),
(
    'c0000001-0000-0000-0000-000000000003',
    'Slake Breathable GYM/Yoga Activewear T-Shirt',
    'slake-breathable-gym-yoga-activewear-tshirt',
    'Moisture-wicking, stretchable athletic tee for workouts and casual wear.',
    'Designed for high performance, the Slake GYM T-shirt features quick-dry fabric, ergonomic stitching, and maximum airflow for hot summer training.',
    'Slake Active',
    'MEN-ACT-003',
    'active', true, true, false, true, false,
    1899.00, 999.00, 1899.00,
    'a0000001-0000-0000-0000-000000000004', 'Men', 'Adult', 'Activewear',
    ARRAY['Activewear', 'Gym', 'Men', 'Sale'],
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
    60
),
(
    'c0000001-0000-0000-0000-000000000004',
    'Polo Republica Men''s Drop Shoulder Oversized Tee',
    'polo-republica-mens-drop-shoulder-oversized-tee',
    'Heavyweight 220 GSM streetwear oversized crewneck t-shirt.',
    'Elevate your daily fashion with our drop shoulder oversized t-shirt. Premium dense cotton feel, durable crew neck collar, and relaxed fit.',
    'Polo Republica',
    'MEN-TEE-004',
    'active', true, true, false, true, true,
    1999.00, 999.00, 1999.00,
    'a0000001-0000-0000-0000-000000000001', 'Men', 'Adult', 'Tees',
    ARRAY['Oversized', 'Men', 'Tee', 'Bundle Offer'],
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'],
    80
),
(
    'c0000001-0000-0000-0000-000000000005',
    'Garanimals Baby Romper Set',
    'garanimals-baby-romper-set',
    'Pack of 2 comfortable baby rompers with snap closures.',
    'Soft ribbed organic jersey rompers for babies aged 0 to 24 months. Features convenient bottom snap buttons for quick diaper changes.',
    'Garanimals',
    'KID-RMP-005',
    'active', true, false, false, true, true,
    1299.00, 699.00, 1299.00,
    'a0000001-0000-0000-0000-000000000003', 'Unisex', 'Baby', 'Rompers',
    ARRAY['Baby', 'Romper', 'Cotton', 'Bundle Offer'],
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'],
    40
),
(
    'c0000001-0000-0000-0000-000000000006',
    'Marines Summer Cotton Shorts',
    'marines-summer-cotton-shorts',
    'Lightweight breathable cotton twill casual shorts with elastic waistband.',
    'Essential summer shorts featuring deep side pockets, adjustable drawstrings, and comfortable casual fit for daily loungewear.',
    'Imani''s Collection',
    'MEN-SHT-006',
    'active', false, false, true, true, false,
    1399.00, 649.00, 1399.00,
    'a0000001-0000-0000-0000-000000000001', 'Men', 'Adult', 'Shorts',
    ARRAY['Shorts', 'Cotton', 'Summer', 'Clearance'],
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80'],
    50
)
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED VARIANTS FOR PRODUCTS
INSERT INTO public.product_variants (product_id, size, color, sku, price, sale_price, stock) VALUES
('c0000001-0000-0000-0000-000000000004', 'S', 'Black', 'MEN-TEE-004-BLK-S', 1999.00, 999.00, 20),
('c0000001-0000-0000-0000-000000000004', 'M', 'Black', 'MEN-TEE-004-BLK-M', 1999.00, 999.00, 30),
('c0000001-0000-0000-0000-000000000004', 'L', 'Black', 'MEN-TEE-004-BLK-L', 1999.00, 999.00, 20),
('c0000001-0000-0000-0000-000000000004', 'XL', 'Black', 'MEN-TEE-004-BLK-XL', 1999.00, 999.00, 10),
('c0000001-0000-0000-0000-000000000003', 'M', 'Navy', 'MEN-ACT-003-NVY-M', 1899.00, 999.00, 25),
('c0000001-0000-0000-0000-000000000003', 'L', 'Navy', 'MEN-ACT-003-NVY-L', 1899.00, 999.00, 35);

-- 6. SEED PRODUCT COLLECTION MAPPINGS
INSERT INTO public.product_collections (product_id, collection_id) VALUES
('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001'),
('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003'),
('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001'),
('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001'),
('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000001'),
('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002'),
('c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- 7. SEED HOMEPAGE SECTIONS (PAGE BUILDER)
INSERT INTO public.homepage_sections (internal_name, public_title, subtitle, section_type, is_enabled, sort_order, metadata) VALUES
(
    'Hero Carousel', 'Summer Sale 2026', 'Up to 60% Off on Kids & Activewear',
    'hero_carousel', true, 1,
    '{"autoplay": true, "interval": 5000}'::jsonb
),
(
    'Crazy Deals Ticker', 'Crazy Deals', 'Limited Stock - Unbeatable Savings Across Pakistan',
    'crazy_deals', true, 2,
    '{"collection_slug": "crazy-deals"}'::jsonb
),
(
    'Category Grid', 'Shop By Category', 'Explore Top Categories',
    'category_grid', true, 3,
    '{}'::jsonb
),
(
    'New Arrivals Grid', 'New Arrivals', 'Fresh Styles Dropped Weekly',
    'featured_products', true, 4,
    '{"collection_slug": "new-arrivals", "limit": 6}'::jsonb
),
(
    'Everyday Essentials', 'Everyday Essentials', 'Comfortable Daily Wear for the Entire Family',
    'featured_products', true, 5,
    '{"collection_slug": "everyday-essentials", "limit": 6}'::jsonb
),
(
    'Customer Testimonials', 'Loved By 350K+ Customers', 'What our buyers across Pakistan say about us',
    'reviews', true, 6,
    '{}'::jsonb
);

-- 8. SEED SAMPLE REVIEWS
INSERT INTO public.reviews (product_id, customer_name, rating, title, comment, status, is_featured) VALUES
('c0000001-0000-0000-0000-000000000004', 'Bilal Ahmed (Lahore)', 5, 'Superb quality oversized tee!', 'The fabric is thick and comfortable. Fits perfectly as oversized style. Fast 3-day delivery to Lahore!', 'approved', true),
('c0000001-0000-0000-0000-000000000001', 'Ayesha Malik (Islamabad)', 5, 'Awesome Kids Twin Set', 'My son loved the fabric. 100% organic cotton as promised. Great value for Rs. 799.', 'approved', true),
('c0000001-0000-0000-0000-000000000003', 'Hamza Khan (Karachi)', 5, 'Best gym shirt in this price', 'Moisture wicking fabric works really well in Karachi humidity. Highly recommended!', 'approved', true);

-- 9. SEED DEFAULT COUPON
INSERT INTO public.coupons (code, discount_type, discount_value, min_spend, is_active) VALUES
('IMANI10', 'percentage', 10.00, 2000.00, true)
ON CONFLICT (code) DO NOTHING;
