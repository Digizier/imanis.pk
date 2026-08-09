'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('status', 'active')
        .limit(6);
      
      setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-md">
      {/* Top Search Bar */}
      <div className="p-4 border-b border-gray-200 max-w-4xl mx-auto w-full flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, tees, rompers, polos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-base md:text-lg bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          Cancel
        </button>
      </div>

      {/* Results / Suggestions Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#a63b7e] border-t-transparent rounded-full animate-spin" />
            Searching products...
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Found {results.length} Products
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-pink-50/50 rounded-xl transition group border border-gray-100"
                  >
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      <Image
                        src={product.main_image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-[#a63b7e]">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{product.brand}</p>
                      <span className="text-xs font-bold text-[#a63b7e] block mt-1">
                        Rs. {(product.sale_price || product.regular_price).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center pt-4">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a63b7e] hover:underline"
                >
                  View All Search Results for "{query}" →
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No products found matching "<strong className="text-gray-900">{query}</strong>". Try searching for "Tee", "Shorts", or "Kids".
            </div>
          )
        ) : (
          /* Default Popular Searches & Quick Links */
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <TrendingUp className="w-4 h-4 text-[#a63b7e]" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Kids Twin Set', 'Oversized Tee', 'Activewear Shorts', 'Lupilu Frock', 'Baby Romper', 'Clearance'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-pink-50 hover:text-[#a63b7e] hover:border-pink-200 border border-transparent rounded-full text-gray-700 font-medium transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-orange-500" /> Featured Categories
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-medium">
                <Link
                  href="/categories/men"
                  onClick={onClose}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-gray-800"
                >
                  Men's Fashion →
                </Link>
                <Link
                  href="/categories/kids"
                  onClick={onClose}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-gray-800"
                >
                  Kids & Baby →
                </Link>
                <Link
                  href="/categories/activewear"
                  onClick={onClose}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-gray-800"
                >
                  Activewear Gym →
                </Link>
                <Link
                  href="/collections/crazy-deals"
                  onClick={onClose}
                  className="p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition font-bold"
                >
                  Crazy Deals 🔥
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
