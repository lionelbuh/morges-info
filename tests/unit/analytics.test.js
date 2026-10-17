import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { startAnalytics, setAnalyticsOptOut, analyticsOptedOut } from '../../src/site/analytics.js';
import { ANALYTICS_TOKEN, PRODUCTION_HOSTS } from '../../src/site/config.js';

const beacon = () => document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]');
const setDnt = (value) => Object.defineProperty(navigator, 'doNotTrack', { value, configurable: true });
const setGpc = (value) => Object.defineProperty(navigator, 'globalPrivacyControl', { value, configurable: true });

describe('audience statistics (Cloudflare Web Analytics)', () => {
  beforeEach(() => {
    beacon()?.remove();
    localStorage.clear();
    setDnt(null);
    setGpc(undefined);
  });
  afterEach(() => beacon()?.remove());

  it('is configured for the live domains only', () => {
    expect(PRODUCTION_HOSTS).toEqual(['morges.info', 'www.morges.info']);
    expect(ANALYTICS_TOKEN).toMatch(/^[0-9a-f]{32}$/);
  });

  it('loads nothing without a token or outside the live domain', () => {
    expect(startAnalytics({ token: '', host: 'morges.info' })).toBe(false);
    expect(startAnalytics({ token: 'abc', host: 'localhost' })).toBe(false);
    expect(startAnalytics({ token: 'abc', host: 'deploy-preview-1--morges-info.netlify.app' })).toBe(false);
    expect(beacon()).toBeNull();
  });

  it('adds one beacon, without SPA tracking, on the live domain', () => {
    expect(startAnalytics({ token: 'abc', host: 'morges.info' })).toBe(true);
    expect(startAnalytics({ token: 'abc', host: 'morges.info' })).toBe(true);
    expect(document.querySelectorAll('script[src*="cloudflareinsights"]')).toHaveLength(1);
    expect(beacon().type).toBe('module');
    expect(JSON.parse(beacon().getAttribute('data-cf-beacon'))).toEqual({ token: 'abc', spa: false });
  });

  it('respects Do Not Track, Global Privacy Control and the visitor’s choice', () => {
    setDnt('1');
    expect(startAnalytics({ token: 'abc', host: 'morges.info' })).toBe(false);
    setDnt(null);
    setGpc(true);
    expect(startAnalytics({ token: 'abc', host: 'morges.info' })).toBe(false);
    setGpc(undefined);
    setAnalyticsOptOut(true);
    expect(analyticsOptedOut()).toBe(true);
    expect(startAnalytics({ token: 'abc', host: 'www.morges.info' })).toBe(false);
    setAnalyticsOptOut(false);
    expect(analyticsOptedOut()).toBe(false);
    expect(beacon()).toBeNull();
  });
});
