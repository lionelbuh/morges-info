/**
 * Advent calendar 2026 (/calendrier-avent/): one door a day from 1 to 24 December, each opening on
 * something already published and verified on the site (an old photo, a place, a story, a business,
 * the Christmas market). Only the short hook of each door is written here; titles, texts, photos and
 * credits come from the site's data, so they stay in step with it and with its sources.
 *
 * kind: open | event | photo | place | story | business | discover | christmas
 * ref:  the id of the event, viewpoint, place, story, business or Découvrir theme
 */
import { getPlace } from './places.js';
import { getViewpoint, shownPhotos } from './viewpoints.js';
import { STORIES } from './stories.js';
import { editorialSelection } from './businesses.js';
import { EVENTS } from './events.js';
import { DISCOVER_THEMES } from './discover.js';

export const ADVENT_YEAR = 2026;

/** The home page announces the calendar from this day, and until Christmas. */
export const ADVENT_TEASER_FROM = `${ADVENT_YEAR}-11-25`;
export const ADVENT_LAST = `${ADVENT_YEAR}-12-24`;

export const ADVENT_DOORS = [
  {
    day: 1,
    kind: 'open',
    hook: {
      fr: 'Coucou, c’est Gaston ! Jusqu’à Noël, une case s’ouvre chaque jour : photos d’autrefois, lieux, histoires et bonnes adresses de Morges.',
      en: 'Hello, it’s Gaston! Until Christmas, a door opens every day: old photos, places, stories and good addresses in Morges.',
      de: 'Hallo, hier ist Gaston! Bis Weihnachten öffnet sich jeden Tag ein Türchen: alte Fotos, Orte, Geschichten und gute Adressen in Morges.',
      it: 'Ciao, sono Gaston! Fino a Natale si apre una casella al giorno: foto d’epoca, luoghi, storie e buoni indirizzi di Morges.',
    },
  },
  {
    day: 2,
    kind: 'event',
    ref: 'marche-de-noel-2026',
    hook: {
      fr: 'C’est parti : le Marché de Noël ouvre aujourd’hui autour du Château !',
      en: 'Here we go: the Christmas Market opens today around the Castle!',
      de: 'Es geht los: Heute öffnet der Weihnachtsmarkt rund um das Schloss!',
      it: 'Si comincia: oggi apre il Mercatino di Natale intorno al Castello!',
    },
  },
  {
    day: 3,
    kind: 'photo',
    ref: 'vue-port-jetee',
    hook: {
      fr: 'Une carte de vœux de 1898 : déjà, on se souhaitait une bonne année depuis Morges.',
      en: 'A greetings card from 1898: people were already sending New Year wishes from Morges.',
      de: 'Eine Glückwunschkarte von 1898: Schon damals schickte man Neujahrsgrüsse aus Morges.',
      it: 'Una cartolina d’auguri del 1898: già allora si mandavano gli auguri di buon anno da Morges.',
    },
  },
  {
    day: 4,
    kind: 'place',
    ref: 'chateau',
    hook: {
      fr: 'Le saviez-vous ? Le château veille sur le lac depuis plus de 700 ans.',
      en: 'Did you know? The castle has watched over the lake for more than 700 years.',
      de: 'Schon gewusst? Das Schloss wacht seit über 700 Jahren über den See.',
      it: 'Lo sapevate? Il castello veglia sul lago da più di 700 anni.',
    },
  },
  {
    day: 5,
    kind: 'business',
    ref: 'lykke',
    hook: {
      fr: 'Une pause au chaud ? Direction le lykke.',
      en: 'Time to warm up? Head for the lykke.',
      de: 'Lust auf eine warme Pause? Ab ins lykke.',
      it: 'Una pausa al caldo? Si va al lykke.',
    },
  },
  {
    day: 6,
    kind: 'photo',
    ref: 'vue-parc-independance-kiosque',
    hook: {
      fr: 'Vers 1902, la musique se jouait au kiosque du parc de l’Indépendance.',
      en: 'Around 1902, music was played at the bandstand of the Parc de l’Indépendance.',
      de: 'Um 1902 spielte die Musik im Pavillon des Parc de l’Indépendance.',
      it: 'Intorno al 1902 la musica si suonava al chiosco del parco dell’Indépendance.',
    },
  },
  {
    day: 7,
    kind: 'story',
    ref: 'stravinsky-morges',
    hook: {
      fr: 'Un grand compositeur a vécu cinq ans à Morges. Devinez qui !',
      en: 'A great composer lived in Morges for five years. Guess who!',
      de: 'Ein grosser Komponist lebte fünf Jahre in Morges. Raten Sie, wer!',
      it: 'Un grande compositore ha vissuto cinque anni a Morges. Indovinate chi!',
    },
  },
  {
    day: 8,
    kind: 'place',
    ref: 'eglise-saint-francois-de-sales',
    hook: {
      fr: 'Une église néogothique au cœur de Morges, consacrée en 1844.',
      en: 'A Gothic Revival church in the heart of Morges, consecrated in 1844.',
      de: 'Eine neugotische Kirche im Herzen von Morges, 1844 geweiht.',
      it: 'Una chiesa neogotica nel cuore di Morges, consacrata nel 1844.',
    },
  },
  {
    day: 9,
    kind: 'place',
    ref: 'quai-lochmann',
    hook: {
      fr: 'Une balade d’hiver au bord du lac… et qui était donc Lochmann ?',
      en: 'A winter walk by the lake… and who was Lochmann, anyway?',
      de: 'Ein Winterspaziergang am See… und wer war eigentlich Lochmann?',
      it: 'Una passeggiata invernale in riva al lago… e chi era Lochmann?',
    },
  },
  {
    day: 10,
    kind: 'business',
    ref: 'chez-loubna',
    hook: {
      fr: 'Une douceur pour la saison : les pâtisseries de Chez Loubna.',
      en: 'A sweet treat for the season: the pastries at Chez Loubna.',
      de: 'Etwas Süsses für die Jahreszeit: das Gebäck von Chez Loubna.',
      it: 'Una dolcezza di stagione: i dolci di Chez Loubna.',
    },
  },
  {
    day: 11,
    kind: 'photo',
    ref: 'vue-rue-des-charpentiers',
    hook: {
      fr: 'La rue des Charpentiers vers 1935 : la reconnaissez-vous ?',
      en: 'Rue des Charpentiers around 1935: do you recognise it?',
      de: 'Die Rue des Charpentiers um 1935: Erkennen Sie sie?',
      it: 'Rue des Charpentiers intorno al 1935: la riconoscete?',
    },
  },
  {
    day: 12,
    kind: 'place',
    ref: 'musee-paderewski',
    hook: {
      fr: 'Pianiste célèbre et Premier ministre de Pologne… il a vécu à Morges !',
      en: 'A famous pianist and Prime Minister of Poland… he lived in Morges!',
      de: 'Berühmter Pianist und Ministerpräsident Polens… er lebte in Morges!',
      it: 'Pianista celebre e primo ministro della Polonia… ha vissuto a Morges!',
    },
  },
  {
    day: 13,
    kind: 'place',
    ref: 'patinoire-eaux-minerales',
    hook: {
      fr: 'Sortie en famille : on chausse les patins !',
      en: 'Family outing: lace up your skates!',
      de: 'Familienausflug: Schlittschuhe an!',
      it: 'Uscita in famiglia: si mettono i pattini!',
    },
  },
  {
    day: 14,
    kind: 'photo',
    ref: 'vue-casino',
    hook: {
      fr: 'Le Casino de Morges vers 1930, un air d’autrefois.',
      en: 'The Casino of Morges around 1930, a breath of times past.',
      de: 'Das Casino von Morges um 1930, ein Hauch vergangener Zeiten.',
      it: 'Il Casino di Morges intorno al 1930, un’aria d’altri tempi.',
    },
  },
  {
    day: 15,
    kind: 'story',
    ref: 'port-bernois',
    hook: {
      fr: 'Pourquoi Berne, si loin du Léman, a-t-elle construit un port à Morges ?',
      en: 'Why did Bern, so far from Lake Geneva, build a harbour in Morges?',
      de: 'Warum baute Bern, so weit vom Genfersee entfernt, einen Hafen in Morges?',
      it: 'Perché Berna, così lontana dal Lemano, costruì un porto a Morges?',
    },
  },
  {
    day: 16,
    kind: 'business',
    ref: 'luckycats',
    hook: {
      fr: 'Et pour nos amis à quatre pattes ? Luckycats.',
      en: 'And for our four-legged friends? Luckycats.',
      de: 'Und für unsere vierbeinigen Freunde? Luckycats.',
      it: 'E per i nostri amici a quattro zampe? Luckycats.',
    },
  },
  {
    day: 17,
    kind: 'photo',
    ref: 'vue-college-couvaloup',
    hook: {
      fr: 'Le collège de Couvaloup, hier et aujourd’hui : environ 120 ans d’écart !',
      en: 'The Collège de Couvaloup, then and now: some 120 years apart!',
      de: 'Das Collège de Couvaloup, damals und heute: rund 120 Jahre dazwischen!',
      it: 'Il collegio di Couvaloup, ieri e oggi: circa 120 anni di distanza!',
    },
  },
  {
    day: 18,
    kind: 'place',
    ref: 'temple',
    hook: {
      fr: 'Le temple, œuvre d’un architecte lyonnais du XVIIIe siècle.',
      en: 'The church, the work of an 18th-century architect from Lyon.',
      de: 'Die reformierte Kirche, Werk eines Lyoner Architekten aus dem 18. Jahrhundert.',
      it: 'Il tempio, opera di un architetto lionese del Settecento.',
    },
  },
  {
    day: 19,
    kind: 'photo',
    ref: 'vue-debarcadere',
    hook: {
      fr: 'Le débarcadère vers 1909… et les bateaux naviguent aussi en hiver.',
      en: 'The landing stage around 1909… and boats sail in winter too.',
      de: 'Die Schiffsanlegestelle um 1909… und die Schiffe fahren auch im Winter.',
      it: 'Il pontile intorno al 1909… e i battelli navigano anche d’inverno.',
    },
  },
  {
    day: 20,
    kind: 'event',
    ref: 'marche-de-noel-2026',
    hook: {
      fr: 'Dernier jour du Marché de Noël : c’est le moment d’y faire un tour !',
      en: 'Last day of the Christmas Market: time to pay it a visit!',
      de: 'Letzter Tag des Weihnachtsmarkts: Jetzt noch vorbeischauen!',
      it: 'Ultimo giorno del Mercatino di Natale: è il momento di farci un giro!',
    },
  },
  {
    day: 21,
    kind: 'business',
    ref: 'amandine-reflexologie',
    hook: {
      fr: 'Un moment de calme avant les fêtes : Amandine Réflexologie.',
      en: 'A calm moment before the holidays: Amandine Réflexologie.',
      de: 'Ein ruhiger Moment vor den Festtagen: Amandine Réflexologie.',
      it: 'Un momento di calma prima delle feste: Amandine Réflexologie.',
    },
  },
  {
    day: 22,
    kind: 'photo',
    ref: 'vue-aerienne-parc-des-sports',
    hook: {
      fr: 'Morges vue du ciel en 1963 : comme le père Noël la voyait !',
      en: 'Morges from the sky in 1963: as Father Christmas saw it!',
      de: 'Morges von oben, 1963: so wie der Weihnachtsmann es sah!',
      it: 'Morges dal cielo nel 1963: come la vedeva Babbo Natale!',
    },
  },
  {
    day: 23,
    kind: 'place',
    ref: 'hotel-de-ville',
    hook: {
      fr: 'Un hôtel de ville de plus de 400 ans, trésor d’importance nationale.',
      en: 'A town hall more than 400 years old, a treasure of national importance.',
      de: 'Ein über 400 Jahre altes Rathaus, ein Kulturgut von nationaler Bedeutung.',
      it: 'Un municipio di oltre 400 anni, un bene culturale d’importanza nazionale.',
    },
  },
  {
    day: 24,
    kind: 'christmas',
    ref: 'beaux-endroits',
    hook: {
      fr: 'Joyeux Noël de la part de Gaston et de Morges.info ! Pour les fêtes, une balade vers les plus beaux endroits de Morges.',
      en: 'Merry Christmas from Gaston and Morges.info! For the holidays, a walk to the most beautiful spots in Morges.',
      de: 'Frohe Weihnachten von Gaston und Morges.info! Für die Festtage ein Spaziergang zu den schönsten Orten von Morges.',
      it: 'Buon Natale da Gaston e da Morges.info! Per le feste, una passeggiata verso i luoghi più belli di Morges.',
    },
  },
];

/** The order of the doors on the page, mixed as on a real Advent calendar (always the same). */
export const ADVENT_GRID = [13, 4, 21, 9, 17, 1, 24, 7, 15, 2, 19, 11, 6, 22, 3, 16, 10, 23, 5, 14, 20, 8, 18, 12];

export const adventDate = (day) => `${ADVENT_YEAR}-12-${String(day).padStart(2, '0')}`;

/** Whether a door may be opened on `today` (YYYY-MM-DD, in Morges). */
export const isOpenable = (day, today) => today >= adventDate(day);

/** The site's item a door points to (throws if it no longer exists, so the build catches it). */
export function adventTarget(door) {
  switch (door.kind) {
    case 'open':
      return null;
    case 'event': {
      const ev = EVENTS.find((x) => x.id === door.ref);
      if (!ev) throw new Error(`Advent ${door.day}: unknown event ${door.ref}`);
      return ev;
    }
    case 'photo': {
      const vp = getViewpoint(door.ref);
      if (!vp || !shownPhotos(vp).then) throw new Error(`Advent ${door.day}: no published photo for ${door.ref}`);
      return vp;
    }
    case 'place': {
      const place = getPlace(door.ref);
      if (!place) throw new Error(`Advent ${door.day}: unknown place ${door.ref}`);
      return place;
    }
    case 'story': {
      const story = STORIES.find((s) => s.id === door.ref);
      if (!story) throw new Error(`Advent ${door.day}: unknown story ${door.ref}`);
      return story;
    }
    case 'business': {
      const b = editorialSelection().find((x) => x.id === door.ref);
      if (!b) throw new Error(`Advent ${door.day}: unknown business ${door.ref}`);
      return b;
    }
    case 'christmas':
    case 'discover': {
      const theme = DISCOVER_THEMES.find((x) => x.id === door.ref);
      if (!theme) throw new Error(`Advent ${door.day}: unknown theme ${door.ref}`);
      return theme;
    }
    default:
      throw new Error(`Advent ${door.day}: unknown kind ${door.kind}`);
  }
}
