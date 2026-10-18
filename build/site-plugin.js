/**
 * Vite plugin for the multi-page site (no extra dependency):
 *  - replaces <!--@head:id-->, <!--@header:id-->, <!--@main:id-->, <!--@footer:id-->
 *    in each HTML page with the French prerender, so search engines and
 *    visitors without JavaScript get real content;
 *  - emits sitemap.xml and robots.txt at build time;
 *  - generates one HTML entry per place (lieux/<id>/index.html, from lieux/index.html; git-ignored).
 * In the browser, src/site/client.js re-renders the same markup (language, dates).
 */
import { setLang, LANGUAGES } from '../src/i18n/index.js';
import { renderHeader, renderFooter, renderHeadTags, absoluteUrl } from '../src/site/layout.js';
import { renderMain } from '../src/site/pages.js';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_PAGES, SITE_URL, placePageId } from '../src/site/config.js';
import { PLACES, getPlace } from '../src/data/places.js';

const MARKER = /<!--@(head|header|main|footer):([a-z]+(?::[a-z0-9-]+)?)-->/g;

export function renderMarkers(html) {
  setLang('fr', { persist: false });
  return html.replace(MARKER, (_, part, pageId) => {
    if (part === 'head') return renderHeadTags(pageId);
    if (part === 'header') return renderHeader(pageId);
    if (part === 'footer') return renderFooter(pageId);
    return renderMain(pageId);
  });
}

export function sitemapXml() {
  const urls = ALL_PAGES.filter((p) => p.listed !== false).map((p) => {
    const alternates = LANGUAGES.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(p.id, l).replace(/&/g, '&amp;')}"/>`,
    ).join('\n');
    // lastmod only where a real date is known: the last verification of a place
    const lastmod = p.placeId ? `\n    <lastmod>${getPlace(p.placeId).lastVerified}</lastmod>` : '';
    return `  <url>\n    <loc>${absoluteUrl(p.id, 'fr')}</loc>${lastmod}\n${alternates}\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

/**
 * Writes lieux/<id>/index.html for every place (a copy of lieux/index.html pointed at the place) and
 * removes folders of places that no longer exist. Run before each build and dev server start.
 */
export function writePlacePages(root) {
  const dir = path.join(root, 'lieux');
  const template = readFileSync(path.join(dir, 'index.html'), 'utf8');
  for (const place of PLACES) {
    const id = placePageId(place.id);
    const html = template.replaceAll(':places-->', `:${id}-->`).replace('data-page="places"', `data-page="${id}"`);
    const file = path.join(dir, place.id, 'index.html');
    if (existsSync(file) && readFileSync(file, 'utf8') === html) continue;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  const ids = new Set(PLACES.map((p) => p.id));
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !ids.has(entry.name)) rmSync(path.join(dir, entry.name), { recursive: true });
  }
}

/** HTML entry points, one per page (clean URLs: /carte/ → carte/index.html; /404.html stays a file). */
export function htmlInputs(root) {
  writePlacePages(root);
  return Object.fromEntries(
    ALL_PAGES.map((p) => [p.id.replace(':', '-'), `${root}${p.path}${p.path.endsWith('/') ? 'index.html' : ''}`]),
  );
}

export function morgesSite() {
  return {
    name: 'morges-site',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => renderMarkers(html),
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
    },
  };
}
