import { describe, it, expect } from 'vitest';
import { PLACES } from '../../src/data/places.js';
import { CATEGORY_IDS } from '../../src/data/categories.js';
import { LANGUAGES } from '../../src/i18n/index.js';

// Generous bounding box around the commune of Morges.
const BBOX = { minLat: 46.495, maxLat: 46.525, minLng: 6.475, maxLng: 6.52 };

const REQUIRED_IDS = [
  'chateau',
  'temple',
  'hotel-de-ville',
  'grand-rue',
  'place-du-marche',
  'parc-independance',
  'quai-lochmann',
  'port',
  'gare',
  'beausobre',
];

describe('places data', () => {
  it('contains the ten requested places with unique ids', () => {
    const ids = PLACES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of REQUIRED_IDS) expect(ids).toContain(id);
  });

  it.each(PLACES.map((p) => [p.id, p]))('%s is complete in all four languages', (_, place) => {
    expect(CATEGORY_IDS).toContain(place.category);
    for (const field of ['name', 'location', 'description']) {
      for (const lang of LANGUAGES) {
        expect(typeof place[field][lang], `${field}.${lang}`).toBe('string');
        expect(place[field][lang].trim().length, `${field}.${lang}`).toBeGreaterThan(2);
      }
    }
  });

  it.each(PLACES.map((p) => [p.id, p]))('%s has coordinates consistent with its verification status', (_, place) => {
    const { geo, coordinates } = place;
    expect(['confirmed', 'cross-checked', 'single-source', 'estimated', 'team', 'unverified']).toContain(geo.status);
    if (geo.status === 'unverified') {
      expect(coordinates).toBeNull();
      return;
    }
    expect(geo.sources.length).toBeGreaterThanOrEqual(geo.status === 'cross-checked' ? 2 : 1);
    expect(coordinates.lat).toBeGreaterThan(BBOX.minLat);
    expect(coordinates.lat).toBeLessThan(BBOX.maxLat);
    expect(coordinates.lng).toBeGreaterThan(BBOX.minLng);
    expect(coordinates.lng).toBeLessThan(BBOX.maxLng);
  });

  it.each(PLACES.map((p) => [p.id, p]))('%s cites at least one source for its facts', (_, place) => {
    expect(place.factSources.length).toBeGreaterThan(0);
    for (const s of place.factSources) {
      expect(s.label).toBeTruthy();
      expect(s.url).toMatch(/^https:\/\//);
    }
    // position sources may be an indication from the Morges.info team (no URL)
    for (const s of place.geo.sources) {
      if (typeof s.label === 'string') expect(s.label).toBeTruthy();
      else for (const lang of LANGUAGES) expect(s.label[lang], `${place.id} source ${lang}`).toBeTruthy();
      if (s.url !== undefined) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('documents how approximate or team-provided positions were obtained', () => {
    for (const place of PLACES.filter((p) => ['estimated', 'confirmed', 'team'].includes(p.geo.status))) {
      expect(place.geo.note, place.id).toBeTruthy();
      if (place.geo.status !== 'estimated') {
        expect(place.geo.sources.some((s) => (typeof s.label === 'string' ? s.label : s.label.fr).includes('Morges.info')), place.id).toBe(true);
      }
    }
    expect(PLACES.find((p) => p.id === 'place-du-marche').geo.status).toBe('estimated');
  });

  it('places sharing a marker point to an existing place at the same position', () => {
    for (const place of PLACES.filter((p) => p.markerOf)) {
      const host = PLACES.find((p) => p.id === place.markerOf);
      expect(host, place.id).toBeTruthy();
      expect(place.coordinates).toEqual(host.coordinates);
    }
  });

  it('records the team-supplied point whenever a published position was preferred', () => {
    for (const id of ['debarcadere-cgn', 'musee-forel', 'musee-bolle', 'musee-paderewski', 'maison-dessin-presse']) {
      expect(PLACES.find((p) => p.id === id).geo.note, id).toMatch(/équipe Morges\.info/);
    }
  });

  it('has an empty historical archive in this version', () => {
    for (const place of PLACES) expect(place.archive.photos).toEqual([]);
  });
});
