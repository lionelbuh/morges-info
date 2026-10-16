import { describe, it, expect, beforeEach } from 'vitest';
import { HERO_PHOTO, validateHeroPhoto } from '../../src/data/photos.js';
import heroManifest from '../../src/data/hero-manifest.json' with { type: 'json' };
import { heroPhoto } from '../../src/site/components.js';
import { cropBox } from '../../scripts/crop.js';
import { setLang } from '../../src/i18n/index.js';

const fakeManifest = {
  id: HERO_PHOTO.id,
  crops: {
    wide: { files: Object.fromEntries(['avif', 'webp', 'jpg'].map((f) => [f, [960, 1440].map((w) => ({ src: `/images/hero/x-wide-${w}.${f}`, width: w, height: Math.round(w / (21 / 9)) }))])) },
    tall: { files: Object.fromEntries(['avif', 'webp', 'jpg'].map((f) => [f, [480].map((w) => ({ src: `/images/hero/x-tall-${w}.${f}`, width: w, height: 600 }))])) },
  },
};

describe('hero photograph', () => {
  beforeEach(() => setLang('fr', { persist: false }));

  it('records author, source, licence, changes and alt text in four languages', () => {
    expect(validateHeroPhoto(HERO_PHOTO)).toEqual([]);
    expect(HERO_PHOTO.creator).toBe('D. Jaquet');
    expect(HERO_PHOTO.licence).toBe('CC BY-SA 4.0');
    expect(HERO_PHOTO.attribution).toContain('curid=61175456');
  });

  it('is not shown until the responsive files have been generated', () => {
    expect(heroPhoto(HERO_PHOTO, {})).toBe('');
    expect(heroPhoto(HERO_PHOTO, { id: 'other', crops: fakeManifest.crops })).toBe('');
  });

  it('ships generated files for this photo (wide 2:1 and square crops)', () => {
    expect(heroManifest.id).toBe(HERO_PHOTO.id);
    expect(heroManifest.crops.wide.box.width / heroManifest.crops.wide.box.height).toBe(2);
    expect(heroManifest.crops.tall.box.width).toBe(heroManifest.crops.tall.box.height);
    for (const fmt of ['avif', 'webp', 'jpg']) expect(heroManifest.crops.wide.files[fmt].length).toBeGreaterThan(0);
  });

  it('renders AVIF → WebP → JPEG, a tall crop for phones, alt text and the licence credit', () => {
    const html = heroPhoto(HERO_PHOTO, fakeManifest);
    expect(html.indexOf('image/avif')).toBeLessThan(html.indexOf('image/webp'));
    expect(html).toContain('media="(max-width: 700px)"');
    expect(html).toContain('alt="Vue aérienne du château de Morges');
    expect(html).toContain('href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"');
    expect(html).toContain('D. Jaquet – Archéodom 2016');
    expect(html).toContain('href="https://www.chateau-morges.ch"');
    expect(html).toContain('href="https://commons.wikimedia.org/w/index.php?curid=61175456"');
    expect(html).toContain('(recadrée)');
    expect(html).toContain('fetchpriority="high"');
    setLang('de', { persist: false });
    expect(heroPhoto(HERO_PHOTO, fakeManifest)).toContain('alt="Luftaufnahme des Schlosses Morges');
  });

  it('crops around the focal point without leaving the image', () => {
    expect(cropBox(3136, 2352, { aspect: 21 / 9, focusX: 0.5, focusY: 0.5 })).toEqual({ left: 0, top: 504, width: 3136, height: 1344 });
    expect(cropBox(3136, 2352, { aspect: 4 / 5, focusX: 0, focusY: 0.5 })).toEqual({ left: 0, top: 0, width: 1882, height: 2352 });
    expect(cropBox(3136, 2352, { aspect: 21 / 9, focusX: 0.5, focusY: 1 }).top).toBe(2352 - 1344);
  });
});
