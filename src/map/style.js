/**
 * Morges.info map style — MapLibre style spec v8.
 *
 * Data: OpenFreeMap vector tiles (OpenMapTiles schema, built from OpenStreetMap).
 * Free, no API key, no registration. Attribution is mandatory (see ATTRIBUTION).
 *   https://openfreemap.org — tiles, fonts (glyphs)
 *   https://openmaptiles.org/schema/ — layer and field names used below
 *
 * Palette: warm white land, light stone buildings, muted sage greenery and a
 * pale Léman blue. No sprite / POI icons on purpose: our own markers carry
 * the points of interest, so the base map stays quiet.
 */

export const TILEJSON_URL = 'https://tiles.openfreemap.org/planet';
export const GLYPHS_URL = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

/** Required credit (OpenFreeMap FAQ + OSM licence). Replaced at runtime by the identical TileJSON string. */
export const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">&copy; OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

export const PALETTE = {
  land: '#f6f3ee', // warm white
  residential: '#f1ece4',
  stone: '#e7e0d5', // buildings (2D)
  stoneOutline: '#d8cfc1',
  stone3d: '#e9e3d9',
  plaza: '#efe9df', // pedestrian areas, squares
  sage: '#dde5d2', // parks, grass
  sageDeep: '#d0dbc3', // woods
  sageOutline: '#c5d1b6',
  pitch: '#e3e9d8',
  water: '#cfe1ea', // Lac Léman
  waterDeep: '#b9d3df',
  waterLabel: '#4f7487',
  ferry: '#9dbccb',
  road: '#ffffff',
  roadCasing: '#e0d8cb',
  roadMajor: '#fffdf9',
  roadMajorCasing: '#d6ccbc',
  motorway: '#f2e4c8',
  motorwayCasing: '#d9c6a2',
  path: '#c9bda9',
  rail: '#bdb5aa',
  label: '#5a605c',
  labelStrong: '#2b3a41',
  halo: 'rgba(246, 243, 238, 0.92)',
  boundary: '#b7aca0',
};

export const FONT = {
  regular: ['Noto Sans Regular'],
  bold: ['Noto Sans Bold'],
  italic: ['Noto Sans Italic'],
};

/** Localised name with fallback to the local (French) name. */
export function nameExpression(lang) {
  return ['coalesce', ['get', `name:${lang}`], ['get', 'name']];
}

/** Ids of symbol layers whose text follows the interface language. */
export const LOCALIZED_LABEL_LAYERS = ['water-label-line', 'water-label-point', 'place-label-minor', 'place-label-town'];

const lineGeom = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false];
const polyGeom = ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false];
const notTunnel = ['!=', ['get', 'brunnel'], 'tunnel'];
const cls = (...classes) => ['match', ['get', 'class'], classes, true, false];

const zoomWidth = (stops) => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops.flat()];

function roadPair(id, classFilter, { fill, casing, widths, casingExtra = 1.6, minzoom }) {
  const filter = ['all', lineGeom, notTunnel, classFilter];
  const base = { type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter };
  if (minzoom) base.minzoom = minzoom;
  return [
    {
      id: `${id}-casing`,
      ...base,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': casing,
        'line-width': zoomWidth(widths.map(([z, w]) => [z, w + casingExtra])),
      },
    },
    {
      id,
      ...base,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': fill, 'line-width': zoomWidth(widths) },
    },
  ];
}

/**
 * Build the style. `lang` sets map labels (lake, town names) to fr/en/de/it
 * when OSM has a translated name; street names stay in their official form.
 */
export function buildStyle({ lang = 'fr' } = {}) {
  const P = PALETTE;
  return {
    version: 8,
    name: 'Morges.info — Léman',
    glyphs: GLYPHS_URL,
    sources: {
      openmaptiles: { type: 'vector', url: TILEJSON_URL, attribution: ATTRIBUTION },
    },
    light: { anchor: 'viewport', color: '#fff8ee', intensity: 0.3, position: [1.2, 210, 35] },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': P.land } },

      // ---- land use & greenery ----
      {
        id: 'landuse-residential',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        filter: cls('residential', 'suburb', 'neighbourhood'),
        paint: { 'fill-color': P.residential },
      },
      {
        id: 'landcover-wood',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: cls('wood', 'forest'),
        paint: { 'fill-color': P.sageDeep },
      },
      {
        id: 'landcover-grass',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: cls('grass', 'farmland', 'wetland'),
        paint: { 'fill-color': P.sage, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 14, 1] },
      },
      {
        id: 'landuse-pitch',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        filter: cls('pitch', 'playground', 'stadium', 'cemetery'),
        paint: { 'fill-color': P.pitch },
      },
      {
        id: 'park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        filter: polyGeom,
        paint: { 'fill-color': P.sage },
      },
      {
        id: 'park-outline',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'park',
        filter: polyGeom,
        minzoom: 14,
        paint: { 'line-color': P.sageOutline, 'line-width': 0.8 },
      },

      // ---- water ----
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        filter: notTunnel,
        paint: { 'fill-color': P.water },
      },
      {
        id: 'water-edge',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'water',
        filter: notTunnel,
        minzoom: 13,
        paint: { 'line-color': P.waterDeep, 'line-width': 0.8, 'line-opacity': 0.7 },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        filter: ['all', notTunnel, lineGeom],
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': P.water,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 17, ['match', ['get', 'class'], 'river', 7, 2.5]],
        },
      },

      // ---- squares & pedestrian areas ----
      {
        id: 'plaza',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: polyGeom,
        minzoom: 14,
        paint: { 'fill-color': P.plaza, 'fill-outline-color': P.roadCasing },
      },

      // ---- transport ----
      {
        id: 'ferry',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', lineGeom, cls('ferry')],
        minzoom: 11,
        paint: { 'line-color': P.ferry, 'line-width': 1.2, 'line-dasharray': [3, 3] },
      },
      {
        id: 'path',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', lineGeom, notTunnel, cls('path', 'track')],
        minzoom: 14,
        paint: {
          'line-color': P.path,
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 0.6, 18, 1.8],
          'line-dasharray': [2, 1.5],
        },
      },
      ...roadPair('road-minor', cls('minor', 'service'), {
        fill: P.road,
        casing: P.roadCasing,
        widths: [[13, 0.6], [16, 5], [19, 18]],
        casingExtra: 1.2,
        minzoom: 12.5,
      }),
      ...roadPair('road-secondary', cls('secondary', 'tertiary'), {
        fill: P.roadMajor,
        casing: P.roadMajorCasing,
        widths: [[10, 0.8], [14, 4], [17, 11], [19, 22]],
      }),
      ...roadPair('road-primary', cls('primary', 'trunk'), {
        fill: P.roadMajor,
        casing: P.roadMajorCasing,
        widths: [[8, 0.8], [14, 5.5], [17, 14], [19, 26]],
      }),
      ...roadPair('road-motorway', cls('motorway'), {
        fill: P.motorway,
        casing: P.motorwayCasing,
        widths: [[7, 0.8], [12, 3], [16, 10], [19, 24]],
      }),
      {
        id: 'rail',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', lineGeom, notTunnel, cls('rail', 'transit')],
        minzoom: 11,
        paint: { 'line-color': P.rail, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 17, 2.2] },
      },
      {
        id: 'rail-ties',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['all', lineGeom, notTunnel, cls('rail', 'transit')],
        minzoom: 14,
        paint: {
          'line-color': P.rail,
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 3, 17, 6],
          'line-dasharray': [0.2, 3],
        },
      },

      // ---- buildings: flat in 2D, extruded in 3D (toggled at runtime) ----
      {
        id: 'building',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': P.stone,
          'fill-outline-color': P.stoneOutline,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.4, 15, 1],
        },
      },
      {
        id: 'building-3d',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 14,
        filter: ['!=', ['get', 'hide_3d'], true],
        layout: { visibility: 'none' },
        paint: {
          'fill-extrusion-color': P.stone3d,
          // OpenMapTiles render_height: OSM `height`, else `building:levels` × 3.66 m, else 5 m default.
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 5],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.92,
          'fill-extrusion-vertical-gradient': true,
        },
      },

      // ---- boundaries (CH–F border on the lake) ----
      {
        id: 'boundary-country',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        filter: ['==', ['get', 'admin_level'], 2],
        paint: { 'line-color': P.boundary, 'line-width': 1, 'line-dasharray': [4, 2], 'line-opacity': 0.6 },
      },

      // ---- labels ----
      {
        id: 'water-label-line',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'water_name',
        filter: lineGeom,
        layout: {
          'symbol-placement': 'line',
          'text-field': nameExpression(lang),
          'text-font': FONT.italic,
          'text-size': 15,
          'text-letter-spacing': 0.25,
        },
        paint: { 'text-color': P.waterLabel, 'text-halo-color': 'rgba(207,225,234,0.8)', 'text-halo-width': 1 },
      },
      {
        id: 'water-label-point',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'water_name',
        filter: ['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false],
        layout: {
          'text-field': nameExpression(lang),
          'text-font': FONT.italic,
          'text-size': ['interpolate', ['linear'], ['zoom'], 9, 13, 14, 17],
          'text-letter-spacing': 0.3,
          'text-max-width': 8,
        },
        paint: { 'text-color': P.waterLabel, 'text-halo-color': 'rgba(207,225,234,0.8)', 'text-halo-width': 1 },
      },
      {
        id: 'street-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        filter: ['all', lineGeom, cls('primary', 'secondary', 'tertiary', 'minor', 'service', 'trunk')],
        minzoom: 14.5,
        layout: {
          'symbol-placement': 'line',
          // Street names keep their official (French) form.
          'text-field': ['get', 'name'],
          'text-font': FONT.regular,
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10.5, 18, 13.5],
          'text-letter-spacing': 0.04,
          'text-rotation-alignment': 'map',
          'text-pitch-alignment': 'viewport',
        },
        paint: { 'text-color': P.label, 'text-halo-color': P.halo, 'text-halo-width': 1.4 },
      },
      {
        id: 'place-label-minor',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: cls('suburb', 'quarter', 'neighbourhood', 'hamlet', 'village'),
        minzoom: 11,
        maxzoom: 16.5,
        layout: {
          'text-field': nameExpression(lang),
          'text-font': FONT.regular,
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10.5, 15, 12.5],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.12,
          'text-max-width': 8,
        },
        paint: { 'text-color': '#7d827e', 'text-halo-color': P.halo, 'text-halo-width': 1.4 },
      },
      {
        id: 'place-label-town',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: cls('city', 'town'),
        maxzoom: 14,
        layout: {
          'text-field': nameExpression(lang),
          'text-font': FONT.bold,
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 13, 13, 18],
          'text-letter-spacing': 0.04,
          'text-max-width': 8,
        },
        paint: { 'text-color': P.labelStrong, 'text-halo-color': P.halo, 'text-halo-width': 1.6 },
      },
    ],
  };
}
