/**
 * Generates the home-screen icons from public/favicon.svg (flag of Morges):
 *   public/apple-touch-icon.png (180 px, iPhone / iPad), public/icon-192.png and public/icon-512.png (Android).
 * The thin outline that keeps the flag visible on light browser tabs is dropped: phones add their own frame.
 *
 * Usage: npm run icons   (after changing public/favicon.svg)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(path.join(root, 'public/favicon.svg'), 'utf8').replace(/<path[^>]*stroke=[^>]*\/>/, '');

for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(Buffer.from(svg), { density: 72 * (size / 40) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, 'public', file));
}
console.log('Icons written to public/.');
