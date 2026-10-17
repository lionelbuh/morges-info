/** Entry point of the content pages (home, businesses, history, local life, stories, about). */
import '../styles/main.css';
import { detectInitialLang, setLang, onLangChange, getLang, localized, t } from '../i18n/index.js';
import { PLACES, getPlace, MORGES_CENTER } from '../data/places.js';
import { initChrome, renderChrome } from './chrome.js';
import { renderMain } from './pages.js';
import { placeHref } from './links.js';
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
    const coords = PLACES.filter((p) => p.coordinates).map((p) => p.coordinates);
    preview = mod.createMap(canvas, {
      center: MORGES_CENTER,
      lang: getLang(),
      preview: true,
      bounds: [
        [Math.min(...coords.map((c) => c.lng)), Math.min(...coords.map((c) => c.lat))],
        [Math.max(...coords.map((c) => c.lng)), Math.max(...coords.map((c) => c.lat))],
      ],
      onSelect: (id) => window.location.assign(placeHref(id, getLang())),
      getLabel: (place) => localized(place.name),
      uiStrings: () => ({}),
    });
    preview.setPlaces(PLACES);
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
  if (preview) {
    preview.destroy();
    preview = null;
  }
  renderChrome(pageId);
  document.getElementById('main').innerHTML = renderMain(pageId);
  if (pageId === 'home') mountMapPreview();
  if (pageId === 'legal') syncAnalyticsControl();
}

onLangChange(render);
render();
startAnalytics();

// Content is re-rendered after load: honour #anchors (e.g. a story) once it is in place.
const anchor = window.location.hash.slice(1);
if (anchor) document.getElementById(anchor)?.scrollIntoView();
