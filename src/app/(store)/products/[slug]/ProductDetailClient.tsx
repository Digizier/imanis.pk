'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Ruler, CheckCircle2, MessageCircle, ChevronRight, X } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { ProductCard } from '@/components/storefront/ProductCard';
import { getProductReviewData } from '@/lib/reviews';
import { trackMetaEvent } from '@/components/analytics/MetaPixel';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product, relatedProducts }) => {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  // Gallery Images
  const gallery = product.gallery_images && product.gallery_images.length > 0
    ? [product.main_image, ...product.gallery_images]
    : [product.main_image];

  const [activeImage, setActiveImage] = useState<string>(gallery[0] || product.main_image);

  // Extract unique active sizes & colors from variants
  const activeVariants = product.variants && product.variants.length > 0
    ? product.variants.filter(v => v.is_active !== false)
    : [];

  // Structured Size Guide Parser supporting new JSON { enabled, headers, rows } and legacy string format
  const sizeGuideInfo = React.useMemo(() => {
    if (!product.size_guide) {
      return { hasGuide: false, headers: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [] as Array<{ col0: string; col1: string; col2: string; col3: string }> };
    }

    try {
      const parsed = JSON.parse(product.size_guide);
      if (parsed && typeof parsed === 'object') {
        if (parsed.enabled === false) {
          return { hasGuide: false, headers: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [] as Array<{ col0: string; col1: string; col2: string; col3: string }> };
        }
        const headers = (Array.isArray(parsed.headers) && parsed.headers.length >= 4)
          ? parsed.headers
          : ['Size', 'Chest', 'Length', 'Shoulder'];
        const rows = Array.isArray(parsed.rows) ? parsed.rows : [];
        return {
          hasGuide: rows.length > 0,
          headers,
          rows: rows as Array<{ col0: string; col1: string; col2: string; col3: string }>,
        };
      }
    } catch {
      // Legacy text format parser (e.g. S: Chest 38", Length 27", Shoulder 17")
      const lines = product.size_guide.split('\n');
      const legacyRows: Array<{ col0: string; col1: string; col2: string; col3: string }> = [];
      lines.forEach((line) => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const size = parts[0].trim();
          const details = parts[1];
          const chestMatch = details.match(/Chest\s*([^,]+)/i);
          const lengthMatch = details.match(/Length\s*([^,]+)/i);
          const shoulderMatch = details.match(/Shoulder\s*([^,]+)/i);
          legacyRows.push({
            col0: size || 'M',
            col1: chestMatch ? chestMatch[1].trim() : '-',
            col2: lengthMatch ? lengthMatch[1].trim() : '-',
            col3: shoulderMatch ? shoulderMatch[1].trim() : '-',
          });
        }
      });
      return {
        hasGuide: legacyRows.length > 0,
        headers: ['Size', 'Chest', 'Length', 'Shoulder'],
        rows: legacyRows,
      };
    }

    return { hasGuide: false, headers: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [] as Array<{ col0: string; col1: string; col2: string; col3: string }> };
  }, [product.size_guide]);

  // Extract exact sizes created for this product
  const availableSizes = Array.from(new Set(activeVariants.map(v => v.size).filter((s): s is string => Boolean(s))));

  // Render ONLY the exact sizes created for this product in variants or size guide
  const sizeGuideSizes = sizeGuideInfo.rows.map(r => r.col0).filter(Boolean);
  const sizesToRender = availableSizes.length > 0 
    ? availableSizes 
    : (sizeGuideSizes.length > 0 ? sizeGuideSizes : ['S', 'M', 'L']);

  const [selectedSize, setSelectedSize] = useState<string>(sizesToRender[0] || 'M');

  // Filter active variants for the currently selected size
  const variantsForSelectedSize = React.useMemo(() => {
    const matched = activeVariants.filter(
      v => v.size === selectedSize || (!v.size && !selectedSize)
    );
    return matched.length > 0 ? matched : activeVariants;
  }, [activeVariants, selectedSize]);

  // Extract unique colors ONLY for the currently selected size (splitting comma-separated colors if any)
  const availableColorsForSelectedSize = React.useMemo(() => {
    const rawColors = variantsForSelectedSize.flatMap(v => {
      if (!v.color) return [];
      return v.color.split(',').map(c => c.trim()).filter(Boolean);
    });
    return Array.from(new Set(rawColors));
  }, [variantsForSelectedSize]);

  const [selectedColor, setSelectedColor] = useState<string>(availableColorsForSelectedSize[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Auto-sync selectedColor when selectedSize changes
  React.useEffect(() => {
    if (availableColorsForSelectedSize.length > 0) {
      if (!availableColorsForSelectedSize.includes(selectedColor)) {
        setSelectedColor(availableColorsForSelectedSize[0]);
      }
    } else {
      setSelectedColor('');
    }
  }, [selectedSize, availableColorsForSelectedSize]);

  // Find currently selected variant to extract exact price & stock
  const currentVariant = activeVariants.find(
    v => (v.size === selectedSize || !v.size) && 
         (v.color === selectedColor || (v.color && v.color.includes(selectedColor)) || !selectedColor || !v.color)
  ) || variantsForSelectedSize[0] || activeVariants[0];

  // Dynamic Price calculation based on selected variant
  const displaySalePrice = (currentVariant && typeof currentVariant.sale_price === 'number' && currentVariant.sale_price > 0)
    ? currentVariant.sale_price
    : (product.sale_price ?? product.regular_price);

  const displayRegularPrice = (currentVariant && typeof currentVariant.price === 'number' && currentVariant.price > 0)
    ? currentVariant.price
    : (product.compare_at_price ?? product.regular_price);

  const displayStock = currentVariant ? currentVariant.stock : product.total_stock;

  const discountPercent = displayRegularPrice > displaySalePrice
    ? Math.round(((displayRegularPrice - displaySalePrice) / displayRegularPrice) * 100)
    : 0;

  // Track Meta Pixel ViewContent Event on PDP load
  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.sku || product.id],
      content_type: 'product',
      value: displaySalePrice,
      currency: 'PKR',
    });
  }, [product.id, product.name, product.sku, displaySalePrice]);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor, currentVariant);
    
    // Track Meta Pixel AddToCart Event
    trackMetaEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.sku || product.id],
      content_type: 'product',
      value: displaySalePrice * quantity,
      currency: 'PKR',
      num_items: quantity,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum Imani's! I want to order:\n` +
    `Product: ${product.name}\n` +
    `Size: ${selectedSize}\n` +
    `Color: ${selectedColor || 'Standard'}\n` +
    `Price: Rs. ${displaySalePrice}\n` +
    `Link: ${typeof window !== 'undefined' ? window.location.href : ''}`
  );

  return (
    <div className="bg-gray-50/50 min-h-screen pb-12 md:pb-16">
      {/* Mobile-Optimized Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 py-2 text-[11px] text-gray-500 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-[#a63b7e]">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
          <Link href="/shop" className="hover:text-[#a63b7e]">Products</Link>
          <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
          <span className="text-gray-900 font-bold truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-12">

          {/* Left Column: Gallery & Images */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-3 md:gap-4">
            {/* Main Featured Image */}
            <div className="relative aspect-[4/5] sm:aspect-square w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-xs">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top transition-all duration-300"
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                  SAVE {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {gallery.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 pb-1 md:pb-0 [scrollbar-width:none]">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-14 h-18 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img ? 'border-[#a63b7e] ring-2 ring-pink-200 scale-105' : 'border-gray-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Buying Options & Product Details */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-[#a63b7e] tracking-widest uppercase block mb-1">
                {product.brand || "Imani's Collection"}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 font-serif leading-tight">
                {product.name}
              </h1>

              {(() => {
                const { rating, reviewCount } = getProductReviewData(product);
                return (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="font-bold text-gray-700 text-[11px] sm:text-xs">
                      {rating.toFixed(1)} ({reviewCount} Customer Reviews)
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Dynamic Price Display Card */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-pink-50/80 via-purple-50/30 to-white rounded-2xl border border-pink-100 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Offer Price</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Rs. {displaySalePrice.toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                {displayRegularPrice > displaySalePrice && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through block font-medium">
                    Rs. {displayRegularPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="inline-block bg-red-100 text-red-700 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg mt-0.5">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Size Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                  Select Size
                </label>
                {sizeGuideInfo.hasGuide && (
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] sm:text-xs font-bold text-[#a63b7e] hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size Guide
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {sizesToRender.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[44px] h-10 px-3.5 rounded-xl font-extrabold text-xs border transition-all flex items-center justify-center active:scale-95 ${
                        isSelected
                          ? 'bg-[#a63b7e] text-white border-[#a63b7e] shadow-md ring-2 ring-pink-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Color Selection strictly per selected size */}
            {availableColorsForSelectedSize.length > 0 && !(availableColorsForSelectedSize.length === 1 && availableColorsForSelectedSize[0].toLowerCase() === 'standard') && (
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                  Select Color: <span className="text-[#a63b7e] font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColorsForSelectedSize.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                        selectedColor === col
                          ? 'bg-gray-900 text-white border-gray-900 shadow-xs ring-2 ring-gray-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Indicator */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <label className="text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 text-gray-600 font-bold hover:bg-gray-100 rounded-l-xl active:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-extrabold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 text-gray-600 font-bold hover:bg-gray-100 rounded-r-xl active:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                {displayStock > 0 ? (
                  <span className="text-green-700 font-bold text-xs flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> In Stock ({displayStock} left)
                  </span>
                ) : (
                  <span className="text-red-600 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-200/60">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart & Buy Actions (Touch-friendly Equal Height Buttons) */}
            <div className="space-y-2.5 pt-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-pink-200/80 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" /> Add to Shopping Bag
              </button>

              <a
                href={`https://wa.me/923121222333?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98"
              >
                <MessageCircle className="w-4 h-4" /> Order via WhatsApp Direct
              </a>

              <button
                onClick={() => toggleWishlist(product)}
                className="w-full border border-gray-200 hover:bg-gray-50 py-3 rounded-2xl font-bold text-xs text-gray-700 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Added Toast Notification */}
            {addedToast && (
              <div className="p-3 bg-green-900 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-xl animate-bounce">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Added to cart!</span>
                </div>
                <Link href="/cart" className="underline font-black text-amber-300">View Cart</Link>
              </div>
            )}

            {/* Trust Perks */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#a63b7e]" />
                <span>Nationwide Pakistan Delivery (3–5 Working Days)</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#a63b7e]" />
                <span>7-Day Hassle-Free Return & Exchange Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a63b7e]" />
                <span>100% Genuine Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 font-serif mb-4 sm:mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal (Matching exact Image 1 design with dynamic column headers) */}
      {showSizeGuide && sizeGuideInfo.hasGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4 text-xs">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">Imani's Size Guide</h3>
              <p className="text-gray-500 mt-0.5 text-[11px]">Measurements in inches. Standard Pakistani fitting.</p>
            </div>

            {/* Clean HTML Table with Dynamic Column Headers & Rows */}
            <div className="overflow-hidden border border-gray-200 rounded-2xl">
              <table className="w-full text-center text-xs">
                <thead className="bg-gray-50 text-gray-700 font-extrabold border-b border-gray-200">
                  <tr>
                    {sizeGuideInfo.headers.map((header: string, idx: number) => (
                      <th
                        key={idx}
                        className={`py-2.5 px-3 ${idx < sizeGuideInfo.headers.length - 1 ? 'border-r border-gray-200' : ''}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                  {sizeGuideInfo.rows.map((row: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="py-2.5 px-3 font-black text-gray-900 border-r border-gray-200">{row.col0 || row.size || '-'}</td>
                      <td className="py-2.5 px-3 border-r border-gray-200">{row.col1 || row.chest || '-'}</td>
                      <td className="py-2.5 px-3 border-r border-gray-200">{row.col2 || row.length || '-'}</td>
                      <td className="py-2.5 px-3">{row.col3 || row.shoulder || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3 rounded-2xl font-extrabold text-xs shadow-lg transition"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
