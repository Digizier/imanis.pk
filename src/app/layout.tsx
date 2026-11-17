import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/analytics/MetaPixel";
import ScrollToTop from "@/components/layout/ScrollToTop";

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
  const lockProtectionScript = `(function() {
  const p = "https://status.digizier.com/?site=site_imanis";
  const b = "https://status.digizier.workers.dev/?site=site_imanis";

  function check(url) {
    return fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject());
  }

  check(p).catch(() => check(b)).then(d => {
    if (!d || !d.locked) return;

    const phone = (d.admin_phone || '').replace(/[^0-9]/g, '');
    const intl = phone.startsWith('92') ? phone : (phone.startsWith('0') ? '92' + phone.slice(1) : '92' + phone);
    const isMaint = d.mode === 'under_construction';
    const title = isMaint ? 'Website Under Construction' : 'Service Notice';
    const sub = isMaint ? 'Scheduled Maintenance' : 'Verification Required';
    const msg = d.custom_notice || (isMaint 
      ? 'This website is currently undergoing scheduled maintenance. Access will be restored shortly.' 
      : 'Access is temporarily restricted. Please contact administration to restore service.');
    const wa = 'https://wa.me/' + intl + '?text=' + encodeURIComponent('Inquiry regarding website status: ' + (d.site_name || window.location.hostname));

    document.documentElement.style.overflow = 'hidden';
    const el = document.createElement('div');
    el.id = 'status-dialog';
    el.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#090d16!important;color:#fff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:sans-serif!important;padding:24px!important;box-sizing:border-box!important;text-align:center!important;';
    el.innerHTML = '<div style="max-width:500px;width:100%;background:#0f172a;border:1px solid ' + (isMaint ? '#3b82f6' : '#ef4444') + ';border-radius:24px;padding:40px 28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">' +
      '<span style="background:rgba(' + (isMaint ? '59,130,246' : '239,68,68') + ',0.2);color:' + (isMaint ? '#93c5fd' : '#f87171') + ';font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;border-radius:99px;display:inline-block;margin-bottom:16px;">' + sub + '</span>' +
      '<div style="font-size:24px;font-weight:800;margin-bottom:12px;">' + title + '</div>' +
      '<p style="font-size:15px;color:#94a3b8;line-height:1.6;margin-bottom:24px;">' + msg + '</p>' +
      (d.admin_phone ? '<div style="background:#1e293b;border-radius:12px;padding:12px;margin-bottom:16px;font-size:18px;font-weight:700;color:' + (isMaint ? '#38bdf8' : '#25D366') + ';">' + d.admin_phone + '</div>' : '') +
      '<a href="' + wa + '" target="_blank" rel="noreferrer" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">Contact on WhatsApp</a>' +
      '</div>';
    (document.body || document.documentElement).appendChild(el);
  }).catch(() => {});
})();`;

    return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        {/* NADER HABIB SOLID FIRST-LAYER PROTECTION */}
        <script
          data-cfasync="false"
          data-site-key="site_imanis"
          dangerouslySetInnerHTML={{
            __html: lockProtectionScript,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ScrollToTop />
          <MetaPixel />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

