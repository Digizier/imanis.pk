'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const price = product.sale_price || product.regular_price;
  const originalPrice = product.compare_at_price || product.regular_price;

  const discountPercent = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col h-full">
      {/* Product Image Container */}
      <div className="relative aspect-3/4 w-full bg-gray-100 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="relative block w-full h-full">
          <Image
            src={product.main_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              SAVE {discountPercent}%
            </span>
          )}
          {product.is_crazy_deal && (
            <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              Crazy Deal
            </span>
          )}
          {product.is_bundle_offer && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              Bundle Offer
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-[#a63b7e] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-red-500'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

        {/* Quick Add Button on Hover (Desktop) */}
        <button
          onClick={() => addItem(product)}
          className="absolute bottom-2 left-2 right-2 bg-gray-900/90 hover:bg-[#a63b7e] text-white text-xs font-bold py-2.5 rounded-xl backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg"
        >
          <ShoppingBag className="w-4 h-4" /> Quick Add
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {product.brand}
          </span>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#a63b7e] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Star Ratings */}
          <div className="flex items-center gap-1 mt-1.5 text-amber-400">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-gray-500 ml-1">5.0 (46)</span>
          </div>
        </div>

        {/* Price & Mobile Add Action */}
        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm md:text-base font-extrabold text-gray-900">
                Rs. {price.toLocaleString()}
              </span>
              {originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addItem(product)}
            className="md:hidden p-2 bg-[#a63b7e] text-white rounded-lg active:scale-95 shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
