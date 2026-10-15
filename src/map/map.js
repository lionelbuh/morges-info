import { Map as MapLibreMap, Marker, NavigationControl, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { getCategory } from '../data/categories.js';
import { buildStyle, nameExpression, LOCALIZED_LABEL_LAYERS, ATTRIBUTION } from './style.js';

setWorkerUrl(workerUrl);

export { ATTRIBUTION };

const DEFAULT_ZOOM = 15.4;
const FOCUS_ZOOM = 16.8;
const LABELS_ALL_ZOOM = 16.5; // from this zoom every marker shows its name
export const VIEW_3D = { pitch: 55, bearing: -18 };

/** MapLibre needs WebGL2. */
export function isWebGL2Supported() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function markerElement(place) {
  const cat = getCategory(place.category);
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'poi-marker';
  el.dataset.placeId = place.id;
  el.style.setProperty('--pin', cat.color);
  el.innerHTML = `
    <span class="poi-pin"><span class="poi-glyph" aria-hidden="true">${cat.icon}</span></span>
    <span class="poi-label"></span>`;
  return el;
}

/**
 * Create the MapLibre map.
 * @param {HTMLElement} el
 * @param {{ center: {lat:number,lng:number}, lang: string, bounds?: [[number,number],[number,number]],
 *           onSelect: (id:string)=>void, getLabel: (place)=>string, uiStrings: ()=>Record<string,string> }} options
 */
export function createMap(el, { center, lang, bounds, onSelect, getLabel, uiStrings, preview = false }) {
  const strings = uiStrings();
  const locale = preview
    ? undefined
    : {
        'NavigationControl.ZoomIn': strings.zoomIn,
        'NavigationControl.ZoomOut': strings.zoomOut,
        'NavigationControl.ResetBearing': strings.resetBearing,
        'AttributionControl.ToggleAttribution': strings.toggleAttribution,
        'Map.Title': strings.mapTitle,
      };
  const map = new MapLibreMap({
    container: el,
    style: buildStyle({ lang }),
    center: [center.lng, center.lat],
    zoom: DEFAULT_ZOOM,
    minZoom: 11,
    maxZoom: 19,
    maxPitch: 60,
    // Region around Morges: keeps navigation focused and tile requests modest.
    maxBounds: [
      [6.3, 46.42],
      [6.7, 46.6],
    ],
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: true, // only active in 3D (dragRotate is disabled in 2D)
    touchPitch: false,
    fadeDuration: 150,
    // Preview (home page): a still picture of the map; markers stay clickable.
    interactive: !preview,
    ...(locale ? { locale } : {}),
  });
  map.touchZoomRotate.disableRotation();

  // Requests cancelled because the visitor is leaving the page are not errors.
  // Any other map error is still reported.
  let leaving = false;
  const markLeaving = () => {
    leaving = true;
  };
  window.addEventListener('beforeunload', markLeaving);
  window.addEventListener('pagehide', markLeaving);
  map.on('error', (event) => {
    if (leaving) return;
    console.error('Map error:', event.error || event);
  });
  // Exposed for automated tests and debugging (read-only use).
  Object.defineProperty(el, '__maplibre', { value: map });
  el.dataset.view = '2d';

  if (!preview) map.addControl(new NavigationControl({ visualizePitch: true, showCompass: true }), 'top-left');
  map.addControl(new AttributionControl({ compact: false }), 'bottom-right');

  if (bounds) {
    map.fitBounds(bounds, { padding: preview ? 40 : 60, maxZoom: DEFAULT_ZOOM, duration: 0 });
  }

  /** @type {Map<string, {marker: Marker, el: HTMLButtonElement, place: object}>} */
  const markers = new Map();
  let selectedId = null;
  let view = '2d';

  function syncMarker(id) {
    const entry = markers.get(id);
    if (!entry) return;
    const label = getLabel(entry.place);
    const selected = id === selectedId;
    entry.el.setAttribute('aria-label', label);
    entry.el.setAttribute('aria-pressed', String(selected));
    entry.el.title = label;
    entry.el.querySelector('.poi-label').textContent = label;
    entry.el.classList.toggle('is-selected', selected);
    entry.el.style.zIndex = selected ? '10' : '';
  }

  function syncZoomClass() {
    el.classList.toggle('show-all-labels', map.getZoom() >= LABELS_ALL_ZOOM);
  }
  map.on('zoomend', syncZoomClass);
  map.on('load', syncZoomClass);

  function setView3d(enabled, { animate = true } = {}) {
    view = enabled ? '3d' : '2d';
    const apply = () => {
      map.setLayoutProperty('building-3d', 'visibility', enabled ? 'visible' : 'none');
      map.setLayoutProperty('building', 'visibility', enabled ? 'none' : 'visible');
      el.dataset.buildings = enabled ? '3d' : '2d';
    };
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);

    // Rotation and tilt gestures only in 3D, so the 2D map stays simple to use.
    if (enabled) {
      map.dragRotate.enable();
      map.touchZoomRotate.enableRotation();
      map.touchPitch.enable();
    } else {
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      map.touchPitch.disable();
    }
    const camera = enabled
      ? { pitch: VIEW_3D.pitch, bearing: VIEW_3D.bearing, zoom: Math.max(map.getZoom(), 15.5) }
      : { pitch: 0, bearing: 0 };
    if (animate && !prefersReducedMotion()) map.easeTo({ ...camera, duration: 900 });
    else map.jumpTo(camera);
    el.classList.toggle('is-3d', enabled);
    el.dataset.view = view;
  }

  map.on('moveend', () => {
    el.dataset.pitch = String(Math.round(map.getPitch()));
  });

  return {
    maplibre: map,
    supported: true,

    /** Show exactly these places (places without coordinates are skipped). */
    setPlaces(places) {
      const wanted = new Set();
      places.forEach((place) => {
        if (!place.coordinates) return;
        wanted.add(place.id);
        if (!markers.has(place.id)) {
          const elMarker = markerElement(place);
          elMarker.addEventListener('click', (event) => {
            event.stopPropagation();
            onSelect(place.id);
          });
          const marker = new Marker({
            element: elMarker,
            anchor: 'bottom',
            pitchAlignment: 'viewport',
            rotationAlignment: 'viewport',
          })
            .setLngLat([place.coordinates.lng, place.coordinates.lat])
            .addTo(map);
          markers.set(place.id, { marker, el: elMarker, place });
        }
        syncMarker(place.id);
      });
      for (const [id, entry] of markers) {
        if (!wanted.has(id)) {
          entry.marker.remove();
          markers.delete(id);
        }
      }
    },

    select(id) {
      const previous = selectedId;
      selectedId = id;
      if (previous) syncMarker(previous);
      if (id) syncMarker(id);
    },

    /** Centre a place, leaving room for the info panel (`padding` in px). */
    focus(place, { padding = {} } = {}) {
      if (!place || !place.coordinates) return;
      const camera = {
        center: [place.coordinates.lng, place.coordinates.lat],
        zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
        padding: { top: 0, right: 0, bottom: 0, left: 0, ...padding },
      };
      if (prefersReducedMotion()) map.jumpTo(camera);
      else map.easeTo({ ...camera, duration: 700 });
    },

    clearPadding() {
      map.easeTo({ padding: { top: 0, right: 0, bottom: 0, left: 0 }, duration: prefersReducedMotion() ? 0 : 300 });
    },

    setView(next, opts) {
      setView3d(next === '3d', opts);
    },

    getView() {
      return view;
    },

    /** Re-label markers, map labels and built-in controls after a language change. */
    setLanguage(nextLang) {
      markers.forEach((_, id) => syncMarker(id));
      const apply = () => {
        LOCALIZED_LABEL_LAYERS.forEach((layerId) => {
          if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'text-field', nameExpression(nextLang));
        });
      };
      if (map.isStyleLoaded()) apply();
      else map.once('load', apply);

      const s = uiStrings();
      const setLabel = (selector, text) => {
        el.querySelectorAll(selector).forEach((node) => {
          node.title = text;
          node.setAttribute('aria-label', text);
        });
      };
      setLabel('.maplibregl-ctrl-zoom-in', s.zoomIn);
      setLabel('.maplibregl-ctrl-zoom-out', s.zoomOut);
      setLabel('.maplibregl-ctrl-compass', s.resetBearing);
      setLabel('.maplibregl-ctrl-attrib-button', s.toggleAttribution);
      map.getCanvas().setAttribute('aria-label', s.mapTitle);
    },

    resize() {
      map.resize();
    },

    /** Free the WebGL context (used when a page re-renders the preview). */
    destroy() {
      window.removeEventListener('beforeunload', markLeaving);
      window.removeEventListener('pagehide', markLeaving);
      markers.forEach((entry) => entry.marker.remove());
      markers.clear();
      map.remove();
    },
  };
}
