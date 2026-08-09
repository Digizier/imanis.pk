import React from 'react';
import { supabase } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './ProductDetailClient';

export const revalidate = false; // Pure static Edge CDN caching (Zero background reval writes, On-Demand revalidated via Admin Panel)

// Pre-render top active product slugs statically on Vercel Edge CDN
export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active')
    .limit(20);

  return (products || []).map((p) => ({
    slug: p.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Query product details
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch category info separately if present
  if (product.category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', product.category_id)
      .single();
    if (category) product.category = category as any;
  }

  // Fetch product variants separately
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, product_id, size, color, sku, price, sale_price, stock, is_active')
    .eq('product_id', product.id)
    .eq('is_active', true);

  product.variants = (variants as any) || [];

  // Fetch related products (lightweight selection)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival')
    .eq('status', 'active')
    .neq('id', product.id)
    .limit(4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={(relatedProducts as any) || []}
    />
  );
}
