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
