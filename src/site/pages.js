/**
 * Main content of each content page, as HTML strings. The map page has its
 * own static markup (carte/index.html + src/main.js).
 *
 * Rule: a section is rendered only when it has real content — no empty
 * placeholders (e.g. the businesses block on the home page stays hidden
 * until a verified business exists).
 */
import { t, getLang, localized } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { PLACES, getPlace } from '../data/places.js';
import { CATEGORIES } from '../data/categories.js';
import { editorialSelection, BUSINESS_CATEGORIES } from '../data/businesses.js';
import { upcomingEvents, todayInMorges } from '../data/events.js';
import { PRACTICAL, OFFICIAL_LINKS } from '../data/practical.js';
import { STORIES, featuredStory } from '../data/stories.js';
import { MILESTONES } from '../data/history.js';
import { heroOfTheDay, getHeroPhoto } from '../data/photos.js';
import heroManifest from '../data/hero-manifest.json' with { type: 'json' };
import { pageHref, placeHref, placePageHref, storyHref, photoPageHref, photoMapHref, directionsLinks } from './links.js';
import { jsonLd, websiteSchema, placeSchema, breadcrumbSchema, eventSchema, storySchema, viewpointSchema, faqSchema, businessSchema } from './structured-data.js';
import { publishedViewpoints, getViewpoint } from '../data/viewpoints.js';
import { renderVoices, homeVoices } from './voices.js';
import { viewpointBody, viewpointCard, viewpointKind, placePhotosBlock, homePhotoCard } from './photos.js';
import {
  placeCard,
  eventCard,
  practicalCard,
  businessCard,
  carousel,
  storyArticle,
  textBlock,
  frenchOnlyNotice,
  sourcesList,
  verifiedLine,
  photoFigure,
  categoryBadge,
  heroPhoto,
  emailLink,
} from './components.js';
import { CONTACT_EMAIL } from './config.js';
import { formatDate } from './format.js';

/** Date shown at the bottom of the legal notice; change it when the text changes. */
const LEGAL_UPDATED = '2026-10-31'; // "Parole aux Morgiens" form added

/** Places highlighted on the home page (all have verified or confirmed positions). */
export const HOME_PLACE_IDS = ['chateau', 'port', 'parc-independance', 'temple'];

function sectionHead(id, title, link) {
  return `<div class="section-head">
    <h2 id="${id}">${e(title)}</h2>
    ${link ? `<a class="section-link" href="${link.href}">${e(link.label)}<span aria-hidden="true"> →</span></a>` : ''}
  </div>`;
}

function pageIntro(title, intro) {
  return `<header class="page-intro">
    <h1>${e(title)}</h1>
    <p class="lead">${e(intro)}</p>
  </header>`;
}

/** Viewpoints shown on the home page, those with an old photo first. */
export function homePhotoViewpoints() {
  const viewpoints = publishedViewpoints();
  return [...viewpoints.filter((vp) => vp.then), ...viewpoints.filter((vp) => !vp.then)];
}

/**
 * @param {{ today?: string, heroId?: string }} [opts] heroId: the large photo already chosen for this page
 * (the browser keeps the one the build picked, so the photo never changes under the visitor's eyes).
 */
function renderHome({ today, heroId } = {}) {
  const lang = getLang();
  const places = HOME_PLACE_IDS.map(getPlace).filter(Boolean);
  const events = upcomingEvents(undefined, today).slice(0, 2);
  const story = featuredStory();
  const businesses = editorialSelection().slice(0, 3);

  const agenda = events.length
    ? `<div class="col">
        <h3 class="col-title">${e(t('home.agendaTitle'))}</h3>
        ${events.map(eventCard).join('')}
      </div>`
    : '';

  const heroChoice = (heroId && getHeroPhoto(heroId)) || heroOfTheDay(today || todayInMorges());
  const hero = heroPhoto(heroChoice, heroManifest[heroChoice.id], { sizes: '(max-width: 860px) 100vw, 680px' });
  // "Explorer la carte" opens the photo map: Morges then (and now), the places are one click away
  const oldPhotos = homePhotoViewpoints();
  const photosMap = oldPhotos.length ? photoMapHref('photos', lang) : pageHref('map', lang);

  return `${jsonLd(websiteSchema(t('pages.home.description')))}
  <div class="lead-story${hero ? ' lead-story--photo' : ''}">
  ${hero}
  <section class="hero">
    <p class="kicker">${e(t('home.kicker'))}</p>
    <h1>${e(t('site.tagline'))}</h1>
    <p class="lead">${e(t('home.intro'))}</p>
    <p class="hero-actions">
      <a class="btn" href="${photosMap}">${e(t('home.mapCta'))}</a>
      <a class="btn btn-ghost" href="${pageHref('history', lang)}">${e(t('nav.history'))}</a>
    </p>
  </section>
  </div>

  <section class="section" aria-labelledby="home-map">
    ${sectionHead('home-map', t('home.mapTitle'), { href: photosMap, label: t('home.mapCta') })}
    <p class="section-text">${e(t('home.mapText'))}</p>
    <div class="home-map${oldPhotos.length ? ' home-map--photos' : ''}">
      <div class="map-preview" id="map-preview">
        <a class="map-preview-fallback" href="${photosMap}">${e(t('home.mapCta'))}</a>
      </div>
      ${
        oldPhotos.length
          ? `<div class="home-photos" id="home-photos">
        ${homePhotoCard(oldPhotos[0], photoMapHref(oldPhotos[0].id, lang))}
        ${oldPhotos.length > 1 ? `<button type="button" class="home-photos-pause" aria-pressed="false" hidden>${e(t('home.photosPause'))}</button>` : ''}
      </div>`
          : ''
      }
    </div>
  </section>

  ${homeVoices()}

  <section class="section" aria-labelledby="home-places">
    ${sectionHead('home-places', t('home.placesTitle'), { href: pageHref('map', lang), label: t('home.placesCta') })}
    <div class="grid grid-4">${places.map(placeCard).join('')}</div>
  </section>

  <section class="section" aria-labelledby="home-life">
    ${sectionHead('home-life', t('nav.life'), { href: pageHref('life', lang), label: t('home.lifeCta') })}
    <div class="cols">
      ${agenda}
      <div class="col">
        <h3 class="col-title">${e(t('home.practicalTitle'))}</h3>
        ${PRACTICAL.slice(0, 2).map(practicalCard).join('')}
        <p class="callout-link"><a href="${pageHref('visit', lang)}">${e(t('visit.homeLink'))}<span aria-hidden="true"> →</span></a></p>
      </div>
    </div>
  </section>

  ${
    story
      ? `<section class="section" aria-labelledby="home-story">
    ${sectionHead('home-story', t('home.storyTitle'))}
    <article class="feature-story">
      ${textBlock(story.title, { tag: 'h3', className: 'feature-title' })}
      ${textBlock(story.summary)}
      ${frenchOnlyNotice([story.title, story.summary])}
      <a class="btn btn-ghost" href="${storyHref(story.id, lang)}">${e(t('home.readStory'))}</a>
    </article>
  </section>`
      : ''
  }

  <section class="contribute-band" aria-labelledby="home-contribute">
    <h2 id="home-contribute">${e(t('home.contributeTitle'))}</h2>
    <p>${e(t('home.contributeText'))}</p>
    <a class="btn" href="${pageHref('contribute', lang)}">${e(t('home.contributeCta'))}</a>
  </section>

  ${
    businesses.length
      ? `<section class="section" aria-labelledby="home-businesses">
    ${sectionHead('home-businesses', t('home.businessesTitle'), { href: pageHref('businesses', lang), label: t('home.businessesCta') })}
    <div class="grid grid-3">${businesses.map(businessCard).join('')}</div>
  </section>`
      : ''
  }`;
}

/** Type filter (shown by client.js): "All" and each category that has at least one business. */
function businessFilters(selection) {
  const count = (n) => t(n === 1 ? 'businesses.countOne' : 'businesses.countOther', { n });
  const chip = (id, label, n) =>
    `<button type="button" class="chip${id ? '' : ' is-active'}" data-biz-filter="${id}" aria-pressed="${id ? 'false' : 'true'}">${e(label)} <span class="chip-count">(${n})</span></button>`;
  const cats = BUSINESS_CATEGORIES.map((id) => [id, selection.filter((b) => b.category === id).length]).filter(([, n]) => n);
  return `<div class="biz-filters" role="group" aria-label="${e(t('businesses.filterLabel'))}" hidden>
    ${chip('', t('businesses.all'), selection.length)}${cats.map(([id, n]) => chip(id, t(`businesses.categories.${id}`), n)).join('')}
  </div>
  <p class="results-count biz-count" aria-live="polite">${e(count(selection.length))}</p>`;
}

function renderBusinesses() {
  const selection = editorialSelection();
  const criteria = ['local', 'independent', 'verified', 'free'].map((k) => `<li>${e(t(`businesses.criteria.${k}`))}</li>`).join('');
  return `${selection.map((b) => jsonLd(businessSchema(b))).join('')}
  ${pageIntro(t('home.businessesTitle'), t('businesses.intro'))}
  ${
    selection.length
      ? `<section class="section">
          ${businessFilters(selection)}
          ${carousel(selection.map(businessCard), { label: t('home.businessesTitle'), className: 'carousel--cards' })}
        </section>`
      : `<section class="section">
          <div class="callout">
            <h2>${e(t('businesses.statusTitle'))}</h2>
            <p>${e(t('businesses.status'))}</p>
          </div>
        </section>`
  }
  <section class="section two-col">
    <div>
      <h2>${e(t('businesses.criteriaTitle'))}</h2>
      <ul class="checklist">${criteria}</ul>
    </div>
    <div>
      <h2>${e(t('businesses.sponsorTitle'))}</h2>
      <p>${e(t('businesses.sponsorText'))}</p>
    </div>
  </section>`;
}

function renderHistory() {
  const lang = getLang();
  const items = MILESTONES.map((m) => {
    const place = getPlace(m.placeId);
    return `<li class="milestone">
      <p class="milestone-period">${e(m.period)}</p>
      <div class="milestone-body">
        ${textBlock(m.text)}
        ${place ? `<a class="card-link" href="${placeHref(place.id, lang)}">${e(t('common.viewOnMap'))}<span aria-hidden="true"> →</span></a>` : ''}
        ${sourcesList(m.sources)}
      </div>
    </li>`;
  }).join('');
  return `${pageIntro(t('history.title'), t('history.intro'))}
  <section class="section" aria-labelledby="history-milestones">
    ${sectionHead('history-milestones', t('history.milestonesTitle'))}
    <ol class="milestones">${items}</ol>
  </section>
  <section class="section" aria-labelledby="history-archive">
    <div class="callout">
      <h2 id="history-archive">${e(t('history.archiveTitle'))}</h2>
      <p>${e(t('history.archiveText'))}</p>
      <p class="callout-link"><a href="${pageHref('contribute', lang)}">${e(t('history.archiveCta'))}<span aria-hidden="true"> →</span></a></p>
    </div>
  </section>`;
}

function renderLife({ today } = {}) {
  const events = upcomingEvents(undefined, today);
  const links = OFFICIAL_LINKS.map((l) => `<li><a href="${e(l.url)}" target="_blank" rel="noopener">${e(l.label)}</a></li>`).join('');
  return `${events.map((ev) => jsonLd(eventSchema(ev))).join('')}
  ${pageIntro(t('life.title'), t('life.intro'))}
  <section class="section" aria-labelledby="life-agenda">
    ${sectionHead('life-agenda', t('life.agendaTitle'))}
    ${events.length ? `<div class="grid grid-2">${events.map(eventCard).join('')}</div>` : `<p class="empty-note">${e(t('life.agendaEmpty'))}</p>`}
  </section>
  <section class="section" aria-labelledby="life-practical">
    ${sectionHead('life-practical', t('life.practicalTitle'))}
    <div class="grid grid-3">${PRACTICAL.map(practicalCard).join('')}</div>
  </section>
  <section class="section" aria-labelledby="life-links">
    ${sectionHead('life-links', t('life.linksTitle'))}
    <ul class="link-list">${links}</ul>
  </section>`;
}

function renderStories() {
  return `${STORIES.map((s) => jsonLd(storySchema(s))).join('')}
  ${pageIntro(t('stories.title'), t('stories.intro'))}
  <div class="stories">${STORIES.map(storyArticle).join('')}</div>`;
}

function renderAbout() {
  const block = (key) => `<section class="section prose">
    <h2>${e(t(`about.${key}Title`))}</h2>
    <p>${e(t(`about.${key}Text`))}</p>
  </section>`;
  return `${pageIntro(t('about.title'), t('about.intro'))}
  ${['sources', 'photos', 'ads', 'map'].map(block).join('')}`;
}

/** "About us": a short personal note. */
function renderUs() {
  const lang = getLang();
  const paragraphs = ['p1', 'p2', 'p3', 'p4', 'p5'].map((k) => `<p>${e(t(`us.paragraphs.${k}`))}</p>`).join('');
  return `<article class="us-note">
    <h1>${e(t('us.title'))}</h1>
    <div class="us-text">${paragraphs}</div>
    <p class="us-closing">${e(t('us.closing'))}</p>
    <p class="us-contact">${e(t('us.contactLabel'))} ${emailLink()}</p>
    <p class="us-charter"><a href="${pageHref('about', lang)}">${e(t('us.charterLink'))}<span aria-hidden="true"> →</span></a></p>
  </article>`;
}

/** How readers can send news, corrections and photos (by email, checked before anything is published). */
function renderContribute() {
  const lang = getLang();
  const list = (group, keys) => keys.map((k) => `<li>${e(t(`contribute.${group}.${k}`))}</li>`).join('');
  return `${pageIntro(t('contribute.title'), t('contribute.intro'))}
  <section class="section contribute-grid">
    <div>
      <h2>${e(t('contribute.lookingTitle'))}</h2>
      <ul class="checklist">${list('looking', ['photos', 'news', 'corrections', 'memories'])}</ul>
    </div>
    <div class="contribute-how">
      <h2>${e(t('contribute.howTitle'))}</h2>
      <p>${e(t('contribute.howText'))}</p>
      <p>${emailLink({
        label: t('contribute.button', { email: CONTACT_EMAIL }),
        subject: t('contribute.mailSubject'),
        body: t('contribute.mailBody'),
        className: 'btn btn-mail',
      })}</p>
      <h3>${e(t('contribute.photoTitle'))}</h3>
      <ul class="plain-list">${list('photo', ['author', 'date', 'place', 'rights', 'credit'])}</ul>
    </div>
  </section>
  <section class="section two-col">
    <div>
      <h2>${e(t('contribute.nextTitle'))}</h2>
      <ul class="checklist">${list('next', ['read', 'check', 'consent', 'credit', 'removal'])}</ul>
    </div>
    <div>
      <h2>${e(t('contribute.rightsTitle'))}</h2>
      <p>${e(t('contribute.rightsText'))}</p>
      <p><a href="${pageHref('legal', lang)}">${e(t('contribute.privacyLink'))}<span aria-hidden="true"> →</span></a></p>
    </div>
  </section>`;
}

/** Publisher, contact and data protection. */
function renderLegal() {
  const lang = getLang();
  const block = (key, extra = '') => `<section class="section prose">
    <h2>${e(t(`legal.${key}Title`))}</h2>
    <p>${e(t(`legal.${key}Text`))}${extra}</p>
  </section>`;
  return `${pageIntro(t('legal.title'), t('legal.intro'))}
  ${block('publisher')}
  ${block('contact', ` ${emailLink()}`)}
  ${['data', 'voices', 'photos', 'storage'].map((k) => block(k)).join('')}
  <section class="section prose" id="mesure-audience">
    <h2>${e(t('legal.analyticsTitle'))}</h2>
    <p>${e(t('legal.analyticsText'))}</p>
    <p>${e(t('legal.analyticsOptOut'))}</p>
    <p class="analytics-control">
      <button type="button" class="btn btn-ghost" data-analytics-toggle hidden></button>
      <span class="analytics-status" role="status"></span>
    </p>
  </section>
  ${['services', 'rights'].map((k) => block(k)).join('')}
  ${block('credits', ` <a href="${pageHref('about', lang)}">${e(t('nav.about'))}</a>`)}
  <p class="verified legal-updated">${e(t('legal.updated', { date: formatDate(LEGAL_UPDATED, lang) }))}</p>`;
}

/** All places, grouped by category: a crawlable index of the place pages. */
function renderPlaces() {
  const lang = getLang();
  const groups = CATEGORIES.map((cat) => {
    const places = PLACES.filter((p) => p.category === cat.id);
    if (!places.length) return '';
    const items = places
      .map((p) => `<li><a href="${placePageHref(p.id, lang)}">${e(localized(p.name))}</a><span class="places-location"> — ${e(localized(p.location))}</span></li>`)
      .join('');
    return `<section class="section places-group" aria-labelledby="cat-${cat.id}">
      ${sectionHead(`cat-${cat.id}`, t(`categories.${cat.id}`))}
      <ul class="places-list">${items}</ul>
    </section>`;
  }).join('');
  return `${jsonLd(breadcrumbSchema([
    { name: t('places.home'), href: pageHref('home', lang) },
    { name: t('places.title'), href: pageHref('places', lang) },
  ]))}
  ${pageIntro(t('places.title'), t('places.intro'))}
  <p class="places-map-link"><a class="btn" href="${pageHref('map', lang)}">${e(t('home.mapCta'))}</a></p>
  ${groups}`;
}

/**
 * Visiting Morges: the questions visitors ask (and search for), answered from the site's own data —
 * places, practical information, photos — so every answer stays sourced and in step with the rest of the site.
 */
function renderVisit() {
  const lang = getLang();
  const practical = (id) => PRACTICAL.find((item) => item.id === id);
  const more = (href, label) => `<p class="callout-link"><a href="${href}">${e(label)}<span aria-hidden="true"> →</span></a></p>`;
  const placeGroups = CATEGORIES.map((cat) => {
    const places = PLACES.filter((p) => p.category === cat.id);
    if (!places.length) return '';
    return `<li><strong>${e(t(`categories.${cat.id}`))}</strong> — ${places.map((p) => `<a href="${placePageHref(p.id, lang)}">${e(localized(p.name))}</a>`).join(', ')}</li>`;
  }).join('');
  const photoCount = publishedViewpoints().length;
  // a walk from the station to the lake, through the places of the map
  const WALK = [['gare', 'grand-rue'], ['grand-rue', 'place-du-marche', 'hotel-de-ville', 'musee-forel'], ['maison-dessin-presse', 'musee-bolle'], ['chateau', 'musee-paderewski', 'parc-independance'], ['port', 'quai-lochmann', 'debarcadere-cgn']];
  const walk = WALK.map((ids, i) => {
    const links = ids.map(getPlace).filter(Boolean).map((p) => `<a href="${placePageHref(p.id, lang)}">${e(localized(p.name))}</a>`).join(', ');
    return `<li><strong>${e(t(`visit.walk.s${i + 1}`))}</strong><br />${links}</li>`;
  }).join('');
  // text: the plain answer (also used in the structured data); html: what follows it on the page
  const questions = [
    { id: 'see', text: t('visit.q.see.a'), html: `<ul class="visit-places">${placeGroups}</ul>` },
    { id: 'day', text: t('visit.q.day.a'), html: `<ol class="visit-walk">${walk}</ol>` },
    { id: 'map', text: t('visit.q.map.a'), html: more(pageHref('map', lang), t('visit.links.map')) },
    { id: 'come', text: [practical('gare'), practical('bateau')].map((item) => localized(item.text)).join(' '), html: '' },
    { id: 'market', text: localized(practical('marche').text), html: '' },
    {
      id: 'photos',
      text: t('visit.q.photos.a'),
      html: more(pageHref('photos', lang), `${t('visit.links.photos')} (${t(photoCount === 1 ? 'photos.countOne' : 'photos.countOther', { n: photoCount })})`),
    },
    { id: 'events', text: t('visit.q.events.a'), html: more(pageHref('life', lang), t('visit.links.life')) },
    { id: 'history', text: t('visit.q.history.a'), html: `${more(pageHref('history', lang), t('visit.links.history'))}${more(pageHref('stories', lang), t('visit.links.stories'))}` },
    {
      id: 'official',
      text: t('visit.q.official.a'),
      html: `<ul class="visit-links">${OFFICIAL_LINKS.map((l) => `<li><a href="${e(l.url)}" target="_blank" rel="noopener">${e(l.label)}</a></li>`).join('')}</ul>`,
    },
    { id: 'contribute', text: t('visit.q.contribute.a'), html: more(pageHref('contribute', lang), t('visit.links.contribute')) },
  ].map((q) => ({ ...q, question: t(`visit.q.${q.id}.q`) }));
  return `${jsonLd(faqSchema(questions.map((q) => ({ question: q.question, answer: q.text }))))}
  ${jsonLd(breadcrumbSchema([
    { name: t('places.home'), href: pageHref('home', lang) },
    { name: t('visit.title'), href: pageHref('visit', lang) },
  ]))}
  ${pageIntro(t('visit.title'), t('visit.intro'))}
  <div class="visit-faq">
    ${questions
      .map(
        (q) => `<section class="visit-question" aria-labelledby="visit-${q.id}">
      <h2 id="visit-${q.id}">${e(q.question)}</h2>
      <p>${e(q.text)}</p>
      ${q.html}
    </section>`,
      )
      .join('')}
  </div>`;
}

/** The page of one place: what the map panel shows, as an indexable page with its own address. */
function renderPlace(placeId) {
  const lang = getLang();
  const place = getPlace(placeId);
  const name = localized(place.name);
  const c = place.coordinates;
  const crumbs = [
    { name: t('places.home'), href: pageHref('home', lang) },
    { name: t('places.title'), href: pageHref('places', lang) },
    { name, href: placePageHref(place.id, lang) },
  ];
  const fact = (label, value) => (value ? `<div><dt>${e(label)}</dt><dd>${value}</dd></div>` : '');
  const others = PLACES.filter((p) => p.category === place.category && p.id !== place.id);
  return `${jsonLd(placeSchema(place))}${jsonLd(breadcrumbSchema(crumbs))}
  <nav class="breadcrumb" aria-label="${e(t('places.breadcrumb'))}">
    <ol>${crumbs.map((cr, i) => (i < crumbs.length - 1 ? `<li><a href="${cr.href}">${e(cr.name)}</a></li>` : `<li aria-current="page">${e(cr.name)}</li>`)).join('')}</ol>
  </nav>
  <article class="place-page">
    <header class="page-intro">
      ${categoryBadge(place.category)}
      <h1>${e(name)}</h1>
      ${name.includes(place.name.fr) ? '' : `<p class="place-official">${e(t('panel.officialName'))} <span lang="fr">${e(place.name.fr)}</span></p>`}
    </header>
    ${place.photos[0] ? photoFigure(place.photos[0]) : ''}
    <p class="place-description">${e(localized(place.description))}</p>
    <dl class="facts place-facts">
      ${fact(t('panel.location'), e(localized(place.location)))}
      ${fact(t('common.address'), place.address ? e(place.address) : '')}
      ${fact(t('common.website'), place.website ? `<a href="${e(place.website)}" target="_blank" rel="noopener">${e(place.website.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : '')}
      ${fact(t('panel.coordinates'), c ? `${c.lat.toFixed(5)}° N, ${c.lng.toFixed(5)}° E` : '')}
    </dl>
    <p class="panel-geo panel-geo--${place.geo.status}">${e(t(`panel.geoStatus.${place.geo.status}`))}</p>
    <p class="hero-actions">
      ${c ? `<a class="btn" href="${placeHref(place.id, lang)}">${e(t('common.viewOnMap'))}</a>` : ''}
      ${
        c
          ? `<a class="btn btn-ghost" href="${e(directionsLinks(c, name).google)}" target="_blank" rel="noopener">${e(t('panel.directionsGoogle'))}</a>
      <a class="btn btn-ghost" href="${e(directionsLinks(c, name).apple)}" target="_blank" rel="noopener">${e(t('panel.directionsApple'))}</a>`
          : ''
      }
    </p>
    ${placePhotosBlock(place.id, { href: (vp) => photoPageHref(vp.id, lang), level: 2 })}
    ${verifiedLine(place.lastVerified)}
    ${sourcesList([...place.factSources, ...place.geo.sources])}
  </article>
  ${
    others.length
      ? `<section class="section" aria-labelledby="place-others">
    ${sectionHead('place-others', t('places.others', { category: t(`categories.${place.category}`) }), { href: pageHref('places', lang), label: t('places.all') })}
    <ul class="places-list">${others.map((p) => `<li><a href="${placePageHref(p.id, lang)}">${e(localized(p.name))}</a></li>`).join('')}</ul>
  </section>`
      : ''
  }`;
}

/** Gallery of the photo map: every published viewpoint (or a call for the first photos). */
function renderPhotos() {
  const lang = getLang();
  const viewpoints = publishedViewpoints();
  const call = `<div class="callout photos-call">
      <h2>${e(t('photos.callTitle'))}</h2>
      <p>${e(t('photos.callText'))}</p>
      <p><a class="btn" href="${pageHref('contribute', lang)}">${e(t('photos.send'))}</a></p>
    </div>`;
  return `${jsonLd(breadcrumbSchema([
    { name: t('places.home'), href: pageHref('home', lang) },
    { name: t('photos.title'), href: pageHref('photos', lang) },
  ]))}
  ${pageIntro(t('photos.title'), t('photos.intro'))}
  <p class="places-map-link"><a class="btn" href="${pageHref('map', lang)}#photos">${e(t('photos.openMap'))}</a></p>
  ${
    viewpoints.length
      ? `<section class="section"><div class="grid grid-3">${viewpoints.map((vp) => viewpointCard(vp, photoPageHref(vp.id, lang))).join('')}</div></section>
  <section class="section">${call}</section>`
      : `<section class="section">${call.replace('photos-call', 'photos-call photos-empty')}</section>`
  }`;
}

/** The page of one viewpoint: its photo(s), the comparison or the call for the missing photo. */
function renderPhoto(viewpointId) {
  const lang = getLang();
  const vp = getViewpoint(viewpointId);
  const title = localized(vp.title);
  const crumbs = [
    { name: t('places.home'), href: pageHref('home', lang) },
    { name: t('photos.title'), href: pageHref('photos', lang) },
    { name: title, href: photoPageHref(vp.id, lang) },
  ];
  return `${jsonLd(viewpointSchema(vp))}${jsonLd(breadcrumbSchema(crumbs))}
  <nav class="breadcrumb" aria-label="${e(t('places.breadcrumb'))}">
    <ol>${crumbs.map((cr, i) => (i < crumbs.length - 1 ? `<li><a href="${cr.href}">${e(cr.name)}</a></li>` : `<li aria-current="page">${e(cr.name)}</li>`)).join('')}</ol>
  </nav>
  <article class="vp-page">
    <header class="page-intro">
      <span class="vp-badge vp-badge--${viewpointKind(vp)}">${e(t(`photos.kind.${viewpointKind(vp)}`))}</span>
      <h1>${e(title)}</h1>
      <p class="place-official">${e(localized(vp.location))}</p>
    </header>
    ${viewpointBody(vp)}
    <p class="hero-actions"><a class="btn btn-ghost" href="${photoMapHref(vp.id, lang)}">${e(t('common.viewOnMap'))}</a></p>
  </article>`;
}

/** Shown by the host for any unknown address. */
function renderNotFound() {
  const lang = getLang();
  return `<section class="not-found">
    <p class="not-found-code" aria-hidden="true">404</p>
    <h1>${e(t('notfound.title'))}</h1>
    <p class="lead">${e(t('notfound.text'))}</p>
    <p class="hero-actions">
      <a class="btn" href="${pageHref('home', lang)}">${e(t('notfound.home'))}</a>
      <a class="btn btn-ghost" href="${pageHref('map', lang)}">${e(t('notfound.map'))}</a>
    </p>
  </section>`;
}

const RENDERERS = {
  home: renderHome,
  businesses: renderBusinesses,
  history: renderHistory,
  life: renderLife,
  stories: renderStories,
  about: renderAbout,
  us: renderUs,
  contribute: renderContribute,
  legal: renderLegal,
  notfound: renderNotFound,
  places: renderPlaces,
  photos: renderPhotos,
  visit: renderVisit,
  voices: renderVoices,
};

export const CONTENT_PAGE_IDS = Object.keys(RENDERERS);

/** @param {string} pageId @param {{ today?: string }} [opts] today = YYYY-MM-DD (defaults to now in Morges) */
export function renderMain(pageId, opts) {
  if (pageId.startsWith('place:')) return renderPlace(pageId.slice('place:'.length));
  if (pageId.startsWith('photo:')) return renderPhoto(pageId.slice('photo:'.length));
  const render = RENDERERS[pageId];
  if (!render) throw new Error(`No renderer for page ${pageId}`);
  return render(opts);
}

