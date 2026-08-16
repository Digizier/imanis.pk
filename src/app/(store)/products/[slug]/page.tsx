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

  // Fetch category info and target category hierarchy (parent + child sub-categories)
  const targetCategoryIds: string[] = [];
  if (product.category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('id', product.category_id)
      .single();

    if (category) {
      product.category = category as any;
      targetCategoryIds.push(category.id);

      if (category.parent_id) {
        // Sub-category: Include parent category and sibling sub-categories
        targetCategoryIds.push(category.parent_id);
        const { data: siblingCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.parent_id)
          .eq('is_active', true);
        if (siblingCategories) {
          siblingCategories.forEach((s) => {
            if (!targetCategoryIds.includes(s.id)) targetCategoryIds.push(s.id);
          });
        }
      } else {
        // Parent category: Include all child sub-categories
        const { data: childCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.id)
          .eq('is_active', true);
        if (childCategories) {
          childCategories.forEach((c) => {
            if (!targetCategoryIds.includes(c.id)) targetCategoryIds.push(c.id);
          });
        }
      }
    }
  }

  // Fetch product variants separately
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, product_id, size, color, sku, price, sale_price, stock, is_active')
    .eq('product_id', product.id)
    .eq('is_active', true);

  product.variants = (variants as any) || [];

  // Fetch dynamic, category-relevant related products (NEWEST FIRST)
  let relatedProducts: any[] = [];

  if (targetCategoryIds.length > 0) {
    const { data: catProducts } = await supabase
      .from('products')
      .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival')
      .in('category_id', targetCategoryIds)
      .eq('status', 'active')
      .neq('id', product.id)
      .order('created_at', { ascending: false })
      .limit(4);

    if (catProducts && catProducts.length > 0) {
      relatedProducts = [...catProducts];
    }
  }

  // Fallback: If fewer than 4 products in same category, fill remaining with newest active products
  if (relatedProducts.length < 4) {
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select('id, name, slug, main_image, regular_price, sale_price, compare_at_price, is_crazy_deal, is_new_arrival')
      .eq('status', 'active')
      .neq('id', product.id)
      .order('created_at', { ascending: false })
      .limit(8);

    if (fallbackProducts) {
      const existingIds = new Set(relatedProducts.map((p) => p.id));
      for (const item of fallbackProducts) {
        if (!existingIds.has(item.id) && relatedProducts.length < 4) {
          relatedProducts.push(item);
          existingIds.add(item.id);
        }
      }
    }
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
