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
 *  - 'confirmed'      : position checked visually on the map by the Morges.info team
 *  - 'cross-checked'  : two or more independent sources agree (within ~30 m)
 *  - 'single-source'  : one published source; should be confirmed on OpenStreetMap
 *  - 'estimated'      : coordinates derived from neighbouring published points or descriptions
 *                       (approximate; confirm on the map)
 *  - 'team'           : coordinates supplied by the Morges.info team, not cross-checked with a published source
 *
 * `markerOf: '<place id>'` = the place lies inside another one (e.g. a museum in the château):
 * it is listed and searchable, but shares that place's marker on the map.
 *  - 'unverified'     : no reliable position yet (not drawn on the map)
 *
 * Optional fields follow src/data/schema.js: `address`, `website` and `openingHours` stay
 * null unless verified; `photos` holds current photographs (with credit and licence);
 * `lastVerified` is the date the record was last checked.
 *
 * `archive` is reserved for the future historical photo archive. Its shape is
 * described and validated in ./archive.js. It stays empty in this version.
 */

/** @typedef {'fr'|'en'|'de'|'it'} Lang */
/** @typedef {Record<Lang, string>} Localized */

/** Indication given by the Morges.info project team (no public URL), labelled in the four languages. */
const TEAM_WHAT = {
  location: {
    fr: 'emplacement indiqué',
    en: 'location given',
    de: 'Lage angegeben',
    it: 'posizione indicata',
  },
  checked: {
    fr: 'position contrôlée sur la carte',
    en: 'position checked on the map',
    de: 'Position auf der Karte überprüft',
    it: 'posizione verificata sulla mappa',
  },
  supplied: {
    fr: 'coordonnées fournies',
    en: 'coordinates supplied',
    de: 'Koordinaten angegeben',
    it: 'coordinate fornite',
  },
};
const TEAM = (kind, date) => ({
  label: Object.fromEntries(
    Object.entries(TEAM_WHAT[kind]).map(([lang, what]) => [lang, `Morges.info — ${what} (${date})`]),
  ),
});

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
      fr: 'Château savoyard construit en 1286 par Louis de Savoie, sur plan carré. De 1536 à 1798, il servit de résidence aux baillis bernois. Il abrite aujourd’hui plusieurs musées : le Musée militaire vaudois, le Musée de l’artillerie, le Musée suisse de la figurine historique et le Musée de la Gendarmerie vaudoise ; le Musée Paderewski s’y est également installé.',
      en: 'Savoyard castle built in 1286 by Louis of Savoy on a square plan. From 1536 to 1798 it was the residence of the Bernese bailiffs. Today it houses several museums: the Vaud Military Museum, the Artillery Museum, the Swiss Museum of Historical Figurines and the Vaud Gendarmerie Museum; the Paderewski Museum has also moved in.',
      de: 'Savoyer Schloss, 1286 von Ludwig von Savoyen auf quadratischem Grundriss erbaut. Von 1536 bis 1798 diente es den Berner Landvögten als Residenz. Heute beherbergt es mehrere Museen: das Waadtländer Militärmuseum, das Artilleriemuseum, das Schweizerische Museum für historische Figuren und das Museum der Waadtländer Gendarmerie; auch das Paderewski-Museum ist hier eingezogen.',
      it: 'Castello sabaudo costruito nel 1286 da Luigi di Savoia su pianta quadrata. Dal 1536 al 1798 fu la residenza dei balivi bernesi. Oggi ospita diversi musei: il Museo militare vodese, il Museo dell’artiglieria, il Museo svizzero della figurina storica e il Museo della Gendarmeria vodese; vi si è insediato anche il Museo Paderewski.',
    },
    factSources: [
      { label: 'museums.ch — Château de Morges et ses musées', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/chateau-de-morges-et-ses-musees-2164.html' },
      { label: 'MySwitzerland — Château de Morges et ses musées', url: 'https://www.myswitzerland.com/en/experiences/chateau-de-morges-et-ses-musees/' },
      { label: 'État de Vaud — Le château de Morges s’enrichit d’un cinquième musée (Paderewski)', url: 'https://www.vd.ch/actualites/communiques-de-presse-de-letat-de-vaud/detail/communique/le-chateau-de-morges-senrichit-dun-cinquieme-musee-1381336713' },
    ],
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
    archive: { photos: [] },
  },
  {
    id: 'temple',
    category: 'religious',
    coordinates: { lat: 46.51075, lng: 6.50034 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Mapcarta / OpenStreetMap (way 102523526)', url: 'https://mapcarta.com/W102523526' },
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
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
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
      note:
        'Adresse « Place de l’Hôtel-de-Ville 1 » confirmée par l’équipe Morges.info le 17.10.2026 (une autre source ' +
        'indiquait « Place de l’Hôtel-de-Ville 3 / Grand-Rue 81 »).',
    },
    name: {
      fr: 'Hôtel de Ville',
      en: 'Town Hall',
      de: 'Rathaus',
      it: 'Municipio',
    },
    location: {
      fr: 'Place de l’Hôtel-de-Ville, entre la Grand-Rue et la rue Louis-de-Savoie',
      en: 'Place de l’Hôtel-de-Ville, between the Grand-Rue and the Rue Louis-de-Savoie',
      de: 'Place de l’Hôtel-de-Ville, zwischen der Grand-Rue und der Rue Louis-de-Savoie',
      it: 'Place de l’Hôtel-de-Ville, tra la Grand-Rue e la Rue Louis-de-Savoie',
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
    address: 'Place de l’Hôtel-de-Ville 1, 1110 Morges',
    website: 'https://www.morges.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
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
        { label: 'Apple Maps — Grand-Rue 68 (46.5089, 6.4978)', url: 'https://maps.apple.com/place?coordinate=46.5089023%2C6.4978197&name=GRAND-RUE+68%2CMorges' },
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
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
    archive: { photos: [] },
  },
  {
    id: 'place-du-marche',
    category: 'streets',
    // Approximate: derived from the town hall and Grand-Rue 68, which face each other across the Grand-Rue.
    coordinates: { lat: 46.50866, lng: 6.49786 },
    geo: {
      status: 'estimated',
      sources: [
        TEAM('location', '15.10.2026'),
        { label: 'Wikimedia Commons — Hôtel de ville, Morges (46.50842, 6.49790)', url: 'https://commons.wikimedia.org/wiki/Category:H%C3%B4tel_de_ville,_Morges' },
        { label: 'Apple Maps — Grand-Rue 68 (46.50890, 6.49782)', url: 'https://maps.apple.com/place?coordinate=46.5089023%2C6.4978197&name=GRAND-RUE+68%2CMorges' },
      ],
      note:
        'Location given by the Morges.info team: where the Place de l’Hôtel-de-Ville meets the Grand-Rue. The town hall ' +
        '(Place de l’Hôtel-de-Ville 3 / Grand-Rue 81) and Grand-Rue 68 face each other across the street; the point is ' +
        'their midpoint, i.e. on the Grand-Rue in front of the town hall. Accuracy about ±25 m — confirm on the preview.',
    },
    name: {
      fr: 'Place du Marché',
      en: 'Place du Marché (Market Square)',
      de: 'Place du Marché (Marktplatz)',
      it: 'Place du Marché (Piazza del Mercato)',
    },
    location: {
      fr: 'À l’intersection de la Grand-Rue et de la place de l’Hôtel-de-Ville',
      en: 'Where the Grand-Rue meets the Place de l’Hôtel-de-Ville',
      de: 'An der Kreuzung von Grand-Rue und Place de l’Hôtel-de-Ville',
      it: 'All’incrocio tra la Grand-Rue e la Place de l’Hôtel-de-Ville',
    },
    description: {
      fr: 'Selon le Dictionnaire historique de la Suisse, l’activité commerciale de Morges s’est développée surtout dans la moitié sud de la ville, autour du port et de la place du Marché. Le plan de la ville prévoyait une place destinée au marché hebdomadaire.',
      en: 'According to the Historical Dictionary of Switzerland, commercial life in Morges developed mainly in the southern half of the town, around the harbour and the Place du Marché. The town plan included a square for the weekly market.',
      de: 'Laut dem Historischen Lexikon der Schweiz entwickelte sich das Geschäftsleben von Morges vor allem in der südlichen Stadthälfte, rund um den Hafen und die Place du Marché. Der Stadtplan sah einen Platz für den Wochenmarkt vor.',
      it: 'Secondo il Dizionario storico della Svizzera, l’attività commerciale di Morges si sviluppò soprattutto nella metà meridionale della città, attorno al porto e alla Place du Marché. Il piano urbano prevedeva una piazza per il mercato settimanale.',
    },
    factSources: [HLS_MORGES],
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
    archive: { photos: [] },
  },
  {
    id: 'parc-independance',
    category: 'lake',
    coordinates: { lat: 46.5053265, lng: 6.4958408 },
    geo: {
      status: 'confirmed',
      sources: [
        { label: 'Club Nautique Morgien — Parc de l’Indépendance', url: 'https://www.cnmorges.ch/lieu/parc-de-lindependance/' },
        TEAM('checked', '15.10.2026'),
      ],
      note: 'Position checked on the map by the Morges.info team on 2026-10-15.',
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
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
    archive: { photos: [] },
  },
  {
    id: 'quai-lochmann',
    category: 'lake',
    coordinates: { lat: 46.50816, lng: 6.49983 },
    geo: {
      status: 'confirmed',
      sources: [
        { label: 'Placegrab — Quai Jean-Louis-Lochmann, Morges', url: 'https://www.placegrab.com/switzerland/article-quai-du-mont-blanc-morges-287157/' },
        TEAM('checked', '15.10.2026'),
      ],
      note:
        'Representative point on a long lakeside quay; checked on the map by the Morges.info team on 2026-10-15.',
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
      fr: 'Quai au bord du Léman, construit entre 1884 et 1890 et officiellement nommé quai Jean-Louis-Lochmann. Il porte le nom de Jean-Louis Lochmann (1812–1889), maître de gymnastique décédé à Morges.',
      en: 'Lakeside quay built between 1884 and 1890 and officially named Quai Jean-Louis-Lochmann, after Jean-Louis Lochmann (1812–1889), a gymnastics teacher who died in Morges.',
      de: 'Uferquai am Genfersee, zwischen 1884 und 1890 erbaut und offiziell Quai Jean-Louis-Lochmann genannt – nach Jean-Louis Lochmann (1812–1889), einem Turnlehrer, der in Morges starb.',
      it: 'Lungolago costruito tra il 1884 e il 1890 e ufficialmente denominato Quai Jean-Louis-Lochmann, in onore di Jean-Louis Lochmann (1812–1889), insegnante di ginnastica morto a Morges.',
    },
    factSources: [
      { label: 'Musées de Lausanne (museris) — Jean-Louis Lochmann', url: 'https://museris.lausanne.ch/SGP/getPDFFiche.aspx?id=4217' },
      { label: 'Ville de Morges — Histoire : les dates clés', url: 'https://www.morges.ch/vivre-a-morges/administration/administration-communale/historique/histoire-les-dates-cles-de-la-ville-de-morges-9151' },
    ],
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
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
    factSources: [
      HLS_MORGES,
      { label: 'ADAC Skipper-Portal — Port de Morges', url: 'https://skipper.adac.de/en/marinas/port-de-morges-2/' },
    ],
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
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
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
    archive: { photos: [] },
  },
  {
    id: 'beausobre',
    category: 'culture',
    coordinates: { lat: 46.51614, lng: 6.49958 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Mapcarta / OpenStreetMap (node 6444731534)', url: 'https://mapcarta.com/fr/N6444731534' },
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
    address: 'Avenue de Vertou 2, 1110 Morges',
    website: 'https://beausobre.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-15',
    archive: { photos: [] },
  },
  {
    id: 'debarcadere-cgn',
    category: 'transport',
    coordinates: { lat: 46.508355, lng: 6.500553 },
    geo: {
      status: 'single-source',
      sources: [
        { label: 'Morges Région Tourisme — Débarcadère CGN', url: 'https://www.morges-tourisme.ch/landmarks/debarcadere-cgn-morges/' },
      ],
      note:
        'Point fourni par l’équipe Morges.info : 46.51000, 6.49590 (≈ 400 m plus au nord-ouest, à l’intérieur de la ville). ' +
        'Le débarcadère se trouve quai Igor-Stravinski, au bord du lac : le point publié par Morges Région Tourisme a été retenu. À confirmer sur la carte.',
    },
    name: {
      fr: 'Débarcadère CGN',
      en: 'CGN boat pier',
      de: 'CGN-Schiffsanlegestelle',
      it: 'Imbarcadero CGN',
    },
    location: {
      fr: 'Quai Igor-Stravinski, au bord du lac',
      en: 'Quai Igor-Stravinski, on the lakeshore',
      de: 'Quai Igor-Stravinski, am Seeufer',
      it: 'Quai Igor-Stravinski, sulla riva del lago',
    },
    description: {
      fr: 'Débarcadère de la Compagnie générale de navigation sur le lac Léman (CGN). Les bateaux n’y font pas escale tous les jours : la desserte varie selon la saison, et des croisières à thème en partent aussi en hiver. Les billets peuvent notamment être achetés à bord.',
      en: 'Pier of the Lake Geneva navigation company (CGN). Boats do not call every day: service varies with the season, and themed cruises also leave from here in winter. Tickets can be bought on board, among other options.',
      de: 'Anlegestelle der Genfersee-Schifffahrtsgesellschaft CGN. Die Schiffe legen nicht täglich an: Das Angebot ändert sich je nach Saison, und im Winter starten hier auch Themenfahrten. Fahrkarten sind unter anderem an Bord erhältlich.',
      it: 'Imbarcadero della Compagnia generale di navigazione sul Lago Lemano (CGN). I battelli non vi fanno scalo tutti i giorni: il servizio varia secondo la stagione e d’inverno partono da qui anche crociere a tema. I biglietti si possono acquistare anche a bordo.',
    },
    factSources: [
      { label: 'Ville de Morges — CGN', url: 'https://www.morges.ch/vivre-a-morges/en-transports-publics/cgn--compagnie-generale-de-navigation-10486' },
      { label: 'Morges Région Tourisme — Débarcadère CGN', url: 'https://www.morges-tourisme.ch/en/P968/cgn-pier-morges' },
    ],
    address: null,
    website: 'https://www.cgn.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'musee-forel',
    category: 'culture',
    coordinates: { lat: 46.509167, lng: 6.498333 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Wikidata Q3329046 — Musée Forel', url: 'https://www.wikidata.org/wiki/Q3329046' },
        { label: 'Wikipédia — Musée Alexis-Forel', url: 'https://fr.wikipedia.org/wiki/Mus%C3%A9e_Alexis-Forel' },
      ],
      note:
        'Point fourni par l’équipe Morges.info : 46.51090, 6.49590 (≈ 270 m plus au nord-ouest). Wikidata et Wikipédia concordent sur la ' +
        'Grand-Rue 54 : leur position a été retenue. À confirmer sur la carte.',
    },
    name: {
      fr: 'Musée Alexis Forel',
      en: 'Alexis Forel Museum',
      de: 'Musée Alexis Forel',
      it: 'Museo Alexis Forel',
    },
    location: {
      fr: 'Grand-Rue 54, dans la vieille ville',
      en: 'Grand-Rue 54, in the old town',
      de: 'Grand-Rue 54, in der Altstadt',
      it: 'Grand-Rue 54, nel centro storico',
    },
    description: {
      fr: 'Musée installé dans une maison historique de la Grand-Rue, achetée en 1918 par le graveur Alexis Forel et son épouse Emmeline, qui y installèrent leurs collections. On y découvre des poupées du XVIIIe siècle, des jeux et jouets anciens, du mobilier et des arts décoratifs, ainsi que, depuis 2010, des icônes russes des XVIe et XVIIe siècles.',
      en: 'Museum in a historic house on the Grand-Rue, bought in 1918 by the engraver Alexis Forel and his wife Emmeline, who installed their collections there. It shows 18th-century dolls, old games and toys, furniture and decorative arts and, since 2010, Russian icons from the 16th and 17th centuries.',
      de: 'Museum in einem historischen Haus an der Grand-Rue, das der Kupferstecher Alexis Forel und seine Frau Emmeline 1918 kauften und in dem sie ihre Sammlungen einrichteten. Zu sehen sind Puppen aus dem 18. Jahrhundert, alte Spiele und Spielzeug, Möbel und Kunsthandwerk sowie seit 2010 russische Ikonen aus dem 16. und 17. Jahrhundert.',
      it: 'Museo ospitato in una casa storica della Grand-Rue, acquistata nel 1918 dall’incisore Alexis Forel e da sua moglie Emmeline, che vi sistemarono le loro collezioni. Vi si trovano bambole del Settecento, giochi e giocattoli antichi, mobili e arti decorative e, dal 2010, icone russe del XVI e XVII secolo.',
    },
    factSources: [
      { label: 'museums.ch — Musée Alexis Forel', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/musee-alexis-forel-2163.html' },
      { label: 'MySwitzerland — Musée Alexis Forel', url: 'https://www.myswitzerland.com/en-id/experiences/musee-alexis-forel/' },
    ],
    address: 'Grand-Rue 54, 1110 Morges',
    website: 'https://museeforel.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'musee-bolle',
    category: 'culture',
    coordinates: { lat: 46.507686, lng: 6.497765 },
    geo: {
      status: 'single-source',
      sources: [
        { label: 'Morges Région Tourisme — Musée Bolle', url: 'https://www.morges-tourisme.ch/landmarks/musee-bolle/' },
      ],
      note:
        'Point fourni par l’équipe Morges.info : 46.51130, 6.49510 (≈ 450 m plus au nord, près de la gare). Le musée est rue ' +
        'Louis-de-Savoie 73-75 : le point publié par Morges Région Tourisme (deux pages concordantes) a été retenu. À confirmer sur la carte.',
    },
    name: {
      fr: 'Musée Bolle',
      en: 'Bolle Museum',
      de: 'Musée Bolle',
      it: 'Museo Bolle',
    },
    location: {
      fr: 'Rue Louis-de-Savoie 73-75, dans la vieille ville',
      en: 'Rue Louis-de-Savoie 73-75, in the old town',
      de: 'Rue Louis-de-Savoie 73-75, in der Altstadt',
      it: 'Rue Louis-de-Savoie 73-75, nel centro storico',
    },
    description: {
      fr: 'Musée installé dans une demeure du XVIIIe siècle de la vieille ville. Il conserve une collection de gravures, de cartes postales et de photographies anciennes consacrées au patrimoine de Morges et de la région lémanique, et présente des expositions temporaires. Anciennement Expo Fondation Bolle, il porte le nom de Musée Bolle depuis 2022.',
      en: 'Museum in an 18th-century house in the old town. It holds a collection of engravings, postcards and old photographs recording the heritage of Morges and the Lake Geneva region, and presents temporary exhibitions. Formerly Expo Fondation Bolle, it has been called Musée Bolle since 2022.',
      de: 'Museum in einem Haus aus dem 18. Jahrhundert in der Altstadt. Es bewahrt eine Sammlung von Stichen, Postkarten und alten Fotografien zum Erbe von Morges und der Genferseeregion und zeigt Wechselausstellungen. Früher Expo Fondation Bolle, heisst es seit 2022 Musée Bolle.',
      it: 'Museo ospitato in una dimora settecentesca del centro storico. Conserva una collezione di incisioni, cartoline e fotografie d’epoca dedicate al patrimonio di Morges e della regione del Lemano e propone mostre temporanee. Già Expo Fondation Bolle, dal 2022 si chiama Musée Bolle.',
    },
    factSources: [
      { label: 'museums.ch — Musée Bolle', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/musee-bolle-2932.html' },
      { label: 'Vaud Promotion — Retrospective 2008–2025 (Musée Bolle)', url: 'https://www.vaud.ch/en/tourism/events/morges-retrospective-2008-2025' },
    ],
    address: 'Rue Louis-de-Savoie 73-75, 1110 Morges',
    website: 'https://museebolle.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'musee-paderewski',
    category: 'culture',
    // Inside the château: shares its marker on the map instead of stacking a second one.
    coordinates: { lat: 46.506692, lng: 6.496704 },
    markerOf: 'chateau',
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'museums.ch — Musée Paderewski', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/musee-paderewski-2165.html' },
        { label: 'Wikipedia — Morges Castle', url: 'https://en.wikipedia.org/wiki/Morges_Castle' },
      ],
      note:
        'Point fourni par l’équipe Morges.info : 46.51070, 6.49750 (≈ 450 m plus au nord), qui correspond peut-être à l’ancien ' +
        'emplacement du musée (Grenier bernois, place du Casino, 1991–2016). Le musée étant aujourd’hui au château, il partage le marqueur du château.',
    },
    name: {
      fr: 'Musée Paderewski',
      en: 'Paderewski Museum',
      de: 'Paderewski-Museum',
      it: 'Museo Paderewski',
    },
    location: {
      fr: 'Au château de Morges, rue du Château',
      en: 'In Morges Castle, Rue du Château',
      de: 'Im Schloss Morges, Rue du Château',
      it: 'Nel castello di Morges, Rue du Château',
    },
    description: {
      fr: 'Musée consacré à Ignacy Jan Paderewski (1860–1941), pianiste, compositeur et homme politique polonais, qui vécut au domaine de Riond-Bosson, à Morges, de 1897 à 1940 ; en 1919, il fut Premier ministre de Pologne. Photos, lettres, partitions et objets personnels sont présentés au château, où le musée s’est installé après avoir occupé le Grenier bernois de 1991 à 2016.',
      en: 'Museum devoted to Ignacy Jan Paderewski (1860–1941), the Polish pianist, composer and statesman who lived at the Riond-Bosson estate in Morges from 1897 to 1940; in 1919 he was Prime Minister of Poland. Photographs, letters, scores and personal belongings are shown at the castle, where the museum moved after occupying the Grenier bernois from 1991 to 2016.',
      de: 'Museum über Ignacy Jan Paderewski (1860–1941), polnischer Pianist, Komponist und Politiker, der von 1897 bis 1940 auf dem Gut Riond-Bosson in Morges lebte; 1919 war er polnischer Ministerpräsident. Fotos, Briefe, Partituren und persönliche Gegenstände werden im Schloss gezeigt, wohin das Museum zog, nachdem es von 1991 bis 2016 im Grenier bernois untergebracht war.',
      it: 'Museo dedicato a Ignacy Jan Paderewski (1860–1941), pianista, compositore e uomo politico polacco che visse nella tenuta di Riond-Bosson a Morges dal 1897 al 1940; nel 1919 fu primo ministro della Polonia. Foto, lettere, spartiti e oggetti personali sono esposti al castello, dove il museo si è trasferito dopo aver occupato il Grenier bernois dal 1991 al 2016.',
    },
    factSources: [
      { label: 'museums.ch — Musée Paderewski', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/musee-paderewski-2165.html' },
      { label: 'Dictionnaire historique de la Suisse — Ignacy Jan Paderewski', url: 'https://hls-dhs-dss.ch/articles/028488' },
      { label: 'Morges Région Tourisme — Musée Paderewski', url: 'https://www.morges-tourisme.ch/en/P3915' },
    ],
    address: null,
    website: 'https://paderewski-morges.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'maison-dessin-presse',
    category: 'culture',
    coordinates: { lat: 46.50876, lng: 6.49924 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'Mapcarta / OpenStreetMap (node 1207861986)', url: 'https://mapcarta.com/fr/N1207861986' },
        { label: 'Wikipédia — Maison du dessin de presse', url: 'https://fr.wikipedia.org/wiki/Maison_du_dessin_de_presse' },
      ],
      note:
        'Point fourni par l’équipe Morges.info : 46.51120, 6.49530 (≈ 410 m plus au nord-ouest). OpenStreetMap et Wikipédia concordent ' +
        'sur la rue Louis-de-Savoie 39 : leur position a été retenue. À confirmer sur la carte.',
    },
    name: {
      fr: 'Maison du Dessin de Presse',
      en: 'House of Press Cartooning',
      de: 'Haus der Pressezeichnung',
      it: 'Casa del disegno di stampa',
    },
    location: {
      fr: 'Rue Louis-de-Savoie 39, dans la vieille ville',
      en: 'Rue Louis-de-Savoie 39, in the old town',
      de: 'Rue Louis-de-Savoie 39, in der Altstadt',
      it: 'Rue Louis-de-Savoie 39, nel centro storico',
    },
    description: {
      fr: 'Lieu d’exposition consacré au dessin de presse, ouvert en 2009. Il présente des expositions temporaires consacrées à des dessinatrices et dessinateurs de presse ; la première était dédiée à André Paul.',
      en: 'Exhibition venue devoted to press cartooning, opened in 2009. It presents temporary exhibitions about press cartoonists; the first was devoted to André Paul.',
      de: 'Ausstellungsort für Pressezeichnungen, 2009 eröffnet. Er zeigt Wechselausstellungen über Pressezeichnerinnen und Pressezeichner; die erste war André Paul gewidmet.',
      it: 'Spazio espositivo dedicato al disegno di stampa, aperto nel 2009. Presenta mostre temporanee dedicate a disegnatrici e disegnatori di stampa; la prima era dedicata ad André Paul.',
    },
    factSources: [
      { label: 'museums.ch — Maison du dessin de presse', url: 'https://www.museums.ch/fr/visite-au-musee/musees/musees/maison-du-dessin-de-presse-2733.html' },
      { label: 'Le Temps — « André Paul levait le verre »', url: 'https://www.letemps.ch/culture/andre-paul-levait-verre' },
    ],
    address: 'Rue Louis-de-Savoie 39, 1110 Morges',
    website: 'https://mddp.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'eglise-saint-francois-de-sales',
    category: 'religious',
    coordinates: { lat: 46.509245, lng: 6.499956 },
    geo: {
      status: 'team',
      sources: [
        TEAM('supplied', '16.10.2026'),
        { label: 'Mapcarta / OpenStreetMap (way 102523526)', url: 'https://mapcarta.com/W102523526' },
        { label: 'Morges Région Tourisme — L’Église catholique St-François de Sales', url: 'https://www.morges-tourisme.ch/fr/P4977' },
      ],
      note:
        'Coordonnées fournies par l’équipe Morges.info le 16.10.2026 (46.50924546705738, 6.499955818241464). Cohérentes avec ' +
        'Mapcarta (église ≈ 190 m au sud du temple) et avec l’adresse rue Louis-de-Savoie 31 : l’estimation précédente ' +
        '(46.50904, 6.50034) était à ≈ 35 m.',
    },
    name: {
      fr: 'Église catholique Saint-François-de-Sales',
      en: 'St Francis de Sales Catholic Church',
      de: 'Katholische Kirche Saint-François-de-Sales',
      it: 'Chiesa cattolica di San Francesco di Sales',
    },
    location: {
      fr: 'Rue Louis-de-Savoie 31, dans la vieille ville',
      en: 'Rue Louis-de-Savoie 31, in the old town',
      de: 'Rue Louis-de-Savoie 31, in der Altstadt',
      it: 'Rue Louis-de-Savoie 31, nel centro storico',
    },
    description: {
      fr: 'Église catholique de style néogothique, construite en 1842 d’après les plans de l’architecte Henri Perregaux et consacrée le 6 octobre 1844.',
      en: 'Neo-Gothic Catholic church, built in 1842 to plans by the architect Henri Perregaux and consecrated on 6 October 1844.',
      de: 'Neugotische katholische Kirche, 1842 nach Plänen des Architekten Henri Perregaux erbaut und am 6. Oktober 1844 geweiht.',
      it: 'Chiesa cattolica in stile neogotico, costruita nel 1842 su progetto dell’architetto Henri Perregaux e consacrata il 6 ottobre 1844.',
    },
    factSources: [
      { label: 'Morges Région Tourisme — L’Église catholique St-François de Sales', url: 'https://www.morges-tourisme.ch/fr/P4977' },
      { label: 'theodia — Église Saint-François de Sales, Morges', url: 'https://theodia.org/fr?place=657' },
    ],
    address: 'Rue Louis-de-Savoie 31, 1110 Morges',
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'parc-vertou',
    category: 'lake',
    coordinates: { lat: 46.516258, lng: 6.513974 },
    geo: {
      status: 'cross-checked',
      sources: [
        TEAM('supplied', '16.10.2026'),
        { label: 'Waze — Skate Park, Parc de Vertou', url: 'https://www.waze.com/live-map/directions/skate-park-parc-de-vertou-morges?to=place.w.4260305.42668588.6794801' },
      ],
      note:
        'Coordonnées fournies par l’équipe Morges.info le 16.10.2026 (46.516258064414394, 6.513974252562291), concordantes avec ' +
        'le skatepark du parc sur Waze (≈ 46.516, 6.513). Le point de la carte search.ch utilisé auparavant (46.51112, 6.51469) ' +
        'était à ≈ 570 m.',
    },
    name: {
      fr: 'Parc de Vertou',
      en: 'Parc de Vertou',
      de: 'Parc de Vertou',
      it: 'Parco di Vertou',
    },
    location: {
      fr: 'Au sud-est de la ville, au bord du lac',
      en: 'South-east of the town, on the lakeshore',
      de: 'Im Südosten der Stadt, am Seeufer',
      it: 'A sud-est della città, sulla riva del lago',
    },
    description: {
      fr: 'Parc au bord du Léman qui associe espaces de détente et installations sportives : aire de jeux, skatepark rénové en 2017 et parcours de street workout. Il porte le nom de Vertou, ville voisine de Nantes jumelée avec Morges depuis 1957.',
      en: 'Lakeside park combining relaxation areas and sports facilities: a playground, a skatepark renovated in 2017 and a street-workout course. It is named after Vertou, a town near Nantes twinned with Morges since 1957.',
      de: 'Park am Genfersee, der Erholungsflächen und Sportanlagen verbindet: Spielplatz, 2017 erneuerter Skatepark und Street-Workout-Parcours. Er ist nach Vertou benannt, einer Stadt bei Nantes, die seit 1957 Partnerstadt von Morges ist.',
      it: 'Parco sulla riva del Lemano che unisce spazi di relax e impianti sportivi: parco giochi, skatepark rinnovato nel 2017 e percorso di street workout. Porta il nome di Vertou, città vicino a Nantes gemellata con Morges dal 1957.',
    },
    factSources: [
      { label: 'Ville de Morges — Parc de Vertou', url: 'https://www.morges.ch/vivre-a-morges/sites/parc-de-vertou-200609' },
    ],
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'parc-prairie',
    category: 'lake',
    coordinates: { lat: 46.510819, lng: 6.489033 },
    geo: {
      status: 'team',
      sources: [TEAM('supplied', '16.10.2026')],
      note:
        'Coordonnées fournies par l’équipe Morges.info le 16.10.2026 (46.510818828775875, 6.489033458014868), à ≈ 380 m à ' +
        'l’ouest de la gare — cohérent avec « quelques minutes à pied de la gare » (Ville de Morges). Aucune coordonnée publiée ' +
        'trouvée pour les recouper.',
    },
    name: {
      fr: 'Parc de la Prairie',
      en: 'Parc de la Prairie',
      de: 'Parc de la Prairie',
      it: 'Parco della Prairie',
    },
    location: {
      fr: 'Face à la patinoire des Eaux-Minérales, à quelques minutes à pied de la gare',
      en: 'Opposite the Eaux-Minérales ice rink, a few minutes’ walk from the station',
      de: 'Gegenüber der Eisbahn Eaux-Minérales, wenige Gehminuten vom Bahnhof',
      it: 'Di fronte alla pista di pattinaggio delle Eaux-Minérales, a pochi minuti a piedi dalla stazione',
    },
    description: {
      fr: 'Parc public de la Ville de Morges, situé face à la patinoire des Eaux-Minérales, à quelques minutes à pied de la gare.',
      en: 'Public park of the Ville de Morges, opposite the Eaux-Minérales ice rink, a few minutes’ walk from the station.',
      de: 'Öffentlicher Park der Stadt Morges, gegenüber der Eisbahn Eaux-Minérales, wenige Gehminuten vom Bahnhof entfernt.',
      it: 'Parco pubblico della Città di Morges, di fronte alla pista di pattinaggio delle Eaux-Minérales, a pochi minuti a piedi dalla stazione.',
    },
    factSources: [
      { label: 'Ville de Morges — Parc de la Prairie', url: 'https://www.morges.ch/vivre-a-morges/sites/parc-de-la-prairie-200610' },
    ],
    address: null,
    website: null,
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-16',
    archive: { photos: [] },
  },
  {
    id: 'patinoire-eaux-minerales',
    category: 'sport',
    coordinates: { lat: 46.512104, lng: 6.488004 },
    geo: {
      status: 'cross-checked',
      sources: [
        { label: 'local.ch — Patinoire des Eaux Minérales', url: 'https://www.local.ch/fr/d/morges/1110/patinoire/patinoire-des-eaux-minerales-gqaTfjOHZVp9cfwfrwCuzQ' },
        { label: 'L’Agenda — Patinoire des Eaux Minérales', url: 'https://www.l-agenda.online/lieux/patinoire-des-eaux-minerales/' },
      ],
      note:
        'local.ch : 46.512104, 6.488004 ; L’Agenda : 46.511967, 6.487935 (≈ 15 m d’écart). Cohérent avec l’adresse ' +
        '(avenue Henry-Warnery 8, ≈ 400 m de la gare selon Suisse Tourisme) et avec le parc de la Prairie, « face à la ' +
        'patinoire » (Ville de Morges), à ≈ 160 m.',
    },
    name: {
      fr: 'Patinoire des Eaux-Minérales',
      en: 'Eaux-Minérales Ice Rink',
      de: 'Eisbahn Eaux-Minérales',
      it: 'Pista di pattinaggio delle Eaux-Minérales',
    },
    location: {
      fr: 'Avenue Henry-Warnery, à l’ouest de la gare, face au parc de la Prairie',
      en: 'Avenue Henry-Warnery, west of the station, opposite the Parc de la Prairie',
      de: 'Avenue Henry-Warnery, westlich des Bahnhofs, gegenüber dem Parc de la Prairie',
      it: 'Avenue Henry-Warnery, a ovest della stazione, di fronte al Parc de la Prairie',
    },
    description: {
      fr: 'Patinoire régionale de Morges, ouverte au public pendant la saison d’hiver, en général de fin octobre à fin mars. Elle comprend aussi une halle de curling de trois pistes et accueille le club de hockey Forward Morges, les Patineurs de Morges et le Curling Club de Morges. En 2025, le Conseil communal a approuvé sa rénovation et sa transformation en complexe sportif « quatre saisons » ; le référendum lancé contre ce projet n’a pas abouti.',
      en: 'Morges’s regional ice rink, open to the public during the winter season, usually from late October to late March. It also has a three-sheet curling hall and is home to the Forward Morges ice hockey club, the Patineurs de Morges skating club and the Morges Curling Club. In 2025 the town council approved its renovation and conversion into a year-round “four seasons” sports complex; the referendum launched against the project did not gather enough signatures.',
      de: 'Regionale Eisbahn von Morges, während der Wintersaison für die Öffentlichkeit geöffnet, in der Regel von Ende Oktober bis Ende März. Dazu gehört eine Curlinghalle mit drei Rinks; hier spielen der Eishockeyclub Forward Morges, der Eislaufclub Patineurs de Morges und der Curling Club Morges. 2025 genehmigte der Gemeinderat die Sanierung und den Umbau zu einem Ganzjahres-Sportzentrum („quatre saisons“); das Referendum gegen das Projekt kam nicht zustande.',
      it: 'Pista di pattinaggio regionale di Morges, aperta al pubblico durante la stagione invernale, di solito da fine ottobre a fine marzo. Comprende anche una sala da curling con tre piste e ospita il club di hockey Forward Morges, i Patineurs de Morges e il Curling Club di Morges. Nel 2025 il Consiglio comunale ha approvato la sua ristrutturazione e trasformazione in un centro sportivo «quattro stagioni»; il referendum lanciato contro il progetto non è riuscito.',
    },
    factSources: [
      { label: 'Ville de Morges — Patinoire des Eaux-Minérales', url: 'https://www.morges.ch/vivre-a-morges/patinoire/patinoire-des-eaux-minerales-1911' },
      { label: 'Suisse Tourisme — La patinoire des Eaux-Minérales, Morges', url: 'https://www.myswitzerland.com/fr-ch/experiences/la-patinoire-des-eaux-minerales-morges/' },
      { label: 'loisirs.ch — Patinoire des Eaux-Minérales', url: 'https://www.loisirs.ch/loisirs/30659/patinoire-des-eaux-minerales' },
      { label: 'Vaud Tourisme — Patinoire des Eaux-Minérales (saison 2026-2027)', url: 'https://www.vaud.ch/en/tourism/activites/skating-rink-eaux-minerales' },
      { label: 'Wikipedia — Forward-Morges HC', url: 'https://en.wikipedia.org/wiki/Forward-Morges_HC' },
      { label: 'Ville de Morges — Le projet de rénovation-transformation de la patinoire peut aller de l’avant', url: 'https://www.morges.ch/actualites/le-projet-de-renovation-transformation-de-la-patinoire-peut-aller-de-lavant-209500' },
      { label: 'RTS — La patinoire de Morges va se muer en complexe sportif « quatre saisons » (2025)', url: 'https://www.rts.ch/info/regions/vaud/2025/article/morges-un-complexe-sportif-remplacera-la-vieille-patinoire-des-eaux-minerales-28813578.html' },
    ],
    address: 'Avenue Henry-Warnery 8, 1110 Morges',
    website: 'https://www.morges.ch/vivre-a-morges/patinoire/patinoire-des-eaux-minerales-1911',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-17',
    archive: { photos: [] },
  },
  {
    id: 'piscine-du-parc',
    category: 'sport',
    coordinates: { lat: 46.504666, lng: 6.493514 },
    geo: {
      status: 'team',
      sources: [TEAM('supplied', '17.10.2026')],
      note:
        'Coordonnées fournies par l’équipe Morges.info le 17.10.2026 (46.50466558571261, 6.493513869312793). La seule ' +
        'source publiée trouvée (Nageurs.com, fiche de 2009 : 46.506645, 6.49249) place la piscine ≈ 230 m plus au ' +
        'nord-ouest ; le point de l’équipe est retenu.',
    },
    name: {
      fr: 'Piscine du Parc',
      en: 'Parc Swimming Pool',
      de: 'Freibad Piscine du Parc',
      it: 'Piscina del Parco',
    },
    location: {
      fr: 'Promenade Général-Guisan, au bord du lac, à l’ouest du château',
      en: 'Promenade Général-Guisan, on the lakeshore, west of the castle',
      de: 'Promenade Général-Guisan, am Seeufer, westlich des Schlosses',
      it: 'Promenade Général-Guisan, in riva al lago, a ovest del castello',
    },
    description: {
      fr: 'Piscine municipale en plein air de la Ville de Morges, au bord du Léman. Elle compte un bassin olympique de 50 m à huit couloirs, un bassin non-nageurs avec deux toboggans, une pataugeoire, un terrain de beach-volley et un restaurant. Elle est ouverte chaque année de mi-mai à mi-septembre ; en 2026, du 14 mai au 21 septembre.',
      en: 'The Ville de Morges’s municipal open-air swimming pool, on the shore of Lake Geneva. It has an eight-lane, 50-metre Olympic pool, a non-swimmers’ pool with two slides, a paddling pool, a beach-volleyball court and a restaurant. It opens every year from mid-May to mid-September; in 2026, from 14 May to 21 September.',
      de: 'Städtisches Freibad der Stadt Morges am Ufer des Genfersees. Es bietet ein olympisches 50-Meter-Becken mit acht Bahnen, ein Nichtschwimmerbecken mit zwei Rutschbahnen, ein Planschbecken, ein Beachvolleyballfeld und ein Restaurant. Geöffnet ist es jedes Jahr von Mitte Mai bis Mitte September; 2026 vom 14. Mai bis 21. September.',
      it: 'Piscina comunale all’aperto della Città di Morges, sulla riva del Lemano. Dispone di una vasca olimpionica di 50 m a otto corsie, di una vasca per non nuotatori con due scivoli, di una piscina per bambini, di un campo da beach volley e di un ristorante. È aperta ogni anno da metà maggio a metà settembre; nel 2026, dal 14 maggio al 21 settembre.',
    },
    factSources: [
      { label: 'Ville de Morges — Piscine du Parc', url: 'https://www.morges.ch/vivre-a-morges/loisirs/liste-des-loisirs/activites-diverses/piscine-du-parc-5961' },
      { label: 'Ville de Morges — Ouverture de la piscine du Parc le 14 mai (2026)', url: 'https://www.morges.ch/actualites/ouverture-de-la-piscine-du-parc-le-14-mai-209387' },
      { label: 'Vaud Tourisme — Piscine de Morges', url: 'https://www.vaud.ch/tourisme/activites/piscine-de-morges/' },
      { label: 'Piscine du Parc — site officiel', url: 'https://piscinemorges.ch/' },
    ],
    address: 'Promenade Général-Guisan 11, 1110 Morges',
    website: 'https://piscinemorges.ch/',
    openingHours: null,
    photos: [],
    lastVerified: '2026-10-17',
    archive: { photos: [] },
  },
];

export function getPlace(id) {
  return PLACES.find((p) => p.id === id);
}

/** Map centre: Morges old town. */
export const MORGES_CENTER = { lat: 46.5095, lng: 6.4985 };
