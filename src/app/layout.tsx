import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Imani's Collection | Smart Style, Everyday Savings",
    template: "%s | Imani's Collection",
  },
  description: "Pakistan's premier fashion e-commerce destination bringing you smart style, everyday savings, organic kids wear, activewear, and casual fashion with fast Cash on Delivery nationwide.",
  keywords: [
    "Imani's Collection",
    "imanisbyanila",
    "Pakistani fashion online",
    "Kids wear Pakistan",
    "Gym activewear Pakistan",
    "Casual fashion online shopping",
    "Crazy deals Pakistan",
    "Cash on delivery fashion",
  ],
  authors: [{ name: "Imani's Collection" }],
  creator: "Imani's Collection",
  publisher: "Imani's Collection",
  icons: [
    { rel: "icon", url: "/logo-icon.png" },
    { rel: "shortcut icon", url: "/logo-icon.png" },
    { rel: "apple-touch-icon", url: "/logo-icon.png" },
  ],
  openGraph: {
    title: "Imani's Collection | Smart Style, Everyday Savings",
    description: "Discover Pakistan's premier fashion store for organic kids wear, gym activewear, casual fashion & exclusive discount deals with fast COD delivery.",
    url: "http://localhost:3000",
    siteName: "Imani's Collection",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Imani's Collection - Smart Style, Everyday Savings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imani's Collection | Smart Style, Everyday Savings",
    description: "Shop Pakistan's favourite online destination for kids wear, activewear & daily fashion savings.",
    images: ["/og-image.png"],
    creator: "@imanisbyanila",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        {/* NADER HABIB SOLID FIRST-LAYER PROTECTION */}
        <script
          data-site-key="site_imanis"
          dangerouslySetInnerHTML={{
            __html: `(function() {
  const SITE_KEY = "site_imanis";
  const SUPABASE_URL = "https://pggolsqtamtkafrpigfo.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ29sc3F0YW10a2FmcnBpZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDE3ODgsImV4cCI6MjEwMDgxNzc4OH0.98_YWbdZ6hlpMiujbiWLYPRYlrvnx2_I31FyGILixHs";
  const WHATSAPP_NUM = "03222685868";
  const WHATSAPP_LINK = "https://wa.me/923222685868?text=Hi%20Nader%20Habib,%20I%20want%20to%20unlock%20my%20website.";
  const isTestLock = typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('lock=true');

  async function checkAccess() {
    if (isTestLock) {
      execLockOverlay('monthly');
      return;
    }

    try {
      const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('nh_lock_status') : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.expiry > Date.now()) {
          if (parsed.locked) execLockOverlay(parsed.billingCycle || 'monthly');
          return;
        }
      }

      const url = \`\${SUPABASE_URL}/rest/v1/client_websites?site_key=eq.\${encodeURIComponent(SITE_KEY)}&select=*\`;
      const res = await fetch(url, {
        headers: { 
          'apikey': SUPABASE_KEY, 
          'Authorization': 'Bearer ' + SUPABASE_KEY 
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data && data.length > 0) {
        const item = data[0];
        const now = new Date();
        const expiry = new Date(item.expiry_date);
        const isExpired = now > expiry;
        const isDisabled = item.status === false;
        const isLocked = isExpired || isDisabled;

        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('nh_lock_status', JSON.stringify({
            locked: isLocked,
            billingCycle: item.billing_cycle || 'monthly',
            expiry: Date.now() + 15 * 60 * 1000 // Cache for 15 minutes
          }));
        }

        if (isLocked) {
          execLockOverlay(item.billing_cycle || 'monthly');
        }
      }
    } catch (e) {
      console.error('[Website-Controller] Access check failed:', e);
    }
  }

  function execLockOverlay(billingCycle) {
    function inject() {
      if (document.getElementById('nader-habib-lock-overlay')) return;
      document.documentElement.style.overflow = 'hidden';
      if (document.body) document.body.style.overflow = 'hidden';

      const overlay = document.createElement('div');
      overlay.id = 'nader-habib-lock-overlay';
      overlay.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#030712!important;color:#ffffff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:system-ui,-apple-system,sans-serif!important;text-align:center!important;padding:20px!important;box-sizing:border-box!important;';

      const cycle = billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

      overlay.innerHTML = \`
        <div style="max-width:520px;width:100%;background:rgba(17,24,39,0.95);border:1px solid rgba(239,68,68,0.4);border-radius:24px;padding:40px 32px;box-shadow:0 25px 50px -12px rgba(239,68,68,0.25);backdrop-filter:blur(16px);">
          <div style="width:72px;height:72px;margin:0 auto 24px;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.3);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:6px 14px;border-radius:9999px;display:inline-block;margin-bottom:16px;">
            Website Access Locked • \${cycle} Payment Remaining
          </span>
          <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">Nader Habib Payment Remaining</h1>
          <p style="font-size:15px;color:#9ca3af;line-height:1.6;margin:0 0 24px 0;">
            Your hosting subscription access is locked. Please contact Nader Habib on WhatsApp to pay remaining dues and restore access.
          </p>
          <div style="background:#1f2937;border:1px solid #374151;border-radius:16px;padding:16px;margin-bottom:24px;">
            <div style="font-size:13px;color:#9ca3af;margin-bottom:4px;">Direct WhatsApp Support</div>
            <div style="font-size:20px;font-weight:700;color:#10b981;">\${WHATSAPP_NUM}</div>
          </div>
          <a href="\${WHATSAPP_LINK}" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:10px;background:#10b981;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border-radius:14px;box-shadow:0 10px 20px -5px rgba(16,185,129,0.4);">
            Contact Nader Habib on WhatsApp
          </a>
        </div>
      \`;
      document.documentElement.appendChild(overlay);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }

  checkAccess();
})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
