import { describe, it, expect, beforeEach } from 'vitest';
import { setLang, MESSAGES, LANGUAGES } from '../../src/i18n/index.js';
import { PAGES } from '../../src/site/config.js';
import { renderMain, CONTENT_PAGE_IDS } from '../../src/site/pages.js';
import { renderHeader, renderHeadTags } from '../../src/site/layout.js';
import { pageHref, placeHref } from '../../src/site/links.js';
import { formatToday } from '../../src/site/format.js';
import { renderMarkers, sitemapXml, robotsTxt, llmsTxt, AI_CRAWLERS } from '../../build/site-plugin.js';

describe('site pages', () => {
  beforeEach(() => setLang('fr', { persist: false }));

  it('every page has a title and description in all four languages', () => {
    for (const lang of LANGUAGES) {
      for (const p of PAGES) {
        expect(MESSAGES[lang].pages[p.id].title, `${lang}.${p.id}`).toMatch(/Morges/);
        expect(MESSAGES[lang].pages[p.id].description.length, `${lang}.${p.id}`).toBeGreaterThan(40);
      }
    }
  });

  it('every listed page has a navigation label (footer) in all four languages', () => {
    for (const lang of LANGUAGES) {
      for (const p of PAGES.filter((x) => x.id !== 'home' && x.listed !== false)) {
        expect(MESSAGES[lang].nav[p.id], `${lang}.nav.${p.id}`).toBeTruthy();
      }
    }
  });

  it('page titles are unique', () => {
    const titles = PAGES.map((p) => MESSAGES.fr.pages[p.id].title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('links keep the language (none for French)', () => {
    expect(pageHref('history', 'fr')).toBe('/histoire/');
    expect(pageHref('history', 'de')).toBe('/histoire/?lang=de');
    expect(placeHref('port', 'it')).toBe('/carte/?lang=it#port');
  });

  it.each(CONTENT_PAGE_IDS)('%s renders exactly one h1 in every language', (id) => {
    for (const lang of LANGUAGES) {
      setLang(lang, { persist: false });
      const html = renderMain(id, { today: '2026-10-15' });
      expect(html.match(/<h1[\s>]/g), `${id} ${lang}`).toHaveLength(1);
      expect(html).not.toMatch(/undefined|\[object Object\]/);
      // no raw translation keys leaked into the page
      expect(html).not.toMatch(/>\s*(home|common|businesses|history|life|stories|about|nav|site)\.[a-zA-Z.]+\s*</);
    }
  });

  it('home shows the businesses and hides past events', () => {
    const html = renderMain('home', { today: '2027-01-15' });
    expect(html).toContain('home-businesses');
    expect(html).not.toContain('Marché de Noël');
    expect(renderMain('home', { today: '2026-11-30' })).toContain('Marché de Noël');
    expect(renderMain('home', { today: '2026-10-15' })).toContain('Zip Zap Circus'); // the next two events
  });

  it('header marks the current page and offers the four languages', () => {
    const html = renderHeader('history');
    expect(html).toContain('href="/histoire/" aria-current="page"');
    for (const lang of LANGUAGES) expect(html).toContain(`data-lang="${lang}"`);
  });

  it('content pages get the newspaper masthead, the map page a compact bar', () => {
    const page = renderHeader('history');
    expect(page).toContain('site-header--masthead');
    expect(page).toContain('Fondée vers 1286');
    const map = renderHeader('map');
    expect(map).toContain('site-header--compact');
    expect(map).not.toContain('masthead-dateline');
  });

  it('the brand mark is the flag of Morges, not the Swiss cross', () => {
    for (const page of ['home', 'map']) {
      const html = renderHeader(page);
      expect(html).toContain('class="brand-mark"');
      expect(html).toContain('#d52b1e');
      expect(html).not.toContain('M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z'); // the Swiss cross
    }
  });

  it('header: the gazette motto sits under the logo, on every page and in every language', () => {
    const mottos = { fr: 'La gazette indépendante de Morges', en: 'The independent gazette of Morges', de: 'Das unabhängige Lokalblatt von Morges', it: 'La gazzetta indipendente di Morges' };
    for (const lang of LANGUAGES) {
      setLang(lang);
      for (const page of ['home', 'map', 'history', 'place:chateau']) {
        expect(renderHeader(page)).toMatch(new RegExp(`brand-dot">\\.info</span></span>\\s*<span class="brand-motto">${mottos[lang]}</span>`));
      }
    }
    setLang('fr');
    expect(renderHeader('home')).not.toContain('brand-tagline'); // the home page title already says it
  });

  it('dateline: today in Morges, in each language', () => {
    const day = new Date('2026-10-17T10:00:00Z');
    expect(formatToday('fr', day)).toBe('samedi 17 octobre 2026');
    expect(formatToday('de', day)).toBe('Samstag, 17. Oktober 2026');
    expect(formatToday('it', day)).toBe('sabato 17 ottobre 2026');
    expect(formatToday('en', day)).toMatch(/^Saturday,? 17 October 2026$/);
    expect(formatToday('fr', new Date('2026-10-17T22:30:00Z'))).toBe('dimanche 18 octobre 2026'); // Swiss time
  });

  it('head tags include canonical, language alternates and x-default', () => {
    const head = renderHeadTags('life');
    expect(head).toContain('<link rel="canonical" href="https://morges.info/vie-locale/" />');
    for (const lang of ['en', 'de', 'it']) expect(head).toContain(`hreflang="${lang}" href="https://morges.info/vie-locale/?lang=${lang}"`);
    expect(head).toContain('hreflang="x-default"');
  });

  it('build plugin replaces every marker and produces sitemap and robots', () => {
    const html = renderMarkers('<!--@head:about--><!--@header:about--><!--@main:about--><!--@footer:about-->');
    expect(html).not.toContain('<!--@');
    expect(html).toContain('<h1>');
    const sitemap = sitemapXml();
    for (const p of PAGES.filter((x) => x.listed !== false)) expect(sitemap).toContain(`<loc>https://morges.info${p.path}</loc>`);
    expect(sitemap).not.toContain('404');
    expect(robotsTxt()).toContain('Sitemap: https://morges.info/sitemap.xml');
    expect(robotsTxt()).not.toContain('Disallow');
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot', 'Google-Extended', 'PerplexityBot']) expect(AI_CRAWLERS).toContain(bot);
    for (const bot of AI_CRAWLERS) expect(robotsTxt()).toContain(`User-agent: ${bot}\n`);
    const llms = llmsTxt();
    expect(llms.startsWith('# Morges.info\n\n> ')).toBe(true);
    expect(llms).toContain('(https://morges.info/parole-aux-morgiens/)');
    expect(llms).toContain('(https://morges.info/lieux/chateau/)');
    expect(llms).toContain('(https://morges.info/photos/vue-port-jetee/)');
    expect(llms).toContain('(https://morges.info/recits/#stravinsky-morges)');
  });
});
