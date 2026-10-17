import './styles/main.css';
import { PLACES, MORGES_CENTER, getPlace } from './data/places.js';
import { detectInitialLang, setLang, getLang, onLangChange, t, localized, translateDom } from './i18n/index.js';
import { filterPlaces } from './ui/search.js';
import { createSidebar } from './ui/sidebar.js';
import { createInfoPanel } from './ui/info-panel.js';
import { initChrome, renderChrome } from './site/chrome.js';

const VIEW_KEY = 'morges-info:view';

function savedView() {
  try {
    return localStorage.getItem(VIEW_KEY) === '3d' ? '3d' : '2d';
  } catch {
    return '2d';
  }
}

const state = {
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
      getLabel: (place) => localized(place.name),
      uiStrings: mapUiStrings,
    });
  } catch (error) {
    console.error('Map initialisation failed', error);
    showMapUnavailable();
    return;
  }
  mapEl.dataset.ready = 'true';
  if (state.view === '3d') map.setView('3d', { animate: false });
  render();
  const place = state.selectedId && getPlace(state.selectedId);
  if (place) map.focus(place, { padding: panelPadding() });
}

/** Small screens: the info panel covers the whole map (see main.css). */
const fullScreenPanel = window.matchMedia('(max-width: 900px)');

/** Room to leave for the info panel so the selected marker stays visible. */
function panelPadding() {
  if (panelEl.hidden || fullScreenPanel.matches) return {}; // centred, ready for when the panel closes
  const mapBox = mapEl.getBoundingClientRect();
  const box = panelEl.getBoundingClientRect();
  return { right: Math.max(0, mapBox.right - box.left) + 8 };
}

// On mobile, opening a place adds a history entry, so the phone's Back button closes the panel.
let panelHistoryEntry = false;

const panel = createInfoPanel(panelEl, {
  onClose: () => selectPlace(null),
  onFocus: (place) => map.focus(place, { padding: panelPadding() }),
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
  return filterPlaces(PLACES, { query: state.query, categories: state.categories });
}

function render() {
  const places = visiblePlaces();
  sidebar.renderFilters(state.categories);
  sidebar.renderList(places, state.selectedId);
  // A place inside another one (markerOf) is shown through that place's marker.
  const markerTargets = places.filter((p) => p.markerOf).map((p) => getPlace(p.markerOf));
  map.setPlaces([...new Set([...places, ...markerTargets])]);
  const selected = state.selectedId && getPlace(state.selectedId);
  map.select(selected ? selected.markerOf || selected.id : null);
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

function selectPlace(id, { fromList = false } = {}) {
  const place = id ? getPlace(id) : null;
  state.selectedId = place ? place.id : null;

  if (place) {
    panel.open(place, { focusPanel: fromList || fullScreenPanel.matches });
    map.focus(place, { padding: panelPadding() });
    if (fromList) state.listOpen = false; // on mobile, the map is there when the panel closes
    if (window.location.hash !== `#${place.id}`) {
      const url = `${window.location.pathname}${window.location.search}#${place.id}`;
      if (fullScreenPanel.matches && !panelHistoryEntry) {
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
    } else if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }
  render();
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
  if (!id) panelHistoryEntry = false; // Back button: the entry is already gone
  if (id !== (state.selectedId || '')) selectPlace(getPlace(id) ? id : null);
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
const initialId = window.location.hash.slice(1);
if (initialId && getPlace(initialId)) selectPlace(initialId);
initMap();

