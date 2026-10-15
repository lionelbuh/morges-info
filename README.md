# Morges.info

Carte interactive et multilingue de Morges (VD, Suisse), au bord du Léman.
*Interactive multilingual map of Morges, Switzerland, on Lake Geneva.*

- **Langues :** français (par défaut), English, Deutsch, Italiano — sélecteur `FR | EN | DE | IT`
- **Carte :** [MapLibre GL JS](https://maplibre.org) avec tuiles vectorielles [OpenFreeMap](https://openfreemap.org)
  (données [OpenStreetMap](https://www.openstreetmap.org/copyright)), style sur mesure « Léman » — **sans clé d'API**
- **Vue 2D / 3D** : carte à plat ou inclinée avec bâtiments en relief (hauteurs indicatives issues d'OSM)
- **10 lieux** avec catégorie, emplacement, description dans les 4 langues, sources citées et statut de vérification
- Recherche (insensible aux accents, dans les 4 langues), filtres par catégorie, liens directs (`/#chateau`, `?lang=de`)
- Responsive : ordinateur, tablette, mobile (panneau en « bottom sheet » jusqu'à 900 px de large)
- Site 100 % statique : hébergement gratuit ou presque

> Les archives historiques (photos anciennes) sont une phase future. La structure de données est prête
> (`src/data/archive.js`), mais aucune image n'est affichée et **aucun envoi public n'est possible**.

## Prérequis

- Node.js 20 ou plus récent (testé avec Node 22) et npm
- Un navigateur avec WebGL 2 pour la carte (tous les navigateurs récents)

## Lancer et prévisualiser en local

```bash
npm install
npm run dev          # développement : http://localhost:5173
npm run build        # build de production dans dist/
npm run preview      # prévisualise le build : http://localhost:4173
```

Points à regarder lors de la prévisualisation (avec les vraies tuiles, ce que les tests automatiques ne
peuvent pas faire) : chaque marqueur tombe-t-il sur le bon bâtiment ou le bon lieu ? Le rendu des couleurs, des
rues et des libellés vous convient-il ? La vue 3D est-elle agréable sur votre téléphone ?

## Tests et contrôles

```bash
npm run lint         # ESLint
npm test             # tests unitaires (Vitest) : données, traductions, recherche, style de carte, archives
npm run build        # build de production
npm run check        # les trois ci-dessus

npx playwright install chromium   # une seule fois
npm run test:e2e     # tests navigateur (Playwright) : desktop, tablette (portrait et paysage), mobile
```

Les tests navigateur **n'appellent jamais les serveurs de tuiles** : ils servent des tuiles synthétiques
(formes inventées, voir `tests/e2e/fixtures/`). Ils vérifient le fonctionnement (marqueurs, 2D/3D, langues,
recherche, filtres, mise en page), pas l'apparence avec les vraies données. Avec un Chromium déjà installé :
`PLAYWRIGHT_CHROMIUM_PATH=/chemin/vers/chrome npm run test:e2e`.

Le workflow GitHub Actions `.github/workflows/ci.yml` exécute tous ces contrôles à chaque push sur `main`
et à chaque pull request.

## Structure

```
index.html                  page unique
src/main.js                 assemblage : état, recherche, sélection, langue, 2D/3D, chargement différé de la carte
src/map/map.js              carte MapLibre (marqueurs, contrôles, 2D/3D, libellés localisés)
src/map/style.js            style de carte « Léman » (couleurs, couches, attribution, fournisseur de tuiles)
src/data/places.js          lieux : coordonnées, textes FR/EN/DE/IT, sources, statut de vérification
src/data/categories.js      catégories (couleur, icône)
src/data/archive.js         modèle + validation des futures photos historiques
src/i18n/index.js           moteur de traduction (t(), langue, persistance)
src/i18n/locales/*.js       textes d'interface fr / en / de / it
src/ui/                     composants : panneau d'information, liste & filtres, recherche, sélecteur de langue
src/styles/main.css         styles
tests/unit/                 tests Vitest
tests/e2e/                  tests Playwright (+ fixtures : tuiles synthétiques, interception réseau)
docs/MAP.md                 technologie de carte, fournisseur de tuiles, coûts, 3D
docs/DATA.md                règles pour ajouter / vérifier un lieu, état de vérification
docs/HISTORICAL_ARCHIVE.md  conception des archives historiques (phase future)
```

## Déploiement

`npm run build` produit un dossier `dist/` statique (chemins relatifs) qui peut être servi par n'importe quel
hébergeur statique. Exemples (non configurés — à faire par le propriétaire du compte) :

- **Netlify / Cloudflare Pages :** commande de build `npm run build`, dossier de publication `dist`.
  Les deux proposent des prévisualisations automatiques par branche.
- **GitHub Pages :** activer Pages dans les paramètres du dépôt (source « GitHub Actions ») puis ajouter un
  workflow qui publie `dist/` avec `actions/upload-pages-artifact` et `actions/deploy-pages`.
- **Serveur classique (Apache/Nginx) :** copier le contenu de `dist/` à la racine du site.

Le nom de domaine `morges.info` (DNS) doit être configuré chez l'hébergeur et le registraire par le
propriétaire du domaine.

## Attribution et conditions d'utilisation de la carte

- L'attribution « OpenFreeMap © OpenMapTiles Data from OpenStreetMap » (avec lien vers
  <https://www.openstreetmap.org/copyright>) est toujours visible sur la carte ; sur mobile, elle est répétée
  dans le panneau d'information qui recouvre le bas de la carte.
- OpenFreeMap : gratuit, sans clé, usage commercial autorisé, attribution obligatoire, **sans garantie de
  service**. Les serveurs `tile.openstreetmap.org` ne sont plus utilisés (leur politique interdit l'usage
  intensif sans autorisation).
- Détails, alternatives et coûts : [`docs/MAP.md`](docs/MAP.md).

## Exactitude des données

Aucune coordonnée ni aucun fait historique n'est inventé : chaque lieu cite ses sources (visibles dans le
panneau, section « Sources »). Le statut de vérification de chaque position est affiché :

| Statut | Signification |
| --- | --- |
| `cross-checked` | au moins deux sources indépendantes concordent |
| `single-source` | une seule source publiée — à confirmer sur OpenStreetMap |
| `unverified` | position inconnue : le lieu est listé mais **pas** placé sur la carte |

Voir [`docs/DATA.md`](docs/DATA.md) pour les lieux à confirmer.
