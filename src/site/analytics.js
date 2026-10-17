/**
 * Audience statistics with Cloudflare Web Analytics (manual JS beacon, no cookies).
 *
 * According to Cloudflare's documentation the beacon reads and writes no browser storage
 * (no cookies, localStorage, sessionStorage or IndexedDB), does not fingerprint visitors and
 * discards IP addresses at the nearest data centre. See docs/ANALYTICS.md and the legal page.
 *
 * The beacon is loaded only when all of these hold:
 *  - a site token is configured (ANALYTICS_TOKEN in config.js; empty = analytics off);
 *  - the page is served from the production domain (never in development, tests or previews);
 *  - the browser does not send Do Not Track or Global Privacy Control;
 *  - the visitor has not turned statistics off on the legal page (choice kept on their device).
 */
import { ANALYTICS_TOKEN, PRODUCTION_HOSTS } from './config.js';

const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const OPT_OUT_KEY = 'morges-info:no-analytics';

export function analyticsOptedOut() {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAnalyticsOptOut(optOut) {
  try {
    if (optOut) localStorage.setItem(OPT_OUT_KEY, '1');
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    /* storage unavailable (private mode): the choice lasts for this page only */
  }
}

/** Do Not Track or Global Privacy Control: the browser asks not to be measured. */
export function browserRefusesTracking(nav = navigator) {
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1' || window.doNotTrack === '1';
}

/** @returns {boolean} whether the beacon was added */
export function startAnalytics({ token = ANALYTICS_TOKEN, host = window.location.hostname } = {}) {
  if (!token || !PRODUCTION_HOSTS.includes(host) || browserRefusesTracking() || analyticsOptedOut()) return false;
  if (document.querySelector(`script[src="${BEACON_SRC}"]`)) return true; // one beacon per page
  const script = document.createElement('script');
  script.type = 'module'; // as in Cloudflare's current snippet (module scripts are deferred)
  script.src = BEACON_SRC;
  // spa: false — only real page loads count (the map adds history entries when a place opens)
  script.dataset.cfBeacon = JSON.stringify({ token, spa: false });
  document.body.append(script);
  return true;
}
