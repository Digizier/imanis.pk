'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { HomepageSection, Product } from '@/types';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import {
  Sliders,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  Layout,
  Upload,
  AlertTriangle,
  Flame,
  Shirt,
  MessageSquare,
  Code,
  RefreshCw
} from 'lucide-react';

const SECTION_TYPE_BADGES: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  hero_carousel: { label: 'Hero Carousel', bg: 'bg-purple-100', text: 'text-purple-700', icon: <Sparkles className="w-3.5 h-3.5" /> },
  crazy_deals: { label: 'Crazy Deals', bg: 'bg-red-100', text: 'text-red-700', icon: <Flame className="w-3.5 h-3.5" /> },
  category_grid: { label: 'Category Grid', bg: 'bg-blue-100', text: 'text-blue-700', icon: <Shirt className="w-3.5 h-3.5" /> },
  featured_products: { label: 'Product Grid', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <Layers className="w-3.5 h-3.5" /> },
  promo_banners: { label: 'Promo Banner', bg: 'bg-amber-100', text: 'text-amber-700', icon: <Layout className="w-3.5 h-3.5" /> },
  reviews: { label: 'Testimonials', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  custom_html: { label: 'Custom Content', bg: 'bg-gray-100', text: 'text-gray-700', icon: <Code className="w-3.5 h-3.5" /> },
};

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaUrl: string;
  is_active?: boolean;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: '1',
    badge: 'UP TO 60% OFF',
    title: "Pakistan's Favorite Summer Fashion Sale 2026",
    subtitle: 'Smart Style, Everyday Savings on Kids Wear, Polos & Activewear',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80',
    ctaText: 'Shop Summer Deals',
    ctaUrl: '/collections/crazy-deals',
    is_active: true,
  },
  {
    id: '2',
    badge: 'ORGANIC COTTON',
    title: 'Kids Organic Cotton & Romper Collection',
    subtitle: 'Ultra-soft, skin-friendly daily wear frocks, rompers & twin sets',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1600&q=80',
    ctaText: 'Explore Kids Wear',
    ctaUrl: '/categories/kids',
    is_active: true,
  },
  {
    id: '3',
    badge: 'BREATHABLE TECH',
    title: 'High Performance Gym & Activewear',
    subtitle: 'Moisture-wicking breathable tees, shorts & athletic twin sets',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80',
    ctaText: 'Shop Activewear',
    ctaUrl: '/categories/activewear',
    is_active: true,
  },
];

export default function AdminHomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamic Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSavingSlides, setIsSavingSlides] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add Section Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState('featured_products');
  const [newSectionName, setNewSectionName] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    
    // Automatic Deduplication & Filtering Guard
    const seen = new Set();
    const uniqueSecs: HomepageSection[] = [];
    (data || []).forEach((sec) => {
      // Ignore unnecessary sections requested for removal
      if (['hero_carousel', 'crazy_deals', 'featured_products'].includes(sec.section_type)) {
        return;
      }
      const key = `${sec.section_type}_${sec.internal_name}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSecs.push(sec);
      }
    });

    setSections(uniqueSecs);

    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');
    setProducts(prodData || []);

    const { data: heroData } = await supabase.from('store_settings').select('*').eq('key', 'homepage_hero_slides').single();
    if (heroData?.value && Array.isArray(heroData.value) && heroData.value.length > 0) {
      setHeroSlides(heroData.value);
    }

    setHasUnsavedChanges(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSaveHeroSlides = async (slidesToSave: HeroSlide[]) => {
    setIsSavingSlides(true);
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ key: 'homepage_hero_slides', value: slidesToSave }, { onConflict: 'key' });

      if (error) throw error;
      setHeroSlides(slidesToSave);
      showToast('🎉 Homepage Hero Banner Slider updated and live!');
      setIsSlideModalOpen(false);
      setEditingSlide(null);
    } catch (err: any) {
      showToast(`Failed to save hero slides: ${err.message}`);
    } finally {
      setIsSavingSlides(false);
    }
  };

  const handleSlideImageUpload = async (file: File) => {
    if (!editingSlide) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadImageToSupabase(file, 'banners');
      setEditingSlide({ ...editingSlide, image: publicUrl });
      showToast('Banner image uploaded successfully!');
    } catch (err: any) {
      showToast('Image upload failed: ' + (err.message || 'Error uploading image'));
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle Enable/Disable in Local State & Auto-Save
  const toggleSection = async (id: string, currentState: boolean) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, is_enabled: !currentState } : sec
    );
    setSections(updated);
    setHasUnsavedChanges(true);

    const { error } = await supabase
      .from('homepage_sections')
      .update({ is_enabled: !currentState })
      .eq('id', id);

    if (error) {
      showToast(`Error: ${error.message}`);
    } else {
      showToast(`Section ${!currentState ? 'Enabled' : 'Disabled'}! Click "Save Layout Order" to lock changes.`);
    }
  };

  // Move Section Up / Down in Local State
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate sort_order values for array
    const reordered = newSections.map((sec, idx) => ({
      ...sec,
      sort_order: idx + 1,
    }));

    setSections(reordered);
    setHasUnsavedChanges(true);
    showToast('Section order changed! Click "Save Layout Order" button to apply to live homepage.');
  };

  // Explicit Batch Save Layout Order to Database
  const handleSaveAllLayoutOrder = async () => {
    setIsSaving(true);
    try {
      // Save each section's sort_order to Supabase
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const newOrder = i + 1;
        await supabase
          .from('homepage_sections')
          .update({
            sort_order: newOrder,
            is_enabled: sec.is_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sec.id);
      }

      setHasUnsavedChanges(false);
      showToast('🎉 Homepage layout order saved successfully! Changes are now live on storefront.');
      fetchSections();
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Edit Form Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('homepage_sections')
      .update({
        internal_name: editingSection.internal_name,
        public_title: editingSection.public_title,
        subtitle: editingSection.subtitle,
        desktop_image: editingSection.desktop_image,
        mobile_image: editingSection.mobile_image,
        cta_label: editingSection.cta_label,
        cta_url: editingSection.cta_url,
        metadata: editingSection.metadata || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingSection.id);

    setIsSaving(false);
    if (error) {
      showToast(`Error: ${error.message}`);
    } else {
      showToast('Section settings saved successfully!');
      setEditingSection(null);
      fetchSections();
    }
  };

  // Add New Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName) return;

    const nextSortOrder = sections.length + 1;
    const { error } = await supabase.from('homepage_sections').insert({
      internal_name: newSectionName,
      public_title: newSectionName,
      subtitle: 'Custom section subtitle',
      section_type: newSectionType,
      is_enabled: true,
      sort_order: nextSortOrder,
      metadata: { limit: 4 },
    });

    if (error) {
      showToast(`Error: ${error.message}`);
    } else {
      showToast('New section added to Homepage!');
      setIsAddModalOpen(false);
      setNewSectionName('');
      fetchSections();
    }
  };

  // Delete Section
  const handleDeleteSection = async (id: string) => {
    await supabase.from('homepage_sections').delete().eq('id', id);
    showToast('Section removed from Homepage!');
    setDeleteConfirmId(null);
    fetchSections();
  };

  // Handle Image Upload for Banners
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'desktop_image' | 'mobile_image') => {
    const file = e.target.files?.[0];
    if (!file || !editingSection) return;

    setIsUploading(true);
    try {
      const url = await uploadImageToSupabase(file, 'banners');
      setEditingSection({ ...editingSection, [field]: url });
      showToast('Banner image uploaded!');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2 border border-gray-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
          <Sliders className="w-7 h-7 text-[#a63b7e]" /> Dynamic Homepage Hero Banner Manager
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage storefront main carousel slider banners, promotional badges, headlines, button links, and high-res images.
        </p>
      </div>

      {/* 🖼️ Dynamic Homepage Hero Banner Slider Manager */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#a63b7e]" /> Dynamic Homepage Hero Banner Slider Manager
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize main hero carousel banners, promotional badges, headlines, button links, and upload high-res banner images.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-200 rounded-xl text-[11px] font-bold text-[#a63b7e]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>📌 Recommended Image Resolution: <strong>1920 x 800 px</strong> (or 16:9 ratio, Max 2MB)</span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingSlide({
                id: Date.now().toString(),
                badge: 'NEW ARRIVAL',
                title: 'New Fashion Collection 2026',
                subtitle: 'Discover premium Pakistani fashion trends',
                image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80',
                ctaText: 'Explore Collection',
                ctaUrl: '/shop',
                is_active: true,
              });
              setIsSlideModalOpen(true);
            }}
            className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Hero Slide
          </button>
        </div>

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                slide.is_active !== false ? 'bg-gray-50/80 border-gray-200' : 'bg-gray-100/50 border-gray-300 opacity-60'
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 p-2 flex flex-col justify-between">
                  <span className="self-start px-2 py-0.5 bg-[#a63b7e] text-white text-[9px] font-black uppercase rounded-full">
                    {slide.badge || 'PROMO'}
                  </span>
                  <span className="self-end px-2 py-0.5 bg-black/70 text-white text-[9px] font-mono rounded-md">
                    Slide #{idx + 1}
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="font-extrabold text-xs text-gray-900 line-clamp-1 font-serif">{slide.title}</h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">{slide.subtitle}</p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] bg-pink-100 text-[#a63b7e] font-bold px-2 py-0.5 rounded-lg truncate">
                    {slide.ctaText} → {slide.ctaUrl}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    const updated = heroSlides.map((s, i) =>
                      i === idx ? { ...s, is_active: !(s.is_active !== false) } : s
                    );
                    handleSaveHeroSlides(updated);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    slide.is_active !== false
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {slide.is_active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {slide.is_active !== false ? 'Active' : 'Disabled'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSlide(slide);
                      setIsSlideModalOpen(true);
                    }}
                    className="p-1.5 text-gray-600 hover:text-[#a63b7e] hover:bg-pink-50 rounded-lg transition"
                    title="Edit Hero Slide"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const updated = heroSlides.filter((_, i) => i !== idx);
                      handleSaveHeroSlides(updated);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Hero Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Section Modal / Drawer */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] text-[#a63b7e] font-extrabold uppercase tracking-wider block">Editing Section</span>
                <h3 className="text-xl font-extrabold text-gray-900 font-serif">{editingSection.internal_name}</h3>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Internal Name</label>
                  <input
                    type="text"
                    required
                    value={editingSection.internal_name}
                    onChange={(e) => setEditingSection({ ...editingSection, internal_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">Public Display Title</label>
                  <input
                    type="text"
                    required
                    value={editingSection.public_title || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, public_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              {/* Call to Action Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">CTA Button Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Deals →"
                    value={editingSection.cta_label || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, cta_label: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-gray-700 block mb-1">CTA Link URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. /collections/crazy-deals"
                    value={editingSection.cta_url || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, cta_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              {/* Max Products Limit */}
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Product Display Limit (Max Products in Grid)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={editingSection.metadata?.limit || 4}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    metadata: { ...editingSection.metadata, limit: parseInt(e.target.value) || 4 }
                  })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              {/* Banner Image Uploader */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <label className="font-extrabold text-gray-800 block">Banner Image Customizer</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Desktop Banner Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingSection.desktop_image || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, desktop_image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl mb-2"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-xl font-bold text-[11px] hover:bg-gray-100">
                      <Upload className="w-3.5 h-3.5 text-[#a63b7e]" /> {isUploading ? 'Uploading...' : 'Upload File'}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'desktop_image')} className="hidden" />
                    </label>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">Mobile Banner Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editingSection.mobile_image || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, mobile_image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl mb-2"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-xl font-bold text-[11px] hover:bg-gray-100">
                      <Upload className="w-3.5 h-3.5 text-[#a63b7e]" /> {isUploading ? 'Uploading...' : 'Upload File'}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobile_image')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#a63b7e] hover:bg-[#872b64] text-white font-extrabold shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Section Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Section Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xl font-extrabold text-gray-900 font-serif">Add New Section</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Section Internal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Essentials Banner"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div>
                <label className="font-extrabold text-gray-700 block mb-1">Section Type</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] bg-white font-bold"
                >
                  <option value="hero_carousel">Hero Carousel Slider</option>
                  <option value="crazy_deals">Crazy Deals Flash Sale</option>
                  <option value="category_grid">Category Grid</option>
                  <option value="featured_products">Product Grid (New Arrivals / Custom)</option>
                  <option value="promo_banners">Promotional Banners Strip</option>
                  <option value="reviews">Customer Testimonials</option>
                  <option value="custom_html">Custom Content Block</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#a63b7e] text-white font-extrabold shadow-md"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-serif">Remove Section?</h3>
              <p className="text-xs text-gray-500 mt-1">This section will be removed from your homepage layout.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSection(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md"
              >
                Yes, Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Edit Hero Banner Slide */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative space-y-5 text-xs border border-gray-200">
            <button
              onClick={() => {
                setIsSlideModalOpen(false);
                setEditingSlide(null);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#a63b7e]" /> Edit Hero Banner Slide
              </h3>
              <p className="text-gray-500 mt-1">Configure headline text, offer badge, CTA button link, and background banner image.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const exists = heroSlides.some((s) => s.id === editingSlide.id);
                const updated = exists
                  ? heroSlides.map((s) => (s.id === editingSlide.id ? editingSlide : s))
                  : [...heroSlides, editingSlide];
                handleSaveHeroSlides(updated);
              }}
              className="space-y-4"
            >
              {/* Badge & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingSlide.badge || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    placeholder="e.g. UP TO 60% OFF"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Main Headline Title</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    placeholder="e.g. Pakistan's Favorite Summer Fashion Sale 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-bold text-gray-900"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subtitle / Short Description</label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  placeholder="Smart Style, Everyday Savings on Kids Wear, Polos & Activewear"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              {/* CTA Button Text & Target URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Button Text</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.ctaText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    placeholder="e.g. Shop Summer Deals"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Button Target Link / URL</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.ctaUrl}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaUrl: e.target.value })}
                    placeholder="e.g. /collections/crazy-deals"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                  />
                </div>
              </div>

              {/* Banner Background Image Upload / URL */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-900 block">Banner Background Image</label>
                  <span className="text-[10px] font-bold text-[#a63b7e]">Recommended: 1920 x 800 px</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={editingSlide.image}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white"
                  />

                  <label className="cursor-pointer bg-[#a63b7e] hover:bg-[#872b64] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSlideImageUpload(file);
                      }}
                    />
                  </label>
                </div>

                {editingSlide.image && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-300">
                    <Image src={editingSlide.image} alt="Slide Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSavingSlides || isUploading}
                className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-xs shadow-lg shadow-pink-200 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {isSavingSlides ? 'Saving Hero Banner...' : 'Save & Publish Hero Banner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
