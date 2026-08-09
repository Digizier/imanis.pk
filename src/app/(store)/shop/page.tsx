import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';

export const revalidate = false; // Pure static Edge CDN caching (Zero background reval writes, On-Demand revalidated via Admin Panel)

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    gender?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, collection, gender, sort } = params;

  let query = supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival, category_id, gender')
    .eq('status', 'active');

  if (category) {
    const { data: catData } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (catData) query = query.eq('category_id', catData.id);
  }

  if (gender) {
    query = query.eq('gender', gender);
  }

  if (sort === 'price-low') {
    query = query.order('sale_price', { ascending: true });
  } else if (sort === 'price-high') {
    query = query.order('sale_price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query;
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <nav className="text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:underline">Home</Link> / <span className="text-gray-900 font-semibold">Shop All Products</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif">
          Shop All Clothing & Apparel
        </h1>
        <p className="text-xs text-gray-500 mt-1">Showing {products?.length || 0} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Categories</h3>
            <div className="space-y-1 text-xs">
              <Link
                href="/shop"
                className={`block px-3 py-1.5 rounded-lg transition ${
                  !category ? 'bg-[#a63b7e] text-white font-bold' : 'text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                All Categories
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`block px-3 py-1.5 rounded-lg transition ${
                    category === cat.slug ? 'bg-[#a63b7e] text-white font-bold' : 'text-gray-700 hover:bg-gray-200/60'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Gender Filter</h3>
            <div className="space-y-1 text-xs">
              {['Men', 'Women', 'Kids', 'Unisex'].map((g) => (
                <Link
                  key={g}
                  href={`/shop?gender=${g}`}
                  className={`block px-3 py-1.5 rounded-lg transition ${
                    gender === g ? 'bg-[#a63b7e] text-white font-bold' : 'text-gray-700 hover:bg-gray-200/60'
                  }`}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid & Sorting */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl text-xs">
            <span className="font-medium text-gray-700">Sort By:</span>
            <div className="flex gap-2">
              <Link
                href={`/shop?sort=newest`}
                className={`px-3 py-1 rounded-lg transition ${
                  !sort || sort === 'newest' ? 'bg-[#a63b7e] text-white font-bold' : 'bg-white text-gray-700 border'
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/shop?sort=price-low`}
                className={`px-3 py-1 rounded-lg transition ${
                  sort === 'price-low' ? 'bg-[#a63b7e] text-white font-bold' : 'bg-white text-gray-700 border'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/shop?sort=price-high`}
                className={`px-3 py-1 rounded-lg transition ${
                  sort === 'price-high' ? 'bg-[#a63b7e] text-white font-bold' : 'bg-white text-gray-700 border'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No products found matching the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
