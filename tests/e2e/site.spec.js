import { test, expect } from '@playwright/test';
import { mockMapServices } from './fixtures/routes.js';
import { PAGES } from '../../src/site/config.js';
import fr from '../../src/i18n/locales/fr.js';
import de from '../../src/i18n/locales/de.js';

let errors;
let externalRequests;

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  externalRequests = await mockMapServices(page);
});

test.afterEach(async () => {
  expect(externalRequests.filter((u) => u.startsWith('http'))).toEqual([]);
  expect(errors).toEqual([]);
});

const CONTENT_PAGES = PAGES.filter((p) => p.id !== 'map');

/** Main navigation link; opens the mobile menu first when the layout uses it. */
async function navLink(page, name) {
  const toggle = page.locator('.nav-toggle');
  if ((await toggle.isVisible()) && (await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  return page.locator('.site-nav-list').getByRole('link', { name, exact: true });
}

for (const p of CONTENT_PAGES) {
  test(`${p.path} renders in French with its title, h1, navigation and footer`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page).toHaveTitle(fr.pages[p.id].title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', fr.pages[p.id].description);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.site-footer')).toBeVisible();
    if (PAGES.find((x) => x.id === p.id).nav) {
      await expect(page.locator(`.site-nav-list a[aria-current="page"]`)).toHaveAttribute('href', p.path);
    }
  });
}

test('pages are prerendered: real content without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/histoire/');
  await expect(page.locator('main h1')).toHaveText(fr.history.title);
  await expect(page.locator('.milestone')).not.toHaveCount(0);
  await page.goto('/');
  await expect(page.locator('main h1')).toHaveText(fr.site.tagline);
  await context.close();
});

test('home: map preview with markers, places, practical info and featured story; no empty business block', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section[aria-labelledby="home-places"] .place-card')).toHaveCount(4);
  await expect(page.locator('.feature-story')).toBeVisible();
  await expect(page.locator('#home-businesses')).toHaveCount(0); // no verified business yet
  // hero photograph: loaded, described, credited with its licence
  const hero = page.locator('.hero-photo img');
  await expect(hero).toHaveAttribute('alt', /château de Morges/);
  await expect.poll(() => hero.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await hero.evaluate((img) => img.currentSrc)).toMatch(/\.avif$/);
  await expect(page.locator('.hero-credit a[href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"]')).toHaveText('CC BY-SA 4.0');
  await expect(page.locator('.hero-credit')).toContainText('D. Jaquet');
  await page.locator('#map-preview').scrollIntoViewIfNeeded();
  await expect(page.locator('#map-preview .poi-marker')).toHaveCount(17);
  await expect(page.locator('#map-preview .maplibregl-ctrl-attrib')).toContainText('OpenStreetMap');
  // clicking a preview marker opens it on the map page
  await page.locator('#map-preview .poi-marker[data-place-id="beausobre"]').click();
  await expect(page).toHaveURL(/\/carte\/#beausobre$/);
  await expect(page.locator('#info-panel .panel-title')).toHaveText('Théâtre de Beausobre');
});

test('old map links (/#place) redirect to the map page', async ({ page }) => {
  await page.goto('/#temple');
  await expect(page).toHaveURL(/\/carte\/#temple$/);
  await expect(page.locator('#info-panel .panel-title')).toHaveText('Temple de Morges');
});

test('navigation links lead to every section', async ({ page }) => {
  await page.goto('/');
  for (const p of PAGES.filter((x) => x.nav && x.id !== 'map')) {
    await (await navLink(page, fr.nav[p.id])).click();
    await expect(page).toHaveURL(new RegExp(`${p.path}$`));
    await expect(page.locator('main h1')).toBeVisible();
  }
});

test('language switch translates the page and carries over to other pages', async ({ page }) => {
  await page.goto('/vie-locale/');
  await page.locator('.lang-btn[data-lang="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page).toHaveURL(/\/vie-locale\/\?lang=de$/);
  await expect(page.locator('main h1')).toHaveText(de.life.title);
  await expect(page).toHaveTitle(de.pages.life.title);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://morges.info/vie-locale/?lang=de');
  await expect(await navLink(page, de.nav.history)).toHaveAttribute('href', '/histoire/?lang=de');

  await (await navLink(page, de.nav.map)).click();
  await expect(page).toHaveURL(/\/carte\/\?lang=de$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('#search-input')).toHaveAttribute('placeholder', de.search.placeholder);

  // remembered without the URL parameter too
  await page.goto('/histoire/');
  await expect(page.locator('main h1')).toHaveText(de.history.title);
});

test('untranslated story shows the French text with a notice', async ({ page }) => {
  await page.goto('/recits/?lang=en');
  await expect(page.locator('.story .notice-lang')).toBeVisible();
  await expect(page.locator('.story-title')).toHaveAttribute('lang', 'fr');
  await page.goto('/recits/?lang=fr');
  await expect(page.locator('.story .notice-lang')).toHaveCount(0);
});

test('local life lists upcoming events only', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-01T10:00:00+01:00'));
  await page.goto('/vie-locale/');
  await expect(page.locator('#event-marche-de-noel-2026')).toBeVisible();
  await expect(page.locator('#event-marche-de-noel-2026 .event-date')).toContainText('2 décembre 2026');

  await page.clock.setFixedTime(new Date('2026-12-21T10:00:00+01:00'));
  await page.reload();
  await expect(page.locator('#event-marche-de-noel-2026')).toHaveCount(0);
  await expect(page.locator('.empty-note')).toHaveText(fr.life.agendaEmpty);
});

test('mobile menu opens, closes with Escape and lists all sections', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout only');
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  await expect(toggle).toBeVisible();
  await expect(page.locator('.site-nav-list')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.site-nav-list a')).toHaveCount(5);
  await page.keyboard.press('Escape');
  await expect(page.locator('.site-nav-list')).toBeHidden();
  const brand = await page.locator('.brand-name').evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
  expect(brand, 'brand name is not truncated').toBe(true);
});

test('no horizontal overflow on any page', async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(p.path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, p.path).toBeLessThanOrEqual(0);
  }
});

test('all internal links resolve (no 404)', async ({ page, request }) => {
  const seen = new Set();
  for (const p of PAGES) {
    await page.goto(p.path);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const href of hrefs) {
      if (/^(https?:|mailto:)/.test(href) || href.startsWith('#')) continue;
      const path = new URL(href, `http://localhost${p.path}`).pathname;
      seen.add(path);
    }
  }
  for (const path of seen) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
  expect(seen.size).toBeGreaterThanOrEqual(PAGES.length);
});

test('SEO files: sitemap lists every page, robots points to it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const p of PAGES) expect(sitemap).toContain(`<loc>https://morges.info${p.path}</loc>`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://morges.info/sitemap.xml');
});
