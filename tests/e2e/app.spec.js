import { test, expect } from '@playwright/test';

// 1×1 transparent PNG — tests never hit the real OSM tile servers
// (OSMF tile policy discourages automated traffic).
const BLANK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: BLANK_PNG }),
  );
});

const markers = (page) => page.locator('.leaflet-marker-icon.poi-marker');
const panel = (page) => page.locator('#info-panel');

async function openList(page) {
  const toggle = page.locator('#list-toggle');
  if (await toggle.isVisible()) {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  }
}

test('loads in French by default with map, markers and OSM attribution', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page).toHaveTitle(/Carte interactive de Morges/);
  await expect(page.locator('.lang-btn[data-lang="fr"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lang-switcher')).toContainText('FR');
  await expect(page.locator('.lang-switcher')).toContainText('IT');
  await expect(markers(page)).toHaveCount(9); // Place du Marché has no verified position yet
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  await expect(page.locator('.leaflet-control-attribution a[href="https://www.openstreetmap.org/copyright"]')).toHaveCount(1);
  await expect(page.locator('#results-count')).toHaveText('10 lieu(x)');
  expect(errors).toEqual([]);
});

test('clicking a marker opens the information panel', async ({ page }) => {
  await page.goto('/');
  await page.locator('.poi-marker[data-place-id="chateau"]').click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page).locator('.panel-title')).toHaveText('Château de Morges');
  await expect(panel(page).locator('[data-field="category"]')).toHaveText('Patrimoine');
  await expect(panel(page).locator('[data-field="location"]')).toContainText('vieille ville');
  await expect(panel(page).locator('[data-field="coordinates"]')).toContainText('46.50669');
  await expect(panel(page).locator('[data-field="description"]')).toContainText('1286');
  await expect(page).toHaveURL(/#chateau$/);

  await panel(page).locator('.panel-close').click();
  await expect(panel(page)).toBeHidden();
});

const EXPECTED = {
  fr: { name: 'Gare de Morges', cat: 'Transports', close: 'Fermer', search: 'Château, port, gare…' },
  en: { name: 'Morges Railway Station', cat: 'Transport', close: 'Close', search: 'Castle, harbour, station…' },
  de: { name: 'Bahnhof Morges', cat: 'Verkehr', close: 'Schliessen', search: 'Schloss, Hafen, Bahnhof…' },
  it: { name: 'Stazione di Morges', cat: 'Trasporti', close: 'Chiudi', search: 'Castello, porto, stazione…' },
};

test('all four languages translate the interface and the open panel', async ({ page }) => {
  await page.goto('/#gare');
  await expect(panel(page)).toBeVisible();
  for (const [lang, exp] of Object.entries(EXPECTED)) {
    await page.locator(`.lang-btn[data-lang="${lang}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('#search-input')).toHaveAttribute('placeholder', exp.search);
    await expect(panel(page).locator('.panel-title')).toHaveText(exp.name);
    await expect(panel(page).locator('[data-field="category"]')).toHaveText(exp.cat);
    await expect(panel(page).locator('.panel-close')).toHaveAttribute('aria-label', exp.close);
    await expect(panel(page).locator('[data-field="description"]')).not.toBeEmpty();
    await expect(page).toHaveURL(new RegExp(`lang=${lang}`));
  }
});

test('language choice is kept after reload and can be set by URL', async ({ page }) => {
  await page.goto('/');
  await page.locator('.lang-btn[data-lang="de"]').click();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.goto('/?lang=it');
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  await expect(page.locator('.filters .chip').first()).toHaveText('Tutto');
});

test('search narrows the list and the map, Enter opens the first result', async ({ page }) => {
  await page.goto('/');
  await page.locator('#search-input').fill('chateau');
  await openList(page);
  // name matches are listed first; places mentioning the castle follow
  await expect(page.locator('.place-item').first()).toHaveAttribute('data-place-id', 'chateau');
  await expect(markers(page)).not.toHaveCount(9);
  await page.locator('#search-input').fill('Bahnhof'); // German name works in French UI
  await expect(markers(page)).toHaveCount(1);
  await page.locator('#search-input').press('Enter');
  await expect(panel(page).locator('.panel-title')).toHaveText('Gare de Morges');

  await page.locator('#search-input').fill('xyz-nothing');
  await openList(page);
  await expect(page.locator('.place-list .empty')).toBeVisible();
  await page.locator('#search-clear').click();
  await expect(markers(page)).toHaveCount(9);
});

test('category filters work and can be reset', async ({ page }) => {
  await page.goto('/');
  await page.locator('.chip[data-category="lake"]').click();
  await expect(markers(page)).toHaveCount(3);
  await page.locator('.chip[data-category="culture"]').click();
  await expect(markers(page)).toHaveCount(4);
  await page.locator('.chip[data-category=""]').click();
  await expect(markers(page)).toHaveCount(9);
});

test('selecting from the list opens the panel; unverified place shows a notice', async ({ page }) => {
  await page.goto('/');
  await openList(page);
  await page.locator('.place-item[data-place-id="place-du-marche"]').click();
  await expect(panel(page).locator('.panel-title')).toHaveText('Place du Marché');
  await expect(panel(page).locator('.panel-notice')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
});

test('no horizontal overflow and panel fits the viewport', async ({ page }) => {
  await page.goto('/#port');
  await expect(panel(page)).toBeVisible();
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  const vp = page.viewportSize();
  // wait for the slide-in transition to finish before measuring
  await expect(panel(page)).toHaveClass(/is-open/);
  await expect
    .poll(async () => {
      const box = await panel(page).boundingBox();
      return box.x >= 0 && box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1;
    })
    .toBe(true);
  await expect(page.locator('#map')).toBeVisible();
  const mapBox = await page.locator('#map').boundingBox();
  expect(mapBox.height).toBeGreaterThan(200);
});
