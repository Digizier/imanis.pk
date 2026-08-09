'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useCartStore } from '@/lib/store/cart';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMoveToCart = (product: any) => {
    addItem(product, 1);
    removeFromWishlist(product.id);
    showToast(`"${product.name}" moved to shopping bag!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="mb-6 md:mb-8">
        <nav className="text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:underline">Home</Link> / <span className="text-gray-900 font-bold">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#a63b7e] fill-[#a63b7e]" /> My Wishlist
            </h1>
            <p className="text-xs text-gray-500 mt-1">Save your favorite Pakistani fashion items for later.</p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {items.map((product) => {
            const salePrice = product.sale_price || product.regular_price;
            const regularPrice = product.compare_at_price || product.regular_price;
            const discountPercent = regularPrice > salePrice
              ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Image Container */}
                <div className="relative aspect-3/4 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={product.main_image}
                    alt={product.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] md:text-[10px] px-2 py-0.5 rounded-md uppercase">
                      -{discountPercent}%
                    </span>
                  )}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-gray-700 hover:text-red-600 rounded-full backdrop-blur-md shadow-xs transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Container */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-[#a63b7e] font-extrabold uppercase tracking-wider block">
                      {product.brand || "Imani's"}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-bold text-gray-900 text-xs md:text-sm line-clamp-2 hover:text-[#a63b7e] transition font-serif"
                    >
                      {product.name}
                    </Link>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm md:text-base font-extrabold text-gray-900">
                      Rs. {salePrice.toLocaleString()}
                    </span>
                    {regularPrice > salePrice && (
                      <span className="text-xs text-gray-400 line-through">
                        Rs. {regularPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Move to Cart CTA */}
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 active:scale-95 mt-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-gray-50 rounded-3xl border border-gray-100 p-8">
          <div className="w-16 h-16 bg-pink-100 text-[#a63b7e] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8 fill-pink-200 text-[#a63b7e]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 font-serif">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-500 mt-1">Explore our latest Pakistani fashion collections and tap the heart icon on any product to save it here!</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#a63b7e] text-white px-6 py-3 rounded-2xl font-extrabold text-xs shadow-md hover:bg-[#872b64] transition active:scale-95"
          >
            Explore Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
