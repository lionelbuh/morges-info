import { getCategory } from '../data/categories.js';
import { t, localized, getLang, textOf } from '../i18n/index.js';
import { formatDate } from '../site/format.js';
import { photoFigure } from '../site/components.js';
import { placePageHref, photoPageHref, photoMapHref, directionsLinks } from '../site/links.js';
import { viewpointBody, viewpointKind, placePhotosBlock } from '../site/photos.js';
import { escapeHtml } from './dom.js';
import { ATTRIBUTION } from '../map/style.js';

function sourceList(sources) {
  if (!sources || sources.length === 0) return '<li>—</li>';
  return sources
    .map((s) =>
      s.url
        ? `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(textOf(s.label))}</a></li>`
        : `<li>${escapeHtml(textOf(s.label))}</li>`,
    )
    .join('');
}

function formatCoord(value) {
  return value.toFixed(5);
}

/**
 * Full-screen page showing one place, over the map (text in a reading column on wide screens).
 * "Back to the map", × or Escape close it.
 * @param {HTMLElement} el
 * @param {{ onClose: ()=>void }} opts
 */
export function createInfoPanel(el, { onClose }) {
  let current = null;
  let returnFocus = null; // element to focus again when the panel closes

  el.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="close"]')) onClose();
  });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') onClose();
  });

  /** A viewpoint of the photo map: photo(s), comparison or call for the missing photo. */
  function renderViewpoint(vp) {
    const kind = viewpointKind(vp);
    el.innerHTML = `
      <div class="panel-inner">
        <header class="panel-header panel-header--photo">
          <span class="panel-badge"><span aria-hidden="true">◉</span> ${escapeHtml(t(`photos.kind.${kind}`))}</span>
          <h2 id="panel-title" class="panel-title">${escapeHtml(localized(vp.title))}</h2>
          <p class="panel-official">${escapeHtml(localized(vp.location))}</p>
          <button type="button" class="panel-close" data-action="close" aria-label="${escapeHtml(t('panel.close'))}">×</button>
        </header>
        <div class="panel-body">
          ${viewpointBody(vp)}
          <div class="panel-actions">
            <a class="btn btn-ghost" href="${photoPageHref(vp.id, getLang())}" data-field="permalink">${escapeHtml(t('photos.page'))}</a>
          </div>
          <p class="panel-attribution">${ATTRIBUTION}</p>
        </div>
        <div class="panel-back">
          <button type="button" class="btn panel-back-btn" data-action="close"><span aria-hidden="true">←</span> ${escapeHtml(t('panel.backToMap'))}</button>
        </div>
      </div>`;
  }

  function render() {
    if (!current) return;
    if (current.id.startsWith('vue-')) {
      renderViewpoint(current);
      return;
    }
    const place = current;
    const cat = getCategory(place.category);
    const c = place.coordinates;
    const directions = c
      ? directionsLinks(c, localized(place.name))
      : null;

    el.innerHTML = `
      <div class="panel-inner">
        <header class="panel-header" style="--cat:${cat.color}">
          <span class="panel-badge"><span aria-hidden="true">${cat.icon}</span> ${escapeHtml(t(`categories.${place.category}`))}</span>
          <h2 id="panel-title" class="panel-title">${escapeHtml(localized(place.name))}</h2>
          ${
            localized(place.name).includes(place.name.fr)
              ? ''
              : `<p class="panel-official">${escapeHtml(t('panel.officialName'))} <span lang="fr">${escapeHtml(place.name.fr)}</span></p>`
          }
          <button type="button" class="panel-close" data-action="close" aria-label="${escapeHtml(t('panel.close'))}">×</button>
        </header>
        <div class="panel-body">
          <dl class="panel-facts">
            <div><dt>${escapeHtml(t('panel.category'))}</dt><dd data-field="category">${escapeHtml(t(`categories.${place.category}`))}</dd></div>
            <div><dt>${escapeHtml(t('panel.location'))}</dt><dd data-field="location">${escapeHtml(localized(place.location))}</dd></div>
            ${c ? `<div><dt>${escapeHtml(t('panel.coordinates'))}</dt><dd data-field="coordinates">${formatCoord(c.lat)}° N, ${formatCoord(c.lng)}° E</dd></div>` : ''}
            ${place.address && !place.address.startsWith(localized(place.location)) ? `<div><dt>${escapeHtml(t('common.address'))}</dt><dd data-field="address">${escapeHtml(place.address)}</dd></div>` : ''}
            ${place.openingHours ? `<div><dt>${escapeHtml(t('common.hours'))}</dt><dd data-field="hours">${escapeHtml(localized(place.openingHours.text))}</dd></div>` : ''}
            ${place.website ? `<div><dt>${escapeHtml(t('common.website'))}</dt><dd data-field="website"><a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">${escapeHtml(place.website.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></dd></div>` : ''}
          </dl>
          ${place.photos && place.photos[0] ? photoFigure(place.photos[0]) : ''}
          <p class="panel-geo panel-geo--${place.geo.status}">${escapeHtml(t(`panel.geoStatus.${place.geo.status}`))}</p>
          ${c ? '' : `<p class="panel-notice">${escapeHtml(t('panel.notOnMap'))}</p>`}
          <h3>${escapeHtml(t('panel.description'))}</h3>
          <p class="panel-description" data-field="description">${escapeHtml(localized(place.description))}</p>
          ${
            c
              ? `<div class="panel-actions">
                  <a class="btn" href="${placePageHref(place.id, getLang())}" data-field="permalink">${escapeHtml(t('panel.permalink'))}</a>
                  <a class="btn btn-ghost" href="${escapeHtml(directions.google)}" target="_blank" rel="noopener" data-field="directions-google">${escapeHtml(t('panel.directionsGoogle'))}</a>
                  <a class="btn btn-ghost" href="${escapeHtml(directions.apple)}" target="_blank" rel="noopener" data-field="directions-apple">${escapeHtml(t('panel.directionsApple'))}</a>
                </div>`
              : ''
          }
          ${placePhotosBlock(place.id, { href: (vp) => photoMapHref(vp.id, getLang()) })}
          ${place.lastVerified ? `<p class="panel-verified" data-field="last-verified">${escapeHtml(t('common.lastVerified', { date: formatDate(place.lastVerified, getLang()) }))}</p>` : ''}
          <details class="panel-sources">
            <summary>${escapeHtml(t('panel.sources'))}</summary>
            <h4>${escapeHtml(t('panel.factSources'))}</h4>
            <ul>${sourceList(place.factSources)}</ul>
            <h4>${escapeHtml(t('panel.geoSources'))}</h4>
            <ul>${sourceList(place.geo.sources)}</ul>
          </details>
          <p class="panel-attribution">${ATTRIBUTION}</p>
        </div>
        <div class="panel-back">
          <button type="button" class="btn panel-back-btn" data-action="close"><span aria-hidden="true">←</span> ${escapeHtml(t('panel.backToMap'))}</button>
        </div>
      </div>`;
  }

  return {
    open(place, { focusPanel = false } = {}) {
      current = place;
      render();
      el.hidden = false;
      el.dataset.placeId = place.id;
      // next frame so the CSS transition runs
      requestAnimationFrame(() => el.classList.add('is-open'));
      if (focusPanel) {
        if (!el.contains(document.activeElement)) returnFocus = document.activeElement;
        el.querySelector('.panel-close')?.focus({ preventScroll: true });
      }
    },
    close() {
      const hadFocus = el.contains(document.activeElement);
      current = null;
      el.classList.remove('is-open');
      el.hidden = true;
      delete el.dataset.placeId;
      if (hadFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    },
    refresh() {
      render();
    },
    get current() {
      return current;
    },
  };
}
