import { validateText, validateSources, validatePhoto, validateOpeningHours, validateCommercial, isIsoDate } from './schema.js';

/**
 * Independent businesses in the commune of Morges, listed free of charge.
 *
 * Add an entry only after verifying it — never from guesswork or scraped
 * directories — and publish photos only with the business's agreement.
 *
 * Shape of an entry (see docs/CONTENT.md for a full example):
 * {
 *   id: 'kebab-case-id',
 *   name: 'Nom officiel',
 *   category: 'health' | 'food' | 'shops' | 'services',
 *   address: 'Rue …, 1110 Morges',
 *   phone?: '+41 xx xxx xx xx',
 *   email?: 'name@domain.ch',                       // shown entity-encoded
 *   coordinates: { lat, lng } | null,
 *   description: { fr: '…', en?, de?, it? },     // written by the editors
 *   website: 'https://…' | null,
 *   instagram?: 'https://www.instagram.com/…/',
 *   openingHours: null | { text: { fr }, sources, lastVerified },
 *   photos: [],                                     // Photo, see schema.js; several → carousel
 *   sources: [{ label, url }],
 *   lastVerified: 'YYYY-MM-DD',
 *   editorial: { selected: true },                  // editors' choice — cannot be bought
 *   commercial: { status: 'none' },                 // future: 'enhanced' | 'sponsored'
 * }
 */
export const BUSINESS_CATEGORIES = ['health', 'food', 'shops', 'services'];

export const BUSINESSES = [
  {
    id: 'amandine-reflexologie',
    name: 'Amandine Réflexologie',
    category: 'health',
    address: 'Rue Louis-de-Savoie 29, 1110 Morges',
    addressNote: 'Espace Anahata',
    phone: '+41 78 606 20 81',
    email: 'info@amandinereflexologie.ch',
    coordinates: null,
    description: {
      fr: 'Thérapeute en réflexologie à l’Espace Anahata : réflexologie thérapeutique et préventive (diverses méthodes), drainage lymphatique et massage métamorphique par voies réflexes, massage du visage et Reiki. Reconnue ASCA et RME, certificat de branche OrTra TC.',
      en: 'Reflexology therapist at Espace Anahata: therapeutic and preventive reflexology (various methods), lymphatic drainage and metamorphic massage through reflex zones, facial massage and Reiki. Recognised by ASCA and RME, OrTra TC branch certificate.',
      de: 'Reflexologie-Therapeutin im Espace Anahata: therapeutische und präventive Reflexzonentherapie (verschiedene Methoden), Lymphdrainage und Metamorphose-Massage über Reflexzonen, Gesichtsmassage und Reiki. Von ASCA und EMR anerkannt, Branchenzertifikat OdA KT.',
      it: 'Terapeuta di riflessologia all’Espace Anahata: riflessologia terapeutica e preventiva (diversi metodi), linfodrenaggio e massaggio metamorfico per vie riflesse, massaggio del viso e Reiki. Riconosciuta ASCA e RME, certificato di settore OrTra TC.',
    },
    website: 'https://amandinereflexologie.ch/',
    instagram: 'https://www.instagram.com/amandinereflexologie/',
    openingHours: null,
    photos: [
      {
        src: '/images/businesses/amandine-reflexologie-salle-de-soins.webp',
        width: 1200,
        height: 900,
        alt: {
          fr: 'Salle de soins d’Amandine Réflexologie : table de soins, attrape-rêves, plantes et fenêtre aux voilages blancs',
          en: 'Amandine Réflexologie’s treatment room: treatment table, dreamcatchers, plants and a window with white curtains',
          de: 'Behandlungsraum von Amandine Réflexologie: Behandlungsliege, Traumfänger, Pflanzen und Fenster mit weissen Vorhängen',
          it: 'Sala trattamenti di Amandine Réflexologie: lettino, acchiappasogni, piante e finestra con tende bianche',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-flyer.webp',
        width: 901,
        height: 714,
        alt: {
          fr: 'Flyer d’Amandine Réflexologie : réflexologie, drainage lymphatique, massage métamorphique, massage du visage, Reiki',
          en: 'Amandine Réflexologie flyer: reflexology, lymphatic drainage, metamorphic massage, facial massage, Reiki',
          de: 'Flyer von Amandine Réflexologie: Reflexzonentherapie, Lymphdrainage, Metamorphose-Massage, Gesichtsmassage, Reiki',
          it: 'Volantino di Amandine Réflexologie: riflessologia, linfodrenaggio, massaggio metamorfico, massaggio del viso, Reiki',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-cabinet.webp',
        width: 1200,
        height: 900,
        alt: {
          fr: 'Le cabinet en soirée : table de soins, bureau et chaises, miroirs dorés au mur',
          en: 'The practice in the evening: treatment table, desk and chairs, golden mirrors on the wall',
          de: 'Die Praxis am Abend: Behandlungsliege, Schreibtisch und Stühle, goldene Spiegel an der Wand',
          it: 'Lo studio la sera: lettino, scrivania e sedie, specchi dorati alla parete',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-salle-attente.webp',
        width: 900,
        height: 1200,
        alt: {
          fr: 'Salle d’attente sous les toits, avec fauteuils en rotin et fenêtre donnant sur le lac',
          en: 'Waiting room under the roof, with rattan chairs and a window overlooking the lake',
          de: 'Wartezimmer unter dem Dach, mit Rattanstühlen und Fenster mit Blick auf den See',
          it: 'Sala d’attesa sotto il tetto, con poltrone in rattan e finestra sul lago',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
    ],
    sources: [
      { label: 'Amandine Réflexologie — site web', url: 'https://amandinereflexologie.ch/' },
      { label: 'Morges.info — informations et flyer transmis par Amandine Réflexologie (28.10.2026)' },
    ],
    lastVerified: '2026-10-28',
    editorial: { selected: true },
    commercial: { status: 'none' },
  },
];

/** Bounding box of the commune (generous): businesses must be inside Morges. */
const MORGES_BBOX = { minLat: 46.495, maxLat: 46.53, minLng: 6.46, maxLng: 6.53 };

export function validateBusiness(b, opts = {}) {
  const p = `business(${b && b.id})`;
  const errors = [];
  if (!b || typeof b.id !== 'string' || !/^[a-z0-9-]+$/.test(b.id)) errors.push(`${p}.id must be kebab-case`);
  if (!b || typeof b.name !== 'string' || !b.name.trim()) errors.push(`${p}.name is required`);
  if (!b || !BUSINESS_CATEGORIES.includes(b.category)) errors.push(`${p}.category is invalid`);
  if (!b || typeof b.address !== 'string' || !/1110 Morges/.test(b.address)) errors.push(`${p}.address must be in 1110 Morges`);
  if (b && b.phone !== undefined && !/^\+41 \d{2} \d{3} \d{2} \d{2}$/.test(b.phone)) errors.push(`${p}.phone must look like +41 21 123 45 67`);
  if (b && b.email !== undefined && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(b.email)) errors.push(`${p}.email is invalid`);
  if (b && b.coordinates) {
    const { lat, lng } = b.coordinates;
    if (!(lat > MORGES_BBOX.minLat && lat < MORGES_BBOX.maxLat && lng > MORGES_BBOX.minLng && lng < MORGES_BBOX.maxLng)) {
      errors.push(`${p}.coordinates are outside Morges`);
    }
  }
  errors.push(...validateText(b && b.description, `${p}.description`));
  if (b && b.website !== null && !/^https:\/\//.test(b.website || '')) errors.push(`${p}.website must be https or null`);
  if (b && b.instagram !== undefined && !/^https:\/\/www\.instagram\.com\/[\w.]+\/?$/.test(b.instagram)) errors.push(`${p}.instagram must be an instagram.com profile address`);
  errors.push(...validateOpeningHours(b && b.openingHours, `${p}.openingHours`));
  (b && b.photos ? b.photos : []).forEach((photo, i) => errors.push(...validatePhoto(photo, `${p}.photos[${i}]`)));
  errors.push(...validateSources(b && b.sources, `${p}.sources`));
  if (!b || !isIsoDate(b.lastVerified)) errors.push(`${p}.lastVerified must be YYYY-MM-DD`);
  if (!b || !b.editorial || typeof b.editorial.selected !== 'boolean') errors.push(`${p}.editorial.selected is required`);
  errors.push(...validateCommercial(b && b.commercial, `${p}.commercial`, opts));
  return errors;
}

/** Entries shown in the editorial selection (sponsored entries are never part of it). */
export function editorialSelection(list = BUSINESSES) {
  return list.filter((b) => b.editorial && b.editorial.selected && b.commercial.status !== 'sponsored');
}
