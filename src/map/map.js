import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategory } from '../data/categories.js';

/**
 * OpenStreetMap standard tiles. Free, no API key, but subject to the OSMF
 * Tile Usage Policy (https://operations.osmfoundation.org/policies/tiles/):
 * visible attribution, no bulk downloading, moderate traffic only.
 * For higher traffic, switch TILE_URL to a commercial/self-hosted provider.
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

const DEFAULT_ZOOM = 15;
const FOCUS_ZOOM = 17;

function markerIcon(place, selected) {
  const cat = getCategory(place.category);
  return L.divIcon({
    className: 'poi-marker',
    html: `<span class="poi-pin${selected ? ' is-selected' : ''}" style="--pin:${cat.color}"><span class="poi-glyph" aria-hidden="true">${cat.icon}</span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    tooltipAnchor: [0, -38],
  });
}

/**
 * Create the Leaflet map.
 * @param {HTMLElement} el
 * @param {{ center: {lat:number,lng:number}, onSelect: (id:string)=>void, getLabel: (place)=>string }} options
 */
export function createMap(el, { center, onSelect, getLabel }) {
  const map = L.map(el, {
    center: [center.lat, center.lng],
    zoom: DEFAULT_ZOOM,
    minZoom: 12,
    maxZoom: 19,
    zoomControl: false,
  });
  L.control.zoom({ position: 'topleft' }).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');

  L.tileLayer(TILE_URL, {
    maxZoom: 19,
    attribution: TILE_ATTRIBUTION,
  }).addTo(map);

  /** @type {Map<string, L.Marker>} */
  const markers = new Map();
  const placesById = new Map();
  let selectedId = null;

  function refreshMarker(id) {
    const marker = markers.get(id);
    const place = placesById.get(id);
    if (!marker || !place) return;
    marker.setIcon(markerIcon(place, id === selectedId));
    const label = getLabel(place);
    marker.unbindTooltip().bindTooltip(label, { direction: 'top', className: 'poi-tooltip' });
    marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    const iconEl = marker.getElement();
    if (iconEl) {
      iconEl.setAttribute('title', label);
      iconEl.setAttribute('aria-label', label);
      iconEl.setAttribute('role', 'button');
      iconEl.dataset.placeId = id;
    }
  }

  return {
    leaflet: map,

    /** Show exactly these places (places without coordinates are skipped). */
    setPlaces(places) {
      const wanted = new Set();
      places.forEach((place) => {
        if (!place.coordinates) return;
        wanted.add(place.id);
        placesById.set(place.id, place);
        if (!markers.has(place.id)) {
          const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
            icon: markerIcon(place, place.id === selectedId),
            keyboard: true,
            riseOnHover: true,
          });
          marker.on('click', () => onSelect(place.id));
          marker.addTo(map);
          markers.set(place.id, marker);
        }
        refreshMarker(place.id);
      });
      for (const [id, marker] of markers) {
        if (!wanted.has(id)) {
          marker.remove();
          markers.delete(id);
        }
      }
    },

    select(id) {
      const previous = selectedId;
      selectedId = id;
      if (previous) refreshMarker(previous);
      if (id) refreshMarker(id);
    },

    focus(place) {
      if (!place || !place.coordinates) return;
      map.flyTo([place.coordinates.lat, place.coordinates.lng], Math.max(map.getZoom(), FOCUS_ZOOM), {
        duration: 0.6,
      });
    },

    /** Re-label markers after a language change. */
    refreshLabels() {
      markers.forEach((_, id) => refreshMarker(id));
    },

    invalidateSize() {
      map.invalidateSize();
    },
  };
}
