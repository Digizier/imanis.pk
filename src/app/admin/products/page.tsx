'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidate } from '@/lib/revalidate';
import { Product, Category } from '@/types';
import {
  Plus, Search, Edit3, Trash2, Tag, Percent, RefreshCw, AlertCircle, FolderTree,
  AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Custom Delete Modal & Toast state
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: prodData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(prodData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleExecuteDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;

    setIsDeleting(true);
    try {
      // First delete child variants if present
      await supabase.from('product_variants').delete().eq('product_id', deleteConfirmProduct.id);
      
      // Delete product
      const { error } = await supabase.from('products').delete().eq('id', deleteConfirmProduct.id);
      if (error) throw error;

      setProducts(products.filter((p) => p.id !== deleteConfirmProduct.id));
      triggerRevalidate(['/', '/shop', `/products/${deleteConfirmProduct.slug}`]);
      showToast(`Product "${deleteConfirmProduct.name}" deleted successfully.`);
      setDeleteConfirmProduct(null);
    } catch (err: any) {
      showToast('Failed to delete product: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'General';
    const found = categories.find((c) => c.id === categoryId);
    return found ? found.name : 'General';
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative pb-12">
      {/* Toast Notification Banner (Custom UI replacing browser alerts) */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Product Catalog Manager</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {products.length} products stored in Supabase. Real-time edit & delete.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProductsAndCategories}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search products by title, SKU, or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e]"
        />
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
            Loading catalog & categories from Supabase...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (PKR)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image src={p.main_image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">/{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-[#a63b7e] bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                        <FolderTree className="w-3 h-3" /> {getCategoryName(p.category_id)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-gray-900 block">Rs. {(p.sale_price || p.regular_price).toLocaleString()}</span>
                      {p.sale_price && (
                        <span className="text-[10px] text-gray-400 line-through">Rs. {p.regular_price.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${p.total_stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {p.total_stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.is_crazy_deal && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-[9px] font-bold">Deal</span>}
                        {p.is_new_arrival && <span className="bg-pink-100 text-[#a63b7e] px-2 py-0.5 rounded-md text-[9px] font-bold">New</span>}
                        {p.is_clearance && <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-md text-[9px] font-bold">Clearance</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="p-2 text-gray-600 hover:text-[#a63b7e] hover:bg-pink-50 rounded-xl transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmProduct(p)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete Product from Supabase"
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
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-gray-700">No products found in database.</p>
            <Link
              href="/admin/products/new"
              className="inline-block bg-[#a63b7e] text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Add First Product
            </Link>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal (Replacing browser confirm alert) */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-center text-xs">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 font-serif">
                Delete Product "{deleteConfirmProduct.name}"?
              </h3>
              <p className="text-gray-500 mt-1.5 leading-relaxed">
                This action will permanently delete this product and all its variants from your Supabase catalog.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteProduct}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
