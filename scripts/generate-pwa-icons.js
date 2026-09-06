const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

async function generateIcons() {
  console.log('Generating PWA icons from:', logoPath);

  if (!fs.existsSync(logoPath)) {
    throw new Error('Source logo does not exist: ' + logoPath);
  }

  // 1. icon-192x192.png
  await sharp(logoPath)
    .resize(192, 192, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));
  console.log('✓ Created icon-192x192.png');

  // 2. icon-512x512.png
  await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));
  console.log('✓ Created icon-512x512.png');

  // 3. Maskable icons (with ~15% safe padding for Android adaptive circular/squircle crops)
  // 192x192 maskable
  const inner192 = await sharp(logoPath)
    .resize(154, 154, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  })
    .composite([{ input: inner192, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-192x192.png'));
  console.log('✓ Created icon-maskable-192x192.png');

  // 512x512 maskable
  const inner512 = await sharp(logoPath)
    .resize(410, 410, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  })
    .composite([{ input: inner512, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512x512.png'));
  console.log('✓ Created icon-maskable-512x512.png');

  // 4. apple-touch-icon.png (180x180)
  await sharp(logoPath)
    .resize(180, 180, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // 5. favicon.png (32x32)
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Created favicon.png');

  console.log('All PWA icons successfully generated in /public !');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
