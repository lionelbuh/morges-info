import { validateText, validateSources, isIsoDate } from './schema.js';

/**
 * "Récits de Morges" — short stories written only from cited sources.
 * French first: other languages are added when a careful translation exists;
 * until then the French text is shown with a notice.
 */
export const STORIES = [
  {
    id: 'port-bernois',
    title: { fr: 'Pourquoi Berne a construit un port à Morges' },
    summary: {
      fr: 'À la fin du XVIIe siècle, le gouvernement bernois fait de Morges son port sur le Léman. Ses deux jetées incurvées dessinent encore le bord du lac.',
    },
    body: {
      fr: [
        'Un petit port existe à Morges dès 1536, et un service régulier de bateaux vers Genève en part bientôt.',
        'À cette époque, Berne gouverne le Pays de Vaud : de 1536 à 1798, ses baillis résident au château de Morges. Le gouvernement bernois veut un port de commerce et de guerre sur le Léman, capable d’abriter sa flottille, et le choisit à Morges plutôt qu’à Lausanne-Ouchy.',
        'La jetée sur pieux de bois aménagée en 1664 ne suffit pas à protéger les galères de l’époque. Entre 1691 et 1696, Berne fait donc construire le port actuel, fermé par deux jetées incurvées. Le bâtiment de la douane suit en 1702.',
        'Le port se trouve aujourd’hui entre le château et le quai Lochmann ; il accueille surtout des bateaux de plaisance.',
      ],
    },
    placeIds: ['port', 'chateau', 'quai-lochmann'],
    sources: [
      { label: 'Dictionnaire historique de la Suisse (DHS), article « Morges »', url: 'https://hls-dhs-dss.ch/fr/articles/002447/' },
      { label: 'museums.ch — Château de Morges et ses musées', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/chateau-de-morges-et-ses-musees-2164.html' },
      { label: 'ADAC Skipper-Portal — Port de Morges', url: 'https://skipper.adac.de/en/marinas/port-de-morges-2/' },
    ],
    published: '2026-10-15',
    featured: true,
  },
];

export function validateStory(story) {
  const p = `story(${story && story.id})`;
  const errors = [];
  if (!story || !/^[a-z0-9-]+$/.test(story.id || '')) errors.push(`${p}.id must be kebab-case`);
  errors.push(...validateText(story && story.title, `${p}.title`));
  errors.push(...validateText(story && story.summary, `${p}.summary`));
  errors.push(...validateText(story && story.body, `${p}.body`));
  errors.push(...validateSources(story && story.sources, `${p}.sources`));
  if (!story || !isIsoDate(story.published)) errors.push(`${p}.published must be YYYY-MM-DD`);
  return errors;
}

export function featuredStory(list = STORIES) {
  return list.find((s) => s.featured) || list[0] || null;
}
