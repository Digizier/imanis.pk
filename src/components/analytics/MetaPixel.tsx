'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

// Global helper to safely dispatch Meta Pixel Events anywhere in the app
export const trackMetaEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch (err) {
      console.warn('Meta Pixel tracking error:', err);
    }
  }
};

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pixelId, setPixelId] = useState<string>('1316498475903579');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Fetch live marketing settings from Supabase
    const fetchPixelConfig = async () => {
      try {
        const { data } = await supabase
          .from('marketing_settings')
          .select('meta_pixel_id, is_pixel_enabled')
          .eq('id', 'default')
          .single();

        if (data) {
          if (data.meta_pixel_id) setPixelId(data.meta_pixel_id);
          setIsEnabled(data.is_pixel_enabled ?? true);
        }
      } catch (err) {
        // Fallback to default
        console.warn('Using default Meta Pixel configuration.');
      }
    };

    fetchPixelConfig();
  }, []);

  // Track PageView on route / query change
  useEffect(() => {
    if (isEnabled && pixelId && isLoaded) {
      trackMetaEvent('PageView');
    }
  }, [pathname, searchParams, isEnabled, pixelId, isLoaded]);

  if (!isEnabled || !pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        onLoad={() => {
          setIsLoaded(true);
          trackMetaEvent('PageView');
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
