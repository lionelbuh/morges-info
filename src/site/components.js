/**
 * Small, pure HTML-string components shared by the content pages. They run in
 * the browser and at build time (French prerender), so they must not touch the DOM.
 */
import { t, localized, localizedWithFallback, getLang, textOf } from '../i18n/index.js';
import { escapeHtml } from '../ui/dom.js';
import { getCategory } from '../data/categories.js';
import { getPlace } from '../data/places.js';
import { formatDate } from './format.js';
import { placeHref, placePageHref } from './links.js';
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

function placeLink(placeId) {
  const place = placeId && getPlace(placeId);
  if (!place) return '';
  return `<a href="${placeHref(place.id, getLang())}">${e(localized(place.name))}</a>`;
}

export function eventCard(event) {
  const lang = getLang();
  const dates =
    event.startDate === event.endDate
      ? formatDate(event.startDate, lang)
      : t('common.dateRange', { start: formatDate(event.startDate, lang), end: formatDate(event.endDate, lang) });
  return `<article class="card event-card" id="event-${e(event.id)}">
    <div class="card-body">
      <p class="event-date"><time datetime="${e(event.startDate)}">${e(dates)}</time></p>
      <h3 class="card-title">${e(localized(event.title))}</h3>
      ${event.summary ? `<p class="event-summary">${e(localized(event.summary))}</p>` : ''}
      <dl class="facts">
        ${event.placeId ? `<div><dt>${e(t('common.where'))}</dt><dd>${placeLink(event.placeId)}</dd></div>` : ''}
        ${event.hours ? `<div><dt>${e(t('common.hours'))}</dt><dd>${e(localized(event.hours))}</dd></div>` : ''}
      </dl>
      ${verifiedLine(event.lastVerified)}
      ${sourcesList(event.sources)}
    </div>
  </article>`;
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

/** Business card. A sponsored entry always carries a visible label. */
export function businessCard(b) {
  const sponsored = b.commercial && b.commercial.status === 'sponsored';
  return `<article class="card business-card${sponsored ? ' is-sponsored' : ''}" id="business-${e(b.id)}">
    ${b.photos && b.photos[0] ? photoFigure(b.photos[0]) : ''}
    <div class="card-body">
      ${sponsored ? `<p class="sponsored-label">${e(t('common.sponsored'))}</p>` : ''}
      <p class="card-kicker">${e(t(`businesses.categories.${b.category}`))}</p>
      <h3 class="card-title">${e(b.name)}</h3>
      ${textBlock(b.description)}
      <dl class="facts">
        <div><dt>${e(t('common.address'))}</dt><dd>${e(b.address)}</dd></div>
        ${b.openingHours ? `<div><dt>${e(t('common.hours'))}</dt><dd>${e(localized(b.openingHours.text))}</dd></div>` : ''}
        ${b.website ? `<div><dt>${e(t('common.website'))}</dt><dd><a href="${e(b.website)}" target="_blank" rel="noopener">${e(b.website.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></dd></div>` : ''}
      </dl>
      ${verifiedLine(b.lastVerified)}
      ${sourcesList(b.sources)}
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
const entities = (text) => [...text].map((c) => `&#${c.codePointAt(0)};`).join('');

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
  return `<figure class="hero-photo${photo.overlayTitle ? ' has-overlay' : ''}">
    <picture>
      ${sources.join('\n      ')}
      <img src="${fallback.src}" srcset="${srcset(wide, 'jpg')}" sizes="${sizes}" width="${fallback.width}" height="${fallback.height}" alt="${e(localized(photo.alt))}" fetchpriority="high" decoding="async" />
    </picture>
    <figcaption class="hero-credit">${label} ${e(photo.creator)}${photo.creatorDetail ? ` – ${e(photo.creatorDetail)}` : ''}${
      photo.creatorUrl ? ` (<a href="${e(photo.creatorUrl)}" target="_blank" rel="noopener">${e(photo.creatorUrlLabel || photo.creatorUrl)}</a>)` : ''
    }, <a href="${e(photo.licenceUrl)}" target="_blank" rel="noopener license">${e(photo.licence)}</a>, <a href="${e(photo.sourceUrl)}" target="_blank" rel="noopener">${e(photo.sourceName)}</a> (${e(localized(photo.changes))})</figcaption>
  </figure>`;
}
