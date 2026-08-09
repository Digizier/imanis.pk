import sharp from 'sharp';
import fs from 'fs';

async function removeBlackBg() {
  try {
    const inputPath = 'C:\\Users\\NB LAPTOP\\.gemini\\antigravity\\brain\\5f212084-f20c-486f-a73a-cc3ebd64d425\\.user_uploaded\\media_1785966376859.jpg';
    
    // Get raw image metadata and buffer
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Loop through pixels and make black/dark pixels 100% transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r < 55 && g < 55 && b < 55) {
        data[i + 3] = 0; // Alpha 0 (Transparent)
      }
    }

    // Convert raw buffer back to PNG
    const transparentBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
    .png()
    .toBuffer();

    // Write to public directory
    fs.writeFileSync('D:\\APPs\\imanis-2\\public\\logo-icon.png', transparentBuffer);
    fs.writeFileSync('D:\\APPs\\imanis-2\\public\\logo-icon-transparent.png', transparentBuffer);

    console.log('Successfully created 100% transparent logo-icon.png with sharp!');
  } catch (err) {
    console.error('Error removing black background:', err);
  }
}

removeBlackBg();
