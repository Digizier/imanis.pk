import sharp from 'sharp';
import fs from 'fs';

async function generateOgImage() {
  try {
    const width = 1200;
    const height = 630;

    // Load transparent logo icon
    const logoBuffer = await sharp('D:\\APPs\\imanis-2\\public\\logo-icon.png')
      .resize(220, 220, { fit: 'contain' })
      .toBuffer();

    // Create SVG card overlay
    const svgOverlay = Buffer.from(`
      <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="50%" stop-color="#1e1b4b" />
            <stop offset="100%" stop-color="#31103f" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#a63b7e" />
            <stop offset="50%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bg)" />

        <!-- Accent Top Bar -->
        <rect width="${width}" height="10" fill="url(#accent)" />

        <!-- Glow circles -->
        <circle cx="200" cy="150" r="280" fill="#a63b7e" opacity="0.15" />
        <circle cx="1000" cy="480" r="300" fill="#8b5cf6" opacity="0.12" />

        <!-- Card Container -->
        <rect x="80" y="70" width="1040" height="490" rx="32" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2" />

        <!-- Brand Text -->
        <text x="360" y="240" font-family="Georgia, serif" font-weight="bold" font-size="58" fill="#ffffff">Imani's <tspan fill="#ec4899">COLLECTION</tspan></text>
        <text x="360" y="300" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="22" letter-spacing="4" fill="#f472b6">SMART STYLE, EVERYDAY SAVINGS</text>

        <!-- Description -->
        <text x="360" y="370" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#cbd5e1">Pakistan's Premier Fashion E-Commerce Destination</text>
        <text x="360" y="405" font-family="Helvetica, Arial, sans-serif" font-size="18" fill="#94a3b8">Organic Kids Wear • Gym Activewear • Casual Fashion • Fast COD Delivery</text>

        <!-- Bottom Pill Badges -->
        <rect x="360" y="445" width="180" height="38" rx="19" fill="#a63b7e" />
        <text x="450" y="469" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle">🔥 CRAZY DEALS</text>

        <rect x="555" y="445" width="220" height="38" rx="19" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.2" />
        <text x="665" y="469" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle">🚚 FAST PAKISTAN COD</text>
      </svg>
    `);

    // Composite logo icon onto SVG background
    await sharp(svgOverlay)
      .composite([{ input: logoBuffer, top: 180, left: 110 }])
      .png()
      .toFile('D:\\APPs\\imanis-2\\public\\og-image.png');

    console.log('Successfully generated high-res Open Graph Preview Image (public/og-image.png)!');
  } catch (err) {
    console.error('OG Image Generation error:', err);
  }
}

generateOgImage();
