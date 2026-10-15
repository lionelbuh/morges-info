import './styles/main.css';
import { PLACES, MORGES_CENTER, getPlace } from './data/places.js';
import { detectInitialLang, setLang, getLang, onLangChange, t, localized, translateDom } from './i18n/index.js';
import { createMap } from './map/map.js';
import { filterPlaces } from './ui/search.js';
import { createSidebar } from './ui/sidebar.js';
import { createInfoPanel } from './ui/info-panel.js';
import { mountLanguageSwitcher } from './ui/language-switcher.js';

const state = {
  query: '',
  categories: new Set(),
  selectedId: null,
  listOpen: false,
};

const $ = (id) => document.getElementById(id);
const searchInput = $('search-input');
const searchClear = $('search-clear');
const listToggle = $('list-toggle');
const sidebarEl = $('sidebar');

// ---------- language ----------
setLang(detectInitialLang(window.location.search), { persist: false });

function applyDocumentLanguage() {
  document.documentElement.lang = getLang();
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  translateDom();
  const url = new URL(window.location.href);
  url.searchParams.set('lang', getLang());
  window.history.replaceState(null, '', url);
}

// ---------- components ----------
const map = createMap($('map'), {
  center: MORGES_CENTER,
  onSelect: (id) => selectPlace(id, { fromMap: true }),
  getLabel: (place) => localized(place.name),
});

const panel = createInfoPanel($('info-panel'), {
  onClose: () => selectPlace(null),
  onFocus: (place) => map.focus(place),
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

mountLanguageSwitcher($('lang-switcher'));

// ---------- behaviour ----------
function visiblePlaces() {
  return filterPlaces(PLACES, { query: state.query, categories: state.categories });
}

function render() {
  const places = visiblePlaces();
  sidebar.renderFilters(state.categories);
  sidebar.renderList(places, state.selectedId);
  map.setPlaces(places);
  map.select(state.selectedId);
  searchClear.hidden = state.query.length === 0;
  listToggle.textContent = state.listOpen ? t('results.toggleHide') : t('results.toggleShow');
  listToggle.setAttribute('aria-expanded', String(state.listOpen));
  sidebarEl.classList.toggle('list-open', state.listOpen);
}

function selectPlace(id, { fromList = false } = {}) {
  const place = id ? getPlace(id) : null;
  state.selectedId = place ? place.id : null;

  if (place) {
    panel.open(place, { focusPanel: fromList });
    map.focus(place);
    if (fromList) state.listOpen = false; // on mobile, reveal the map
    if (window.location.hash !== `#${place.id}`) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${place.id}`);
    }
  } else {
    panel.close();
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
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
listToggle.addEventListener('click', () => {
  state.listOpen = !state.listOpen;
  render();
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (id !== state.selectedId) selectPlace(getPlace(id) ? id : null);
});

onLangChange(() => {
  applyDocumentLanguage();
  map.refreshLabels();
  panel.refresh();
  render();
});

// ---------- start ----------
applyDocumentLanguage();
render();
const initialId = window.location.hash.slice(1);
if (initialId && getPlace(initialId)) selectPlace(initialId);

