/**
 * Vite plugin for the multi-page site (no extra dependency):
 *  - replaces <!--@head:id-->, <!--@header:id-->, <!--@main:id-->, <!--@footer:id-->
 *    in each HTML page with the French prerender, so search engines and
 *    visitors without JavaScript get real content;
 *  - emits sitemap.xml and robots.txt at build time.
 * In the browser, src/site/client.js re-renders the same markup (language, dates).
 */
import { setLang, LANGUAGES } from '../src/i18n/index.js';
import { renderHeader, renderFooter, renderHeadTags, absoluteUrl } from '../src/site/layout.js';
import { renderMain } from '../src/site/pages.js';
import { PAGES, SITE_URL } from '../src/site/config.js';

const MARKER = /<!--@(head|header|main|footer):([a-z]+)-->/g;

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
  const urls = PAGES.filter((p) => p.listed !== false).map((p) => {
    const alternates = LANGUAGES.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(p.id, l).replace(/&/g, '&amp;')}"/>`,
    ).join('\n');
    return `  <url>\n    <loc>${absoluteUrl(p.id, 'fr')}</loc>\n${alternates}\n  </url>`;
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

/** HTML entry points, one per page (clean URLs: /carte/ → carte/index.html; /404.html stays a file). */
export function htmlInputs(root) {
  return Object.fromEntries(PAGES.map((p) => [p.id, `${root}${p.path}${p.path.endsWith('/') ? 'index.html' : ''}`]));
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
