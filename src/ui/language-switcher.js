import { LANGUAGES, getLang, setLang, onLangChange } from '../i18n/index.js';

const NATIVE_NAMES = { fr: 'Français', en: 'English', de: 'Deutsch', it: 'Italiano' };

/** Renders the FR | EN | DE | IT selector into `el`. */
export function mountLanguageSwitcher(el) {
  el.innerHTML = LANGUAGES.map(
    (lang, i) =>
      `${i ? '<span class="lang-sep" aria-hidden="true">|</span>' : ''}<button type="button" class="lang-btn" data-lang="${lang}" lang="${lang}" title="${NATIVE_NAMES[lang]}" aria-label="${NATIVE_NAMES[lang]}">${lang.toUpperCase()}</button>`,
  ).join('');

  el.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-lang]');
    if (btn) setLang(btn.dataset.lang);
  });

  const sync = () => {
    el.querySelectorAll('[data-lang]').forEach((btn) => {
      const active = btn.dataset.lang === getLang();
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };
  onLangChange(sync);
  sync();
}
