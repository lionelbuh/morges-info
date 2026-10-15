import { describe, it, expect } from 'vitest';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { buildStyle, nameExpression, LOCALIZED_LABEL_LAYERS, ATTRIBUTION, TILEJSON_URL, FONT } from '../../src/map/style.js';
import { LANGUAGES } from '../../src/i18n/index.js';

describe('map style', () => {
  it.each(LANGUAGES)('is a valid MapLibre style in %s', (lang) => {
    expect(validateStyleMin(buildStyle({ lang }))).toEqual([]);
  });

  it('uses the free OpenFreeMap tiles without any API key', () => {
    const style = buildStyle();
    expect(style.sources.openmaptiles.url).toBe(TILEJSON_URL);
    expect(TILEJSON_URL).toBe('https://tiles.openfreemap.org/planet');
    expect(JSON.stringify(style)).not.toMatch(/key=|access_token|apikey/i);
  });

  it('declares the required OpenFreeMap / OpenMapTiles / OpenStreetMap attribution', () => {
    expect(buildStyle().sources.openmaptiles.attribution).toBe(ATTRIBUTION);
    expect(ATTRIBUTION).toContain('OpenFreeMap');
    expect(ATTRIBUTION).toContain('OpenMapTiles');
    expect(ATTRIBUTION).toContain('https://www.openstreetmap.org/copyright');
  });

  it('starts in 2D: extruded buildings hidden, flat buildings visible', () => {
    const layers = buildStyle().layers;
    const flat = layers.find((l) => l.id === 'building');
    const extruded = layers.find((l) => l.id === 'building-3d');
    expect(flat.layout?.visibility ?? 'visible').toBe('visible');
    expect(extruded.layout.visibility).toBe('none');
  });

  it('extrudes buildings only from OpenStreetMap-derived heights (5 m schema default)', () => {
    const extruded = buildStyle().layers.find((l) => l.id === 'building-3d');
    expect(extruded.paint['fill-extrusion-height']).toEqual(['coalesce', ['get', 'render_height'], 5]);
    expect(extruded.paint['fill-extrusion-base']).toEqual(['coalesce', ['get', 'render_min_height'], 0]);
  });

  it('localises lake and place labels, falling back to the local name', () => {
    const style = buildStyle({ lang: 'de' });
    for (const id of LOCALIZED_LABEL_LAYERS) {
      const layer = style.layers.find((l) => l.id === id);
      expect(layer, id).toBeTruthy();
      expect(layer.layout['text-field']).toEqual(nameExpression('de'));
    }
    expect(nameExpression('it')).toEqual(['coalesce', ['get', 'name:it'], ['get', 'name']]);
  });

  it('only uses fonts served by OpenFreeMap and no sprite icons', () => {
    const style = buildStyle();
    const allowed = new Set(Object.values(FONT).map((f) => f[0]));
    expect(style.sprite).toBeUndefined();
    for (const layer of style.layers) {
      expect(layer.layout?.['icon-image'], layer.id).toBeUndefined();
      const font = layer.layout?.['text-font'];
      if (font) expect(allowed.has(font[0]), layer.id).toBe(true);
    }
  });
});
