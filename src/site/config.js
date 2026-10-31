/**
 * Site-wide configuration. SITE_URL is used for canonical links, language
 * alternates, Open Graph tags and the sitemap. Change it here if the site is
 * published under another address.
 */
import { PLACES } from '../data/places.js';
import { publishedViewpoints } from '../data/viewpoints.js';

export const SITE_URL = 'https://morges.info';

/** Domains of the live site: audience statistics run only there (never in development or tests). */
export const PRODUCTION_HOSTS = ['morges.info', 'www.morges.info'];

/**
 * Cloudflare Web Analytics site token (Cloudflare dashboard → Web Analytics → morges.info → Manage site,
 * the "token" value of the JS snippet). Empty = statistics off. The token is public by design: it
 * appears in the page of every site that uses the service.
 */
export const ANALYTICS_TOKEN = 'ac0500bf08be48bda435dfb5a0a81ae5';

/**
 * Search-engine ownership checks (optional): paste the code from Google Search Console
 * ("HTML tag" method, content="…") or Bing Webmaster Tools ("meta tag" method). Empty = no tag.
 * A DNS TXT record at Spaceship works too and needs no code change.
 */
export const SEARCH_VERIFICATION = { google: '', bing: '' };

/** Address for readers' messages, news and photos (shown in the footer and on the contribute page). */
export const CONTACT_EMAIL = 'hello@morges.info';

/**
 * "Parole aux Morgiens" form: Web3Forms access key (web3forms.com → enter the address that should
 * receive the messages; the key arrives by email). Empty = the form is shown but closed. The key is
 * public by design: it only lets the form send messages to that address.
 */
export const VOICES_FORM_KEY = '';
export const VOICES_FORM_ENDPOINT = 'https://api.web3forms.com/submit';

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
  { id: 'voices', path: '/parole-aux-morgiens/', nav: true },
  { id: 'contribute', path: '/contribuer/', nav: true },
  { id: 'places', path: '/lieux/', nav: false },
  { id: 'photos', path: '/photos/', nav: false },
  { id: 'visit', path: '/visiter/', nav: false },
  { id: 'about', path: '/a-propos/', nav: false },
  { id: 'us', path: '/qui-sommes-nous/', nav: false },
  { id: 'legal', path: '/mentions-legales/', nav: false },
  { id: 'notfound', path: '/404.html', nav: false, listed: false },
];

/** Each place also has its own page, /lieux/<id>/ (page id "place:<id>"), generated from the data. */
export const placePageId = (placeId) => `place:${placeId}`;
/** …and each published viewpoint of the photo map, /photos/<id>/ (page id "photo:<id>"). */
export const photoPageId = (viewpointId) => `photo:${viewpointId}`;

export function getPage(id) {
  if (id.startsWith('place:')) {
    const placeId = id.slice('place:'.length);
    if (!PLACES.some((p) => p.id === placeId)) throw new Error(`Unknown place page: ${id}`);
    return { id, path: `/lieux/${placeId}/`, nav: false, placeId };
  }
  if (id.startsWith('photo:')) {
    const viewpointId = id.slice('photo:'.length);
    if (!publishedViewpoints().some((vp) => vp.id === viewpointId)) throw new Error(`Unknown photo page: ${id}`);
    return { id, path: `/photos/${viewpointId}/`, nav: false, viewpointId };
  }
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page: ${id}`);
  return page;
}

/** Every page of the site, place pages included (sitemap, build inputs). */
export const ALL_PAGES = [
  ...PAGES,
  ...PLACES.map((p) => getPage(placePageId(p.id))),
  ...publishedViewpoints().map((vp) => getPage(photoPageId(vp.id))),
];
