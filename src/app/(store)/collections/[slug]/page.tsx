import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = false; // Pure static Edge CDN caching (Zero background reval writes, On-Demand revalidated via Admin Panel)

export async function generateStaticParams() {
  return [
    { slug: 'crazy-deals' },
    { slug: 'new-arrivals' },
    { slug: 'bundle-offers' },
    { slug: 'clearance' },
  ];
}

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const currentPage = Math.max(1, parseInt(rawPage || '1', 10) || 1);
  const pageSize = 8;
  const offset = (currentPage - 1) * pageSize;

  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single();

  if (!collection) {
    notFound();
  }

  // Count total products matching collection filter
  let countQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  if (slug === 'crazy-deals') {
    countQuery = countQuery.eq('is_crazy_deal', true);
  } else if (slug === 'new-arrivals') {
    countQuery = countQuery.eq('is_new_arrival', true);
  } else if (slug === 'clearance') {
    countQuery = countQuery.eq('is_clearance', true);
  } else if (slug === 'bundle-offers') {
    countQuery = countQuery.eq('is_bundle_offer', true);
  }

  const { count: totalCount } = await countQuery;
  const totalItems = totalCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Fetch items matching collection flags (8 per page, NEWEST FIRST)
  let query = supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival, is_clearance, is_bundle_offer')
    .eq('status', 'active');

  if (slug === 'crazy-deals') {
    query = query.eq('is_crazy_deal', true);
  } else if (slug === 'new-arrivals') {
    query = query.eq('is_new_arrival', true);
  } else if (slug === 'clearance') {
    query = query.eq('is_clearance', true);
  } else if (slug === 'bundle-offers') {
    query = query.eq('is_bundle_offer', true);
  }

  const { data: products } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="text-xs text-gray-500 mb-2">
            <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop" className="hover:underline">Collections</Link> / <span className="text-gray-900 font-semibold">{collection.name}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">{collection.description}</p>
          )}
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
          {totalItems} Products Available
        </span>
      </div>

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>

          {/* Pagination Controls (8 Products Per Page Limit) */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
              <p className="text-xs text-gray-500 font-medium">
                Showing <strong className="text-gray-900">{offset + 1}</strong> – <strong className="text-gray-900">{Math.min(offset + pageSize, totalItems)}</strong> of <strong className="text-gray-900">{totalItems}</strong> products
              </p>

              <div className="flex items-center gap-1.5 text-xs">
                <Link
                  href={currentPage > 1 ? `/collections/${collection.slug}?page=${currentPage - 1}` : '#'}
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
                    href={`/collections/${collection.slug}?page=${pNum}`}
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
                  href={currentPage < totalPages ? `/collections/${collection.slug}?page=${currentPage + 1}` : '#'}
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
        <div className="py-16 text-center text-sm text-gray-500 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
          <p className="font-bold text-gray-800">No products in this collection yet.</p>
          <Link href="/shop" className="inline-block bg-[#a63b7e] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
            Explore All Store Products
          </Link>
        </div>
      )}
    </div>
  );
}
