/**
 * Structured data (schema.org, JSON-LD) so search engines understand what each page describes:
 * the site itself, each place (with its position and address), events and stories.
 * Only facts already shown on the page are included (not the email address: it stays hidden from harvesters).
 */
import { getLang, localized, textOf } from '../i18n/index.js';
import { getPlace } from '../data/places.js';
import { SITE_URL } from './config.js';
import { pageHref, placePageHref, storyHref, photoPageHref } from './links.js';
import { shownPhotos } from '../data/viewpoints.js';
import heroManifest from '../data/hero-manifest.json' with { type: 'json' };

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const abs = (href) => `${SITE_URL}${href}`;

/** <script type="application/ld+json">; "<" is escaped so the data can never close the tag. */
export function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const shareImage = () => {
  const image = heroManifest.crops?.og?.files.jpg[0];
  return image ? abs(image.src) : undefined;
};

const MORGES = {
  '@type': 'City',
  name: 'Morges',
  address: { '@type': 'PostalAddress', addressLocality: 'Morges', addressRegion: 'VD', addressCountry: 'CH' },
};

/** "Place de l’Hôtel-de-Ville 1, 1110 Morges" → PostalAddress. */
function postalAddress(address) {
  const match = address && address.match(/^(.*),\s*(\d{4})\s+(.+)$/);
  if (!match) return { '@type': 'PostalAddress', addressLocality: 'Morges', postalCode: '1110', addressCountry: 'CH' };
  return { '@type': 'PostalAddress', streetAddress: match[1], postalCode: match[2], addressLocality: match[3], addressCountry: 'CH' };
}

/** Questions and answers of the visit page (only the text shown on the page). */
export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: getLang(),
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** Home page: the site and its publisher. */
export function websiteSchema(description) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'Morges.info',
        url: `${SITE_URL}/`,
        logo: abs('/icon-512.png'),
        areaServed: MORGES,
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        name: 'Morges.info',
        url: `${SITE_URL}/`,
        description,
        inLanguage: ['fr', 'en', 'de', 'it'],
        publisher: { '@id': ORG_ID },
        about: MORGES,
      },
    ],
  };
}

const PLACE_TYPES = {
  heritage: 'LandmarksOrHistoricalBuildings',
  religious: 'PlaceOfWorship',
  sport: 'SportsActivityLocation',
  transport: 'Place',
};

/** A place: name, description, position, address, and its Wikidata/Wikipedia pages when cited. */
export function placeSchema(place) {
  const lang = getLang();
  const sameAs = [...(place.factSources || []), ...(place.geo.sources || [])]
    .map((s) => s.url)
    .filter((url) => url && /wikidata\.org|wikipedia\.org/.test(url));
  return {
    '@context': 'https://schema.org',
    '@type': PLACE_TYPES[place.category] || 'TouristAttraction',
    name: localized(place.name),
    description: localized(place.description),
    url: abs(placePageHref(place.id, lang)),
    inLanguage: lang,
    ...(place.coordinates && {
      geo: { '@type': 'GeoCoordinates', latitude: place.coordinates.lat, longitude: place.coordinates.lng },
    }),
    address: postalAddress(place.address),
    containedInPlace: MORGES,
    ...(place.photos?.[0] && { image: abs(place.photos[0].src) }),
    ...(sameAs.length && { sameAs: [...new Set(sameAs)] }),
    ...(place.website && { mainEntityOfPage: place.website }),
  };
}

/** Breadcrumb trail shown at the top of a page. @param {{name: string, href: string}[]} items */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: abs(item.href) })),
  };
}

/** An upcoming event (only events with a known place and dates are listed on the site). */
export function eventSchema(event) {
  const lang = getLang();
  const place = event.placeId && getPlace(event.placeId);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: localized(event.title),
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...((event.summary || event.hours) && { description: [event.summary, event.hours].filter(Boolean).map(localized).join(' ') }),
    url: abs(`${pageHref('life', lang)}#event-${event.id}`),
    image: shareImage(),
    location: place
      ? {
          '@type': 'Place',
          name: localized(place.name),
          address: postalAddress(place.address),
          ...(place.coordinates && {
            geo: { '@type': 'GeoCoordinates', latitude: place.coordinates.lat, longitude: place.coordinates.lng },
          }),
        }
      : MORGES,
  };
}

/** A story (article) written by Morges.info. */
export function storySchema(story) {
  const lang = getLang();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: textOf(story.title),
    description: textOf(story.summary),
    datePublished: story.published,
    inLanguage: lang,
    url: abs(storyHref(story.id, lang)),
    image: shareImage(),
    author: { '@type': 'Organization', name: 'Morges.info', url: `${SITE_URL}/` },
    publisher: { '@type': 'Organization', name: 'Morges.info', logo: { '@type': 'ImageObject', url: abs('/icon-512.png') } },
    about: MORGES,
  };
}

const RIGHTS_URL = { 'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/', 'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/', CC0: 'https://creativecommons.org/publicdomain/zero/1.0/' };

/** The photos of a viewpoint (ImageObject: where and when it was taken, author, credit, licence). */
export function viewpointSchema(vp) {
  const lang = getLang();
  const url = abs(photoPageHref(vp.id, lang));
  const { then, now, moreThen } = shownPhotos(vp);
  return {
    '@context': 'https://schema.org',
    '@graph': [then, ...(then ? moreThen : []), now].filter(Boolean).map((photo) => ({
      '@type': 'ImageObject',
      name: localized(photo.title),
      ...(photo.caption && { description: localized(photo.caption) }),
      contentUrl: abs(photo.image.src),
      width: photo.image.width,
      height: photo.image.height,
      url,
      dateCreated: photo.date.value,
      ...(photo.creator && { creator: { '@type': 'Person', name: photo.creator } }),
      creditText: photo.rights.credit,
      copyrightNotice: photo.rights.credit,
      ...((photo.rights.licenceUrl || RIGHTS_URL[photo.rights.licence]) && { license: photo.rights.licenceUrl || RIGHTS_URL[photo.rights.licence] }),
      acquireLicensePage: photo.source.url || abs(pageHref('contribute', lang)),
      contentLocation: {
        '@type': 'Place',
        name: localized(vp.location),
        geo: { '@type': 'GeoCoordinates', latitude: vp.coordinates.lat, longitude: vp.coordinates.lng },
        containedInPlace: MORGES,
      },
    })),
  };
}
