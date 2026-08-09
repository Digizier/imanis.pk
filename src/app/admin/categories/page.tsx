'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidate } from '@/lib/revalidate';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import { Category, Collection } from '@/types';
import {
  FolderTree, Plus, Edit3, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Upload, Eye, EyeOff, X, Save, CornerDownRight, Tag, Flame, Sparkles, Home
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'collections'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modals State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);

  // Collection Modals State
  const [showColModal, setShowColModal] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [deleteConfirmCollection, setDeleteConfirmCollection] = useState<Collection | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Category Form State
  const [catFormData, setCatFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    image: '',
    sort_order: 0,
    is_active: true,
    show_on_homepage: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Collection Form State
  const [colFormData, setColFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    badge_color: 'pink',
    sort_order: 0,
    is_active: true,
  });

  const fetchAllData = async () => {
    setLoading(true);
    // Fetch Categories
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    setCategories(catData || []);

    // Fetch Collections
    const { data: colData } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true });
    setCollections(colData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Category Handlers
  const resetCatForm = () => {
    setCatFormData({
      id: '',
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      image: '',
      sort_order: categories.length + 1,
      is_active: true,
      show_on_homepage: false,
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleOpenAddCatModal = () => {
    resetCatForm();
    setShowCatModal(true);
  };

  const handleOpenEditCatModal = (cat: Category) => {
    setCatFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      image: cat.image || cat.image_url || '',
      sort_order: cat.sort_order || 0,
      is_active: cat.is_active !== false,
      show_on_homepage: cat.show_on_homepage || false,
    });
    setImageFile(null);
    setImagePreview(cat.image || cat.image_url || '');
    setEditCategory(cat);
  };

  const handleCatNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setCatFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleToggleCatActive = async (cat: Category) => {
    const newStatus = !cat.is_active;
    const { error } = await supabase.from('categories').update({ is_active: newStatus }).eq('id', cat.id);

    if (error) {
      showToast('Failed to update category status: ' + error.message, 'error');
    } else {
      setCategories(categories.map((c) => (c.id === cat.id ? { ...c, is_active: newStatus } : c)));
      showToast(`Category "${cat.name}" is now ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
    }
  };

  const handleToggleShowOnHomepage = async (cat: Category) => {
    const newStatus = !cat.show_on_homepage;
    const { error } = await supabase.from('categories').update({ show_on_homepage: newStatus }).eq('id', cat.id);

    if (error) {
      showToast('Failed to update homepage status: ' + error.message, 'error');
    } else {
      setCategories(categories.map((c) => (c.id === cat.id ? { ...c, show_on_homepage: newStatus } : c)));
      triggerRevalidate(['/', '/shop', `/categories/${cat.slug}`]);
      showToast(
        `Category "${cat.name}" is now ${newStatus ? 'SHOWING ON HOMEPAGE' : 'HIDDEN FROM HOMEPAGE'}.`
      );
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name) {
      showToast('Please enter category name', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = catFormData.image;
      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile, 'categories');
      }

      const catSlug = catFormData.slug || catFormData.name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        name: catFormData.name,
        slug: catSlug,
        description: catFormData.description || null,
        parent_id: catFormData.parent_id || null,
        image: finalImageUrl || null,
        image_url: finalImageUrl || null,
        sort_order: catFormData.sort_order || 0,
        is_active: catFormData.is_active,
        show_on_homepage: catFormData.show_on_homepage,
      };

      if (editCategory) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editCategory.id);
        if (error) throw error;
        showToast(`Category "${catFormData.name}" updated successfully!`);
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        showToast(`New category "${catFormData.name}" created successfully!`);
      }

      triggerRevalidate(['/', '/shop', `/categories/${catSlug}`]);

      setShowCatModal(false);
      setEditCategory(null);
      resetCatForm();
      fetchAllData();
    } catch (err: any) {
      showToast('Error saving category: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDeleteCat = async () => {
    if (!deleteConfirmCategory) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', deleteConfirmCategory.id);
      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== deleteConfirmCategory.id));
      triggerRevalidate(['/', '/shop', `/categories/${deleteConfirmCategory.slug}`]);
      showToast(`Category "${deleteConfirmCategory.name}" deleted successfully.`);
      setDeleteConfirmCategory(null);
    } catch (err: any) {
      showToast('Failed to delete category: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Collection Handlers
  const resetColForm = () => {
    setColFormData({
      id: '',
      name: '',
      slug: '',
      description: '',
      badge_color: 'pink',
      sort_order: collections.length + 1,
      is_active: true,
    });
  };

  const handleOpenAddColModal = () => {
    resetColForm();
    setShowColModal(true);
  };

  const handleOpenEditColModal = (col: Collection) => {
    setColFormData({
      id: col.id,
      name: col.name,
      slug: col.slug,
      description: col.description || '',
      badge_color: col.badge_color || 'pink',
      sort_order: col.sort_order || 0,
      is_active: col.is_active !== false,
    });
    setEditCollection(col);
  };

  const handleColNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setColFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleToggleColActive = async (col: Collection) => {
    const newStatus = !col.is_active;
    const { error } = await supabase.from('collections').update({ is_active: newStatus }).eq('id', col.id);

    if (error) {
      showToast('Failed to update collection status: ' + error.message, 'error');
    } else {
      setCollections(collections.map((c) => (c.id === col.id ? { ...c, is_active: newStatus } : c)));
      showToast(`Curated Collection "${col.name}" is now ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colFormData.name) {
      showToast('Please enter collection title', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: colFormData.name,
        slug: colFormData.slug || colFormData.name.toLowerCase().replace(/\s+/g, '-'),
        description: colFormData.description || null,
        badge_color: colFormData.badge_color || 'pink',
        sort_order: colFormData.sort_order || 0,
        is_active: colFormData.is_active,
        is_featured: true,
      };

      if (editCollection) {
        const { error } = await supabase.from('collections').update(payload).eq('id', editCollection.id);
        if (error) throw error;
        showToast(`Curated Collection "${colFormData.name}" updated successfully!`);
      } else {
        const { error } = await supabase.from('collections').insert(payload);
        if (error) throw error;
        showToast(`New Offer Collection "${colFormData.name}" created successfully!`);
      }

      setShowColModal(false);
      setEditCollection(null);
      resetColForm();
      fetchAllData();
    } catch (err: any) {
      showToast('Error saving collection: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDeleteCol = async () => {
    if (!deleteConfirmCollection) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('collections').delete().eq('id', deleteConfirmCollection.id);
      if (error) throw error;

      setCollections(collections.filter((c) => c.id !== deleteConfirmCollection.id));
      showToast(`Curated Collection "${deleteConfirmCollection.name}" deleted successfully.`);
      setDeleteConfirmCollection(null);
    } catch (err: any) {
      showToast('Failed to delete collection: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-6 relative pb-12">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-extrabold flex items-center gap-2.5 ${
            toast.type === 'success' ? 'bg-green-900 text-white border-green-700' : 'bg-red-900 text-white border-red-700'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Categories & Curated Offer Collections</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage main categories, sub-categories, offer collections, and homepage featured sections.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeTab === 'categories' ? (
            <button
              onClick={handleOpenAddCatModal}
              className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Category / Sub-Category
            </button>
          ) : (
            <button
              onClick={handleOpenAddColModal}
              className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Curated Offer Collection
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'categories' ? 'border-[#a63b7e] text-[#a63b7e]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Standard Categories & Sub-Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'collections' ? 'border-[#a63b7e] text-[#a63b7e]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4 text-red-600" /> Curated Offer Collections & Badges ({collections.length})
        </button>
      </div>

      {/* TAB 1: Categories & Sub-Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
              Loading categories from Supabase...
            </div>
          ) : categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Category Image & Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Add Home Page Show</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {mainCategories.map((mainCat) => {
                    const subCats = getSubCategories(mainCat.id);
                    return (
                      <React.Fragment key={mainCat.id}>
                        {/* Main Category Row */}
                        <tr className="hover:bg-pink-50/30 transition bg-white">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-pink-50 border border-pink-100 shrink-0 flex items-center justify-center">
                                {mainCat.image || mainCat.image_url ? (
                                  <Image src={mainCat.image || mainCat.image_url || ''} alt={mainCat.name} fill className="object-cover" />
                                ) : (
                                  <FolderTree className="w-5 h-5 text-[#a63b7e]" />
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-gray-900 text-sm block">{mainCat.name}</span>
                                {mainCat.description && <span className="text-[10px] text-gray-400 block">{mainCat.description}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-pink-100 text-[#a63b7e] px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                              Main Category
                            </span>
                          </td>

                          {/* Prominent "Add Home Page Show" Toggle Column */}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleShowOnHomepage(mainCat)}
                              className={`px-3 py-1 rounded-full font-extrabold text-[10px] transition flex items-center gap-1.5 shadow-xs ${
                                mainCat.show_on_homepage
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                              }`}
                              title="Toggle category section on Home Page"
                            >
                              <Home className={`w-3.5 h-3.5 ${mainCat.show_on_homepage ? 'text-purple-700' : 'text-gray-400'}`} />
                              {mainCat.show_on_homepage ? 'Home Show (ON)' : 'Off'}
                            </button>
                          </td>

                          <td className="p-4 font-mono text-gray-500">/{mainCat.slug}</td>
                          <td className="p-4 font-bold text-gray-900">{mainCat.sort_order || 0}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleCatActive(mainCat)}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] transition flex items-center gap-1.5 ${
                                mainCat.is_active !== false
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}
                            >
                              {mainCat.is_active !== false ? <Eye className="w-3 h-3 text-green-600" /> : <EyeOff className="w-3 h-3" />}
                              {mainCat.is_active !== false ? 'Active' : 'Deactive'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditCatModal(mainCat)}
                                className="p-2 text-gray-600 hover:text-[#a63b7e] hover:bg-pink-50 rounded-xl transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmCategory(mainCat)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Sub-Categories Tree Rows */}
                        {subCats.map((subCat) => (
                          <tr key={subCat.id} className="bg-gray-50/50 hover:bg-gray-100/50 transition">
                            <td className="p-4 pl-10">
                              <div className="flex items-center gap-2.5">
                                <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0" />
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 shrink-0 flex items-center justify-center">
                                  {subCat.image || subCat.image_url ? (
                                    <Image src={subCat.image || subCat.image_url || ''} alt={subCat.name} fill className="object-cover" />
                                  ) : (
                                    <Tag className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 text-xs block">{subCat.name}</span>
                                  <span className="text-[9px] text-gray-400">Under: {mainCat.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg text-[9px] font-bold">
                                Sub-Category
                              </span>
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => handleToggleShowOnHomepage(subCat)}
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] transition flex items-center gap-1 ${
                                  subCat.show_on_homepage
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {subCat.show_on_homepage ? 'Home Show (ON)' : 'Off'}
                              </button>
                            </td>

                            <td className="p-4 font-mono text-gray-500 text-[11px]">/{subCat.slug}</td>
                            <td className="p-4 font-bold text-gray-700">{subCat.sort_order || 0}</td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleCatActive(subCat)}
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition flex items-center gap-1 ${
                                  subCat.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {subCat.is_active !== false ? 'Active' : 'Deactive'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditCatModal(subCat)}
                                  className="p-1.5 text-gray-600 hover:text-[#a63b7e] hover:bg-pink-50 rounded-lg transition"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmCategory(subCat)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-gray-500 space-y-3">
              <FolderTree className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="font-bold text-gray-700">No categories found.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Curated Offer Collections */}
      {activeTab === 'collections' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
              Loading collections from Supabase...
            </div>
          ) : collections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4">Collection Title</th>
                    <th className="p-4">Badge Color</th>
                    <th className="p-4">Slug URL</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {collections.map((col) => (
                    <tr key={col.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-4">
                        <span className="font-extrabold text-gray-900 text-sm block">{col.name}</span>
                        {col.description && <span className="text-[10px] text-gray-400 block">{col.description}</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider ${
                          col.badge_color === 'red' ? 'bg-red-600' :
                          col.badge_color === 'purple' ? 'bg-purple-600' :
                          col.badge_color === 'amber' ? 'bg-amber-600' :
                          col.badge_color === 'dark' ? 'bg-gray-900' : 'bg-[#a63b7e]'
                        }`}>
                          {col.badge_color || 'pink'} badge
                        </span>
                      </td>
                      <td className="p-4 font-mono text-gray-500">/collections/{col.slug}</td>
                      <td className="p-4 font-bold text-gray-900">{col.sort_order || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleColActive(col)}
                          className={`px-3 py-1 rounded-full font-bold text-[10px] transition flex items-center gap-1.5 ${
                            col.is_active !== false ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {col.is_active !== false ? 'Active' : 'Deactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditColModal(col)}
                            className="p-2 text-gray-600 hover:text-[#a63b7e] hover:bg-pink-50 rounded-xl transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmCollection(col)}
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
            <div className="py-16 text-center text-xs text-gray-500 space-y-3">
              <Tag className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="font-bold text-gray-700">No collections found.</p>
            </div>
          )}
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      {(showCatModal || editCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-xs">
            <button onClick={() => { setShowCatModal(false); setEditCategory(null); }} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg">✕</button>
            <h3 className="text-xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#a63b7e]" />
              {editCategory ? `Edit Category: ${editCategory.name}` : 'Create Category / Sub-Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catFormData.name}
                  onChange={(e) => handleCatNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Parent Category</label>
                  <select
                    value={catFormData.parent_id}
                    onChange={(e) => setCatFormData({ ...catFormData, parent_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="">None (Main Category)</option>
                    {mainCategories.filter((m) => m.id !== catFormData.id).map((m) => (
                      <option key={m.id} value={m.id}>Sub-Category of: {m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={catFormData.slug}
                    onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono text-gray-600"
                  />
                </div>
              </div>

              {/* Local File Picker */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Category Image Banner</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-300 shrink-0 bg-gray-100">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0 bg-gray-50">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-[#a63b7e] hover:file:bg-pink-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={catFormData.sort_order}
                    onChange={(e) => setCatFormData({ ...catFormData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Status</label>
                  <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catFormData.is_active}
                      onChange={(e) => setCatFormData({ ...catFormData, is_active: e.target.checked })}
                    />
                    <span className="font-bold text-gray-800">{catFormData.is_active ? 'Active' : 'Deactive'}</span>
                  </label>
                </div>
              </div>

              {/* Add Home Page Show Field */}
              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl">
                <label className="font-extrabold text-purple-950 block mb-1 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-purple-700" /> Add Home Page Show
                </label>
                <label className="flex items-center gap-2.5 p-2.5 border border-purple-200 rounded-xl bg-white cursor-pointer shadow-xs">
                  <input
                    type="checkbox"
                    checked={catFormData.show_on_homepage}
                    onChange={(e) => setCatFormData({ ...catFormData, show_on_homepage: e.target.checked })}
                    className="w-4 h-4 text-purple-700 rounded focus:ring-purple-500"
                  />
                  <span className="font-bold text-gray-900 text-xs">
                    {catFormData.show_on_homepage ? '✨ Featured Section Active on Home Page' : 'Hidden from Home Page'}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCatModal(false); setEditCategory(null); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#a63b7e] text-white py-3 rounded-2xl font-extrabold">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center text-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-serif">Delete Category?</h3>
              <p className="text-xs text-gray-500 mt-1">Are you sure you want to delete "{deleteConfirmCategory.name}"?</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirmCategory(null)} className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs">Cancel</button>
              <button onClick={handleExecuteDeleteCat} disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Modal (Add / Edit) */}
      {(showColModal || editCollection) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-xs">
            <button onClick={() => { setShowColModal(false); setEditCollection(null); }} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 font-bold text-lg">✕</button>
            <h3 className="text-xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
              <Tag className="w-5 h-5 text-red-600" />
              {editCollection ? `Edit Collection: ${editCollection.name}` : 'Create Curated Offer Collection'}
            </h3>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Collection Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crazy Deals, New Arrivals"
                  value={colFormData.name}
                  onChange={(e) => handleColNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Badge Color Theme</label>
                  <select
                    value={colFormData.badge_color}
                    onChange={(e) => setColFormData({ ...colFormData, badge_color: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl bg-white font-bold"
                  >
                    <option value="red">Red (Crazy Deals)</option>
                    <option value="purple">Purple (New Arrivals)</option>
                    <option value="amber">Amber (Bundle Offers)</option>
                    <option value="dark">Dark (Clearance)</option>
                    <option value="green">Green (Essentials)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={colFormData.slug}
                    onChange={(e) => setColFormData({ ...colFormData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={colFormData.description}
                  onChange={(e) => setColFormData({ ...colFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={colFormData.sort_order}
                    onChange={(e) => setColFormData({ ...colFormData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Status</label>
                  <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={colFormData.is_active}
                      onChange={(e) => setColFormData({ ...colFormData, is_active: e.target.checked })}
                    />
                    <span className="font-bold text-gray-800">{colFormData.is_active ? 'Active' : 'Deactive'}</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowColModal(false); setEditCollection(null); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#a63b7e] text-white py-3 rounded-2xl font-extrabold">Save Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Collection Modal */}
      {deleteConfirmCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center text-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-serif">Delete Collection?</h3>
              <p className="text-xs text-gray-500 mt-1">Are you sure you want to delete "{deleteConfirmCollection.name}"?</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirmCollection(null)} className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs">Cancel</button>
              <button onClick={handleExecuteDeleteCol} disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
