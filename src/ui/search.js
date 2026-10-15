import { MESSAGES, LANGUAGES } from '../i18n/index.js';

/** Lower-case and strip accents so "chateau" matches "Château". */
export function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .toLowerCase()
    .trim();
}

function haystack(place) {
  const parts = [];
  for (const lang of LANGUAGES) {
    parts.push(place.name[lang], place.location[lang], place.description[lang]);
    parts.push(MESSAGES[lang].categories[place.category]);
  }
  return normalize(parts.join(' '));
}

function nameText(place) {
  return normalize(LANGUAGES.map((lang) => place.name[lang]).join(' '));
}

const cache = new WeakMap();

/**
 * Filter places by free-text query (all four languages are searched) and by
 * category. An empty category set means "all categories". Places whose name
 * matches come first, then those matching only in location/description.
 * @param {Array} places
 * @param {{ query?: string, categories?: Set<string> }} criteria
 */
export function filterPlaces(places, { query = '', categories = new Set() } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const matches = places.filter((place) => {
    if (categories.size > 0 && !categories.has(place.category)) return false;
    if (terms.length === 0) return true;
    if (!cache.has(place)) cache.set(place, haystack(place));
    const text = cache.get(place);
    return terms.every((term) => text.includes(term));
  });
  if (terms.length === 0) return matches;
  const nameHit = (place) => terms.every((term) => nameText(place).includes(term));
  // Array.prototype.sort is stable, so the original order is kept within each group.
  return matches.sort((a, b) => Number(nameHit(b)) - Number(nameHit(a)));
}
