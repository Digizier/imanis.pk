import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { DollarSign, ShoppingCart, Package, AlertTriangle, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

export default async function AdminDashboardPage() {
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: products } = await supabase
    .from('products')
    .select('*');

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
  const pendingOrders = orders?.filter((o) => o.order_status === 'pending').length || 0;
  const lowStockProducts = products?.filter((p) => (p.total_stock || 0) <= 10).length || 0;

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Store Analytics Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Live metrics from your Supabase database.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-green-600 font-semibold">Live store revenue</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="w-5 h-5 text-[#a63b7e]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{orders?.length || 0}</p>
          <span className="text-[10px] text-[#a63b7e] font-semibold">{pendingOrders} pending fulfillment</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{products?.length || 0}</p>
          <span className="text-[10px] text-gray-500">Catalog items count</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{lowStockProducts}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Items under 10 stock</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900 font-serif">Recent Store Orders</h3>
          <Link href="/admin/orders" className="text-xs font-bold text-[#a63b7e] hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">City</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {orders?.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-3.5 font-bold font-mono text-gray-900">{ord.order_number}</td>
                  <td className="p-3.5">{ord.customer_name}<br/><span className="text-[10px] text-gray-400">{ord.customer_phone}</span></td>
                  <td className="p-3.5">{ord.city}</td>
                  <td className="p-3.5 uppercase font-bold text-[10px]">{ord.payment_method}</td>
                  <td className="p-3.5 font-bold text-gray-900">Rs. {Number(ord.total_amount).toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-pink-50 text-[#a63b7e]">
                      {ord.order_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link href={`/admin/orders`} className="p-1.5 text-gray-500 hover:text-[#a63b7e] inline-block">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
