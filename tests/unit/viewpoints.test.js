import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { setLang } from '../../src/i18n/index.js';
import { VIEWPOINTS, validateViewpoint, shownPhotos, publishedViewpoints } from '../../src/data/viewpoints.js';
import { viewpointBody, viewpointKind, formatPhotoDate, viewpointCard, placePhotosBlock } from '../../src/site/photos.js';

const texts = (s) => ({ fr: s, en: s, de: s, it: s });
const photo = (id, date, extra = {}) => ({
  id,
  title: texts(`Photo ${id}`),
  date,
  creator: 'A. Photographe',
  source: { institution: 'Collection privée' },
  rights: { status: 'granted', credit: 'Coll. X' },
  verification: { status: 'verified' },
  image: { src: `/images/photos/${id}.webp`, width: 1600, height: 1067 },
  ...extra,
});
const viewpoint = (id, then, now) => ({
  id,
  title: texts('Grand-Rue, vers l’est'),
  location: texts('Grand-Rue'),
  coordinates: { lat: 46.5086, lng: 6.4978 },
  geo: { status: 'team', sources: [{ label: 'Morges.info — test' }] },
  then,
  now,
});
const pair = viewpoint('vue-test-pair', photo('a', { value: '1925', precision: 'circa' }), photo('b', { value: '2026-10-01', precision: 'day' }));
const oldOnly = viewpoint('vue-test-old', photo('c', { value: '1930', precision: 'decade' }), null);

describe('photo map data', () => {
  beforeEach(() => setLang('fr'));

  it('published viewpoints are valid, with unique ids', () => {
    for (const vp of VIEWPOINTS) expect(validateViewpoint(vp), vp.id).toEqual([]);
    expect(new Set(VIEWPOINTS.map((vp) => vp.id)).size).toBe(VIEWPOINTS.length);
  });

  it('every published image is in public/', () => {
    for (const vp of publishedViewpoints()) {
      const { then, now, moreThen } = shownPhotos(vp);
      for (const p of [then, now, ...moreThen].filter(Boolean)) expect(existsSync(`public${p.image.src}`), p.image.src).toBe(true);
    }
  });

  it('accepts an old photo alone, or old and current together', () => {
    expect(validateViewpoint(pair)).toEqual([]);
    expect(validateViewpoint(oldOnly)).toEqual([]);
    expect(publishedViewpoints([pair, oldOnly])).toHaveLength(2);
  });

  it('rejects a viewpoint without photo, outside Morges or with a bad id', () => {
    expect(validateViewpoint({ ...oldOnly, then: null }).join()).toMatch(/needs a "then" or a "now"/);
    expect(validateViewpoint({ ...oldOnly, coordinates: { lat: 46.2, lng: 6.1 } }).join()).toMatch(/in Morges/);
    expect(validateViewpoint({ ...oldOnly, id: 'grand-rue' }).join()).toMatch(/vue-/);
  });

  it('hides a photo whose rights are not cleared (the viewpoint then waits)', () => {
    const pending = viewpoint('vue-test-pending', photo('d', { value: '1910', precision: 'year' }, { rights: { status: 'requested', credit: 'X' }, image: null }), null);
    expect(validateViewpoint(pending)).toEqual([]);
    expect(shownPhotos(pending)).toEqual({ then: null, now: null, moreThen: [] });
    expect(publishedViewpoints([pending])).toHaveLength(0);
  });
});

describe('photo map display', () => {
  beforeEach(() => setLang('fr'));

  it('old and current photos: before/after comparison with an accessible slider', () => {
    const html = viewpointBody(pair);
    expect(viewpointKind(pair)).toBe('pair');
    expect(html).toContain('class="vp-compare"');
    expect(html).toMatch(/<input class="vp-compare-range" type="range"[^>]+aria-label="Comparer/);
    expect(html).toContain('vers 1925');
    expect(html).not.toContain('vp-wanted');
  });

  it('old photo only: shows it and asks for today’s view by email', () => {
    const html = viewpointBody(oldOnly);
    expect(viewpointKind(oldOnly)).toBe('thenOnly');
    expect(html).toContain('vp-photo--then');
    expect(html).toContain('Photo d’aujourd’hui recherchée');
    // the email subject names the viewpoint, so the photo can be placed right away
    expect(decodeURIComponent(html.match(/subject=([^&"]+)/)[1])).toBe('Photo d’aujourd’hui pour « Grand-Rue, vers l’est » [vue-test-old]');
  });

  it('dates follow their precision, in each language', () => {
    expect(formatPhotoDate({ value: '1925', precision: 'circa' })).toBe('vers 1925');
    expect(formatPhotoDate({ value: '1930', precision: 'decade' })).toBe('années 1930');
    expect(formatPhotoDate({ value: '1912-06', precision: 'month' })).toBe('juin 1912');
    setLang('de');
    expect(formatPhotoDate({ value: '1925', precision: 'circa' })).toBe('um 1925');
    expect(formatPhotoDate({ value: '1930', precision: 'decade' })).toBe('1930er-Jahre');
    setLang('en');
    expect(formatPhotoDate({ value: '1930', precision: 'decade' })).toBe('1930s');
  });

  it('links the licence when its address is known', () => {
    const rights = { status: 'open-licence', licence: 'CC BY-NC-ND 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr', credit: 'Coll. Y' };
    const cc = viewpoint('vue-test-cc', photo('d', { value: '1902', precision: 'circa' }, { rights }), null);
    expect(validateViewpoint(cc)).toEqual([]);
    expect(viewpointBody(cc)).toContain(
      'Coll. Y (<a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr" target="_blank" rel="noopener license">CC BY-NC-ND 4.0</a>)',
    );
  });

  it('a place lists its old photos, or asks for one', () => {
    const withPhoto = placePhotosBlock('parc-independance', { href: (vp) => `#${vp.id}` });
    expect(withPhoto).toContain('href="#vue-parc-independance-kiosque"');
    expect(withPhoto).toContain('Photos anciennes');
    const without = placePhotosBlock('beausobre', { href: (vp) => `#${vp.id}` });
    expect(without).toContain('Pas encore de photo ancienne de ce lieu.');
    expect(without).toContain('href="/contribuer/"');
  });

  it('shows the other old photos taken from the same spot', () => {
    const two = { ...oldOnly, id: 'vue-test-two', moreThen: [photo('e', { value: '1904', precision: 'circa' })] };
    expect(validateViewpoint(two)).toEqual([]);
    const html = viewpointBody(two);
    expect(html.match(/vp-photo--then/g)).toHaveLength(2);
    expect(html).toContain('/images/photos/e.webp');
    expect(validateViewpoint({ ...two, then: null, now: oldOnly.then })).toEqual(expect.arrayContaining([expect.stringMatching(/moreThen/)]));
  });

  it('a "no derivatives" old photo is shown above the current one, never overlaid', () => {
    const nd = viewpoint('vue-test-nd', photo('f', { value: '1909', precision: 'circa' }, {
      rights: { status: 'open-licence', licence: 'CC BY-NC-ND 4.0', credit: 'Coll. Z' },
    }), photo('g', { value: '2026-10-29', precision: 'day' }));
    const html = viewpointBody(nd);
    expect(viewpointKind(nd)).toBe('pair');
    expect(html).not.toContain('vp-compare');
    expect(html).toContain('vp-photo--then');
    expect(html).toContain('vp-photo--now');
    expect(html).not.toContain('vp-wanted');
  });

  it('gallery card links to the photo page', () => {
    expect(viewpointCard(oldOnly, '/photos/vue-test-old/')).toContain('href="/photos/vue-test-old/"');
  });
});
