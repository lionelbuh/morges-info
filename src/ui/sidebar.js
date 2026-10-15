import { CATEGORIES } from '../data/categories.js';
import { t, localized } from '../i18n/index.js';
import { escapeHtml } from './dom.js';

/**
 * Category filter chips + result list.
 * @param {{ filtersEl: HTMLElement, listEl: HTMLElement, countEl: HTMLElement,
 *           onToggleCategory: (id:string|null)=>void, onSelect: (id:string)=>void }} opts
 */
export function createSidebar({ filtersEl, listEl, countEl, onToggleCategory, onSelect }) {
  filtersEl.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-category]');
    if (!chip) return;
    onToggleCategory(chip.dataset.category || null);
  });

  listEl.addEventListener('click', (event) => {
    const item = event.target.closest('[data-place-id]');
    if (item) onSelect(item.dataset.placeId);
  });

  return {
    renderFilters(active) {
      const all = `<button type="button" class="chip${active.size === 0 ? ' is-active' : ''}" data-category="" aria-pressed="${active.size === 0}">${escapeHtml(t('filters.all'))}</button>`;
      const chips = CATEGORIES.map((cat) => {
        const on = active.has(cat.id);
        return `<button type="button" class="chip${on ? ' is-active' : ''}" data-category="${cat.id}" aria-pressed="${on}" style="--chip:${cat.color}"><span class="chip-dot" aria-hidden="true"></span>${escapeHtml(t(`categories.${cat.id}`))}</button>`;
      }).join('');
      filtersEl.innerHTML = all + chips;
    },

    renderList(places, selectedId) {
      countEl.textContent = t('results.count', { n: places.length });
      if (places.length === 0) {
        listEl.innerHTML = `<li class="empty">${escapeHtml(t('results.none'))}</li>`;
        return;
      }
      listEl.innerHTML = places
        .map((place) => {
          const cat = CATEGORIES.find((c) => c.id === place.category);
          const selected = place.id === selectedId;
          return `<li>
            <button type="button" class="place-item${selected ? ' is-selected' : ''}" data-place-id="${place.id}" aria-current="${selected}">
              <span class="place-icon" style="--pin:${cat.color}" aria-hidden="true">${cat.icon}</span>
              <span class="place-text">
                <span class="place-name">${escapeHtml(localized(place.name))}</span>
                <span class="place-meta">${escapeHtml(t(`categories.${place.category}`))}${place.coordinates ? '' : ` · <em>${escapeHtml(t('panel.geoStatus.unverified'))}</em>`}</span>
              </span>
            </button>
          </li>`;
        })
        .join('');
    },
  };
}
