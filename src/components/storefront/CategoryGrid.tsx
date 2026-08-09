'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  const categoryImages: Record<string, string> = {
    men: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80',
    women: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    kids: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80',
    activewear: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    accessories: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
  };

  // Strictly filter main categories only (no sub-categories in homepage grid)
  const mainCategoriesOnly = categories.filter((cat) => !cat.parent_id);

  return (
    <section className="py-8 md:py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8">
          <div>
            <span className="text-xs font-bold text-[#a63b7e] uppercase tracking-widest block mb-1">
              Top Categories
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif tracking-tight">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-[#a63b7e] hover:underline mt-2 md:mt-0 flex items-center gap-1"
          >
            View All Categories →
          </Link>
        </div>

        {/* Responsive Main Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {mainCategoriesOnly.map((cat) => {
            const img = cat.image_url || categoryImages[cat.slug] || categoryImages.men;

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative aspect-4/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-200"
              >
                <Image
                  src={img}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-gray-300 font-medium block mt-0.5">
                    Explore Collection
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
