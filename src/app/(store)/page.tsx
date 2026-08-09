import React from 'react';
import Link from 'next/link';
import { HeroCarousel } from '@/components/storefront/HeroCarousel';
import { CategoryGrid } from '@/components/storefront/CategoryGrid';
import { ProductCard } from '@/components/storefront/ProductCard';
import { DealCountdown } from '@/components/storefront/DealCountdown';
import { ReviewsSection } from '@/components/storefront/ReviewsSection';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, Sparkles, FolderTree } from 'lucide-react';

export const dynamic = 'force-static'; // Pure static HTML served from Edge CDN (Zero background reval writes, On-Demand revalidated via Admin Panel)

export default async function HomePage() {
  // Fetch Main Categories only with required columns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, image, image_url, sort_order')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  // Fetch Categories configured with "Add Home Page Show" = true
  const { data: homeCategories } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('is_active', true)
    .eq('show_on_homepage', true)
    .order('sort_order', { ascending: true });

  // Fetch up to 4 active products for each homepage featured category
  const homeCategorySections = await Promise.all(
    (homeCategories || []).map(async (cat) => {
      const { data: subCats } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', cat.id);

      const targetCatIds = [cat.id, ...(subCats ? subCats.map((s) => s.id) : [])];

      const { data: prods } = await supabase
        .from('products')
        .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival, status')
        .in('category_id', targetCatIds)
        .eq('status', 'active')
        .limit(4);

      return {
        category: cat,
        products: prods || [],
      };
    })
  );

  // Fetch exactly 4 Crazy Deals products for clean 1-row layout
  const { data: crazyDeals } = await supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, status')
    .eq('is_crazy_deal', true)
    .eq('status', 'active')
    .limit(4);

  // Fetch exactly 4 New Arrivals products for clean 1-row layout
  const { data: newArrivals } = await supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_new_arrival, status')
    .eq('is_new_arrival', true)
    .eq('status', 'active')
    .limit(4);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, title, comment, created_at')
    .eq('status', 'approved')
    .limit(3);

  return (
    <div>
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Shop By Category (Main Categories Only) */}
      <CategoryGrid categories={categories || []} />

      {/* 3. Crazy Deals Flash Sale Banner & 4 Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <DealCountdown />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {crazyDeals?.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 4. Promotional Banner Strip */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-56 sm:h-60 rounded-2xl overflow-hidden bg-gradient-to-r from-[#a63b7e] to-purple-900 text-white p-6 flex flex-col justify-between shadow-md">
            <div>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                Kids Fashion
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-serif mt-2">Organic Cotton Rompers & Frocks</h3>
              <p className="text-xs text-pink-100 mt-1 max-w-xs">Softest breathable fabric for active babies & toddlers.</p>
            </div>
            <Link
              href="/categories/kids"
              className="self-start bg-white text-[#a63b7e] hover:bg-gray-100 px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Shop Kids Wear
            </Link>
          </div>

          <div className="relative h-56 sm:h-60 rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 flex flex-col justify-between shadow-md">
            <div>
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                Activewear Tech
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-serif mt-2">Slake Gym & Yoga T-Shirts</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">Moisture-wicking athletic tees & shorts for summer training.</p>
            </div>
            <Link
              href="/categories/activewear"
              className="self-start bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              Shop Activewear
            </Link>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Section (4 Products Grid) */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-100 text-[#a63b7e] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-serif">
                New Arrivals
              </h2>
              <p className="text-xs text-gray-500">Fresh Pakistani summer casual releases</p>
            </div>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="text-xs font-bold text-[#a63b7e] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {newArrivals?.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 6. Dynamic Admin-Controlled Homepage Category Sections ("Add Home Page Show") */}
      {homeCategorySections.map(({ category: cat, products: catProducts }) => {
        if (!catProducts || catProducts.length === 0) return null;

        return (
          <section key={cat.id} className="max-w-7xl mx-auto px-4 py-6 md:py-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <FolderTree className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 font-serif">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {cat.description || `Explore top quality ${cat.name.toLowerCase()} collection`}
                  </p>
                </div>
              </div>
              <Link
                href={`/categories/${cat.slug}`}
                className="text-xs font-bold text-[#a63b7e] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {catProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </section>
        );
      })}

      {/* 7. Customer Testimonials */}
      <ReviewsSection reviews={reviews as any || []} />
    </div>
  );
}
