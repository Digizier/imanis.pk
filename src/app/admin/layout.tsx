'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, FolderTree, Settings, Tag, LogOut, Store, Sparkles } from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide admin sidebar navigation completely on login page, but render PageLoader
  if (pathname === '/admin/login') {
    return (
      <>
        <PageLoader />
        {children}
      </>
    );
  }

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Product Manager', href: '/admin/products', icon: ShoppingBag },
    { label: 'Order Manager', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Categories & Tags', href: '/admin/categories', icon: FolderTree },
    { label: 'Homepage & Hero Banners', href: '/admin/homepage', icon: Sparkles },
    { label: 'Coupon Codes', href: '/admin/coupons', icon: Tag },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <PageLoader />
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gray-900 text-white shrink-0 p-4 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
              <Image
                src="/logo-icon-transparent.png"
                alt="Imani's Collection Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-base block leading-none">Imani's Admin</span>
              <span className="text-[9px] text-[#a63b7e] font-bold uppercase tracking-wider block">Control Panel</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-[#a63b7e] text-white shadow-md shadow-pink-900/30 ring-1 ring-pink-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#a63b7e]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition font-medium"
          >
            <Store className="w-4 h-4 text-green-500" /> View Live Storefront
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-gray-800 transition font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout Session
          </Link>
        </div>
      </aside>

      {/* Main Admin Body */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
