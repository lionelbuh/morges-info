import { validateText, validateSources } from './schema.js';

/**
 * Historical milestones — each one sourced and linked to a place on the map.
 * Add only dated facts supported by the cited sources.
 */
const HLS = { label: 'Dictionnaire historique de la Suisse (DHS), article « Morges »', url: 'https://hls-dhs-dss.ch/fr/articles/002447/' };
const MUSEUMS = { label: 'museums.ch — Château de Morges et ses musées', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/chateau-de-morges-et-ses-musees-2164.html' };

export const MILESTONES = [
  {
    period: '1286',
    text: {
      fr: 'Louis de Savoie fait construire le château ; le bourg de Morges est fondé à la même époque.',
      en: 'Louis of Savoy has the castle built; the town of Morges is founded at the same time.',
      de: 'Ludwig von Savoyen lässt das Schloss erbauen; zur selben Zeit wird die Stadt Morges gegründet.',
      it: 'Luigi di Savoia fa costruire il castello; nello stesso periodo viene fondato il borgo di Morges.',
    },
    placeId: 'chateau',
    sources: [MUSEUMS, { label: 'ISOS — Inventaire fédéral des sites construits, Morges', url: 'https://api.isos.bak.admin.ch/ob/4493/doc/ISOS_4493.pdf' }],
  },
  {
    period: '1510–1620',
    text: {
      fr: 'Constructions qui composent aujourd’hui l’hôtel de ville.',
      en: 'Construction of the buildings that make up today’s town hall.',
      de: 'Entstehung der Bauteile, aus denen das heutige Rathaus besteht.',
      it: 'Costruzioni che compongono l’attuale municipio.',
    },
    placeId: 'hotel-de-ville',
    sources: [HLS, { label: 'Wikidata Q3146164', url: 'https://www.wikidata.org/wiki/Q3146164' }],
  },
  {
    period: '1536–1798',
    text: {
      fr: 'Période bernoise : le château sert de résidence aux baillis bernois.',
      en: 'Bernese period: the castle is the residence of the Bernese bailiffs.',
      de: 'Berner Zeit: Das Schloss dient den Berner Landvögten als Residenz.',
      it: 'Periodo bernese: il castello è la residenza dei balivi bernesi.',
    },
    placeId: 'chateau',
    sources: [MUSEUMS],
  },
  {
    period: '1691–1696',
    text: {
      fr: 'Berne fait construire le port actuel, avec ses deux jetées incurvées ; la douane suit en 1702.',
      en: 'Bern has the present harbour built, with its two curved jetties; the customs house follows in 1702.',
      de: 'Bern lässt den heutigen Hafen mit seinen zwei gebogenen Molen bauen; 1702 folgt das Zollgebäude.',
      it: 'Berna fa costruire il porto attuale, con i due moli curvi; la dogana segue nel 1702.',
    },
    placeId: 'port',
    sources: [HLS],
  },
  {
    period: '1769–1776',
    text: {
      fr: 'Reconstruction du temple, sous l’influence du classicisme français.',
      en: 'The Protestant church is rebuilt, influenced by French classicism.',
      de: 'Neubau der reformierten Kirche unter dem Einfluss des französischen Klassizismus.',
      it: 'Ricostruzione del tempio, sotto l’influenza del classicismo francese.',
    },
    placeId: 'temple',
    sources: [HLS],
  },
  {
    period: '1884–1890',
    text: {
      fr: 'Construction du quai Lochmann.',
      en: 'Construction of the Quai Lochmann.',
      de: 'Bau des Quai Lochmann.',
      it: 'Costruzione del Quai Lochmann.',
    },
    placeId: 'quai-lochmann',
    sources: [{ label: 'Ville de Morges — Histoire : les dates clés', url: 'https://www.morges.ch/vivre-a-morges/administration/administration-communale/historique/histoire-les-dates-cles-de-la-ville-de-morges-9151' }],
  },
  {
    period: '1986',
    text: {
      fr: 'Inauguration du théâtre de Beausobre.',
      en: 'The Beausobre theatre opens.',
      de: 'Eröffnung des Théâtre de Beausobre.',
      it: 'Inaugurazione del teatro di Beausobre.',
    },
    placeId: 'beausobre',
    sources: [{ label: 'Morges Région Tourisme — Centre culturel et de loisirs de Beausobre', url: 'https://www.morges-tourisme.ch/en/P7094/culture-and-leisure-centre-of-beausobre' }],
  },
  {
    period: '2012–2014',
    text: {
      fr: 'Transformation et restauration de l’hôtel de ville.',
      en: 'Conversion and restoration of the town hall.',
      de: 'Umbau und Restaurierung des Rathauses.',
      it: 'Trasformazione e restauro del municipio.',
    },
    placeId: 'hotel-de-ville',
    sources: [{ label: 'world-architects — Ferrari Architectes, Hôtel de Ville de Morges (2012–2014)', url: 'https://world-architects.com/en/projects/view/hotel-de-ville-de-morges' }],
  },
];

/**
 * "Then and now" pairs: an archive photograph (archive.js model, verified) next
 * to a current photograph of the same spot. Empty until material is verified.
 * Shape: { id, placeId, archivePhotoId, currentPhoto: Photo, caption: { fr, … } }
 */
export const THEN_AND_NOW = [];

export function validateMilestone(m) {
  const p = `milestone(${m && m.period})`;
  return [
    ...(m && /^\d{4}(–\d{4})?$/.test(m.period) ? [] : [`${p}.period must be YYYY or YYYY–YYYY`]),
    ...validateText(m && m.text, `${p}.text`, { allLanguages: true }),
    ...validateSources(m && m.sources, `${p}.sources`),
  ];
}
