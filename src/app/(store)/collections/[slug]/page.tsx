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
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single();

  if (!collection) {
    notFound();
  }

  // Fetch items matching collection flags with targeted columns
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

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </div>
  );
}
