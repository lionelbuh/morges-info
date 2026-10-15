import { describe, it, expect, beforeEach } from 'vitest';
import { PLACES, getPlace } from '../../src/data/places.js';
import { BUSINESSES, validateBusiness, editorialSelection } from '../../src/data/businesses.js';
import { EVENTS, validateEvent, upcomingEvents, todayInMorges } from '../../src/data/events.js';
import { PRACTICAL, OFFICIAL_LINKS, validatePractical } from '../../src/data/practical.js';
import { STORIES, validateStory, featuredStory } from '../../src/data/stories.js';
import { MILESTONES, THEN_AND_NOW, validateMilestone } from '../../src/data/history.js';
import { validatePhoto, validateOpeningHours, validateCommercial, isIsoDate, COMMERCIAL_LISTINGS_ENABLED } from '../../src/data/schema.js';
import { businessCard } from '../../src/site/components.js';
import { setLang } from '../../src/i18n/index.js';

const business = (overrides = {}) => ({
  id: 'exemple',
  name: 'Exemple',
  category: 'shop',
  address: 'Grand-Rue 1, 1110 Morges',
  coordinates: { lat: 46.509, lng: 6.498 },
  description: { fr: 'Description rédigée par la rédaction.' },
  website: null,
  openingHours: null,
  photos: [],
  sources: [{ label: 'Visite sur place par l’équipe Morges.info (2026-10-15)' }],
  lastVerified: '2026-10-15',
  editorial: { selected: true },
  commercial: { status: 'none' },
  ...overrides,
});

describe('content model', () => {
  beforeEach(() => setLang('fr', { persist: false }));

  it('places carry the extended fields; unverified fields stay null', () => {
    for (const p of PLACES) {
      expect(isIsoDate(p.lastVerified), p.id).toBe(true);
      expect(Array.isArray(p.photos), p.id).toBe(true);
      expect(p.openingHours, p.id).toBeNull(); // none verified yet
      if (p.website !== null) expect(p.website).toMatch(/^https:\/\//);
      p.photos.forEach((photo, i) => expect(validatePhoto(photo, `${p.id}.photos[${i}]`)).toEqual([]));
    }
  });

  it('no business is published without verification (list is empty today)', () => {
    expect(BUSINESSES).toEqual([]);
    for (const b of BUSINESSES) expect(validateBusiness(b)).toEqual([]);
  });

  it('validates a well-formed business and rejects incomplete ones', () => {
    expect(validateBusiness(business())).toEqual([]);
    expect(validateBusiness(business({ address: 'Rue X, 1003 Lausanne' })).join()).toMatch(/1110 Morges/);
    expect(validateBusiness(business({ coordinates: { lat: 46.52, lng: 6.63 } })).join()).toMatch(/outside Morges/);
    expect(validateBusiness(business({ sources: [] })).join()).toMatch(/source/);
    expect(validateBusiness(business({ openingHours: { text: { fr: '9–18 h' } } })).join()).toMatch(/openingHours/);
  });

  it('keeps commercial status separate and disabled', () => {
    expect(COMMERCIAL_LISTINGS_ENABLED).toBe(false);
    expect(validateBusiness(business({ commercial: { status: 'sponsored' } })).join()).toMatch(/disabled/);
    expect(validateCommercial({ status: 'sponsored' }, 'x', { enabled: true })).toEqual([]);
  });

  it('sponsored entries are always labelled and never part of the editorial selection', () => {
    const sponsored = business({ id: 'sponsor', commercial: { status: 'sponsored' } });
    expect(businessCard(sponsored)).toContain('Contenu sponsorisé');
    expect(businessCard(business())).not.toContain('Contenu sponsorisé');
    expect(editorialSelection([business(), sponsored]).map((b) => b.id)).toEqual(['exemple']);
  });

  it('photos require alt text, credit and licence', () => {
    expect(validatePhoto({ src: '/p.jpg', alt: { fr: 'Le port' }, credit: 'A. Auteur', licence: 'CC BY 4.0' }, 'p')).toEqual([]);
    expect(validatePhoto({ src: '/p.jpg', alt: { fr: 'Le port' } }, 'p').join()).toMatch(/credit.*licence/);
  });

  it('opening hours need sources and a verification date', () => {
    expect(validateOpeningHours(null, 'h')).toEqual([]);
    expect(validateOpeningHours({ text: { fr: '9–18 h' }, sources: [{ label: 'x', url: 'https://x.ch' }], lastVerified: '2026-10-15' }, 'h')).toEqual([]);
  });

  it('events, practical items, stories and milestones are valid and sourced', () => {
    for (const e of EVENTS) expect(validateEvent(e)).toEqual([]);
    for (const p of PRACTICAL) expect(validatePractical(p)).toEqual([]);
    for (const s of STORIES) expect(validateStory(s)).toEqual([]);
    for (const m of MILESTONES) expect(validateMilestone(m)).toEqual([]);
    for (const l of OFFICIAL_LINKS) expect(l.url).toMatch(/^https:\/\//);
  });

  it('cross-references point to existing places', () => {
    const refs = [
      ...EVENTS.map((e) => e.placeId),
      ...PRACTICAL.map((p) => p.placeId),
      ...STORIES.flatMap((s) => s.placeIds),
      ...MILESTONES.map((m) => m.placeId),
    ].filter(Boolean);
    for (const id of refs) expect(getPlace(id), id).toBeTruthy();
  });

  it('milestones are in chronological order', () => {
    const starts = MILESTONES.map((m) => Number(m.period.slice(0, 4)));
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });

  it('upcoming events hide past ones and use the Morges calendar date', () => {
    expect(upcomingEvents(EVENTS, '2026-11-01').map((e) => e.id)).toEqual(['marche-de-noel-2026']);
    expect(upcomingEvents(EVENTS, '2026-12-20')).toHaveLength(1); // last day still listed
    expect(upcomingEvents(EVENTS, '2026-12-21')).toHaveLength(0);
    expect(todayInMorges(new Date('2026-12-20T23:30:00Z'))).toBe('2026-12-21'); // already the 21st in Zurich
  });

  it('has a featured story and no unverified "then and now" pairs', () => {
    expect(featuredStory().id).toBe('port-bernois');
    expect(THEN_AND_NOW).toEqual([]);
  });
});
