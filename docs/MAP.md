# Carte : technologie, fournisseur de tuiles et 3D

*Mis à jour le 15 octobre 2026.*

## Choix technique : MapLibre GL JS + OpenFreeMap

La version 0.1 utilisait Leaflet avec des tuiles **raster** OpenStreetMap. Le rendu ne pouvait pas être
personnalisé (couleurs fixes du style OSM standard) et Leaflet ne gère ni l'inclinaison, ni la rotation, ni
les bâtiments en 3D.

La migration vers **MapLibre GL JS** (open source, licence BSD) apporte :

| Besoin | Leaflet + tuiles raster OSM | MapLibre + tuiles vectorielles |
| --- | --- | --- |
| Style personnalisé (pierre, sauge, bleu Léman) | non | oui (`src/map/style.js`) |
| Libellés nets et localisés (Lac Léman / Genfersee / Lake Geneva) | non | oui |
| Inclinaison, rotation, bâtiments 3D | non | oui |
| Clé d'API | non | non |
| Poids JavaScript | ~57 kB gzip | ~280 kB gzip + worker ~145 kB, **chargé après l'interface** |

La différence de poids est compensée par un chargement différé : la recherche, la liste et les fiches
s'affichent immédiatement (~17 kB gzip), la carte se charge ensuite.

Version utilisée : **maplibre-gl 6.11.2**. La série 5.x est concernée par l'avis de sécurité critique
[GHSA-jrc7-96c5-q579](https://github.com/advisories/GHSA-jrc7-96c5-q579) (corrigé à partir de 6.5) ; `npm audit`
ne signale aucune vulnérabilité avec 6.11.2. MapLibre 6 exige **WebGL 2** : sans WebGL 2, le site affiche un
message et reste utilisable (recherche, liste, fiches) — testé automatiquement.

## Fournisseur de tuiles : OpenFreeMap

- Tuiles vectorielles au schéma OpenMapTiles, construites à partir d'OpenStreetMap.
- **Gratuit, sans clé d'API, sans inscription**, utilisation commerciale autorisée, pas de limite de
  vues annoncée (selon la documentation / FAQ d'[openfreemap.org](https://openfreemap.org)).
- **Attribution obligatoire** : « OpenFreeMap © OpenMapTiles Data from OpenStreetMap ». Elle est affichée en
  permanence en bas à droite de la carte (et répétée dans le panneau sur mobile, où il recouvre le bas de la
  carte). Ce texte est la formulation demandée par le fournisseur ; il n'est volontairement pas traduit.
- Polices des libellés (Noto Sans) servies par OpenFreeMap ; aucune icône (sprite) n'est chargée.
- Navigation limitée à la région de Morges (`maxBounds`) : moins de requêtes inutiles.

**Limites et risques à connaître**

- OpenFreeMap est un projet financé par des dons, **sans garantie de service (SLA)**. Pour un site
  important, prévoir une solution de repli (ci-dessous). Changer de fournisseur ne demande de modifier que
  `TILEJSON_URL`, `GLYPHS_URL` et `ATTRIBUTION` dans `src/map/style.js`, tant que le fournisseur utilise le
  schéma OpenMapTiles.
- Les conditions peuvent évoluer : relire la FAQ d'OpenFreeMap avant la mise en production.

### Pourquoi plus les serveurs `tile.openstreetmap.org`

La [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) de l'OSMF interdit l'usage
intensif sans autorisation préalable, n'offre aucune garantie et permet un blocage sans préavis. Ces serveurs
ne sont donc pas une solution d'hébergement de tuiles pour un site de production. Ils ne sont plus utilisés.

### Alternatives (aucune n'a été activée)

| Option | Coût | Remarques |
| --- | --- | --- |
| **OpenFreeMap** (actuel) | 0 CHF | sans clé ; sans SLA |
| **Protomaps / PMTiles auto-hébergé** | 0 CHF + hébergement statique | extrait de la région de Morges dans un seul fichier servi par le même hébergeur que le site ; aucune dépendance externe ; nécessite une étape de génération (`pmtiles extract`) et une mise à jour périodique ; style à adapter au schéma Protomaps |
| **swisstopo, fond de carte vectoriel** | 0 CHF (données OGD) | attribution « © swisstopo » ; schéma et conditions à vérifier en détail avant usage |
| **MapTiler Cloud** | gratuit **non commercial** uniquement ; offre commerciale dès ~25 USD/mois | clé d'API requise |
| **Stadia Maps** | gratuit **non commercial** uniquement ; offre commerciale dès ~20 USD/mois | clé d'API requise |

Prix relevés le 15 octobre 2026 par recherche web, à confirmer sur les pages tarifaires officielles.
**Aucun service payant n'a été souscrit.** Recommandation : rester sur OpenFreeMap pour la prévisualisation et
le lancement, et envisager PMTiles auto-hébergé si le trafic augmente ou si une indépendance totale est
souhaitée.

## Vue 3D

- Bouton **2D | 3D** en haut à gauche de la carte ; le choix est mémorisé dans le navigateur.
- En 3D : carte inclinée à 55°, légère rotation, bâtiments extrudés. Rotation et inclinaison à la souris
  (clic droit + glisser, ou Ctrl + glisser) ou à deux doigts. La boussole remet la carte au nord. En 2D, rotation et inclinaison sont
  désactivées pour garder une carte simple.
- **Hauteurs des bâtiments** : champ `render_height` des tuiles OpenMapTiles, calculé à partir de la balise
  OSM `height`, sinon `building:levels` × 3,66 m, sinon **5 m par défaut** (code source :
  [`Building.java`](https://github.com/openmaptiles/planetiler-openmaptiles/blob/main/src/main/java/org/openmaptiles/layers/Building.java)).
  Les volumes sont donc **indicatifs** et non architecturalement exacts ; une note l'indique à l'écran
  dans les quatre langues dès que la 3D est activée.
- Les marqueurs restent verticaux et exactement positionnés en 2D comme en 3D (vérifié par les tests
  e2e, à moins de 2 px de la projection de leurs coordonnées).
- `prefers-reduced-motion` est respecté : pas d'animation de caméra dans ce cas.

## Tests de la carte

L'environnement de développement n'avait pas accès aux serveurs de tuiles. Les tests e2e interceptent donc
toutes les requêtes vers `tiles.openfreemap.org` et servent des **tuiles synthétiques** (formes simples
inventées, `tests/e2e/fixtures/synthetic-tiles.js`). Elles valident le rendu du style, la 3D, les marqueurs et
les contrôles, mais **pas l'apparence avec les vraies données de Morges** : à vérifier visuellement sur une
prévisualisation (voir README).
