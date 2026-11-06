import { describe, it, expect, beforeEach } from 'vitest';
import { PLACES, getPlace } from '../../src/data/places.js';
import { BUSINESSES, validateBusiness, editorialSelection, rotateByDay } from '../../src/data/businesses.js';
import { EVENTS, validateEvent, upcomingEvents, todayInMorges, eventsOnDay, featuredEvent } from '../../src/data/events.js';
import { PRACTICAL, OFFICIAL_LINKS, validatePractical } from '../../src/data/practical.js';
import { STORIES, validateStory, featuredStory } from '../../src/data/stories.js';
import { MILESTONES, THEN_AND_NOW, validateMilestone } from '../../src/data/history.js';
import { validatePhoto, validateOpeningHours, validateCommercial, isIsoDate, COMMERCIAL_LISTINGS_ENABLED } from '../../src/data/schema.js';
import { businessCard, businessProfile, textBlock, frenchOnlyNotice, eventCalendar, calendarDayPanel } from '../../src/site/components.js';
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

  it('several photos of a business form a gallery: one large, the others as thumbnails', () => {
    const photo = (n) => ({ src: `/images/businesses/p${n}.webp`, alt: { fr: `Photo ${n}` }, credit: 'Exemple', licence: 'Avec accord' });
    expect(businessProfile(business({ photos: [photo(1)] }))).not.toContain('data-gallery-thumb');
    const html = businessProfile(business({ photos: [photo(1), photo(2)] }));
    expect(html.match(/data-gallery-thumb /g)).toHaveLength(2);
    expect(html).toContain('<img src="/images/businesses/p1.webp" alt="Photo 1"');
    expect(html).toContain('aria-pressed="true"');
  });

  it('a home-visit business shows its service area instead of an address; a notice disappears after its date', () => {
    const area = { fr: 'À domicile, Morges', en: 'At home, Morges', de: 'Zu Hause, Morges', it: 'A domicilio, Morges' };
    const text = (fr) => ({ fr, en: fr, de: fr, it: fr });
    const homeVisits = business({ address: undefined, serviceArea: area, notice: { text: text('Complet à Noël'), until: '2027-01-06' } });
    expect(validateBusiness(homeVisits)).toEqual([]);
    expect(validateBusiness(business({ serviceArea: area })).join()).toMatch(/either an address or a serviceArea/);
    expect(validateBusiness(business({ address: undefined })).join()).toMatch(/1110 Morges/);
    expect(businessProfile(homeVisits, { today: '2026-12-01' })).toContain('À domicile, Morges');
    expect(businessProfile(homeVisits, { today: '2026-12-01' })).toContain('Complet à Noël');
    expect(businessProfile(homeVisits, { today: '2027-01-07' })).not.toContain('Complet à Noël');
    expect(businessProfile(homeVisits)).not.toContain('google.com/maps'); // no address: no directions
  });

  it('checks phone and e-mail formats', () => {
    expect(validateBusiness(business({ phone: '+41 78 606 20 81', email: 'info@exemple.ch' }))).toEqual([]);
    expect(validateBusiness(business({ phone: '078 606 20 81' })).join()).toMatch(/phone/);
    expect(validateBusiness(business({ email: 'pas-un-mail' })).join()).toMatch(/email/);
    expect(validateBusiness(business({ instagram: 'https://www.instagram.com/exemple/' }))).toEqual([]);
    expect(validateBusiness(business({ instagram: 'https://exemple.ch' })).join()).toMatch(/instagram/);
    expect(validateBusiness(business({ facebook: 'https://www.facebook.com/profile.php?id=123' }))).toEqual([]);
    expect(validateBusiness(business({ facebook: 'https://exemple.ch' })).join()).toMatch(/facebook/);
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
    expect(businessProfile(sponsored)).toContain('Contenu sponsorisé');
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
    expect(upcomingEvents(EVENTS, '2026-11-01')[0].id).toBe('beausobre-zip-zap-circus-2026'); // the first event in November
    expect(upcomingEvents(EVENTS, '2026-11-30').map((e) => e.id)).toEqual(['marche-de-noel-2026']);
    expect(upcomingEvents(EVENTS, '2026-12-20')).toHaveLength(1); // last day still listed
    expect(upcomingEvents(EVENTS, '2026-12-21')).toHaveLength(0);
    expect(todayInMorges(new Date('2026-12-20T23:30:00Z'))).toBe('2026-12-21'); // already the 21st in Zurich
  });

  it('businesses: a different one comes first each day, the others in the same order', () => {
    const list = ['a', 'b', 'c'];
    expect(rotateByDay(list, '2026-11-04')).toEqual(['b', 'c', 'a']);
    expect(rotateByDay(list, '2026-11-05')).toEqual(['c', 'a', 'b']);
    expect(rotateByDay(list, '2026-11-06')).toEqual(['a', 'b', 'c']);
    expect(new Set(['2026-11-04', '2026-11-05', '2026-11-06'].map((d) => rotateByDay(list, d)[0])).size).toBe(3);
    expect(rotateByDay([], '2026-11-04')).toEqual([]);
  });

  it('an event with opening days is only on the days it is open; the featured one comes first', () => {
    const market = EVENTS.find((e) => e.id === 'marche-de-noel-2026');
    expect(eventsOnDay(EVENTS, '2026-12-05')).toEqual([market]); // a Saturday
    expect(eventsOnDay(EVENTS, '2026-12-07')).toEqual([]); // a Monday: closed
    expect(eventsOnDay(EVENTS, '2026-12-21')).toEqual([]); // after the end
    expect(featuredEvent(EVENTS, '2026-11-04')).toBe(market);
    expect(featuredEvent(EVENTS, '2026-12-21')).toBeNull();
    expect(validateEvent({ ...market, weekHours: { ...market.weekHours, mon: ['9h', '17h'] } })).toContain('event(marche-de-noel-2026).weekHours.mon must be null or [\'HH:MM\', \'HH:MM\']');
  });

  it('the calendar shows each month from today to the last event, with a tile per day', () => {
    const html = eventCalendar(upcomingEvents(EVENTS, '2026-11-04'), '2026-11-04');
    expect(html).toContain('novembre 2026');
    expect(html).toContain('décembre 2026');
    expect(html).not.toContain('janvier 2027');
    expect(html).toContain('data-day="2026-12-05"');
    expect(html).not.toContain('data-day="2026-12-07"'); // closed on Mondays
    expect(html).toMatch(/class="cal-day is-today has-events" href="#event-beausobre-zip-zap-circus-2026" data-day="2026-11-04" aria-current="date"/);
    expect(eventCalendar([], '2026-12-21')).toBe('');
    const panel = calendarDayPanel('2026-12-06', EVENTS);
    expect(panel).toContain('dimanche 6 décembre 2026');
    expect(panel).toContain('10 h – 20 h · Château de Morges');
    // an evening event at a venue without a page here: its time and the venue's name
    expect(calendarDayPanel('2026-11-06', EVENTS)).toContain('20 h – 22 h · Lykke Concept Store');
    expect(calendarDayPanel('2026-11-14', EVENTS)).toContain('16 h – 18 h · Villa privée à Morges'); // a private home: no address
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
    expect(featuredStory().id).toBe('stravinsky-morges');
    expect(STORIES.find((s) => s.id === 'port-bernois').archived).toBe(true);
    expect(THEN_AND_NOW).toEqual([]);
  });
});
