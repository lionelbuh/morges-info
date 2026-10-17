import { validateText, validateSources, isIsoDate } from './schema.js';

/**
 * Local events — only from official or otherwise reliable sources, each with
 * its source and the date it was last checked. Past events disappear
 * automatically from listings (see upcomingEvents). No automated feed.
 */
export const EVENTS = [
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
