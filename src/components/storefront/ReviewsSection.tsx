'use client';

import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { Review } from '@/types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  return (
    <section className="py-16 bg-pink-50/40 border-y border-pink-100/60">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <span className="text-xs font-bold text-[#a63b7e] uppercase tracking-widest block mb-1">
          Customer Trust
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 font-serif tracking-tight">
          Loved By 350K+ Buyers Across Pakistan
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-amber-500">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-800">4.9 / 5.0 Rating</span>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-pink-100" />
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                {rev.title && (
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{rev.title}</h4>
                )}
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{rev.customer_name}</span>
                  <span className="text-[10px] text-gray-400">Verified Buyer</span>
                </div>
                <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <CheckCircle className="w-3 h-3" /> Verified Order
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
