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
