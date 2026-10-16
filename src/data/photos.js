import { validateText } from './schema.js';

/**
 * Photographs used by the site (present-day views). Every photo records its
 * author, source page, licence and the changes we made, as the licence requires.
 * See docs/PHOTOS.md for the workflow (download → `npm run images` → review).
 *
 * The hero is only shown on the home page once its responsive files have been
 * generated (src/data/hero-manifest.json); until then the home page keeps its
 * text-only introduction.
 */
export const HERO_PHOTO = {
  id: 'chateau-morges-bona-2009',
  /** Original file, downloaded unchanged from the source page. */
  source: 'assets/photos/Morges_chateau_Pierre_Bona_2009.jpg',
  title: 'Morges château.jpg',
  creator: 'Pierre Bona',
  date: '2009-04',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Morges_ch%C3%A2teau.jpg',
  sourceName: 'Wikimedia Commons',
  licence: 'CC BY-SA 3.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.fr',
  /** Our adaptation (crops, resizing) is shared under the same licence. */
  changes: {
    fr: 'recadrée',
    en: 'cropped',
    de: 'zugeschnitten',
    it: 'ritagliata',
  },
  alt: {
    fr: 'Le château de Morges, vu du côté nord-est.',
    en: 'Morges Castle, seen from the north-east.',
    de: 'Das Schloss Morges, von Nordosten gesehen.',
    it: 'Il castello di Morges, visto da nord-est.',
  },
  /**
   * Crops: aspect ratio and focal point (0–1 from the left / top). To be tuned
   * after viewing the photo so that the château and its towers stay in frame.
   */
  crops: {
    wide: { aspect: 21 / 9, focusX: 0.5, focusY: 0.5, widths: [960, 1440, 1920, 2560] },
    tall: { aspect: 4 / 5, focusX: 0.5, focusY: 0.5, widths: [480, 720, 960] },
  },
  /** Title over the photo only if it does not hide the château (decided after review). */
  overlayTitle: false,
  /** Licence checked on the source page by the Morges.info team (date), or null. */
  licenceVerified: null,
};

export function validateHeroPhoto(photo) {
  const errors = [];
  for (const key of ['id', 'source', 'creator', 'sourceUrl', 'sourceName', 'licence', 'licenceUrl']) {
    if (typeof photo[key] !== 'string' || !photo[key].trim()) errors.push(`hero.${key} is required`);
  }
  if (!/^https:\/\//.test(photo.sourceUrl || '')) errors.push('hero.sourceUrl must be https');
  if (!/^https:\/\/creativecommons\.org\//.test(photo.licenceUrl || '')) errors.push('hero.licenceUrl must link to the licence');
  errors.push(...validateText(photo.alt, 'hero.alt', { allLanguages: true }));
  errors.push(...validateText(photo.changes, 'hero.changes', { allLanguages: true }));
  for (const [name, crop] of Object.entries(photo.crops || {})) {
    if (!(crop.aspect > 0) || crop.focusX < 0 || crop.focusX > 1 || crop.focusY < 0 || crop.focusY > 1) errors.push(`hero.crops.${name} is invalid`);
  }
  return errors;
}
