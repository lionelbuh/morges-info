/**
 * SYNTHETIC test tiles — NOT real geographic data.
 *
 * The CI/sandbox environment cannot (and should not) call the OpenFreeMap tile
 * servers, so e2e tests serve these invented shapes instead. They use the same
 * OpenMapTiles layer names as the production tiles, which lets the tests check
 * that the style renders water, greenery, roads and (in 3D) extruded buildings.
 * Shapes are deliberately simple rectangles/lines near Morges and must never be
 * presented as the real map of Morges.
 */
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';

const rect = (w, s, e, n) => [[[w, s], [e, s], [e, n], [w, n], [w, s]]];
const poly = (coordinates, properties = {}) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Polygon', coordinates },
});
const line = (coordinates, properties = {}) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'LineString', coordinates },
});
const fc = (features) => ({ type: 'FeatureCollection', features });

function buildings() {
  const out = [];
  let i = 0;
  for (let lng = 6.4925; lng < 6.503; lng += 0.0009) {
    for (let lat = 46.5075; lat < 46.5155; lat += 0.0007) {
      i += 1;
      out.push(
        poly(rect(lng, lat, lng + 0.0005, lat + 0.0003), {
          render_height: [5, 9, 12, 15, 20][i % 5],
          render_min_height: 0,
        }),
      );
    }
  }
  return out;
}

const LAYERS = {
  water: fc([poly(rect(6.4, 46.45, 6.6, 46.5063), { class: 'lake' })]),
  water_name: fc([{ type: 'Feature', properties: { name: 'Lac Léman', 'name:de': 'Genfersee' }, geometry: { type: 'Point', coordinates: [6.5, 46.49] } }]),
  park: fc([poly(rect(6.4945, 46.5063, 6.4965, 46.5075), { class: 'park' })]),
  landcover: fc([poly(rect(6.503, 46.512, 6.507, 46.516), { class: 'grass' })]),
  landuse: fc([poly(rect(6.485, 46.5075, 6.51, 46.52), { class: 'residential' })]),
  transportation: fc([
    line([[6.488, 46.5072], [6.508, 46.5105]], { class: 'secondary' }),
    line([[6.494, 46.5075], [6.4945, 46.516]], { class: 'minor' }),
    line([[6.499, 46.508], [6.4995, 46.516]], { class: 'minor' }),
    line([[6.485, 46.5112], [6.51, 46.5115]], { class: 'rail' }),
    line([[6.498, 46.506], [6.52, 46.47]], { class: 'ferry' }),
    poly(rect(6.4975, 46.5082, 6.4985, 46.5088), { class: 'pedestrian' }),
  ]),
  transportation_name: fc([line([[6.488, 46.5072], [6.508, 46.5105]], { class: 'secondary', name: 'Rue de test' })]),
  building: fc(buildings()),
  place: fc([{ type: 'Feature', properties: { class: 'town', name: 'Morges' }, geometry: { type: 'Point', coordinates: [6.4985, 46.511] } }]),
};

const indexes = Object.fromEntries(
  Object.entries(LAYERS).map(([name, data]) => [name, geojsonvt(data, { maxZoom: 14, indexMaxZoom: 14, buffer: 64 })]),
);

/** Returns an MVT tile (Buffer) for z/x/y, or an empty buffer when nothing intersects. */
export function syntheticTile(z, x, y) {
  const layers = {};
  for (const [name, index] of Object.entries(indexes)) {
    const tile = index.getTile(z, x, y);
    if (tile && tile.features.length) layers[name] = tile;
  }
  if (Object.keys(layers).length === 0) return Buffer.alloc(0);
  return Buffer.from(vtpbf.fromGeojsonVt(layers, { version: 2 }));
}
