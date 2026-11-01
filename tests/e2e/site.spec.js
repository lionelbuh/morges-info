import { test, expect } from '@playwright/test';
import { mockMapServices } from './fixtures/routes.js';
import { PAGES } from '../../src/site/config.js';
import fr from '../../src/i18n/locales/fr.js';
import de from '../../src/i18n/locales/de.js';
import en from '../../src/i18n/locales/en.js';
import { VOICES_FORM_KEY } from '../../src/site/config.js';
import { HERO_PHOTOS } from '../../src/data/photos.js';

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

test('shared links show a preview image: the castle, or the page’s own photo', async ({ page, request }) => {
  for (const [path, expected] of [
    ['/histoire/', /^https:\/\/morges\.info\/images\/hero\/chateau-.+-og-1200\.jpg$/],
    ['/', /^https:\/\/morges\.info\/images\/hero\/chateau-.+-og-1200\.jpg$/],
    ['/photos/vue-port-jetee/', /^https:\/\/morges\.info\/images\/share\/port-jetee-1898\.jpg$/],
    ['/commerces/', /^https:\/\/morges\.info\/images\/share\/amandine-reflexologie-.+\.jpg$/],
  ]) {
    await page.goto(path);
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image, path).toMatch(expected);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const res = await request.get(new URL(image).pathname);
    expect(res.status(), path).toBe(200);
    expect(res.headers()['content-type']).toContain('image/jpeg');
  }
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
  // directions in Google Maps and Apple Plans (plain links)
  await expect(page.locator('.place-page a[href^="https://www.google.com/maps/dir/?api=1&destination=46.504666,6.493514"]')).toHaveText(fr.panel.directionsGoogle);
  await expect(page.locator('.place-page a[href^="https://maps.apple.com/?daddr=46.504666,6.493514&q=Piscine%20du%20Parc"]')).toHaveText(fr.panel.directionsApple);
  // translated like every page
  await page.locator('.lang-btn[data-lang="it"]').click();
  await expect(page.locator('main h1')).toHaveText('Piscina del Parco');
  await expect(page).toHaveURL(/\/lieux\/piscine-du-parc\/\?lang=it$/);
  // "View on the map" opens the place on the map, whose panel links back to this page
  await page.locator('.place-page .hero-actions .btn').first().click();
  await expect(page).toHaveURL(/\/carte\/\?lang=it#piscine-du-parc$/);
  await expect(page.locator('#info-panel [data-field="permalink"]')).toHaveAttribute('href', '/lieux/piscine-du-parc/?lang=it');
  await expect(page.locator('#info-panel [data-field="directions-google"]')).toHaveText('Itinerario (Google Maps)');
  await expect(page.locator('#info-panel [data-field="directions-apple"]')).toHaveAttribute('href', /^https:\/\/maps\.apple\.com\/\?daddr=46\.504666,6\.493514&q=Piscina%20del%20Parco$/);
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
  const market = life.find((d) => d.name === 'Marché de Noël de Morges');
  expect(market).toMatchObject({ '@type': 'Event', startDate: '2026-12-02', endDate: '2026-12-20' });
  expect(market.location.name).toBe('Château de Morges');
  expect(life.find((d) => d.name === 'Solann')).toMatchObject({ '@type': 'Event', startDate: '2026-11-21', description: expect.stringContaining('Solann') });
  const stories = await types('/recits/?lang=en');
  expect(stories[0]).toMatchObject({ '@type': 'Article', headline: 'Stravinsky in Morges: five years on the shore of Lake Geneva', inLanguage: 'en' });
  expect(stories[1]).toMatchObject({ '@type': 'Article', headline: 'Why Bern built a harbour in Morges', inLanguage: 'en' });
});

test('sitemap lists the place pages with their verification date; robots allow everything', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://morges.info/lieux/chateau/</loc>\n    <lastmod>');
  expect(sitemap.match(/<loc>/g)).toHaveLength(43); // 14 listed pages + 20 places + 9 photo pages
  // photos listed for image search
  expect(sitemap).toContain('<image:loc>https://morges.info/images/photos/debarcadere-1909.webp</image:loc>');
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
  await expect(page.locator('.poi-marker--photo')).toHaveCount(9);
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
  await expect(page.locator('.vp-card')).toHaveCount(9);
  await expect(page.locator('.site-footer a[href="/photos/"]')).toHaveText(fr.nav.photos);
  await page.locator('.vp-card .card-title a[href="/photos/vue-parc-independance-kiosque/"]').click();
  await expect(page).toHaveURL(/\/photos\/vue-parc-independance-kiosque\/$/);
  await expect(page.locator('main h1')).toHaveText(/kiosque à musique/);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join()).toContain('"license":"https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr"');

  // the place shows its old photo, on its page and in the map panel
  await page.goto('/lieux/parc-independance/');
  await expect(page.locator('.vp-mini[href="/photos/vue-parc-independance-kiosque/"]')).toHaveCount(1);
  await page.goto('/carte/#parc-independance');
  await page.locator('#info-panel .vp-mini[href$="#vue-parc-independance-kiosque"]').click();
  await expect(page).toHaveURL(/#vue-parc-independance-kiosque$/);
  await expect(page.locator('#info-panel .vp-photo--then img')).toBeVisible();
});

test('Parole aux Morgiens: the questions, the charter, and a message sent without any email', async ({ page }) => {
  const sent = [];
  await page.route('https://api.web3forms.com/submit', (route) => {
    sent.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'ok' }) });
  });
  await page.goto('/');
  // the home page shows the latest message and leads to the page
  await expect(page.locator('#home-voices')).toHaveText(fr.voices.title);
  await expect(page.locator('.home-voice-text')).toHaveCount(1);
  await expect(page.locator('.home-voices-questions li')).toHaveCount(3);
  await expect(page.locator('.home-voices a.btn')).toHaveAttribute('href', '/parole-aux-morgiens/#ecrire');
  await (await navLink(page, fr.nav.voices)).click();
  await expect(page).toHaveURL(/\/parole-aux-morgiens\/$/);
  await expect(page.locator('main h1')).toHaveText(fr.voices.title);
  await expect(page.locator('.voice-topic')).toHaveCount(4);
  await expect(page.locator('.voice-charter li')).toHaveCount(8);
  await expect(page.locator('.voice-form input[type="email"]')).toHaveCount(0);

  // "Answer this question" picks the topic and puts the cursor in the name field
  await page.locator('#sujet-souvenir .voice-answer').click();
  await expect(page.locator('#voice-topic')).toHaveValue('souvenir');
  await expect(page.locator('#voice-name')).toBeFocused();
  await page.locator('#voice-name').fill('Claire M.');
  const text = 'La piscine du parc dans les années 80.';
  await page.locator('#voice-message').fill(text);
  await expect(page.locator('[data-voice-counter]')).toHaveText(`${text.length} / 1000`);

  // a language change keeps what was typed
  await page.locator('.lang-btn[data-lang="en"]').click();
  await expect(page.locator('main h1')).toHaveText(en.voices.title);
  await expect(page.locator('#voice-message')).toHaveValue(text);
  await expect(page.locator('#voice-topic')).toHaveValue('souvenir');
  await page.locator('.lang-btn[data-lang="fr"]').click();

  // nothing leaves without the charter accepted
  await page.locator('[data-voice-submit]').click();
  expect(sent).toHaveLength(0);
  await page.locator('#voice-consent').check();
  await page.locator('[data-voice-submit]').click();
  await expect(page.locator('[data-voice-status]')).toHaveText(fr.voices.sent);
  expect(sent).toEqual([
    {
      access_key: VOICES_FORM_KEY,
      subject: 'Parole aux Morgiens : nouveau message',
      from_name: 'Morges.info',
      sujet: 'Un souvenir de Morges d’autrefois ? [souvenir]',
      prenom: 'Claire M.',
      message: text,
      accord: 'oui',
    },
  ]);
  await expect(page.locator('#voice-message')).toHaveValue('');
});

test('Parole aux Morgiens: a failed send says so and keeps the message', async ({ page }) => {
  await page.route('https://api.web3forms.com/submit', (route) => route.fulfill({ status: 500, body: '' }));
  await page.goto('/parole-aux-morgiens/?lang=de');
  await page.locator('#voice-name').fill('Anna');
  await page.locator('#voice-message').fill('Mehr Bänke am See, bitte.');
  await page.locator('#voice-consent').check();
  await page.locator('[data-voice-submit]').click();
  await expect(page.locator('[data-voice-status]')).toHaveText(de.voices.failed.replace('{email}', 'hello@morges.info'));
  await expect(page.locator('#voice-message')).toHaveValue('Mehr Bänke am See, bitte.');
  errors = errors.filter((m) => !m.includes('status of 500')); // the browser logs the failed request itself
});

test('visiting Morges: frequent questions answered from the site’s data, described for search engines', async ({ page }) => {
  await page.goto('/');
  await page.locator(`a[href="/visiter/"]:has-text("${fr.visit.homeLink}")`).click();
  await expect(page).toHaveURL(/\/visiter\/$/);
  await expect(page.locator('main h1')).toHaveText(fr.visit.title);
  await expect(page.locator('.visit-question h2')).toHaveCount(10);
  await expect(page.locator('.visit-walk li')).toHaveCount(5);
  await expect(page.locator('.visit-walk a[href="/lieux/chateau/"]')).toHaveCount(1);
  await expect(page.locator('.visit-places a[href="/lieux/chateau/"]')).toHaveCount(1);
  await expect(page.locator('.site-footer a[href="/visiter/"]')).toHaveText(fr.nav.visit);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
  const faq = ld.find((d) => d['@type'] === 'FAQPage');
  expect(faq.mainEntity).toHaveLength(10);
  expect(faq.mainEntity[0].name).toBe(fr.visit.q.see.q);
  await page.goto('/visiter/?lang=en');
  await expect(page.locator('main h1')).toHaveText(en.visit.title);
  await expect(page.locator('#visit-market')).toHaveText(en.visit.q.market.q);
});

test('businesses: free directory with a type filter, carousels and contact details', async ({ page }) => {
  await page.goto('/commerces/');
  const card = page.locator('#business-amandine-reflexologie');
  await expect(card.locator('.card-title')).toHaveText('Amandine Réflexologie');
  await expect(card.locator('.business-photo img')).toHaveCount(4);
  await expect(card.locator('.business-photo img').nth(1)).toHaveAttribute('src', '/images/businesses/amandine-reflexologie-flyer.webp');
  await expect(card.locator('a[href="tel:+41786062081"]')).toHaveText('+41 78 606 20 81');
  await expect(card.locator('a[href="https://www.instagram.com/amandinereflexologie/"]')).toHaveText('@amandinereflexologie');
  await expect(card.locator('a[href^="mailto:"]')).toHaveText('info@amandinereflexologie.ch');
  await expect(card.locator('a[href^="https://www.google.com/maps/dir/"]')).toHaveAttribute('href', /Louis-de-Savoie%2029/);
  // the e-mail address is not readable in the page source (harvesters)
  expect(await (await page.request.get('/commerces/')).text()).not.toContain('info@amandinereflexologie.ch');
  // type filter: "All" and the categories in use
  const filters = page.locator('.biz-filters');
  await expect(filters).toBeVisible();
  await expect(filters.locator('[data-biz-filter=""]')).toHaveAttribute('aria-pressed', 'true');
  await filters.locator('[data-biz-filter="health"]').click();
  await expect(filters.locator('[data-biz-filter="health"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(card).toBeVisible();
  await expect(page.locator('.biz-count')).toHaveText(fr.businesses.countOne.replace('{n}', '1'));
  // her photos form a carousel: the next button scrolls to the second photo
  const photos = card.locator('.carousel--photos');
  await expect(photos.locator('.carousel-controls')).toBeVisible();
  await photos.locator('[data-carousel-step="1"]').click();
  await expect.poll(() => photos.locator('.carousel-track').evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  // a single business: no buttons on the list of businesses
  await expect(page.locator('.carousel--cards > .carousel-controls')).toBeHidden();
  // described for search engines
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
  expect(ld.find((d) => d.name === 'Amandine Réflexologie')).toMatchObject({ '@type': 'HealthAndBeautyBusiness', telephone: '+41 78 606 20 81' });
});

test('carousels move on by themselves every 5 seconds, and stop with the pause button', async ({ page }) => {
  await page.clock.install();
  await page.goto('/commerces/');
  const photos = page.locator('#business-amandine-reflexologie .carousel--photos');
  await photos.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const scroll = () => photos.locator('.carousel-track').evaluate((el) => el.scrollLeft);
  expect(await scroll()).toBe(0);
  await page.clock.runFor(5500);
  await expect.poll(scroll).toBeGreaterThan(0);
  // pause: it stays where it is
  const pause = photos.locator('[data-carousel-toggle]');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000); // let the last smooth scroll finish
  const before = await scroll();
  await page.clock.runFor(16000);
  expect(await scroll()).toBe(before);
});

test('carousels do not move for visitors who ask for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/commerces/');
  const photos = page.locator('#business-amandine-reflexologie .carousel--photos');
  await photos.scrollIntoViewIfNeeded();
  await expect(photos.locator('[data-carousel-toggle]')).toBeHidden();
  await page.clock.runFor(11000);
  expect(await photos.locator('.carousel-track').evaluate((el) => el.scrollLeft)).toBe(0);
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

test('home: the photo of the day stays the same when the language changes', async ({ page }) => {
  await page.goto('/');
  const heroId = await page.locator('.hero-photo').getAttribute('data-hero-id');
  await page.locator('.lang-btn[data-lang="de"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('.hero-photo')).toHaveAttribute('data-hero-id', heroId);
  await expect(page.locator('.hero-photo img')).toHaveAttribute('alt', HERO_PHOTOS.find((p) => p.id === heroId).alt.de);
});

test('home: map preview with markers, places, practical info, businesses and featured story', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section[aria-labelledby="home-places"] .place-card')).toHaveCount(4);
  await expect(page.locator('.feature-story')).toBeVisible();
  await expect(page.locator('#home-businesses')).toHaveCount(1);
  // photo of the day: one of the hero photos, loaded, described, credited with its licence
  const heroId = await page.locator('.hero-photo').getAttribute('data-hero-id');
  const photo = HERO_PHOTOS.find((p) => p.id === heroId);
  expect(photo).toBeTruthy();
  const hero = page.locator('.hero-photo img');
  await expect(hero).toHaveAttribute('alt', photo.alt.fr);
  await expect.poll(() => hero.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await hero.evaluate((img) => img.currentSrc)).toMatch(/\.avif$/);
  await expect(page.locator(`.hero-credit a[href="${photo.licenceUrl}"]`)).toHaveText(photo.licence);
  await expect(page.locator('.hero-credit')).toContainText(typeof photo.creator === 'string' ? photo.creator : photo.creator.fr);
  // "Explorer la carte": the photo map, with an old photo beside it, highlighted on the map
  await expect(page.locator('.hero-actions .btn').first()).toHaveAttribute('href', '/carte/#photos');
  // "Parole aux Morgiens" right after the opening: second button, first section
  await expect(page.locator('.hero-actions .btn').nth(1)).toHaveAttribute('href', '/parole-aux-morgiens/#ecrire');
  await expect(page.locator('main .section h2').first()).toHaveAttribute('id', 'home-voices');
  await expect(page.locator('section[aria-labelledby="home-map"] .section-head a')).toHaveAttribute('href', '/carte/#photos');
  await page.locator('#map-preview').scrollIntoViewIfNeeded();
  await expect(page.locator('#map-preview .poi-marker--photo')).toHaveCount(9);
  await expect(page.locator('#map-preview .maplibregl-ctrl-attrib')).toContainText('OpenStreetMap');
  const card = page.locator('#home-photos .home-photo');
  await expect(card).toHaveAttribute('href', '/carte/#vue-parc-independance-kiosque');
  await expect(page.locator('#map-preview .poi-marker[data-place-id="vue-parc-independance-kiosque"]')).toHaveAttribute('aria-pressed', 'true');
  // the photos take turns (every 6 s) and can be paused
  await page.mouse.move(0, 0);
  await expect(card).not.toHaveAttribute('href', '/carte/#vue-parc-independance-kiosque', { timeout: 9000 });
  const pause = page.locator('.home-photos-pause');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await expect(pause).toHaveText(fr.home.photosPlay);
  // clicking a preview marker opens that photo on the map page
  await page.locator('#map-preview .poi-marker[data-place-id="vue-port-jetee"]').click();
  await expect(page).toHaveURL(/\/carte\/#vue-port-jetee$/);
  await expect(page.locator('#info-panel .panel-title')).toHaveText('Le port et le château, depuis la jetée');
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

test('stories are translated: no French-only notice in any language; the older one is archived', async ({ page }) => {
  for (const [lang, title, archived] of [
    ['en', 'Stravinsky in Morges: five years on the shore of Lake Geneva', 'Why Bern built a harbour in Morges'],
    ['de', 'Strawinsky in Morges: fünf Jahre am Ufer des Genfersees', 'Warum Bern in Morges einen Hafen baute'],
    ['it', 'Stravinskij a Morges: cinque anni sulle rive del Lemano', 'Perché Berna costruì un porto a Morges'],
  ]) {
    await page.goto(`/recits/?lang=${lang}`);
    await expect(page.locator('.story-title')).toHaveText([title, archived]);
    await expect(page.locator('.stories-archive .story-title')).toHaveText(archived);
    await expect(page.locator('.story .notice-lang')).toHaveCount(0);
    await expect(page.locator('.story-title[lang="fr"]')).toHaveCount(0);
  }
});

test('local life lists upcoming events only', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-04T10:00:00+01:00'));
  await page.goto('/vie-locale/');
  await expect(page.locator('#event-beausobre-zip-zap-circus-2026')).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-11-05T10:00:00+01:00'));
  await page.reload();
  await expect(page.locator('#event-beausobre-zip-zap-circus-2026')).toHaveCount(0);
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
  expect(robots).toContain('User-agent: GPTBot');
  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toContain('# Morges.info');
});
