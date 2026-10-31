/** Entry point of the content pages (home, businesses, history, local life, stories, about). */
import '../styles/main.css';
import { detectInitialLang, setLang, onLangChange, getLang, localized, t } from '../i18n/index.js';
import { PLACES, getPlace, MORGES_CENTER } from '../data/places.js';
import { initChrome, renderChrome } from './chrome.js';
import { renderMain, homePhotoViewpoints } from './pages.js';
import { placeHref, photoMapHref } from './links.js';
import { initCompare, photoMarker, homePhotoCard } from './photos.js';
import { initVoices, saveVoiceDraft, restoreVoiceDraft } from './voices.js';
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

/** Carousels: the ‹ › buttons scroll one slide; they show only when the slides overflow. */
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const trackOf = (box) => box.querySelector(':scope > .carousel-track');

function syncCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((box) => {
    const track = trackOf(box);
    box.querySelector(':scope > .carousel-controls').hidden = track.scrollWidth <= track.clientWidth + 1;
    box.querySelector(':scope > .carousel-controls [data-carousel-toggle]').hidden = reducedMotion();
  });
}

/** Scroll one slide forward or back; past the last slide, back to the first. */
function stepCarousel(box, direction) {
  const track = trackOf(box);
  const slide = track.querySelector(':scope > .carousel-slide:not([hidden])');
  const step = slide ? slide.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
  const behavior = reducedMotion() ? 'auto' : 'smooth';
  if (direction > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) track.scrollTo({ left: 0, behavior });
  else track.scrollBy({ left: direction * step, behavior });
}

/**
 * Carousels move on by themselves every 5 seconds, so the photos come alive. They wait while the
 * pointer or keyboard focus is on them, for a while after the visitor browses them, while they are
 * off screen, and stop with the pause button. Never for visitors who ask for reduced motion.
 */
const AUTOPLAY_MS = 5000;
const carouselState = new WeakMap();
let autoplayTimer = null;
let carouselObserver = null;

function startCarouselAutoplay() {
  clearInterval(autoplayTimer);
  if (carouselObserver) carouselObserver.disconnect();
  const boxes = [...document.querySelectorAll('[data-carousel]')];
  if (!boxes.length || reducedMotion()) return;
  carouselObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => entries.forEach((en) => (state(en.target).visible = en.isIntersecting)), { threshold: 0.5 })
      : null;
  boxes.forEach((box) => {
    state(box).visible = !carouselObserver;
    if (carouselObserver) carouselObserver.observe(box);
  });
  autoplayTimer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    boxes.forEach((box) => {
      const s = state(box);
      const controls = box.querySelector(':scope > .carousel-controls');
      if (!s.visible || s.paused || s.hovered || controls.hidden || Date.now() - s.touched < AUTOPLAY_MS * 2) return;
      // a card carousel waits while one of its cards' own photos is being looked at
      if (box.querySelector('[data-carousel]') && [...box.querySelectorAll('[data-carousel]')].some((inner) => state(inner).hovered)) return;
      stepCarousel(box, 1);
    });
  }, AUTOPLAY_MS);
}
function state(box) {
  if (!carouselState.has(box)) carouselState.set(box, { visible: false, paused: false, hovered: false, touched: 0 });
  return carouselState.get(box);
}
const carouselFrom = (event) => event.target.closest && event.target.closest('[data-carousel]');
document.addEventListener('pointerover', (event) => {
  const box = carouselFrom(event);
  if (box) state(box).hovered = true;
});
document.addEventListener('pointerout', (event) => {
  const box = carouselFrom(event);
  if (box && !box.contains(event.relatedTarget)) state(box).hovered = false;
});
document.addEventListener('focusin', (event) => {
  const box = carouselFrom(event);
  if (box) state(box).hovered = true;
});
document.addEventListener('focusout', (event) => {
  const box = carouselFrom(event);
  if (box && !box.contains(event.relatedTarget)) state(box).hovered = false;
});
document.addEventListener('touchstart', (event) => {
  const box = carouselFrom(event);
  if (box) state(box).touched = Date.now();
}, { passive: true });

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-carousel-toggle]');
  if (toggle) {
    const s = state(toggle.closest('[data-carousel]'));
    s.paused = !s.paused;
    toggle.setAttribute('aria-pressed', String(s.paused));
    toggle.setAttribute('aria-label', t(s.paused ? 'home.photosPlay' : 'home.photosPause'));
    toggle.firstElementChild.textContent = s.paused ? '▶' : '❚❚';
    return;
  }
  const btn = event.target.closest('[data-carousel-step]');
  if (!btn) return;
  const box = btn.closest('[data-carousel]');
  state(box).touched = Date.now();
  stepCarousel(box, Number(btn.dataset.carouselStep));
});
window.addEventListener('resize', syncCarousels);

/** Commerces: filter the cards by type. */
document.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-biz-filter]');
  if (!chip) return;
  const type = chip.dataset.bizFilter;
  document.querySelectorAll('[data-biz-filter]').forEach((c) => {
    c.setAttribute('aria-pressed', String(c === chip));
    c.classList.toggle('is-active', c === chip);
  });
  let shown = 0;
  document.querySelectorAll('.carousel--cards > .carousel-track > .carousel-slide').forEach((slide) => {
    const match = !type || slide.querySelector('[data-category]').dataset.category === type;
    slide.hidden = !match;
    if (match) shown += 1;
  });
  const count = document.querySelector('.biz-count');
  if (count) count.textContent = t(shown === 1 ? 'businesses.countOne' : 'businesses.countOther', { n: shown });
  document.querySelector('.carousel--cards > .carousel-track').scrollTo({ left: 0 });
  syncCarousels();
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

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-analytics-toggle]')) return;
  setAnalyticsOptOut(!analyticsOptedOut());
  syncAnalyticsControl();
});

function render() {
  if (previewObserver) previewObserver.disconnect();
  clearInterval(photoTimer);
  if (preview) {
    preview.destroy();
    preview = null;
  }
  const draft = pageId === 'voices' ? saveVoiceDraft() : null;
  const heroId = document.querySelector('[data-hero-id]')?.dataset.heroId;
  renderChrome(pageId);
  document.getElementById('main').innerHTML = renderMain(pageId, { heroId });
  if (pageId === 'voices') restoreVoiceDraft(draft);
  if (pageId === 'home') {
    mountMapPreview();
    startHomePhotos();
  }
  if (pageId === 'legal') syncAnalyticsControl();
  const filters = document.querySelector('.biz-filters');
  if (filters) filters.hidden = false;
  syncCarousels();
  startCarouselAutoplay();
}

onLangChange(render);
render();
initCompare();
initVoices();
startAnalytics();

// Content is re-rendered after load: honour #anchors (e.g. a story) once it is in place.
const anchor = window.location.hash.slice(1);
if (anchor) document.getElementById(anchor)?.scrollIntoView();
