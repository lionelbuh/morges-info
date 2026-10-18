/**
 * Shared header, footer and <head> tags. Pure string functions (used for the
 * French prerender at build time) plus applyHead() for the browser.
 */
import { t, getLang, LANGUAGES, localized } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { PAGES, SITE_URL, SEARCH_VERIFICATION, getPage } from './config.js';
import { getPlace } from '../data/places.js';
import { emailLink } from './components.js';
import heroManifest from '../data/hero-manifest.json' with { type: 'json' };
import { HERO_PHOTO } from '../data/photos.js';
import { pageHref } from './links.js';
import { formatToday } from './format.js';

const NATIVE_NAMES = { fr: 'Français', en: 'English', de: 'Deutsch', it: 'Italiano' };
const OG_LOCALES = { fr: 'fr_CH', en: 'en_GB', de: 'de_CH', it: 'it_CH' };

/** Flag of Morges (white over red, two counterchanged wavy bands: the Morges and the Bief rivers).
 * Flags of communes may be used by anyone when the use is not misleading (LPAP art. 10);
 * the coat of arms in a shield is reserved for the commune (art. 8), so the flag form is used. */
const BRAND_MARK = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <path d="M0 0h40v20H0z" fill="#fff"/>
  <path d="M0 20h40v20H0z" fill="#d52b1e"/>
  <path d="M0 7.2Q5 5 10 7.2T20 7.2T30 7.2T40 7.2V12.8Q35 15 30 12.8T20 12.8T10 12.8T0 12.8Z" fill="#d52b1e"/>
  <path d="M0 27.2Q5 25 10 27.2T20 27.2T30 27.2T40 27.2V32.8Q35 35 30 32.8T20 32.8T10 32.8T0 32.8Z" fill="#fff"/>
  <path d="M.5.5h39v39H.5z" fill="none" stroke="#1c1b19" stroke-opacity=".35"/>
</svg>`;

export function absoluteUrl(pageId, lang = 'fr') {
  return `${SITE_URL}${pageHref(pageId, lang)}`;
}

export function renderHeader(pageId) {
  const lang = getLang();
  const navItems = PAGES.filter((p) => p.nav)
    .map((p) => {
      const current = p.id === pageId ? ' aria-current="page"' : '';
      return `<li><a href="${pageHref(p.id, lang)}"${current}>${e(t(`nav.${p.id}`))}</a></li>`;
    })
    .join('');
  const langLinks = LANGUAGES.map((l) => {
    const current = l === lang ? ' aria-current="true"' : '';
    return `<a class="lang-btn" href="${pageHref(pageId, l)}" data-lang="${l}" hreflang="${l}" lang="${l}" title="${NATIVE_NAMES[l]}" aria-label="${NATIVE_NAMES[l]}"${current}>${l.toUpperCase()}</a>`;
  }).join('');

  // Content pages get a newspaper masthead; the map page keeps a compact bar.
  const masthead = pageId !== 'map';
  // The date is filled in the browser only, so the prerendered page never shows a stale one.
  const today = typeof window === 'undefined' ? '' : formatToday(lang);
  const dateline = masthead
    ? `<p class="masthead-dateline"><span>${e(t('site.place'))}</span><span class="masthead-date">${e(today)}</span><span>${e(t('site.founded'))}</span></p>`
    : '';
  // On the home page the tagline is already the page title; the map page's compact bar shows only the motto line.
  const tagline = masthead && pageId !== 'home' ? `<span class="brand-tagline">${e(t('site.tagline'))}</span>` : '';

  return `<a class="skip-link" href="#main">${e(t('site.skipToContent'))}</a>
<header class="site-header site-header--${masthead ? 'masthead' : 'compact'}" id="site-header">
  ${dateline}
  <a class="brand" href="${pageHref('home', lang)}" aria-label="${e(t('site.home'))}">
    ${BRAND_MARK}
    <span class="brand-text">
      <span class="brand-name">Morges<span class="brand-dot">.info</span></span>
      <span class="brand-motto">${e(t('site.motto'))}</span>
      ${tagline}
    </span>
  </a>
  <nav class="site-nav" aria-label="${e(t('site.navLabel'))}">
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav-list" aria-label="${e(t('site.menu'))}">
      <span class="nav-toggle-bars" aria-hidden="true"></span><span class="nav-toggle-label">${e(t('site.menu'))}</span>
    </button>
    <ul class="site-nav-list" id="site-nav-list">${navItems}</ul>
  </nav>
  <div class="lang-switcher" role="group" aria-label="${e(t('lang.label'))}">${langLinks}</div>
</header>`;
}

export function renderFooter() {
  const lang = getLang();
  const links = PAGES.filter((p) => p.id !== 'home' && p.listed !== false)
    .map((p) => `<li><a href="${pageHref(p.id, lang)}">${e(t(`nav.${p.id}`))}</a></li>`)
    .join('');
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <p class="footer-name">Morges<span class="brand-dot">.info</span></p>
      <p>${e(t('site.tagline'))}</p>
      <p class="footer-note">${e(t('footer.about'))}</p>
      <p class="footer-contact">${e(t('site.contactLabel'))} ${emailLink()}</p>
    </div>
    <nav aria-label="${e(t('site.footerNavLabel'))}"><ul class="footer-links">${links}</ul></nav>
  </div>
</footer>`;
}

/** Preview image for links shared on social networks and messaging apps. */
function shareImageTags() {
  const image = heroManifest.crops?.og?.files.jpg[0];
  if (!image) return '';
  return `
    <meta property="og:image" content="${SITE_URL}${image.src}" />
    <meta property="og:image:width" content="${image.width}" />
    <meta property="og:image:height" content="${image.height}" />
    <meta property="og:image:alt" content="${e(localized(HERO_PHOTO.alt))}" />
    <meta name="twitter:card" content="summary_large_image" />`;
}

/** Ownership checks for Google / Bing, on the home page only. */
function verificationTags(pageId) {
  if (pageId !== 'home') return '';
  const { google, bing } = SEARCH_VERIFICATION;
  return (
    (google ? `\n    <meta name="google-site-verification" content="${e(google)}" />` : '') +
    (bing ? `\n    <meta name="msvalidate.01" content="${e(bing)}" />` : '')
  );
}

/** Short description for search results: whole words, about 155 characters at most. */
export function summarize(text, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.–—-]+$/u, '')}…`;
}

/** Title and description of a page, in the current language (place pages: from the place data). */
export function pageMeta(pageId) {
  const page = getPage(pageId);
  if (page.placeId) {
    const place = getPlace(page.placeId);
    const name = localized(place.name);
    return {
      title: `${name}${name.includes('Morges') ? '' : ', Morges'} — Morges.info`,
      description: summarize(localized(place.description)),
    };
  }
  return { title: t(`pages.${pageId}.title`), description: t(`pages.${pageId}.description`) };
}

/** <head> tags for a page (prerendered in French; updated by applyHead in the browser). */
export function renderHeadTags(pageId) {
  const lang = getLang();
  const { title, description } = pageMeta(pageId);
  if (getPage(pageId).listed === false) {
    // not a real page: kept out of search results, no canonical address
    return `<title>${e(title)}</title>
    <meta name="description" content="${e(description)}" />
    <meta name="robots" content="noindex" />`;
  }
  const alternates = LANGUAGES.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${absoluteUrl(pageId, l)}" />`,
  ).join('\n    ');
  return `<title>${e(title)}</title>
    <meta name="description" content="${e(description)}" />
    <link rel="canonical" href="${absoluteUrl(pageId, lang)}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(pageId, 'fr')}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />${verificationTags(pageId)}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Morges.info" />
    <meta property="og:title" content="${e(title)}" />
    <meta property="og:description" content="${e(description)}" />
    <meta property="og:url" content="${absoluteUrl(pageId, lang)}" />
    <meta property="og:locale" content="${OG_LOCALES[lang]}" />${shareImageTags()}`;
}

/** Browser: sync <html lang>, title, description, canonical and Open Graph with the language. */
export function applyHead(pageId) {
  const lang = getLang();
  const { title, description } = pageMeta(pageId);
  document.documentElement.lang = lang;
  document.title = title;
  const set = (selector, attr, value) => document.querySelector(selector)?.setAttribute(attr, value);
  set('meta[name="description"]', 'content', description);
  set('link[rel="canonical"]', 'href', absoluteUrl(pageId, lang));
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', description);
  set('meta[property="og:url"]', 'content', absoluteUrl(pageId, lang));
  set('meta[property="og:locale"]', 'content', OG_LOCALES[lang]);
  set('meta[property="og:image:alt"]', 'content', localized(HERO_PHOTO.alt));
}
