import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function makeTransparent() {
  try {
    const inputPath = 'D:\\APPs\\imanis-2\\public\\logo-icon.png';
    const outputPath = 'D:\\APPs\\imanis-2\\public\\logo-icon-transparent.png';

    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // If pixel is near black, make alpha 0 (transparent)
      if (r < 50 && g < 50 && b < 50) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    fs.writeFileSync('D:\\APPs\\imanis-2\\public\\logo-icon.png', buffer);

    console.log('Successfully created 100% transparent logo PNG!');
  } catch (err) {
    console.error('Canvas processing failed, using alternative approach:', err);
  }
}

makeTransparent();
