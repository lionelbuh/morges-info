/**
 * Browser side of the shared layout: renders header/footer, keeps <head> and
 * the URL in sync with the language, and handles the language links and the
 * mobile menu (event delegation, so re-rendering never loses listeners).
 */
import { setLang, getLang } from '../i18n/index.js';
import { renderHeader, renderFooter, applyHead } from './layout.js';

let initialised = false;

function setMenu(open) {
  const header = document.getElementById('site-header');
  const toggle = header?.querySelector('.nav-toggle');
  if (!header || !toggle) return;
  header.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
}

export function initChrome() {
  if (initialised) return;
  initialised = true;
  document.addEventListener('click', (event) => {
    const langLink = event.target.closest('a[data-lang]');
    if (langLink && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      setMenu(false);
      setLang(langLink.dataset.lang);
      return;
    }
    const toggle = event.target.closest('.nav-toggle');
    if (toggle) {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
      return;
    }
    if (!event.target.closest('.site-nav')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
}

/** Keep ?lang= in the address bar (none for French), preserving the hash. */
export function syncUrlLanguage() {
  const url = new URL(window.location.href);
  if (getLang() === 'fr') url.searchParams.delete('lang');
  else url.searchParams.set('lang', getLang());
  window.history.replaceState(null, '', url);
}

export function renderChrome(pageId) {
  const top = document.getElementById('site-top');
  const bottom = document.getElementById('site-bottom');
  if (top) top.innerHTML = renderHeader(pageId);
  if (bottom) bottom.innerHTML = renderFooter(pageId);
  applyHead(pageId);
  syncUrlLanguage();
}
