import { describe, it, expect, beforeEach } from 'vitest';
import { setLang, LANGUAGES } from '../../src/i18n/index.js';
import { ADVENT_DOORS, ADVENT_GRID, adventTarget, adventDate, isOpenable } from '../../src/data/advent.js';
import { renderAdvent, adventDoorContent, adventHomeBanner, adventDefaultDay } from '../../src/site/advent.js';
import { renderMain } from '../../src/site/pages.js';
import { escapeHtml } from '../../src/ui/dom.js';

describe('Advent calendar', () => {
  beforeEach(() => setLang('fr', { persist: false }));

  it('has one door for each day from 1 to 24, all on the grid once', () => {
    expect(ADVENT_DOORS.map((d) => d.day)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    expect([...ADVENT_GRID].sort((a, b) => a - b)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it('every door has its hook in the four languages and points to existing content', () => {
    for (const door of ADVENT_DOORS) {
      for (const lang of LANGUAGES) expect(door.hook[lang], `${door.day}.${lang}`).toBeTruthy();
      expect(() => adventTarget(door)).not.toThrow();
    }
  });

  it('a door opens from its own day, in Morges', () => {
    expect(adventDate(5)).toBe('2026-12-05');
    expect(isOpenable(5, '2026-12-04')).toBe(false);
    expect(isOpenable(5, '2026-12-05')).toBe(true);
    expect(isOpenable(5, '2027-01-03')).toBe(true);
  });

  it('every door renders in every language, with a link or a greeting', () => {
    for (const lang of LANGUAGES) {
      setLang(lang, { persist: false });
      for (const door of ADVENT_DOORS) {
        const html = adventDoorContent(door);
        expect(html, `${lang} ${door.day}`).toContain(escapeHtml(door.hook[lang]));
        expect(html).toMatch(/href="/);
      }
    }
  });

  it('before December, all the doors are locked and nothing is revealed', () => {
    const html = renderAdvent({ today: '2026-11-20' });
    expect(html.match(/class="advent-door/g)).toHaveLength(24);
    expect(html.match(/is-locked/g)).toHaveLength(24);
    expect(html).toContain('La première case s’ouvre le 1er décembre');
    expect(adventDefaultDay('2026-11-20')).toBe(null);
  });

  it('on 5 December, doors 1 to 5 open and today’s door is shown', () => {
    const html = renderAdvent({ today: '2026-12-05', opened: [1, 2] });
    expect(html.match(/is-openable/g)).toHaveLength(5);
    expect(html).toContain('data-day="5" aria-controls');
    expect(html).toMatch(/advent-door is-openable is-today[^"]*" data-day="5"/);
    expect(html).toMatch(/is-open" data-day="1"|is-open" data-day="2"/);
    expect(html).toContain('Une pause au chaud ? Direction le lykke.');
    expect(renderMain('advent', { today: '2026-12-05' })).toContain('id="advent-panel"');
  });

  it('after Christmas, every door stays open', () => {
    const html = renderAdvent({ today: '2026-12-28' });
    expect(html.match(/is-openable/g)).toHaveLength(24);
    expect(html).toContain('Joyeux Noël de la part de Gaston');
  });

  it('the home page announces the calendar from 25 November to 24 December', () => {
    expect(adventHomeBanner('2026-11-20')).toBe('');
    expect(adventHomeBanner('2026-11-26')).toContain('Dès le 1er décembre');
    expect(adventHomeBanner('2026-12-03')).toContain('/calendrier-avent/#case-3');
    expect(adventHomeBanner('2026-12-25')).toBe('');
    expect(renderMain('home', { today: '2026-12-03' })).toContain('id="home-advent"');
    expect(renderMain('home', { today: '2026-11-20' })).not.toContain('id="home-advent"');
  });
});
