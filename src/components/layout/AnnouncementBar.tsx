'use client';

import React from 'react';
import { Truck, RotateCcw, PhoneCall } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  text = '⚡ FREE SHIPPING ON RS. 2999+ ORDERS ACROSS PAKISTAN | 7-DAY RETURN POLICY',
}) => {
  return (
    <div className="bg-black text-white text-xs py-2 px-3 font-medium overflow-hidden border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile Animated Smooth Ticker Marquee */}
        <div className="flex sm:hidden items-center w-full overflow-hidden relative">
          <span className="bg-[#a63b7e] text-white px-2 py-0.5 rounded text-[9px] uppercase font-extrabold tracking-wider shrink-0 mr-2 z-10 shadow-xs">
            SPECIAL OFFER
          </span>
          <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-[11px] font-semibold text-gray-200">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>

        {/* Desktop Centered Static Layout */}
        <div className="hidden sm:flex items-center gap-2 justify-center sm:justify-start">
          <span className="bg-[#a63b7e] text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider animate-pulse">
            Special Offer
          </span>
          <span className="text-xs font-semibold">{text}</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-300">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#a63b7e]" /> 3-5 Working Days Delivery
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-[#a63b7e]" /> Easy Returns
          </span>
          <a href="tel:03121222333" className="flex items-center gap-1 hover:text-white transition">
            <PhoneCall className="w-3.5 h-3.5 text-[#a63b7e]" /> 0312 1222333
          </a>
        </div>
      </div>
    </div>
  );
};
