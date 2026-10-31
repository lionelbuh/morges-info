/**
 * Preview images for links shared on social networks and messaging apps (og:image):
 * each photo of the photo map and of the businesses as a JPEG, at most 1200 px wide.
 * The photo is kept whole (no crop: some licences forbid changes), only resized.
 *   public/images/{photos,businesses}/<name>.webp → public/images/share/<name>.jpg
 * and src/data/share-manifest.json ({ "<webp path>": { src, width, height } }).
 *
 * Usage: npm run share   (after adding or changing photos)
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/images/share');
const manifestPath = path.join(root, 'src/data/share-manifest.json');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const dir of ['photos', 'businesses']) {
  for (const file of readdirSync(path.join(root, 'public/images', dir)).filter((f) => f.endsWith('.webp')).sort()) {
    const name = path.parse(file).name;
    const info = await sharp(path.join(root, 'public/images', dir, file))
      .resize({ width: 1200, withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(path.join(outDir, `${name}.jpg`));
    manifest[`/images/${dir}/${file}`] = { src: `/images/share/${name}.jpg`, width: info.width, height: info.height };
  }
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${Object.keys(manifest).length} share images written to ${path.relative(root, outDir)}.`);
