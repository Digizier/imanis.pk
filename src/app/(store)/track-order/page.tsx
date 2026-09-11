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
  const [courierInfo, setCourierInfo] = useState<any>(null);
  const [courierLoading, setCourierLoading] = useState(false);

  const fetchLiveTracking = async (orderId: string, orioOrderId?: string | null) => {
    setCourierLoading(true);
    setCourierInfo(null);
    try {
      const res = await fetch('/api/orio/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orioOrderId }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setCourierInfo(resData.data);
      }
    } catch {
      // Graceful fallback if tracking not yet generated
    } finally {
      setCourierLoading(false);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOrder(null);
    setCourierInfo(null);

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
        if (data.orio_order_id || data.tracking_number) {
          fetchLiveTracking(data.id, data.orio_order_id || data.tracking_number);
        }
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

          {/* Courier Details Card if booked */}
          {(order.orio_consignment_no || order.tracking_number || order.courier) && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Courier Logistics</span>
                    <span className="font-extrabold text-xs text-gray-900">
                      {courierInfo?.courier_name || order.courier || 'ORIO Multi-Courier Network'}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] text-gray-500 block">Airway Bill / Consignment #:</span>
                  <span className="font-mono font-black text-emerald-800 text-xs bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                    {order.orio_consignment_no || order.tracking_number || order.orio_order_id}
                  </span>
                </div>
              </div>

              {courierLoading && (
                <p className="text-[11px] text-emerald-600 animate-pulse pt-1">
                  Connecting to live courier tracking network...
                </p>
              )}

              {courierInfo && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Live Status:</span>
                    <span className="font-bold text-emerald-800 uppercase bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                      {courierInfo.status || courierInfo.courier_status || 'In Transit'}
                    </span>
                  </div>
                  {courierInfo.current_location && (
                    <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Current Location: <strong className="text-gray-900">{courierInfo.current_location}</strong></span>
                    </div>
                  )}
                  {Array.isArray(courierInfo.history) && courierInfo.history.length > 0 && (
                    <div className="pt-2 space-y-1.5 max-h-36 overflow-y-auto">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Milestones:</span>
                      {courierInfo.history.map((hist: any, hIdx: number) => (
                        <div key={hIdx} className="flex items-start gap-2 text-[11px] bg-white/60 p-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1 leading-tight">
                            <span className="font-bold text-gray-900">{hist.status || hist.activity}</span>
                            <span className="text-[10px] text-gray-500 block">{hist.date_time || hist.created_at}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
