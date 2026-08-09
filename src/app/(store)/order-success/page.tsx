'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ShoppingBag, Truck } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number') || `IMP-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalAmount = searchParams.get('total') || '0';
  const paymentMethod = searchParams.get('method') || 'cod';

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum Imani's! I just placed Order #${orderNumber} for Rs. ${Number(totalAmount).toLocaleString()} (${paymentMethod.toUpperCase()}). Please confirm dispatch!`
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-lg animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="bg-pink-100 text-[#a63b7e] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          ORDER SUCCESSFULLY PLACED
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-serif">
          Thank You For Shopping With Imani's!
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Your order number is <strong className="text-gray-900 font-mono text-sm">{orderNumber}</strong>. We have received your order and will dispatch it within 3-5 working days.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-gray-900 uppercase tracking-wider">Quick Order Support</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/923121222333?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Confirm Order via WhatsApp Direct
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/track-order"
            className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-[#a63b7e]" /> Track Order Status
          </Link>
          <Link
            href="/shop"
            className="flex-1 bg-[#a63b7e] hover:bg-[#872b64] text-white py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center text-xs text-gray-500">Loading Order Confirmation...</div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
