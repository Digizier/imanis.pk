'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  Megaphone,
  Target,
  Copy,
  Check,
  Download,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  Eye,
  ShoppingBag,
  Activity,
  Save,
  HelpCircle,
  X
} from 'lucide-react';

export interface CatalogItem {
  id: string;
  product_id?: string | null;
  title: string;
  description?: string | null;
  availability: 'in stock' | 'out of stock' | 'preorder';
  condition: 'new' | 'refurbished' | 'used';
  price: number;
  sale_price?: number | null;
  currency: string;
  link: string;
  image_link: string;
  brand: string;
  fb_product_category?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MarketingSettings {
  id: string;
  meta_pixel_id: string;
  is_pixel_enabled: boolean;
  test_event_code?: string | null;
  catalog_title: string;
  catalog_description: string;
}

export default function AdminAdvertisementPage() {
  const [activeTab, setActiveTab] = useState<'pixel' | 'catalog'>('pixel');

  // Pixel Settings State
  const [pixelSettings, setPixelSettings] = useState<MarketingSettings>({
    id: 'default',
    meta_pixel_id: '1316498475903579',
    is_pixel_enabled: true,
    test_event_code: '',
    catalog_title: "Imani's Collection Product Catalog",
    catalog_description: "Official product catalog feed for Imani's Collection store",
  });
  const [savingPixel, setSavingPixel] = useState(false);
  const [copiedPixelId, setCopiedPixelId] = useState(false);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState(false);
  const [copiedCsvUrl, setCopiedCsvUrl] = useState(false);

  // Catalog State
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CatalogItem> | null>(null);
  const [savingModal, setSavingModal] = useState(false);

  // Delete Confirm Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CatalogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://imanis.pk';
  const liveXmlFeedUrl = `${originUrl}/api/facebook-catalog`;
  const liveCsvFeedUrl = `${originUrl}/api/facebook-catalog?format=csv`;

  // Fetch Marketing Settings & Catalog Items
  const fetchData = async () => {
    try {
      // 1. Fetch Marketing Settings
      const { data: mData } = await supabase
        .from('marketing_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (mData) {
        setPixelSettings({
          id: mData.id || 'default',
          meta_pixel_id: mData.meta_pixel_id || '1316498475903579',
          is_pixel_enabled: mData.is_pixel_enabled ?? true,
          test_event_code: mData.test_event_code || '',
          catalog_title: mData.catalog_title || "Imani's Collection Product Catalog",
          catalog_description: mData.catalog_description || "Official product catalog feed for Imani's Collection store",
        });
      }

      // 2. Fetch Catalog Items
      setLoadingCatalog(true);
      const { data: cData, error: cErr } = await supabase
        .from('facebook_catalog_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (cData && cData.length > 0) {
        setCatalogItems(cData as CatalogItem[]);
      } else if (!cErr) {
        // If table empty, trigger auto initial sync from products
        await handleSyncFromProducts(false);
      }
    } catch (err) {
      console.error('Error loading advertisement data:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Meta Pixel Settings
  const handleSavePixelSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPixel(true);
    try {
      const { error } = await supabase
        .from('marketing_settings')
        .upsert({
          id: 'default',
          meta_pixel_id: pixelSettings.meta_pixel_id.trim(),
          is_pixel_enabled: pixelSettings.is_pixel_enabled,
          test_event_code: pixelSettings.test_event_code?.trim() || null,
          catalog_title: pixelSettings.catalog_title,
          catalog_description: pixelSettings.catalog_description,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      showToast('Meta Pixel settings updated & saved successfully!');
    } catch (err: any) {
      showToast('Failed to save pixel settings: ' + err.message, 'error');
    } finally {
      setSavingPixel(false);
    }
  };

  // Synchronize Live Products into facebook_catalog_items
  const handleSyncFromProducts = async (showNotification = true) => {
    setSyncingProducts(true);
    try {
      // Fetch all products and categories
      const { data: products } = await supabase.from('products').select('*');
      const { data: categories } = await supabase.from('categories').select('*');

      if (!products || products.length === 0) {
        if (showNotification) showToast('No products found in store to sync.', 'error');
        return;
      }

      const categoryMap = new Map<string, string>();
      categories?.forEach((c) => categoryMap.set(c.id, c.name));

      const catalogPayload = products.map((p) => ({
        id: p.sku || p.id,
        product_id: p.id,
        title: p.name,
        description: p.short_description || p.full_description || p.name,
        availability: (p.total_stock && p.total_stock > 0) ? 'in stock' : 'out of stock',
        condition: 'new',
        price: p.regular_price || 0,
        sale_price: p.sale_price || null,
        currency: 'PKR',
        link: `https://imanis.pk/products/${p.slug}`,
        image_link: p.main_image || 'https://imanis.pk/og-image.png',
        brand: p.brand || "Imani's Collection",
        fb_product_category: categoryMap.get(p.category_id || '') || 'Apparel & Accessories > Clothing',
        is_active: p.status === 'active',
        updated_at: new Date().toISOString(),
      }));

      // Upsert into facebook_catalog_items
      const { error } = await supabase
        .from('facebook_catalog_items')
        .upsert(catalogPayload, { onConflict: 'id' });

      if (error) throw error;

      // Refresh list
      const { data: refreshed } = await supabase
        .from('facebook_catalog_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (refreshed) setCatalogItems(refreshed as CatalogItem[]);
      if (showNotification) showToast(`Successfully synchronized ${catalogPayload.length} live products into Meta Catalog!`);
    } catch (err: any) {
      if (showNotification) showToast('Sync failed: ' + err.message, 'error');
    } finally {
      setSyncingProducts(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: 'pixel' | 'feed' | 'csv') => {
    navigator.clipboard.writeText(text);
    if (type === 'pixel') {
      setCopiedPixelId(true);
      setTimeout(() => setCopiedPixelId(false), 2500);
    } else if (type === 'feed') {
      setCopiedFeedUrl(true);
      setTimeout(() => setCopiedFeedUrl(false), 2500);
    } else {
      setCopiedCsvUrl(true);
      setTimeout(() => setCopiedCsvUrl(false), 2500);
    }
  };

  // Download Meta Compliant CSV
  const handleDownloadCsv = () => {
    const activeItems = catalogItems.filter((i) => i.is_active);
    if (activeItems.length === 0) {
      showToast('No active catalog items available to export.', 'error');
      return;
    }

    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'sale_price',
      'link',
      'image_link',
      'brand',
      'fb_product_category',
    ];

    const csvRows = [headers.join(',')];

    activeItems.forEach((item) => {
      const escape = (str: string | number | null | undefined) => {
        if (str === null || str === undefined) return '""';
        const s = String(str).replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, ' ');
        return `"${s}"`;
      };

      const row = [
        escape(item.id),
        escape(item.title),
        escape(item.description || item.title),
        escape(item.availability),
        escape(item.condition),
        escape(`${item.price.toFixed(2)} PKR`),
        escape(item.sale_price ? `${item.sale_price.toFixed(2)} PKR` : ''),
        escape(item.link),
        escape(item.image_link),
        escape(item.brand),
        escape(item.fb_product_category || 'Apparel & Accessories > Clothing'),
      ];
      csvRows.push(row.join(','));
    });

    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(csvBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.setAttribute('download', `meta-catalog-imanis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('Meta Catalog CSV downloaded successfully!');
  };

  // Add / Edit Catalog Item
  const handleSaveModalItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.id || !editingItem?.title || !editingItem?.link || !editingItem?.image_link) {
      showToast('Please fill all required fields (ID, Title, Link, Image Link).', 'error');
      return;
    }

    setSavingModal(true);
    try {
      const payload = {
        id: editingItem.id.trim(),
        title: editingItem.title.trim(),
        description: editingItem.description || editingItem.title,
        availability: editingItem.availability || 'in stock',
        condition: editingItem.condition || 'new',
        price: Number(editingItem.price) || 0,
        sale_price: editingItem.sale_price ? Number(editingItem.sale_price) : null,
        currency: 'PKR',
        link: editingItem.link.trim(),
        image_link: editingItem.image_link.trim(),
        brand: editingItem.brand || "Imani's Collection",
        fb_product_category: editingItem.fb_product_category || 'Apparel & Accessories > Clothing',
        is_active: editingItem.is_active ?? true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('facebook_catalog_items')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      showToast(`Catalog item "${payload.title}" saved successfully!`);
      setIsModalOpen(false);
      setEditingItem(null);

      // Refresh list
      const { data: refreshed } = await supabase
        .from('facebook_catalog_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshed) setCatalogItems(refreshed as CatalogItem[]);
    } catch (err: any) {
      showToast('Failed to save catalog item: ' + err.message, 'error');
    } finally {
      setSavingModal(false);
    }
  };

  // Delete Item
  const handleExecuteDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('facebook_catalog_items')
        .delete()
        .eq('id', deleteConfirmItem.id);

      if (error) throw error;

      setCatalogItems(catalogItems.filter((i) => i.id !== deleteConfirmItem.id));
      showToast(`Item "${deleteConfirmItem.title}" deleted from Catalog.`);
      setDeleteConfirmItem(null);
    } catch (err: any) {
      showToast('Failed to delete item: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Item Active Status
  const handleToggleItemStatus = async (item: CatalogItem) => {
    try {
      const newStatus = !item.is_active;
      const { error } = await supabase
        .from('facebook_catalog_items')
        .update({ is_active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

      setCatalogItems(
        catalogItems.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i))
      );
      showToast(`Item status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  // Filter Catalog Items
  const filteredCatalogItems = catalogItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fb_product_category && item.fb_product_category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAvailability =
      filterAvailability === 'all' || item.availability === filterAvailability;

    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6 relative pb-12">
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
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#a63b7e]" /> Advertisement & Marketing Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Meta (Facebook & Instagram) Pixel Tracking and Live Product Catalog Data Feeds.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-gray-200/80 p-1 rounded-2xl border border-gray-300">
          <button
            type="button"
            onClick={() => setActiveTab('pixel')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeTab === 'pixel'
                ? 'bg-white text-[#a63b7e] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> 1. Meta Pixel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-white text-[#a63b7e] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 2. Meta Product Catalog ({catalogItems.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: META (FACEBOOK) PIXEL SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'pixel' && (
        <div className="space-y-6">
          {/* Main Pixel Config Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 font-serif flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#a63b7e]" /> Meta Pixel Integration
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Track website visitors, product impressions, add to cart actions, checkouts, and real-time purchases.
                </p>
              </div>

              {/* Master ON/OFF Switch */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full transition ${
                    pixelSettings.is_pixel_enabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {pixelSettings.is_pixel_enabled ? 'Pixel Status: ACTIVE' : 'Pixel Status: DISABLED'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPixelSettings({
                      ...pixelSettings,
                      is_pixel_enabled: !pixelSettings.is_pixel_enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pixelSettings.is_pixel_enabled ? 'bg-[#a63b7e]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      pixelSettings.is_pixel_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePixelSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Meta Pixel ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                    Meta (Facebook) Pixel ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={pixelSettings.meta_pixel_id}
                      onChange={(e) =>
                        setPixelSettings({ ...pixelSettings, meta_pixel_id: e.target.value })
                      }
                      placeholder="e.g. 1316498475903579"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 font-mono font-bold text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(pixelSettings.meta_pixel_id, 'pixel')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                    >
                      {copiedPixelId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Find this 15–16 digit ID inside your Meta Events Manager Dashboard.
                  </p>
                </div>

                {/* Optional Test Event Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                    Meta Test Event Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={pixelSettings.test_event_code || ''}
                    onChange={(e) =>
                      setPixelSettings({ ...pixelSettings, test_event_code: e.target.value })
                    }
                    placeholder="e.g. TEST12345 (Leave blank for standard live tracking)"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 font-mono text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                  <p className="text-[11px] text-gray-500">
                    Used to send test events directly to Meta Events Manager "Test Events" tab.
                  </p>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPixel}
                  className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-6 py-3 rounded-2xl font-extrabold text-xs shadow-md shadow-pink-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {savingPixel ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Pixel Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Tracking Events Status Cards */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#a63b7e]" /> Configured E-Commerce Tracking Events
            </h3>
            <p className="text-xs text-gray-500">
              The following standard Meta E-Commerce events are pre-configured to fire automatically across your storefront:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-gray-900">PageView</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-600">Fires on every storefront route transition (Home, Shop, Categories, etc.)</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-gray-900">ViewContent</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-600">Fires on Product Detail Pages (/products/[slug]) with product ID, title, and PKR value.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-gray-900">AddToCart</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-600">Fires when a customer adds an item to their shopping bag with selected size & color.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-gray-900">InitiateCheckout</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-600">Fires when a customer proceeds to the /checkout page with total cart PKR amount.</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-gray-900">Purchase</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-600">Fires on successful order placement (/order-success) with order total and currency.</p>
              </div>

              <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#a63b7e]">Dynamic Match</span>
                  <ShieldCheck className="w-4 h-4 text-[#a63b7e]" />
                </div>
                <p className="text-[11px] text-gray-700">Pixel content_ids exactly match your Catalog IDs for 100% Retargeting Ads accuracy.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: META PRODUCT CATALOG MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Feed URL & Actions Hub */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 font-serif flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#a63b7e]" /> Meta Product Catalog Live Feed Hub
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect this live feed URL into your Meta Commerce Manager Data Sources for automatic scheduled synchronization.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sync from Store Button */}
                <button
                  type="button"
                  onClick={() => handleSyncFromProducts(true)}
                  disabled={syncingProducts}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-800 px-3.5 py-2 rounded-xl text-xs font-bold border border-purple-200 transition flex items-center gap-1.5 disabled:opacity-50"
                  title="Pulls latest changes, prices, and products from live store"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingProducts ? 'animate-spin' : ''}`} />
                  {syncingProducts ? 'Syncing...' : 'Sync Live Products'}
                </button>

                {/* Download CSV Button */}
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Meta CSV
                </button>

                {/* Add Custom Item Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({
                      id: `CAT-${Date.now().toString().slice(-6)}`,
                      title: '',
                      description: '',
                      availability: 'in stock',
                      condition: 'new',
                      price: 1499,
                      sale_price: 999,
                      currency: 'PKR',
                      link: 'https://imanis.pk/shop',
                      image_link: 'https://imanis.pk/og-image.png',
                      brand: "Imani's Collection",
                      fb_product_category: 'Apparel & Accessories > Clothing',
                      is_active: true,
                    });
                    setIsModalOpen(true);
                  }}
                  className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Catalog Item
                </button>
              </div>
            </div>

            {/* Live Feed URLs Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Primary XML/RSS Feed URL */}
              <div className="p-4 bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-white rounded-2xl border border-pink-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a63b7e] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#a63b7e]" /> Primary Live Feed URL (XML / RSS 2.0)
                  </span>
                  <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                    Recommended by Meta
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveXmlFeedUrl}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 text-xs font-mono text-gray-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(liveXmlFeedUrl, 'feed')}
                    className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    {copiedFeedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFeedUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  Paste this URL in <strong>Meta Commerce Manager ➔ Catalogs ➔ Data Sources ➔ Scheduled Data Feed</strong>.
                </p>
              </div>

              {/* Direct CSV Feed URL */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                    Direct CSV Stream URL (Alternative)
                  </span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                    CSV Format
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveCsvFeedUrl}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-mono text-gray-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(liveCsvFeedUrl, 'csv')}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    {copiedCsvUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCsvUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  Returns raw CSV with official Meta header columns for manual import or automated CSV scrapers.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Catalog Data Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search catalog items by Title, SKU, Brand, or Category..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 bg-white focus:outline-none"
                >
                  <option value="all">All Availability Status</option>
                  <option value="in stock">In Stock</option>
                  <option value="out of stock">Out of Stock</option>
                  <option value="preorder">Pre-order</option>
                </select>
                <span className="text-xs font-bold text-gray-500">
                  Showing {filteredCatalogItems.length} of {catalogItems.length} items
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-extrabold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">Image & Title</th>
                    <th className="py-3 px-3.5">ID / SKU</th>
                    <th className="py-3 px-3.5">Price</th>
                    <th className="py-3 px-3.5">Sale Price</th>
                    <th className="py-3 px-3.5">Stock</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                  {loadingCatalog ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#a63b7e]" />
                        Loading Meta Catalog Items...
                      </td>
                    </tr>
                  ) : filteredCatalogItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500 space-y-2">
                        <p className="font-bold text-sm">No catalog items found.</p>
                        <p className="text-xs text-gray-400">
                          Click "Sync Live Products" above to automatically pull your store products.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCatalogItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition">
                        {/* Title & Image */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <Image
                                src={item.image_link || '/placeholder.png'}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="max-w-[200px] sm:max-w-xs">
                              <span className="font-bold text-gray-900 block truncate" title={item.title}>
                                {item.title}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {item.brand || "Imani's Collection"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ID / SKU */}
                        <td className="py-3 px-3.5 font-mono text-[11px] font-bold text-gray-700">
                          {item.id}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3.5 font-bold text-gray-900">
                          Rs. {item.price.toLocaleString()}
                        </td>

                        {/* Sale Price */}
                        <td className="py-3 px-3.5">
                          {item.sale_price ? (
                            <span className="font-bold text-[#a63b7e]">
                              Rs. {item.sale_price.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Availability */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              item.availability === 'in stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.availability}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3.5 text-gray-600 max-w-[140px] truncate" title={item.fb_product_category || ''}>
                          {item.fb_product_category || 'Clothing'}
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3 px-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleItemStatus(item)}
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition ${
                              item.is_active
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                          >
                            {item.is_active ? 'In Feed' : 'Hidden'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                              title="View Product Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-[#a63b7e] rounded-lg hover:bg-pink-50 transition"
                              title="Edit Catalog Item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Delete from Catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CATALOG ITEM */}
      {/* ========================================================================= */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
                {editingItem.id && catalogItems.some((i) => i.id === editingItem.id)
                  ? 'Edit Meta Catalog Item'
                  : 'Add New Meta Catalog Item'}
              </h3>
              <p className="text-gray-500 mt-0.5 text-[11px]">
                Fields strictly follow Meta Commerce Manager official catalog specifications.
              </p>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product ID / SKU */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Product ID / SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                    placeholder="e.g. SKU-1002"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                  />
                </div>

                {/* Product Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Men Slim Fit Polo T-Shirt"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                  />
                </div>

                {/* Regular Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Regular Price (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editingItem.price ?? ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="1499"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                  />
                </div>

                {/* Sale Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Sale Price (PKR) (Optional)
                  </label>
                  <input
                    type="number"
                    value={editingItem.sale_price ?? ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        sale_price: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="999"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                  />
                </div>

                {/* Stock Availability */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem.availability || 'in stock'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        availability: e.target.value as 'in stock' | 'out of stock' | 'preorder',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none"
                  >
                    <option value="in stock">in stock</option>
                    <option value="out of stock">out of stock</option>
                    <option value="preorder">preorder</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem.condition || 'new'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        condition: e.target.value as 'new' | 'refurbished' | 'used',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none"
                  >
                    <option value="new">new</option>
                    <option value="refurbished">refurbished</option>
                    <option value="used">used</option>
                  </select>
                </div>

                {/* Product Live Link */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Live Product URL Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={editingItem.link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    placeholder="https://imanis.pk/products/your-product-slug"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                  />
                </div>

                {/* Image Link */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Main Image URL Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={editingItem.image_link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, image_link: e.target.value })}
                    placeholder="https://...supabase.co/.../product.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">Brand Name</label>
                  <input
                    type="text"
                    value={editingItem.brand || "Imani's Collection"}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 block">Category / Taxonomy</label>
                  <input
                    type="text"
                    value={editingItem.fb_product_category || 'Apparel & Accessories > Clothing'}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, fb_product_category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 block">Description (Plain Text)</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Enter clean plain text description..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#a63b7e]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModal}
                  className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-pink-200"
                >
                  {savingModal ? 'Saving...' : 'Save Catalog Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">Delete from Meta Catalog?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <strong>"{deleteConfirmItem.title}"</strong> from the Meta Catalog feed?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDeleteItem}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
