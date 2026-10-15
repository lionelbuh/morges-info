/**
 * Points of interest in Morges (VD, Switzerland).
 *
 * Rules for this file (see docs/DATA.md):
 *  - Never invent coordinates or historical facts.
 *  - Every coordinate must cite where it came from in `geo.sources`.
 *  - Every factual statement in `description` must be backed by `factSources`.
 *  - If a location cannot be verified, set `coordinates: null` and
 *    `geo.status: 'unverified'`. The place is then listed but not drawn on the map.
 *
 * geo.status values:
 *  - 'cross-checked'  : two or more independent sources agree (within ~30 m)
 *  - 'single-source'  : one published source; should be confirmed on OpenStreetMap
 *  - 'unverified'     : no reliable position yet
 *
 * `archive` is reserved for the future historical photo archive. Its shape is
 * described and validated in ./archive.js. It stays empty in this version.
 */

/** @typedef {'fr'|'en'|'de'|'it'} Lang */
/** @typedef {Record<Lang, string>} Localized */

const HLS_MORGES = {
  label: 'Dictionnaire historique de la Suisse (DHS), article « Morges »',
  url: 'https://hls-dhs-dss.ch/fr/articles/002447/',
};

export const PLACES = [
  {
    id: 'chateau',
    category: 'heritage',
    coordinates: { lat: 46.506692, lng: 6.496704 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Wikipedia — Morges Castle', url: 'https://en.wikipedia.org/wiki/Morges_Castle' },
        { label: 'Structurae — Morges Castle', url: 'https://structurae.net/en/structures/morges-castle' },
      ],
    },
    name: {
      fr: 'Château de Morges',
      en: 'Morges Castle',
      de: 'Schloss Morges',
      it: 'Castello di Morges',
    },
    location: {
      fr: 'Au bord du lac, à l’extrémité sud-ouest de la vieille ville',
      en: 'On the lakeshore, at the south-western end of the old town',
      de: 'Am Seeufer, am südwestlichen Ende der Altstadt',
      it: 'Sulla riva del lago, all’estremità sud-occidentale del centro storico',
    },
    description: {
      fr: 'Château savoyard construit en 1286 par Louis de Savoie, sur plan carré. De 1536 à 1798, il servit de résidence aux baillis bernois. Il abrite aujourd’hui plusieurs musées : le Musée militaire vaudois, le Musée de l’artillerie, le Musée suisse de la figurine historique et le Musée de la Gendarmerie vaudoise.',
      en: 'Savoyard castle built in 1286 by Louis of Savoy on a square plan. From 1536 to 1798 it was the residence of the Bernese bailiffs. Today it houses several museums: the Vaud Military Museum, the Artillery Museum, the Swiss Museum of Historical Figurines and the Vaud Gendarmerie Museum.',
      de: 'Savoyer Schloss, 1286 von Ludwig von Savoyen auf quadratischem Grundriss erbaut. Von 1536 bis 1798 diente es den Berner Landvögten als Residenz. Heute beherbergt es mehrere Museen: das Waadtländer Militärmuseum, das Artilleriemuseum, das Schweizerische Museum für historische Figuren und das Museum der Waadtländer Gendarmerie.',
      it: 'Castello sabaudo costruito nel 1286 da Luigi di Savoia su pianta quadrata. Dal 1536 al 1798 fu la residenza dei balivi bernesi. Oggi ospita diversi musei: il Museo militare vodese, il Museo dell’artiglieria, il Museo svizzero della figurina storica e il Museo della Gendarmeria vodese.',
    },
    factSources: [
      { label: 'museums.ch — Château de Morges et ses musées', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/chateau-de-morges-et-ses-musees-2164.html' },
      { label: 'MySwitzerland — Château de Morges et ses musées', url: 'https://www.myswitzerland.com/en/experiences/chateau-de-morges-et-ses-musees/' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'temple',
    category: 'religious',
    coordinates: { lat: 46.51075, lng: 6.50034 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Mapcarta (données OpenStreetMap, way 102523526)', url: 'https://mapcarta.com/W102523526' },
        { label: 'AroundUs — Temple de Morges', url: 'https://aroundus.com/p/6397650-temple-de-morges' },
      ],
    },
    name: {
      fr: 'Temple de Morges',
      en: 'Morges Protestant Church',
      de: 'Reformierte Kirche Morges',
      it: 'Tempio di Morges',
    },
    location: {
      fr: 'Extrémité nord-est de la vieille ville, près du lac',
      en: 'North-eastern end of the old town, near the lake',
      de: 'Nordöstliches Ende der Altstadt, nahe am See',
      it: 'Estremità nord-orientale del centro storico, vicino al lago',
    },
    description: {
      fr: 'Temple protestant reconstruit entre 1769 et 1776. Les plans définitifs sont dus à l’architecte lyonnais Léonard Roux. Son architecture témoigne de l’influence du classicisme français.',
      en: 'Protestant church rebuilt between 1769 and 1776. The final plans were drawn up by the Lyon architect Léonard Roux. Its architecture shows the influence of French classicism.',
      de: 'Reformierte Kirche, zwischen 1769 und 1776 neu erbaut. Die endgültigen Pläne stammen vom Lyoner Architekten Léonard Roux. Ihre Architektur zeigt den Einfluss des französischen Klassizismus.',
      it: 'Tempio protestante ricostruito tra il 1769 e il 1776. I progetti definitivi si devono all’architetto lionese Léonard Roux. La sua architettura testimonia l’influenza del classicismo francese.',
    },
    factSources: [
      HLS_MORGES,
      { label: 'Vaud Promotion — Protestant Church', url: 'https://www.vaud.ch/en/tourism/activites/protestant-church/' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'hotel-de-ville',
    category: 'heritage',
    coordinates: { lat: 46.50842, lng: 6.4979 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Wikidata Q3146164', url: 'https://www.wikidata.org/wiki/Q3146164' },
        { label: 'Wikipédia — Hôtel de ville de Morges', url: 'https://fr.wikipedia.org/wiki/H%C3%B4tel_de_ville_de_Morges' },
      ],
    },
    name: {
      fr: 'Hôtel de Ville',
      en: 'Town Hall',
      de: 'Rathaus',
      it: 'Municipio',
    },
    location: {
      fr: 'Place de l’Hôtel-de-Ville 1, entre la Grand-Rue et la rue Louis-de-Savoie',
      en: 'Place de l’Hôtel-de-Ville 1, between the Grand-Rue and the Rue Louis-de-Savoie',
      de: 'Place de l’Hôtel-de-Ville 1, zwischen der Grand-Rue und der Rue Louis-de-Savoie',
      it: 'Place de l’Hôtel-de-Ville 1, tra la Grand-Rue e la Rue Louis-de-Savoie',
    },
    description: {
      fr: 'L’hôtel de ville intègre des constructions datant de 1510 à 1620. Il est inscrit à l’Inventaire suisse des biens culturels d’importance nationale (n° 6291). Le bâtiment a été transformé et restauré entre 2012 et 2014.',
      en: 'The town hall incorporates structures dating from 1510 to 1620. It is listed in the Swiss Inventory of Cultural Property of National Significance (no. 6291). The building was converted and restored between 2012 and 2014.',
      de: 'Das Rathaus umfasst Bauteile aus der Zeit von 1510 bis 1620. Es ist im Schweizerischen Inventar der Kulturgüter von nationaler Bedeutung verzeichnet (Nr. 6291). Zwischen 2012 und 2014 wurde das Gebäude umgebaut und restauriert.',
      it: 'Il municipio integra costruzioni risalenti al periodo 1510–1620. È iscritto nell’Inventario svizzero dei beni culturali d’importanza nazionale (n. 6291). L’edificio è stato trasformato e restaurato tra il 2012 e il 2014.',
    },
    factSources: [
      HLS_MORGES,
      { label: 'world-architects — Ferrari Architectes, Hôtel de Ville de Morges (2012–2014)', url: 'https://world-architects.com/en/projects/view/hotel-de-ville-de-morges' },
      { label: 'Wikidata Q3146164', url: 'https://www.wikidata.org/wiki/Q3146164' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'grand-rue',
    category: 'streets',
    coordinates: { lat: 46.509388, lng: 6.498589 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'MapQuest — Grand Rue, Morges', url: 'https://www.mapquest.com/ch/grand-rue-522399945' },
        { label: 'Apple Plans — Grand-Rue 68 (46.5089, 6.4978)', url: 'https://maps.apple.com/place?coordinate=46.5089023%2C6.4978197&name=GRAND-RUE+68%2CMorges' },
      ],
    },
    name: {
      fr: 'Grand-Rue',
      en: 'Grand-Rue',
      de: 'Grand-Rue',
      it: 'Grand-Rue',
    },
    location: {
      fr: 'Vieille ville, parallèle à la rive du lac',
      en: 'Old town, parallel to the lakeshore',
      de: 'Altstadt, parallel zum Seeufer',
      it: 'Centro storico, parallela alla riva del lago',
    },
    description: {
      fr: 'Avec la rue Louis-de-Savoie, la Grand-Rue est l’une des deux artères principales du bourg fondé vers 1286 par Louis Ier de Savoie. Aujourd’hui piétonne et bordée de commerces, elle accueille un marché traditionnel le mercredi et le samedi matin.',
      en: 'Together with the Rue Louis-de-Savoie, the Grand-Rue is one of the two main streets of the town founded around 1286 by Louis I of Savoy. Now pedestrianised and lined with shops, it hosts a traditional market on Wednesday and Saturday mornings.',
      de: 'Zusammen mit der Rue Louis-de-Savoie ist die Grand-Rue eine der beiden Hauptachsen der um 1286 von Ludwig I. von Savoyen gegründeten Stadt. Heute ist sie eine Fussgängerzone mit zahlreichen Geschäften; am Mittwoch- und Samstagvormittag findet hier ein traditioneller Markt statt.',
      it: 'Insieme alla Rue Louis-de-Savoie, la Grand-Rue è una delle due arterie principali del borgo fondato intorno al 1286 da Luigi I di Savoia. Oggi pedonale e fiancheggiata da negozi, ospita un mercato tradizionale il mercoledì e il sabato mattina.',
    },
    factSources: [
      HLS_MORGES,
      { label: 'ISOS — Inventaire fédéral des sites construits, Morges', url: 'https://api.isos.bak.admin.ch/ob/4493/doc/ISOS_4493.pdf' },
      { label: 'Morges Région Tourisme — Marché de Morges', url: 'https://www.morges-tourisme.ch/en/P7222/morges-market' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'place-du-marche',
    category: 'streets',
    // Exact position not yet verified — intentionally not drawn on the map.
    coordinates: null,
    geo: {
      status: 'unverified',
      sources: [],
      note: 'No published source with a reliable position was found. Confirm on OpenStreetMap or with the Ville de Morges before adding coordinates.',
    },
    name: {
      fr: 'Place du Marché',
      en: 'Place du Marché (Market Square)',
      de: 'Place du Marché (Marktplatz)',
      it: 'Place du Marché (Piazza del Mercato)',
    },
    location: {
      fr: 'Emplacement exact en cours de vérification',
      en: 'Exact location awaiting verification',
      de: 'Genaue Lage wird noch überprüft',
      it: 'Posizione esatta in corso di verifica',
    },
    description: {
      fr: 'Selon le Dictionnaire historique de la Suisse, l’activité commerciale de Morges s’est développée surtout dans la moitié sud de la ville, autour du port et de la place du Marché. Le plan de la ville prévoyait une place destinée au marché hebdomadaire.',
      en: 'According to the Historical Dictionary of Switzerland, commercial life in Morges developed mainly in the southern half of the town, around the harbour and the Place du Marché. The town plan included a square for the weekly market.',
      de: 'Laut dem Historischen Lexikon der Schweiz entwickelte sich das Geschäftsleben von Morges vor allem in der südlichen Stadthälfte, rund um den Hafen und die Place du Marché. Der Stadtplan sah einen Platz für den Wochenmarkt vor.',
      it: 'Secondo il Dizionario storico della Svizzera, l’attività commerciale di Morges si sviluppò soprattutto nella metà meridionale della città, attorno al porto e alla Place du Marché. Il piano urbano prevedeva una piazza per il mercato settimanale.',
    },
    factSources: [HLS_MORGES],
    archive: { photos: [] },
  },
  {
    id: 'parc-independance',
    category: 'lake',
    coordinates: { lat: 46.5053265, lng: 6.4958408 },
    geo: {
      status: 'single-source',
      sources: [
        { label: 'Club Nautique Morgien — Parc de l’Indépendance', url: 'https://www.cnmorges.ch/lieu/parc-de-lindependance/' },
      ],
    },
    name: {
      fr: 'Parc de l’Indépendance',
      en: 'Independence Park',
      de: 'Parc de l’Indépendance',
      it: 'Parco dell’Indipendenza',
    },
    location: {
      fr: 'Allée F.-A. Forel, au bord du lac, entre le château et la rivière Morges',
      en: 'Allée F.-A. Forel, on the lakeshore, between the castle and the river Morges',
      de: 'Allée F.-A. Forel, am Seeufer, zwischen dem Schloss und dem Fluss Morges',
      it: 'Allée F.-A. Forel, sulla riva del lago, tra il castello e il fiume Morges',
    },
    description: {
      fr: 'Parc au bord du Léman offrant une vue sur le lac, les Alpes et, par temps clair, le Mont-Blanc. Chaque printemps, il accueille la Fête de la Tulipe.',
      en: 'Lakeside park with views over Lake Geneva, the Alps and, on clear days, Mont Blanc. Every spring it hosts the Tulip Festival (Fête de la Tulipe).',
      de: 'Park am Genfersee mit Blick auf den See, die Alpen und bei klarem Wetter den Mont Blanc. Jeden Frühling findet hier das Tulpenfest (Fête de la Tulipe) statt.',
      it: 'Parco sulla riva del Lemano con vista sul lago, sulle Alpi e, nelle giornate limpide, sul Monte Bianco. Ogni primavera ospita la Festa del Tulipano (Fête de la Tulipe).',
    },
    factSources: [
      { label: 'Morges Région Tourisme — Fête de la Tulipe', url: 'https://www.morges-tourisme.ch/en/Z40279' },
      { label: 'CGN — Parc de l’Indépendance', url: 'https://www.cgn.ch/fr/parc-de-l-independance' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'quai-lochmann',
    category: 'lake',
    coordinates: { lat: 46.50816, lng: 6.49983 },
    geo: {
      status: 'single-source',
      sources: [
        { label: 'Placegrab — Quai Jean-Louis-Lochmann, Morges', url: 'https://www.placegrab.com/switzerland/article-quai-du-mont-blanc-morges-287157/' },
      ],
    },
    name: {
      fr: 'Quai Lochmann',
      en: 'Quai Lochmann',
      de: 'Quai Lochmann',
      it: 'Quai Lochmann',
    },
    location: {
      fr: 'Quai Jean-Louis-Lochmann, au bord du lac, près du port',
      en: 'Quai Jean-Louis-Lochmann, on the lakeshore, near the harbour',
      de: 'Quai Jean-Louis-Lochmann, am Seeufer, nahe beim Hafen',
      it: 'Quai Jean-Louis-Lochmann, sulla riva del lago, vicino al porto',
    },
    description: {
      fr: 'Quai au bord du Léman, officiellement nommé quai Jean-Louis-Lochmann. Il porte le nom de Jean-Louis Lochmann (1812–1889), maître de gymnastique décédé à Morges.',
      en: 'Lakeside quay officially named Quai Jean-Louis-Lochmann, after Jean-Louis Lochmann (1812–1889), a gymnastics teacher who died in Morges.',
      de: 'Uferpromenade am Genfersee, offiziell Quai Jean-Louis-Lochmann genannt – nach Jean-Louis Lochmann (1812–1889), einem Turnlehrer, der in Morges starb.',
      it: 'Lungolago ufficialmente denominato Quai Jean-Louis-Lochmann, in onore di Jean-Louis Lochmann (1812–1889), insegnante di ginnastica morto a Morges.',
    },
    factSources: [
      { label: 'Musées de Lausanne (museris) — fiche Jean-Louis Lochmann', url: 'https://museris.lausanne.ch/SGP/getPDFFiche.aspx?id=4217' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'port',
    category: 'lake',
    coordinates: { lat: 46.507, lng: 6.498 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Windy.app — Port de Morges (46.507, 6.4983)', url: 'https://windy.app/forecast2/spot/2664935/Port+de+Morges' },
        { label: 'PredictWind — Port du Château, Morges (46.5071, 6.4979)', url: 'https://www.predictwind.com/marinas/switzerland/vaud/port-du-chteau-morges' },
        { label: 'ADAC Skipper-Portal — Port de Morges', url: 'https://skipper.adac.de/en/marinas/port-de-morges-2/' },
      ],
    },
    name: {
      fr: 'Port de Morges',
      en: 'Morges Harbour',
      de: 'Hafen Morges',
      it: 'Porto di Morges',
    },
    location: {
      fr: 'Entre le château et le quai Lochmann',
      en: 'Between the castle and the Quai Lochmann',
      de: 'Zwischen dem Schloss und dem Quai Lochmann',
      it: 'Tra il castello e il Quai Lochmann',
    },
    description: {
      fr: 'Le port actuel, avec ses deux jetées incurvées, a été construit entre 1691 et 1696 par le gouvernement bernois, qui souhaitait y abriter sa flottille ; le bâtiment de la douane a suivi en 1702. Un petit port est déjà attesté en 1536. Il accueille aujourd’hui surtout des bateaux de plaisance.',
      en: 'The present harbour, with its two curved jetties, was built between 1691 and 1696 by the Bernese government to shelter its flotilla; the customs house followed in 1702. A small port is already recorded in 1536. Today it is used mainly by pleasure boats.',
      de: 'Der heutige Hafen mit seinen zwei gebogenen Molen wurde zwischen 1691 und 1696 von der Berner Regierung erbaut, um ihre Flotte zu schützen; 1702 folgte das Zollgebäude. Ein kleiner Hafen ist bereits 1536 bezeugt. Heute liegen hier vor allem Freizeitboote.',
      it: 'Il porto attuale, con i suoi due moli curvi, fu costruito tra il 1691 e il 1696 dal governo bernese per ospitare la sua flottiglia; l’edificio della dogana seguì nel 1702. Un piccolo porto è già attestato nel 1536. Oggi accoglie soprattutto imbarcazioni da diporto.',
    },
    factSources: [HLS_MORGES],
    archive: { photos: [] },
  },
  {
    id: 'gare',
    category: 'transport',
    coordinates: { lat: 46.5111, lng: 6.4940 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Wikipedia — Morges railway station', url: 'https://en.wikipedia.org/wiki/Morges_railway_station' },
        { label: 'Structurae — Morges Station', url: 'https://structurae.net/en/structures/morges-station' },
      ],
    },
    name: {
      fr: 'Gare de Morges',
      en: 'Morges Railway Station',
      de: 'Bahnhof Morges',
      it: 'Stazione di Morges',
    },
    location: {
      fr: 'Au nord de la vieille ville, reliée au bourg par la rue Centrale',
      en: 'North of the old town, linked to it by the Rue Centrale',
      de: 'Nördlich der Altstadt, mit ihr über die Rue Centrale verbunden',
      it: 'A nord del centro storico, collegata al borgo dalla Rue Centrale',
    },
    description: {
      fr: 'Gare située sur la ligne Lausanne–Genève. Elle est aussi le terminus du chemin de fer Bière–Apples–Morges (BAM).',
      en: 'Station on the Lausanne–Geneva line. It is also the terminus of the Bière–Apples–Morges railway (BAM).',
      de: 'Bahnhof an der Strecke Lausanne–Genf. Er ist zudem Endpunkt der Bahnlinie Bière–Apples–Morges (BAM).',
      it: 'Stazione sulla linea Losanna–Ginevra. È anche il capolinea della ferrovia Bière–Apples–Morges (BAM).',
    },
    factSources: [
      { label: 'Wikipedia — Morges railway station', url: 'https://en.wikipedia.org/wiki/Morges_railway_station' },
      { label: 'Ville de Morges — Rue du Sablon et Rue Centrale', url: 'https://www.morges.ch/vivre-a-morges/rue-du-sablon-et-rue-centrale-203548' },
    ],
    archive: { photos: [] },
  },
  {
    id: 'beausobre',
    category: 'culture',
    coordinates: { lat: 46.51614, lng: 6.49958 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Mapcarta (données OpenStreetMap, node 6444731534)', url: 'https://mapcarta.com/fr/N6444731534' },
        { label: 'Wikipédia — Théâtre de Beausobre', url: 'https://fr.wikipedia.org/wiki/Th%C3%A9%C3%A2tre_de_Beausobre' },
      ],
    },
    name: {
      fr: 'Théâtre de Beausobre',
      en: 'Beausobre Theatre',
      de: 'Théâtre de Beausobre',
      it: 'Teatro di Beausobre',
    },
    location: {
      fr: 'Avenue de Vertou 2',
      en: 'Avenue de Vertou 2',
      de: 'Avenue de Vertou 2',
      it: 'Avenue de Vertou 2',
    },
    description: {
      fr: 'Salle de spectacle de 850 places inaugurée en 1986. Elle fait partie du Centre culturel et de loisirs de Beausobre et propose chaque saison une programmation variée.',
      en: '850-seat performance hall opened in 1986. It is part of the Beausobre Culture and Leisure Centre and offers a varied programme every season.',
      de: 'Theatersaal mit 850 Plätzen, 1986 eröffnet. Er gehört zum Kultur- und Freizeitzentrum Beausobre und bietet jede Saison ein vielfältiges Programm.',
      it: 'Sala di spettacolo da 850 posti inaugurata nel 1986. Fa parte del Centro culturale e ricreativo di Beausobre e propone ogni stagione un programma variegato.',
    },
    factSources: [
      { label: 'Théâtre de Beausobre — fiche technique 2025', url: 'https://beausobre.ch/wp-content/uploads/FICHE-TECHNIQUE-V7.4_2025.pdf' },
      { label: 'Morges Région Tourisme — Centre culturel et de loisirs de Beausobre', url: 'https://www.morges-tourisme.ch/en/P7094/culture-and-leisure-centre-of-beausobre' },
    ],
    archive: { photos: [] },
  },
];

export function getPlace(id) {
  return PLACES.find((p) => p.id === id);
}

/** Map centre: Morges old town. */
export const MORGES_CENTER = { lat: 46.5095, lng: 6.4985 };
