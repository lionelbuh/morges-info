import { validateText, validateSources, isIsoDate } from './schema.js';

/**
 * "Récits de Morges" — short stories written only from cited sources.
 * Published stories are complete in fr, en, de and it (checked by the tests).
 * A draft may exist in French only: other languages then show the French text
 * with a notice, until a careful translation is added.
 */
export const STORIES = [
  {
    id: 'port-bernois',
    title: {
      fr: 'Pourquoi Berne a construit un port à Morges',
      en: 'Why Bern built a harbour in Morges',
      de: 'Warum Bern in Morges einen Hafen baute',
      it: 'Perché Berna costruì un porto a Morges',
    },
    summary: {
      fr: 'À la fin du XVIIe siècle, le gouvernement bernois fait de Morges son port sur le Léman. Ses deux jetées incurvées dessinent encore le bord du lac.',
      en: 'At the end of the 17th century, the Bernese government made Morges its harbour on Lake Geneva. Its two curved jetties still shape the lakeshore.',
      de: 'Ende des 17. Jahrhunderts machte die Berner Regierung Morges zu ihrem Hafen am Genfersee. Seine zwei gebogenen Molen prägen bis heute das Seeufer.',
      it: 'Alla fine del XVII secolo il governo bernese fece di Morges il suo porto sul Lemano. I suoi due moli curvi disegnano ancora oggi la riva del lago.',
    },
    body: {
      fr: [
        'Un petit port existe à Morges dès 1536, et un service régulier de bateaux vers Genève en part bientôt.',
        'À cette époque, Berne gouverne le Pays de Vaud : de 1536 à 1798, ses baillis résident au château de Morges. Le gouvernement bernois veut un port de commerce et de guerre sur le Léman, capable d’abriter sa flottille, et le choisit à Morges plutôt qu’à Lausanne-Ouchy.',
        'La jetée sur pieux de bois aménagée en 1664 ne suffit pas à protéger les galères de l’époque. Entre 1691 et 1696, Berne fait donc construire le port actuel, fermé par deux jetées incurvées. Le bâtiment de la douane suit en 1702.',
        'Le port se trouve aujourd’hui entre le château et le quai Lochmann ; il accueille surtout des bateaux de plaisance.',
      ],
      en: [
        'A small harbour existed in Morges as early as 1536, and a regular boat service to Geneva soon left from it.',
        'At that time Bern ruled the Pays de Vaud: from 1536 to 1798 its bailiffs resided in Morges Castle. The Bernese government wanted a commercial and military harbour on Lake Geneva that could shelter its flotilla, and chose Morges rather than Lausanne-Ouchy.',
        'The wooden pile jetty built in 1664 was not enough to protect the galleys of the time. Between 1691 and 1696 Bern therefore had the present harbour built, enclosed by two curved jetties. The customs house followed in 1702.',
        'Today the harbour lies between the castle and the Quai Lochmann; it is used mainly by pleasure boats.',
      ],
      de: [
        'Bereits 1536 gab es in Morges einen kleinen Hafen, von dem bald ein regelmässiger Schiffsverkehr nach Genf ausging.',
        'Damals regierte Bern die Waadt: Von 1536 bis 1798 residierten seine Landvögte im Schloss Morges. Die Berner Regierung wollte am Genfersee einen Handels- und Kriegshafen, der ihre Flotte aufnehmen konnte, und wählte dafür Morges statt Lausanne-Ouchy.',
        'Der 1664 angelegte Steg auf Holzpfählen genügte nicht, um die Galeeren jener Zeit zu schützen. Zwischen 1691 und 1696 liess Bern deshalb den heutigen Hafen bauen, der von zwei gebogenen Molen umschlossen ist. 1702 folgte das Zollgebäude.',
        'Heute liegt der Hafen zwischen dem Schloss und dem Quai Lochmann; er dient vor allem Freizeitbooten.',
      ],
      it: [
        'A Morges esisteva già nel 1536 un piccolo porto, da cui partì presto un servizio regolare di battelli verso Ginevra.',
        'All’epoca Berna governava il Paese di Vaud: dal 1536 al 1798 i suoi balivi risiedettero nel castello di Morges. Il governo bernese voleva sul Lemano un porto commerciale e militare capace di ospitare la sua flottiglia, e scelse Morges anziché Losanna-Ouchy.',
        'Il pontile su pali di legno costruito nel 1664 non bastava a proteggere le galee dell’epoca. Tra il 1691 e il 1696 Berna fece quindi costruire il porto attuale, chiuso da due moli curvi. L’edificio della dogana seguì nel 1702.',
        'Oggi il porto si trova tra il castello e il Quai Lochmann e accoglie soprattutto imbarcazioni da diporto.',
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
