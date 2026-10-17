/**
 * Main content of each content page, as HTML strings. The map page has its
 * own static markup (carte/index.html + src/main.js).
 *
 * Rule: a section is rendered only when it has real content — no empty
 * placeholders (e.g. the businesses block on the home page stays hidden
 * until a verified business exists).
 */
import { t, getLang } from '../i18n/index.js';
import { escapeHtml as e } from '../ui/dom.js';
import { getPlace } from '../data/places.js';
import { editorialSelection } from '../data/businesses.js';
import { upcomingEvents } from '../data/events.js';
import { PRACTICAL, OFFICIAL_LINKS } from '../data/practical.js';
import { STORIES, featuredStory } from '../data/stories.js';
import { MILESTONES } from '../data/history.js';
import { HERO_PHOTO } from '../data/photos.js';
import heroManifest from '../data/hero-manifest.json' with { type: 'json' };
import { pageHref, placeHref, storyHref } from './links.js';
import {
  placeCard,
  eventCard,
  practicalCard,
  businessCard,
  storyArticle,
  textBlock,
  frenchOnlyNotice,
  sourcesList,
  heroPhoto,
  emailLink,
} from './components.js';
import { CONTACT_EMAIL } from './config.js';
import { formatDate } from './format.js';

/** Date shown at the bottom of the legal notice; change it when the text changes. */
const LEGAL_UPDATED = '2026-10-17'; // audience statistics section added

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

function renderHome({ today } = {}) {
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

  const hero = heroPhoto(HERO_PHOTO, heroManifest, { sizes: '(max-width: 860px) 100vw, 680px' });

  return `<div class="lead-story${hero ? ' lead-story--photo' : ''}">
  ${hero}
  <section class="hero">
    <p class="kicker">${e(t('home.kicker'))}</p>
    <h1>${e(t('site.tagline'))}</h1>
    <p class="lead">${e(t('home.intro'))}</p>
    <p class="hero-actions">
      <a class="btn" href="${pageHref('map', lang)}">${e(t('home.mapCta'))}</a>
      <a class="btn btn-ghost" href="${pageHref('history', lang)}">${e(t('nav.history'))}</a>
    </p>
  </section>
  </div>

  <section class="section" aria-labelledby="home-map">
    ${sectionHead('home-map', t('home.mapTitle'), { href: pageHref('map', lang), label: t('home.mapCta') })}
    <p class="section-text">${e(t('home.mapText'))}</p>
    <div class="map-preview" id="map-preview">
      <a class="map-preview-fallback" href="${pageHref('map', lang)}">${e(t('home.mapCta'))}</a>
    </div>
  </section>

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

function renderBusinesses() {
  const selection = editorialSelection();
  const criteria = ['local', 'independent', 'verified', 'free'].map((k) => `<li>${e(t(`businesses.criteria.${k}`))}</li>`).join('');
  return `${pageIntro(t('home.businessesTitle'), t('businesses.intro'))}
  ${
    selection.length
      ? `<section class="section"><div class="grid grid-3">${selection.map(businessCard).join('')}</div></section>`
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
  return `${pageIntro(t('life.title'), t('life.intro'))}
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
  return `${pageIntro(t('stories.title'), t('stories.intro'))}
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
  ${['data', 'photos', 'storage'].map((k) => block(k)).join('')}
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
};

export const CONTENT_PAGE_IDS = Object.keys(RENDERERS);

/** @param {string} pageId @param {{ today?: string }} [opts] today = YYYY-MM-DD (defaults to now in Morges) */
export function renderMain(pageId, opts) {
  const render = RENDERERS[pageId];
  if (!render) throw new Error(`No renderer for page ${pageId}`);
  return render(opts);
}

