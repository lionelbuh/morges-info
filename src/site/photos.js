/**
 * Display of the photo map's viewpoints, shared by the map panel and the photo pages:
 * a single photo with its credit, a before/after comparison when both photos exist, and a call for
 * the missing photo (old or current) with a prefilled email.
 */
import { t, getLang, localized } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { shownPhotos, publishedViewpoints } from '../data/viewpoints.js';
import { getPlace } from '../data/places.js';
import { formatDate } from './format.js';
import { emailLink } from './components.js';
import { pageHref, placePageHref } from './links.js';

const LOCALES = { fr: 'fr-CH', en: 'en-GB', de: 'de-CH', it: 'it-CH' };

/** "1925" + precision → « vers 1925 », « années 1920 », « juin 1925 », « 12 juin 1925 »… */
export function formatPhotoDate(date, lang = getLang()) {
  if (!date) return '';
  if (date.display) return typeof date.display === 'string' ? date.display : localized(date.display);
  const [year, month] = date.value.split('-');
  switch (date.precision) {
    case 'day':
      return formatDate(date.value, lang);
    case 'month':
      return new Intl.DateTimeFormat(LOCALES[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(Date.UTC(Number(year), Number(month) - 1, 15)),
      );
    case 'decade':
      return t('photos.decade', { decade: `${year.slice(0, 3)}0` });
    case 'circa':
      return t('photos.circa', { year });
    default:
      return year;
  }
}

/** Year shown on the comparison labels (decades as "1920s"…). */
const shortDate = (photo) => formatPhotoDate(photo.date);

const licence = ({ licence: name, licenceUrl }) =>
  licenceUrl ? `<a href="${e(licenceUrl)}" target="_blank" rel="noopener license">${e(name)}</a>` : e(name);

/** Credit line under a photo: date · author · source · rights. */
function credit(photo) {
  const source = photo.source.url
    ? `<a href="${e(photo.source.url)}" target="_blank" rel="noopener">${e(photo.source.institution)}</a>`
    : e(photo.source.institution);
  const parts = [
    `<strong>${e(formatPhotoDate(photo.date))}</strong>`,
    photo.creator ? e(photo.creator) : '',
    `${source}${photo.source.reference ? `, ${e(photo.source.reference)}` : ''}`,
    e(photo.rights.credit) + (photo.rights.licence ? ` (${licence(photo.rights)})` : ''),
  ].filter(Boolean);
  return parts.join(' · ');
}

function img(photo, className = '') {
  const { src, width, height } = photo.image;
  return `<img${className ? ` class="${className}"` : ''} src="${e(src)}" width="${width}" height="${height}" alt="${e(localized(photo.title))}" decoding="async" />`;
}

/** One photo with its caption and credit. */
export function photoBlock(photo, role) {
  return `<figure class="vp-photo vp-photo--${role}">
    ${img(photo)}
    <figcaption>
      <span class="vp-role">${e(t(`photos.${role}`))}</span>
      ${photo.caption ? `<span class="vp-caption">${e(localized(photo.caption))}</span>` : ''}
      <span class="vp-credit">${credit(photo)}</span>
    </figcaption>
  </figure>`;
}

/** Before/after: the old photo over the current one, revealed with a slider (keyboard accessible). */
export function compareBlock(then, now) {
  return `<figure class="vp-compare" style="--pos: 50%; aspect-ratio: ${then.image.width} / ${then.image.height}">
    <div class="vp-compare-stage">
      ${img(now, 'vp-compare-now')}
      ${img(then, 'vp-compare-then')}
      <span class="vp-compare-label vp-compare-label--then" aria-hidden="true">${e(shortDate(then))}</span>
      <span class="vp-compare-label vp-compare-label--now" aria-hidden="true">${e(shortDate(now))}</span>
      <span class="vp-compare-handle" aria-hidden="true">‹ ›</span>
      <input class="vp-compare-range" type="range" min="0" max="100" value="50" data-compare aria-label="${e(t('photos.compareLabel'))}" />
    </div>
  </figure>
  <div class="vp-compare-credits">
    <p><span class="vp-role">${e(t('photos.then'))}</span> ${credit(then)}</p>
    <p><span class="vp-role">${e(t('photos.now'))}</span> ${credit(now)}</p>
  </div>`;
}

/** Call for the missing photo: "Photo d'aujourd'hui recherchée" (or the old one). */
export function wantedBlock(vp, missing) {
  const title = localized(vp.title);
  return `<aside class="vp-wanted">
    <h3>${e(t(missing === 'now' ? 'photos.wantedNowTitle' : 'photos.wantedThenTitle'))}</h3>
    <p>${e(t(missing === 'now' ? 'photos.wantedNowText' : 'photos.wantedThenText'))}</p>
    <p>${emailLink({
      label: t('photos.send'),
      subject: `${t(missing === 'now' ? 'photos.mailSubjectNow' : 'photos.mailSubjectThen', { title })} [${vp.id}]`,
      body: t('contribute.mailBody'),
      className: 'btn',
    })}</p>
  </aside>`;
}

/** Badge text: before/after, old photo only, current photo only. */
export function viewpointKind(vp) {
  const { then, now } = shownPhotos(vp);
  return then && now ? 'pair' : then ? 'thenOnly' : 'nowOnly';
}

/** Everything shown for one viewpoint (map panel and photo page). */
export function viewpointBody(vp) {
  const { then, now, moreThen } = shownPhotos(vp);
  const place = vp.placeId && getPlace(vp.placeId);
  // a "no derivatives" licence (CC …-ND) forbids laying the photos over each other: shown one under the other
  const noOverlay = [then, now].some((p) => p && /\bND\b/.test(p.rights.licence || ''));
  const photos =
    then && now
      ? noOverlay
        ? photoBlock(then, 'then') + photoBlock(now, 'now')
        : compareBlock(then, now)
      : then
        ? photoBlock(then, 'then')
        : photoBlock(now, 'now');
  return `${photos}
    ${then ? moreThen.map((photo) => photoBlock(photo, 'then')).join('') : ''}
    ${then && now ? '' : wantedBlock(vp, then ? 'now' : 'then')}
    ${place ? `<p class="vp-place">${e(t('photos.near'))} <a href="${placePageHref(place.id, getLang())}">${e(localized(place.name))}</a></p>` : ''}`;
}

/** Thumbnail card for the gallery. */
export function viewpointCard(vp, href) {
  const { then, now } = shownPhotos(vp);
  const photo = then || now;
  const kind = viewpointKind(vp);
  return `<article class="card vp-card">
    <a class="vp-card-image" href="${href}">${img(photo)}</a>
    <div class="card-body">
      <span class="vp-badge vp-badge--${kind}">${e(t(`photos.kind.${kind}`))}</span>
      <h3 class="card-title"><a href="${href}">${e(localized(vp.title))}</a></h3>
      <p class="card-meta">${e(localized(vp.location))} · ${e([then, now].filter(Boolean).map(shortDate).join(' / '))}</p>
    </div>
  </article>`;
}

/**
 * Old photos taken at a place (viewpoints whose placeId is this place), for the place panel and page;
 * without any, an invitation to send one. `href(vp)` is where each photo leads.
 */
export function placePhotosBlock(placeId, { href, level = 3 }) {
  const viewpoints = publishedViewpoints().filter((vp) => vp.placeId === placeId);
  const h = `h${level}`;
  const items = viewpoints
    .map((vp) => {
      const { then, now } = shownPhotos(vp);
      const photo = then || now;
      return `<li><a class="vp-mini" href="${href(vp)}">${img(photo)}<span class="vp-mini-text"><strong>${e(localized(vp.title))}</strong><span>${e(t(`photos.kind.${viewpointKind(vp)}`))} · ${e([then, now].filter(Boolean).map(shortDate).join(' / '))}</span></span></a></li>`;
    })
    .join('');
  return `<section class="panel-archive" aria-labelledby="archive-title-${placeId}">
    <${h} id="archive-title-${placeId}">${e(t('panel.archiveTitle'))}</${h}>
    ${
      items
        ? `<ul class="vp-mini-list">${items}</ul>`
        : `<p>${e(t('panel.archiveNone'))} <a href="${pageHref('contribute', getLang())}">${e(t('photos.send'))}</a></p>`
    }
  </section>`;
}

/** Photo points on a map: red when old and current photos can be compared, ink otherwise. */
const PHOTO_MARKER = { pair: { color: '#b3121a', icon: '◉' }, single: { color: '#1c1b19', icon: '◉' } };
export const photoMarker = (vp) => ({ ...vp, marker: vp.then && vp.now ? PHOTO_MARKER.pair : PHOTO_MARKER.single });

/** Home page: one old photo (shown whole) with its title and date, leading to it on the map. */
export function homePhotoCard(vp, href) {
  const { then, now } = shownPhotos(vp);
  const photo = then || now;
  return `<a class="home-photo" href="${href}" data-vp-id="${e(vp.id)}">
    ${img(photo)}
    <span class="home-photo-text">
      <span class="vp-role">${e(t(`photos.${then ? 'then' : 'now'}`))} · ${e(shortDate(photo))}</span>
      <strong>${e(localized(vp.title))}</strong>
    </span>
  </a>`;
}

/** Before/after sliders: one listener for the whole document (panel and pages are re-rendered). */
let compareReady = false;
export function initCompare() {
  if (compareReady || typeof document === 'undefined') return;
  compareReady = true;
  document.addEventListener('input', (event) => {
    const range = event.target.closest('[data-compare]');
    if (range) range.closest('.vp-compare').style.setProperty('--pos', `${range.value}%`);
  });
}
