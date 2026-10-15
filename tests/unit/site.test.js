import { describe, it, expect, beforeEach } from 'vitest';
import { setLang, MESSAGES, LANGUAGES } from '../../src/i18n/index.js';
import { PAGES } from '../../src/site/config.js';
import { renderMain, CONTENT_PAGE_IDS } from '../../src/site/pages.js';
import { renderHeader, renderHeadTags } from '../../src/site/layout.js';
import { pageHref, placeHref } from '../../src/site/links.js';
import { renderMarkers, sitemapXml, robotsTxt } from '../../build/site-plugin.js';

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

  it('home hides empty sections (no business yet, no past event)', () => {
    const html = renderMain('home', { today: '2027-01-15' });
    expect(html).not.toContain('home-businesses');
    expect(html).not.toContain('Marché de Noël');
    expect(renderMain('home', { today: '2026-10-15' })).toContain('Marché de Noël');
  });

  it('header marks the current page and offers the four languages', () => {
    const html = renderHeader('history');
    expect(html).toContain('href="/histoire/" aria-current="page"');
    for (const lang of LANGUAGES) expect(html).toContain(`data-lang="${lang}"`);
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
    for (const p of PAGES) expect(sitemap).toContain(`<loc>https://morges.info${p.path}</loc>`);
    expect(robotsTxt()).toContain('Sitemap: https://morges.info/sitemap.xml');
  });
});
