import { validateText, validateSources, isIsoDate } from './schema.js';

/**
 * Local events — only from official or otherwise reliable sources, each with
 * its source and the date it was last checked. `summary` (optional, four
 * languages) is a short description written by Morges.info. Past events disappear
 * automatically from listings (see upcomingEvents). No automated feed.
 */
export const EVENTS = [
  {
    id: 'halloween-chateau-2026',
    title: {
      fr: 'Halloween au Château de Morges',
      en: 'Halloween at Morges Castle',
      de: 'Halloween im Schloss Morges',
      it: 'Halloween al Castello di Morges',
    },
    startDate: '2026-10-31',
    endDate: '2026-10-31',
    placeId: 'chateau',
    hours: {
      fr: 'De 15 h à 22 h.',
      en: '3 pm to 10 pm.',
      de: '15 bis 22 Uhr.',
      it: 'Dalle 15 alle 22.',
    },
    summary: {
      fr: 'Le château fête Halloween : sculpture de courges, jeu du Loup-Garou, Cirque Coquino et ateliers dans les jardins ; projections par âge dans le donjon (dès 15 h pour les 5–8 ans, adultes dès 19 h 15) ; contes et lectures de la Bibliothèque de Morges dans les caves ; parcours à la bougie sur les procès de sorcellerie, de 17 h à 21 h ; grand spectacle de clôture à 21 h par la Cie du Petit Grimoire. Soupe et marshmallows grillés dès 18 h, restauration sur place. Costumes bienvenus. Jardins et caves accessibles aux personnes à mobilité réduite.',
      en: 'The castle celebrates Halloween: pumpkin carving, a Werewolf game, the Cirque Coquino and workshops in the gardens; screenings by age group in the keep (from 3 pm for ages 5–8, adults from 7.15 pm); tales and readings by the Morges library in the cellars; a candlelit trail on the witch trials, 5 pm to 9 pm; a closing show at 9 pm by the Cie du Petit Grimoire. Soup and toasted marshmallows from 6 pm, food on site. Costumes welcome. Gardens and cellars accessible to people with reduced mobility.',
      de: 'Das Schloss feiert Halloween: Kürbisschnitzen, ein Werwolf-Spiel, der Cirque Coquino und Workshops in den Gärten; Filmvorführungen nach Altersgruppen im Bergfried (ab 15 Uhr für 5- bis 8-Jährige, Erwachsene ab 19.15 Uhr); Märchen und Lesungen der Bibliothek Morges in den Kellern; ein Rundgang bei Kerzenlicht zu den Hexenprozessen, 17 bis 21 Uhr; Abschlussvorstellung um 21 Uhr mit der Cie du Petit Grimoire. Suppe und geröstete Marshmallows ab 18 Uhr, Verpflegung vor Ort. Kostüme willkommen. Gärten und Keller sind für Menschen mit eingeschränkter Mobilität zugänglich.',
      it: 'Il castello festeggia Halloween: zucche da intagliare, il gioco del Lupo Mannaro, il Cirque Coquino e laboratori nei giardini; proiezioni per fasce d’età nel torrione (dalle 15 per i 5–8 anni, adulti dalle 19.15); racconti e letture della Biblioteca di Morges nelle cantine; un percorso a lume di candela sui processi alle streghe, dalle 17 alle 21; spettacolo di chiusura alle 21 con la Cie du Petit Grimoire. Zuppa e marshmallow arrostiti dalle 18, ristorazione sul posto. Costumi benvenuti. Giardini e cantine accessibili alle persone con mobilità ridotta.',
    },
    sources: [
      { label: 'Château de Morges — Halloween au Château de Morges', url: 'https://chateau-morges.ch/agenda/agenda-detail/news/halloween-au-chateau-de-morges/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-zip-zap-circus-2026',
    title: {
      fr: 'Zip Zap Circus',
      en: 'Zip Zap Circus',
      de: 'Zip Zap Circus',
      it: 'Zip Zap Circus',
    },
    startDate: '2026-11-04',
    endDate: '2026-11-04',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Cirque contemporain de la troupe sud-africaine Zip Zap, au Théâtre de Beausobre.',
      en: 'Contemporary circus by the South African troupe Zip Zap, at the Théâtre de Beausobre.',
      de: 'Zeitgenössischer Zirkus der südafrikanischen Truppe Zip Zap im Théâtre de Beausobre.',
      it: 'Circo contemporaneo della compagnia sudafricana Zip Zap, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'festival-des-sports-patinoire-2026',
    title: {
      fr: 'Festival des Sports, édition Patinoire',
      en: 'Sports Festival, ice-rink edition',
      de: 'Sportfestival, Ausgabe Eisbahn',
      it: 'Festival dello sport, edizione pista di pattinaggio',
    },
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    placeId: 'patinoire-eaux-minerales',
    hours: null,
    summary: {
      fr: 'Une journée d’animations sportives à la patinoire des Eaux-Minérales.',
      en: 'A day of sports activities at the Eaux-Minérales ice rink.',
      de: 'Ein Tag mit Sportangeboten in der Eisbahn Eaux-Minérales.',
      it: 'Una giornata di attività sportive alla pista di pattinaggio delle Eaux-Minérales.',
    },
    sources: [
      { label: 'Ville de Morges — agenda : Festival des Sports, édition Patinoire', url: 'https://www.morges.ch/agenda/festival-des-sports--edition-patinoire-212903' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-blaise-bersinger-2026',
    title: {
      fr: 'Blaise Bersinger',
      en: 'Blaise Bersinger',
      de: 'Blaise Bersinger',
      it: 'Blaise Bersinger',
    },
    startDate: '2026-11-12',
    endDate: '2026-11-12',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Spectacle d’humour de Blaise Bersinger, au Théâtre de Beausobre.',
      en: 'Comedy show by Blaise Bersinger, at the Théâtre de Beausobre.',
      de: 'Comedy-Programm von Blaise Bersinger im Théâtre de Beausobre.',
      it: 'Spettacolo comico di Blaise Bersinger, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-circa-2026',
    title: {
      fr: 'Cie Circa',
      en: 'Circa',
      de: 'Circa',
      it: 'Circa',
    },
    startDate: '2026-11-18',
    endDate: '2026-11-18',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Cirque contemporain de la compagnie australienne Circa, au Théâtre de Beausobre.',
      en: 'Contemporary circus by the Australian company Circa, at the Théâtre de Beausobre.',
      de: 'Zeitgenössischer Zirkus der australischen Compagnie Circa im Théâtre de Beausobre.',
      it: 'Circo contemporaneo della compagnia australiana Circa, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-solann-2026',
    title: {
      fr: 'Solann',
      en: 'Solann',
      de: 'Solann',
      it: 'Solann',
    },
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Concert de la chanteuse Solann, au Théâtre de Beausobre.',
      en: 'Concert by the singer Solann, at the Théâtre de Beausobre.',
      de: 'Konzert der Sängerin Solann im Théâtre de Beausobre.',
      it: 'Concerto della cantante Solann, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'requiem-for-a-dead-sun-2026',
    title: {
      fr: 'Requiem for a Dead Sun',
      en: 'Requiem for a Dead Sun',
      de: 'Requiem for a Dead Sun',
      it: 'Requiem for a Dead Sun',
    },
    startDate: '2026-11-29',
    endDate: '2026-11-29',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Grande œuvre chorale et instrumentale d’Alain Roche, au Théâtre de Beausobre.',
      en: 'A large choral and instrumental work by Alain Roche, at the Théâtre de Beausobre.',
      de: 'Grosses Werk für Chor und Instrumente von Alain Roche im Théâtre de Beausobre.',
      it: 'Grande opera corale e strumentale di Alain Roche, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
      { label: 'Songkick — Alain Roche au Théâtre de Beausobre', url: 'https://www.songkick.com/fr/concerts/43298041-alain-roche-at-theatre-de-beausobre' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'marche-de-noel-2026',
    title: {
      fr: 'Marché de Noël de Morges',
      en: 'Morges Christmas Market',
      de: 'Weihnachtsmarkt Morges',
      it: 'Mercatino di Natale di Morges',
    },
    startDate: '2026-12-02',
    endDate: '2026-12-20',
    placeId: 'chateau',
    hours: {
      fr: 'Du mercredi au vendredi de 15 h à 21 h ; samedi et dimanche de 10 h à 21 h.',
      en: 'Wednesday to Friday 3 pm to 9 pm; Saturday and Sunday 10 am to 9 pm.',
      de: 'Mittwoch bis Freitag 15 bis 21 Uhr; Samstag und Sonntag 10 bis 21 Uhr.',
      it: 'Da mercoledì a venerdì dalle 15 alle 21; sabato e domenica dalle 10 alle 21.',
    },
    sources: [
      { label: 'Ville de Morges — agenda : Marché de Noël de Morges', url: 'https://www.morges.ch/agenda/marche-de-noel-de-morges-213841' },
      { label: 'Morges Région Tourisme — Marché de Noël au Château de Morges', url: 'https://www.morges-tourisme.ch/events/marche-de-noel-au-chateau-de-morges/' },
    ],
    lastVerified: '2026-10-15',
  },
];

export function validateEvent(e) {
  const p = `event(${e && e.id})`;
  const errors = [];
  errors.push(...validateText(e && e.title, `${p}.title`));
  if (!e || !isIsoDate(e.startDate) || !isIsoDate(e.endDate) || e.endDate < e.startDate) errors.push(`${p} dates are invalid`);
  if (e && e.hours !== null) errors.push(...validateText(e.hours, `${p}.hours`));
  if (e && e.summary !== undefined) errors.push(...validateText(e.summary, `${p}.summary`, { allLanguages: true }));
  errors.push(...validateSources(e && e.sources, `${p}.sources`));
  if (!e || !isIsoDate(e.lastVerified)) errors.push(`${p}.lastVerified must be YYYY-MM-DD`);
  return errors;
}

/** Local calendar date (Europe/Zurich) as YYYY-MM-DD. */
export function todayInMorges(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(now);
}

/** Events that have not ended yet, soonest first. */
export function upcomingEvents(list = EVENTS, today = todayInMorges()) {
  return list.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
}
