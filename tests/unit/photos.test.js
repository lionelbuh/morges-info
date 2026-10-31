import { describe, it, expect, beforeEach } from 'vitest';
import { HERO_PHOTO, HERO_PHOTOS, validateHeroPhoto, heroOfTheDay } from '../../src/data/photos.js';
import shareManifest from '../../src/data/share-manifest.json' with { type: 'json' };
import { shareImage } from '../../src/site/layout.js';
import { photoPageId } from '../../src/site/config.js';
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

  it('ships generated files for every photo of the day (wide 2:1 and square crops)', () => {
    for (const photo of HERO_PHOTOS) {
      const manifest = heroManifest[photo.id];
      expect(manifest.id, photo.id).toBe(photo.id);
      expect(manifest.crops.wide.box.width / manifest.crops.wide.box.height, photo.id).toBe(2);
      expect(manifest.crops.tall.box.width, photo.id).toBe(manifest.crops.tall.box.height);
      for (const fmt of ['avif', 'webp', 'jpg']) expect(manifest.crops.wide.files[fmt].length, photo.id).toBeGreaterThan(0);
    }
    expect(heroManifest[HERO_PHOTO.id].crops.og.files.jpg[0]).toEqual({ src: '/images/hero/chateau-morges-aerien-jaquet-2016-og-1200.jpg', width: 1200, height: 630 });
  });

  it('photos of the day: complete credits, never an ND licence, a different one each day in turn', () => {
    expect(HERO_PHOTOS[0]).toBe(HERO_PHOTO);
    for (const photo of HERO_PHOTOS) expect(validateHeroPhoto(photo), photo.id).toEqual([]);
    expect(validateHeroPhoto({ ...HERO_PHOTOS[1], licence: 'CC BY-NC-ND 4.0' }).join()).toContain('ND');
    const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'].map((d) => heroOfTheDay(d).id);
    expect(new Set(days.slice(0, 3)).size).toBe(3);
    expect(days[3]).toBe(days[0]);
    expect(new Set(Array.from({ length: 30 }, (_, i) => heroOfTheDay(`2026-12-${String(i + 1).padStart(2, '0')}`).id)).size).toBe(HERO_PHOTOS.length);
  });

  it('an old photo of the day is credited and links to the photo map', () => {
    const port = HERO_PHOTOS.find((p) => p.id === 'port-jetee-1898');
    const html = heroPhoto(port, heroManifest[port.id]);
    expect(html).toContain('data-hero-id="port-jetee-1898"');
    expect(html).toContain('photographe inconnu – carte postale, 1898');
    expect(html).toContain('Public Domain Mark 1.0');
    expect(html).toContain('href="/carte/#vue-port-jetee"');
    setLang('en', { persist: false });
    expect(heroPhoto(port, heroManifest[port.id])).toContain('unknown photographer');
  });

  it('shared links show the page’s own photo; the home page keeps the castle', () => {
    expect(shareImage('home').src).toBe('/images/hero/chateau-morges-aerien-jaquet-2016-og-1200.jpg');
    expect(shareImage('voices').src).toBe('/images/hero/chateau-morges-aerien-jaquet-2016-og-1200.jpg');
    const port = shareImage(photoPageId('vue-port-jetee'));
    expect(port).toEqual({ ...shareManifest['/images/photos/port-jetee-1898.webp'], alt: expect.stringContaining('1898') });
    expect(port.src).toBe('/images/share/port-jetee-1898.jpg');
    expect(shareImage('businesses').src).toMatch(/^\/images\/share\/amandine-reflexologie-.+\.jpg$/);
    expect(shareImage('photos').src).toMatch(/^\/images\/share\/.+\.jpg$/);
    for (const image of Object.values(shareManifest)) expect(image.width).toBeLessThanOrEqual(1200);
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
