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
  id: 'chateau-morges-aerien-jaquet-2016',
  /** Original file as received (2000 × 1125 px), kept unchanged. */
  source: 'assets/photos/Chateau_de_Morges_aerien_D_Jaquet_Archeodom_2016.jpg',
  creator: 'D. Jaquet',
  creatorDetail: 'Archéodom 2016',
  creatorUrl: 'https://www.chateau-morges.ch',
  creatorUrlLabel: 'www.chateau-morges.ch',
  date: '2016',
  sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=61175456',
  sourceName: 'Wikimedia Commons',
  licence: 'CC BY-SA 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
  /** Attribution exactly as given on the Commons page (supplied by the Morges.info team). */
  attribution:
    'By D. Jaquet - Template:Archéodom2016 www.chateau-morges.ch, CC BY-SA 4.0, https://commons.wikimedia.org/w/index.php?curid=61175456',
  /** Our adaptation (crops, resizing) is shared under the same licence. */
  changes: {
    fr: 'recadrée',
    en: 'cropped',
    de: 'zugeschnitten',
    it: 'ritagliata',
  },
  alt: {
    fr: 'Vue aérienne du château de Morges et de ses quatre tours d’angle, avec le port, ses voiliers et le lac Léman en arrière-plan.',
    en: 'Aerial view of Morges Castle and its four corner towers, with the harbour, its sailing boats and Lake Geneva behind.',
    de: 'Luftaufnahme des Schlosses Morges mit seinen vier Ecktürmen, dahinter der Hafen mit Segelbooten und der Genfersee.',
    it: 'Veduta aerea del castello di Morges con le sue quattro torri angolari, il porto con le barche a vela e, sullo sfondo, il Lago Lemano.',
  },
  /**
   * Crops: aspect ratio and focal point (0–1 from the left / top).
   * wide (desktop, 2:1): full width, keeps the harbour towers and the whole château.
   * square (phones, 1:1): centred on the château so that all four towers stay in frame.
   */
  crops: {
    wide: { aspect: 2, focusX: 0.5, focusY: 0.5, widths: [960, 1440, 1920] },
    tall: { aspect: 1, focusX: 0.62, focusY: 0.5, widths: [480, 720, 1080] },
    /** Preview image when a page is shared (Facebook, WhatsApp…): 1200 × 630, JPEG only. */
    og: { aspect: 1200 / 630, focusX: 0.5, focusY: 0.5, widths: [1200], formats: ['jpg'] },
  },
  /** No title over the photo: the sky-free aerial view would put text on the château or the harbour. */
  overlayTitle: false,
  /**
   * Licence status: attribution and CC BY-SA 4.0 provided by the Morges.info team from the
   * Commons page on 2026-10-16 (not re-checked from the development environment, which cannot reach Commons).
   */
  licenceVerified: '2026-10-16',
};

export function validateHeroPhoto(photo) {
  const errors = [];
  for (const key of ['id', 'source', 'creator', 'sourceUrl', 'sourceName', 'licence', 'licenceUrl', 'attribution']) {
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
