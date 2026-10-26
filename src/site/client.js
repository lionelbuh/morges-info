/** Entry point of the content pages (home, businesses, history, local life, stories, about). */
import '../styles/main.css';
import { detectInitialLang, setLang, onLangChange, getLang, localized, t } from '../i18n/index.js';
import { PLACES, getPlace, MORGES_CENTER } from '../data/places.js';
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
  renderChrome(pageId);
  document.getElementById('main').innerHTML = renderMain(pageId);
  if (pageId === 'home') {
    mountMapPreview();
    startHomePhotos();
  }
  if (pageId === 'legal') syncAnalyticsControl();
}

onLangChange(render);
render();
initCompare();
startAnalytics();

// Content is re-rendered after load: honour #anchors (e.g. a story) once it is in place.
const anchor = window.location.hash.slice(1);
if (anchor) document.getElementById(anchor)?.scrollIntoView();
