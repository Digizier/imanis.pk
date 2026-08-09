'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, CheckCircle2, Copy, Check, Gift, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Coupon } from '@/types';

interface PopupSettings {
  is_enabled: boolean;
  delay_seconds: number;
  headline: string;
  description: string;
  button_text: string;
  discount_badge_text: string;
  require_whatsapp: boolean;
  frequency_days: number;
}

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings>({
    is_enabled: true,
    delay_seconds: 2,
    headline: 'Get Exclusive Discounts on Your First Order!',
    description: 'Subscribe to unlock instant public promo coupons, secret deal alerts & VIP offers!',
    button_text: 'Unlock Promo Coupons 🎉',
    discount_badge_text: 'Welcome Offer',
    require_whatsapp: false,
    frequency_days: 1,
  });

  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSettingsAndCheck = async () => {
      // 1. Fetch popup settings from Supabase
      const { data } = await supabase
        .from('popup_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (data) {
        setSettings(data);
        if (!data.is_enabled) return;
      }

      // 2. Check Frequency in localStorage
      const lastDismissed = localStorage.getItem('imanis_popup_dismissed');
      const isSubscribed = localStorage.getItem('imanis_popup_subscribed');

      if (isSubscribed) return; // User already subscribed

      const freqDays = data?.frequency_days ?? 1;
      if (lastDismissed && freqDays > 0) {
        const lastTime = parseInt(lastDismissed, 10);
        const daysPassed = (Date.now() - lastTime) / (1000 * 60 * 60 * 24);
        if (daysPassed < freqDays) return; // Wait until frequency days pass
      }

      // 3. Trigger Popup after delay
      const delay = (data?.delay_seconds ?? 2) * 1000;
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    };

    fetchSettingsAndCheck();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('imanis_popup_dismissed', Date.now().toString());
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (settings.require_whatsapp && !whatsapp) {
      setErrorMsg('Please enter your WhatsApp number.');
      return;
    }

    setLoading(true);

    try {
      // Insert into Supabase newsletter_subscribers (ignore duplicate constraint errors)
      await supabase.from('newsletter_subscribers').upsert(
        [
          {
            email: email.trim().toLowerCase(),
            whatsapp_number: whatsapp.trim() || null,
            source: 'welcome_popup',
          },
        ],
        { onConflict: 'email' }
      );

      // Fetch active PUBLIC coupons only
      const now = new Date().toISOString();
      const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      const DEFAULT_PUBLIC_COUPONS: any[] = [
        {
          id: 'def-c1',
          code: 'CRAZY500',
          discount_type: 'fixed_amount',
          discount_value: 500,
          min_spend: 2999,
          description: 'Rs. 500 OFF on orders Rs. 2999+',
          is_public: true,
          is_active: true,
        },
        {
          id: 'def-c2',
          code: 'IMANI10',
          discount_type: 'percentage',
          discount_value: 10,
          min_spend: 1000,
          description: '10% OFF on orders Rs. 1000+',
          is_public: true,
          is_active: true,
        },
      ];

      const validCoupons = (coupons || []).filter((c) => {
        if (c.valid_from && new Date(c.valid_from) > new Date()) return false;
        if (c.valid_until && new Date(c.valid_until) < new Date()) return false;
        return true;
      });

      setPublicCoupons(validCoupons.length > 0 ? validCoupons : DEFAULT_PUBLIC_COUPONS);
      setSubscribed(true);
      localStorage.setItem('imanis_popup_subscribed', 'true');
    } catch (err) {
      console.error('Subscription error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100/90 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition shadow-sm"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner with Brand Gradient */}
        <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white p-6 sm:p-8 text-center relative overflow-hidden shrink-0">
          {/* Background Decorative Rings */}
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#a63b7e]/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a63b7e] text-white text-[10px] font-extrabold uppercase tracking-widest mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {settings.discount_badge_text}
          </div>

          {/* Brand Logo & Name */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src="/logo-icon.png"
                alt="Imani's Collection Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-tight">
              Imani's <span className="text-[#a63b7e]">COLLECTION</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight text-white leading-snug">
            {settings.headline}
          </h3>
          <p className="text-xs text-gray-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {settings.description}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
          {!subscribed ? (
            /* Subscription Form */
            <form onSubmit={handleSubscribe} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email (e.g. name@domain.com)..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-medium text-gray-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  WhatsApp Number {settings.require_whatsapp ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}
                </label>
                <input
                  type="tel"
                  required={settings.require_whatsapp}
                  placeholder="e.g. 0312 1234567..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-medium text-gray-900 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#a63b7e] hover:bg-[#872b64] text-white rounded-xl font-bold text-xs shadow-lg shadow-pink-200 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  'Unlocking Coupons...'
                ) : (
                  <>
                    {settings.button_text} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center">
                🔒 We respect your privacy. No spam ever. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            /* Coupon Reveal Screen */
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-lg font-serif font-bold text-gray-900">
                  🎉 Welcome to Imani's Family!
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Here are your exclusive public promo discount codes:
                </p>
              </div>

              {publicCoupons.length > 0 ? (
                <div className="space-y-3 pt-2 text-left">
                  {publicCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="p-3.5 bg-pink-50/60 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-[#a63b7e]" />
                          <span className="font-mono font-extrabold text-sm text-gray-900 tracking-wider">
                            {coupon.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#a63b7e] text-white text-[9px] font-bold">
                            {coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}% OFF`
                              : `PKR ${coupon.discount_value} OFF`}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {coupon.min_spend > 0
                            ? `Min Spend: PKR ${coupon.min_spend.toLocaleString()}`
                            : 'No Minimum Spend Required'}
                        </p>
                      </div>

                      <button
                        onClick={() => copyCode(coupon.code)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          copiedCode === coupon.code
                            ? 'bg-green-600 text-white'
                            : 'bg-[#a63b7e] text-white hover:bg-[#872b64]'
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600">
                  🎁 You are subscribed! Check back soon for new seasonal promo sales.
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
