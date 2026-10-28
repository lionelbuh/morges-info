import { getPage, placePageId, photoPageId } from './config.js';

const langQuery = (lang) => (lang && lang !== 'fr' ? `?lang=${lang}` : '');

/** Internal link to a page, keeping the chosen language in the URL (French needs no parameter). */
export function pageHref(id, lang) {
  return `${getPage(id).path}${langQuery(lang)}`;
}

/** Link to a place on the map page. */
export function placeHref(placeId, lang) {
  return `${getPage('map').path}${langQuery(lang)}#${placeId}`;
}

/** Link to the page of a place (/lieux/<id>/). */
export function placePageHref(placeId, lang) {
  return pageHref(placePageId(placeId), lang);
}

/** Link to the page of a photo-map viewpoint (/photos/<id>/). */
export function photoPageHref(viewpointId, lang) {
  return pageHref(photoPageId(viewpointId), lang);
}

/** A viewpoint opened on the map (photo mode). */
export function photoMapHref(viewpointId, lang) {
  return `${getPage('map').path}${langQuery(lang)}#${viewpointId}`;
}

/** Link to a story (anchor on the stories page). */
export function storyHref(storyId, lang) {
  return `${getPage('stories').path}${langQuery(lang)}#${storyId}`;
}

/**
 * Directions to a place in Google Maps and Apple Plans (plain links: nothing is loaded from Google
 * or Apple until the visitor clicks). `name` helps Apple show the destination.
 */
export function directionsLinks(coordinates, name) {
  // { query } instead of coordinates: an address, for places not yet positioned on the map
  const target = coordinates.query ? encodeURIComponent(coordinates.query) : `${coordinates.lat},${coordinates.lng}`;
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${target}`,
    apple: `https://maps.apple.com/?daddr=${target}&q=${encodeURIComponent(name)}`,
  };
}
