'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, ChevronDown, Phone, Mail, MapPin, Tag, Percent, Sparkles, Shirt, Flame } from 'lucide-react';
import { Category, Collection } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  collections: Collection[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  categories: initialCategories = [],
  collections: initialCollections = [],
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      // Load Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (catData) setCategories(catData);

      // Load Collections
      const { data: colData } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (colData) setCollections(colData);
    };

    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  // Group Main Categories and Sub-Categories dynamically
  const mainCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-xs bg-white h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-white sticky top-0 bg-white z-10">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png?v=2"
                alt="Imani's Collection Logo"
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-gray-900 tracking-tight block leading-none">Imani's</span>
              <span className="text-[10px] tracking-widest text-[#a63b7e] font-semibold uppercase block">COLLECTION</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Promotional Badges */}
        <div className="p-3 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/collections/crazy-deals"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-xl font-extrabold shadow-xs text-xs active:scale-95 transition"
          >
            <Flame className="w-3.5 h-3.5" /> Crazy Deals
          </Link>
          <Link
            href="/collections/new-arrivals"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#a63b7e] text-white rounded-xl font-extrabold shadow-xs text-xs active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> New Arrivals
          </Link>
          <Link
            href="/collections/clearance"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl font-extrabold shadow-xs text-xs active:scale-95 transition"
          >
            <Tag className="w-3.5 h-3.5" /> Clearance
          </Link>
          <Link
            href="/collections/bundle-offers"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-xl font-extrabold shadow-xs text-xs active:scale-95 transition"
          >
            <Percent className="w-3.5 h-3.5" /> Bundle Offers
          </Link>
        </div>

        {/* Main Category List */}
        <div className="flex-1 py-2 px-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            Shop By Category
          </div>

          {mainCategories.map((mainCat) => {
            const subCats = getSubCategories(mainCat.id);
            const hasSub = subCats.length > 0;
            const isExpanded = expandedCategory === mainCat.id;

            return (
              <div key={mainCat.id} className="border-b border-gray-50 last:border-0">
                {hasSub ? (
                  <div
                    onClick={() => toggleCategory(mainCat.id)}
                    className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-gray-800 hover:text-[#a63b7e] hover:bg-pink-50/50 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shirt className="w-4 h-4 text-gray-400" />
                      <span>{mainCat.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#a63b7e]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/categories/${mainCat.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-gray-800 hover:text-[#a63b7e] hover:bg-pink-50/50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shirt className="w-4 h-4 text-gray-400" />
                      <span>{mainCat.name}</span>
                    </div>
                  </Link>
                )}

                {hasSub && isExpanded && (
                  <div className="pl-9 pr-3 py-2 space-y-2 bg-gray-50/80 rounded-2xl my-1 text-xs font-medium">
                    <Link
                      href={`/categories/${mainCat.slug}`}
                      onClick={onClose}
                      className="block py-1 text-[#a63b7e] font-extrabold border-b border-gray-200/60 pb-1"
                    >
                      View All {mainCat.name}
                    </Link>

                    {subCats.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        onClick={onClose}
                        className="block py-1 text-gray-700 hover:text-gray-900 font-medium"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="px-3 pt-5 pb-2 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            Curated Collections
          </div>
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:text-[#a63b7e] hover:bg-gray-50 rounded-xl transition"
            >
              <span>{col.name}</span>
            </Link>
          ))}
        </div>

        {/* Drawer Footer Contact Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#a63b7e]" />
            <a href="tel:03121222333" className="hover:underline font-bold">0312 1222333</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#a63b7e]" />
            <a href="mailto:imanisbyanila@gmail.com" className="hover:underline">imanisbyanila@gmail.com</a>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-gray-200/60">
            <MapPin className="w-3.5 h-3.5 text-[#a63b7e] shrink-0 mt-0.5" />
            <span>Shah Allah Ditta Town, Islamabad</span>
          </div>
        </div>
      </div>
    </div>
  );
};
