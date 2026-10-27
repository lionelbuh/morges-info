/**
 * The photo map: points from which a photograph of Morges was taken ("points de vue").
 *
 * Each viewpoint holds the old photo (`then`), the current photo (`now`), or both — often only the old
 * one at first, until a reader sends today's view taken from the same spot. With both, the site shows a
 * before/after comparison; with one, it asks readers for the missing photo.
 *
 * Every photo follows the archive record (archive.js): date with precision, author, source, rights and
 * verification. An image is published only when rights are cleared and verification is "verified".
 * Never add generated images or pictures copied from the internet. How to add photos: docs/PHOTO_MAP.md.
 *
 * @typedef {Object} Viewpoint
 * @property {string} id                 "vue-…" (lowercase, digits, hyphens); also the page address /photos/<id>/
 * @property {Record<'fr'|'en'|'de'|'it', string>} title     short title, e.g. "Grand-Rue, vers l'est"
 * @property {Record<'fr'|'en'|'de'|'it', string>} location  street or place, in words
 * @property {{lat: number, lng: number}} coordinates         where the photographer stood
 * @property {{ status: string, sources: object[], note?: string }} geo   as for places (places.js)
 * @property {string=} placeId          nearby place of the map, if any
 * @property {import('./archive.js').ArchivePhoto|null} then  old photo (placeId not needed)
 * @property {import('./archive.js').ArchivePhoto|null} now   current photo
 */
import { validateArchivePhoto, publishablePhotos } from './archive.js';
import { validateText, validateSources } from './schema.js';

/** @type {Viewpoint[]} */
export const VIEWPOINTS = [
  {
    id: 'vue-parc-independance-kiosque',
    title: {
      fr: 'Le kiosque à musique du parc de l’Indépendance',
      en: 'The bandstand in the Parc de l’Indépendance',
      de: 'Der Musikpavillon im Parc de l’Indépendance',
      it: 'Il chiosco della musica nel Parc de l’Indépendance',
    },
    location: {
      fr: 'Parc de l’Indépendance, au bord du lac',
      en: 'Parc de l’Indépendance, on the lakeshore',
      de: 'Parc de l’Indépendance, am Seeufer',
      it: 'Parc de l’Indépendance, sulla riva del lago',
    },
    coordinates: { lat: 46.50569818581667, lng: 6.495344864861067 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 25.10.2026' }],
      note: 'Approximate spot where the photographer stood, facing the bandstand.',
    },
    placeId: 'parc-independance',
    then: {
      id: 'parc-independance-kiosque-1902',
      title: {
        fr: 'Morges, parc de l’Indépendance : le kiosque à musique, carte postale de 1902',
        en: 'Morges, Parc de l’Indépendance: the bandstand, postcard from 1902',
        de: 'Morges, Parc de l’Indépendance: der Musikpavillon, Postkarte von 1902',
        it: 'Morges, Parc de l’Indépendance: il chiosco della musica, cartolina del 1902',
      },
      caption: {
        fr: 'Le kiosque, élevé en 1897 d’après les plans du serrurier morgien Auguste Badan. Seul son socle fut conservé en 1961 ; il a été reconstruit en 1986. Carte postale envoyée de Morges le 3 septembre 1902.',
        en: 'The bandstand, built in 1897 to plans by the Morges locksmith Auguste Badan. Only its base was kept in 1961; it was rebuilt in 1986. Postcard sent from Morges on 3 September 1902.',
        de: 'Der Pavillon wurde 1897 nach Plänen des Morger Schlossers Auguste Badan errichtet. 1961 blieb nur der Sockel erhalten; 1986 wurde er wieder aufgebaut. Postkarte, am 3. September 1902 in Morges abgeschickt.',
        it: 'Il chiosco, eretto nel 1897 su progetto del fabbro morgiense Auguste Badan. Nel 1961 se ne conservò solo lo zoccolo; è stato ricostruito nel 1986. Cartolina spedita da Morges il 3 settembre 1902.',
      },
      // The card was posted on 3 September 1902; the photograph itself was taken between 1897 and then.
      date: { value: '1902', precision: 'circa' },
      creator: 'Edouard Staub, éditeur, Morges',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81dkz4re35har48smt9rdxp' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'Philippe Chappuis (collection personnelle)',
        credit: 'Collection Philippe Chappuis',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-25',
        notes:
          'Licence read on the notreHistoire.ch page. Non-commercial (NC): remove or ask permission before any advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped, only resized.',
      },
      image: { src: '/images/photos/parc-independance-kiosque-1902.webp', width: 1600, height: 1044 },
    },
    now: null,
  },
  {
    id: 'vue-garage-sama',
    title: {
      fr: 'Le garage SAMA et sa station Total',
      en: 'The SAMA garage and its Total petrol station',
      de: 'Die Garage SAMA mit ihrer Total-Tankstelle',
      it: 'Il garage SAMA e il suo distributore Total',
    },
    location: {
      fr: 'Au nord-est de la vieille ville',
      en: 'North-east of the old town',
      de: 'Nordöstlich der Altstadt',
      it: 'A nord-est del centro storico',
    },
    coordinates: { lat: 46.51311987466832, lng: 6.50113758073046 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 25.10.2026' }],
      note: 'Spot where the photographer stood, facing the garage; position confirmed by the site owner on 2026-10-25.',
    },
    then: {
      id: 'garage-sama-total-1960s',
      title: {
        fr: 'Morges, le garage SAMA, agence Fiat et station-service Total',
        en: 'Morges, the SAMA garage, Fiat dealer and Total petrol station',
        de: 'Morges, die Garage SAMA, Fiat-Vertretung und Total-Tankstelle',
        it: 'Morges, il garage SAMA, concessionaria Fiat e distributore Total',
      },
      caption: {
        fr: 'Agence Fiat et station-service Total en 1969, avec ses pompes sous un large auvent.',
        en: 'Fiat dealer and Total petrol station in 1969, its pumps under a wide canopy.',
        de: 'Fiat-Vertretung und Total-Tankstelle im Jahr 1969, mit Zapfsäulen unter einem breiten Vordach.',
        it: 'Concessionaria Fiat e distributore Total nel 1969, con le pompe sotto un’ampia pensilina.',
      },
      // notreHistoire.ch first gave 1949; the cars (Fiat models launched in 1965–66) and the site owner give 1969.
      date: { value: '1969', precision: 'year' },
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81d2650eryfj41q33fq98qt' },
      rights: {
        status: 'public-domain',
        licence: 'Public Domain Mark 1.0',
        licenceUrl: 'https://creativecommons.org/publicdomain/mark/1.0/deed.fr',
        credit: 'Michel Bezençon',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-25',
        notes:
          'Marked public domain by Michel Bezençon on notreHistoire.ch; photographer unknown. Date 1969 (cars, and confirmed by the site owner) instead of 1949. Swiss law: a photo without individual character is protected 50 years after it was taken, so the mark holds; remove at once if a rights holder comes forward. Scanner edge trimmed at the bottom (8 px).',
      },
      image: { src: '/images/photos/garage-sama-total-1960s.webp', width: 1600, height: 944 },
    },
    now: null,
  },
  {
    id: 'vue-rue-des-charpentiers',
    title: {
      fr: 'La rue des Charpentiers',
      en: 'Rue des Charpentiers',
      de: 'Die Rue des Charpentiers',
      it: 'La Rue des Charpentiers',
    },
    location: {
      fr: 'Rue des Charpentiers',
      en: 'Rue des Charpentiers',
      de: 'Rue des Charpentiers',
      it: 'Rue des Charpentiers',
    },
    coordinates: { lat: 46.509095, lng: 6.49622 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 25.10.2026' }],
      note: 'Spot where the photographer stood, looking along the street.',
    },
    then: {
      id: 'rue-des-charpentiers-briquet',
      title: {
        fr: 'Morges, la rue des Charpentiers, carte postale Briquet & Fils',
        en: 'Morges, Rue des Charpentiers, Briquet & Fils postcard',
        de: 'Morges, Rue des Charpentiers, Postkarte von Briquet & Fils',
        it: 'Morges, Rue des Charpentiers, cartolina Briquet & Fils',
      },
      caption: {
        fr: 'Passants et cycliste dans la rue des Charpentiers, bordée à gauche d’un immeuble à balcons en fer forgé. Carte postale n° 1591 des éditeurs Briquet & Fils.',
        en: 'Passers-by and a cyclist in the Rue des Charpentiers, lined on the left by a building with wrought-iron balconies. Postcard no. 1591 by the publishers Briquet & Fils.',
        de: 'Passanten und ein Radfahrer in der Rue des Charpentiers, links ein Wohnhaus mit schmiedeeisernen Balkonen. Postkarte Nr. 1591 des Verlags Briquet & Fils.',
        it: 'Passanti e un ciclista nella Rue des Charpentiers, fiancheggiata a sinistra da un edificio con balconi in ferro battuto. Cartolina n. 1591 degli editori Briquet & Fils.',
      },
      date: { value: '1935', precision: 'circa' },
      creator: 'Briquet & Fils, éditeurs',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81d124s8yemenfbj2qf7beb' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'Philippe Chappuis (collection personnelle)',
        credit: 'Collection Philippe Chappuis',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-25',
        notes:
          'Licence read on the notreHistoire.ch page; date 1935 as given there. Non-commercial (NC): no advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped, only resized.',
      },
      image: { src: '/images/photos/rue-des-charpentiers-briquet.webp', width: 1600, height: 1005 },
    },
    now: null,
  },
  {
    id: 'vue-port-jetee',
    title: {
      fr: 'Le port et le château, depuis la jetée',
      en: 'The harbour and the castle, from the pier',
      de: 'Hafen und Schloss, von der Mole aus',
      it: 'Il porto e il castello, dal molo',
    },
    location: {
      fr: 'Port de Morges, sur la passerelle de la jetée',
      en: 'Morges harbour, on the pier footbridge',
      de: 'Hafen von Morges, auf dem Steg zur Mole',
      it: 'Porto di Morges, sulla passerella del molo',
    },
    coordinates: { lat: 46.50767235877045, lng: 6.499264780043314 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 25.10.2026' }],
      note: 'Spot where the photographer stood on the pier footbridge, looking towards the castle.',
    },
    placeId: 'port',
    then: {
      id: 'port-jetee-1898',
      title: {
        fr: 'Morges, le port et le château depuis la jetée, carte postale de 1898',
        en: 'Morges, the harbour and the castle from the pier, postcard from 1898',
        de: 'Morges, Hafen und Schloss von der Mole aus, Postkarte von 1898',
        it: 'Morges, il porto e il castello dal molo, cartolina del 1898',
      },
      caption: {
        fr: 'Carte de vœux envoyée pour la fin de l’année 1898. À gauche le château, à droite l’Hôtel du Mont-Blanc.',
        en: 'New Year greetings card sent at the end of 1898. The castle on the left, the Hôtel du Mont-Blanc on the right.',
        de: 'Neujahrskarte, Ende 1898 verschickt. Links das Schloss, rechts das Hôtel du Mont-Blanc.',
        it: 'Cartolina d’auguri spedita alla fine del 1898. A sinistra il castello, a destra l’Hôtel du Mont-Blanc.',
      },
      // The card was sent in December 1898; the photograph itself is from that year or earlier.
      date: { value: '1898', precision: 'circa' },
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81dgfjk2ntm2y14ym9g9q69' },
      rights: {
        status: 'public-domain',
        licence: 'Public Domain Mark 1.0',
        licenceUrl: 'https://creativecommons.org/publicdomain/mark/1.0/deed.fr',
        credit: 'Albin Salamin',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-25',
        notes:
          'Marked public domain by Albin Salamin on notreHistoire.ch; photographer unknown. Published in 1898: for an unknown author, Swiss protection ended 70 years after publication.',
      },
      image: { src: '/images/photos/port-jetee-1898.webp', width: 1600, height: 1028 },
    },
    now: null,
  },
  {
    id: 'vue-debarcadere',
    title: {
      fr: 'Le débarcadère',
      en: 'The landing stage',
      de: 'Die Schiffsanlegestelle',
      it: 'L’imbarcadero',
    },
    location: {
      fr: 'Débarcadère CGN, quai Igor-Stravinski',
      en: 'CGN pier, Quai Igor-Stravinski',
      de: 'CGN-Anlegestelle, Quai Igor-Stravinski',
      it: 'Imbarcadero CGN, Quai Igor-Stravinski',
    },
    coordinates: { lat: 46.508333282362265, lng: 6.50056336850798 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 26.10.2026' }],
      note: 'Spot where the photographer stood on the landing-stage footbridge, looking out to the lake.',
    },
    placeId: 'debarcadere-cgn',
    then: {
      id: 'debarcadere-1909',
      title: {
        fr: 'Morges, le débarcadère, carte postale de 1909',
        en: 'Morges, the landing stage, postcard from 1909',
        de: 'Morges, die Schiffsanlegestelle, Postkarte von 1909',
        it: 'Morges, l’imbarcadero, cartolina del 1909',
      },
      caption: {
        fr: 'Le débarcadère, un pavillon vitré et fleuri au bout de sa passerelle, avec un voilier sur le lac. Carte postale de 1909.',
        en: 'The landing stage, a glazed pavilion decked with flowers at the end of its footbridge, with a sailing boat on the lake. Postcard from 1909.',
        de: 'Die Anlegestelle, ein verglaster, mit Blumen geschmückter Pavillon am Ende ihres Stegs, mit einem Segelboot auf dem See. Postkarte von 1909.',
        it: 'L’imbarcadero, un padiglione vetrato e fiorito in fondo alla sua passerella, con una barca a vela sul lago. Cartolina del 1909.',
      },
      // notreHistoire.ch gives May 1909; the photograph itself is from that date or earlier.
      date: { value: '1909', precision: 'circa' },
      creator: 'Perrochet-Matile, Lausanne',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81d3bmtbvmjsvvcnkjz37sv' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'Yannik Plomb',
        credit: 'Yannik Plomb',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-26',
        notes:
          'Licence read on the notreHistoire.ch page (published by Yannik Plomb). Non-commercial (NC): no advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped, only resized.',
      },
      image: { src: '/images/photos/debarcadere-1909.webp', width: 1600, height: 1029 },
    },
    now: null,
  },
  {
    id: 'vue-college-couvaloup',
    title: {
      fr: 'Le collège de Couvaloup',
      en: 'The Couvaloup school',
      de: 'Das Collège de Couvaloup',
      it: 'Il collegio di Couvaloup',
    },
    location: {
      fr: 'Collège de Couvaloup',
      en: 'Collège de Couvaloup',
      de: 'Collège de Couvaloup',
      it: 'Collège de Couvaloup',
    },
    coordinates: { lat: 46.510494418457206, lng: 6.498732714088409 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 26.10.2026' }],
      note: 'Spot where the photographer stood, facing the school.',
    },
    then: {
      id: 'college-couvaloup-1904',
      title: {
        fr: 'Morges, le collège de Couvaloup, carte postale de 1904',
        en: 'Morges, the Couvaloup school, postcard from 1904',
        de: 'Morges, das Collège de Couvaloup, Postkarte von 1904',
        it: 'Morges, il collegio di Couvaloup, cartolina del 1904',
      },
      caption: {
        fr: 'Le collège, reconstruit et agrandi en 1882, date inscrite sous l’horloge. Carte postale envoyée le 12 avril 1904.',
        en: 'The school, rebuilt and enlarged in 1882, the date carved below the clock. Postcard sent on 12 April 1904.',
        de: 'Das Schulhaus, 1882 neu gebaut und vergrössert, das Jahr steht unter der Uhr. Postkarte, am 12. April 1904 verschickt.',
        it: 'Il collegio, ricostruito e ampliato nel 1882, data incisa sotto l’orologio. Cartolina spedita il 12 aprile 1904.',
      },
      // The card was posted on 12 April 1904; the photograph itself is from then or earlier.
      date: { value: '1904', precision: 'circa' },
      creator: 'E. Staub, éditeur',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81d08pw81fg9gsqf0sdzr4q' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'Philippe Chappuis (collection personnelle)',
        credit: 'Collection Philippe Chappuis',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-26',
        notes:
          'Licence read on the notreHistoire.ch page; author unknown there, publisher E. Staub printed on the card. Non-commercial (NC): no advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped, only resized.',
      },
      image: { src: '/images/photos/college-couvaloup-1904.webp', width: 1600, height: 999 },
    },
    now: null,
  },
  {
    id: 'vue-aerienne-parc-des-sports',
    title: {
      fr: 'Morges vue d’avion en 1963',
      en: 'Morges from the air in 1963',
      de: 'Morges aus der Luft, 1963',
      it: 'Morges vista dall’aereo nel 1963',
    },
    location: {
      fr: 'Parc des Sports et port du Petit-Bois, vus d’avion',
      en: 'Parc des Sports and Petit-Bois harbour, from the air',
      de: 'Parc des Sports und Hafen Petit-Bois, aus der Luft',
      it: 'Parc des Sports e porto del Petit-Bois, dall’aereo',
    },
    coordinates: { lat: 46.50501703649422, lng: 6.4937981121528106 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point placé sur la carte le 27.10.2026, au centre de la zone photographiée' }],
      note: 'Aerial view: the point marks the filled-in ground at the centre of the photo, not where the aircraft was.',
    },
    placeId: 'piscine-du-parc',
    then: {
      id: 'morges-aerien-1963',
      title: {
        fr: 'Morges vue d’avion, 1963 : les remblais du Parc des Sports',
        en: 'Morges from the air, 1963: the filled-in ground of the Parc des Sports',
        de: 'Morges aus der Luft, 1963: die Aufschüttung für den Parc des Sports',
        it: 'Morges dall’aereo, 1963: i terreni di riporto del Parc des Sports',
      },
      caption: {
        fr: 'Vue aérienne de 1963 : le terrain gagné sur le lac par remblayage pour agrandir le Parc des Sports, près du port du Petit-Bois. L’autoroute Lausanne–Genève est en construction. Ce terrain accueillera notamment une piscine, des terrains de sport, un camping et une plage.',
        en: 'Aerial view from 1963: the ground reclaimed from the lake by filling to extend the Parc des Sports, near the Petit-Bois harbour. The Lausanne–Geneva motorway is under construction. This ground will later hold a swimming pool, sports grounds, a campsite and a beach, among other things.',
        de: 'Luftaufnahme von 1963: das durch Aufschüttung dem See abgewonnene Land zur Erweiterung des Parc des Sports, beim Hafen Petit-Bois. Die Autobahn Lausanne–Genf ist im Bau. Auf diesem Gelände entstehen später unter anderem ein Schwimmbad, Sportplätze, ein Campingplatz und ein Strand.',
        it: 'Veduta aerea del 1963: il terreno sottratto al lago con un riempimento per ampliare il Parc des Sports, vicino al porto del Petit-Bois. L’autostrada Losanna–Ginevra è in costruzione. Questo terreno accoglierà fra l’altro una piscina, campi sportivi, un campeggio e una spiaggia.',
      },
      date: { value: '1963', precision: 'year' },
      creator: 'Comet Photo AG, Zürich',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81cy84q969bmaw5whx14ksw' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'ETH-Bibliothek Zürich, Bildarchiv',
        credit: 'ETH-Bibliothek Zürich, Bildarchiv',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-27',
        notes:
          'notreHistoire.ch gives CC BY-NC-ND and names the ETH-Bibliothek Bildarchiv with a Public Domain Mark as rights holder; the stricter licence is followed (shown whole, only resized, no advertising on this page).',
      },
      image: { src: '/images/photos/morges-aerien-1963.webp', width: 960, height: 728 },
    },
    now: null,
  },
];

/** Photos of a viewpoint that may be shown ({ then, now }, each null when missing or not yet cleared). */
export function shownPhotos(vp) {
  const ok = (photo) => (photo && publishablePhotos([photo], { requirePlace: false }).length ? photo : null);
  return { then: ok(vp.then), now: ok(vp.now) };
}

/** Viewpoints with at least one photo that may be shown. */
export function publishedViewpoints(list = VIEWPOINTS) {
  return list.filter((vp) => {
    const { then, now } = shownPhotos(vp);
    return then || now;
  });
}

export function getViewpoint(id, list = VIEWPOINTS) {
  return list.find((vp) => vp.id === id);
}

export function validateViewpoint(vp) {
  const p = `viewpoint(${vp && vp.id})`;
  const errors = [];
  if (!vp || !/^vue-[a-z0-9-]+$/.test(vp.id || '')) errors.push(`${p}.id must look like "vue-grand-rue-est"`);
  errors.push(...validateText(vp && vp.title, `${p}.title`, { allLanguages: true }));
  errors.push(...validateText(vp && vp.location, `${p}.location`, { allLanguages: true }));
  const c = vp && vp.coordinates;
  if (!c || !(c.lat > 46.49 && c.lat < 46.53 && c.lng > 6.46 && c.lng < 6.53)) errors.push(`${p}.coordinates must be in Morges`);
  errors.push(...validateSources(vp && vp.geo && vp.geo.sources, `${p}.geo.sources`));
  if (!vp || (!vp.then && !vp.now)) errors.push(`${p} needs a "then" or a "now" photo`);
  for (const role of ['then', 'now']) {
    if (vp && vp[role]) errors.push(...validateArchivePhoto(vp[role], { requirePlace: false }).map((err) => `${p}.${role}: ${err}`));
  }
  return errors;
}
