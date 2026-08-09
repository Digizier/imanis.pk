'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, Heart, User, ChevronDown } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
import { MobileDrawer } from './MobileDrawer';
import { CartDrawer } from './CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { Category, Collection } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface HeaderProps {
  categories?: Category[];
  collections?: Collection[];
}

export const Header: React.FC<HeaderProps> = ({
  categories: initialCategories = [],
  collections: initialCollections = [
    { id: 'c1', name: 'Crazy Deals', slug: 'crazy-deals', sort_order: 1, is_featured: true, is_active: true },
    { id: 'c2', name: 'New Arrivals', slug: 'new-arrivals', sort_order: 2, is_featured: true, is_active: true },
    { id: 'c3', name: 'Bundle Offers', slug: 'bundle-offers', sort_order: 3, is_featured: true, is_active: true },
    { id: 'c4', name: 'Clearance', slug: 'clearance', sort_order: 4, is_featured: true, is_active: true },
  ],
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [collections] = useState<Collection[]>(initialCollections);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { items, setIsOpen: setIsCartOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (data && data.length > 0) {
        setCategories(data);
      }
    };
    loadCategories();
  }, []);

  // Separate Main Categories & Sub-Categories
  const mainCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Hamburger & Search Icon */}
          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-[#a63b7e] rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
              aria-label="Search store"
            >
              <Search className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-medium text-gray-400">Search products...</span>
            </button>
          </div>

          {/* Center: Official Brand Transparent Logo & Name */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              <Image
                src="/logo-icon-transparent.png"
                alt="Imani's Collection Logo"
                width={36}
                height={36}
                className="object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-xl md:text-2xl text-gray-900 tracking-tight block leading-none">
                Imani's
              </span>
              <span className="text-[9px] md:text-[10px] tracking-widest text-[#a63b7e] font-bold uppercase block leading-tight">
                COLLECTION
              </span>
            </div>
          </Link>

          {/* Right: User Icons & Cart Drawer Trigger */}
          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/wishlist"
              className="flex p-2 text-gray-700 hover:text-[#a63b7e] rounded-lg hover:bg-gray-100 transition relative"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#a63b7e]" />
              )}
            </Link>

            <Link
              href="/admin/login"
              className="hidden sm:flex p-2 text-gray-700 hover:text-[#a63b7e] rounded-lg hover:bg-gray-100 transition"
              aria-label="Admin Portal"
              title="Admin Portal"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 bg-[#a63b7e] text-white hover:bg-[#872b64] rounded-xl transition flex items-center gap-2 shadow-md shadow-pink-200 active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-bold text-xs pr-0.5">{totalCartCount}</span>
            </button>
          </div>
        </div>

        {/* Desktop Top Navigation Bar with Dynamic Sub-Category Dropdowns */}
        <nav className="hidden lg:block border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-6 text-xs font-bold tracking-wide uppercase py-2.5">
            <Link href="/collections/crazy-deals" className="text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1">
              🔥 Crazy Deals
            </Link>
            <Link href="/collections/new-arrivals" className="text-[#a63b7e] hover:underline font-extrabold">
              New Arrivals
            </Link>
            <Link href="/collections/bundle-offers" className="text-gray-800 hover:text-[#a63b7e]">
              Bundle Offers
            </Link>

            {/* Dynamic Main Categories with Chevron Down Dropdowns */}
            {mainCategories.map((mainCat) => {
              const subCats = getSubCategories(mainCat.id);
              const hasSub = subCats.length > 0;

              return (
                <div
                  key={mainCat.id}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(mainCat.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={`/categories/${mainCat.slug}`}
                    className="text-gray-700 hover:text-[#a63b7e] transition py-2 flex items-center gap-1 font-bold"
                  >
                    <span>{mainCat.name}</span>
                    {hasSub && <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#a63b7e] transition-transform group-hover:rotate-180" />}
                  </Link>

                  {/* Mega Dropdown Menu for Sub-Categories */}
                  {hasSub && activeDropdown === mainCat.id && (
                    <div className="absolute top-full left-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 space-y-1 z-50 animate-fadeIn">
                      <Link
                        href={`/categories/${mainCat.slug}`}
                        className="block px-4 py-1.5 text-[11px] font-extrabold text-[#a63b7e] hover:bg-pink-50 transition border-b border-gray-100"
                      >
                        View All {mainCat.name}
                      </Link>
                      {subCats.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${sub.slug}`}
                          className="block px-4 py-1.5 text-[11px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition font-medium"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/collections/clearance" className="text-gray-900 hover:text-[#a63b7e] font-extrabold">
              Clearance
            </Link>
            <Link href="/contact-us" className="text-gray-500 hover:text-gray-900 lowercase normal-case font-medium">
              Contact Us
            </Link>
          </div>
        </nav>
      </header>

      {/* Modals & Overlays */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={categories}
        collections={collections}
      />
      <CartDrawer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
