import { validateText } from './schema.js';

/**
 * "Découvrir Morges": the themes of the page, each with a photo already published on the site (with
 * its credit and licence) and links to the site's own pages (places, photos, map, local life).
 * To add content later, add a link to a theme, or a theme to the list.
 *
 * Photos are always shown whole, never cropped: some are CC BY-NC-ND (no modification).
 * `link`: { page } (a page id of the site, e.g. 'place:chateau', 'photo:vue-gare', 'map') and `label`.
 */
export const DISCOVER_THEMES = [
  {
    id: 'incontournables',
    title: { fr: 'Les incontournables', en: 'The must-sees', de: 'Das Wichtigste', it: 'Da non perdere' },
    text: {
      fr: 'Le château construit en 1286 par Louis de Savoie, le port aux deux jetées incurvées bâti à la fin du XVIIe siècle et la Grand-Rue, artère principale de la vieille ville : trois lieux pour une première visite.',
      en: 'The castle built in 1286 by Louis of Savoy, the harbour with its two curved jetties built at the end of the 17th century, and the Grand-Rue, the main street of the old town: three places for a first visit.',
      de: 'Das 1286 von Ludwig von Savoyen erbaute Schloss, der Ende des 17. Jahrhunderts angelegte Hafen mit seinen zwei geschwungenen Molen und die Grand-Rue, die Hauptstrasse der Altstadt: drei Orte für einen ersten Besuch.',
      it: 'Il castello costruito nel 1286 da Luigi di Savoia, il porto con i suoi due moli ricurvi costruito alla fine del Seicento e la Grand-Rue, via principale del centro storico: tre luoghi per una prima visita.',
    },
    photo: {
      src: '/images/hero/chateau-morges-aerien-jaquet-2016-wide-960.webp',
      width: 960,
      height: 480,
      alt: {
        fr: 'Vue aérienne du château de Morges et de ses quatre tours d’angle, avec le port et le lac Léman',
        en: 'Aerial view of Morges Castle and its four corner towers, with the harbour and Lake Geneva',
        de: 'Luftaufnahme des Schlosses Morges mit seinen vier Ecktürmen, dem Hafen und dem Genfersee',
        it: 'Veduta aerea del castello di Morges con le sue quattro torri angolari, il porto e il Lago Lemano',
      },
      credit: 'D. Jaquet, Archéodom 2016 (Wikimedia Commons), CC BY-SA 4.0, recadrée',
    },
    links: [
      { page: 'place:chateau', label: { fr: 'Le château', en: 'The castle', de: 'Das Schloss', it: 'Il castello' } },
      { page: 'place:port', label: { fr: 'Le port', en: 'The harbour', de: 'Der Hafen', it: 'Il porto' } },
      { page: 'place:grand-rue', label: { fr: 'La Grand-Rue', en: 'The Grand-Rue', de: 'Die Grand-Rue', it: 'La Grand-Rue' } },
    ],
  },
  {
    id: 'promenades',
    title: { fr: 'Promenades et balades', en: 'Walks and strolls', de: 'Spaziergänge', it: 'Passeggiate' },
    text: {
      fr: 'Au bord du Léman, les quais et les parcs se suivent : le quai Lochmann, construit entre 1884 et 1890, le parc de l’Indépendance, d’où l’on voit le lac et les Alpes, puis le parc de Vertou.',
      en: 'Along Lake Geneva, quays and parks follow one another: the Quai Lochmann, built between 1884 and 1890, the Parc de l’Indépendance, with its view of the lake and the Alps, then the Parc de Vertou.',
      de: 'Am Genfersee folgen Quais und Parks aufeinander: der zwischen 1884 und 1890 angelegte Quai Lochmann, der Parc de l’Indépendance mit Blick auf See und Alpen, dann der Parc de Vertou.',
      it: 'In riva al Lemano si susseguono lungolaghi e parchi: il Quai Lochmann, costruito tra il 1884 e il 1890, il Parc de l’Indépendance, con vista sul lago e sulle Alpi, poi il Parc de Vertou.',
    },
    photo: {
      src: '/images/photos/debarcadere-aujourdhui.webp',
      width: 1080,
      height: 618,
      alt: {
        fr: 'La passerelle du débarcadère, ses lampadaires bleus décorés de cœurs, face au lac',
        en: 'The landing-stage footbridge, its blue lamp posts decorated with hearts, facing the lake',
        de: 'Der Steg der Anlegestelle mit blauen, herzgeschmückten Laternen, mit Blick auf den See',
        it: 'La passerella dell’imbarcadero, con i lampioni blu decorati di cuori, di fronte al lago',
      },
      credit: 'Cat Arlt',
    },
    links: [
      { page: 'place:quai-lochmann', label: { fr: 'Le quai Lochmann', en: 'Quai Lochmann', de: 'Quai Lochmann', it: 'Quai Lochmann' } },
      { page: 'place:parc-independance', label: { fr: 'Le parc de l’Indépendance', en: 'Parc de l’Indépendance', de: 'Parc de l’Indépendance', it: 'Parc de l’Indépendance' } },
      { page: 'place:parc-vertou', label: { fr: 'Le parc de Vertou', en: 'Parc de Vertou', de: 'Parc de Vertou', it: 'Parc de Vertou' } },
    ],
  },
  {
    id: 'insolite',
    title: { fr: 'Morges insolite', en: 'Unusual Morges', de: 'Ungewöhnliches Morges', it: 'Morges insolita' },
    text: {
      fr: 'Une cour cachée derrière une façade de la Grand-Rue, une station-service des années 1960, une gare et son buffet d’après-guerre : la carte photo montre Morges d’hier, à comparer avec la ville d’aujourd’hui.',
      en: 'A courtyard hidden behind a façade on the Grand-Rue, a 1960s petrol station, a station and its post-war buffet: the photo map shows Morges as it was, to compare with the town today.',
      de: 'Ein versteckter Hof hinter einer Fassade an der Grand-Rue, eine Tankstelle aus den 1960er-Jahren, ein Bahnhof mit seinem Buffet aus der Nachkriegszeit: Die Fotokarte zeigt das Morges von gestern, zum Vergleich mit heute.',
      it: 'Un cortile nascosto dietro una facciata della Grand-Rue, un distributore degli anni Sessanta, una stazione e il suo buffet del dopoguerra: la mappa fotografica mostra la Morges di ieri, da confrontare con la città di oggi.',
    },
    photo: {
      src: '/images/photos/maison-blanchenay-cour-1905.webp',
      width: 1600,
      height: 2206,
      alt: {
        fr: 'La cour intérieure de la maison Blanchenay vers 1905, aujourd’hui le Musée Forel',
        en: 'The inner courtyard of the Maison Blanchenay around 1905, today the Musée Forel',
        de: 'Der Innenhof der Maison Blanchenay um 1905, heute das Musée Forel',
        it: 'Il cortile interno della casa Blanchenay verso il 1905, oggi il Musée Forel',
      },
      credit: 'Max van Berchem, vers 1905, domaine public',
    },
    links: [
      { page: 'photos', label: { fr: 'Morges hier et aujourd’hui', en: 'Morges then and now', de: 'Morges gestern und heute', it: 'Morges ieri e oggi' } },
      { page: 'photo:vue-maison-blanchenay', label: { fr: 'La cour de la maison Blanchenay', en: 'The Maison Blanchenay courtyard', de: 'Der Hof der Maison Blanchenay', it: 'Il cortile della casa Blanchenay' } },
      { page: 'photo:vue-gare', label: { fr: 'La gare en 1948', en: 'The station in 1948', de: 'Der Bahnhof 1948', it: 'La stazione nel 1948' } },
    ],
  },
  {
    id: 'culture',
    title: { fr: 'Culture et patrimoine', en: 'Culture and heritage', de: 'Kultur und Kulturerbe', it: 'Cultura e patrimonio' },
    text: {
      fr: 'Le Musée Alexis Forel et le Musée Bolle dans la vieille ville, le Musée Paderewski, la Maison du Dessin de Presse, le temple reconstruit entre 1769 et 1776 et, pour les spectacles, le Théâtre de Beausobre.',
      en: 'The Musée Alexis Forel and the Musée Bolle in the old town, the Paderewski Museum, the Maison du Dessin de Presse, the church rebuilt between 1769 and 1776 and, for shows, the Théâtre de Beausobre.',
      de: 'Das Musée Alexis Forel und das Musée Bolle in der Altstadt, das Paderewski-Museum, die Maison du Dessin de Presse, die zwischen 1769 und 1776 neu gebaute reformierte Kirche und, für Aufführungen, das Théâtre de Beausobre.',
      it: 'Il Musée Alexis Forel e il Musée Bolle nel centro storico, il Museo Paderewski, la Maison du Dessin de Presse, il tempio ricostruito tra il 1769 e il 1776 e, per gli spettacoli, il Théâtre de Beausobre.',
    },
    photo: {
      src: '/images/photos/college-couvaloup-aujourdhui.webp',
      width: 1500,
      height: 2000,
      alt: {
        fr: 'Le collège de Couvaloup en novembre 2026, avec son clocheton au toit de tuiles colorées',
        en: 'The Couvaloup school in November 2026, with its little bell tower and roof of coloured tiles',
        de: 'Das Collège de Couvaloup im November 2026 mit seinem Glockentürmchen und dem Dach aus farbigen Ziegeln',
        it: 'Il collegio di Couvaloup nel novembre 2026, con il campaniletto dal tetto di tegole colorate',
      },
      credit: 'Monique Robin-Barth, 9 novembre 2026',
    },
    links: [
      { page: 'place:musee-forel', label: { fr: 'Musée Alexis Forel', en: 'Musée Alexis Forel', de: 'Musée Alexis Forel', it: 'Musée Alexis Forel' } },
      { page: 'place:musee-paderewski', label: { fr: 'Musée Paderewski', en: 'Paderewski Museum', de: 'Paderewski-Museum', it: 'Museo Paderewski' } },
      { page: 'place:maison-dessin-presse', label: { fr: 'Maison du Dessin de Presse', en: 'Maison du Dessin de Presse', de: 'Maison du Dessin de Presse', it: 'Maison du Dessin de Presse' } },
      { page: 'place:beausobre', label: { fr: 'Théâtre de Beausobre', en: 'Théâtre de Beausobre', de: 'Théâtre de Beausobre', it: 'Théâtre de Beausobre' } },
    ],
  },
  {
    id: 'famille',
    title: { fr: 'En famille', en: 'With children', de: 'Mit der Familie', it: 'In famiglia' },
    text: {
      fr: 'Le parc de Vertou, son aire de jeux et son skatepark, la piscine du Parc en été avec ses toboggans et sa pataugeoire, et la patinoire des Eaux-Minérales en hiver : de quoi occuper petits et grands à chaque saison.',
      en: 'The Parc de Vertou with its playground and skatepark, the Piscine du Parc in summer with its slides and paddling pool, and the Eaux-Minérales ice rink in winter: something for young and old in every season.',
      de: 'Der Parc de Vertou mit Spielplatz und Skatepark, im Sommer die Piscine du Parc mit Rutschen und Planschbecken und im Winter die Eisbahn Eaux-Minérales: für Gross und Klein zu jeder Jahreszeit etwas.',
      it: 'Il Parc de Vertou con il parco giochi e lo skatepark, d’estate la Piscine du Parc con gli scivoli e la piscina per bambini, e d’inverno la pista di pattinaggio delle Eaux-Minérales: per grandi e piccini in ogni stagione.',
    },
    photo: {
      src: '/images/photos/parc-independance-kiosque-1902.webp',
      width: 1600,
      height: 1044,
      alt: {
        fr: 'Le kiosque à musique du parc de l’Indépendance, carte postale de 1902',
        en: 'The bandstand in the Parc de l’Indépendance, postcard from 1902',
        de: 'Der Musikpavillon im Parc de l’Indépendance, Postkarte von 1902',
        it: 'Il chiosco della musica del Parc de l’Indépendance, cartolina del 1902',
      },
      credit: 'Collection Philippe Chappuis (notreHistoire.ch), CC BY-NC-ND 4.0',
    },
    links: [
      { page: 'place:parc-vertou', label: { fr: 'Le parc de Vertou', en: 'Parc de Vertou', de: 'Parc de Vertou', it: 'Parc de Vertou' } },
      { page: 'place:piscine-du-parc', label: { fr: 'La piscine du Parc', en: 'The Piscine du Parc', de: 'Die Piscine du Parc', it: 'La Piscine du Parc' } },
      { page: 'place:patinoire-eaux-minerales', label: { fr: 'La patinoire', en: 'The ice rink', de: 'Die Eisbahn', it: 'La pista di pattinaggio' } },
      { page: 'life', label: { fr: 'Le calendrier des événements', en: 'The events calendar', de: 'Der Veranstaltungskalender', it: 'Il calendario degli eventi' } },
    ],
  },
  {
    id: 'beaux-endroits',
    title: { fr: 'Les beaux endroits', en: 'Beautiful spots', de: 'Schöne Orte', it: 'I luoghi più belli' },
    text: {
      fr: 'Le château vu depuis la jetée du port, le lac et, par temps clair, le Mont-Blanc depuis le parc de l’Indépendance : quelques vues à ne pas manquer, à retrouver sur la carte.',
      en: 'The castle seen from the harbour jetty, the lake and, on a clear day, Mont Blanc from the Parc de l’Indépendance: a few views not to miss, all on the map.',
      de: 'Das Schloss von der Hafenmole aus, der See und bei klarem Wetter der Mont Blanc vom Parc de l’Indépendance: einige Aussichten, die man nicht verpassen sollte, alle auf der Karte.',
      it: 'Il castello visto dal molo del porto, il lago e, con il tempo sereno, il Monte Bianco dal Parc de l’Indépendance: alcune vedute da non perdere, tutte sulla mappa.',
    },
    photo: {
      src: '/images/photos/port-jetee-1898.webp',
      width: 1600,
      height: 1028,
      alt: {
        fr: 'Le port et le château de Morges vus depuis la jetée, carte postale de 1898',
        en: 'The harbour and Morges Castle seen from the jetty, postcard from 1898',
        de: 'Hafen und Schloss Morges von der Mole aus, Postkarte von 1898',
        it: 'Il porto e il castello di Morges visti dal molo, cartolina del 1898',
      },
      credit: 'Albin Salamin (notreHistoire.ch), domaine public',
    },
    links: [
      { page: 'photo:vue-port-jetee', label: { fr: 'Le port depuis la jetée', en: 'The harbour from the jetty', de: 'Der Hafen von der Mole aus', it: 'Il porto dal molo' } },
      { page: 'place:parc-independance', label: { fr: 'Le parc de l’Indépendance', en: 'Parc de l’Indépendance', de: 'Parc de l’Indépendance', it: 'Parc de l’Indépendance' } },
      { page: 'map', label: { fr: 'La carte de Morges', en: 'The map of Morges', de: 'Die Karte von Morges', it: 'La mappa di Morges' } },
    ],
  },
];

export function validateTheme(theme) {
  const p = `discover(${theme && theme.id})`;
  const errors = [];
  errors.push(...validateText(theme.title, `${p}.title`, { allLanguages: true }));
  errors.push(...validateText(theme.text, `${p}.text`, { allLanguages: true }));
  const photo = theme.photo || {};
  if (!/^\/images\/.+\.(webp|jpg)$/.test(photo.src || '') || !photo.width || !photo.height) errors.push(`${p}.photo needs src, width and height`);
  errors.push(...validateText(photo.alt, `${p}.photo.alt`, { allLanguages: true }));
  if (typeof photo.credit !== 'string' || !photo.credit.trim()) errors.push(`${p}.photo.credit is required`);
  (theme.links || []).forEach((link, i) => {
    if (typeof link.page !== 'string' || !link.page) errors.push(`${p}.links[${i}].page is required`);
    errors.push(...validateText(link.label, `${p}.links[${i}].label`, { allLanguages: true }));
  });
  return errors;
}
