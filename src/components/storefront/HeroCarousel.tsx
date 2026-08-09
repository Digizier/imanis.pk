'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaUrl: string;
  badge?: string;
  is_active?: boolean;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: '1',
    title: "Pakistan's Favorite Summer Fashion Sale 2026",
    subtitle: 'Smart Style, Everyday Savings on Kids Wear, Polos & Activewear',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80',
    ctaText: 'Shop Summer Deals',
    ctaUrl: '/collections/crazy-deals',
    badge: 'UP TO 60% OFF',
    is_active: true,
  },
  {
    id: '2',
    title: 'Kids Organic Cotton & Romper Collection',
    subtitle: 'Ultra-soft, skin-friendly daily wear frocks, rompers & twin sets',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1600&q=80',
    ctaText: 'Explore Kids Wear',
    ctaUrl: '/categories/kids',
    badge: 'ORGANIC COTTON',
    is_active: true,
  },
  {
    id: '3',
    title: 'High Performance Gym & Activewear',
    subtitle: 'Moisture-wicking breathable tees, shorts & athletic twin sets',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80',
    ctaText: 'Shop Activewear',
    ctaUrl: '/categories/activewear',
    badge: 'BREATHABLE TECH',
    is_active: true,
  },
];

export const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('*')
          .eq('key', 'homepage_hero_slides')
          .single();

        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          const activeOnly = data.value.filter((s: Slide) => s.is_active !== false);
          if (activeOnly.length > 0) {
            setSlides(activeOnly);
          }
        }
      } catch (err) {
        // Fallback to default slides cleanly
      }
    };

    fetchHeroSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[360px] sm:h-[450px] lg:h-[550px] overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image with Overlay Gradient */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

          {/* Slide Content */}
          <div className="relative max-w-7xl mx-auto h-full px-6 flex flex-col justify-center text-white space-y-3.5">
            {slide.badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#a63b7e] text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-full self-start shadow-lg">
                <Sparkles className="w-3.5 h-3.5" /> {slide.badge}
              </span>
            )}

            <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight font-serif">
              {slide.title}
            </h1>

            <p className="text-xs md:text-base text-gray-200 max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
              {slide.subtitle}
            </p>

            <div className="pt-1 sm:pt-2">
              <Link
                href={slide.ctaUrl}
                className="inline-flex items-center gap-2 bg-[#a63b7e] hover:bg-[#872b64] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-pink-900/50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4" /> {slide.ctaText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Manual Arrow Controls (HIDDEN ON MOBILE, DISPLAYED ON MD+ SCREENS) */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-8 bg-[#a63b7e]' : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
