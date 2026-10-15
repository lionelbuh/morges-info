import { describe, it, expect } from 'vitest';
import { PLACES } from '../../src/data/places.js';
import { filterPlaces, normalize } from '../../src/ui/search.js';

const ids = (list) => list.map((p) => p.id);

describe('search and filters', () => {
  it('normalizes accents and case', () => {
    expect(normalize('Château  ')).toBe('chateau');
    expect(normalize('Hôtel de Ville')).toBe('hotel de ville');
  });

  it('returns everything with no criteria', () => {
    expect(filterPlaces(PLACES)).toHaveLength(PLACES.length);
  });

  it('matches without accents', () => {
    expect(ids(filterPlaces(PLACES, { query: 'chateau' }))).toContain('chateau');
    expect(ids(filterPlaces(PLACES, { query: 'theatre' }))).toContain('beausobre');
  });

  it('matches names in any of the four languages', () => {
    expect(ids(filterPlaces(PLACES, { query: 'castle' }))).toContain('chateau');
    expect(ids(filterPlaces(PLACES, { query: 'Bahnhof' }))).toEqual(['gare']);
    expect(ids(filterPlaces(PLACES, { query: 'municipio' }))).toEqual(['hotel-de-ville']);
  });

  it('lists name matches before description matches', () => {
    const result = ids(filterPlaces(PLACES, { query: 'chateau' }));
    expect(result[0]).toBe('chateau');
    expect(result.length).toBeGreaterThan(1);
  });

  it('requires all words to match', () => {
    expect(ids(filterPlaces(PLACES, { query: 'port morges' }))).toContain('port');
    expect(filterPlaces(PLACES, { query: 'zzzz port' })).toHaveLength(0);
  });

  it('filters by category', () => {
    const lake = filterPlaces(PLACES, { categories: new Set(['lake']) });
    expect(ids(lake).sort()).toEqual(['parc-independance', 'port', 'quai-lochmann']);
    const two = filterPlaces(PLACES, { categories: new Set(['transport', 'culture']) });
    expect(ids(two).sort()).toEqual(['beausobre', 'gare']);
  });

  it('combines query and category', () => {
    expect(filterPlaces(PLACES, { query: 'gare', categories: new Set(['heritage']) })).toHaveLength(0);
  });
});
