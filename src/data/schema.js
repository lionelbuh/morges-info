/**
 * Shared building blocks for every content type (places, businesses, events,
 * practical information, stories, history). See docs/CONTENT.md.
 *
 * Principles:
 *  - Facts carry `sources`; information that can change carries `lastVerified`.
 *  - Missing information stays `null` / empty — never filled with guesses.
 *  - Text is `{ fr, en?, de?, it? }`: French is required, other languages are
 *    optional and fall back to French with a visible notice.
 *  - Commercial status lives in its own `commercial` field, never mixed with
 *    editorial fields.
 */

export const LANGS = ['fr', 'en', 'de', 'it'];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

/** French required; other languages optional but, if present, non-empty. */
export function validateText(obj, path, { allLanguages = false } = {}) {
  const errors = [];
  if (!obj || typeof obj !== 'object') return [`${path} must be a { fr, … } object`];
  for (const lang of LANGS) {
    const value = obj[lang];
    const required = lang === 'fr' || allLanguages;
    if (value === undefined && !required) continue;
    const ok = Array.isArray(value) ? value.length > 0 && value.every((p) => typeof p === 'string' && p.trim()) : typeof value === 'string' && value.trim();
    if (!ok) errors.push(`${path}.${lang} is missing or empty`);
  }
  return errors;
}

/**
 * Sources: `{ label, url? }`. `label` is a source title (string) or, for text that
 * must follow the language, a { fr, en, de, it } object. A URL is required unless
 * the source is an indication from the Morges.info team.
 */
export function validateSources(list, path, { min = 1 } = {}) {
  const errors = [];
  if (!Array.isArray(list) || list.length < min) return [`${path} needs at least ${min} source(s)`];
  list.forEach((s, i) => {
    const label = s && s.label;
    const labelOk = typeof label === 'string' ? label.trim() : validateText(label, 'label', { allLanguages: true }).length === 0;
    if (!labelOk) errors.push(`${path}[${i}].label is required (string, or text in fr, en, de, it)`);
    if (s && s.url !== undefined && !/^https:\/\//.test(s.url)) errors.push(`${path}[${i}].url must be https`);
    const labelFr = typeof label === 'string' ? label : label && label.fr;
    if (s && s.url === undefined && !String(labelFr).includes('Morges.info')) errors.push(`${path}[${i}] needs a url`);
  });
  return errors;
}

/**
 * Current (present-day) photograph. Historical photographs use the stricter
 * model in archive.js. A photo is only valid with alt text, author and licence.
 * @typedef {{ src: string, alt: Record<string,string>, credit: string, licence: string, sourceUrl?: string, date?: string }} Photo
 */
export function validatePhoto(photo, path) {
  const errors = [];
  if (!photo || typeof photo.src !== 'string' || !photo.src) errors.push(`${path}.src is required`);
  errors.push(...validateText(photo && photo.alt, `${path}.alt`));
  if (!photo || typeof photo.credit !== 'string' || !photo.credit.trim()) errors.push(`${path}.credit is required`);
  if (!photo || typeof photo.licence !== 'string' || !photo.licence.trim()) errors.push(`${path}.licence is required`);
  if (photo && photo.sourceUrl !== undefined && !/^https:\/\//.test(photo.sourceUrl)) errors.push(`${path}.sourceUrl must be https`);
  if (photo && photo.date !== undefined && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(photo.date)) errors.push(`${path}.date is invalid`);
  return errors;
}

/**
 * Opening hours are published only when verified: `null`, or
 * `{ text: { fr, … }, sources, lastVerified }`.
 */
export function validateOpeningHours(hours, path) {
  if (hours === null || hours === undefined) return [];
  return [
    ...validateText(hours.text, `${path}.text`),
    ...validateSources(hours.sources, `${path}.sources`),
    ...(isIsoDate(hours.lastVerified) ? [] : [`${path}.lastVerified must be YYYY-MM-DD`]),
  ];
}

/**
 * Commercial status — reserved for a possible future offer, disabled today.
 *  - 'none'      : ordinary entry (the only value accepted while disabled)
 *  - 'enhanced'  : future paid enhanced listing (more photos, longer text)
 *  - 'sponsored' : future sponsored placement — must always be labelled
 * Editorial selection (`editorial`) is a separate field and can never be bought.
 */
export const COMMERCIAL_STATUSES = ['none', 'enhanced', 'sponsored'];
export const COMMERCIAL_LISTINGS_ENABLED = false;

export function validateCommercial(commercial, path, { enabled = COMMERCIAL_LISTINGS_ENABLED } = {}) {
  if (!commercial || !COMMERCIAL_STATUSES.includes(commercial.status)) return [`${path}.status is invalid`];
  if (!enabled && commercial.status !== 'none') return [`${path}.status must be "none" while commercial listings are disabled`];
  return [];
}
