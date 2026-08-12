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
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, collection, gender, sort, page: rawPage } = params;
  const currentPage = Math.max(1, parseInt(rawPage || '1', 10) || 1);
  const pageSize = 8;
  const offset = (currentPage - 1) * pageSize;

  let countQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  let query = supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival, category_id, gender')
    .eq('status', 'active');

  if (category) {
    const { data: catData } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (catData) {
      query = query.eq('category_id', catData.id);
      countQuery = countQuery.eq('category_id', catData.id);
    }
  }

  if (gender) {
    query = query.eq('gender', gender);
    countQuery = countQuery.eq('gender', gender);
  }

  if (sort === 'price-low') {
    query = query.order('sale_price', { ascending: true });
  } else if (sort === 'price-high') {
    query = query.order('sale_price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { count: totalProductsCount } = await countQuery;
  const totalCount = totalProductsCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const { data: products } = await query.range(offset, offset + pageSize - 1);
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true);

  const getFilterUrl = (newParams: Record<string, string | undefined>) => {
    const current = new URLSearchParams();
    if (category) current.set('category', category);
    if (gender) current.set('gender', gender);
    if (sort) current.set('sort', sort);
    
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) current.set(k, v);
      else current.delete(k);
    });

    const queryString = current.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

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
        <p className="text-xs text-gray-500 mt-1">Showing {totalCount} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">Categories</h3>
            <div className="space-y-1 text-xs">
              <Link
                href={getFilterUrl({ category: undefined, page: undefined })}
                className={`block px-3 py-1.5 rounded-lg transition ${
                  !category ? 'bg-[#a63b7e] text-white font-bold' : 'text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                All Categories
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={getFilterUrl({ category: cat.slug, page: undefined })}
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
                  href={getFilterUrl({ gender: gender === g ? undefined : g, page: undefined })}
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
                href={getFilterUrl({ sort: 'newest', page: undefined })}
                className={`px-3 py-1 rounded-lg transition ${
                  !sort || sort === 'newest' ? 'bg-[#a63b7e] text-white font-bold' : 'bg-white text-gray-700 border'
                }`}
              >
                Newest
              </Link>
              <Link
                href={getFilterUrl({ sort: 'price-low', page: undefined })}
                className={`px-3 py-1 rounded-lg transition ${
                  sort === 'price-low' ? 'bg-[#a63b7e] text-white font-bold' : 'bg-white text-gray-700 border'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={getFilterUrl({ sort: 'price-high', page: undefined })}
                className={`px-3 py-1 rounded-lg transition ${
                  sort === 'price-high' ? 'bg-[#a63b7e] text-white font-bold' : 'bg-white text-gray-700 border'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>

          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {/* Pagination Controls (8 Products Per Page Limit) */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
                  <p className="text-xs text-gray-500 font-medium">
                    Showing <strong className="text-gray-900">{offset + 1}</strong> – <strong className="text-gray-900">{Math.min(offset + pageSize, totalCount)}</strong> of <strong className="text-gray-900">{totalCount}</strong> products
                  </p>

                  <div className="flex items-center gap-1.5 text-xs">
                    <Link
                      href={currentPage > 1 ? getFilterUrl({ page: (currentPage - 1).toString() }) : '#'}
                      aria-disabled={currentPage <= 1}
                      className={`px-3.5 py-2 rounded-xl font-bold transition border ${
                        currentPage <= 1
                          ? 'pointer-events-none opacity-40 bg-gray-50 text-gray-400 border-gray-200'
                          : 'bg-white text-gray-700 hover:bg-[#a63b7e] hover:text-white border-gray-300 shadow-2xs'
                      }`}
                    >
                      ← Prev
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <Link
                        key={pNum}
                        href={getFilterUrl({ page: pNum.toString() })}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl font-extrabold transition ${
                          pNum === currentPage
                            ? 'bg-[#a63b7e] text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                        }`}
                      >
                        {pNum}
                      </Link>
                    ))}

                    <Link
                      href={currentPage < totalPages ? getFilterUrl({ page: (currentPage + 1).toString() }) : '#'}
                      aria-disabled={currentPage >= totalPages}
                      className={`px-3.5 py-2 rounded-xl font-bold transition border ${
                        currentPage >= totalPages
                          ? 'pointer-events-none opacity-40 bg-gray-50 text-gray-400 border-gray-200'
                          : 'bg-white text-gray-700 hover:bg-[#a63b7e] hover:text-white border-gray-300 shadow-2xs'
                      }`}
                    >
                      Next →
                    </Link>
                  </div>
                </div>
              )}
            </>
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
