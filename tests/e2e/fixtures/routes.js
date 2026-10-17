import { syntheticTile } from './synthetic-tiles.js';
import { ATTRIBUTION } from '../../../src/map/style.js';

/**
 * Intercepts every request to the map providers so tests never hit the real
 * OpenFreeMap servers. Returns the list of intercepted URLs for assertions.
 */
export async function mockMapServices(page) {
  const requests = [];
  await page.route('https://tiles.openfreemap.org/**', (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname);
    if (url.pathname === '/planet') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tilejson: '3.0.0',
          tiles: ['https://tiles.openfreemap.org/test-fixture/{z}/{x}/{y}.pbf'],
          minzoom: 0,
          maxzoom: 14,
          attribution: ATTRIBUTION,
        }),
      });
    }
    const tile = url.pathname.match(/^\/test-fixture\/(\d+)\/(\d+)\/(\d+)\.pbf$/);
    if (tile) {
      const [, z, x, y] = tile.map(Number);
      return route.fulfill({ status: 200, contentType: 'application/x-protobuf', body: syntheticTile(z, x, y) });
    }
    // Fonts: an empty glyph range is valid (labels simply are not drawn).
    if (url.pathname.startsWith('/fonts/')) {
      return route.fulfill({ status: 200, contentType: 'application/x-protobuf', body: Buffer.alloc(0) });
    }
    return route.fulfill({ status: 404, body: '' });
  });
  // Safety net: no other external request is allowed during tests.
  await page.route(/^https?:\/\/(?!localhost)/, (route) => {
    if (route.request().url().startsWith('https://tiles.openfreemap.org/')) return route.fallback();
    requests.push(route.request().url());
    return route.abort();
  });
  return requests;
}
