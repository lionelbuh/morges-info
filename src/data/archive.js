/**
 * Photo records: the shape every photograph must follow, so that each image carries its date, source,
 * rights and verification status. See docs/HISTORICAL_ARCHIVE.md.
 *
 * Used by the photo map (viewpoints.js: an old and/or a current photo taken from the same spot) and,
 * later, by `place.archive.photos[]`. Images are only shown once rights are cleared and verified.
 */

/** Public uploads are deliberately disabled. Do not change without a moderation workflow. */
export const PUBLIC_UPLOADS_ENABLED = false;

export const VERIFICATION_STATUSES = ['pending', 'in-review', 'verified', 'rejected'];

export const PERMISSION_STATUSES = [
  'unknown', // not yet researched
  'requested', // permission asked from rights holder
  'granted', // written permission on file
  'public-domain', // rights expired / no rights
  'open-licence', // e.g. CC BY, CC BY-SA — licence must be named
  'refused',
];

export const DATE_PRECISIONS = ['day', 'month', 'year', 'decade', 'circa'];

/**
 * @typedef {Object} ArchivePhoto
 * @property {string} id                    Stable unique id, e.g. "chateau-1905-001"
 * @property {string} placeId               Id of the place in places.js
 * @property {Record<'fr'|'en'|'de'|'it', string>} title
 * @property {Record<'fr'|'en'|'de'|'it', string>=} caption
 * @property {{ value: string, precision: string, display?: string }} date
 *           value: ISO-like "1905", "1905-06" or "1905-06-12"; precision from DATE_PRECISIONS
 * @property {string=} creator              Photographer / studio, if known
 * @property {{ institution: string, reference?: string, url?: string }} source
 *           Archive or collection the image comes from, with its inventory reference
 * @property {{ status: string, licence?: string, licenceUrl?: string, holder?: string, credit: string, evidence?: string }} rights
 *           status from PERMISSION_STATUSES; `licenceUrl` links the licence text (Creative Commons asks for it);
 *           `evidence` points to the permission document (kept offline)
 * @property {{ status: string, verifiedBy?: string, verifiedAt?: string, notes?: string }} verification
 *           status from VERIFICATION_STATUSES
 * @property {{ src: string, width?: number, height?: number }|null} image
 *           Must stay null until rights are cleared and verification is 'verified'
 */

const LANGS = ['fr', 'en', 'de', 'it'];

/**
 * Validates one archive record. Returns a list of error strings (empty = valid).
 * @param {ArchivePhoto} photo
 * @param {{ requirePlace?: boolean }} [opts] photos of the photo map (viewpoints.js) need no placeId
 */
export function validateArchivePhoto(photo, { requirePlace = true } = {}) {
  const errors = [];
  const req = (cond, msg) => {
    if (!cond) errors.push(msg);
  };

  req(photo && typeof photo === 'object', 'record must be an object');
  if (errors.length) return errors;

  req(typeof photo.id === 'string' && photo.id.length > 0, 'id is required');
  if (requirePlace) req(typeof photo.placeId === 'string' && photo.placeId.length > 0, 'placeId is required');
  req(photo.title && LANGS.every((l) => typeof photo.title[l] === 'string' && photo.title[l]), 'title needs fr, en, de, it');

  req(photo.date && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(photo.date.value || ''), 'date.value must be YYYY, YYYY-MM or YYYY-MM-DD');
  req(photo.date && DATE_PRECISIONS.includes(photo.date.precision), 'date.precision is invalid');

  req(photo.source && typeof photo.source.institution === 'string' && photo.source.institution, 'source.institution is required');

  req(photo.rights && PERMISSION_STATUSES.includes(photo.rights.status), 'rights.status is invalid');
  req(photo.rights && typeof photo.rights.credit === 'string' && photo.rights.credit, 'rights.credit is required');
  if (photo.rights && photo.rights.status === 'open-licence') {
    req(typeof photo.rights.licence === 'string' && photo.rights.licence, 'rights.licence is required for open-licence');
    req(photo.rights.licenceUrl === undefined || /^https:\/\//.test(photo.rights.licenceUrl), 'rights.licenceUrl must be https');
  }

  req(photo.verification && VERIFICATION_STATUSES.includes(photo.verification.status), 'verification.status is invalid');

  if (photo.image) {
    req(typeof photo.image.src === 'string' && /^\/images\//.test(photo.image.src), 'image.src must be a local /images/… path');
    req(Number.isInteger(photo.image.width) && Number.isInteger(photo.image.height), 'image.width and image.height are required');
    const cleared = photo.rights && ['granted', 'public-domain', 'open-licence'].includes(photo.rights.status);
    const verified = photo.verification && photo.verification.status === 'verified';
    req(cleared && verified, 'image may only be set once rights are cleared and verification is "verified"');
  }

  return errors;
}

/** Only photos that may be shown publicly. @param {{ requirePlace?: boolean }} [opts] as validateArchivePhoto */
export function publishablePhotos(photos = [], opts) {
  return photos.filter((p) => p.image && validateArchivePhoto(p, opts).length === 0);
}
