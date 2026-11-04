const LOCALES = { fr: 'fr-CH', en: 'en-GB', de: 'de-CH', it: 'it-CH' };

/** 2026-12-02 → « 2 décembre 2026 » (in the given language). */
export function formatDate(iso, lang) {
  const date = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Today in Morges, with the weekday: « samedi 17 octobre 2026 ». */
export function formatToday(lang, now = new Date()) {
  const text = new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zurich',
  }).format(now);
  // Some ICU versions write « samedi, 17 octobre » — French takes no comma there.
  return lang === 'fr' || lang === 'it' ? text.replace(/^(\p{L}+), /u, '$1 ') : text;
}

/** 2026-12-01 → « décembre 2026 ». */
export function formatMonth(iso, lang) {
  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso.slice(0, 7)}-01T12:00:00Z`),
  );
}

/** 2026-12-05 → « samedi 5 décembre 2026 ». */
export function formatDayLong(iso, lang) {
  const text = new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
  return lang === 'fr' || lang === 'it' ? text.replace(/^(\p{L}+), /u, '$1 ') : text;
}

/** The seven weekday names, Monday first, with their weekHours keys. 2026-11-02 is a Monday. */
export function weekdayNames(lang, style = 'long') {
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const fmt = new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, { weekday: style, timeZone: 'UTC' });
  return keys.map((key, i) => ({ key, name: fmt.format(new Date(Date.UTC(2026, 10, 2 + i, 12))) }));
}

/** ['15:00', '21:00'] → « 15 h – 21 h » in French, « 15:00–21:00 » otherwise. */
export function formatTimeRange([from, to], lang) {
  if (lang !== 'fr') return `${from}–${to}`;
  const fr = (hhmm) => {
    const [h, m] = hhmm.split(':');
    return `${Number(h)} h${m === '00' ? '' : ` ${m}`}`;
  };
  return `${fr(from)} – ${fr(to)}`;
}

/** 2026-12-02 → « 2 déc. »; a range in one month → « 2–20 déc. ». */
export function formatShortRange(start, end, lang) {
  const fmt = (iso, opts) =>
    new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const short = (iso) => fmt(iso, { day: 'numeric', month: 'short' });
  if (start === end) return short(start);
  if (start.slice(0, 7) === end.slice(0, 7)) {
    // « 2–20 déc. »: the day of the start, then the end with its month
    return `${fmt(start, { day: 'numeric' }).replace(/\.$/, '')}–${short(end)}`;
  }
  return `${short(start)} – ${short(end)}`;
}

/** 2026-12-01 → « déc. » */
export function formatMonthShort(iso, lang) {
  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.fr, { month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
}
