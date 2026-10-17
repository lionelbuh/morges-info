/**
 * Site-wide configuration. SITE_URL is used for canonical links, language
 * alternates, Open Graph tags and the sitemap. Change it here if the site is
 * published under another address.
 */
export const SITE_URL = 'https://morges.info';

/** Address for readers' messages, news and photos (shown in the footer and on the contribute page). */
export const CONTACT_EMAIL = 'hello@morges.info';

/** Pages and their clean French URLs. `nav` = shown in the main navigation. */
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
];

export function getPage(id) {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
}
