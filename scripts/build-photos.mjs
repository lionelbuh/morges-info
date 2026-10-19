/**
 * Prepares photos for the photo map: assets/photos/map/<name>.(jpg|jpeg|png|tif|tiff|webp)
 * → public/images/photos/<name>.webp (at most 1600 px wide, metadata such as GPS removed),
 * and prints the `image` value to paste into src/data/viewpoints.js.
 *
 * The originals stay out of git (see .gitignore); keep them safely elsewhere.
 * Usage: npm run photos
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inDir = path.join(root, 'assets/photos/map');
const outDir = path.join(root, 'public/images/photos');

if (!existsSync(inDir)) {
  console.error(`Put the original photos in ${path.relative(root, inDir)}/ first.`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(inDir).filter((f) => /\.(jpe?g|png|tiff?|webp)$/i.test(f)).sort()) {
  const name = path.parse(file).name.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const out = path.join(outDir, `${name}.webp`);
  const info = await sharp(path.join(inDir, file))
    .rotate() // honour EXIF orientation; metadata is not copied to the output
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(out);
  console.log(`${file} → image: { src: '/images/photos/${name}.webp', width: ${info.width}, height: ${info.height} }`);
}
