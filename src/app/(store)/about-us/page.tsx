import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function AboutUsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#a63b7e] uppercase tracking-widest block">Brand Story</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 font-serif">Smart Style, Everyday Savings</h1>
        <p className="text-xs md:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Imani's (imanisbyanila) is an online Pakistani clothing brand serving thousands of families nationwide with premium quality fashion apparel at honest, accessible prices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-lg bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80"
            alt="Imani's Storefront"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 text-xs md:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">Our Mission & Promise</h2>
          <p>
            At Imani's Collection, we believe every Pakistani family deserves high quality, comfortable, and trendy fashion without breaking the bank. From 100% organic cotton baby rompers to heavy GSM streetwear oversized tees and activewear, every piece is curated for maximum comfort and durability.
          </p>
          <p>
            Operating out of Shah Allah Ditta Town, Islamabad, we proudly deliver across all major cities and rural areas in Pakistan with cash on delivery (COD) and 7-day easy returns.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block bg-[#a63b7e] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#872b64] transition"
            >
              Explore Our Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
