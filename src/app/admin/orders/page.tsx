'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types';
import {
  ShoppingBag, Phone, MessageCircle, Truck, CheckCircle2, Clock, Eye, Printer,
  Edit3, Trash2, Settings, Plus, Save, Download, FileText, Building, MapPin, Mail, AlertCircle,
  X, DollarSign, Package, AlertTriangle, ChevronRight, User, ShieldCheck, Image as ImageIcon,
  ExternalLink, Search
} from 'lucide-react';

interface InvoiceSettings {
  companyName: string;
  tagline: string;
  ntnNumber: string;
  address: string;
  phone: string;
  email: string;
  bankDetails: string;
  invoiceNotes: string;
}

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa (KPK)',
  'Balochistan',
  'Islamabad Capital Territory (ICT)',
  'Azad Jammu & Kashmir (AJK)',
  'Gilgit-Baltistan (GB)',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Active State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [proofOrder, setProofOrder] = useState<Order | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Admin Company Invoice Details State
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    companyName: "Imani's Collection",
    tagline: 'Smart Style, Everyday Savings',
    ntnNumber: 'NTN-8472910-3',
    address: 'Shop 1&2 Meharma Market, Street 1A, Shah Allah Ditta Town, Adjacent D12/2, Islamabad, Pakistan',
    phone: '0312 1222333',
    email: 'imanisbyanila@gmail.com',
    bankDetails: 'Meezan Bank | Account Title: Imani Collection | Account #: 0102030405060708',
    invoiceNotes: 'Thank you for shopping with Imani\'s! 7-day return policy valid with original receipt.',
  });

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);

    const { data: setRes } = await supabase.from('store_settings').select('*').eq('key', 'invoice_settings').single();
    if (setRes?.value) {
      setInvoiceSettings(setRes.value);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    showToast(`Order status updated to "${newStatus.toUpperCase()}"`);
    fetchOrders();
  };

  const handleExecuteDeleteOrder = async () => {
    if (!deleteConfirmOrder) return;

    setIsDeleting(true);
    try {
      await supabase.from('order_items').delete().eq('order_id', deleteConfirmOrder.id);
      await supabase.from('orders').delete().eq('id', deleteConfirmOrder.id);

      setOrders(orders.filter((o) => o.id !== deleteConfirmOrder.id));
      showToast(`Order #${deleteConfirmOrder.order_number} permanently deleted.`);
      setDeleteConfirmOrder(null);
    } catch (err: any) {
      showToast('Failed to delete order: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveInvoiceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ key: 'invoice_settings', value: invoiceSettings }, { onConflict: 'key' });

      if (error) throw error;

      setShowSettingsModal(false);
      showToast('Admin Store & Invoice Shipping Details updated successfully!');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to save store details: ' + (err.message || 'Database error'), 'error');
    }
  };

  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;

    try {
      await supabase
        .from('orders')
        .update({
          customer_name: editOrder.customer_name,
          customer_phone: editOrder.customer_phone,
          customer_email: editOrder.customer_email || null,
          province: editOrder.province,
          city: editOrder.city,
          full_address: editOrder.full_address,
          order_notes: editOrder.order_notes || null,
          payment_method: editOrder.payment_method,
          payment_status: editOrder.payment_status,
          order_status: editOrder.order_status,
          subtotal: editOrder.subtotal,
          shipping_fee: editOrder.shipping_fee,
          discount_amount: editOrder.discount_amount,
          total_amount: editOrder.total_amount,
        })
        .eq('id', editOrder.id);

      if (editOrder.items && editOrder.items.length > 0) {
        for (const item of editOrder.items) {
          await supabase
            .from('order_items')
            .update({
              product_name: item.product_name,
              variant_info: item.variant_info,
              quantity: item.quantity,
              unit_price: item.unit_price,
              price: item.unit_price,
              total_price: item.unit_price * item.quantity,
            })
            .eq('id', item.id);
        }
      }

      showToast(`Order #${editOrder.order_number} changes saved successfully!`);
      setEditOrder(null);
      fetchOrders();
    } catch (err: any) {
      showToast('Failed to update order: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Strict Print CSS Override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-area, #printable-invoice-area * {
            visibility: visible !important;
          }
          #printable-invoice-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 99999 !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce print-hide">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-extrabold flex items-center gap-2.5 ${
            toast.type === 'success' ? 'bg-green-900 text-white border-green-700' : 'bg-red-900 text-white border-red-700'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print-hide">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Store Orders Manager</h1>
          <p className="text-xs text-gray-500 mt-0.5">Full Pakistani COD fulfillment center, order editor, and branded invoice engine.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <Building className="w-4 h-4 text-[#a63b7e]" /> Admin Details Invoice
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden print-hide">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
            Loading orders from Supabase...
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer & Address</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status Update</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {orders.map((ord) => {
                  const receiptUrl = ord.payment_receipt_url || (ord as any).payment_proof_url;
                  const isUnderVerification = ord.order_status === 'Under Payment Verification' || ord.payment_status === 'Under Payment Verification';

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-4 font-bold font-mono text-gray-900">{ord.order_number}</td>
                      <td className="p-4">
                        <span className="font-bold text-gray-900 block">{ord.customer_name}</span>
                        <span className="text-[10px] text-gray-500 block">{ord.customer_phone} ({ord.city})</span>
                        <span className="text-[10px] text-gray-400 block line-clamp-1">{ord.full_address}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold uppercase text-[10px] block">{ord.payment_method}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                          isUnderVerification
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                            : ord.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-gray-900">
                        Rs. {Number(ord.total_amount).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.order_status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className={`px-2.5 py-1.5 text-[11px] font-extrabold border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#a63b7e] ${
                            isUnderVerification
                              ? 'border-purple-300 text-purple-900 bg-purple-50'
                              : 'border-gray-300 text-gray-800'
                          }`}
                        >
                          <option value="Under Payment Verification">Under Payment Verification</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Payment Receipt Image Button */}
                          {receiptUrl ? (
                            <button
                              onClick={() => setProofOrder(ord)}
                              className="px-2.5 py-1 bg-pink-100 hover:bg-pink-200 text-[#a63b7e] rounded-xl font-extrabold text-[11px] transition flex items-center gap-1 shadow-2xs border border-pink-200 active:scale-95"
                              title="View Payment Proof Screenshot"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-[#a63b7e]" />
                              <span>Proof</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic px-1">No Receipt</span>
                          )}

                          {/* Branded Invoice Button */}
                          <button
                            onClick={() => setInvoiceOrder(ord)}
                            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition"
                            title="Generate Branded Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Button */}
                          <a
                            href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum%20${ord.customer_name}!%20Your%20Imani's%20Order%20%23${ord.order_number}%20is%20${ord.order_status}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Edit Order */}
                          <button
                            onClick={() => setEditOrder(JSON.parse(JSON.stringify(ord)))}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition"
                            title="Advanced Edit Order"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => setDeleteConfirmOrder(ord)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-gray-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p>No orders found in database.</p>
          </div>
        )}
      </div>

      {/* Modal: View Payment Proof Screenshot Modal */}
      {proofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn print-hide">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl relative space-y-4 text-xs">
            <button
              onClick={() => setProofOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>

            <div className="border-b border-gray-100 pb-3 pr-8">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#a63b7e]" />
                <h3 className="text-lg font-extrabold text-gray-900 font-serif">Customer Payment Transfer Proof</h3>
              </div>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Order <strong className="font-mono text-gray-800">#{proofOrder.order_number}</strong> — {proofOrder.customer_name} ({proofOrder.customer_phone})
              </p>
            </div>

            <div className="bg-gray-100 rounded-2xl p-2 border border-gray-200 relative min-h-[300px] flex items-center justify-center overflow-hidden">
              {proofOrder.payment_receipt_url || (proofOrder as any).payment_proof_url ? (
                <div className="relative w-full h-80 sm:h-96">
                  <Image
                    src={proofOrder.payment_receipt_url || (proofOrder as any).payment_proof_url}
                    alt="Payment Proof Receipt"
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              ) : (
                <p className="text-gray-500 italic">No proof screenshot image available.</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-gray-500 font-bold">
                Method: <strong className="text-gray-900 uppercase">{proofOrder.payment_method}</strong>
              </span>

              <div className="flex items-center gap-2">
                {(proofOrder.payment_receipt_url || (proofOrder as any).payment_proof_url) && (
                  <a
                    href={proofOrder.payment_receipt_url || (proofOrder as any).payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl font-extrabold text-xs hover:bg-black transition flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
                  </a>
                )}
                <button
                  onClick={() => handleUpdateStatus(proofOrder.id, 'confirmed')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-extrabold text-xs hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Custom Delete Confirmation Modal */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn print-hide">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-center text-xs">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 font-serif">
                Delete Order #{deleteConfirmOrder.order_number}?
              </h3>
              <p className="text-gray-500 mt-1.5 leading-relaxed">
                This action will permanently delete customer <strong className="text-gray-800">{deleteConfirmOrder.customer_name}</strong>'s order and all item records from Supabase.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteOrder}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Admin Company Invoice Details Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print-hide">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative space-y-5 text-xs">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg">✕</button>
            
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
                <Building className="w-5 h-5 text-[#a63b7e]" /> Admin Company Details for Invoice
              </h3>
              <p className="text-gray-500 mt-1">Configure official store header details, tax NTN number, and bank details rendered on printed customer invoices.</p>
            </div>

            <form onSubmit={handleSaveInvoiceSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={invoiceSettings.companyName}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">NTN / Registration #</label>
                  <input
                    type="text"
                    value={invoiceSettings.ntnNumber}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, ntnNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Official Support Phone</label>
                  <input
                    type="text"
                    required
                    value={invoiceSettings.phone}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Official Support Email</label>
                  <input
                    type="email"
                    required
                    value={invoiceSettings.email}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Physical Store Address</label>
                <textarea
                  rows={2}
                  value={invoiceSettings.address}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Bank Account Transfer Info (Shown on Invoice)</label>
                <input
                  type="text"
                  value={invoiceSettings.bankDetails}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, bankDetails: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-xs shadow-lg shadow-pink-200 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Company Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: FULL ADVANCED LOOK Edit Order Modal */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print-hide">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative space-y-6 text-xs border border-gray-200 my-8">
            <button
              onClick={() => setEditOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 pr-8">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-gray-900 font-serif">Advanced Order Editor</h3>
                  <span className="bg-[#a63b7e] text-white px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
                    #{editOrder.order_number}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5">Modify customer contact, Pakistani shipping address, financials, status, and itemized quantities.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-6">
              {/* Section 1: Customer Contact & Delivery Info */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#a63b7e]" /> 1. Customer Contact & Delivery Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editOrder.customer_name}
                      onChange={(e) => setEditOrder({ ...editOrder, customer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Mobile Phone (03XX)</label>
                    <input
                      type="text"
                      required
                      value={editOrder.customer_phone}
                      onChange={(e) => setEditOrder({ ...editOrder, customer_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editOrder.customer_email || ''}
                      onChange={(e) => setEditOrder({ ...editOrder, customer_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Province</label>
                    <select
                      value={editOrder.province}
                      onChange={(e) => setEditOrder({ ...editOrder, province: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-semibold"
                    >
                      {PAKISTAN_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={editOrder.city}
                      onChange={(e) => setEditOrder({ ...editOrder, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Street Address</label>
                  <textarea
                    rows={2}
                    required
                    value={editOrder.full_address}
                    onChange={(e) => setEditOrder({ ...editOrder, full_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              {/* Section 2: Financials & Status Controls */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#a63b7e]" /> 2. Status & Financial Breakdown (PKR)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Order Status</label>
                    <select
                      value={editOrder.order_status}
                      onChange={(e) => setEditOrder({ ...editOrder, order_status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-bold"
                    >
                      <option value="Under Payment Verification">Under Payment Verification</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Payment Method</label>
                    <input
                      type="text"
                      value={editOrder.payment_method}
                      onChange={(e) => setEditOrder({ ...editOrder, payment_method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Payment Status</label>
                    <select
                      value={editOrder.payment_status}
                      onChange={(e) => setEditOrder({ ...editOrder, payment_status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-bold"
                    >
                      <option value="Under Payment Verification">Under Payment Verification</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Grand Total (PKR)</label>
                    <input
                      type="number"
                      required
                      value={editOrder.total_amount}
                      onChange={(e) => setEditOrder({ ...editOrder, total_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl font-extrabold text-[#a63b7e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">Subtotal (PKR)</label>
                    <input
                      type="number"
                      value={editOrder.subtotal || 0}
                      onChange={(e) => setEditOrder({ ...editOrder, subtotal: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">Shipping Fee (PKR)</label>
                    <input
                      type="number"
                      value={editOrder.shipping_fee || 0}
                      onChange={(e) => setEditOrder({ ...editOrder, shipping_fee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">Discount (PKR)</label>
                    <input
                      type="number"
                      value={editOrder.discount_amount || 0}
                      onChange={(e) => setEditOrder({ ...editOrder, discount_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold text-green-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Ordered Items Editor */}
              {editOrder.items && editOrder.items.length > 0 && (
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#a63b7e]" /> 3. Ordered Products & Item Quantities
                  </h4>

                  <div className="space-y-2">
                    {editOrder.items.map((it, idx) => (
                      <div key={it.id || idx} className="p-3 bg-white border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <label className="font-bold text-gray-500 text-[10px] block">Product Name</label>
                          <input
                            type="text"
                            value={it.product_name}
                            onChange={(e) => {
                              const newItems = [...editOrder.items!];
                              newItems[idx].product_name = e.target.value;
                              setEditOrder({ ...editOrder, items: newItems });
                            }}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="font-bold text-gray-500 text-[10px] block">Variant / Size</label>
                          <input
                            type="text"
                            value={it.variant_info || ''}
                            onChange={(e) => {
                              const newItems = [...editOrder.items!];
                              newItems[idx].variant_info = e.target.value;
                              setEditOrder({ ...editOrder, items: newItems });
                            }}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-gray-500 text-[10px] block">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => {
                              const newItems = [...editOrder.items!];
                              newItems[idx].quantity = parseInt(e.target.value) || 1;
                              setEditOrder({ ...editOrder, items: newItems });
                            }}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold text-center"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-gray-500 text-[10px] block">Unit Price</label>
                          <input
                            type="number"
                            value={it.unit_price || 0}
                            onChange={(e) => {
                              const newItems = [...editOrder.items!];
                              newItems[idx].unit_price = parseFloat(e.target.value) || 0;
                              setEditOrder({ ...editOrder, items: newItems });
                            }}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOrder(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-xs shadow-xl shadow-pink-200 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Advanced Order Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Branded Printable PDF Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div
            id="printable-invoice-area"
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative space-y-6 text-xs border border-gray-200"
          >
            {/* Modal Controls (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 print-hide">
              <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#a63b7e]" /> Official Branded Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Print / Download PDF
                </button>
                <button onClick={() => setInvoiceOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 font-bold text-lg">✕</button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="space-y-6">
              {/* Header: Brand Transparent Logo & Company Info */}
              <div className="flex justify-between items-start border-b-2 border-[#a63b7e] pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src="/logo-icon-transparent.png"
                      alt="Imani's Collection Logo"
                      width={44}
                      height={44}
                      className="h-11 w-auto object-contain shrink-0"
                    />
                    <div>
                      <h1 className="text-xl font-black text-gray-900 font-serif tracking-tight leading-none">
                        {invoiceSettings.companyName || "Imani's Collection"}
                      </h1>
                      <p className="text-[10px] text-[#a63b7e] font-extrabold uppercase tracking-widest mt-0.5">
                        {invoiceSettings.tagline || "Smart Style, Everyday Savings"}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5 max-w-xs leading-tight font-medium">
                    {invoiceSettings.address}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5 font-medium">
                    Helpline: <strong className="text-gray-900">{invoiceSettings.phone}</strong> | Email: <strong className="text-gray-900">{invoiceSettings.email}</strong>
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <h2 className="text-xl font-extrabold text-gray-900 font-mono">INVOICE</h2>
                  <p className="font-mono font-bold text-sm text-[#a63b7e]">#{invoiceOrder.order_number}</p>
                  <p className="text-[10px] text-gray-500">
                    Date: {new Date(invoiceOrder.created_at || Date.now()).toLocaleDateString('en-PK')}
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 uppercase">
                    Payment Method: {invoiceOrder.payment_method.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Billed To Customer Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer Billed To:</span>
                  <strong className="text-sm font-bold text-gray-900 block mt-0.5">{invoiceOrder.customer_name}</strong>
                  <span className="text-xs text-gray-600 block">{invoiceOrder.customer_phone}</span>
                  <span className="text-xs text-gray-600 block">{invoiceOrder.customer_email || 'No email provided'}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Destination:</span>
                  <span className="text-xs text-gray-800 leading-snug block mt-0.5 font-medium">
                    {invoiceOrder.full_address}, {invoiceOrder.city}, {invoiceOrder.province}
                  </span>
                </div>
              </div>

              {/* Itemized Order Table */}
              <div className="overflow-hidden border border-gray-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-extrabold uppercase text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Variant / Size</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {invoiceOrder.items && invoiceOrder.items.length > 0 ? (
                      invoiceOrder.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-3 font-bold text-gray-900">{it.product_name}</td>
                          <td className="p-3 text-gray-600 text-[11px]">{it.variant_info || 'Standard'}</td>
                          <td className="p-3 text-center font-bold">{it.quantity}</td>
                          <td className="p-3 text-right">Rs. {Number(it.unit_price || it.price || 0).toLocaleString()}</td>
                          <td className="p-3 text-right font-extrabold text-gray-900">
                            Rs. {(Number(it.unit_price || it.price || 0) * it.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-400">No items listed.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end pt-2 text-xs">
                <div className="space-y-1 max-w-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Important Notes:</span>
                  <p className="text-[10px] text-gray-500 leading-tight">{invoiceSettings.invoiceNotes}</p>
                </div>

                <div className="w-56 space-y-1.5 text-right font-medium">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">Rs. {Number(invoiceOrder.subtotal || invoiceOrder.total_amount).toLocaleString()}</span>
                  </div>
                  {invoiceOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Discount:</span>
                      <span>- Rs. {Number(invoiceOrder.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee:</span>
                    <span className="font-bold text-gray-900">
                      {invoiceOrder.shipping_fee === 0 ? 'FREE' : `Rs. ${invoiceOrder.shipping_fee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#a63b7e] pt-2 border-t border-gray-200">
                    <span>Total Paid:</span>
                    <span>Rs. {Number(invoiceOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
