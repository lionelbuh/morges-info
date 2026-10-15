import { test, expect } from '@playwright/test';
import { mockMapServices } from './fixtures/routes.js';
import { PLACES } from '../../src/data/places.js';

/** Console errors from the app (WebGL driver performance notices are warnings, not errors). */
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

let externalRequests;
let errors;

test.beforeEach(async ({ page }) => {
  errors = collectErrors(page);
  externalRequests = await mockMapServices(page);
});

test.afterEach(async () => {
  // Only the (mocked) OpenFreeMap endpoints may be contacted.
  expect(externalRequests.filter((u) => u.startsWith('http'))).toEqual([]);
  expect(errors).toEqual([]);
});

const markers = (page) => page.locator('.poi-marker');
const marker = (page, id) => page.locator(`.poi-marker[data-place-id="${id}"]`);
const panel = (page) => page.locator('#info-panel');
const mapReady = (page) => expect(page.locator('#map')).toHaveAttribute('data-ready', 'true');

async function openList(page) {
  const toggle = page.locator('#list-toggle');
  if ((await toggle.isVisible()) && (await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

async function waitForIdle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const map = document.getElementById('map').__maplibre;
        if (!map.isMoving() && map.loaded()) resolve();
        else map.once('idle', () => resolve());
      }),
  );
}

/** Screen position of each marker's tip (bottom centre of the marker element). */
async function markerOffsets(page) {
  return page.evaluate(() => {
    const container = document.getElementById('map').getBoundingClientRect();
    return [...document.querySelectorAll('.poi-marker')].map((el) => {
      const box = el.getBoundingClientRect();
      return { id: el.dataset.placeId, tip: { x: box.left + box.width / 2 - container.left, y: box.bottom - container.top } };
    });
  });
}

async function expectMarkersOnCoordinates(page) {
  const tips = await markerOffsets(page);
  const projected = await page.evaluate((places) => {
    const map = document.getElementById('map').__maplibre;
    return Object.fromEntries(
      places.filter((p) => p.coordinates).map((p) => [p.id, map.project([p.coordinates.lng, p.coordinates.lat])]),
    );
  }, PLACES);
  expect(tips.length).toBeGreaterThan(0);
  for (const { id, tip } of tips) {
    const p = projected[id];
    expect(Math.hypot(tip.x - p.x, tip.y - p.y), `${id} marker tip vs coordinates`).toBeLessThan(2);
  }
}

test('loads in French by default with MapLibre map, 10 markers and attribution', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page).toHaveTitle(/Carte interactive de Morges/);
  await expect(page.locator('.lang-btn[data-lang="fr"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(markers(page)).toHaveCount(10);
  await expect(page.locator('#results-count')).toHaveText('10 lieux');
  const attribution = page.locator('.maplibregl-ctrl-attrib');
  await expect(attribution).toBeVisible();
  await expect(attribution).toContainText('OpenStreetMap');
  await expect(attribution).toContainText('OpenFreeMap');
  await expect(attribution.locator('a[href="https://www.openstreetmap.org/copyright"]')).toHaveCount(1);
  await expect(page.locator('#map')).toHaveAttribute('data-view', '2d');
  await expect(page.locator('#view-toggle [data-view="2d"]')).toHaveAttribute('aria-pressed', 'true');
});

test('markers sit exactly on their coordinates in 2D and in 3D', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await waitForIdle(page);
  await expectMarkersOnCoordinates(page);

  await page.locator('#view-toggle [data-view="3d"]').click();
  await expect(page.locator('#map')).toHaveAttribute('data-pitch', '55');
  await waitForIdle(page);
  await expectMarkersOnCoordinates(page);
});

test('clicking a marker opens the matching information panel', async ({ page }) => {
  for (const id of ['chateau', 'beausobre', 'gare']) {
    const place = PLACES.find((p) => p.id === id);
    // start from the overview each time: after a selection the map is zoomed in
    await page.goto('/');
    await mapReady(page);
    await waitForIdle(page);
    await marker(page, id).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).locator('.panel-title')).toHaveText(place.name.fr);
    await expect(panel(page).locator('[data-field="description"]')).toHaveText(place.description.fr);
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(marker(page, id)).toHaveClass(/is-selected/);
    await panel(page).locator('.panel-close').click();
    await expect(panel(page)).toBeHidden();
  }
});

test('2D / 3D switch tilts the map, shows extruded buildings and the height note', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await expect(page.locator('#view-note')).toBeHidden();

  await page.locator('#view-toggle [data-view="3d"]').click();
  await expect(page.locator('#view-toggle [data-view="3d"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#map')).toHaveAttribute('data-buildings', '3d');
  await expect(page.locator('#map')).toHaveAttribute('data-pitch', '55');
  await expect(page.locator('#view-note')).toBeVisible();
  await expect(page.locator('#view-note')).toContainText('5 m');
  const gestures = () => page.evaluate(() => { const m = document.getElementById('map').__maplibre; return [m.dragRotate.isEnabled(), m.touchPitch.isEnabled()]; });
  expect(await gestures()).toEqual([true, true]); // rotate / tilt only in 3D

  // markers, search and panel keep working in 3D
  await marker(page, 'temple').click();
  await expect(panel(page).locator('.panel-title')).toHaveText('Temple de Morges');
  await page.locator('#search-input').fill('port');
  await expect(marker(page, 'port')).toBeVisible();

  // the choice is remembered
  await waitForIdle(page);
  await page.reload();
  await mapReady(page);
  await expect(page.locator('#map')).toHaveAttribute('data-view', '3d');
  await expect(page.locator('#map')).toHaveAttribute('data-pitch', '55');

  await page.locator('#view-toggle [data-view="2d"]').click();
  await expect(page.locator('#map')).toHaveAttribute('data-buildings', '2d');
  await expect(page.locator('#map')).toHaveAttribute('data-pitch', '0');
  await expect(page.locator('#view-note')).toBeHidden();
  expect(await gestures()).toEqual([false, false]);
});

test('zoom controls work', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await waitForIdle(page);
  const zoom = () => page.evaluate(() => document.getElementById('map').__maplibre.getZoom());
  const before = await zoom();
  await page.locator('.maplibregl-ctrl-zoom-in').click();
  await waitForIdle(page);
  expect(await zoom()).toBeGreaterThan(before + 0.5);
  await page.locator('.maplibregl-ctrl-zoom-out').click();
  await waitForIdle(page);
  expect(Math.abs((await zoom()) - before)).toBeLessThan(0.1);
});

const EXPECTED = {
  fr: { name: 'Gare de Morges', cat: 'Transports', close: 'Fermer', search: 'Château, port, gare…', zoomIn: 'Zoom avant', view: 'Mode d’affichage de la carte' },
  en: { name: 'Morges Railway Station', cat: 'Transport', close: 'Close', search: 'Castle, harbour, station…', zoomIn: 'Zoom in', view: 'Map view' },
  de: { name: 'Bahnhof Morges', cat: 'Verkehr', close: 'Schliessen', search: 'Schloss, Hafen, Bahnhof…', zoomIn: 'Hineinzoomen', view: 'Kartenansicht' },
  it: { name: 'Stazione di Morges', cat: 'Trasporti', close: 'Chiudi', search: 'Castello, porto, stazione…', zoomIn: 'Ingrandisci', view: 'Visualizzazione della mappa' },
};

test('all four languages translate the interface, map controls, markers and the open panel', async ({ page }) => {
  await page.goto('/#gare');
  await mapReady(page);
  await expect(panel(page)).toBeVisible();
  for (const [lang, exp] of Object.entries(EXPECTED)) {
    await page.locator(`.lang-btn[data-lang="${lang}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('#search-input')).toHaveAttribute('placeholder', exp.search);
    await expect(panel(page).locator('.panel-title')).toHaveText(exp.name);
    await expect(panel(page).locator('[data-field="category"]')).toHaveText(exp.cat);
    await expect(panel(page).locator('.panel-close')).toHaveAttribute('aria-label', exp.close);
    await expect(page.locator('.maplibregl-ctrl-zoom-in')).toHaveAttribute('aria-label', exp.zoomIn);
    await expect(page.locator('#view-toggle')).toHaveAttribute('aria-label', exp.view);
    await expect(marker(page, 'gare')).toHaveAttribute('aria-label', exp.name);
    await expect(page).toHaveURL(new RegExp(`lang=${lang}`));
  }
});

test('language choice is kept after reload and can be set by URL', async ({ page }) => {
  // let the map finish loading before each navigation, so no request is aborted mid-way
  const load = async (url) => {
    await page.goto(url);
    await mapReady(page);
    await waitForIdle(page);
  };
  await load('/');
  await page.locator('.lang-btn[data-lang="de"]').click();
  await load('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await load('/?lang=it');
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await expect(page.locator('.filters .chip').first()).toHaveText('Tutto');
});

test('search narrows the list and the map, Enter opens the first result', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await page.locator('#search-input').fill('chateau');
  await openList(page);
  await expect(page.locator('.place-item').first()).toHaveAttribute('data-place-id', 'chateau');
  await expect(markers(page)).not.toHaveCount(10);
  await page.locator('#search-input').fill('Bahnhof'); // German name works in the French UI
  await expect(markers(page)).toHaveCount(1);
  await page.locator('#search-input').press('Enter');
  await expect(panel(page).locator('.panel-title')).toHaveText('Gare de Morges');

  await page.locator('#search-input').fill('xyz-nothing');
  await openList(page);
  await expect(page.locator('.place-list .empty')).toBeVisible();
  await expect(markers(page)).toHaveCount(0);
  await page.locator('#search-clear').click();
  await expect(markers(page)).toHaveCount(10);
});

test('category filters work and can be reset', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await page.locator('.chip[data-category="lake"]').click();
  await expect(markers(page)).toHaveCount(3);
  await page.locator('.chip[data-category="culture"]').click();
  await expect(markers(page)).toHaveCount(4);
  await page.locator('.chip[data-category=""]').click();
  await expect(markers(page)).toHaveCount(10);
});

test('selecting from the list opens the panel; Place du Marché is mapped as an approximate position', async ({ page }) => {
  await page.goto('/');
  await mapReady(page);
  await openList(page);
  await page.locator('.place-item[data-place-id="place-du-marche"]').click();
  await expect(panel(page).locator('.panel-title')).toHaveText('Place du Marché');
  await expect(panel(page).locator('[data-field="location"]')).toContainText('Grand-Rue');
  await expect(panel(page).locator('.panel-geo')).toHaveClass(/panel-geo--estimated/);
  await expect(panel(page).locator('.panel-notice')).toHaveCount(0);
  await expect(marker(page, 'place-du-marche')).toHaveClass(/is-selected/);
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
});

test('layout: no horizontal overflow, panel fits, controls and attribution stay visible', async ({ page }) => {
  await page.goto('/#port');
  await mapReady(page);
  await expect(panel(page)).toHaveClass(/is-open/);
  const vp = page.viewportSize();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  await expect
    .poll(async () => {
      const box = await panel(page).boundingBox();
      return box.x >= 0 && box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1;
    })
    .toBe(true);

  const intersects = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  const panelBox = await panel(page).boundingBox();
  for (const sel of ['#view-toggle', '.maplibregl-ctrl-zoom-in', '.maplibregl-ctrl-zoom-out']) {
    const box = await page.locator(sel).boundingBox();
    expect(intersects(box, panelBox), `${sel} hidden by panel`).toBe(false);
  }
  // the selected marker remains visible next to the panel
  const markerBox = await marker(page, 'port').boundingBox();
  expect(intersects(markerBox, panelBox), 'selected marker hidden by panel').toBe(false);

  const attribBox = await page.locator('.maplibregl-ctrl-attrib').boundingBox();
  if (intersects(attribBox, panelBox)) {
    // mobile bottom sheet: attribution is repeated inside the panel
    await expect(panel(page).locator('.panel-attribution')).toBeVisible();
    await expect(panel(page).locator('.panel-attribution')).toContainText('OpenStreetMap');
  }
  const mapBox = await page.locator('#map').boundingBox();
  expect(mapBox.height).toBeGreaterThan(200);
});

test('without WebGL2 the site still works and explains why the map is missing', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (type === 'webgl2') return null;
      return original.call(this, type, ...rest);
    };
  });
  await page.goto('/');
  await expect(page.locator('#map-fallback')).toBeVisible();
  await expect(page.locator('#view-toggle')).toBeHidden();
  await openList(page);
  await page.locator('.place-item[data-place-id="chateau"]').click();
  await expect(panel(page).locator('.panel-title')).toHaveText('Château de Morges');
});
