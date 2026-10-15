import { validateText, validateSources, validatePhoto, validateOpeningHours, validateCommercial, isIsoDate } from './schema.js';

/**
 * Independent businesses in the commune of Morges.
 *
 * EMPTY ON PURPOSE: no business has been checked yet. Add an entry only after
 * verifying it (ideally on site) — never from guesswork or scraped directories.
 *
 * Shape of an entry (see docs/CONTENT.md for a full example):
 * {
 *   id: 'kebab-case-id',
 *   name: 'Nom officiel',
 *   category: 'food' | 'cafe' | 'shop' | 'crafts' | 'services',
 *   address: 'Rue …, 1110 Morges',
 *   coordinates: { lat, lng } | null,
 *   description: { fr: '…', en?, de?, it? },     // written by the editors
 *   website: 'https://…' | null,
 *   openingHours: null | { text: { fr }, sources, lastVerified },
 *   photos: [],                                     // Photo, see schema.js
 *   sources: [{ label, url }],
 *   lastVerified: 'YYYY-MM-DD',
 *   editorial: { selected: true },                  // editors' choice — cannot be bought
 *   commercial: { status: 'none' },                 // future: 'enhanced' | 'sponsored'
 * }
 */
export const BUSINESS_CATEGORIES = ['food', 'cafe', 'shop', 'crafts', 'services'];

export const BUSINESSES = [];

/** Bounding box of the commune (generous): businesses must be inside Morges. */
const MORGES_BBOX = { minLat: 46.495, maxLat: 46.53, minLng: 6.46, maxLng: 6.53 };

export function validateBusiness(b, opts = {}) {
  const p = `business(${b && b.id})`;
  const errors = [];
  if (!b || typeof b.id !== 'string' || !/^[a-z0-9-]+$/.test(b.id)) errors.push(`${p}.id must be kebab-case`);
  if (!b || typeof b.name !== 'string' || !b.name.trim()) errors.push(`${p}.name is required`);
  if (!b || !BUSINESS_CATEGORIES.includes(b.category)) errors.push(`${p}.category is invalid`);
  if (!b || typeof b.address !== 'string' || !/1110 Morges/.test(b.address)) errors.push(`${p}.address must be in 1110 Morges`);
  if (b && b.coordinates) {
    const { lat, lng } = b.coordinates;
    if (!(lat > MORGES_BBOX.minLat && lat < MORGES_BBOX.maxLat && lng > MORGES_BBOX.minLng && lng < MORGES_BBOX.maxLng)) {
      errors.push(`${p}.coordinates are outside Morges`);
    }
  }
  errors.push(...validateText(b && b.description, `${p}.description`));
  if (b && b.website !== null && !/^https:\/\//.test(b.website || '')) errors.push(`${p}.website must be https or null`);
  errors.push(...validateOpeningHours(b && b.openingHours, `${p}.openingHours`));
  (b && b.photos ? b.photos : []).forEach((photo, i) => errors.push(...validatePhoto(photo, `${p}.photos[${i}]`)));
  errors.push(...validateSources(b && b.sources, `${p}.sources`));
  if (!b || !isIsoDate(b.lastVerified)) errors.push(`${p}.lastVerified must be YYYY-MM-DD`);
  if (!b || !b.editorial || typeof b.editorial.selected !== 'boolean') errors.push(`${p}.editorial.selected is required`);
  errors.push(...validateCommercial(b && b.commercial, `${p}.commercial`, opts));
  return errors;
}

/** Entries shown in the editorial selection (sponsored entries are never part of it). */
export function editorialSelection(list = BUSINESSES) {
  return list.filter((b) => b.editorial && b.editorial.selected && b.commercial.status !== 'sponsored');
}
