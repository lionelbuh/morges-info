/**
 * Generates the responsive hero images from the original photo:
 *   public/images/hero/<id>-<crop>-<width>.{avif,webp,jpg}
 * and writes src/data/hero-manifest.json (used by the home page).
 *
 * Usage: npm run images   (after placing the original at HERO_PHOTO.source)
 */
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { HERO_PHOTO } from '../src/data/photos.js';
import { cropBox } from './crop.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, HERO_PHOTO.source);
const outDir = path.join(root, 'public/images/hero');
const manifestPath = path.join(root, 'src/data/hero-manifest.json');

if (!existsSync(input)) {
  console.error(`Original photo not found: ${input}\nDownload it from ${HERO_PHOTO.sourceUrl} (see docs/PHOTOS.md).`);
  process.exit(1);
}

const image = sharp(input).rotate(); // honour EXIF orientation
const meta = await image.metadata();
const { width, height } = meta.autoOrient || meta;
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const manifest = { id: HERO_PHOTO.id, original: { width, height }, crops: {} };
for (const [name, crop] of Object.entries(HERO_PHOTO.crops)) {
  const box = cropBox(width, height, crop);
  const widths = crop.widths.filter((w) => w <= box.width);
  if (widths.length === 0) widths.push(box.width);
  const entry = { aspect: box.width / box.height, box, files: {} };
  for (const w of widths) {
    const h = Math.round(w / (box.width / box.height));
    const base = sharp(input).rotate().extract(box).resize(w, h); // metadata (EXIF, GPS) is stripped by default
    const stem = `${HERO_PHOTO.id}-${name}-${w}`;
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
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Hero images written to ${path.relative(root, outDir)} and manifest updated.`);
