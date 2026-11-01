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
 * @property {import('./archive.js').ArchivePhoto[]=} moreThen  other old photos taken from the same spot
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
    now: {
      id: 'debarcadere-aujourdhui',
      title: {
        fr: 'Morges, le débarcadère aujourd’hui',
        en: 'Morges, the landing stage today',
        de: 'Morges, die Schiffsanlegestelle heute',
        it: 'Morges, l’imbarcadero oggi',
      },
      caption: {
        fr: 'La passerelle du débarcadère aujourd’hui, ses lampadaires bleus décorés de cœurs, face au lac.',
        en: 'The landing-stage footbridge today, its blue lamp posts decorated with hearts, facing the lake.',
        de: 'Der Steg der Anlegestelle heute, die blauen Laternen mit Herzen geschmückt, mit Blick auf den See.',
        it: 'La passerella dell’imbarcadero oggi, con i lampioni blu decorati di cuori, di fronte al lago.',
      },
      date: {
        value: '2026',
        precision: 'circa',
        display: { fr: 'aujourd’hui', en: 'today', de: 'heute', it: 'oggi' },
      },
      source: { institution: 'Morges.info' },
      rights: {
        status: 'granted',
        credit: 'Cat Arlt',
        evidence: 'Photo and credit sent to the site owner (29.10.2026)',
      },
      verification: { status: 'verified', verifiedBy: 'Morges.info', verifiedAt: '2026-10-29' },
      image: { src: '/images/photos/debarcadere-aujourdhui.webp', width: 1080, height: 618 },
    },
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
  {
    id: 'vue-port-bateau-vapeur',
    title: {
      fr: 'L’entrée du port, avec un bateau à vapeur',
      en: 'The harbour entrance, with a steamer',
      de: 'Die Hafeneinfahrt mit einem Dampfschiff',
      it: 'L’ingresso del porto, con un battello a vapore',
    },
    location: {
      fr: 'Port de Morges',
      en: 'Morges harbour',
      de: 'Hafen von Morges',
      it: 'Porto di Morges',
    },
    coordinates: { lat: 46.506420412881084, lng: 6.499317388921136 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 27.10.2026' }],
      note: 'Spot where the photographer stood in the harbour, facing the entrance and the Alps.',
    },
    placeId: 'port',
    then: {
      id: 'port-vapeur-1930s',
      title: {
        fr: 'Morges, l’entrée du port et un bateau à vapeur, années 1930',
        en: 'Morges, the harbour entrance and a steamer, 1930s',
        de: 'Morges, die Hafeneinfahrt und ein Dampfschiff, 1930er-Jahre',
        it: 'Morges, l’ingresso del porto e un battello a vapore, anni Trenta',
      },
      caption: {
        fr: 'Les jetées du port et leurs tourelles, avec un bateau à vapeur sur le lac et les Alpes au loin.',
        en: 'The harbour piers and their turrets, with a steamer on the lake and the Alps in the distance.',
        de: 'Die Hafenmolen mit ihren Türmchen, ein Dampfschiff auf dem See und in der Ferne die Alpen.',
        it: 'I moli del porto con le loro torrette, un battello a vapore sul lago e le Alpi in lontananza.',
      },
      date: { value: '1930', precision: 'decade' },
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81c7hgpdc2mjq9kcpb7wpas' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'Georges Savary',
        credit: 'Georges Savary',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-27',
        notes:
          'Licence read on the notreHistoire.ch page (published by Georges Savary, period 1930–1939, no author given). Non-commercial (NC): no advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped.',
      },
      image: { src: '/images/photos/port-vapeur-1930s.webp', width: 960, height: 656 },
    },
    now: null,
  },
  {
    id: 'vue-promenades',
    title: {
      fr: 'Les Promenades',
      en: 'Les Promenades',
      de: 'Les Promenades',
      it: 'Les Promenades',
    },
    location: {
      fr: 'Place Dufour, ancienne place des Promenades',
      en: 'Place Dufour, formerly Place des Promenades',
      de: 'Place Dufour, früher Place des Promenades',
      it: 'Place Dufour, un tempo Place des Promenades',
    },
    coordinates: { lat: 46.5074748288215, lng: 6.496080121759667 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 27.10.2026' }],
      note: 'Spot where the photographers stood; both postcards were taken from the square.',
    },
    placeId: 'parc-independance',
    then: {
      id: 'promenades-staub-1904',
      title: {
        fr: 'Morges, les Promenades, carte postale de 1904',
        en: 'Morges, Les Promenades, postcard from 1904',
        de: 'Morges, Les Promenades, Postkarte von 1904',
        it: 'Morges, Les Promenades, cartolina del 1904',
      },
      caption: {
        fr: 'L’allée de marronniers des Promenades, devant les maisons de maître, en direction du parc de l’Indépendance. Carte postale envoyée en 1904.',
        en: 'The chestnut avenue of Les Promenades, in front of the mansions, towards the Parc de l’Indépendance. Postcard sent in 1904.',
        de: 'Die Kastanienallee der Promenades vor den Herrenhäusern, in Richtung Parc de l’Indépendance. Postkarte, 1904 verschickt.',
        it: 'Il viale di castagni delle Promenades, davanti alle case padronali, verso il Parc de l’Indépendance. Cartolina spedita nel 1904.',
      },
      // The card was posted in 1904; the photograph itself is from then or earlier.
      date: { value: '1904', precision: 'circa' },
      creator: 'E. Staub, éditeur, Morges',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81cz7wdrqrhs3f8ss3z5mnf' },
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
        verifiedAt: '2026-10-27',
        notes:
          'Licence read on the notreHistoire.ch page (Les Promenades). Non-commercial (NC): no advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped.',
      },
      image: { src: '/images/photos/promenades-staub-1904.webp', width: 960, height: 631 },
    },
    moreThen: [
      {
        id: 'place-des-promenades',
        title: {
          fr: 'Morges, la place des Promenades, carte postale',
          en: 'Morges, Place des Promenades, postcard',
          de: 'Morges, Place des Promenades, Postkarte',
          it: 'Morges, Place des Promenades, cartolina',
        },
        caption: {
          fr: 'Enfants sur la place des Promenades, aussi appelée place du Manège, aménagée sur l’ancien « Pré du Château ».',
          en: 'Children on the Place des Promenades, also called Place du Manège, laid out on the former “Pré du Château”.',
          de: 'Kinder auf der Place des Promenades, auch Place du Manège genannt, angelegt auf dem einstigen «Pré du Château».',
          it: 'Bambini sulla Place des Promenades, detta anche Place du Manège, sistemata sull’antico «Pré du Château».',
        },
        // No date on the card; published with the 1904 card, from the same years.
        date: { value: '1900', precision: 'circa' },
        source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81cz7wdrqrhs3f8ss3z5mnf' },
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
          verifiedAt: '2026-10-27',
          notes:
            'Licence read on the notreHistoire.ch page (Les Promenades). Non-commercial (NC): no advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped.',
        },
        image: { src: '/images/photos/place-des-promenades.webp', width: 960, height: 606 },
      },
    ],
    now: null,
  },
  {
    id: 'vue-casino',
    title: {
      fr: 'Le Casino de Morges',
      en: 'The Morges Casino',
      de: 'Das Casino von Morges',
      it: 'Il Casinò di Morges',
    },
    location: {
      fr: 'Casino de Morges',
      en: 'Morges Casino',
      de: 'Casino von Morges',
      it: 'Casinò di Morges',
    },
    coordinates: { lat: 46.50878188477087, lng: 6.499710007938375 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 01.11.2026' }],
      note: 'Spot facing the Casino building, as indicated by the site owner.',
    },
    then: {
      id: 'casino-morges-1930',
      title: {
        fr: 'Le Casino de Morges vers 1930',
        en: 'The Morges Casino around 1930',
        de: 'Das Casino von Morges um 1930',
        it: 'Il Casinò di Morges verso il 1930',
      },
      caption: {
        fr: 'Photo d’album, légendée à la main « Casino à Morges » : la façade richement décorée, ses balcons en fer forgé et ses statues sur le toit.',
        en: 'An album photo, captioned by hand “Casino à Morges”: the richly decorated façade, its wrought-iron balconies and the statues on the roof.',
        de: 'Ein Albumfoto, von Hand beschriftet «Casino à Morges»: die reich verzierte Fassade, die schmiedeeisernen Balkone und die Statuen auf dem Dach.',
        it: 'Una foto d’album, con la didascalia a mano «Casino à Morges»: la facciata riccamente decorata, i balconi in ferro battuto e le statue sul tetto.',
      },
      date: { value: '1930', precision: 'circa' },
      source: { institution: 'Wikimedia Commons (Flickr, Peter Forster)', url: 'https://commons.wikimedia.org/w/index.php?curid=15769572' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-SA 2.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/deed.fr',
        holder: 'Peter Forster',
        credit: 'Peter Forster',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-11-01',
        notes:
          'Attribution as given on Wikimedia Commons ("By Peter Forster - Flickr: 114 Casinò à Morges 1930, CC BY-SA 2.0"), supplied by the site owner. Date from the album caption ("um 1930"). Share-alike: any adaptation stays under CC BY-SA.',
      },
      image: { src: '/images/photos/casino-morges-1930.webp', width: 579, height: 472 },
    },
    now: null,
  },
  {
    id: 'vue-maison-blanchenay',
    title: {
      fr: 'La cour de la maison Blanchenay, aujourd’hui le Musée Forel',
      en: 'The courtyard of the Maison Blanchenay, today the Musée Forel',
      de: 'Der Hof des Hauses Blanchenay, heute das Musée Forel',
      it: 'Il cortile della casa Blanchenay, oggi il Musée Forel',
    },
    location: {
      fr: 'Grand-Rue 54, Musée Alexis Forel',
      en: 'Grand-Rue 54, Musée Alexis Forel',
      de: 'Grand-Rue 54, Musée Alexis Forel',
      it: 'Grand-Rue 54, Musée Alexis Forel',
    },
    coordinates: { lat: 46.509444, lng: 6.498056 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point placé sur la carte le 01.11.2026 (46°30′34″ N, 6°29′53″ E)' }],
      note: 'The inner courtyard of the house; the photographer stood in the courtyard.',
    },
    placeId: 'musee-forel',
    then: {
      id: 'maison-blanchenay-cour-1905',
      title: {
        fr: 'La cour intérieure de la « maison de la laiterie », photographiée par Max van Berchem',
        en: 'The inner courtyard of the “dairy house”, photographed by Max van Berchem',
        de: 'Der Innenhof des «Molkereihauses», fotografiert von Max van Berchem',
        it: 'Il cortile interno della «casa della latteria», fotografato da Max van Berchem',
      },
      caption: {
        fr: 'La maison Blanchenay, siège de la Société de laiterie de Morges depuis 1825 : les galeries à l’italienne de la cour, avec le linge qui sèche. Alexis et Emmeline Forel achètent la maison en 1918 pour y installer leur musée, qui prend le nom de Musée Alexis Forel en 1943. Les galeries existent toujours.',
        en: 'The Maison Blanchenay, home of the Morges dairy society since 1825: the Italian-style galleries of the courtyard, with washing hung out to dry. Alexis and Emmeline Forel bought the house in 1918 to set up their museum, named the Musée Alexis Forel in 1943. The galleries are still there.',
        de: 'Das Haus Blanchenay, seit 1825 Sitz der Molkereigesellschaft von Morges: die Galerien des Hofes im italienischen Stil, mit trocknender Wäsche. Alexis und Emmeline Forel kauften das Haus 1918, um darin ihr Museum einzurichten, das 1943 den Namen Musée Alexis Forel erhielt. Die Galerien sind bis heute erhalten.',
        it: 'La casa Blanchenay, sede della Società di latteria di Morges dal 1825: le gallerie all’italiana del cortile, con il bucato steso ad asciugare. Alexis ed Emmeline Forel acquistarono la casa nel 1918 per allestirvi il loro museo, che nel 1943 prese il nome di Musée Alexis Forel. Le gallerie esistono ancora.',
      },
      date: { value: '1905', precision: 'circa' },
      source: { institution: 'Bibliothèque nationale suisse, collection Max van Berchem (via Wikimedia Commons)', url: 'https://commons.wikimedia.org/w/index.php?curid=46388586' },
      rights: {
        status: 'public-domain',
        licence: 'Public domain',
        credit: 'Max van Berchem',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-11-01',
        notes:
          'Public domain on Wikimedia Commons (Max van Berchem, 1863–1921; Swiss National Library, helveticarchives.ch ID 838612), supplied by the site owner. History: Musée Alexis Forel (museeforel.ch, 1825 dairy society), French Wikipedia (Maison Blanchenay; 1918 purchase, 1943 name), Journal de Morges (galleries still standing). Opening year differs between sources (1919/1920), so it is not given.',
      },
      image: { src: '/images/photos/maison-blanchenay-cour-1905.webp', width: 1600, height: 2206 },
    },
    now: null,
  },
  {
    id: 'vue-gare',
    title: {
      fr: 'La gare de Morges',
      en: 'Morges station',
      de: 'Der Bahnhof Morges',
      it: 'La stazione di Morges',
    },
    location: {
      fr: 'Gare de Morges, place de la Gare',
      en: 'Morges station, Place de la Gare',
      de: 'Bahnhof Morges, Place de la Gare',
      it: 'Stazione di Morges, Place de la Gare',
    },
    coordinates: { lat: 46.511312567566044, lng: 6.4940086579443195 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point placé sur la carte le 01.11.2026' }],
      note: 'The station; the 1948 photos were taken from the station square.',
    },
    placeId: 'gare',
    then: {
        id: 'gare-1948-facade',
        title: {
          fr: 'Morges : le bâtiment aux voyageurs, vu depuis la place de la gare, octobre 1948',
          en: 'Morges: the station building, seen from the station square, October 1948',
          de: 'Morges: das Aufnahmegebäude, vom Bahnhofplatz aus gesehen, Oktober 1948',
          it: 'Morges: il fabbricato viaggiatori, visto dalla piazza della stazione, ottobre 1948',
        },
        caption: {
          fr: 'La façade de la gare et son grand escalier, avec une voiture garée devant.',
          en: 'The station façade and its wide staircase, with a car parked in front.',
          de: 'Die Fassade des Bahnhofs mit der breiten Treppe, davor ein parkiertes Auto.',
          it: 'La facciata della stazione con la sua ampia scalinata e un’automobile parcheggiata davanti.',
        },
        date: { value: '1948-10', precision: 'month' },
        source: { institution: 'SBB Historic', url: 'https://www.sbbarchiv.ch/detail.aspx?id=354969' },
        rights: {
          status: 'public-domain',
          licence: 'Domaine public (droit d’auteur échu)',
          credit: 'SBB Historic',
        },
        verification: {
          status: 'verified',
          verifiedBy: 'Morges.info',
          verifiedAt: '2026-11-01',
          notes:
            'Photo by the SBB photo service, SBB Historic archive (record 354969). Swiss copyright has expired: unknown author, created 1948 (LDA art. 31: 70 years; art. 29 al. 2 let. a bis: 50 years for photos without individual character). SBB Historic also publishes its historic railway-station photos as open data with source attribution (opendata.swiss, 2018). Credit: SBB Historic. Record pages could not be opened from the build environment; images and record details supplied by the site owner.',
        },
        image: { src: '/images/photos/gare-1948-facade.webp', width: 520, height: 373 },
      },
    moreThen: [
      {
        id: 'gare-1948-voitures',
        title: {
          fr: 'La place de la gare et ses voitures, octobre 1948',
          en: 'The station square and its cars, October 1948',
          de: 'Der Bahnhofplatz mit seinen Autos, Oktober 1948',
          it: 'La piazza della stazione e le sue automobili, ottobre 1948',
        },
        caption: {
          fr: 'La gare vue en biais, avec les voitures de l’époque garées sur la place.',
          en: 'The station seen at an angle, with cars of the time parked on the square.',
          de: 'Der Bahnhof schräg von vorn, mit den Autos jener Zeit auf dem Platz.',
          it: 'La stazione vista di sbieco, con le automobili dell’epoca parcheggiate sulla piazza.',
        },
        date: { value: '1948-10', precision: 'month' },
        source: { institution: 'SBB Historic', url: 'https://www.sbbarchiv.ch/detail.aspx?id=354965' },
        rights: {
          status: 'public-domain',
          licence: 'Domaine public (droit d’auteur échu)',
          credit: 'SBB Historic',
        },
        verification: {
          status: 'verified',
          verifiedBy: 'Morges.info',
          verifiedAt: '2026-11-01',
          notes:
            'Photo by the SBB photo service, SBB Historic archive (record 354965). Swiss copyright has expired: unknown author, created 1948 (LDA art. 31: 70 years; art. 29 al. 2 let. a bis: 50 years for photos without individual character). SBB Historic also publishes its historic railway-station photos as open data with source attribution (opendata.swiss, 2018). Credit: SBB Historic. Record pages could not be opened from the build environment; images and record details supplied by the site owner.',
        },
        image: { src: '/images/photos/gare-1948-voitures.webp', width: 520, height: 376 },
      },
      {
        id: 'gare-1948-place',
        title: {
          fr: 'La gare et la rampe d’accès, octobre 1948',
          en: 'The station and its access ramp, October 1948',
          de: 'Der Bahnhof und die Zufahrtsrampe, Oktober 1948',
          it: 'La stazione e la rampa d’accesso, ottobre 1948',
        },
        caption: {
          fr: 'Vue de côté : la rampe qui monte vers les quais et un passant sur la place.',
          en: 'A side view: the ramp up to the platforms and a passer-by on the square.',
          de: 'Seitenansicht: die Rampe zu den Perrons und ein Passant auf dem Platz.',
          it: 'Vista laterale: la rampa che sale verso i binari e un passante sulla piazza.',
        },
        date: { value: '1948-10', precision: 'month' },
        source: { institution: 'SBB Historic', url: 'https://www.sbbarchiv.ch/detail.aspx?id=354966' },
        rights: {
          status: 'public-domain',
          licence: 'Domaine public (droit d’auteur échu)',
          credit: 'SBB Historic',
        },
        verification: {
          status: 'verified',
          verifiedBy: 'Morges.info',
          verifiedAt: '2026-11-01',
          notes:
            'Photo by the SBB photo service, SBB Historic archive (record 354966). Swiss copyright has expired: unknown author, created 1948 (LDA art. 31: 70 years; art. 29 al. 2 let. a bis: 50 years for photos without individual character). SBB Historic also publishes its historic railway-station photos as open data with source attribution (opendata.swiss, 2018). Credit: SBB Historic. Record pages could not be opened from the build environment; images and record details supplied by the site owner.',
        },
        image: { src: '/images/photos/gare-1948-place.webp', width: 520, height: 376 },
      },
      {
        id: 'gare-buffet-salle-a',
        title: {
          fr: 'Le buffet de la gare, l’une des salles, vers 1950',
          en: 'The station buffet, one of the rooms, around 1950',
          de: 'Das Bahnhofbuffet, einer der Säle, um 1950',
          it: 'Il buffet della stazione, una delle sale, verso il 1950',
        },
        caption: {
          fr: 'Une salle du buffet de la gare, avec ses chaises de bistrot et ses grandes fenêtres.',
          en: 'A room of the station buffet, with its bistro chairs and tall windows.',
          de: 'Ein Saal des Bahnhofbuffets mit Bistrostühlen und hohen Fenstern.',
          it: 'Una sala del buffet della stazione, con le sedie da bistrot e le grandi finestre.',
        },
        date: { value: '1950', precision: 'circa' },
        source: { institution: 'SBB Historic', url: 'https://www.sbbarchiv.ch/detail.aspx?id=354985' },
        rights: {
          status: 'public-domain',
          licence: 'Domaine public (droit d’auteur échu)',
          credit: 'SBB Historic',
        },
        verification: {
          status: 'verified',
          verifiedBy: 'Morges.info',
          verifiedAt: '2026-11-01',
          notes:
            'Photo by the SBB photo service, SBB Historic archive (record 354985). Swiss copyright has expired: unknown author, created 1950 (LDA art. 31: 70 years; art. 29 al. 2 let. a bis: 50 years for photos without individual character). SBB Historic also publishes its historic railway-station photos as open data with source attribution (opendata.swiss, 2018). Credit: SBB Historic. Record pages could not be opened from the build environment; images and record details supplied by the site owner.',
        },
        image: { src: '/images/photos/gare-buffet-salle-a.webp', width: 520, height: 374 },
      },
      {
        id: 'gare-buffet-salle-b',
        title: {
          fr: 'Le buffet de la gare, une autre salle, vers 1950',
          en: 'The station buffet, another room, around 1950',
          de: 'Das Bahnhofbuffet, ein weiterer Saal, um 1950',
          it: 'Il buffet della stazione, un’altra sala, verso il 1950',
        },
        caption: {
          fr: 'Une autre salle du buffet, avec le comptoir au fond et la liste des prix au mur.',
          en: 'Another room of the buffet, with the counter at the back and the price list on the wall.',
          de: 'Ein weiterer Saal des Buffets, hinten die Theke und an der Wand die Preisliste.',
          it: 'Un’altra sala del buffet, con il bancone in fondo e il listino prezzi alla parete.',
        },
        date: { value: '1950', precision: 'circa' },
        source: { institution: 'SBB Historic', url: 'https://www.sbbarchiv.ch/detail.aspx?id=354982' },
        rights: {
          status: 'public-domain',
          licence: 'Domaine public (droit d’auteur échu)',
          credit: 'SBB Historic',
        },
        verification: {
          status: 'verified',
          verifiedBy: 'Morges.info',
          verifiedAt: '2026-11-01',
          notes:
            'Photo by the SBB photo service, SBB Historic archive (record 354982). Swiss copyright has expired: unknown author, created 1950 (LDA art. 31: 70 years; art. 29 al. 2 let. a bis: 50 years for photos without individual character). SBB Historic also publishes its historic railway-station photos as open data with source attribution (opendata.swiss, 2018). Credit: SBB Historic. Record pages could not be opened from the build environment; images and record details supplied by the site owner.',
        },
        image: { src: '/images/photos/gare-buffet-salle-b.webp', width: 520, height: 373 },
      },
    ],
    now: null,
  },
];

/**
 * Photos of a viewpoint that may be shown: { then, now } (each null when missing or not yet cleared)
 * and moreThen, the other old photos from the same spot that may be shown.
 */
export function shownPhotos(vp) {
  const ok = (photo) => (photo && publishablePhotos([photo], { requirePlace: false }).length ? photo : null);
  return { then: ok(vp.then), now: ok(vp.now), moreThen: (vp.moreThen || []).map(ok).filter(Boolean) };
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
  if (vp && vp.moreThen !== undefined) {
    if (!Array.isArray(vp.moreThen) || !vp.then) errors.push(`${p}.moreThen must be a list, next to a "then" photo`);
    else vp.moreThen.forEach((photo, i) => errors.push(...validateArchivePhoto(photo, { requirePlace: false }).map((err) => `${p}.moreThen[${i}]: ${err}`)));
  }
  return errors;
}
