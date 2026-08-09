'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidate } from '@/lib/revalidate';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import { Category } from '@/types';
import { ArrowLeft, Save, Upload, Plus, Trash2, CheckCircle2, AlertCircle, Ruler, FolderTree } from 'lucide-react';

interface CustomVariant {
  size: string;
  color: string;
  price: string;
  salePrice: string;
  stock: string;
  sku: string;
}

interface SizeMeasurementRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    categoryId: '',
    brand: "Imani's Collection",
    sku: '',
    regularPrice: '1499',
    salePrice: '999',
    totalStock: '50',
    gender: 'Unisex',
    isCrazyDeal: true,
    isNewArrival: true,
    isClearance: false,
    isBundleOffer: false,
  });

  const [mainImage, setMainImage] = useState<string>('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Advanced Size & Color Variant State
  const [variants, setVariants] = useState<CustomVariant[]>([
    { size: 'S', color: 'White', price: '1499', salePrice: '350', stock: '11', sku: '' },
    { size: 'L', color: 'Black', price: '1499', salePrice: '700', stock: '10', sku: '' },
  ]);

  // Structured Size Guide Measurement Chart Builder State
  const [sizeMeasurements, setSizeMeasurements] = useState<SizeMeasurementRow[]>([
    { size: 'S', chest: '38"', length: '27"', shoulder: '17"' },
    { size: 'M', chest: '40"', length: '28"', shoulder: '18"' },
    { size: 'L', chest: '44"', length: '29"', shoulder: '19"' },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });
      if (data && data.length > 0) {
        setCategories(data);
        setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
      }
    };
    fetchCategories();
  }, []);

  // Main Image Upload Handler
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrl = await uploadImageToSupabase(files[0]);
    setMainImage(uploadedUrl);
    setUploading(false);
  };

  // Gallery Images Upload Handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImageToSupabase(files[i]);
      newUrls.push(url);
    }
    setGalleryImages([...galleryImages, ...newUrls]);
    setUploading(false);
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { size: 'XL', color: 'Navy', price: formData.regularPrice, salePrice: formData.salePrice, stock: '20', sku: '' },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index: number, field: keyof CustomVariant, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Size Guide Chart Row Actions
  const addSizeMeasurementRow = () => {
    setSizeMeasurements([
      ...sizeMeasurements,
      { size: 'XL', chest: '48"', length: '30"', shoulder: '20"' },
    ]);
  };

  const removeSizeMeasurementRow = (index: number) => {
    setSizeMeasurements(sizeMeasurements.filter((_, i) => i !== index));
  };

  const updateSizeMeasurementRow = (index: number, field: keyof SizeMeasurementRow, value: string) => {
    const updated = [...sizeMeasurements];
    updated[index][field] = value;
    setSizeMeasurements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setStatusMsg(null);
    setUploading(true);

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productSku = formData.sku || `SKU-${Date.now()}`;

      // Format Size Guide Rows into clean text string for frontend modal
      const formattedSizeGuide = sizeMeasurements
        .map((m) => `${m.size}: Chest ${m.chest}, Length ${m.length}, Shoulder ${m.shoulder}`)
        .join('\n');

      // Insert Main Product
      const { data: newProduct, error: prodError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          slug,
          short_description: formData.shortDescription,
          full_description: formData.fullDescription,
          size_guide: formattedSizeGuide,
          category_id: formData.categoryId || null,
          brand: formData.brand,
          sku: productSku,
          regular_price: parseFloat(formData.regularPrice),
          sale_price: formData.salePrice ? parseFloat(formData.salePrice) : null,
          total_stock: parseInt(formData.totalStock),
          gender: formData.gender,
          main_image: mainImage,
          gallery_images: galleryImages,
          is_crazy_deal: formData.isCrazyDeal,
          is_new_arrival: formData.isNewArrival,
          is_clearance: formData.isClearance,
          is_bundle_offer: formData.isBundleOffer,
          status: 'active',
        })
        .select()
        .single();

      if (prodError) throw prodError;

      // Insert Product Variants
      if (variants.length > 0 && newProduct) {
        const variantData: any[] = [];
        variants
          .filter((v) => v.size || v.color)
          .forEach((v) => {
            const regPrice = parseFloat(v.price) || parseFloat(formData.regularPrice) || 0;
            const salePrice = v.salePrice && v.salePrice.trim() !== '' ? parseFloat(v.salePrice) : (formData.salePrice ? parseFloat(formData.salePrice) : null);
            const stockVal = parseInt(v.stock, 10);
            const sanitizedReg = isNaN(regPrice) ? 0 : regPrice;
            const sanitizedSale = salePrice !== null && !isNaN(salePrice) ? salePrice : null;
            const sanitizedStock = isNaN(stockVal) ? 10 : stockVal;

            const splitColors = v.color ? v.color.split(',').map((c) => c.trim()).filter(Boolean) : [''];

            if (splitColors.length > 1) {
              splitColors.forEach((colName) => {
                variantData.push({
                  product_id: newProduct.id,
                  size: v.size || 'Standard',
                  color: colName,
                  sku: `${productSku}-${v.size}-${colName.toUpperCase().replace(/\s+/g, '')}`,
                  price: sanitizedReg,
                  sale_price: sanitizedSale,
                  stock: sanitizedStock,
                  is_active: true,
                });
              });
            } else {
              variantData.push({
                product_id: newProduct.id,
                size: v.size || 'Standard',
                color: v.color || '',
                sku: v.sku || `${productSku}-${v.size}-${(v.color || 'STD').toUpperCase().replace(/\s+/g, '')}`,
                price: sanitizedReg,
                sale_price: sanitizedSale,
                stock: sanitizedStock,
                is_active: true,
              });
            }
          });

        if (variantData.length > 0) {
          const { error: varErr } = await supabase.from('product_variants').insert(variantData);
          if (varErr) {
            console.error('Error inserting variants:', varErr);
            throw new Error(`Failed to save product variants: ${varErr.message}`);
          }
        }
      }

      triggerRevalidate(['/', '/shop', `/products/${newProduct?.slug || formData.slug}`]);

      setStatusMsg({ type: 'success', text: 'Product created and published to Supabase live store!' });
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Error publishing product to Supabase' });
    } finally {
      setUploading(false);
    }
  };

  // Organize Categories Hierarchy for Selector
  const mainCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-xl bg-white border border-gray-200">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-serif">Advanced Product Creator</h1>
          <p className="text-xs text-gray-500">Upload images, configure size & color variants, structured size guide, and assign category.</p>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Basic Info & Category Selector */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 font-serif">1. Basic Product Info</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-gray-700 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Nadir Habib Cotton Shirt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 flex items-center gap-1 mb-1">
                <FolderTree className="w-3.5 h-3.5 text-[#a63b7e]" /> Store Category / Sub-Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] bg-white font-bold text-gray-900"
              >
                {mainCategories.map((m) => {
                  const subCats = categories.filter((c) => c.parent_id === m.id);
                  return (
                    <React.Fragment key={m.id}>
                      <option value={m.id} className="font-bold">{m.name}</option>
                      {subCats.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          &nbsp;&nbsp;↳ {sub.name} (Sub of {m.name})
                        </option>
                      ))}
                    </React.Fragment>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Regular Price (PKR) *</label>
              <input
                type="number"
                required
                value={formData.regularPrice}
                onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Sale Price (PKR)</label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Total Stock Count *</label>
              <input
                type="number"
                required
                value={formData.totalStock}
                onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
              />
            </div>
          </div>
        </div>

        {/* 2. Image Upload Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 font-serif">2. Product Image Upload</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Main Image Upload */}
            <div className="space-y-2">
              <label className="font-bold text-gray-700 block">Main Cover Image</label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-28 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                  <img src={mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs transition">
                    <Upload className="w-4 h-4" /> Upload Main Image File
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-gray-400">Or paste image URL below:</p>
                  <input
                    type="url"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Images Upload */}
            <div className="space-y-2">
              <label className="font-bold text-gray-700 block">Gallery Images (Multiple)</label>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-pink-50 text-[#a63b7e] border border-pink-200 hover:bg-pink-100 px-4 py-2 rounded-xl font-bold text-xs transition">
                <Plus className="w-4 h-4" /> Upload Gallery Images
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
              </label>

              <div className="flex flex-wrap gap-2 pt-2">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Advanced Size & Color Variants Builder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 font-serif">3. Advanced Size & Color Variants Builder</h3>
              <p className="text-[11px] text-gray-500">Only sizes added here will appear on the storefront product page with custom prices.</p>
            </div>
            <button
              type="button"
              onClick={addVariantRow}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#a63b7e]" /> Add Variant Row
            </button>
          </div>

          <div className="space-y-3">
            {variants.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                <p className="text-xs text-gray-500 font-medium">No custom size/color variants added for this product yet.</p>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#a63b7e] hover:bg-[#872b64] text-white rounded-xl font-bold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" /> Add First Variant Row
                </button>
              </div>
            ) : (
              variants.map((v, i) => (
                <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="w-32">
                    <label className="text-[10px] font-bold text-gray-500 block">Size (Custom / Select)</label>
                    <input
                      type="text"
                      list="standard-size-list-new"
                      value={v.size}
                      onChange={(e) => updateVariantRow(i, 'size', e.target.value)}
                      placeholder="e.g. 5 Year, S, 32"
                      className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-bold text-gray-900"
                    />
                  </div>

                  <div className="w-36">
                    <label className="text-[10px] font-bold text-gray-500 block">Color (Comma-separated)</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => updateVariantRow(i, 'color', e.target.value)}
                      placeholder="e.g. White, Red, Black"
                      className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-[10px] font-bold text-gray-500 block">Stock</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                      className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-bold text-gray-900"
                    />
                  </div>

                  <div className="w-28">
                    <label className="text-[10px] font-bold text-gray-500 block">Variant Sale Price (PKR)</label>
                    <input
                      type="number"
                      value={v.salePrice}
                      onChange={(e) => updateVariantRow(i, 'salePrice', e.target.value)}
                      className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-bold text-[#a63b7e]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariantRow(i)}
                    className="p-1.5 text-gray-400 hover:text-red-600 mt-4 transition"
                    title="Remove Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Structured Size Guide Measurement Chart Builder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 font-serif flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#a63b7e]" /> 4. Custom Size Guide Measurement Chart Builder
              </h3>
              <p className="text-[11px] text-gray-500">Structured measurements rendered inside the storefront Size Guide modal window.</p>
            </div>
            <button
              type="button"
              onClick={addSizeMeasurementRow}
              className="bg-pink-50 text-[#a63b7e] hover:bg-pink-100 px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 border border-pink-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add Size Measurement Row
            </button>
          </div>

          <div className="space-y-3">
            {sizeMeasurements.map((m, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-32">
                  <label className="text-[10px] font-bold text-gray-500 block">Size (Custom / Select)</label>
                  <input
                    type="text"
                    list="standard-size-list-new"
                    value={m.size}
                    onChange={(e) => updateSizeMeasurementRow(i, 'size', e.target.value)}
                    placeholder="e.g. 5 Year, S, 32"
                    className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white font-bold text-gray-900"
                  />
                </div>

                <div className="w-28">
                  <label className="text-[10px] font-bold text-gray-500 block">Chest (Inches)</label>
                  <input
                    type="text"
                    value={m.chest}
                    onChange={(e) => updateSizeMeasurementRow(i, 'chest', e.target.value)}
                    className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div className="w-28">
                  <label className="text-[10px] font-bold text-gray-500 block">Length (Inches)</label>
                  <input
                    type="text"
                    value={m.length}
                    onChange={(e) => updateSizeMeasurementRow(i, 'length', e.target.value)}
                    className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div className="w-28">
                  <label className="text-[10px] font-bold text-gray-500 block">Shoulder (Inches)</label>
                  <input
                    type="text"
                    value={m.shoulder}
                    onChange={(e) => updateSizeMeasurementRow(i, 'shoulder', e.target.value)}
                    className="w-full px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeSizeMeasurementRow(i)}
                  className="p-1.5 text-gray-400 hover:text-red-600 mt-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Promotional Badges & Submit */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 font-serif">5. Promotional Badges & Tags</h3>

          <div className="flex flex-wrap gap-4 font-semibold text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isCrazyDeal} onChange={(e) => setFormData({ ...formData, isCrazyDeal: e.target.checked })} />
              <span>Crazy Deal Badge</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isNewArrival} onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })} />
              <span>New Arrival Badge</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isClearance} onChange={(e) => setFormData({ ...formData, isClearance: e.target.checked })} />
              <span>Clearance Badge</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isBundleOffer} onChange={(e) => setFormData({ ...formData, isBundleOffer: e.target.checked })} />
              <span>Bundle Offer Badge</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-pink-200 transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {uploading ? 'Publishing & Syncing Supabase...' : 'Save & Publish Product Live'}
          </button>
        </div>

        {/* Global Standard Size Suggestions Datalist for Custom Sizes */}
        <datalist id="standard-size-list-new">
          <option value="XS" />
          <option value="S" />
          <option value="M" />
          <option value="L" />
          <option value="XL" />
          <option value="2XL" />
          <option value="3XL" />
          <option value="1 Year" />
          <option value="2 Years" />
          <option value="3 Years" />
          <option value="4 Years" />
          <option value="5 Years" />
          <option value="6 Years" />
          <option value="7-8 Years" />
          <option value="9-10 Years" />
          <option value="Free Size" />
          <option value="Standard" />
        </datalist>
      </form>
    </div>
  );
}
