/**
 * Small, pure HTML-string components shared by the content pages. They run in
 * the browser and at build time (French prerender), so they must not touch the DOM.
 */
import { t, localized, localizedWithFallback, getLang, textOf } from '../i18n/index.js';
import { escapeHtml } from '../ui/dom.js';
import { getCategory } from '../data/categories.js';
import { getPlace } from '../data/places.js';
import { formatDate, formatMonth, formatDayLong, weekdayNames, formatTimeRange, formatShortRange, formatMonthShort } from './format.js';
import { eventsOnDay, weekdayOf } from '../data/events.js';
import { placeHref, placePageHref, directionsLinks, photoMapHref, pageHref } from './links.js';
import { CONTACT_EMAIL } from './config.js';

const e = escapeHtml;

/** Text that may exist only in French: adds lang="fr" and a notice when falling back. */
export function textBlock(obj, { tag = 'p', className = '' } = {}) {
  const { value, isFallback } = localizedWithFallback(obj);
  const langAttr = isFallback ? ' lang="fr"' : '';
  const cls = className ? ` class="${className}"` : '';
  if (Array.isArray(value)) return value.map((para) => `<${tag}${cls}${langAttr}>${e(para)}</${tag}>`).join('');
  return `<${tag}${cls}${langAttr}>${e(value)}</${tag}>`;
}

export function frenchOnlyNotice(objs) {
  const needed = objs.some((obj) => localizedWithFallback(obj).isFallback);
  return needed ? `<p class="notice notice-lang">${e(t('common.frenchOnly'))}</p>` : '';
}

export function sourcesList(sources) {
  if (!sources || sources.length === 0) return '';
  const items = sources
    .map((s) =>
      s.url
        ? `<li><a href="${e(s.url)}" target="_blank" rel="noopener">${e(textOf(s.label))}</a></li>`
        : `<li>${e(textOf(s.label))}</li>`,
    )
    .join('');
  return `<details class="sources"><summary>${e(t('common.sources'))}</summary><ul>${items}</ul></details>`;
}

export function verifiedLine(isoDate) {
  if (!isoDate) return '';
  return `<p class="verified">${e(t('common.lastVerified', { date: formatDate(isoDate, getLang()) }))}</p>`;
}

/** Current photograph with mandatory credit and licence. */
export function photoFigure(photo) {
  if (!photo) return '';
  const credit = `${photo.credit}, ${photo.licence}`;
  const creditHtml = photo.sourceUrl
    ? `<a href="${e(photo.sourceUrl)}" target="_blank" rel="noopener">${e(credit)}</a>`
    : e(credit);
  return `<figure class="photo"><img src="${e(photo.src)}" alt="${e(localized(photo.alt))}" loading="lazy" decoding="async" />
    <figcaption>${e(t('common.photoCredit', { credit: '' })).trim()} ${creditHtml}</figcaption></figure>`;
}

export function categoryBadge(categoryId) {
  const cat = getCategory(categoryId);
  return `<span class="badge" style="--cat:${cat.color}"><span aria-hidden="true">${cat.icon}</span> ${e(t(`categories.${categoryId}`))}</span>`;
}

export function placeCard(place) {
  const lang = getLang();
  return `<article class="card place-card">
    ${place.photos[0] ? photoFigure(place.photos[0]) : ''}
    <div class="card-body">
      ${categoryBadge(place.category)}
      <h3 class="card-title"><a href="${placePageHref(place.id, lang)}">${e(localized(place.name))}</a></h3>
      <p class="card-meta">${e(localized(place.location))}</p>
      <a class="card-link" href="${placeHref(place.id, lang)}">${e(t('common.viewOnMap'))}<span aria-hidden="true"> →</span></a>
    </div>
  </article>`;
}

/** Where an event takes place: a place of the site (linked), or a venue that has no page here. */
function eventWhere(event) {
  if (event.placeId) return placeLink(event.placeId);
  if (event.venue) {
    const v = event.venue;
    return [venueName(v), v.address, v.note && localized(v.note)].filter(Boolean).map(e).join(', ');
  }
  return '';
}

function venueName(venue) {
  return typeof venue.name === 'string' ? venue.name : localized(venue.name);
}

/** The name of the place or venue of an event, for short lines. */
function eventPlaceName(event) {
  const place = event.placeId && getPlace(event.placeId);
  if (place) return localized(place.name);
  return event.venue ? venueName(event.venue) : '';
}

/** Times of an event on a given day: its opening hours that weekday, or its start and end time. */
function eventTimes(event, iso) {
  if (event.weekHours) return event.weekHours[weekdayOf(iso)];
  if (event.startTime) return event.endTime ? [event.startTime, event.endTime] : null;
  return null;
}

function placeLink(placeId) {
  const place = placeId && getPlace(placeId);
  if (!place) return '';
  return `<a href="${placeHref(place.id, getLang())}">${e(localized(place.name))}</a>`;
}

function eventDates(event, lang) {
  return event.startDate === event.endDate
    ? formatDate(event.startDate, lang)
    : t('common.dateRange', { start: formatDate(event.startDate, lang), end: formatDate(event.endDate, lang) });
}

export function eventCard(event) {
  const lang = getLang();
  const photo = event.photo;
  return `<article class="card event-card" id="event-${e(event.id)}">
    ${
      photo
        ? `<figure class="photo event-photo"><img src="${e(photo.src)}" alt="${e(localized(photo.alt))}"${photo.width ? ` width="${photo.width}" height="${photo.height}"` : ''} loading="lazy" decoding="async" /><figcaption class="photo-credit">${e(t('common.photoCredit', { credit: `© ${photo.credit}` }))}</figcaption></figure>`
        : ''
    }
    <div class="card-body">
      <p class="event-date"><time datetime="${e(event.startDate)}">${e(eventDates(event, lang))}</time></p>
      <h3 class="card-title">${e(localized(event.title))}</h3>
      ${event.summary ? `<p class="event-summary">${e(localized(event.summary))}</p>` : ''}
      <dl class="facts">
        ${event.placeId || event.venue ? `<div><dt>${e(t('common.where'))}</dt><dd>${eventWhere(event)}</dd></div>` : ''}
        ${event.hours ? `<div><dt>${e(t('common.hours'))}</dt><dd>${e(localized(event.hours))}</dd></div>` : ''}
        ${
          event.registration
            ? `<div><dt>${e(t('life.registration'))}</dt><dd>${event.registration.until ? `${e(t('life.registerBefore', { date: formatDate(event.registration.until, lang) }))} · ` : ''}<a href="${e(event.registration.url)}" target="_blank" rel="noopener">${e(t('life.register'))}<span aria-hidden="true"> ↗</span></a></dd></div>`
            : ''
        }
      </dl>
      ${verifiedLine(event.lastVerified)}
      ${sourcesList(event.sources)}
    </div>
  </article>`;
}

/** The event of the moment, large, on the local-life page: dates, hours day by day, how to get there. */
export function featuredEventBlock(event) {
  const lang = getLang();
  const hours = event.weekHours
    ? `<div class="featured-hours">
        <h3>${e(t('common.hours'))}</h3>
        <table class="week-hours">
          <tbody>${weekdayNames(lang)
            .map(({ key, name }) => {
              const h = event.weekHours[key];
              return `<tr${h ? '' : ' class="is-closed"'}><th scope="row">${e(name)}</th><td>${e(h ? formatTimeRange(h, lang) : t('life.closed'))}</td></tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>`
    : event.hours
      ? `<div class="featured-hours"><h3>${e(t('common.hours'))}</h3><p>${e(localized(event.hours))}</p></div>`
      : '';
  const place = event.placeId && getPlace(event.placeId);
  return `<section class="featured-event event-card" id="event-${e(event.id)}" aria-labelledby="featured-${e(event.id)}">
    <div class="featured-event-main">
      <p class="featured-kicker"><span aria-hidden="true">★ </span>${e(t('life.featured'))}</p>
      <h2 class="featured-title" id="featured-${e(event.id)}">${e(localized(event.title))}</h2>
      <p class="event-date"><time datetime="${e(event.startDate)}">${e(eventDates(event, lang))}</time></p>
      ${event.summary ? `<p class="featured-summary">${e(localized(event.summary))}</p>` : ''}
      <p class="featured-actions">
        ${event.website ? `<a class="btn" href="${e(event.website)}" target="_blank" rel="noopener">${e(t('life.website'))}<span aria-hidden="true"> ↗</span></a>` : ''}
        ${place ? `<a class="btn btn-ghost" href="${placeHref(place.id, lang)}">${e(localized(place.name))}</a>` : ''}
      </p>
    </div>
    ${hours}
    ${
      event.details && event.details.length
        ? `<div class="featured-details">${event.details
            .map((d) => `<div class="featured-detail"><h3>${e(localized(d.title))}</h3><p>${e(localized(d.text))}</p></div>`)
            .join('')}</div>`
        : ''
    }
    <footer class="featured-footer">${verifiedLine(event.lastVerified)}${sourcesList(event.sources)}</footer>
  </section>`;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * The agenda as a calendar, one month after the other, from this month to the last event: each day a
 * square tile, like the doors of an Advent calendar. A day with events links to the first one; in the
 * browser it opens the day's list (see calendarDayPanel).
 */
export function eventCalendar(events, today) {
  if (!events.length) return '';
  const lang = getLang();
  const last = events.reduce((max, ev) => (ev.endDate > max ? ev.endDate : max), today);
  const heads = weekdayNames(lang, 'short')
    .map(({ name }) => `<li>${e(name)}</li>`)
    .join('');
  const months = [];
  let year = Number(today.slice(0, 4));
  let month = Number(today.slice(5, 7));
  while (`${year}-${pad(month)}` <= last.slice(0, 7)) {
    const key = `${year}-${pad(month)}`;
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // Monday first
    const cells = Array.from({ length: offset }, () => '<li class="cal-blank" aria-hidden="true"></li>');
    for (let d = 1; d <= days; d += 1) {
      const iso = `${key}-${pad(d)}`;
      const onDay = eventsOnDay(events, iso);
      const cls = ['cal-day'];
      if (iso < today) cls.push('is-past');
      if (iso === today) cls.push('is-today');
      if (onDay.length) cls.push('has-events');
      if (onDay.some((ev) => ev.featured)) cls.push('is-featured');
      const current = iso === today ? ' aria-current="date"' : '';
      const labels = onDay
        .slice(0, 2)
        .map((ev) => `<span class="cal-ev">${e(localized(ev.title))}</span>`)
        .join('');
      const more = onDay.length > 2 ? `<span class="cal-ev cal-more">+${onDay.length - 2}</span>` : '';
      const num = `<span class="cal-num">${d}</span>`;
      cells.push(
        onDay.length
          ? `<li><a class="${cls.join(' ')}" href="#event-${e(onDay[0].id)}" data-day="${iso}"${current} aria-label="${e(`${formatDayLong(iso, lang)} : ${onDay.map((ev) => localized(ev.title)).join(', ')}`)}">${num}${labels}${more}</a></li>`
          : `<li><span class="${cls.join(' ')}"${current}>${num}</span></li>`,
      );
    }
    months.push(`<section class="cal-month" aria-labelledby="cal-${key}">
      <h3 class="cal-month-title" id="cal-${key}">${e(formatMonth(key, lang))}</h3>
      <ol class="cal-weekdays" aria-hidden="true">${heads}</ol>
      <ol class="cal-grid">${cells.join('')}</ol>
      <div class="cal-panel" hidden></div>
    </section>`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return `<div class="cal">
    <p class="cal-hint">${e(t('life.calendarHint'))}</p>
    ${months.join('')}
  </div>`;
}

/**
 * Home page: the businesses one at a time, so the page never looks like a page of ads. Each day a
 * different one comes first; in the browser they take turns (see startBusinessSpotlight in client.js).
 */
export function businessSpotlight(list, today) {
  if (!list.length) return '';
  const start = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86400000) % list.length;
  const ordered = [...list.slice(start), ...list.slice(0, start)];
  const controls =
    ordered.length > 1
      ? `<div class="home-voices-controls" data-biz-controls hidden>
          <button type="button" class="home-voices-btn" data-biz-step="-1" aria-label="${e(t('common.previous'))}">‹</button>
          <span class="home-voices-pos" data-biz-pos aria-live="polite">1 / ${ordered.length}</span>
          <button type="button" class="home-voices-btn" data-biz-step="1" aria-label="${e(t('common.next'))}">›</button>
          <button type="button" class="home-voices-btn home-voices-pause" data-biz-pause aria-pressed="false">${e(t('home.photosPause'))}</button>
        </div>`
      : '';
  return `<div class="biz-spotlight" data-biz-rotator>
    <div class="biz-spotlight-track">${ordered.map((b, i) => businessCard(b, { off: i > 0 })).join('')}</div>
    ${controls}
  </div>`;
}

/**
 * Home page: the next five weeks at a glance, from the Monday of this week. A day with events opens
 * that day in the calendar of the local-life page.
 */
export function miniCalendar(events, today, { weeks = 5 } = {}) {
  const lang = getLang();
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7)); // back to Monday
  const heads = weekdayNames(lang, 'short')
    .map(({ name }) => `<li>${e(name)}</li>`)
    .join('');
  const cells = [];
  for (let i = 0; i < weeks * 7; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const onDay = eventsOnDay(events, iso);
    const cls = ['mini-day'];
    if (iso < today) cls.push('is-past');
    if (iso === today) cls.push('is-today');
    if (onDay.some((ev) => ev.featured)) cls.push('is-featured');
    const month = d.getUTCDate() === 1 || i === 0 ? `<span class="mini-month">${e(formatMonthShort(iso, lang))}</span>` : '';
    const inner = `${month}<span class="mini-num">${d.getUTCDate()}</span>`;
    const current = iso === today ? ' aria-current="date"' : '';
    cells.push(
      onDay.length
        ? `<li><a class="${cls.join(' ')} has-events" href="${pageHref('life', lang)}#jour-${iso}"${current} aria-label="${e(`${formatDayLong(iso, lang)} : ${onDay.map((ev) => localized(ev.title)).join(', ')}`)}">${inner}</a></li>`
        : `<li><span class="${cls.join(' ')}"${current}>${inner}</span></li>`,
    );
  }
  return `<div class="mini-cal">
    <ol class="mini-cal-weekdays" aria-hidden="true">${heads}</ol>
    <ol class="mini-cal-grid">${cells.join('')}</ol>
  </div>`;
}

/** Home page: the next events, one line each (the featured one first). */
export function agendaList(events) {
  const lang = getLang();
  const items = events
    .map(
      (ev) => `<li${ev.featured ? ' class="is-featured"' : ''}><a href="${pageHref('life', lang)}#event-${e(ev.id)}">
        <time class="agenda-date" datetime="${e(ev.startDate)}">${e(formatShortRange(ev.startDate, ev.endDate, lang))}</time>
        <span class="agenda-title">${ev.featured ? '<span aria-hidden="true">★ </span>' : ''}${e(localized(ev.title))}</span>
      </a></li>`,
    )
    .join('');
  return `<ul class="agenda-list">${items}</ul>`;
}

/** The events of one day, shown under its month when the day is chosen in the calendar. */
export function calendarDayPanel(iso, events) {
  const lang = getLang();
  const items = eventsOnDay(events, iso)
    .map((ev) => {
      const h = eventTimes(ev, iso);
      const where = eventPlaceName(ev);
      return `<li class="cal-panel-item${ev.featured ? ' is-featured' : ''}">
        <strong class="cal-panel-title">${e(localized(ev.title))}</strong>
        ${h || where ? `<span class="cal-panel-meta">${[h && formatTimeRange(h, lang), where].filter(Boolean).map(e).join(' · ')}</span>` : ''}
        <a href="#event-${e(ev.id)}">${e(t('life.more'))}<span aria-hidden="true"> →</span></a>
      </li>`;
    })
    .join('');
  return `<div class="cal-panel-head">
      <h4 class="cal-panel-date">${e(formatDayLong(iso, lang))}</h4>
      <button type="button" class="cal-close">${e(t('life.dayClose'))}</button>
    </div>
    <ul class="cal-panel-list">${items}</ul>`;
}

export function practicalCard(item) {
  return `<article class="card practical-card" id="info-${e(item.id)}">
    <div class="card-body">
      <h3 class="card-title">${e(localized(item.title))}</h3>
      ${textBlock(item.text)}
      <p class="card-links">
        ${item.placeId ? `<a href="${placeHref(item.placeId, getLang())}">${e(t('common.viewOnMap'))}</a>` : ''}
        ${item.link ? `<a href="${e(item.link.url)}" target="_blank" rel="noopener">${e(item.link.label)}</a>` : ''}
      </p>
      ${verifiedLine(item.lastVerified)}
      ${sourcesList(item.sources)}
    </div>
  </article>`;
}

/** Every character as an HTML entity (e-mail addresses): browsers show them, simple harvesters miss them. */
const entities = (text) => [...text].map((c) => `&#${c.codePointAt(0)};`).join('');

/** The photo shown large in a business gallery: whole (never cropped), with its credit. */
function galleryStage(photo) {
  return `<figure class="biz-stage" data-gallery-stage>
      <img src="${e(photo.src)}" alt="${e(localized(photo.alt))}"${photo.width ? ` width="${photo.width}" height="${photo.height}"` : ''} decoding="async" />
      <figcaption>${e(t('common.photoCredit', { credit: `© ${photo.credit}` }))}</figcaption>
    </figure>`;
}

/** Photos of a business: one large, the others as thumbnails that show it large when chosen. */
function businessGallery(b) {
  const photos = b.photos || [];
  if (!photos.length) return '';
  const thumbs =
    photos.length > 1
      ? `<div class="biz-thumbs" role="group" aria-label="${e(t('businesses.photosOf', { name: b.name }))}">${photos
          .map(
            (photo, i) =>
              `<button type="button" class="biz-thumb" data-gallery-thumb data-src="${e(photo.src)}" data-alt="${e(localized(photo.alt))}" data-width="${photo.width || ''}" data-height="${photo.height || ''}" data-credit="${e(t('common.photoCredit', { credit: `© ${photo.credit}` }))}" aria-pressed="${i === 0}" aria-label="${e(t('businesses.showPhoto', { n: i + 1, total: photos.length }))}"><img src="${e(photo.src)}" alt="" loading="lazy" decoding="async" /></button>`,
          )
          .join('')}</div>`
      : '';
  return `<div class="biz-gallery" data-gallery>${galleryStage(photos[0])}${thumbs}</div>`;
}

/** Contact buttons: call, write, website, Instagram, directions (only what the business has). */
function businessActions(b) {
  const actions = [];
  if (b.phone) actions.push(`<a class="biz-action biz-action--main" href="tel:${e(b.phone.replace(/ /g, ''))}"><span aria-hidden="true">☎</span> ${e(t('businesses.call'))} <span class="biz-action-detail">${e(b.phone)}</span></a>`);
  if (b.email) actions.push(`<a class="biz-action" href="${entities(`mailto:${b.email}`)}"><span aria-hidden="true">✉</span> ${entities(b.email)}</a>`);
  if (b.website) actions.push(`<a class="biz-action" href="${e(b.website)}" target="_blank" rel="noopener"><span aria-hidden="true">↗</span> ${e(b.website.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`);
  if (b.instagram) actions.push(`<a class="biz-action" href="${e(b.instagram)}" target="_blank" rel="noopener"><span aria-hidden="true">◎</span> @${e(b.instagram.replace(/^https:\/\/www\.instagram\.com\//, '').replace(/\/$/, ''))}</a>`);
  if (b.facebook) actions.push(`<a class="biz-action" href="${e(b.facebook)}" target="_blank" rel="noopener"><span aria-hidden="true">f</span> Facebook</a>`);
  if (b.address) {
    const directions = directionsLinks(b.coordinates || { query: `${b.address}, Suisse` }, b.name);
    actions.push(`<a class="biz-action" href="${e(directions.google)}" target="_blank" rel="noopener"><span aria-hidden="true">➜</span> ${e(t('panel.directionsGoogle'))}</a>`);
    actions.push(`<a class="biz-action" href="${e(directions.apple)}" target="_blank" rel="noopener"><span aria-hidden="true">➜</span> ${e(t('panel.directionsApple'))}</a>`);
  }
  return actions.length ? `<div class="biz-actions">${actions.join('')}</div>` : '';
}

/**
 * The full presentation of a business on the businesses page: photo gallery, what they offer,
 * background, and contact buttons. `today` (YYYY-MM-DD) decides whether a temporary notice still shows.
 */
export function businessProfile(b, { today } = {}) {
  // a sponsored entry always carries a visible label
  const sponsored = b.commercial && b.commercial.status === 'sponsored';
  const notice = b.notice && (!today || today <= b.notice.until) ? b.notice : null;
  const services = (b.services || [])
    .map((sv) => `<li class="biz-service"><h4>${e(localized(sv.title))}</h4><p>${e(localized(sv.text))}</p></li>`)
    .join('');
  const where = b.address
    ? `<p class="biz-where"><span class="biz-where-label">${e(t('common.address'))}</span> ${b.addressNote ? `${e(b.addressNote)}, ` : ''}${e(b.address)}</p>`
    : b.serviceArea
      ? `<p class="biz-where"><span class="biz-where-label">${e(t('businesses.serviceArea'))}</span> ${e(localized(b.serviceArea))}</p>`
      : '';
  return `<article class="biz-profile${sponsored ? ' is-sponsored' : ''}" id="business-${e(b.id)}" data-category="${e(b.category)}">
    ${businessGallery(b)}
    <div class="biz-info">
      ${sponsored ? `<p class="sponsored-label">${e(t('common.sponsored'))}</p>` : ''}
      <p class="biz-category">${e(t(`businesses.categories.${b.category}`))}</p>
      <h3 class="biz-name">${e(b.name)}</h3>
      ${b.person ? `<p class="biz-person">${e(b.person)}</p>` : ''}
      ${notice ? `<p class="biz-notice" role="note">${e(localized(notice.text))}</p>` : ''}
      ${textBlock(b.description, { className: 'biz-lead' })}
      ${where}
      ${b.openingHours ? `<p class="biz-where"><span class="biz-where-label">${e(t('common.hours'))}</span> ${[].concat(localized(b.openingHours.text)).map(e).join('<br />')}</p>` : ''}
      ${businessActions(b)}
    </div>
    ${
      services || b.about || b.note
        ? `<div class="biz-more">
      ${services ? `<section class="biz-section"><h4 class="biz-section-title">${e(t('businesses.services'))}</h4><ul class="biz-services">${services}</ul></section>` : ''}
      ${b.about ? `<section class="biz-section"><h4 class="biz-section-title">${e(t('businesses.about'))}</h4>${textBlock(b.about)}</section>` : ''}
      ${b.note ? `<p class="biz-note">${e(localized(b.note))}</p>` : ''}
    </div>`
        : ''
    }
    <footer class="biz-footer">${verifiedLine(b.lastVerified)}${sourcesList(b.sources)}</footer>
  </article>`;
}

/**
 * A short card for the home page: first photo, name and summary; the whole card links to the full
 * presentation. `off`: a card of the carousel that waits its turn (kept in the page, not shown).
 */
export function businessCard(b, { off = false } = {}) {
  const sponsored = b.commercial && b.commercial.status === 'sponsored';
  const photos = b.photos || [];
  const photo = photos[0];
  // the other photos take turns on the home page (see startBusinessPhotos in client.js)
  const rotation =
    photos.length > 1
      ? ` data-photos="${e(JSON.stringify(photos.map((p) => ({ src: p.src, alt: localized(p.alt), width: p.width, height: p.height }))))}"`
      : '';
  return `<article class="card business-card${sponsored ? ' is-sponsored' : ''}${off ? ' is-off' : ''}" data-category="${e(b.category)}" data-biz-slide${off ? ' aria-hidden="true" inert' : ''}>
    ${photo ? `<figure class="photo business-photo"${rotation}><img src="${e(photo.src)}" alt="${e(localized(photo.alt))}"${photo.width ? ` width="${photo.width}" height="${photo.height}"` : ''} loading="lazy" decoding="async" /></figure>` : ''}
    <div class="card-body">
      ${sponsored ? `<p class="sponsored-label">${e(t('common.sponsored'))}</p>` : ''}
      <p class="card-kicker">${e(t(`businesses.categories.${b.category}`))}</p>
      <h3 class="card-title"><a href="${pageHref('businesses', getLang())}#business-${e(b.id)}">${e(b.name)}</a></h3>
      ${textBlock(b.description)}
      <p class="business-card-more" aria-hidden="true">${e(t('home.businessMore'))} →</p>
    </div>
  </article>`;
}

export function storyArticle(story) {
  const lang = getLang();
  const places = (story.placeIds || []).map(placeLink).filter(Boolean).join(' · ');
  return `<article class="story" id="${e(story.id)}">
    <header class="story-header">
      ${textBlock(story.title, { tag: 'h2', className: 'story-title' })}
      <p class="story-meta">${e(t('common.published', { date: formatDate(story.published, lang) }))}</p>
    </header>
    ${frenchOnlyNotice([story.title, story.body])}
    ${textBlock(story.summary, { className: 'story-summary' })}
    ${textBlock(story.body)}
    ${places ? `<p class="story-places"><span class="story-places-label">${e(t('common.viewOnMap'))}</span> ${places}</p>` : ''}
    ${sourcesList(story.sources)}
  </article>`;
}

/** Every character as an HTML entity: browsers show the address, simple spam harvesters miss it. */

/**
 * Link to write to Morges.info. `label` is plain text (escaped); without it the address is shown.
 * `subject` / `body` prefill the email.
 */
export function emailLink({ label, subject, body, className = '' } = {}) {
  const query = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join('&');
  const href = entities(`mailto:${CONTACT_EMAIL}`) + (query ? `?${query}` : '');
  const text = label ? escapeHtml(label).replace(CONTACT_EMAIL, entities(CONTACT_EMAIL)) : entities(CONTACT_EMAIL);
  return `<a${className ? ` class="${className}"` : ''} href="${href}">${text}</a>`;
}

const MIME = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg' };

/**
 * Home hero photograph: <picture> with a wide crop (desktop) and a tall crop
 * (phones), AVIF → WebP → JPEG, plus the credit required by the licence.
 * Returns '' until the responsive files exist (see scripts/build-hero.mjs).
 */
/** @param {{ sizes?: string }} [opts] sizes = the image's displayed width on wide screens */
export function heroPhoto(photo, manifest, { sizes = '(max-width: 1160px) 100vw, 1120px' } = {}) {
  if (!manifest || manifest.id !== photo.id || !manifest.crops || !manifest.crops.wide) return '';
  const { wide, tall } = manifest.crops;
  const srcset = (crop, fmt) => crop.files[fmt].map((f) => `${f.src} ${f.width}w`).join(', ');
  const largest = (crop) => crop.files.jpg[crop.files.jpg.length - 1];
  const sources = [];
  if (tall) {
    const t0 = largest(tall);
    for (const fmt of ['avif', 'webp', 'jpg']) {
      sources.push(`<source media="(max-width: 700px)" type="${MIME[fmt]}" srcset="${srcset(tall, fmt)}" sizes="100vw" width="${t0.width}" height="${t0.height}" />`);
    }
  }
  for (const fmt of ['avif', 'webp']) {
    sources.push(`<source type="${MIME[fmt]}" srcset="${srcset(wide, fmt)}" sizes="${sizes}" />`);
  }
  const fallback = wide.files.jpg[Math.min(1, wide.files.jpg.length - 1)];
  const label = e(t('common.photoCredit', { credit: '' })).trim();
  const mapLink = photo.viewpointId ? ` · <a href="${photoMapHref(photo.viewpointId, getLang())}">${e(t('common.viewOnMap'))}</a>` : '';
  return `<figure class="hero-photo${photo.overlayTitle ? ' has-overlay' : ''}" data-hero-id="${e(photo.id)}">
    <picture>
      ${sources.join('\n      ')}
      <img src="${fallback.src}" srcset="${srcset(wide, 'jpg')}" sizes="${sizes}" width="${fallback.width}" height="${fallback.height}" alt="${e(localized(photo.alt))}" fetchpriority="high" decoding="async"${photo.position ? ` style="object-position: ${e(photo.position)}"` : ''} />
    </picture>
    <figcaption class="hero-credit">${label} ${e(textOf(photo.creator))}${photo.creatorDetail ? ` – ${e(photo.creatorDetail)}` : ''}${
      photo.creatorUrl ? ` (<a href="${e(photo.creatorUrl)}" target="_blank" rel="noopener">${e(photo.creatorUrlLabel || photo.creatorUrl)}</a>)` : ''
    }, <a href="${e(photo.licenceUrl)}" target="_blank" rel="noopener license">${e(photo.licence)}</a>, <a href="${e(photo.sourceUrl)}" target="_blank" rel="noopener">${e(photo.sourceName)}</a> (${e(localized(photo.changes))})${mapLink}</figcaption>
  </figure>`;
}
