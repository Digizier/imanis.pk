'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      {/* Trust & Service Strip */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
          <Truck className="w-8 h-8 text-[#a63b7e] mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Delivery Across Pakistan</h4>
          <p className="text-[11px] text-gray-400 mt-1">Fast 3–5 working days nationwide shipping</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
          <RotateCcw className="w-8 h-8 text-[#a63b7e] mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Return Policy</h4>
          <p className="text-[11px] text-gray-400 mt-1">Hassle-free easy exchange & returns</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
          <ShieldCheck className="w-8 h-8 text-[#a63b7e] mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cash on Delivery</h4>
          <p className="text-[11px] text-gray-400 mt-1">Pay comfortably when package arrives</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
          <Phone className="w-8 h-8 text-[#a63b7e] mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support 0312 1222333</h4>
          <p className="text-[11px] text-gray-400 mt-1">Instant WhatsApp & phone assistance</p>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Brand Overview */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
              <Image
                src="/logo-icon.png"
                alt="Imani's Collection Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white tracking-tight block leading-none">Imani's</span>
              <span className="text-[9px] tracking-widest text-[#a63b7e] font-bold uppercase block">COLLECTION</span>
            </div>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Imani's (imanisbyanila) is a premier Pakistani fashion e-commerce destination bringing you smart style, everyday savings, organic kids wear, activewear, and casual fashion.
          </p>

          {/* Matching Social Media Logos (TikTok, Instagram, Facebook) */}
          <div className="pt-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Follow Us On Social Media</span>
            <div className="flex items-center gap-2.5">
              {/* Facebook Icon */}
              <a
                href="https://www.facebook.com/imanisbyanila"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 hover:bg-[#1877F2] text-gray-300 hover:text-white flex items-center justify-center transition shadow-xs group"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram Icon */}
              <a
                href="https://www.instagram.com/imanisbyanila"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-gray-300 hover:text-white flex items-center justify-center transition shadow-xs group"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok Icon */}
              <a
                href="https://www.tiktok.com/@imanis.collection"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 hover:bg-black text-gray-300 hover:text-cyan-400 flex items-center justify-center transition shadow-xs group"
                aria-label="TikTok"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.05a6.34 6.34 0 0 0-5.11 2.45A6.33 6.33 0 0 0 3 15.67a6.34 6.34 0 0 0 10.83 4.47 6.28 6.28 0 0 0 1.94-4.47V9.45a8.27 8.27 0 0 0 4.82 1.55V7.54a4.85 4.85 0 0 1-1.00-.85z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Collections */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Popular Collections</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/collections/crazy-deals" className="hover:text-[#a63b7e] transition">Crazy Deals</Link></li>
            <li><Link href="/collections/new-arrivals" className="hover:text-[#a63b7e] transition">New Arrivals</Link></li>
            <li><Link href="/collections/bundle-offers" className="hover:text-[#a63b7e] transition">Bundle Offers</Link></li>
            <li><Link href="/categories/kids" className="hover:text-[#a63b7e] transition">Kids Wear & Rompers</Link></li>
            <li><Link href="/categories/activewear" className="hover:text-[#a63b7e] transition">Gym Activewear</Link></li>
            <li><Link href="/collections/clearance" className="hover:text-[#a63b7e] transition">Clearance Stock</Link></li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Customer Care</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/track-order" className="hover:text-[#a63b7e] transition font-semibold text-white">Track Order</Link></li>
            <li><Link href="/about-us" className="hover:text-[#a63b7e] transition">About Us</Link></li>
            <li><Link href="/contact-us" className="hover:text-[#a63b7e] transition">Contact Support</Link></li>
            <li><Link href="/refund-policy" className="hover:text-[#a63b7e] transition">Return & Refund Policy</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-[#a63b7e] transition">Shipping Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-[#a63b7e] transition">Terms of Service</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-[#a63b7e] transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 text-gray-400">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Store Location</h4>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#a63b7e] shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">Shop 1&2 Meharma Market, Street 1A, Shah Allah Ditta Town, Adjacent D12/2, Islamabad, Pakistan</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#a63b7e]" />
            <a href="tel:03121222333" className="hover:text-white transition">0312 1222333</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#a63b7e]" />
            <a href="mailto:imanisbyanila@gmail.com" className="hover:text-white transition">imanisbyanila@gmail.com</a>
          </div>
          <div className="pt-2 border-t border-gray-800">
            <span className="text-[10px] text-gray-500 block">Accepted Payment Methods:</span>
            <div className="flex gap-2 pt-1 font-semibold text-[10px] text-gray-300">
              <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">Cash on Delivery</span>
              <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-900 text-center text-[11px] text-gray-500">
        <p>© {new Date().getFullYear()} Imani's Collection (imanisbyanila). All rights reserved. Smart Style, Everyday Savings.</p>
      </div>
    </footer>
  );
};
