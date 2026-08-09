'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Clock } from 'lucide-react';

export const DealCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 38,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 via-amber-600 to-[#a63b7e] text-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-md mb-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        {/* Left Side: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 md:p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0 shadow-inner">
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-black/40 text-amber-300 px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Flash Sale Ending Soon
              </span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-extrabold font-serif tracking-tight mt-1">
              Crazy Deals — Flat 50% Off Limited Stock
            </h2>
            <p className="text-[11px] md:text-xs text-pink-100 opacity-90 mt-0.5 hidden xs:block">
              Unbeatable prices on high demand Pakistani fashion apparel
            </p>
          </div>
        </div>

        {/* Right Side: Timer & Refined Action Button in Single Equal-Height Row */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-4 pt-2.5 md:pt-0 border-t border-white/20 md:border-t-0">
          {/* Timer Display (Takes slightly more width) */}
          <div className="flex items-center gap-1 md:gap-1.5 font-mono grow sm:grow-0">
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 md:px-3.5 md:py-2 rounded-lg md:rounded-xl text-center min-w-[42px] md:min-w-[54px] border border-white/10 shadow-xs">
              <span className="text-xs md:text-xl font-extrabold block text-white leading-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[7px] md:text-[9px] text-gray-300 uppercase block font-sans font-bold leading-none mt-0.5">Hrs</span>
            </div>
            <span className="font-bold text-white text-xs md:text-lg">:</span>
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 md:px-3.5 md:py-2 rounded-lg md:rounded-xl text-center min-w-[42px] md:min-w-[54px] border border-white/10 shadow-xs">
              <span className="text-xs md:text-xl font-extrabold block text-white leading-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[7px] md:text-[9px] text-gray-300 uppercase block font-sans font-bold leading-none mt-0.5">Min</span>
            </div>
            <span className="font-bold text-white text-xs md:text-lg">:</span>
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 md:px-3.5 md:py-2 rounded-lg md:rounded-xl text-center min-w-[42px] md:min-w-[54px] border border-white/10 shadow-xs">
              <span className="text-xs md:text-xl font-extrabold block text-amber-300 leading-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[7px] md:text-[9px] text-gray-300 uppercase block font-sans font-bold leading-none mt-0.5">Sec</span>
            </div>
          </div>

          {/* Refined Compact Action Button */}
          <Link
            href="/collections/crazy-deals"
            className="bg-white hover:bg-gray-100 text-gray-900 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-extrabold text-[10px] md:text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-sm flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 my-auto"
          >
            <span>Shop Deals</span>
            <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#a63b7e]" />
          </Link>
        </div>
      </div>
    </div>
  );
};
