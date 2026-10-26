import './styles/main.css';
import { PLACES, MORGES_CENTER, getPlace } from './data/places.js';
import { detectInitialLang, setLang, getLang, onLangChange, t, localized, translateDom } from './i18n/index.js';
import { filterPlaces, filterViewpoints } from './ui/search.js';
import { publishedViewpoints, getViewpoint } from './data/viewpoints.js';
import { initCompare, photoMarker } from './site/photos.js';
import { pageHref } from './site/links.js';
import { createSidebar } from './ui/sidebar.js';
import { createInfoPanel } from './ui/info-panel.js';
import { initChrome, renderChrome } from './site/chrome.js';
import { startAnalytics } from './site/analytics.js';

const VIEW_KEY = 'morges-info:view';

/** 3D by default; a visitor who switched to 2D keeps 2D on their next visits. */
function savedView() {
  try {
    return localStorage.getItem(VIEW_KEY) === '2d' ? '2d' : '3d';
  } catch {
    return '3d';
  }
}

// Two modes on the same map: the places (default) and the photo map (viewpoints, "#photos" / "#vue-…").
const VIEWPOINTS = publishedViewpoints();
const isViewpointId = (id) => id.startsWith('vue-');
const getItem = (id) => (isViewpointId(id) ? getViewpoint(id, VIEWPOINTS) : getPlace(id));
const initialHash = window.location.hash.slice(1);

const state = {
  mode: initialHash === 'photos' || isViewpointId(initialHash) ? 'photos' : 'places',
  query: '',
  categories: new Set(),
  selectedId: null,
  listOpen: false,
  view: savedView(),
};

const $ = (id) => document.getElementById(id);
const searchInput = $('search-input');
const searchClear = $('search-clear');
const listToggle = $('list-toggle');
const sidebarEl = $('sidebar');
const panelEl = $('info-panel');
const mapEl = $('map');
const viewToggle = $('view-toggle');
const modeToggle = $('mode-toggle');

// ---------- language ----------
setLang(detectInitialLang(window.location.search), { persist: false });

function applyDocumentLanguage() {
  renderChrome('map');
  translateDom();
}
initChrome();

// ---------- components ----------
const mapUiStrings = () => ({
  zoomIn: t('map.zoomIn'),
  zoomOut: t('map.zoomOut'),
  resetBearing: t('map.resetBearing'),
  toggleAttribution: t('map.toggleAttribution'),
  mapTitle: t('map.label'),
});

function placesBounds() {
  const coords = PLACES.filter((p) => p.coordinates).map((p) => p.coordinates);
  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

const noop = () => {};

/**
 * Runs `fn` once the browser has painted the response to the current click or key press.
 * Work that is not visible straight away (moving the map, re-rendering the list) goes here, so the
 * page reacts at once — what the "Interaction to Next Paint" measure (INP) rewards.
 */
function afterNextPaint(fn) {
  requestAnimationFrame(() => setTimeout(fn, 0));
}

/** Placeholder until the map code has loaded; also used if WebGL2 is unavailable. */
function createInactiveMap({ supported }) {
  return {
    supported,
    setPlaces: noop,
    select: noop,
    focus: noop,
    clearPadding: noop,
    setView: noop,
    getView: () => '2d',
    setLanguage: noop,
    resize: noop,
  };
}

function showMapUnavailable() {
  mapEl.classList.add('is-unavailable');
  viewToggle.hidden = true;
  $('map-fallback').hidden = false;
  map = createInactiveMap({ supported: false });
  shownKey = '';
  render();
}

let map = createInactiveMap({ supported: true });

/** MapLibre (~440 kB gzipped with its worker) is loaded after the interface is usable. */
async function initMap() {
  let mod;
  try {
    mod = await import('./map/map.js');
  } catch (error) {
    console.error('Map code failed to load', error);
    showMapUnavailable();
    return;
  }
  if (!mod.isWebGL2Supported()) {
    showMapUnavailable();
    return;
  }
  try {
    map = mod.createMap(mapEl, {
      center: MORGES_CENTER,
      lang: getLang(),
      bounds: placesBounds(),
      onSelect: (id) => selectPlace(id, { fromMap: true }),
      getLabel: (item) => localized(item.name || item.title),
      uiStrings: mapUiStrings,
    });
  } catch (error) {
    console.error('Map initialisation failed', error);
    showMapUnavailable();
    return;
  }
  mapEl.dataset.ready = 'true';
  shownKey = '';
  if (state.view === '3d') map.setView('3d', { animate: false });
  render();
  const place = state.selectedId && getItem(state.selectedId);
  if (place) map.focus(place);
}

// The place opens full screen over the map (see main.css). Opening it adds a history entry,
// so the browser's or phone's Back button closes it.
let panelHistoryEntry = false;

const panel = createInfoPanel(panelEl, {
  onClose: () => selectPlace(null),
});

const sidebar = createSidebar({
  filtersEl: $('filters'),
  listEl: $('place-list'),
  countEl: $('results-count'),
  onToggleCategory: (id) => {
    if (id === null) state.categories.clear();
    else if (state.categories.has(id)) state.categories.delete(id);
    else state.categories.add(id);
    render();
  },
  onSelect: (id) => selectPlace(id, { fromList: true }),
});


// ---------- behaviour ----------
function visiblePlaces() {
  if (state.mode === 'photos') return filterViewpoints(VIEWPOINTS, state.query);
  return filterPlaces(PLACES, { query: state.query, categories: state.categories });
}


let shownKey = '';
/** Give the map these items, unless they are the ones it already shows (selection changes go through select()). */
function showOnMap(items) {
  const key = `${state.mode}|${map.supported}|${items.map((p) => p.id).join(',')}`;
  if (key === shownKey) return;
  shownKey = key;
  map.setPlaces(items);
}

function render() {
  const photos = state.mode === 'photos';
  const items = visiblePlaces();
  modeToggle.querySelectorAll('[data-mode]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.mode === state.mode)));
  document.body.classList.toggle('map-mode-photos', photos);
  $('filters').closest('.filters-block').hidden = photos;
  searchInput.placeholder = t(photos ? 'photos.searchPlaceholder' : 'search.placeholder');
  $('results-label').textContent = t(photos ? 'photos.listLabel' : 'results.listLabel');
  if (photos) {
    sidebar.renderPhotoList(items, state.selectedId, { total: VIEWPOINTS.length, contributeHref: pageHref('contribute', getLang()) });
    showOnMap(items.map(photoMarker));
    map.select(state.selectedId);
  } else {
    sidebar.renderFilters(state.categories);
    sidebar.renderList(items, state.selectedId);
    // A place inside another one (markerOf) is shown through that place's marker.
    const markerTargets = items.filter((p) => p.markerOf).map((p) => getPlace(p.markerOf));
    showOnMap([...new Set([...items, ...markerTargets])]);
    const selected = state.selectedId && getPlace(state.selectedId);
    map.select(selected ? selected.markerOf || selected.id : null);
  }
  searchClear.hidden = state.query.length === 0;
  listToggle.textContent = state.listOpen ? t('results.toggleHide') : t('results.toggleShow');
  listToggle.setAttribute('aria-expanded', String(state.listOpen));
  sidebarEl.classList.toggle('list-open', state.listOpen);
  viewToggle.querySelectorAll('[data-view]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.view === state.view));
  });
  $('view-note').hidden = state.view !== '3d' || !map.supported;
}

function setView(view, opts) {
  state.view = view === '3d' ? '3d' : '2d';
  try {
    localStorage.setItem(VIEW_KEY, state.view);
  } catch {
    /* ignore */
  }
  map.setView(state.view, opts);
  render();
}

/** Places ↔ photos. The address keeps the mode ("#photos") so it can be shared and survives a reload. */
function setMode(mode) {
  if (mode === state.mode) return;
  modeToggle.querySelectorAll('[data-mode]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode)));
  afterNextPaint(() => {
    if (mode === state.mode) return;
    if (state.selectedId) selectPlace(null);
    state.mode = mode;
    state.query = '';
    searchInput.value = '';
    const hash = mode === 'photos' ? '#photos' : '';
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    render();
  });
}

function selectPlace(id, { fromList = false } = {}) {
  const place = id ? getItem(id) : null;
  state.selectedId = place ? place.id : null;
  if (place) state.mode = isViewpointId(place.id) ? 'photos' : 'places';

  if (place) {
    panel.open(place, { focusPanel: true });
    // centred under the full-screen panel, ready for when it closes: no need to animate what nobody sees
    afterNextPaint(() => {
      if (state.selectedId === place.id) map.focus(place, { animate: false });
    });
    if (fromList) state.listOpen = false; // on mobile, the map is there when the panel closes
    if (window.location.hash !== `#${place.id}`) {
      const url = `${window.location.pathname}${window.location.search}#${place.id}`;
      if (!panelHistoryEntry) {
        window.history.pushState(null, '', url);
        panelHistoryEntry = true;
      } else {
        window.history.replaceState(null, '', url);
      }
    }
  } else {
    panel.close();
    map.clearPadding();
    if (panelHistoryEntry) {
      panelHistoryEntry = false;
      window.history.back(); // leaves the address without the place, like the page before
    } else if (window.location.hash !== (state.mode === 'photos' ? '#photos' : '')) {
      const hash = state.mode === 'photos' ? '#photos' : '';
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  }
  // the list and markers sit under the full-screen panel: they can follow once it is painted
  if (place) afterNextPaint(render);
  else render();
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  render();
});
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const [first] = visiblePlaces();
    if (first) selectPlace(first.id, { fromList: true });
  }
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  state.query = '';
  render();
  searchInput.focus();
});
modeToggle.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-mode]');
  if (btn) setMode(btn.dataset.mode);
});
viewToggle.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-view]');
  if (btn && btn.dataset.view !== state.view) setView(btn.dataset.view);
});
listToggle.addEventListener('click', () => {
  state.listOpen = !state.listOpen;
  render();
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (!id || id === 'photos') panelHistoryEntry = false; // Back button: the entry is already gone
  if (id === 'photos') {
    if (state.selectedId) selectPlace(null);
    state.mode = 'photos';
    render();
    return;
  }
  if (id !== (state.selectedId || '')) selectPlace(getItem(id) ? id : null);
});

onLangChange(() => {
  applyDocumentLanguage();
  map.setLanguage(getLang());
  panel.refresh();
  render();
});

// ---------- start ----------
applyDocumentLanguage();
render();
initCompare();
if (initialHash && initialHash !== 'photos' && getItem(initialHash)) selectPlace(initialHash);
initMap();
startAnalytics();

