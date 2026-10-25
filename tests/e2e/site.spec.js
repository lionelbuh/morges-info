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

test('discreet "About us" page: reached from the footer only, in four languages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-nav-list a[href="/qui-sommes-nous/"]')).toHaveCount(0); // not in the main menu
  await page.locator('.site-footer a[href="/qui-sommes-nous/"]').click();
  await expect(page).toHaveURL(/\/qui-sommes-nous\/$/);
  await expect(page.locator('main h1')).toHaveText('Qui sommes-nous');
  await expect(page.locator('.us-closing')).toHaveText('De la Californie et sa côte Pacifique aux rives du Léman.');
  for (const [lang, h1] of [['en', 'About us'], ['de', 'Über uns'], ['it', 'Chi siamo']]) {
    await page.locator(`.lang-btn[data-lang="${lang}"]`).click();
    await expect(page.locator('main h1')).toHaveText(h1);
    await expect(page.locator('.us-contact a')).toHaveAttribute('href', 'mailto:hello@morges.info');
  }
  await page.locator('.us-charter a').click();
  await expect(page).toHaveURL(/\/a-propos\/\?lang=it$/);
});

test('contribute: reachable from the menu, the home page and the footer; writes to hello@morges.info', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-footer .footer-contact a')).toHaveAttribute('href', 'mailto:hello@morges.info');
  await page.locator('.contribute-band a').click();
  await expect(page).toHaveURL(/\/contribuer\/$/);
  await expect(page.locator('main h1')).toHaveText(fr.contribute.title);
  const mail = page.locator('.btn-mail');
  await expect(mail).toHaveText('Écrire à hello@morges.info');
  const href = await mail.getAttribute('href');
  expect(href.startsWith('mailto:hello@morges.info?subject=')).toBe(true);
  const url = new URL(href);
  expect(url.searchParams.get('subject')).toBe(fr.contribute.mailSubject);
  expect(url.searchParams.get('body')).toContain('Auteur');
  // in German, the prefilled email is German too
  await page.locator('.lang-btn[data-lang="de"]').click();
  await expect(mail).toHaveText(de.contribute.button.replace('{email}', 'hello@morges.info'));
  expect(new URL(await mail.getAttribute('href')).searchParams.get('subject')).toBe(de.contribute.mailSubject);
  // the privacy page explains what happens to messages and photos
  await page.locator('a[href^="/mentions-legales/"]').first().click();
  await expect(page.locator('main h1')).toHaveText(de.legal.title);
  await expect(page.locator('main a[href="mailto:hello@morges.info"]')).toHaveCount(1);
});

test('the address is not written in plain text in the page source (spam harvesters)', async ({ request }) => {
  for (const path of ['/', '/contribuer/', '/mentions-legales/', '/qui-sommes-nous/']) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toContain('hello@morges.info');
    expect(html, path).toContain('&#104;&#101;&#108;&#108;&#111;&#64;'); // "hello@" as entities
  }
});

test('shared links show a preview image', async ({ page, request }) => {
  await page.goto('/histoire/');
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toMatch(/^https:\/\/morges\.info\/images\/hero\/.+-og-1200\.jpg$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const res = await request.get(new URL(image).pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/jpeg');
});

test('404 page: translated, not indexed, links back to the site', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('main h1')).toHaveText(fr.notfound.title);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('.site-footer a[href^="/404"]')).toHaveCount(0);
  await page.locator('.lang-btn[data-lang="de"]').click();
  await expect(page.locator('main h1')).toHaveText(de.notfound.title);
  await page.locator('.not-found .btn').first().click();
  await expect(page).toHaveURL(/\/\?lang=de$/);
});

test('legal page: audience statistics are explained and can be turned off on this device', async ({ page }) => {
  await page.goto('/mentions-legales/');
  await expect(page.locator('#mesure-audience h2')).toHaveText(fr.legal.analyticsTitle);
  await expect(page.locator('#mesure-audience')).toContainText('Cloudflare Web Analytics');
  const button = page.locator('[data-analytics-toggle]');
  await expect(page.locator('.analytics-status')).toHaveText(fr.legal.analyticsStatusOn);
  await button.click();
  await expect(page.locator('.analytics-status')).toHaveText(fr.legal.analyticsStatusOff);
  await expect(button).toHaveText(fr.legal.analyticsTurnOn);
  await page.reload();
  await expect(page.locator('.analytics-status')).toHaveText(fr.legal.analyticsStatusOff);
  await button.click();
  await expect(page.locator('.analytics-status')).toHaveText(fr.legal.analyticsStatusOn);
  // the beacon never loads outside the live domain (afterEach also checks that no external request was made)
  await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0);
});

test('each place has its own indexable page, linked from the places index and the map', async ({ page }) => {
  await page.goto('/lieux/');
  await expect(page.locator('main h1')).toHaveText(fr.places.title);
  await expect(page.locator('.places-list a[href="/lieux/piscine-du-parc/"]')).toHaveText('Piscine du Parc');
  await page.locator('.places-list a[href="/lieux/piscine-du-parc/"]').click();
  await expect(page).toHaveURL(/\/lieux\/piscine-du-parc\/$/);
  await expect(page).toHaveTitle('Piscine du Parc, Morges — Morges.info');
  await expect(page.locator('main h1')).toHaveText('Piscine du Parc');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://morges.info/lieux/piscine-du-parc/');
  await expect(page.locator('.breadcrumb li')).toHaveCount(3);
  // structured data: valid JSON describing the place and the breadcrumb
  const data = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((el) => JSON.parse(el.textContent)));
  expect(data.map((d) => d['@type'])).toEqual(['SportsActivityLocation', 'BreadcrumbList']);
  expect(data[0].geo).toEqual({ '@type': 'GeoCoordinates', latitude: 46.504666, longitude: 6.493514 });
  expect(data[0].address.streetAddress).toBe('Promenade Général-Guisan 11');
  // translated like every page
  await page.locator('.lang-btn[data-lang="it"]').click();
  await expect(page.locator('main h1')).toHaveText('Piscina del Parco');
  await expect(page).toHaveURL(/\/lieux\/piscine-du-parc\/\?lang=it$/);
  // "View on the map" opens the place on the map, whose panel links back to this page
  await page.locator('.place-page .hero-actions .btn').first().click();
  await expect(page).toHaveURL(/\/carte\/\?lang=it#piscine-du-parc$/);
  await expect(page.locator('#info-panel [data-field="permalink"]')).toHaveAttribute('href', '/lieux/piscine-du-parc/?lang=it');
});

test('structured data: site, events and stories are described for search engines', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-01T10:00:00+01:00'));
  const types = async (path) => {
    await page.goto(path);
    return page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((el) => JSON.parse(el.textContent)));
  };
  const home = await types('/');
  expect(home[0]['@graph'].map((n) => n['@type'])).toEqual(['Organization', 'WebSite']);
  const life = await types('/vie-locale/');
  expect(life[0]).toMatchObject({ '@type': 'Event', startDate: '2026-12-02', endDate: '2026-12-20' });
  expect(life[0].location.name).toBe('Château de Morges');
  const stories = await types('/recits/?lang=en');
  expect(stories[0]).toMatchObject({ '@type': 'Article', headline: 'Why Bern built a harbour in Morges', inLanguage: 'en' });
});

test('sitemap lists the place pages with their verification date; robots allow everything', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://morges.info/lieux/chateau/</loc>\n    <lastmod>');
  expect(sitemap.match(/<loc>/g)).toHaveLength(35); // 12 listed pages + 20 places + 3 photo pages
  expect(await (await request.get('/robots.txt')).text()).toContain('Allow: /');
});

test('photo map: the map switches between places and photos; a viewpoint shows its photo and asks for today’s view', async ({ page }) => {
  await page.goto('/carte/');
  await expect(page.locator('#map')).toHaveAttribute('data-ready', 'true');
  await page.locator('#mode-toggle [data-mode="photos"]').click();
  await expect(page.locator('#mode-toggle [data-mode="photos"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\/carte\/#photos$/);
  await expect(page.locator('.filters-block')).toBeHidden();
  await expect(page.locator('#search-input')).toHaveAttribute('placeholder', fr.photos.searchPlaceholder);
  await expect(page.locator('.poi-marker--photo')).toHaveCount(3);
  // the mode survives a reload (shareable address)
  await page.reload();
  await expect(page.locator('#mode-toggle [data-mode="photos"]')).toHaveAttribute('aria-pressed', 'true');
  // the old photo alone: shown whole with its credit and licence, and today's view is asked for
  if (await page.locator('#place-list').isHidden()) await page.locator('#list-toggle').click();
  await page.locator('#place-list [data-place-id="vue-parc-independance-kiosque"]').click();
  await expect(page).toHaveURL(/#vue-parc-independance-kiosque$/);
  const panel = page.locator('#info-panel');
  await expect(panel.locator('.vp-photo--then img')).toHaveAttribute('src', '/images/photos/parc-independance-kiosque-1902.webp');
  await expect(panel.locator('.vp-credit a[rel~="license"]')).toHaveAttribute('href', /creativecommons\.org\/licenses\/by-nc-nd\/4\.0/);
  await expect(panel.locator('.vp-wanted h3')).toHaveText(fr.photos.wantedNowTitle);
  await panel.locator('[data-action="close"]').first().click();
  await page.locator('#mode-toggle [data-mode="places"]').click();
  await expect(page).toHaveURL(/\/carte\/$/);
  await expect(page.locator('.poi-marker')).toHaveCount(19);

  await page.goto('/photos/');
  await expect(page.locator('main h1')).toHaveText(fr.photos.title);
  await expect(page.locator('.vp-card')).toHaveCount(3);
  await expect(page.locator('.site-footer a[href="/photos/"]')).toHaveText(fr.nav.photos);
  await page.locator('.vp-card .card-title a[href="/photos/vue-parc-independance-kiosque/"]').click();
  await expect(page).toHaveURL(/\/photos\/vue-parc-independance-kiosque\/$/);
  await expect(page.locator('main h1')).toHaveText(/kiosque à musique/);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join()).toContain('"license":"https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr"');

  // the place shows its old photo, on its page and in the map panel
  await page.goto('/lieux/parc-independance/');
  await expect(page.locator('.vp-mini')).toHaveAttribute('href', '/photos/vue-parc-independance-kiosque/');
  await page.goto('/carte/#parc-independance');
  await page.locator('#info-panel .vp-mini').click();
  await expect(page).toHaveURL(/#vue-parc-independance-kiosque$/);
  await expect(page.locator('#info-panel .vp-photo--then img')).toBeVisible();
});

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
  await expect(page.locator('#map-preview .poi-marker')).toHaveCount(19);
  await expect(page.locator('#map-preview .maplibregl-ctrl-attrib')).toContainText('OpenStreetMap');
  // clicking a preview marker opens it on the map page
  await page.locator('#map-preview .poi-marker[data-place-id="beausobre"]').click();
  await expect(page).toHaveURL(/\/carte\/#beausobre$/);
  await expect(page.locator('#info-panel .panel-title')).toHaveText('Théâtre de Beausobre');
});

test('the map opens in 3D by default, and a switch to 2D is remembered', async ({ page }) => {
  await page.goto('/carte/');
  await expect(page.locator('#map')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#map')).toHaveAttribute('data-view', '3d');
  await expect(page.locator('#map')).toHaveAttribute('data-pitch', '55');
  await expect(page.locator('#view-toggle [data-view="3d"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#view-toggle [data-view="2d"]').click();
  await expect(page.locator('#map')).toHaveAttribute('data-pitch', '0');
  await page.reload();
  await expect(page.locator('#map')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#map')).toHaveAttribute('data-view', '2d');
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

test('stories are translated: no French-only notice in any language', async ({ page }) => {
  for (const [lang, title] of [['en', 'Why Bern built a harbour in Morges'], ['de', 'Warum Bern in Morges einen Hafen baute'], ['it', 'Perché Berna costruì un porto a Morges']]) {
    await page.goto(`/recits/?lang=${lang}`);
    await expect(page.locator('.story-title')).toHaveText(title);
    await expect(page.locator('.story .notice-lang')).toHaveCount(0);
    await expect(page.locator('.story-title')).not.toHaveAttribute('lang', 'fr');
  }
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
  await expect(page.locator('.site-nav-list a')).toHaveCount(PAGES.filter((p) => p.nav).length);
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
  for (const p of PAGES.filter((x) => x.listed !== false)) expect(sitemap).toContain(`<loc>https://morges.info${p.path}</loc>`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://morges.info/sitemap.xml');
});
