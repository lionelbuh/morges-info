/** Entry point of the content pages (home, businesses, history, local life, stories, about). */
import '../styles/main.css';
import { detectInitialLang, setLang, onLangChange, getLang, localized, t } from '../i18n/index.js';
import { PLACES, getPlace, MORGES_CENTER } from '../data/places.js';
import { upcomingEvents } from '../data/events.js';
import { calendarDayPanel } from './components.js';
import { initChrome, renderChrome } from './chrome.js';
import { renderMain, homePhotoViewpoints } from './pages.js';
import { placeHref, photoMapHref } from './links.js';
import { initCompare, photoMarker, homePhotoCard } from './photos.js';
import { startAnalytics, analyticsOptedOut, setAnalyticsOptOut, browserRefusesTracking } from './analytics.js';

const pageId = document.body.dataset.page;

// Links from the first version pointed to the map at "/#place-id".
if (pageId === 'home' && getPlace(window.location.hash.slice(1))) {
  window.location.replace(placeHref(window.location.hash.slice(1), detectInitialLang(window.location.search)));
}

setLang(detectInitialLang(window.location.search), { persist: false });
initChrome();

let preview = null;
let previewObserver = null;
let photoTimer = null;
let businessTimer = null;
let pairTimer = null;

/**
 * Home: the old photos take turns next to the map (every 6 s), each one highlighted on the map.
 * Stops while the pointer or keyboard focus is on it, with the pause button, and never moves for
 * visitors who ask for reduced motion.
 */
function startHomePhotos() {
  const box = document.getElementById('home-photos');
  const viewpoints = homePhotoViewpoints();
  if (!box || viewpoints.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const button = box.querySelector('.home-photos-pause');
  let index = 0;
  let paused = false;
  let hovered = false;
  button.hidden = false;
  const show = (i) => {
    index = (i + viewpoints.length) % viewpoints.length;
    const vp = viewpoints[index];
    box.querySelector('.home-photo').outerHTML = homePhotoCard(vp, photoMapHref(vp.id, getLang()));
    if (preview) preview.select(vp.id);
  };
  photoTimer = setInterval(() => {
    if (!paused && !hovered && document.visibilityState === 'visible') show(index + 1);
  }, 6000);
  box.addEventListener('mouseenter', () => (hovered = true));
  box.addEventListener('mouseleave', () => (hovered = false));
  box.addEventListener('focusin', () => (hovered = true));
  box.addEventListener('focusout', () => (hovered = false));
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = t(paused ? 'home.photosPlay' : 'home.photosPause');
  });
}

/** Home: the next photo of a business card, with a short fade (its photos are listed in data-photos). */
function nextBusinessPhoto(card) {
  const figure = card.querySelector('.business-photo[data-photos]');
  if (!figure) return;
  let photos;
  try {
    photos = JSON.parse(figure.dataset.photos);
  } catch {
    return; // keep the first photo
  }
  if (photos.length < 2) return;
  const index = (Number(figure.dataset.photoIndex || 0) + 1) % photos.length;
  figure.dataset.photoIndex = String(index);
  const next = photos[index];
  const loader = new Image();
  loader.onload = () => {
    const img = figure.querySelector('img');
    if (!img) return;
    img.classList.add('is-fading');
    setTimeout(() => {
      img.src = next.src;
      img.alt = next.alt;
      if (next.width) img.setAttribute('width', next.width);
      if (next.height) img.setAttribute('height', next.height);
      img.classList.remove('is-fading');
    }, 300);
  };
  loader.src = next.src;
}

/**
 * Home: the businesses one at a time. The one shown changes its photo every 4 s, and the next business
 * comes every 12 s, with ‹ › and pause buttons. Everything waits while the pointer or keyboard focus
 * is on it or the tab is hidden, and never moves for visitors who ask for reduced motion.
 */
function startBusinessSpotlight() {
  const box = document.querySelector('[data-biz-rotator]');
  const slides = box ? [...box.querySelectorAll('[data-biz-slide]')] : [];
  if (!slides.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = box.querySelector('[data-biz-controls]');
  let index = 0;
  let tick = 0;
  let paused = false;
  let hovered = false;
  const show = (i) => {
    index = (i + slides.length) % slides.length;
    tick = 0;
    slides.forEach((slide, n) => {
      const on = n === index;
      slide.classList.toggle('is-off', !on);
      slide.toggleAttribute('inert', !on);
      if (on) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    box.querySelector('[data-biz-pos]').textContent = `${index + 1} / ${slides.length}`;
  };
  if (controls) {
    const pause = box.querySelector('[data-biz-pause]');
    controls.hidden = false;
    pause.hidden = reduced;
    box.querySelectorAll('[data-biz-step]').forEach((btn) => btn.addEventListener('click', () => show(index + Number(btn.dataset.bizStep))));
    pause.addEventListener('click', () => {
      paused = !paused;
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = t(paused ? 'home.photosPlay' : 'home.photosPause');
    });
  }
  box.addEventListener('mouseenter', () => (hovered = true));
  box.addEventListener('mouseleave', () => (hovered = false));
  box.addEventListener('focusin', () => (hovered = true));
  box.addEventListener('focusout', () => (hovered = false));
  if (reduced) return;
  businessTimer = setInterval(() => {
    if (paused || hovered || document.visibilityState !== 'visible') return;
    tick += 1;
    if (tick >= 3 && slides.length > 1) show(index + 1);
    else nextBusinessPhoto(slides[index]);
  }, 4000);
}

/**
 * Photos page: a viewpoint with an old and a recent photo shows them in turn (every 4.5 s, the cards a
 * little apart), with a label. A card waits while the pointer is on it; nothing moves for visitors who
 * ask for reduced motion.
 */
function startPhotoPairs() {
  const cards = [...document.querySelectorAll('[data-vp-alternate]')];
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hovered = new Set();
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => hovered.add(card));
    card.addEventListener('mouseleave', () => hovered.delete(card));
  });
  let tick = 0;
  pairTimer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    const card = cards[tick % cards.length];
    tick += 1;
    if (hovered.has(card)) return;
    const now = !card.classList.contains('is-now');
    card.classList.toggle('is-now', now);
    card.querySelector('.vp-alt-then').toggleAttribute('aria-hidden', now);
    card.querySelector('.vp-alt-now').toggleAttribute('aria-hidden', !now);
    const label = card.querySelector('.vp-alt-label');
    label.textContent = now ? label.dataset.now : label.dataset.then;
  }, 4500 / cards.length);
}

/** Home: a small, non-interactive map, loaded only when it scrolls into view. */
function mountMapPreview() {
  const el = document.getElementById('map-preview');
  if (!el) return;
  const start = async () => {
    let mod;
    try {
      mod = await import('../map/map.js');
    } catch (error) {
      console.error('Map preview failed to load', error);
      return;
    }
    if (!mod.isWebGL2Supported() || !document.body.contains(el)) return; // the link to /carte/ stays
    const canvas = document.createElement('div');
    canvas.className = 'map-preview-canvas';
    el.prepend(canvas);
    // the photo map when there are photos, otherwise the places
    const viewpoints = homePhotoViewpoints();
    const items = viewpoints.length ? viewpoints.map(photoMarker) : PLACES;
    const coords = items.filter((p) => p.coordinates).map((p) => p.coordinates);
    preview = mod.createMap(canvas, {
      center: MORGES_CENTER,
      lang: getLang(),
      preview: true,
      bounds: [
        [Math.min(...coords.map((c) => c.lng)), Math.min(...coords.map((c) => c.lat))],
        [Math.max(...coords.map((c) => c.lng)), Math.max(...coords.map((c) => c.lat))],
      ],
      onSelect: (id) => window.location.assign(viewpoints.length ? photoMapHref(id, getLang()) : placeHref(id, getLang())),
      getLabel: (item) => localized(item.name || item.title),
      uiStrings: () => ({}),
    });
    preview.setPlaces(items);
    const shown = document.querySelector('#home-photos .home-photo');
    if (shown) preview.select(shown.dataset.vpId);
    el.classList.add('is-live');
    canvas.dataset.ready = 'true';
  };
  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }
  previewObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        previewObserver.disconnect();
        start();
      }
    },
    { rootMargin: '200px' },
  );
  previewObserver.observe(el);
}

/** Commerces: a thumbnail shows its photo large in the gallery. */
document.addEventListener('click', (event) => {
  const thumb = event.target.closest('[data-gallery-thumb]');
  if (!thumb) return;
  const gallery = thumb.closest('[data-gallery]');
  const img = gallery.querySelector('[data-gallery-stage] img');
  img.src = thumb.dataset.src;
  img.alt = thumb.dataset.alt;
  if (thumb.dataset.width) {
    img.width = Number(thumb.dataset.width);
    img.height = Number(thumb.dataset.height);
  }
  gallery.querySelector('[data-gallery-stage] figcaption').textContent = thumb.dataset.credit;
  gallery.querySelectorAll('[data-gallery-thumb]').forEach((other) => other.setAttribute('aria-pressed', String(other === thumb)));
});

/** Commerces: filter the businesses by type. */
document.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-biz-filter]');
  if (!chip) return;
  const type = chip.dataset.bizFilter;
  document.querySelectorAll('[data-biz-filter]').forEach((c) => {
    c.setAttribute('aria-pressed', String(c === chip));
    c.classList.toggle('is-active', c === chip);
  });
  let shown = 0;
  document.querySelectorAll('.biz-list > .biz-profile').forEach((profile) => {
    const match = !type || profile.dataset.category === type;
    profile.hidden = !match;
    if (match) shown += 1;
  });
  const count = document.querySelector('.biz-count');
  if (count) count.textContent = t(shown === 1 ? 'businesses.countOne' : 'businesses.countOther', { n: shown });
});

/** Legal page: the visitor can turn audience statistics off (or on again) on this device. */
function syncAnalyticsControl() {
  const button = document.querySelector('[data-analytics-toggle]');
  const status = document.querySelector('.analytics-status');
  if (!button || !status) return;
  if (browserRefusesTracking()) {
    button.hidden = true;
    status.textContent = t('legal.analyticsStatusBrowser');
    return;
  }
  const off = analyticsOptedOut();
  button.hidden = false;
  button.textContent = t(off ? 'legal.analyticsTurnOn' : 'legal.analyticsTurnOff');
  status.textContent = t(off ? 'legal.analyticsStatusOff' : 'legal.analyticsStatusOn');
}

/**
 * Local life: a day of the calendar opens the list of its events under its month; again, or "Fermer",
 * closes it. Without JavaScript the day links to its first event.
 */
document.addEventListener('click', (event) => {
  const close = event.target.closest('.cal-close');
  const day = event.target.closest('.cal-day[data-day]');
  if (!close && !day) return;
  const month = (close || day).closest('.cal-month');
  const panel = month && month.querySelector('.cal-panel');
  if (!panel) return;
  const selected = month.querySelector('.cal-day.is-selected');
  const hide = () => {
    panel.hidden = true;
    panel.innerHTML = '';
    if (selected) {
      selected.classList.remove('is-selected');
      selected.removeAttribute('aria-expanded');
    }
  };
  event.preventDefault();
  if (close) {
    hide();
    if (selected) selected.focus();
    return;
  }
  if (day === selected) {
    hide();
    return;
  }
  hide();
  document.querySelectorAll('.cal-day.is-selected').forEach((el) => el.classList.remove('is-selected'));
  document.querySelectorAll('.cal-panel').forEach((el) => {
    el.hidden = true;
    el.innerHTML = '';
  });
  day.classList.add('is-selected');
  day.setAttribute('aria-expanded', 'true');
  panel.innerHTML = calendarDayPanel(day.dataset.day, upcomingEvents());
  panel.hidden = false;
  panel.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-analytics-toggle]')) return;
  setAnalyticsOptOut(!analyticsOptedOut());
  syncAnalyticsControl();
});

function render() {
  if (previewObserver) previewObserver.disconnect();
  clearInterval(photoTimer);
  clearInterval(businessTimer);
  clearInterval(pairTimer);
  if (preview) {
    preview.destroy();
    preview = null;
  }
  const heroId = document.querySelector('[data-hero-id]')?.dataset.heroId;
  renderChrome(pageId);
  document.getElementById('main').innerHTML = renderMain(pageId, { heroId });
  if (pageId === 'home') {
    mountMapPreview();
    startHomePhotos();
    startBusinessSpotlight();
  }
  if (pageId === 'photos') startPhotoPairs();
  if (pageId === 'legal') syncAnalyticsControl();
  const filters = document.querySelector('.biz-filters');
  if (filters) filters.hidden = false;
}

onLangChange(render);
render();
initCompare();
startAnalytics();

// Content is re-rendered after load: honour #anchors (e.g. a story) once it is in place.
const anchor = window.location.hash.slice(1);
// from the home page's calendar: #jour-2026-12-05 opens that day
const dayLink = /^jour-(\d{4}-\d{2}-\d{2})$/.exec(anchor);
const dayTile = dayLink && document.querySelector(`.cal-day[data-day="${dayLink[1]}"]`);
if (dayTile) {
  dayTile.click();
  dayTile.scrollIntoView({ block: 'center' });
} else if (anchor) document.getElementById(anchor)?.scrollIntoView();
