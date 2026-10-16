import { getCategory } from '../data/categories.js';
import { t, localized, getLang, textOf } from '../i18n/index.js';
import { formatDate } from '../site/format.js';
import { photoFigure } from '../site/components.js';
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
 * Slide-in panel (desktop) / bottom sheet (mobile) showing one place.
 * @param {HTMLElement} el
 * @param {{ onClose: ()=>void, onFocus: (place)=>void }} opts
 */
export function createInfoPanel(el, { onClose, onFocus }) {
  let current = null;

  el.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="close"]')) onClose();
    if (event.target.closest('[data-action="focus"]') && current) onFocus(current);
  });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') onClose();
  });

  function render() {
    if (!current) return;
    const place = current;
    const cat = getCategory(place.category);
    const c = place.coordinates;
    const osmUrl = c
      ? `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=18/${c.lat}/${c.lng}`
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
                  <button type="button" class="btn" data-action="focus">${escapeHtml(t('panel.zoom'))}</button>
                  <a class="btn btn-ghost" href="${osmUrl}" target="_blank" rel="noopener">${escapeHtml(t('panel.osm'))}</a>
                </div>`
              : ''
          }
          <section class="panel-archive" aria-labelledby="archive-title">
            <h3 id="archive-title">${escapeHtml(t('panel.archiveTitle'))}</h3>
            <p>${escapeHtml(t('panel.archiveText'))}</p>
          </section>
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
      if (focusPanel) el.querySelector('.panel-close')?.focus({ preventScroll: true });
    },
    close() {
      current = null;
      el.classList.remove('is-open');
      el.hidden = true;
      delete el.dataset.placeId;
    },
    refresh() {
      render();
    },
    get current() {
      return current;
    },
  };
}
