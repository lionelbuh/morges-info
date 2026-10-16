import { describe, it, expect, beforeEach } from 'vitest';
import { HERO_PHOTO, validateHeroPhoto } from '../../src/data/photos.js';
import heroManifest from '../../src/data/hero-manifest.json';
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
    expect(HERO_PHOTO.creator).toBe('Pierre Bona');
    expect(HERO_PHOTO.licence).toBe('CC BY-SA 3.0');
  });

  it('is not shown until the responsive files have been generated', () => {
    expect(heroPhoto(HERO_PHOTO, {})).toBe('');
    expect(heroPhoto(HERO_PHOTO, { id: 'other', crops: fakeManifest.crops })).toBe('');
  });

  it('matches the committed manifest (empty, or generated for this photo)', () => {
    if (Object.keys(heroManifest).length) expect(heroManifest.id).toBe(HERO_PHOTO.id);
  });

  it('renders AVIF → WebP → JPEG, a tall crop for phones, alt text and the licence credit', () => {
    const html = heroPhoto(HERO_PHOTO, fakeManifest);
    expect(html.indexOf('image/avif')).toBeLessThan(html.indexOf('image/webp'));
    expect(html).toContain('media="(max-width: 700px)"');
    expect(html).toContain('alt="Le château de Morges, vu du côté nord-est."');
    expect(html).toContain('href="https://creativecommons.org/licenses/by-sa/3.0/deed.fr"');
    expect(html).toContain('Pierre Bona');
    expect(html).toContain('(recadrée)');
    expect(html).toContain('fetchpriority="high"');
    setLang('de', { persist: false });
    expect(heroPhoto(HERO_PHOTO, fakeManifest)).toContain('alt="Das Schloss Morges, von Nordosten gesehen."');
  });

  it('crops around the focal point without leaving the image', () => {
    expect(cropBox(3136, 2352, { aspect: 21 / 9, focusX: 0.5, focusY: 0.5 })).toEqual({ left: 0, top: 504, width: 3136, height: 1344 });
    expect(cropBox(3136, 2352, { aspect: 4 / 5, focusX: 0, focusY: 0.5 })).toEqual({ left: 0, top: 0, width: 1882, height: 2352 });
    expect(cropBox(3136, 2352, { aspect: 21 / 9, focusX: 0.5, focusY: 1 }).top).toBe(2352 - 1344);
  });
});
