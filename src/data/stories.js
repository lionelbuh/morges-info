import { validateText, validateSources, isIsoDate } from './schema.js';

/**
 * "Récits de Morges" — short stories written only from cited sources.
 * Published stories are complete in fr, en, de and it (checked by the tests).
 * A draft may exist in French only: other languages then show the French text
 * with a notice, until a careful translation is added.
 *
 * Newest first. `featured`: the story shown on the home page and at the top of the
 * stories page. `archived: true`: kept whole, under "Archives" (its link still works).
 */
export const STORIES = [
  {
    id: 'stravinsky-morges',
    title: {
      fr: 'Stravinsky à Morges : cinq ans au bord du Léman',
      en: 'Stravinsky in Morges: five years on the shore of Lake Geneva',
      de: 'Strawinsky in Morges: fünf Jahre am Ufer des Genfersees',
      it: 'Stravinskij a Morges: cinque anni sulle rive del Lemano',
    },
    summary: {
      fr: 'Pendant la Première Guerre mondiale, le compositeur russe Igor Stravinsky vit à Morges avec sa famille, de 1915 à 1920. C’est ici qu’il achève Les Noces et compose L’Histoire du soldat.',
      en: 'During the First World War, the Russian composer Igor Stravinsky lived in Morges with his family, from 1915 to 1920. It was here that he completed Les Noces and composed L’Histoire du soldat.',
      de: 'Während des Ersten Weltkriegs lebte der russische Komponist Igor Strawinsky mit seiner Familie von 1915 bis 1920 in Morges. Hier vollendete er Les Noces und komponierte L’Histoire du soldat.',
      it: 'Durante la Prima guerra mondiale il compositore russo Igor Stravinskij visse a Morges con la famiglia, dal 1915 al 1920. Fu qui che completò Les Noces e compose L’Histoire du soldat.',
    },
    body: {
      fr: [
        'Installé en Suisse romande au début de la Première Guerre mondiale, le compositeur russe Igor Stravinsky s’établit à Morges avec sa famille en 1915.',
        'La famille habite d’abord la villa Rogivue, au bord du lac, devenue aujourd’hui l’hôtel « La Maison d’Igor ». De 1917 à 1920, elle loge au deuxième étage de la grande maison Bornand, place Saint-Louis, face au temple.',
        'À Morges, Stravinsky achève Renard et, le 4 avril 1917, la première partition des Noces. L’écrivain vaudois Charles-Ferdinand Ramuz, que lui a présenté le chef d’orchestre Ernest Ansermet, traduit en français les textes russes de ces deux œuvres.',
        'Avec Ramuz, il compose ensuite L’Histoire du soldat : la partition est datée « Morges, 6 avril – 23 septembre 1918 ». L’œuvre est créée à Lausanne le 28 septembre 1918, sous la direction d’Ansermet, dans des décors du peintre René Auberjonois.',
        'En 1920, peu après avoir terminé le ballet Pulcinella, Stravinsky quitte Morges pour la France. Un quai de la ville, au débarcadère, porte aujourd’hui son nom.',
      ],
      en: [
        'Settled in French-speaking Switzerland when the First World War broke out, the Russian composer Igor Stravinsky moved to Morges with his family in 1915.',
        'The family first lived in the Villa Rogivue, by the lake, which is now the hotel “La Maison d’Igor”. From 1917 to 1920 they lived on the second floor of the large Maison Bornand, on Place Saint-Louis, opposite the temple.',
        'In Morges, Stravinsky completed Renard and, on 4 April 1917, the first score of Les Noces. The Vaud writer Charles-Ferdinand Ramuz, whom the conductor Ernest Ansermet had introduced to him, translated the Russian texts of both works into French.',
        'With Ramuz he then wrote L’Histoire du soldat: the score is dated “Morges, 6 April – 23 September 1918”. The work was first performed in Lausanne on 28 September 1918, conducted by Ansermet, with sets by the painter René Auberjonois.',
        'In 1920, shortly after finishing the ballet Pulcinella, Stravinsky left Morges for France. A quay in the town, at the landing stage, bears his name today.',
      ],
      de: [
        'Der russische Komponist Igor Strawinsky, der sich bei Ausbruch des Ersten Weltkriegs in der Westschweiz aufhielt, liess sich 1915 mit seiner Familie in Morges nieder.',
        'Die Familie wohnte zuerst in der Villa Rogivue am Seeufer, heute das Hotel «La Maison d’Igor». Von 1917 bis 1920 lebte sie im zweiten Stock des grossen Hauses Bornand an der Place Saint-Louis, gegenüber der Kirche.',
        'In Morges vollendete Strawinsky Renard und am 4. April 1917 die erste Partitur von Les Noces. Der Waadtländer Schriftsteller Charles-Ferdinand Ramuz, den ihm der Dirigent Ernest Ansermet vorgestellt hatte, übersetzte die russischen Texte beider Werke ins Französische.',
        'Mit Ramuz schrieb er danach L’Histoire du soldat: Die Partitur ist datiert «Morges, 6. April – 23. September 1918». Das Werk wurde am 28. September 1918 in Lausanne uraufgeführt, unter der Leitung von Ansermet und mit Bühnenbildern des Malers René Auberjonois.',
        '1920, kurz nach der Vollendung des Balletts Pulcinella, verliess Strawinsky Morges in Richtung Frankreich. Ein Quai der Stadt, bei der Schiffsanlegestelle, trägt heute seinen Namen.',
      ],
      it: [
        'Stabilitosi nella Svizzera romanda allo scoppio della Prima guerra mondiale, il compositore russo Igor Stravinskij si trasferì a Morges con la famiglia nel 1915.',
        'La famiglia abitò dapprima nella villa Rogivue, in riva al lago, oggi l’albergo «La Maison d’Igor». Dal 1917 al 1920 visse al secondo piano della grande casa Bornand, in place Saint-Louis, di fronte al tempio.',
        'A Morges Stravinskij completò Renard e, il 4 aprile 1917, la prima partitura di Les Noces. Lo scrittore vodese Charles-Ferdinand Ramuz, che gli era stato presentato dal direttore d’orchestra Ernest Ansermet, tradusse in francese i testi russi delle due opere.',
        'Con Ramuz scrisse poi L’Histoire du soldat: la partitura è datata «Morges, 6 aprile – 23 settembre 1918». L’opera fu rappresentata per la prima volta a Losanna il 28 settembre 1918, diretta da Ansermet, con le scene del pittore René Auberjonois.',
        'Nel 1920, poco dopo aver terminato il balletto Pulcinella, Stravinskij lasciò Morges per la Francia. Una banchina della città, all’imbarcadero, porta oggi il suo nome.',
      ],
    },
    placeIds: ['temple', 'debarcadere-cgn'],
    sources: [
      { label: '24 heures — Et Stravinsky devint Vaudois', url: 'https://www.24heures.ch/et-stravinsky-devint-vaudois-240619274060' },
      { label: 'immobilier.ch — Igor Stravinsky, le Russe qui devint vaudois', url: 'https://www.immobilier.ch/fr/actualite/igor-stravinsky-le-russe-qui-devint-vaudois' },
      { label: '24 heures — Igor Stravinsky est mort il y a 50 ans', url: 'https://www.24heures.ch/igor-stravinsky-est-mort-il-y-a-50-ans-328651569167' },
      { label: 'IRCAM, Brahms — Les Noces', url: 'https://brahms.ircam.fr/en/works/work/12219' },
      { label: 'IRCAM — Histoire du soldat (1918)', url: 'https://ressources.ircam.fr/fr/work/histoire-du-soldat' },
      { label: 'BCU Lausanne — Stravinsky and his “Waldensian” ballets', url: 'https://www.bcu-lausanne.ch/en/selections-en/tour-de-danse-2-5-stravinsky-and-his-waldensian-ballets/' },
    ],
    published: '2026-11-01',
    featured: true,
  },
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
    archived: true,
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
  if (story && story.featured && story.archived) errors.push(`${p}: an archived story cannot be featured`);
  return errors;
}

export function featuredStory(list = STORIES) {
  return list.find((s) => s.featured) || list[0] || null;
}
