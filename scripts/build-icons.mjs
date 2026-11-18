/**
 * Generates the home-screen icons from the Morges.info emblem (src/site/emblem.js):
 *   public/apple-touch-icon.png (180 px, iPhone / iPad), public/icon-192.png and public/icon-512.png (Android).
 * Phones crop icons to their own shape and fill transparent corners, so the round emblem is set on a
 * square of the same lake blue. public/favicon.svg is the emblem itself.
 *
 * Usage: npm run icons   (after changing the emblem)
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { emblemShapes, emblemSvg, LAKE_BLUE } from '../src/site/emblem.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
writeFileSync(path.join(root, 'public/favicon.svg'), `${emblemSvg({ attrs: 'width="200" height="200"' })}\n`);
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="${LAKE_BLUE}"/>
  <g transform="translate(100 100) scale(0.92) translate(-100 -100)">${emblemShapes()}</g>
</svg>`;

for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(Buffer.from(square), { density: 72 * (size / 200) * 2 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, 'public', file));
}
console.log('Icons written to public/.');
