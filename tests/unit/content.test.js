import { describe, it, expect, beforeEach } from 'vitest';
import { PLACES, getPlace } from '../../src/data/places.js';
import { BUSINESSES, validateBusiness, editorialSelection } from '../../src/data/businesses.js';
import { EVENTS, validateEvent, upcomingEvents, todayInMorges } from '../../src/data/events.js';
import { PRACTICAL, OFFICIAL_LINKS, validatePractical } from '../../src/data/practical.js';
import { STORIES, validateStory, featuredStory } from '../../src/data/stories.js';
import { MILESTONES, THEN_AND_NOW, validateMilestone } from '../../src/data/history.js';
import { validatePhoto, validateOpeningHours, validateCommercial, isIsoDate, COMMERCIAL_LISTINGS_ENABLED } from '../../src/data/schema.js';
import { businessCard, textBlock, frenchOnlyNotice } from '../../src/site/components.js';
import { setLang } from '../../src/i18n/index.js';

const business = (overrides = {}) => ({
  id: 'exemple',
  name: 'Exemple',
  category: 'shops',
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

  it('published businesses are complete and verified', () => {
    expect(BUSINESSES.length).toBeGreaterThan(0);
    for (const b of BUSINESSES) expect(validateBusiness(b), b.id).toEqual([]);
    expect(new Set(BUSINESSES.map((b) => b.id)).size).toBe(BUSINESSES.length);
  });

  it('several photos of a business become a carousel, shown whole', () => {
    const photo = (n) => ({ src: `/images/businesses/p${n}.webp`, alt: { fr: `Photo ${n}` }, credit: 'Exemple', licence: 'Avec accord' });
    expect(businessCard(business({ photos: [photo(1)] }))).not.toContain('carousel');
    const html = businessCard(business({ photos: [photo(1), photo(2)] }));
    expect(html).toContain('carousel--photos');
    expect(html.match(/carousel-slide/g)).toHaveLength(2);
  });

  it('checks phone and e-mail formats', () => {
    expect(validateBusiness(business({ phone: '+41 78 606 20 81', email: 'info@exemple.ch' }))).toEqual([]);
    expect(validateBusiness(business({ phone: '078 606 20 81' })).join()).toMatch(/phone/);
    expect(validateBusiness(business({ email: 'pas-un-mail' })).join()).toMatch(/email/);
    expect(validateBusiness(business({ instagram: 'https://www.instagram.com/exemple/' }))).toEqual([]);
    expect(validateBusiness(business({ instagram: 'https://exemple.ch' })).join()).toMatch(/instagram/);
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
    for (const s of STORIES) {
      for (const field of ['title', 'summary', 'body']) {
        for (const lang of ['fr', 'en', 'de', 'it']) expect(s[field][lang], `${s.id}.${field}.${lang}`).toBeTruthy();
      }
      // same number of paragraphs in every language
      expect(new Set(['fr', 'en', 'de', 'it'].map((l) => s.body[l].length)).size).toBe(1);
    }
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
    expect(upcomingEvents(EVENTS, '2026-11-01')[0].id).toBe('beausobre-zip-zap-circus-2026'); // Halloween (31 Oct) is over
    expect(upcomingEvents(EVENTS, '2026-11-30').map((e) => e.id)).toEqual(['marche-de-noel-2026']);
    expect(upcomingEvents(EVENTS, '2026-12-20')).toHaveLength(1); // last day still listed
    expect(upcomingEvents(EVENTS, '2026-12-21')).toHaveLength(0);
    expect(todayInMorges(new Date('2026-12-20T23:30:00Z'))).toBe('2026-12-21'); // already the 21st in Zurich
  });

  it('shows French with a notice when a draft story is not translated yet', () => {
    const draft = { title: { fr: 'Titre' }, body: { fr: ['Texte.'] } };
    setLang('de', { persist: false });
    expect(textBlock(draft.title)).toBe('<p lang="fr">Titre</p>');
    expect(frenchOnlyNotice([draft.title, draft.body])).toContain('nur auf Französisch');
    setLang('fr', { persist: false });
    expect(frenchOnlyNotice([draft.title])).toBe('');
  });

  it('has a featured story and no unverified "then and now" pairs', () => {
    expect(featuredStory().id).toBe('port-bernois');
    expect(THEN_AND_NOW).toEqual([]);
  });
});
