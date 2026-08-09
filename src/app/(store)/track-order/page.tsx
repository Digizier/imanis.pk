'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/types';
import { Search, Truck, Clock, CheckCircle2, Package, MapPin } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOrder(null);

    if (!orderNumber.trim()) {
      setErrorMsg('Please enter your Order Number (e.g. IMP-1001).');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('order_number', orderNumber.trim())
        .single();

      if (error || !data) {
        setErrorMsg('Order not found. Please verify your order number.');
      } else {
        setOrder(data);
      }
    } catch (err: any) {
      setErrorMsg('Error tracking order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto text-[#a63b7e]">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif">
          Track Your Order Status
        </h1>
        <p className="text-xs text-gray-500">
          Enter your Order Reference Number (IMP-XXXXXX) to view live delivery updates across Pakistan.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrackOrder} className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4 max-w-lg mx-auto">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Order Reference Number *</label>
          <input
            type="text"
            required
            placeholder="e.g. IMP-1001"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-4 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-mono uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          {loading ? 'Searching Order...' : 'Track Order Now'}
        </button>

        {errorMsg && <p className="text-xs text-red-500 font-medium text-center">{errorMsg}</p>}
      </form>

      {/* Order Details Result */}
      {order && (
        <div className="mt-8 p-6 bg-white border border-pink-100 rounded-3xl shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-2">
            <div>
              <span className="text-xs text-gray-400 block font-mono">ORDER #{order.order_number}</span>
              <h3 className="text-lg font-bold text-gray-900 font-serif">{order.customer_name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-pink-100 text-[#a63b7e] px-3 py-1 rounded-full text-xs font-extrabold uppercase">
                STATUS: {order.order_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
            <div className={`p-2 rounded-xl border ${order.order_status === 'pending' ? 'bg-pink-50 border-[#a63b7e] text-[#a63b7e] font-bold' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              1. Placed
            </div>
            <div className={`p-2 rounded-xl border ${['confirmed', 'processing', 'packed'].includes(order.order_status) ? 'bg-pink-50 border-[#a63b7e] text-[#a63b7e] font-bold' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              2. Processing
            </div>
            <div className={`p-2 rounded-xl border ${['shipped', 'out_for_delivery'].includes(order.order_status) ? 'bg-pink-50 border-[#a63b7e] text-[#a63b7e] font-bold' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              3. Shipped
            </div>
            <div className={`p-2 rounded-xl border ${order.order_status === 'delivered' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              4. Delivered
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
            <div>
              <p className="font-bold text-gray-900">Delivery Address:</p>
              <p className="text-gray-600 mt-0.5">{order.full_address}, {order.city}, {order.province}</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Total Amount:</p>
              <p className="text-gray-600 mt-0.5 font-bold text-sm text-[#a63b7e]">Rs. {order.total_amount.toLocaleString()} ({order.payment_method.toUpperCase()})</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="font-bold text-xs text-gray-900">Order Items:</p>
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-0">
                <span>{item.product_name} x {item.quantity} ({item.variant_info})</span>
                <span className="font-bold text-gray-900">Rs. {item.total_price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
