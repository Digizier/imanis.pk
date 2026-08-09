'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Globe,
  Percent,
  Coins
} from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_spend: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count?: number;
  is_active: boolean;
  is_public: boolean;
  description?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<CouponItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Banner State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 10,
    min_spend: 1000,
    max_discount: '',
    usage_limit: '',
    is_public: true,
    is_active: true,
    description: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('is_active', { ascending: false })
      .order('code', { ascending: true });

    if (!error && data) {
      setCoupons(data as CouponItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_spend: 1000,
      max_discount: '',
      usage_limit: '',
      is_public: true,
      is_active: true,
      description: '',
    });
    setEditingCoupon(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || 0,
      min_spend: coupon.min_spend || 0,
      max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      is_public: coupon.is_public !== false,
      is_active: coupon.is_active !== false,
      description: coupon.description || '',
    });
    setShowModal(true);
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    const newStatus = !coupon.is_active;
    const { error } = await supabase.from('coupons').update({ is_active: newStatus }).eq('id', coupon.id);

    if (error) {
      showToast(`Failed to update status: ${error.message}`, 'error');
    } else {
      setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, is_active: newStatus } : c)));
      showToast(`Coupon "${coupon.code}" is now ${newStatus ? 'ENABLED' : 'DISABLED'}.`);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      showToast('Please enter a valid coupon code', 'error');
      return;
    }

    setIsSubmitting(true);
    const codeClean = formData.code.trim().toUpperCase();

    const payload = {
      code: codeClean,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_spend: Number(formData.min_spend) || 0,
      max_discount: formData.max_discount ? Number(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      is_public: formData.is_public,
      is_active: formData.is_active,
      description: formData.description || null,
    };

    try {
      if (editingCoupon) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingCoupon.id);
        if (error) throw error;
        showToast(`Coupon "${codeClean}" updated successfully!`);
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
        showToast(`New Coupon "${codeClean}" created successfully!`);
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      showToast(`Failed to save coupon: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteConfirmCoupon) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', deleteConfirmCoupon.id);
      if (error) throw error;

      setCoupons(coupons.filter((c) => c.id !== deleteConfirmCoupon.id));
      showToast(`Coupon "${deleteConfirmCoupon.code}" deleted successfully.`);
      setDeleteConfirmCoupon(null);
    } catch (err: any) {
      showToast(`Failed to delete coupon: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-extrabold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-green-900 text-white border-green-700'
                : 'bg-red-900 text-white border-red-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
            <Tag className="w-7 h-7 text-[#a63b7e]" /> Store Discount Coupons
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage promotional public offer banners and private VIP codes for cart & checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Coupon Code
          </button>
        </div>
      </div>

      {/* Coupon List Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
            Loading discount coupons from Supabase...
          </div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Coupon Code & Description</th>
                  <th className="p-4">Discount Value</th>
                  <th className="p-4">Min. Order Spend</th>
                  <th className="p-4">Visibility Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-extrabold text-sm text-gray-900 bg-pink-50 text-[#a63b7e] px-3 py-1 rounded-xl border border-pink-100">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <span className="text-[11px] text-gray-500">{coupon.description}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-gray-900 text-xs flex items-center gap-1">
                        {coupon.discount_type === 'percentage' ? (
                          <>
                            <Percent className="w-3.5 h-3.5 text-purple-600" />
                            {coupon.discount_value}% OFF
                          </>
                        ) : (
                          <>
                            <Coins className="w-3.5 h-3.5 text-emerald-600" />
                            Rs. {coupon.discount_value.toLocaleString()} OFF
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-gray-800">
                      Rs. {(coupon.min_spend || 0).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {coupon.is_public ? (
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-max">
                          <Globe className="w-3 h-3" /> Public Offer
                        </span>
                      ) : (
                        <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-max">
                          <Lock className="w-3 h-3" /> Private Code
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`px-3 py-1 rounded-full font-bold text-[10px] transition flex items-center gap-1.5 ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {coupon.is_active ? <Eye className="w-3 h-3 text-green-600" /> : <EyeOff className="w-3 h-3" />}
                        {coupon.is_active ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          className="p-2 text-gray-600 hover:text-[#a63b7e] hover:bg-pink-50 rounded-xl transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCoupon(coupon)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-gray-400 space-y-3">
            <Tag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-700">No discount coupons found in Supabase.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-xs">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#a63b7e]" />
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Discount Coupon'}
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER10, EID2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono text-sm font-extrabold uppercase focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed_amount' })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl bg-white font-bold"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed_amount">Fixed Amount Off (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder={formData.discount_type === 'percentage' ? '10 (%)' : '500 (Rs)'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Min. Subtotal Spend (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="1000"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Max Discount Cap (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional max limit"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Public vs Private Visibility Selection */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Visibility Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2 transition ${
                      formData.is_public ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.is_public}
                      onChange={() => setFormData({ ...formData, is_public: true })}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-extrabold text-gray-900 block text-xs">🌐 Public Offer</span>
                      <span className="text-[10px] text-gray-500">Shows in Cart/Checkout available banners</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2 transition ${
                      !formData.is_public ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-100' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.is_public}
                      onChange={() => setFormData({ ...formData, is_public: false })}
                      className="text-purple-600"
                    />
                    <div>
                      <span className="font-extrabold text-gray-900 block text-xs">🔒 Private Code</span>
                      <span className="text-[10px] text-gray-500">Hidden from public, manual entry only</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Description / Banner Text</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 10% Off on orders over Rs. 1,000"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#a63b7e] hover:bg-[#872b64] text-white py-3 rounded-2xl font-extrabold shadow-md"
                >
                  Save Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-serif">
                Delete Coupon "{deleteConfirmCoupon.code}"?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                This coupon code will be permanently removed from Supabase DB.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmCoupon(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md"
              >
                Yes, Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
