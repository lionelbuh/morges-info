/**
 * Vite plugin for the multi-page site (no extra dependency):
 *  - replaces <!--@head:id-->, <!--@header:id-->, <!--@main:id-->, <!--@footer:id-->
 *    in each HTML page with the French prerender, so search engines and
 *    visitors without JavaScript get real content;
 *  - emits sitemap.xml, robots.txt and llms.txt at build time;
 *  - generates one HTML entry per place (lieux/<id>/index.html, from lieux/index.html) and per published
 *    photo viewpoint (photos/<id>/index.html, from photos/index.html); both git-ignored.
 * In the browser, src/site/client.js re-renders the same markup (language, dates).
 */
import { setLang, LANGUAGES } from '../src/i18n/index.js';
import { renderHeader, renderFooter, renderHeadTags, absoluteUrl } from '../src/site/layout.js';
import { renderMain } from '../src/site/pages.js';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ALL_PAGES, SITE_URL, placePageId, photoPageId } from '../src/site/config.js';
import { PLACES, getPlace } from '../src/data/places.js';
import { publishedViewpoints, getViewpoint, shownPhotos } from '../src/data/viewpoints.js';
import { editorialSelection } from '../src/data/businesses.js';
import { STORIES } from '../src/data/stories.js';
import fr from '../src/i18n/locales/fr.js';

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

/** Photos shown on a page, listed in the sitemap so they can be found in image search. */
function pageImages(page) {
  if (page.viewpointId) {
    const { then, now, moreThen } = shownPhotos(getViewpoint(page.viewpointId));
    return [then, ...(then ? moreThen : []), now].filter(Boolean).map((photo) => photo.image.src);
  }
  if (page.id === 'photos') return publishedViewpoints().map((vp) => (shownPhotos(vp).then || shownPhotos(vp).now).image.src);
  if (page.id === 'businesses') return editorialSelection().flatMap((b) => (b.photos || []).map((photo) => photo.src));
  return [];
}

export function sitemapXml() {
  const urls = ALL_PAGES.filter((p) => p.listed !== false).map((p) => {
    const alternates = LANGUAGES.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(p.id, l).replace(/&/g, '&amp;')}"/>`,
    ).join('\n');
    // lastmod only where a real date is known: the last verification of a place
    const lastmod = p.placeId ? `\n    <lastmod>${getPlace(p.placeId).lastVerified}</lastmod>` : '';
    const images = pageImages(p).map((src) => `\n    <image:image><image:loc>${SITE_URL}${src}</image:loc></image:image>`).join('');
    return `  <url>\n    <loc>${absoluteUrl(p.id, 'fr')}</loc>${lastmod}\n${alternates}${images}\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

/**
 * Assistants' search and training robots, named so the choice is explicit: all are allowed
 * (owner's decision, 2026-11-01). The catch-all rule allows every other robot.
 */
export const AI_CRAWLERS = [
  'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', // OpenAI (ChatGPT)
  'Claude-SearchBot', 'Claude-User', 'ClaudeBot', // Anthropic (Claude)
  'Google-Extended', // Google (Gemini)
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'Applebot-Extended', // Apple
  'CCBot', // Common Crawl
];

export function robotsTxt() {
  const ai = AI_CRAWLERS.map((bot) => `User-agent: ${bot}`).join('\n');
  return `User-agent: *\nAllow: /\n\n# AI assistants (search and training): allowed\n${ai}\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

/** llms.txt (llmstxt.org): a plain summary of the site and its main pages, for AI assistants. */
export function llmsTxt() {
  setLang('fr', { persist: false });
  const line = (id) => `- [${fr.pages[id].title.replace(/ — Morges\.info$/, '')}](${absoluteUrl(id)}): ${fr.pages[id].description}`;
  const main = ['map', 'visit', 'photos', 'places', 'history', 'stories', 'life', 'businesses', 'voices', 'contribute'].map(line);
  const places = PLACES.map((p) => `- [${p.name.fr}](${absoluteUrl(placePageId(p.id))})`);
  const photos = publishedViewpoints().map((vp) => `- [${vp.title.fr}](${absoluteUrl(photoPageId(vp.id))})`);
  const stories = STORIES.map((s) => `- [${s.title.fr}](${SITE_URL}/recits/#${s.id})`);
  return `# Morges.info

> ${fr.pages.home.description}

Site indépendant, non commercial, consacré à la seule commune de Morges (Vaud, Suisse). Il n’est lié ni à la Ville de Morges ni à un parti politique. Chaque information cite sa source ; les photos indiquent leur auteur et leur licence. Contenu en français, aussi en anglais, allemand et italien (paramètre ?lang=en|de|it).

## Pages principales

${main.join('\n')}

## Lieux

${places.join('\n')}

## Photos d’hier et d’aujourd’hui

${photos.join('\n')}

## Récits

${stories.join('\n')}

## À propos

- [${fr.pages.about.title.replace(/ — Morges\.info$/, '')}](${absoluteUrl('about')}): ${fr.pages.about.description}
- Contact : voir ${absoluteUrl('legal')}
`;
}

/**
 * Writes <folder>/<id>/index.html for each item (a copy of <folder>/index.html pointed at the item) and
 * removes folders of items that no longer exist.
 */
function writeItemPages(root, folder, indexId, items) {
  const dir = path.join(root, folder);
  const template = readFileSync(path.join(dir, 'index.html'), 'utf8');
  for (const { id, pageId } of items) {
    const html = template.replaceAll(`:${indexId}-->`, `:${pageId}-->`).replace(`data-page="${indexId}"`, `data-page="${pageId}"`);
    const file = path.join(dir, id, 'index.html');
    if (existsSync(file) && readFileSync(file, 'utf8') === html) continue;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  const ids = new Set(items.map((item) => item.id));
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !ids.has(entry.name)) rmSync(path.join(dir, entry.name), { recursive: true });
  }
}

/** Place pages (lieux/<id>/) and photo pages (photos/<id>/). Run before each build and dev server start. */
export function writePlacePages(root) {
  writeItemPages(root, 'lieux', 'places', PLACES.map((p) => ({ id: p.id, pageId: placePageId(p.id) })));
  writeItemPages(root, 'photos', 'photos', publishedViewpoints().map((vp) => ({ id: vp.id, pageId: photoPageId(vp.id) })));
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
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt() });
    },
  };
}
