/**
 * Advent calendar page (/calendrier-avent/) and its home-page banner. The doors and their contents
 * come from src/data/advent.js; a door opens only from its day (date in Morges). The page is
 * prerendered with the build date and re-rendered in the browser with the real date
 * (src/site/client.js handles the clicks).
 */
import { t, getLang, localized } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { ADVENT_DOORS, ADVENT_GRID, ADVENT_TEASER_FROM, ADVENT_LAST, adventDate, adventTarget, isOpenable } from '../data/advent.js';
import { shownPhotos } from '../data/viewpoints.js';
import { pageHref, placePageHref, storyHref, photoPageHref, businessPageHref } from './links.js';
import { photoBlock } from './photos.js';
import { photoFigure, categoryBadge } from './components.js';
import { formatDate } from './format.js';

const DOOR_COLOURS = ['#b3121a', '#1f5e3b', '#c08a1e', '#2b4f7a'];

/** Gaston, the little swan of Morges.info, in his Christmas hat. */
export function gastonSvg(className = 'advent-gaston') {
  return `<svg class="${className}" viewBox="-200 -290 470 400" aria-hidden="true" focusable="false">
    <path d="M70 10 C130 -40 50 -120 85 -190 C105 -235 165 -238 178 -200" fill="none" stroke="#c9c4ba" stroke-width="48" stroke-linecap="round"/>
    <path d="M70 10 C130 -40 50 -120 85 -190 C105 -235 165 -238 178 -200" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
    <path d="M-175 35 C-215 -30 -150 -70 -60 -55 C20 -42 90 -15 130 25 C160 55 125 98 40 98 L-115 98 C-170 98 -195 70 -175 35 Z" fill="#fff" stroke="#c9c4ba" stroke-width="5"/>
    <path d="M-140 30 C-95 -35 20 -35 75 15 C25 40 -60 55 -140 30 Z" fill="#f4f1ea" stroke="#c9c4ba" stroke-width="4"/>
    <g transform="rotate(-28 92 -50)"><rect x="62" y="-66" width="64" height="30" rx="10" fill="#d52b1e"/><rect x="62" y="-56" width="64" height="9" fill="#fff"/></g>
    <circle cx="172" cy="-205" r="36" fill="#fff" stroke="#c9c4ba" stroke-width="4"/>
    <circle cx="168" cy="-190" r="9" fill="#f6b6b0" opacity=".8"/>
    <path d="M200 -222 L258 -206 L203 -198 Z" fill="#f08a24"/>
    <ellipse cx="182" cy="-216" rx="8" ry="9" fill="#1c1b19"/>
    <circle cx="185" cy="-219.5" r="2.6" fill="#fff"/>
    <path d="M134 -232 C150 -262 196 -268 212 -236 Z" fill="#d52b1e"/>
    <path d="M150 -258 C138 -280 112 -278 100 -262" fill="none" stroke="#d52b1e" stroke-width="16" stroke-linecap="round"/>
    <circle cx="98" cy="-260" r="11" fill="#fff"/>
    <rect x="128" y="-240" width="90" height="14" rx="7" fill="#fff"/>
  </svg>`;
}

const link = (href, label) => `<p class="advent-more"><a class="btn" href="${href}">${e(label)}<span aria-hidden="true"> →</span></a></p>`;

/** The content behind a door. */
export function adventDoorContent(door) {
  const lang = getLang();
  const item = adventTarget(door);
  const head = (title) => `<p class="kicker">${e(t('advent.door', { n: door.day }))} · ${e(t(`advent.kinds.${door.kind}`))}</p>
    <p class="advent-hook">${e(localized(door.hook))}</p>
    ${title ? `<h2 class="advent-title">${e(title)}</h2>` : ''}`;
  switch (door.kind) {
    case 'open':
      return `${gastonSvg()}${head('')}${link(pageHref('discover', lang), t('nav.discover'))}`;
    case 'event':
      return `${head(localized(item.title))}
        <p>${e(localized(item.summary))}</p>
        ${link(`${pageHref('life', lang)}#jour-${adventDate(door.day)}`, t('advent.eventMore'))}`;
    case 'photo': {
      const { then, now } = shownPhotos(item);
      return `${head(localized(item.title))}
        <div class="advent-photos">${photoBlock(then, 'then')}${now ? photoBlock(now, 'now') : ''}</div>
        ${link(photoPageHref(item.id, lang), t('advent.more'))}`;
    }
    case 'place':
      return `${head(localized(item.name))}
        <p>${categoryBadge(item.category)}</p>
        <p>${e(localized(item.description))}</p>
        ${link(placePageHref(item.id, lang), t('advent.more'))}`;
    case 'story':
      return `${head(localized(item.title))}
        <p>${e(localized(item.summary))}</p>
        ${link(storyHref(item.id, lang), t('advent.more'))}`;
    case 'business':
      return `${head(item.name)}
        ${item.photos && item.photos[0] ? photoFigure(item.photos[0]) : ''}
        <p>${e(localized(item.description))}</p>
        ${link(businessPageHref(item.id, lang), t('advent.more'))}`;
    case 'christmas': {
      const photo = item.photo;
      return `${gastonSvg()}${head(localized(item.title))}
        <figure class="photo">
          <img src="${e(photo.src)}" alt="${e(localized(photo.alt))}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async" />
          <figcaption>${e(t('common.photoCredit', { credit: photo.credit }))}</figcaption>
        </figure>
        <p>${e(localized(item.text))}</p>
        ${link(`${pageHref('discover', lang)}#${item.id}`, t('advent.more'))}`;
    }
    default:
      return '';
  }
}

/** Message shown in place of a door that is not open yet. */
export function adventLockedMessage(day) {
  return `${gastonSvg()}<p class="kicker">${e(t('advent.door', { n: day }))}</p>
    <p class="advent-hook">${e(t('advent.locked', { date: formatDate(adventDate(day), getLang()) }))}</p>`;
}

/** The day whose content the panel shows first: today's door in December, else none. */
export function adventDefaultDay(today) {
  const open = ADVENT_DOORS.filter((d) => isOpenable(d.day, today));
  return open.length ? Math.min(24, open.at(-1).day) : null;
}

/** @param {{ today: string, opened?: number[] }} opts today = YYYY-MM-DD in Morges */
export function renderAdvent({ today, opened = [] }) {
  const doors = ADVENT_GRID.map((day, i) => {
    const openable = isOpenable(day, today);
    const classes = ['advent-door', openable ? 'is-openable' : 'is-locked', adventDate(day) === today ? 'is-today' : '', opened.includes(day) ? 'is-open' : '']
      .filter(Boolean)
      .join(' ');
    return `<li><button type="button" class="${classes}" data-day="${day}" aria-controls="advent-panel" style="--door:${DOOR_COLOURS[i % DOOR_COLOURS.length]}">
      <span class="advent-num">${day}</span>
      ${adventDate(day) === today ? `<span class="advent-today">${e(t('advent.today'))}</span>` : ''}
      <span class="visually-hidden">${e(t('advent.door', { n: day }))}</span>
    </button></li>`;
  }).join('');
  const day = adventDefaultDay(today);
  const status = today < adventDate(1) ? t('advent.before') : today > ADVENT_LAST ? t('advent.after') : t('advent.hint');
  const panel = day ? adventDoorContent(ADVENT_DOORS.find((d) => d.day === day)) : `${gastonSvg()}<p class="advent-hook">${e(status)}</p>`;
  return `<header class="page-intro">
    <h1>${e(t('advent.title'))}</h1>
    <p class="lead">${e(t('advent.intro'))}</p>
  </header>
  <section class="section advent">
    <p class="advent-status">${e(status)}</p>
    <ul class="advent-grid">${doors}</ul>
    <article class="card advent-card" id="advent-panel" aria-live="polite" data-day="${day || ''}">${panel}</article>
  </section>`;
}

/** Home page: the calendar announced from the end of November until Christmas Eve. */
export function adventHomeBanner(today) {
  if (today < ADVENT_TEASER_FROM || today > ADVENT_LAST) return '';
  const lang = getLang();
  const started = today >= adventDate(1);
  const href = `${pageHref('advent', lang)}${started ? `#case-${Number(today.slice(8))}` : ''}`;
  return `<section class="section advent-banner" aria-labelledby="home-advent">
    ${gastonSvg('advent-banner-gaston')}
    <div>
      <p class="kicker">${e(t('advent.homeKicker'))}</p>
      <h2 id="home-advent">${e(t('advent.homeTitle'))}</h2>
      <p>${e(t(started ? 'advent.homeText' : 'advent.homeTeaser'))}</p>
      <p><a class="btn" href="${href}">${e(t('advent.homeCta'))}<span aria-hidden="true"> →</span></a></p>
    </div>
  </section>`;
}
