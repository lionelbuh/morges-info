/**
 * Site-wide configuration. SITE_URL is used for canonical links, language
 * alternates, Open Graph tags and the sitemap. Change it here if the site is
 * published under another address.
 */
export const SITE_URL = 'https://morges.info';

/** Domains of the live site: audience statistics run only there (never in development or tests). */
export const PRODUCTION_HOSTS = ['morges.info', 'www.morges.info'];

/**
 * Cloudflare Web Analytics site token (Cloudflare dashboard → Web Analytics → morges.info → Manage site,
 * the "token" value of the JS snippet). Empty = statistics off. The token is public by design: it
 * appears in the page of every site that uses the service.
 */
export const ANALYTICS_TOKEN = 'ac0500bf08be48bda435dfb5a0a81ae5';

/** Address for readers' messages, news and photos (shown in the footer and on the contribute page). */
export const CONTACT_EMAIL = 'hello@morges.info';

/**
 * Pages and their clean French URLs. `nav` = shown in the main navigation;
 * `listed: false` = left out of the footer and the sitemap (the 404 page, served by the host for unknown addresses).
 */
export const PAGES = [
  { id: 'home', path: '/', nav: false },
  { id: 'map', path: '/carte/', nav: true },
  { id: 'businesses', path: '/commerces/', nav: true },
  { id: 'history', path: '/histoire/', nav: true },
  { id: 'life', path: '/vie-locale/', nav: true },
  { id: 'stories', path: '/recits/', nav: true },
  { id: 'contribute', path: '/contribuer/', nav: true },
  { id: 'about', path: '/a-propos/', nav: false },
  { id: 'us', path: '/qui-sommes-nous/', nav: false },
  { id: 'legal', path: '/mentions-legales/', nav: false },
  { id: 'notfound', path: '/404.html', nav: false, listed: false },
];

export function getPage(id) {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
}
