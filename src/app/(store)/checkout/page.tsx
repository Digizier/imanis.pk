'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cart';
import { validateCouponCode, fetchPublicCoupons } from '@/lib/coupons/couponService';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import { CouponItem } from '@/app/admin/coupons/page';
import { PaymentMethodItem } from '@/app/admin/settings/page';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowLeft,
  Lock,
  ChevronRight,
  Tag,
  Sparkles,
  Upload,
  QrCode,
  CheckCircle2,
  Building2,
  Smartphone,
  Globe
} from 'lucide-react';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa (KPK)',
  'Balochistan',
  'Islamabad Capital Territory (ICT)',
  'Azad Jammu & Kashmir (AJK)',
  'Gilgit-Baltistan (GB)',
];

const MAJOR_CITIES: Record<string, string[]> = {
  'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Gujrat', 'Sheikhupura'],
  'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 'Thatta'],
  'Khyber Pakhtunkhwa (KPK)': ['Peshawar', 'Mardan', 'Abbottabad', 'Mingora', 'Kohat', 'Swabi', 'Dera Ismail Khan'],
  'Balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman', 'Sibi'],
  'Islamabad Capital Territory (ICT)': ['Islamabad'],
  'Azad Jammu & Kashmir (AJK)': ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli'],
  'Gilgit-Baltistan (GB)': ['Gilgit', 'Skardu', 'Hunza'],
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, discountAmount, couponCode, applyCoupon, removeCoupon, clearCart } = useCartStore();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    email: '',
    province: 'Punjab',
    city: 'Lahore',
    address: '',
    landmark: '',
    notes: '',
  });

  // Dynamic Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Coupon State
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<CouponItem[]>([]);

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 2999 ? 0 : 200;
  const grandTotal = subtotal - discountAmount + shippingFee;

  useEffect(() => {
    fetchPublicCoupons().then(setPublicCoupons);

    // Fetch Active Payment Methods from Supabase
    const fetchMethods = async () => {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (data && data.length > 0) {
        setPaymentMethods(data as PaymentMethodItem[]);
        setSelectedMethodId(data[0].id);
      }
    };
    fetchMethods();
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];

  const handleProvinceChange = (prov: string) => {
    const defaultCity = MAJOR_CITIES[prov]?.[0] || 'Islamabad';
    setForm({ ...form, province: prov, city: defaultCity });
  };

  const handleApplyCoupon = async (e?: React.FormEvent, codeToApply?: string) => {
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) {
      setErrorMsg('Please fill in your Full Name, Mobile Phone, and Delivery Address.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let receiptUrl: string | null = null;
      if (receiptFile) {
        setIsUploadingReceipt(true);
        receiptUrl = await uploadImageToSupabase(receiptFile, 'receipts');
        setIsUploadingReceipt(false);
      }

      const orderNumber = `IMP-${Math.floor(100000 + Math.random() * 900000)}`;
      const isOnlinePayment = selectedMethod?.type !== 'cod';
      const initialPaymentStatus = isOnlinePayment ? 'Under Payment Verification' : 'pending';
      const initialOrderStatus = isOnlinePayment ? 'Under Payment Verification' : 'pending';

      // Insert Order into Supabase
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: form.fullName,
          customer_phone: form.phone,
          customer_email: form.email || null,
          province: form.province,
          city: form.city,
          full_address: `${form.address}${form.landmark ? ` (Near ${form.landmark})` : ''}`,
          order_notes: form.notes || null,
          subtotal,
          shipping_fee: shippingFee,
          discount_amount: discountAmount || 0,
          total_amount: grandTotal,
          payment_method: selectedMethod?.display_name || 'Cash on Delivery',
          payment_status: initialPaymentStatus,
          payment_receipt_url: receiptUrl,
          order_status: initialOrderStatus,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Insert Order Items
      const orderItemsData = items.map((item) => {
        const itemPrice = item.variant?.sale_price || item.variant?.price || item.product.sale_price || item.product.regular_price;
        return {
          order_id: newOrder.id,
          product_id: item.product.id,
          product_name: item.product.name,
          variant_info: `Size: ${item.selectedSize || item.variant?.size || 'Standard'}${item.selectedColor ? ` / ${item.selectedColor}` : ''}`,
          unit_price: itemPrice,
          price: itemPrice,
          quantity: item.quantity,
          total_price: itemPrice * item.quantity,
        };
      });

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsData);
      if (itemsErr) throw itemsErr;

      // Clear Cart & Redirect to Order Confirmation Page
      clearCart();
      router.push(`/order-success?number=${orderNumber}&total=${grandTotal}&method=${encodeURIComponent(selectedMethod?.display_name || 'Cash on Delivery')}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif">Your shopping bag is empty</h2>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="inline-block bg-[#a63b7e] text-white px-6 py-3 rounded-2xl font-extrabold text-xs shadow-md">
          Browse Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Top Header Bar */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link href="/cart" className="text-xs font-bold text-gray-600 hover:text-[#a63b7e] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-green-700 font-extrabold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" /> 256-Bit Encrypted Checkout
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 font-serif mb-4 sm:mb-6">
          Checkout — Delivery in Pakistan
        </h1>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* 1. Contact Information */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs space-y-3.5 sm:space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-gray-900 font-serif flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <Truck className="w-4 h-4 text-[#a63b7e]" /> 1. Shipping Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nadir Habib"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    Mobile Phone (03XX) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0312 1222333"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as mobile or different"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="For digital receipt"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs space-y-3.5 sm:space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-gray-900 font-serif flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <Truck className="w-4 h-4 text-[#a63b7e]" /> 2. Delivery Address in Pakistan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    Province *
                  </label>
                  <select
                    value={form.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] bg-white text-xs sm:text-sm text-gray-900 font-extrabold"
                  >
                    {PAKISTAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    City *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] bg-white text-xs sm:text-sm text-gray-900 font-extrabold"
                  >
                    {(MAJOR_CITIES[form.province] || ['Other City']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                  Full Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Shop No., Street, Sector / Block, Town"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Allied Bank"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-gray-800 text-[11px] sm:text-xs block mb-1 uppercase tracking-wider">
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] text-xs sm:text-sm text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* 3. Dynamic Payment Methods Selection */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-gray-900 font-serif flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <CreditCard className="w-4 h-4 text-[#a63b7e]" /> 3. Select Payment Method
              </h3>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = method.id === selectedMethodId;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#a63b7e] bg-pink-50/40 ring-2 ring-pink-100'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={isSelected}
                            onChange={() => setSelectedMethodId(method.id)}
                            className="w-4 h-4 text-[#a63b7e]"
                          />
                          <div>
                            <span className="font-extrabold text-gray-900 text-xs sm:text-sm block">
                              {method.display_name}
                            </span>
                            {method.bank_name && (
                              <span className="text-[10px] text-gray-500 font-bold block">
                                Provider: {method.bank_name}
                              </span>
                            )}
                          </div>
                        </div>

                        {method.type === 'cod' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            COD Available
                          </span>
                        )}
                      </div>

                      {/* Expanded Details Box for Selected Payment Method */}
                      {isSelected && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-200/60 space-y-3 animate-fadeIn">
                          {/* Account Details Box */}
                          {(method.account_title || method.account_number || method.qr_code_url) && (
                            <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2 text-xs">
                              <span className="font-extrabold text-[#a63b7e] text-[11px] block uppercase tracking-wider">
                                Payment Transfer Account Info
                              </span>

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  {method.bank_name && (
                                    <p className="text-gray-700">Bank / App: <strong className="text-gray-900">{method.bank_name}</strong></p>
                                  )}
                                  {method.account_title && (
                                    <p className="text-gray-700">Account Title: <strong className="text-gray-900">{method.account_title}</strong></p>
                                  )}
                                  {method.account_number && (
                                    <p className="text-gray-700">Account / IBAN / No: <strong className="text-gray-900 font-mono text-xs">{method.account_number}</strong></p>
                                  )}
                                </div>

                                {method.qr_code_url && (
                                  <div className="relative w-24 h-24 rounded-xl border border-gray-300 overflow-hidden shrink-0 bg-white p-1">
                                    <Image src={method.qr_code_url} alt="QR Code" fill className="object-contain" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Instructions */}
                          {method.instructions && (
                            <div className="p-3 bg-pink-50/80 border border-pink-100 rounded-xl text-[11px] text-gray-800">
                              <span className="font-extrabold text-[#a63b7e] block mb-0.5">Instructions:</span>
                              <p className="leading-relaxed">{method.instructions}</p>
                            </div>
                          )}

                          {/* Payment Receipt Upload Box */}
                          {method.requires_payment_proof && (
                            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                              <label className="font-extrabold text-gray-800 block text-xs">
                                Attach Payment Receipt Screenshot (Optional)
                              </label>

                              <div className="flex items-center gap-3">
                                {receiptPreview ? (
                                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-300 shrink-0 bg-white">
                                    <Image src={receiptPreview} alt="Receipt" fill className="object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0 bg-white">
                                    <Upload className="w-5 h-5 text-[#a63b7e]" />
                                  </div>
                                )}

                                <div className="flex-1 space-y-1">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setReceiptFile(file);
                                        setReceiptPreview(URL.createObjectURL(file));
                                      }
                                    }}
                                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-pink-50 file:text-[#a63b7e] hover:file:bg-pink-100 cursor-pointer"
                                  />
                                  <span className="text-[10px] text-gray-500 block">Upload transfer receipt screenshot or send on WhatsApp after ordering.</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs space-y-4 text-xs sticky top-6">
              <h3 className="font-extrabold text-sm text-gray-900 font-serif border-b border-gray-100 pb-2">
                Order Summary ({items.length} Items)
              </h3>

              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const itemPrice = item.variant?.sale_price || item.variant?.price || item.product.sale_price || item.product.regular_price;
                  return (
                    <div key={item.id || idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <Image src={item.product.main_image} alt={item.product.name} fill className="object-cover object-top" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-xs line-clamp-1">{item.product.name}</span>
                          <span className="text-[10px] text-gray-500 block">Qty: {item.quantity} | Size: {item.selectedSize || item.variant?.size || 'Standard'}{item.selectedColor ? ` / ${item.selectedColor}` : ''}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900 shrink-0 text-xs">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Public Offers Section */}
              {publicCoupons.length > 0 && !couponCode && (
                <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#a63b7e]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Available Store Discounts:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {publicCoupons.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleApplyCoupon(undefined, c.code)}
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

              {/* Coupon Code Entry Form */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount / Promo Code"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={isApplying}
                    className="bg-gray-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0"
                  >
                    {isApplying ? 'Checking...' : 'Apply'}
                  </button>
                </div>

                {couponError && <p className="text-[11px] text-red-600 font-bold">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-green-700 font-bold">{couponSuccess}</p>}

                {couponCode && (
                  <div className="flex items-center justify-between text-xs bg-green-50 p-2.5 rounded-xl border border-green-200 text-green-800 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>Coupon <strong>{couponCode}</strong> applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { removeCoupon(); setCouponSuccess(''); setCouponError(''); }}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
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
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-[#a63b7e]">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* High-Converting CTA Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 sm:py-4 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-pink-200/80 transition flex items-center justify-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <>
                    <span>Place Order — Rs. {grandTotal.toLocaleString()}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>100% Guaranteed Safe Delivery Across Pakistan</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
