/**
 * Shared header, footer and <head> tags. Pure string functions (used for the
 * French prerender at build time) plus applyHead() for the browser.
 */
import { t, getLang, LANGUAGES, localized } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { PAGES, SITE_URL, getPage } from './config.js';
import { emailLink } from './components.js';
import heroManifest from '../data/hero-manifest.json' with { type: 'json' };
import { HERO_PHOTO } from '../data/photos.js';
import { pageHref } from './links.js';
import { formatToday } from './format.js';

const NATIVE_NAMES = { fr: 'Français', en: 'English', de: 'Deutsch', it: 'Italiano' };
const OG_LOCALES = { fr: 'fr_CH', en: 'en_GB', de: 'de_CH', it: 'it_CH' };

const BRAND_MARK = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <rect x="1" y="1" width="38" height="38" rx="9" fill="#da291c" />
  <path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z" fill="#fff" />
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
  // On the home page the tagline is already the page title.
  const tagline = pageId === 'home' ? '' : `<span class="brand-tagline">${e(t('site.tagline'))}</span>`;

  return `<a class="skip-link" href="#main">${e(t('site.skipToContent'))}</a>
<header class="site-header site-header--${masthead ? 'masthead' : 'compact'}" id="site-header">
  ${dateline}
  <a class="brand" href="${pageHref('home', lang)}" aria-label="${e(t('site.home'))}">
    ${BRAND_MARK}
    <span class="brand-text">
      <span class="brand-name">Morges<span class="brand-dot">.info</span></span>
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
  const links = PAGES.filter((p) => p.id !== 'home')
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

/** <head> tags for a page (prerendered in French; updated by applyHead in the browser). */
export function renderHeadTags(pageId) {
  const lang = getLang();
  const title = t(`pages.${pageId}.title`);
  const description = t(`pages.${pageId}.description`);
  const alternates = LANGUAGES.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${absoluteUrl(pageId, l)}" />`,
  ).join('\n    ');
  return `<title>${e(title)}</title>
    <meta name="description" content="${e(description)}" />
    <link rel="canonical" href="${absoluteUrl(pageId, lang)}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(pageId, 'fr')}" />
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
  getPage(pageId);
  document.documentElement.lang = lang;
  document.title = t(`pages.${pageId}.title`);
  const set = (selector, attr, value) => document.querySelector(selector)?.setAttribute(attr, value);
  set('meta[name="description"]', 'content', t(`pages.${pageId}.description`));
  set('link[rel="canonical"]', 'href', absoluteUrl(pageId, lang));
  set('meta[property="og:title"]', 'content', t(`pages.${pageId}.title`));
  set('meta[property="og:description"]', 'content', t(`pages.${pageId}.description`));
  set('meta[property="og:url"]', 'content', absoluteUrl(pageId, lang));
  set('meta[property="og:locale"]', 'content', OG_LOCALES[lang]);
  set('meta[property="og:image:alt"]', 'content', localized(HERO_PHOTO.alt));
}
