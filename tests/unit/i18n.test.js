import { describe, it, expect, beforeEach } from 'vitest';
import { MESSAGES, LANGUAGES, DEFAULT_LANG, t, setLang, getLang, localized, detectInitialLang } from '../../src/i18n/index.js';
import { CATEGORY_IDS } from '../../src/data/categories.js';

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('translations', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang(DEFAULT_LANG, { persist: false });
  });

  it('defaults to French', () => {
    expect(DEFAULT_LANG).toBe('fr');
    expect(detectInitialLang('')).toBe('fr');
  });

  it('supports exactly fr, en, de, it', () => {
    expect(LANGUAGES).toEqual(['fr', 'en', 'de', 'it']);
  });

  it.each(['en', 'de', 'it'])('%s has the same keys as French, all non-empty', (lang) => {
    const reference = keys(MESSAGES.fr).sort();
    expect(keys(MESSAGES[lang]).sort()).toEqual(reference);
    for (const key of reference) {
      setLang(lang, { persist: false });
      expect(t(key).trim().length, key).toBeGreaterThan(0);
    }
  });

  it('has a label for every category in every language', () => {
    for (const lang of LANGUAGES) {
      for (const id of CATEGORY_IDS) expect(MESSAGES[lang].categories[id], `${lang}.${id}`).toBeTruthy();
    }
  });

  it('interpolates parameters and falls back to the key', () => {
    expect(t('results.count', { n: 3 })).toBe('3 lieu(x)');
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('switches language and localizes objects', () => {
    setLang('de');
    expect(getLang()).toBe('de');
    expect(t('panel.close')).toBe('Schliessen');
    expect(localized({ fr: 'a', en: 'b', de: 'c', it: 'd' })).toBe('c');
  });

  it('reads ?lang= first, then the saved choice, and ignores unknown values', () => {
    expect(detectInitialLang('?lang=it')).toBe('it');
    expect(detectInitialLang('?lang=xx')).toBe('fr');
    setLang('en'); // persists
    expect(detectInitialLang('')).toBe('en');
    expect(detectInitialLang('?lang=de')).toBe('de');
  });
});
