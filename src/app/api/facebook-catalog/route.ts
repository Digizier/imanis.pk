import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCsvField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, ' ');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format')?.toLowerCase();

    // 1. Fetch Catalog Items from database
    let items: any[] = [];
    const { data: catalogData, error: catalogErr } = await supabase
      .from('facebook_catalog_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (catalogData && catalogData.length > 0) {
      items = catalogData;
    } else {
      // Fallback: Query live products directly
      const { data: productsData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('status', 'active');

      if (productsData && productsData.length > 0) {
        items = productsData.map((p: any) => ({
          id: p.sku || p.id,
          title: p.name,
          description: p.short_description || p.full_description || p.name,
          availability: (p.total_stock && p.total_stock > 0) ? 'in stock' : 'out of stock',
          condition: 'new',
          price: p.regular_price || 0,
          sale_price: p.sale_price || null,
          currency: 'PKR',
          link: `https://imanis.pk/products/${p.slug}`,
          image_link: p.main_image || 'https://imanis.pk/og-image.png',
          brand: p.brand || "Imani's Collection",
          fb_product_category: p.categories?.name || 'Apparel & Accessories > Clothing',
        }));
      }
    }

    // 2. Return CSV Format if requested
    if (format === 'csv') {
      const csvHeaders = [
        'id',
        'title',
        'description',
        'availability',
        'condition',
        'price',
        'sale_price',
        'link',
        'image_link',
        'brand',
        'fb_product_category',
      ];

      const csvRows = [csvHeaders.join(',')];

      items.forEach((item) => {
        const row = [
          escapeCsvField(item.id),
          escapeCsvField(item.title),
          escapeCsvField(item.description || item.title),
          escapeCsvField(item.availability || 'in stock'),
          escapeCsvField(item.condition || 'new'),
          escapeCsvField(`${Number(item.price).toFixed(2)} PKR`),
          escapeCsvField(item.sale_price ? `${Number(item.sale_price).toFixed(2)} PKR` : ''),
          escapeCsvField(item.link),
          escapeCsvField(item.image_link),
          escapeCsvField(item.brand || "Imani's Collection"),
          escapeCsvField(item.fb_product_category || 'Apparel & Accessories > Clothing'),
        ];
        csvRows.push(row.join(','));
      });

      return new NextResponse(csvRows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          'Content-Disposition': 'inline; filename="facebook-catalog.csv"',
        },
      });
    }

    // 3. Return Official Meta XML / RSS 2.0 Format (Standard & Recommended by Meta Commerce Manager)
    const xmlItems = items
      .map((item) => {
        const priceStr = `${Number(item.price).toFixed(2)} PKR`;
        const salePriceXml = item.sale_price
          ? `<g:sale_price>${Number(item.sale_price).toFixed(2)} PKR</g:sale_price>`
          : '';

        return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description || item.title)}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.image_link)}</g:image_link>
      <g:brand>${escapeXml(item.brand || "Imani's Collection")}</g:brand>
      <g:condition>${escapeXml(item.condition || 'new')}</g:condition>
      <g:availability>${escapeXml(item.availability || 'in stock')}</g:availability>
      <g:price>${priceStr}</g:price>
      ${salePriceXml}
      <g:google_product_category>${escapeXml(item.fb_product_category || 'Apparel & Accessories > Clothing')}</g:google_product_category>
      <g:fb_product_category>${escapeXml(item.fb_product_category || 'Clothing')}</g:fb_product_category>
    </item>`;
      })
      .join('\n');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Imani's Collection Product Catalog</title>
    <link>https://imanis.pk</link>
    <description>Official Real-Time Product Catalog Feed for Meta (Facebook &amp; Instagram) Commerce Manager</description>
${xmlItems}
  </channel>
</rss>`;

    return new NextResponse(xmlFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error generating Facebook catalog feed:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(error.message || 'Server error')}</error>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    );
  }
}
