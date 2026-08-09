'use client';

import React, { useState, useEffect } from 'react';

interface PageLoaderProps {
  isLoading?: boolean;
}

export default function PageLoader({ isLoading }: PageLoaderProps) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // 1. Progress smooth advancement while loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92; // Hold at 92% until DOM & images finish loading
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 40);

    // 2. Real Readiness Checker (DOM Ready + Window Loaded + Images Ready)
    const checkIsFullyReady = () => {
      if (typeof document === 'undefined') return false;
      const isDocReady = document.readyState === 'complete';
      return isDocReady;
    };

    const finishLoading = () => {
      setProgress(100);
      setFadeOut(true);
      setTimeout(() => setShow(false), 300);
    };

    if (isLoading === false || checkIsFullyReady()) {
      finishLoading();
    } else {
      const handleLoad = () => finishLoading();
      window.addEventListener('load', handleLoad);
      
      // Fallback check if already loaded
      if (document.readyState === 'complete') {
        finishLoading();
      }

      return () => {
        clearInterval(interval);
        window.removeEventListener('load', handleLoad);
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white/98 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Custom Keyframe Animations */}
      <style jsx global>{`
        @keyframes logoFloatSoft {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg) scale(1);
          }
          50% {
            transform: translateY(-12px) rotateX(8deg) rotateY(-6deg) scale(1.06);
          }
        }

        @keyframes softGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 4px 15px rgba(166, 59, 126, 0.25)) drop-shadow(0 8px 30px rgba(166, 59, 126, 0.15));
          }
          50% {
            filter: drop-shadow(0 8px 25px rgba(166, 59, 126, 0.5)) drop-shadow(0 12px 45px rgba(217, 70, 239, 0.35));
          }
        }

        @keyframes lightSweepOver {
          0% {
            transform: translateX(-180%) rotate(25deg);
          }
          100% {
            transform: translateX(180%) rotate(25deg);
          }
        }

        @keyframes ringPulseWhite {
          0% {
            transform: scale(0.7);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }

        .animate-logo-float-soft {
          animation: logoFloatSoft 3.2s ease-in-out infinite, softGlowPulse 2.4s ease-in-out infinite;
        }

        .animate-light-sweep-over {
          animation: lightSweepOver 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-ring-pulse-1 {
          animation: ringPulseWhite 2.2s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
        }

        .animate-ring-pulse-2 {
          animation: ringPulseWhite 2.2s cubic-bezier(0.165, 0.84, 0.44, 1) 0.6s infinite;
        }
      `}</style>

      <div className="relative flex flex-col items-center justify-center space-y-8 p-6 text-center">
        {/* Pulsing Concentric Aura Rings */}
        <div className="absolute w-44 h-44 rounded-full border-2 border-[#a63b7e]/30 animate-ring-pulse-1 pointer-events-none" />
        <div className="absolute w-60 h-60 rounded-full border border-pink-400/20 animate-ring-pulse-2 pointer-events-none" />

        {/* Pure Transparent Animated Geometric Logo Icon Container */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center animate-logo-float-soft p-2">
          {/* 100% Transparent PNG Logo */}
          <img
            src="/logo-icon.png"
            alt="Imani's Collection Transparent Logo Icon"
            className="w-full h-full object-contain transform transition-all duration-300 scale-110 drop-shadow-md"
          />

          {/* Subtle Shimmer Light Beam Effect */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 bottom-0 -left-full w-2/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-light-sweep-over skew-x-12" />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2 z-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-widest text-gray-900 uppercase">
            IMANI'S <span className="text-[#a63b7e]">COLLECTION</span>
          </h2>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
            Smart Style, Everyday Savings
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-56 sm:w-64 space-y-2 text-center z-10">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#a63b7e] via-pink-500 to-purple-600 rounded-full transition-all duration-300 ease-out shadow-sm shadow-pink-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-extrabold font-mono text-gray-500">
            <span className="text-[#a63b7e] animate-pulse">LOADING...</span>
            <span className="text-gray-900">{Math.min(progress, 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
