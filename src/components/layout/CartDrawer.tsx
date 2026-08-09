'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { validateCouponCode, fetchPublicCoupons } from '@/lib/coupons/couponService';
import { CouponItem } from '@/app/admin/coupons/page';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    discountAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<CouponItem[]>([]);

  const subtotal = getSubtotal();
  const freeShippingThreshold = 2999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountLeftForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Fetch Public Coupons when Cart Drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchPublicCoupons().then(setPublicCoupons);
    }
  }, [isOpen]);

  const handleApplyCoupon = async (e: React.FormEvent, codeToApply?: string) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const targetCode = codeToApply || inputCoupon;
    if (!targetCode) return;

    setIsApplying(true);
    const result = await validateCouponCode(targetCode, subtotal);
    setIsApplying(false);

    if (result.success && result.code && result.discountAmount !== undefined) {
      applyCoupon(result.code, result.discountAmount);
      setCouponSuccess(result.message);
      setInputCoupon('');
    } else {
      setCouponError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#a63b7e]" />
              <h2 className="font-serif font-extrabold text-gray-900 text-lg">Your Shopping Bag</h2>
              <span className="bg-[#a63b7e] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="bg-pink-50/70 p-3 px-6 border-b border-pink-100 text-xs font-medium text-gray-800">
            {amountLeftForFreeShipping > 0 ? (
              <p>
                Add <span className="font-bold text-[#a63b7e]">Rs. {amountLeftForFreeShipping.toLocaleString()}</span> more for <span className="font-black text-green-700">FREE SHIPPING</span>
              </p>
            ) : (
              <p className="text-green-700 font-bold flex items-center gap-1">
                🎉 Congratulations! You unlocked FREE SHIPPING across Pakistan!
              </p>
            )}
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-[#a63b7e] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-[#a63b7e]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-base">Your shopping bag is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Explore our latest Pakistani fashion collections, crazy deals, and activewear.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="bg-[#a63b7e] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#872b64] transition"
                >
                  Start Shopping Now
                </Link>
              </div>
            ) : (
              items.map((item, idx) => {
                const itemPrice = item.variant?.sale_price || item.variant?.price || item.product.sale_price || item.product.regular_price;
                const originalPrice = item.product.compare_at_price || item.product.regular_price;
                const itemId = item.id || `${item.product.id}-${item.selectedSize || 'default'}`;

                return (
                  <div
                    key={itemId || idx}
                    className="flex gap-3 p-3 bg-gray-50/80 border border-gray-100 rounded-2xl relative group"
                  >
                    <div className="relative w-20 h-24 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <Image
                        src={item.product.main_image}
                        alt={item.product.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex justify-between items-start pr-6">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-bold text-gray-900 line-clamp-1 hover:text-[#a63b7e]"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        {(item.selectedSize || item.selectedColor || item.variant) && (
                          <span className="text-[11px] text-gray-500 block mt-0.5 font-bold">
                            Size: {item.selectedSize || item.variant?.size || 'Standard'} {item.selectedColor ? `/ ${item.selectedColor}` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-200/60">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-l-lg text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-extrabold text-gray-900 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-r-lg text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-gray-900 text-sm block">
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                          {originalPrice > itemPrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              Rs. {(originalPrice * item.quantity).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(itemId)}
                      className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-red-600 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 md:p-6 bg-white border-t border-gray-100 space-y-3">
              {/* Dynamic Public Offers Section (Only rendered if public coupons exist) */}
              {publicCoupons.length > 0 && !couponCode && (
                <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#a63b7e]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Available Public Offers:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {publicCoupons.map((c) => (
                      <button
                        key={c.id}
                        onClick={(e) => handleApplyCoupon(e, c.code)}
                        className="bg-white hover:bg-pink-100 border border-pink-200 text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-2xs transition flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-[#a63b7e]" />
                        <span>{c.code}</span>
                        <span className="text-gray-500 font-normal">
                          ({c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `Rs. ${c.discount_value} OFF`})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupon Input Form */}
              <form onSubmit={(e) => handleApplyCoupon(e)} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount / Promo Code"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs uppercase font-mono border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition shrink-0"
                >
                  {isApplying ? 'Checking...' : 'Apply'}
                </button>
              </form>

              {couponError && <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-green-700 font-semibold">{couponSuccess}</p>}

              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-green-50 p-2.5 rounded-xl border border-green-200 text-green-800 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button onClick={() => { removeCoupon(); setCouponSuccess(''); setCouponError(''); }} className="text-xs text-red-600 hover:underline font-bold">
                    Remove
                  </button>
                </div>
              )}

              {/* Subtotal & Totals */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Coupon Discount:</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping:</span>
                  <span className="font-bold text-gray-900">
                    {subtotal >= freeShippingThreshold ? 'FREE' : 'Rs. 200'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total:</span>
                  <span className="text-[#a63b7e]">
                    Rs. {(getTotal() + (subtotal >= freeShippingThreshold ? 0 : 200)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-pink-200 transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center"
                >
                  View Full Cart Page
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Safe & Secure Pakistani Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
