'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import {
  Settings,
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Building2,
  Smartphone,
  QrCode,
  Save,
  Sparkles,
  Users,
  Mail,
  Phone,
  Clock,
  Check,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'custom';
  display_name: string;
  account_title?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  branch_name?: string | null;
  qr_code_url?: string | null;
  instructions?: string | null;
  requires_payment_proof?: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface PopupSettingsData {
  is_enabled: boolean;
  delay_seconds: number;
  headline: string;
  description: string;
  button_text: string;
  discount_badge_text: string;
  require_whatsapp: boolean;
  frequency_days: number;
}

export interface SubscriberItem {
  id: string;
  email: string;
  whatsapp_number?: string | null;
  source?: string | null;
  created_at: string;
}

const TYPE_BADGES: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  cod: { label: 'Cash on Delivery', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <Building2 className="w-3.5 h-3.5" /> },
  bank_transfer: { label: 'Bank Transfer', bg: 'bg-[#a63b7e]/10', text: 'text-[#a63b7e]', icon: <CreditCard className="w-3.5 h-3.5" /> },
  easypaisa: { label: 'EasyPaisa', bg: 'bg-green-100', text: 'text-green-800', icon: <Smartphone className="w-3.5 h-3.5" /> },
  jazzcash: { label: 'JazzCash', bg: 'bg-red-100', text: 'text-red-800', icon: <Smartphone className="w-3.5 h-3.5" /> },
  custom: { label: 'Custom Gateway', bg: 'bg-blue-100', text: 'text-blue-800', icon: <Globe className="w-3.5 h-3.5" /> },
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'popup'>('general');

  // General Store Settings State
  const [settings, setSettings] = useState({
    store_name: "Imani's",
    phone: '0312 1222333',
    whatsapp: '0312 1222333',
    email: 'imanisbyanila@gmail.com',
    announcement_text: '⚡ FREE SHIPPING ON RS. 2999+ ORDERS ACROSS PAKISTAN | 7-DAY RETURN POLICY',
    address: 'Shop 1&2 Meharma Market, Street 1A, Shah Allah Ditta Town, Adjacent D12/2, Islamabad, Pakistan',
  });
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Welcome Popup Settings & Subscribers State
  const [popupSettings, setPopupSettings] = useState<PopupSettingsData>({
    is_enabled: true,
    delay_seconds: 2,
    headline: 'Get Exclusive Discounts on Your First Order!',
    description: 'Subscribe to unlock instant public promo coupons, secret deal alerts & VIP offers!',
    button_text: 'Unlock Promo Coupons 🎉',
    discount_badge_text: 'Welcome Offer',
    require_whatsapp: false,
    frequency_days: 1,
  });
  const [savingPopup, setSavingPopup] = useState(false);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Subscriber Deletion Modals State
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [typedConfirmText, setTypedConfirmText] = useState('');
  const [deletingAllSubscribers, setDeletingAllSubscribers] = useState(false);

  const [deleteConfirmSub, setDeleteConfirmSub] = useState<SubscriberItem | null>(null);
  const [deletingSingleSub, setDeletingSingleSub] = useState(false);

  // Modal State
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodItem | null>(null);
  const [deleteConfirmMethod, setDeleteConfirmMethod] = useState<PaymentMethodItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Payment Method Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank_transfer' as 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'custom',
    display_name: '',
    account_title: '',
    account_number: '',
    bank_name: '',
    branch_name: '',
    qr_code_url: '',
    instructions: '',
    requires_payment_proof: true,
    is_active: true,
    sort_order: 1,
  });

  const fetchGeneralSettings = async () => {
    const { data } = await supabase.from('store_settings').select('*').eq('key', 'general').single();
    if (data?.value) {
      setSettings(data.value);
    }
  };

  const fetchPaymentMethods = async () => {
    setLoadingPayments(true);
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setPaymentMethods(data as PaymentMethodItem[]);
    }
    setLoadingPayments(false);
  };

  const fetchPopupData = async () => {
    // 1. Fetch Popup Config
    const { data } = await supabase.from('popup_settings').select('*').eq('id', 'default').single();
    if (data) {
      setPopupSettings(data);
    }

    // 2. Fetch Newsletter Subscribers
    const { data: subs } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (subs) {
      setSubscribers(subs);
    }
  };

  useEffect(() => {
    fetchGeneralSettings();
    fetchPaymentMethods();
    fetchPopupData();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    const { error } = await supabase.from('store_settings').upsert({ key: 'general', value: settings }, { onConflict: 'key' });
    setSavingGeneral(false);

    if (error) {
      showToast(`Failed to update store settings: ${error.message}`, 'error');
    } else {
      showToast('Store contact details and announcement bar text saved!');
    }
  };

  const handleSavePopupSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPopup(true);
    const { error } = await supabase.from('popup_settings').upsert({
      id: 'default',
      ...popupSettings,
      updated_at: new Date().toISOString(),
    });
    setSavingPopup(false);

    if (error) {
      showToast(`Failed to save popup settings: ${error.message}`, 'error');
    } else {
      showToast('Welcome Popup configuration updated live!');
    }
  };

  // Delete Individual Subscriber
  const handleDeleteSingleSubscriber = async () => {
    if (!deleteConfirmSub) return;
    setDeletingSingleSub(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', deleteConfirmSub.id);

      if (error) throw error;

      setSubscribers(subscribers.filter((s) => s.id !== deleteConfirmSub.id));
      showToast(`Subscriber "${deleteConfirmSub.email}" deleted successfully!`);
      setDeleteConfirmSub(null);
    } catch (err: any) {
      showToast(`Failed to delete subscriber: ${err.message}`, 'error');
    } finally {
      setDeletingSingleSub(false);
    }
  };

  // Delete All Subscribers (Bulk Delete)
  const handleDeleteAllSubscribers = async () => {
    if (typedConfirmText !== 'DELETE') return;
    setDeletingAllSubscribers(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setSubscribers([]);
      showToast('All newsletter subscribers have been permanently deleted!', 'success');
      setShowDeleteAllModal(false);
      setTypedConfirmText('');
    } catch (err: any) {
      showToast(`Failed to delete all subscribers: ${err.message}`, 'error');
    } finally {
      setDeletingAllSubscribers(false);
    }
  };

  // Payment Methods Form Actions
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'bank_transfer',
      display_name: '',
      account_title: '',
      account_number: '',
      bank_name: '',
      branch_name: '',
      qr_code_url: '',
      instructions: '',
      requires_payment_proof: true,
      is_active: true,
      sort_order: paymentMethods.length + 1,
    });
    setEditingMethod(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowMethodModal(true);
  };

  const handleOpenEditModal = (method: PaymentMethodItem) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type || 'bank_transfer',
      display_name: method.display_name,
      account_title: method.account_title || '',
      account_number: method.account_number || '',
      bank_name: method.bank_name || '',
      branch_name: method.branch_name || '',
      qr_code_url: method.qr_code_url || '',
      instructions: method.instructions || '',
      requires_payment_proof: method.requires_payment_proof !== false,
      is_active: method.is_active !== false,
      sort_order: method.sort_order || 0,
    });
    setShowMethodModal(true);
  };

  const handleToggleActive = async (method: PaymentMethodItem) => {
    const newStatus = !method.is_active;
    const { error } = await supabase.from('payment_methods').update({ is_active: newStatus }).eq('id', method.id);

    if (error) {
      showToast(`Failed to update status: ${error.message}`, 'error');
    } else {
      setPaymentMethods(paymentMethods.map((m) => (m.id === method.id ? { ...m, is_active: newStatus } : m)));
      showToast(`Payment method "${method.display_name}" is now ${newStatus ? 'ENABLED' : 'DISABLED'}.`);
    }
  };

  const moveMethod = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= paymentMethods.length) return;

    const newMethods = [...paymentMethods];
    const temp = newMethods[index];
    newMethods[index] = newMethods[targetIndex];
    newMethods[targetIndex] = temp;

    const reordered = newMethods.map((m, idx) => ({ ...m, sort_order: idx + 1 }));
    setPaymentMethods(reordered);

    for (const item of reordered) {
      await supabase.from('payment_methods').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    showToast('Payment method display order updated live!');
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImageToSupabase(file, 'qrcodes');
      setFormData((prev) => ({ ...prev, qr_code_url: url }));
      showToast('QR Code image uploaded successfully!');
    } catch (err: any) {
      showToast(`Image upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.display_name) {
      showToast('Please fill in Payment Method Name and Checkout Display Title.', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name,
      type: formData.type,
      display_name: formData.display_name,
      account_title: formData.account_title || null,
      account_number: formData.account_number || null,
      bank_name: formData.bank_name || null,
      branch_name: formData.branch_name || null,
      qr_code_url: formData.qr_code_url || null,
      instructions: formData.instructions || null,
      requires_payment_proof: formData.requires_payment_proof,
      is_active: formData.is_active,
      sort_order: Number(formData.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingMethod) {
        const { error } = await supabase.from('payment_methods').update(payload).eq('id', editingMethod.id);
        if (error) throw error;
        showToast(`Payment method "${formData.display_name}" updated successfully!`);
      } else {
        const { error } = await supabase.from('payment_methods').insert(payload);
        if (error) throw error;
        showToast(`New Payment method "${formData.display_name}" created successfully!`);
      }

      setShowMethodModal(false);
      resetForm();
      fetchPaymentMethods();
    } catch (err: any) {
      showToast(`Failed to save payment method: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMethod = async () => {
    if (!deleteConfirmMethod) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payment_methods').delete().eq('id', deleteConfirmMethod.id);
      if (error) throw error;

      setPaymentMethods(paymentMethods.filter((m) => m.id !== deleteConfirmMethod.id));
      showToast(`Payment method "${deleteConfirmMethod.display_name}" deleted.`);
      setDeleteConfirmMethod(null);
    } catch (err: any) {
      showToast(`Failed to delete payment method: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
      (s.whatsapp_number && s.whatsapp_number.includes(subscriberSearch))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Banner */}
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

      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#a63b7e]" /> Store Settings & Control Panel
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage store details, dynamic payment options, and new customer welcome popups.
          </p>
        </div>

        {activeTab === 'payments' && (
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPaymentMethods}
              className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPayments ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Payment Gateway
            </button>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-[#a63b7e] text-[#a63b7e]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Global Store Contact & Ticker Text
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-[#a63b7e] text-[#a63b7e]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#a63b7e]" /> Payment Gateways ({paymentMethods.length})
        </button>

        <button
          onClick={() => setActiveTab('popup')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'popup'
              ? 'border-[#a63b7e] text-[#a63b7e]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-500" /> Welcome Popup & Subscribers ({subscribers.length})
        </button>
      </div>

      {/* TAB 1: General Store Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs max-w-3xl">
          <div>
            <label className="font-extrabold text-gray-700 block mb-1">Store Announcement Bar Ticker Text</label>
            <input
              type="text"
              required
              value={settings.announcement_text}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Helpline Phone Number</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-semibold"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">WhatsApp Support Number</label>
              <input
                type="text"
                required
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-extrabold text-gray-700 block mb-1">Official Support Email</label>
            <input
              type="email"
              required
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-semibold"
            />
          </div>

          <div>
            <label className="font-extrabold text-gray-700 block mb-1">Physical Store Address</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={savingGeneral}
            className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-6 py-3 rounded-2xl font-extrabold text-xs shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {savingGeneral ? 'Saving...' : 'Save Store Details'}
          </button>
        </form>
      )}

      {/* TAB 2: Payment Methods Manager */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {loadingPayments ? (
            <div className="py-20 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
              Loading payment gateways from Supabase...
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method, idx) => {
                const badge = TYPE_BADGES[method.type] || TYPE_BADGES.custom;

                return (
                  <div
                    key={method.id}
                    className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                      method.is_active ? 'border-gray-200' : 'border-gray-200 bg-gray-50/50 opacity-70'
                    }`}
                  >
                    {/* Drag / Method Details */}
                    <div className="flex items-start gap-4">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shrink-0">
                        <button
                          onClick={() => moveMethod(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-600 hover:text-white hover:bg-[#a63b7e] disabled:opacity-20 rounded-lg transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveMethod(idx, 'down')}
                          disabled={idx === paymentMethods.length - 1}
                          className="p-1 text-gray-600 hover:text-white hover:bg-[#a63b7e] disabled:opacity-20 rounded-lg transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* QR Code Preview */}
                      {method.qr_code_url && (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
                          <Image src={method.qr_code_url} alt="QR Code" fill className="object-contain p-1" />
                        </div>
                      )}

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                            {badge.icon} {badge.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold">Order: #{idx + 1}</span>
                          {method.requires_payment_proof && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Requires Receipt Screenshot
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-gray-900 text-sm md:text-base font-serif">
                          {method.display_name}
                        </h4>

                        {method.bank_name && (
                          <p className="text-gray-700 font-bold">
                            Bank / Provider: <span className="text-gray-900">{method.bank_name}</span>
                          </p>
                        )}

                        {(method.account_title || method.account_number) && (
                          <div className="flex flex-wrap items-center gap-x-4 text-gray-600">
                            {method.account_title && (
                              <span>Title: <strong className="text-gray-800">{method.account_title}</strong></span>
                            )}
                            {method.account_number && (
                              <span>Acc / IBAN: <strong className="text-gray-800 font-mono">{method.account_number}</strong></span>
                            )}
                          </div>
                        )}

                        {method.instructions && (
                          <p className="text-gray-500 text-[11px] line-clamp-1 italic max-w-lg">
                            "{method.instructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleOpenEditModal(method)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-50 text-[#a63b7e] hover:bg-pink-100 transition flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Details
                      </button>

                      <button
                        onClick={() => handleToggleActive(method)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                          method.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {method.is_active ? <><Eye className="w-3.5 h-3.5" /> Active</> : <><EyeOff className="w-3.5 h-3.5" /> Disabled</>}
                      </button>

                      <button
                        onClick={() => setDeleteConfirmMethod(method)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Gateway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Welcome Popup & Newsletter Subscribers */}
      {activeTab === 'popup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Popup Settings Form */}
          <form onSubmit={handleSavePopupSettings} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#a63b7e]" /> Welcome Popup Configuration
                </h3>
                <p className="text-gray-500 text-[11px]">Customize text, timing & behavior of first-visit welcome popup.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={popupSettings.is_enabled}
                  onChange={(e) => setPopupSettings({ ...popupSettings, is_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a63b7e]" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Delay Before Showing (Seconds)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={popupSettings.delay_seconds}
                    onChange={(e) => setPopupSettings({ ...popupSettings, delay_seconds: Number(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Frequency (Days between popups)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={popupSettings.frequency_days}
                  onChange={(e) => setPopupSettings({ ...popupSettings, frequency_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-bold"
                />
                <span className="text-[10px] text-gray-400">0 = Show every page refresh</span>
              </div>
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Discount Badge Label</label>
              <input
                type="text"
                value={popupSettings.discount_badge_text}
                onChange={(e) => setPopupSettings({ ...popupSettings, discount_badge_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-bold"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Main Headline</label>
              <input
                type="text"
                required
                value={popupSettings.headline}
                onChange={(e) => setPopupSettings({ ...popupSettings, headline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Short Description</label>
              <textarea
                rows={2}
                value={popupSettings.description}
                onChange={(e) => setPopupSettings({ ...popupSettings, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
              />
            </div>

            <div>
              <label className="font-extrabold text-gray-700 block mb-1">Subscribe Button Text</label>
              <input
                type="text"
                value={popupSettings.button_text}
                onChange={(e) => setPopupSettings({ ...popupSettings, button_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-bold"
              />
            </div>

            <label className="flex items-center gap-2.5 p-3 border border-gray-200 rounded-2xl bg-pink-50/40 cursor-pointer">
              <input
                type="checkbox"
                checked={popupSettings.require_whatsapp}
                onChange={(e) => setPopupSettings({ ...popupSettings, require_whatsapp: e.target.checked })}
                className="w-4 h-4 text-[#a63b7e] rounded"
              />
              <div>
                <span className="font-extrabold text-gray-900 block text-xs">
                  Require WhatsApp Number Field
                </span>
                <span className="text-[10px] text-gray-500">
                  If enabled, visitor must provide both Email and WhatsApp number to unlock coupons.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={savingPopup}
              className="w-full py-3 bg-[#a63b7e] hover:bg-[#872b64] text-white rounded-2xl font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> {savingPopup ? 'Updating Live Popup...' : 'Save Welcome Popup Settings'}
            </button>
          </form>

          {/* Right Column: Newsletter Subscribers List & Management */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#a63b7e]" /> Newsletter Subscribers ({subscribers.length})
                </h3>
                <p className="text-gray-500 text-[11px]">Customers who subscribed via Welcome Popup.</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {subscribers.length} Total
                </span>

                {/* Prominent Red Delete All Subscribers Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(true)}
                  disabled={subscribers.length === 0}
                  className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition disabled:opacity-40 active:scale-95"
                  title="Delete All Subscribers"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete All
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search subscriber by email or WhatsApp..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
              />
            </div>

            {/* Subscribers Table */}
            <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-100">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <div key={sub.id} className="p-3 hover:bg-gray-50 transition flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                        <Mail className="w-3.5 h-3.5 text-[#a63b7e]" />
                        <span>{sub.email}</span>
                      </div>
                      {sub.whatsapp_number && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Phone className="w-3 h-3 text-green-600" />
                          <span>{sub.whatsapp_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>

                      {/* Individual Row Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmSub(sub)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No subscribers found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Subscriber Confirmation Modal */}
      {deleteConfirmSub && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center text-xs border border-gray-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-gray-900">
                Delete Subscriber?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently remove <strong className="text-gray-900">{deleteConfirmSub.email}</strong> from your newsletter list?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSub(null)}
                disabled={deletingSingleSub}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSingleSubscriber}
                disabled={deletingSingleSub}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {deletingSingleSub ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typed Confirmation Modal for "Delete All Subscribers" */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-[999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl text-xs border border-red-100 relative">
            <button
              onClick={() => {
                setShowDeleteAllModal(false);
                setTypedConfirmText('');
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-red-900">⚠️ Danger Zone Action</h4>
                <p className="text-[11px] text-red-700 leading-tight">
                  You are about to permanently delete ALL {subscribers.length} newsletter subscribers.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <p>
                This action will completely wipe all subscriber emails and WhatsApp contact records from the Supabase database. <strong>This action cannot be undone.</strong>
              </p>
              <p className="font-bold text-gray-900">
                To confirm deletion, please type <span className="font-mono text-red-600 font-extrabold underline">DELETE</span> below:
              </p>

              <input
                type="text"
                placeholder="Type DELETE to confirm..."
                value={typedConfirmText}
                onChange={(e) => setTypedConfirmText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold text-red-600 text-sm tracking-wider"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setTypedConfirmText('');
                }}
                disabled={deletingAllSubscribers}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAllSubscribers}
                disabled={typedConfirmText !== 'DELETE' || deletingAllSubscribers}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-extrabold shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {deletingAllSubscribers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Wiping All Data...
                  </>
                ) : (
                  'Permanently Delete All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Payment Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative text-xs">
            <button
              onClick={() => setShowMethodModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#a63b7e]" />
              {editingMethod ? `Edit Gateway: ${editingMethod.name}` : 'Add Payment Gateway'}
            </h3>

            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Internal Admin Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meezan Bank Transfer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Payment Method Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'custom',
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl bg-white font-bold"
                  >
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="easypaisa">EasyPaisa Mobile Account</option>
                    <option value="jazzcash">JazzCash Mobile Account</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="custom">Custom Online Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Public Display Title (Shown at Checkout) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meezan Bank - Direct Transfer"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              {formData.type !== 'cod' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-extrabold text-gray-700 block mb-1">Bank / Wallet Provider Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Meezan Bank, Telenor Bank"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-gray-700 block mb-1">Account Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Anila Habib"
                        value={formData.account_title}
                        onChange={(e) => setFormData({ ...formData, account_title: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-gray-700 block mb-1">Account Number / IBAN / Mobile No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 01020304050607 or PK64MEZN..."
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>

                  {/* QR Code Image File Picker */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <label className="font-extrabold text-gray-800 block">QR Code Scan & Pay Image (Optional)</label>
                    <div className="flex items-center gap-4">
                      {formData.qr_code_url ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-300 shrink-0 bg-white p-1">
                          <Image src={formData.qr_code_url} alt="QR Code" fill className="object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0 bg-white">
                          <QrCode className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-[#a63b7e] hover:file:bg-pink-100 cursor-pointer"
                        />
                        {isUploading && <p className="text-[10px] text-gray-500 animate-pulse">Uploading QR code image...</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Customer Step-by-Step Payment Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Step 1: Transfer amount to account. Step 2: Upload receipt screenshot..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              {formData.type !== 'cod' && (
                <label className="flex items-center gap-2.5 p-3 border border-gray-200 rounded-2xl bg-pink-50/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_payment_proof}
                    onChange={(e) => setFormData({ ...formData, requires_payment_proof: e.target.checked })}
                    className="w-4 h-4 text-[#a63b7e] rounded"
                  />
                  <div>
                    <span className="font-extrabold text-gray-900 block text-xs">
                      Require Payment Proof Upload Box at Checkout
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Allows customers to attach transaction receipt screenshot during order checkout.
                    </span>
                  </div>
                </label>
              )}

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#a63b7e] hover:bg-[#872b64] text-white py-3 rounded-2xl font-extrabold shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Payment Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Method Confirmation Modal */}
      {deleteConfirmMethod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center text-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-serif">
                Delete "{deleteConfirmMethod.display_name}"?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                This payment method option will be removed from checkout.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmMethod(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMethod}
                className="px-5 py-2 rounded-xl bg-red-600 text-[#fff] font-extrabold text-xs shadow-md"
              >
                Yes, Delete Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
