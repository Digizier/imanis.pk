import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FolderTree } from 'lucide-react';

export const revalidate = false; // Pure static Edge CDN caching (Zero background reval writes, On-Demand revalidated via Admin Panel)

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true);

  return (categories || []).map((c) => ({
    slug: c.slug,
  }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const currentPage = Math.max(1, parseInt(rawPage || '1', 10) || 1);
  const pageSize = 8;
  const offset = (currentPage - 1) * pageSize;

  // 1. Fetch current Category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single();

  if (!category) {
    notFound();
  }

  // 2. Fetch all Sub-Categories if this is a Parent Category
  const { data: subCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('parent_id', category.id)
    .eq('is_active', true);

  const subCategoryIds = subCategories ? subCategories.map((s) => s.id) : [];
  const targetCategoryIds = [category.id, ...subCategoryIds];

  // 3. Count total active products for exact pagination
  const { count: totalProductsCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .in('category_id', targetCategoryIds)
    .eq('status', 'active');

  const totalCount = totalProductsCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // 4. Fetch Products for Category + all its Sub-Categories (8 per page, NEWEST FIRST)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival')
    .in('category_id', targetCategoryIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Header */}
      <div className="mb-6">
        <nav className="text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop" className="hover:underline font-bold">Categories</Link> / <span className="text-gray-900 font-extrabold">{category.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif">
              {category.name} Collection
            </h1>
            {category.description && (
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">{category.description}</p>
            )}
          </div>

          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
            {totalCount} Products Available
          </span>
        </div>

        {/* Sub-Category Pills Filter Bar */}
        {subCategories && subCategories.length > 0 && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
              <FolderTree className="w-3.5 h-3.5 text-[#a63b7e]" /> Sub-Categories:
            </span>
            <Link
              href={`/categories/${category.slug}`}
              className="px-3.5 py-1.5 rounded-full font-extrabold bg-[#a63b7e] text-white shadow-xs shrink-0"
            >
              All {category.name}
            </Link>
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="px-3.5 py-1.5 rounded-full font-bold bg-white text-gray-700 hover:text-[#a63b7e] border border-gray-200 hover:border-gray-400 shrink-0 transition"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Product Card Grid */}
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
                Showing <strong className="text-gray-900">{offset + 1}</strong> – <strong className="text-gray-900">{Math.min(offset + pageSize, totalCount)}</strong> of <strong className="text-gray-900">{totalCount}</strong> products
              </p>

              <div className="flex items-center gap-1.5 text-xs">
                <Link
                  href={currentPage > 1 ? `/categories/${category.slug}?page=${currentPage - 1}` : '#'}
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
                    href={`/categories/${category.slug}?page=${pNum}`}
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
                  href={currentPage < totalPages ? `/categories/${category.slug}?page=${currentPage + 1}` : '#'}
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
          <p className="font-bold text-gray-800">No active products found in {category.name} yet.</p>
          <Link href="/shop" className="inline-block bg-[#a63b7e] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
            Explore All Store Products
          </Link>
        </div>
      )}
    </div>
  );
}
