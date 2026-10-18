import { getPage, placePageId } from './config.js';

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

/** Link to a story (anchor on the stories page). */
export function storyHref(storyId, lang) {
  return `${getPage('stories').path}${langQuery(lang)}#${storyId}`;
}
