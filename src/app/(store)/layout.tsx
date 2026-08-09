import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import PageLoader from '@/components/ui/PageLoader';
import WelcomePopup from '@/components/ui/WelcomePopup';
import { supabase, fetchWithCache } from '@/lib/supabase/client';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await fetchWithCache('active_categories', async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return data || [];
  }, 300);

  const collections = await fetchWithCache('active_collections', async () => {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return data || [];
  }, 300);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageLoader />
      <WelcomePopup />
      <Header categories={categories || []} collections={collections || []} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
