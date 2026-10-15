import fr from './locales/fr.js';
import en from './locales/en.js';
import de from './locales/de.js';
import it from './locales/it.js';

export const LANGUAGES = ['fr', 'en', 'de', 'it'];
export const DEFAULT_LANG = 'fr';
export const MESSAGES = { fr, en, de, it };

const STORAGE_KEY = 'morges-info:lang';

let current = DEFAULT_LANG;
const listeners = new Set();

function lookup(messages, key) {
  return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), messages);
}

/**
 * Translate a dotted key, e.g. t('panel.close'). `{name}` placeholders are
 * replaced from `params`. Falls back to French, then to the key itself.
 */
export function t(key, params = {}) {
  let value = lookup(MESSAGES[current], key);
  if (typeof value !== 'string') value = lookup(MESSAGES[DEFAULT_LANG], key);
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
}

/** Pick the current language from a { fr, en, de, it } object. */
export function localized(obj) {
  if (!obj) return '';
  return obj[current] || obj[DEFAULT_LANG] || '';
}

/**
 * Like localized(), but also says whether French was used as a fallback, so
 * pages can show a "French only" notice for content not yet translated.
 * Works for strings and for arrays of paragraphs.
 */
export function localizedWithFallback(obj) {
  if (!obj) return { value: '', isFallback: false, lang: DEFAULT_LANG };
  if (obj[current] !== undefined) return { value: obj[current], isFallback: false, lang: current };
  return { value: obj[DEFAULT_LANG], isFallback: current !== DEFAULT_LANG, lang: DEFAULT_LANG };
}

export function getLang() {
  return current;
}

export function isSupported(lang) {
  return LANGUAGES.includes(lang);
}

export function setLang(lang, { persist = true } = {}) {
  if (!isSupported(lang)) lang = DEFAULT_LANG;
  current = lang;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }
  listeners.forEach((fn) => fn(lang));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** URL ?lang= wins, then the saved choice, then French. */
export function detectInitialLang(search = '') {
  const fromUrl = new URLSearchParams(search).get('lang');
  if (isSupported(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSupported(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

/**
 * Apply translations to static markup: elements with data-i18n get their text,
 * data-i18n-attr="placeholder:search.placeholder,aria-label:search.label" get attributes.
 */
export function translateDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      el.setAttribute(attr, t(key));
    });
  });
}
