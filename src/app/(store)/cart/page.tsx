'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { validateCouponCode, fetchPublicCoupons } from '@/lib/coupons/couponService';
import { CouponItem } from '@/app/admin/coupons/page';

export default function FullCartPage() {
  const {
    items,
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
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 200;
  const grandTotal = getTotal() + shippingFee;

  useEffect(() => {
    fetchPublicCoupons().then(setPublicCoupons);
  }, []);

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

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-[#a63b7e]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 font-serif">Your shopping bag is empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Browse our latest Pakistani fashion collections, organic kids wear, and gym activewear.
        </p>
        <Link href="/shop" className="inline-block bg-[#a63b7e] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md">
          Explore Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/shop" className="text-xs font-bold text-gray-600 hover:text-[#a63b7e] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif mb-8">
          Shopping Cart & Order Summary
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {items.map((item, idx) => {
                    const itemPrice = item.variant?.sale_price || item.variant?.price || item.product.sale_price || item.product.regular_price;
                    const itemId = item.id || `${item.product.id}-${item.selectedSize || 'default'}`;

                    return (
                      <tr key={itemId || idx} className="hover:bg-gray-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                              <Image src={item.product.main_image} alt={item.product.name} fill className="object-cover object-top" />
                            </div>
                            <div>
                              <Link href={`/products/${item.product.slug}`} className="font-bold text-gray-900 hover:text-[#a63b7e] block">
                                {item.product.name}
                              </Link>
                              <span className="text-[11px] text-gray-500 block font-bold">
                                Size: {item.selectedSize || item.variant?.size || 'Standard'} {item.selectedColor ? `/ ${item.selectedColor}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">Rs. {itemPrice.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center border border-gray-300 rounded-xl bg-white w-fit">
                            <button onClick={() => updateQuantity(itemId, item.quantity - 1)} className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-l-xl font-bold">
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-extrabold text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(itemId, item.quantity + 1)} className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-r-xl font-bold">
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right font-extrabold text-gray-900">
                          Rs. {(itemPrice * item.quantity).toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => removeItem(itemId)} className="p-2 text-gray-400 hover:text-red-600 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-gray-900 font-serif">Order Summary</h3>

              {/* Dynamic Public Offers Banner */}
              {publicCoupons.length > 0 && !couponCode && (
                <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#a63b7e]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Available Store Discounts:</span>
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

              {/* Coupon input */}
              <form onSubmit={(e) => handleApplyCoupon(e)} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs uppercase font-mono border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
                <button type="submit" disabled={isApplying} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold shrink-0">
                  {isApplying ? 'Checking...' : 'Apply'}
                </button>
              </form>

              {couponError && <p className="text-[11px] text-red-600 font-bold">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-green-700 font-bold">{couponSuccess}</p>}

              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-green-50 p-2.5 rounded-xl border border-green-200 text-green-800 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span>Code <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button onClick={() => { removeCoupon(); setCouponSuccess(''); setCouponError(''); }} className="text-xs text-red-600 hover:underline font-bold">
                    Remove
                  </button>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Discount</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-gray-900">{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Payable</span>
                  <span className="text-[#a63b7e]">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-pink-200 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
