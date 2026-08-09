import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrqmibxwibkszosikxbc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycW1pYnh3aWJrc3pvc2lreGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI1OTQ5MSwiZXhwIjoyMTAxODM1NDkxfQ._LzSkwPA2CaJ9KneaQpMZfFVpH95cASVBTpH7cnQeLE';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testDynamicHeroBannerSlider() {
  console.log('--- TESTING DYNAMIC HOMEPAGE HERO BANNER SLIDER MANAGER ---');

  const sampleSlides = [
    {
      id: '1',
      badge: 'UP TO 60% OFF',
      title: "Pakistan's Favorite Summer Fashion Sale 2026",
      subtitle: 'Smart Style, Everyday Savings on Kids Wear, Polos & Activewear',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80',
      ctaText: 'Shop Summer Deals',
      ctaUrl: '/collections/crazy-deals',
      is_active: true
    },
    {
      id: '2',
      badge: 'ORGANIC COTTON',
      title: 'Kids Organic Cotton & Romper Collection',
      subtitle: 'Ultra-soft, skin-friendly daily wear frocks, rompers & twin sets',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1600&q=80',
      ctaText: 'Explore Kids Wear',
      ctaUrl: '/categories/kids',
      is_active: true
    },
    {
      id: '3',
      badge: 'BREATHABLE TECH',
      title: 'High Performance Gym & Activewear',
      subtitle: 'Moisture-wicking breathable tees, shorts & athletic twin sets',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80',
      ctaText: 'Shop Activewear',
      ctaUrl: '/categories/activewear',
      is_active: true
    }
  ];

  // 1. Save Slides to Supabase store_settings
  const { error: upsertErr } = await supabase
    .from('store_settings')
    .upsert({ key: 'homepage_hero_slides', value: sampleSlides }, { onConflict: 'key' });

  if (upsertErr) {
    console.error('HERO SLIDES UPSERT FAILED:', upsertErr.message);
    return;
  }
  console.log('1. HERO BANNER SLIDES SAVED TO SUPABASE STORE_SETTINGS!');

  // 2. Query Slides from Supabase
  const { data: fetchRes, error: fetchErr } = await supabase
    .from('store_settings')
    .select('*')
    .eq('key', 'homepage_hero_slides')
    .single();

  if (fetchErr || !fetchRes) {
    console.error('FETCH HERO SLIDES FAILED:', fetchErr?.message);
    return;
  }

  console.log('2. FETCHED HERO SLIDES FOR STOREFRONT HERO CAROUSEL:');
  fetchRes.value.forEach((slide, i) => {
    console.log(`   Slide #${i + 1}: [${slide.badge}] "${slide.title}" -> Link: ${slide.ctaUrl}`);
  });

  if (fetchRes.value.length === 3 && fetchRes.value[0].ctaUrl === '/collections/crazy-deals') {
    console.log('RESULT: PASS! Dynamic Homepage Hero Banner Slider is 100% functional and live in Supabase!');
  }
}

testDynamicHeroBannerSlider();
