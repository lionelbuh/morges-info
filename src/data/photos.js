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

/**
 * Photos that take turns as the home page's large photo, one per day (see heroOfTheDay).
 * Only photos whose licence allows cropping: no "ND" (no derivatives) licence here. Old photos
 * come from the photo map, prepared from its 1600 px files, and link to their page there.
 */
export const HERO_PHOTOS = [
  HERO_PHOTO,
  {
    id: 'port-jetee-1898',
    viewpointId: 'vue-port-jetee',
    source: 'public/images/photos/port-jetee-1898.webp',
    creator: { fr: 'photographe inconnu', en: 'unknown photographer', de: 'unbekannter Fotograf', it: 'fotografo sconosciuto' },
    creatorDetail: 'carte postale, 1898',
    sourceUrl: 'https://notrehistoire.ch/documents/01k81dgfjk2ntm2y14ym9g9q69',
    sourceName: 'notreHistoire.ch (Albin Salamin)',
    licence: 'Public Domain Mark 1.0',
    licenceUrl: 'https://creativecommons.org/publicdomain/mark/1.0/deed.fr',
    attribution: 'Morges, le port et le château depuis la jetée, carte postale de 1898 ; domaine public (notreHistoire.ch, Albin Salamin)',
    changes: { fr: 'recadrée', en: 'cropped', de: 'zugeschnitten', it: 'ritagliata' },
    alt: {
      fr: 'Carte postale de 1898 : le château de Morges et les maisons du bord du lac, vus depuis la passerelle en bois de la jetée.',
      en: 'Postcard from 1898: Morges Castle and the lakeside houses, seen from the wooden footbridge of the pier.',
      de: 'Postkarte von 1898: das Schloss Morges und die Häuser am Seeufer, vom hölzernen Steg der Mole aus gesehen.',
      it: 'Cartolina del 1898: il castello di Morges e le case in riva al lago, visti dalla passerella in legno del molo.',
    },
    // wide: the castle, the town and the footbridge, above the handwritten greetings; square: the castle and the footbridge.
    // The home page's frame is narrower than 2:1 on desktop: keep its left side (the castle) in view.
    position: '10% 50%',
    crops: {
      wide: { aspect: 2, focusX: 0.5, focusY: 0.32, widths: [960, 1440, 1600] },
      tall: { aspect: 1, focusX: 0.32, focusY: 0.4, widths: [480, 720, 1028] },
    },
    overlayTitle: false,
    licenceVerified: '2026-10-25',
  },
  {
    id: 'garage-sama-1969',
    viewpointId: 'vue-garage-sama',
    source: 'public/images/photos/garage-sama-total-1960s.webp',
    creator: { fr: 'photographe inconnu', en: 'unknown photographer', de: 'unbekannter Fotograf', it: 'fotografo sconosciuto' },
    creatorDetail: '1969',
    sourceUrl: 'https://notrehistoire.ch/documents/01k81d2650eryfj41q33fq98qt',
    sourceName: 'notreHistoire.ch (Michel Bezençon)',
    licence: 'Public Domain Mark 1.0',
    licenceUrl: 'https://creativecommons.org/publicdomain/mark/1.0/deed.fr',
    attribution: 'Le garage SAMA et sa station Total à Morges, 1969 ; domaine public (notreHistoire.ch, Michel Bezençon)',
    changes: { fr: 'recadrée', en: 'cropped', de: 'zugeschnitten', it: 'ritagliata' },
    alt: {
      fr: 'Le garage SAMA en 1969 : station-service Total sous un large auvent, voitures, camions et un scooter devant les pompes.',
      en: 'The SAMA garage in 1969: a Total filling station under a wide canopy, with cars, lorries and a scooter by the pumps.',
      de: 'Die Garage SAMA 1969: eine Total-Tankstelle unter einem breiten Vordach, mit Autos, Lastwagen und einem Roller an den Zapfsäulen.',
      it: 'Il garage SAMA nel 1969: distributore Total sotto un’ampia pensilina, con automobili, camion e uno scooter accanto alle pompe.',
    },
    crops: {
      wide: { aspect: 2, focusX: 0.5, focusY: 0.55, widths: [960, 1440, 1600] },
      tall: { aspect: 1, focusX: 0.42, focusY: 0.5, widths: [480, 720, 944] },
    },
    overlayTitle: false,
    licenceVerified: '2026-10-24',
  },
];

/** Days since 1 January 1970 for a YYYY-MM-DD date. */
const dayNumber = (iso) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);

/** The large photo of the home page for a given day (YYYY-MM-DD, in Morges): each in turn, one per day. */
export function heroOfTheDay(day, photos = HERO_PHOTOS) {
  return photos[((dayNumber(day) % photos.length) + photos.length) % photos.length];
}

export function getHeroPhoto(id) {
  return HERO_PHOTOS.find((photo) => photo.id === id);
}

export function validateHeroPhoto(photo) {
  const errors = [];
  for (const key of ['id', 'source', 'sourceUrl', 'sourceName', 'licence', 'licenceUrl', 'attribution']) {
    if (typeof photo[key] !== 'string' || !photo[key].trim()) errors.push(`hero.${key} is required`);
  }
  if (!/^https:\/\//.test(photo.sourceUrl || '')) errors.push('hero.sourceUrl must be https');
  if (typeof photo.creator !== 'string') errors.push(...validateText(photo.creator, 'hero.creator', { allLanguages: true }));
  else if (!photo.creator.trim()) errors.push('hero.creator is required');
  if (!/^https:\/\/creativecommons\.org\//.test(photo.licenceUrl || '')) errors.push('hero.licenceUrl must link to the licence');
  if (/\bND\b/.test(photo.licence || '')) errors.push('hero.licence: ND (no derivatives) forbids cropping');
  errors.push(...validateText(photo.alt, 'hero.alt', { allLanguages: true }));
  errors.push(...validateText(photo.changes, 'hero.changes', { allLanguages: true }));
  for (const [name, crop] of Object.entries(photo.crops || {})) {
    if (!(crop.aspect > 0) || crop.focusX < 0 || crop.focusX > 1 || crop.focusY < 0 || crop.focusY > 1) errors.push(`hero.crops.${name} is invalid`);
  }
  return errors;
}
