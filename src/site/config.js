/**
 * Site-wide configuration. SITE_URL is used for canonical links, language
 * alternates, Open Graph tags and the sitemap. Change it here if the site is
 * published under another address.
 */
export const SITE_URL = 'https://morges.info';

/** Pages and their clean French URLs. `nav` = shown in the main navigation. */
export const PAGES = [
  { id: 'home', path: '/', nav: false },
  { id: 'map', path: '/carte/', nav: true },
  { id: 'businesses', path: '/commerces/', nav: true },
  { id: 'history', path: '/histoire/', nav: true },
  { id: 'life', path: '/vie-locale/', nav: true },
  { id: 'stories', path: '/recits/', nav: true },
  { id: 'about', path: '/a-propos/', nav: false },
];

export function getPage(id) {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
}
