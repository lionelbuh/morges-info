/**
 * Generates the responsive images of the home page's large photos (HERO_PHOTOS):
 *   public/images/hero/<id>-<crop>-<width>.{avif,webp,jpg}
 * and writes src/data/hero-manifest.json ({ <id>: manifest }, used by the home page).
 *
 * Usage: npm run images   (the castle's original must be at HERO_PHOTO.source; the old
 * photos are prepared from the photo map's files in public/images/photos/)
 */
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { HERO_PHOTOS } from '../src/data/photos.js';
import { cropBox } from './crop.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/images/hero');
const manifestPath = path.join(root, 'src/data/hero-manifest.json');

for (const photo of HERO_PHOTOS) {
  if (!existsSync(path.join(root, photo.source))) {
    console.error(`Original photo not found: ${photo.source}\nDownload it from ${photo.sourceUrl} (see docs/PHOTOS.md).`);
    process.exit(1);
  }
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const manifests = {};
for (const photo of HERO_PHOTOS) {
  const input = path.join(root, photo.source);
  const meta = await sharp(input).rotate().metadata(); // honour EXIF orientation
  const { width, height } = meta.autoOrient || meta;
  const manifest = { id: photo.id, original: { width, height }, crops: {} };
  for (const [name, crop] of Object.entries(photo.crops)) {
    const box = cropBox(width, height, crop);
    const widths = crop.widths.filter((w) => w <= box.width);
    if (widths.length === 0) widths.push(box.width);
    const entry = { aspect: box.width / box.height, box, files: {} };
    for (const w of widths) {
      const h = Math.round(w / (box.width / box.height));
      const base = sharp(input).rotate().extract(box).resize(w, h); // metadata (EXIF, GPS) is stripped by default
      const stem = `${photo.id}-${name}-${w}`;
      const formats = crop.formats || ['avif', 'webp', 'jpg'];
      if (formats.includes('avif')) await base.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(outDir, `${stem}.avif`));
      if (formats.includes('webp')) await base.clone().webp({ quality: 74, effort: 6 }).toFile(path.join(outDir, `${stem}.webp`));
      await base.clone().jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(path.join(outDir, `${stem}.jpg`));
      for (const fmt of formats) {
        (entry.files[fmt] ||= []).push({ src: `/images/hero/${stem}.${fmt}`, width: w, height: h });
      }
    }
    manifest.crops[name] = entry;
  }
  manifests[photo.id] = manifest;
}
writeFileSync(manifestPath, `${JSON.stringify(manifests, null, 2)}\n`);
console.log(`Hero images written to ${path.relative(root, outDir)} and manifest updated.`);
