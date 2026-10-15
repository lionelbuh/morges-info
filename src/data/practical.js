import { validateText, validateSources, isIsoDate } from './schema.js';

/**
 * Practical information that can change: each item cites its sources and the
 * date it was last checked. Keep items short and factual.
 */
export const PRACTICAL = [
  {
    id: 'marche',
    title: { fr: 'Marché hebdomadaire', en: 'Weekly market', de: 'Wochenmarkt', it: 'Mercato settimanale' },
    text: {
      fr: 'Toute l’année sur la Grand-Rue piétonne, le mercredi et le samedi matin. Horaires indiqués par la Ville de Morges : mercredi de 8 h à 13 h 30, samedi de 8 h à 14 h ; du 1er novembre au 31 mars, ouverture à 8 h 30.',
      en: 'All year round on the pedestrian Grand-Rue, on Wednesday and Saturday mornings. Hours given by the Ville de Morges: Wednesday 8 am to 1.30 pm, Saturday 8 am to 2 pm; from 1 November to 31 March, opening at 8.30 am.',
      de: 'Das ganze Jahr in der Fussgängerzone Grand-Rue, am Mittwoch- und Samstagvormittag. Zeiten laut Stadt Morges: Mittwoch 8 bis 13.30 Uhr, Samstag 8 bis 14 Uhr; vom 1. November bis 31. März Beginn um 8.30 Uhr.',
      it: 'Tutto l’anno nella Grand-Rue pedonale, il mercoledì e il sabato mattina. Orari indicati dalla Città di Morges: mercoledì dalle 8 alle 13.30, sabato dalle 8 alle 14; dal 1° novembre al 31 marzo apertura alle 8.30.',
    },
    placeId: 'grand-rue',
    sources: [
      { label: 'Ville de Morges — Inscription aux marchés', url: 'https://www.morges.ch/vivre-a-morges/police-secours-et-securite/police-du-commerce/activites-soumises-a-autorisation/inscription-aux-marches-9070' },
      { label: 'Morges Région Tourisme — Marché de Morges', url: 'https://www.morges-tourisme.ch/en/P7222/morges-market' },
    ],
    lastVerified: '2026-10-15',
  },
  {
    id: 'gare',
    title: { fr: 'Train', en: 'Train', de: 'Zug', it: 'Treno' },
    text: {
      fr: 'La gare de Morges est sur la ligne Lausanne–Genève et au terminus du chemin de fer Bière–Apples–Morges (BAM). La rue Centrale, piétonne, la relie à la vieille ville.',
      en: 'Morges station is on the Lausanne–Geneva line and is the terminus of the Bière–Apples–Morges railway (BAM). The pedestrian Rue Centrale links it to the old town.',
      de: 'Der Bahnhof Morges liegt an der Strecke Lausanne–Genf und ist Endpunkt der Bahn Bière–Apples–Morges (BAM). Die Fussgängerzone Rue Centrale verbindet ihn mit der Altstadt.',
      it: 'La stazione di Morges si trova sulla linea Losanna–Ginevra ed è il capolinea della ferrovia Bière–Apples–Morges (BAM). La Rue Centrale, pedonale, la collega al centro storico.',
    },
    placeId: 'gare',
    sources: [
      { label: 'Wikipedia — Morges railway station', url: 'https://en.wikipedia.org/wiki/Morges_railway_station' },
      { label: 'Ville de Morges — Rue du Sablon et Rue Centrale', url: 'https://www.morges.ch/vivre-a-morges/rue-du-sablon-et-rue-centrale-203548' },
    ],
    lastVerified: '2026-10-15',
  },
  {
    id: 'bateau',
    title: { fr: 'Bateau', en: 'Boat', de: 'Schiff', it: 'Battello' },
    text: {
      fr: 'Le débarcadère CGN se trouve quai Igor-Stravinski. Les bateaux n’y font pas escale tous les jours et la desserte varie selon la saison : consultez l’horaire de la CGN avant de partir.',
      en: 'The CGN pier is on the Quai Igor-Stravinski. Boats do not call every day and service varies with the season: check the CGN timetable before you go.',
      de: 'Die CGN-Anlegestelle befindet sich am Quai Igor-Stravinski. Die Schiffe legen nicht täglich an, und das Angebot ändert sich je nach Saison: Prüfen Sie vor der Fahrt den CGN-Fahrplan.',
      it: 'L’imbarcadero CGN si trova sul Quai Igor-Stravinski. I battelli non vi fanno scalo tutti i giorni e il servizio varia secondo la stagione: consultate l’orario della CGN prima di partire.',
    },
    placeId: null,
    link: { label: 'CGN', url: 'https://www.cgn.ch/' },
    sources: [
      { label: 'Ville de Morges — CGN', url: 'https://www.morges.ch/vivre-a-morges/en-transports-publics/cgn--compagnie-generale-de-navigation-10486' },
      { label: 'Morges Région Tourisme — Débarcadère CGN', url: 'https://www.morges-tourisme.ch/en/P968/cgn-pier-morges' },
    ],
    lastVerified: '2026-10-15',
  },
];

/** Official websites (checked 2026-10-15). */
export const OFFICIAL_LINKS = [
  { label: 'Ville de Morges', url: 'https://www.morges.ch/' },
  { label: 'Morges Région Tourisme', url: 'https://www.morges-tourisme.ch/' },
  { label: 'CGN — Compagnie Générale de Navigation', url: 'https://www.cgn.ch/' },
  { label: 'Théâtre de Beausobre', url: 'https://beausobre.ch/' },
];

export function validatePractical(item) {
  const p = `practical(${item && item.id})`;
  const errors = [];
  errors.push(...validateText(item && item.title, `${p}.title`));
  errors.push(...validateText(item && item.text, `${p}.text`));
  errors.push(...validateSources(item && item.sources, `${p}.sources`));
  if (!item || !isIsoDate(item.lastVerified)) errors.push(`${p}.lastVerified must be YYYY-MM-DD`);
  return errors;
}
