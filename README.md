# Morges.info

Carte interactive et multilingue de Morges (VD, Suisse), au bord du Léman.
*Interactive multilingual map of Morges, Switzerland, on Lake Geneva.*

- **Langues :** français (par défaut), English, Deutsch, Italiano — sélecteur `FR | EN | DE | IT`
- **Carte :** [Leaflet](https://leafletjs.com) + tuiles [OpenStreetMap](https://www.openstreetmap.org/copyright), sans clé d'API
- **10 lieux** avec catégorie, emplacement, description dans les 4 langues et sources citées
- Recherche (insensible aux accents, dans les 4 langues), filtres par catégorie, liens directs (`/#chateau`, `?lang=de`)
- Responsive : ordinateur, tablette, mobile (panneau en « bottom sheet »)
- Site 100 % statique : hébergement gratuit ou presque

> Les archives historiques (photos anciennes) sont une phase future. La structure de données est prête
> (`src/data/archive.js`), mais aucune image n'est affichée et **aucun envoi public n'est possible**.

## Prérequis

- Node.js 20 ou plus récent (testé avec Node 22) et npm

## Lancer en local

```bash
npm install
npm run dev          # http://localhost:5173
```

## Tests et contrôles

```bash
npm run lint         # ESLint
npm test             # tests unitaires (Vitest) : données, traductions, recherche, modèle d'archive
npm run build        # build de production dans dist/
npm run check        # les trois ci-dessus

npx playwright install chromium   # une seule fois
npm run test:e2e     # tests navigateur (Playwright) : desktop, tablette, mobile
```

Les tests navigateur interceptent les tuiles OpenStreetMap (image vide) pour ne pas solliciter les serveurs
OSM. Si un Chromium est déjà installé, on peut l'utiliser avec
`PLAYWRIGHT_CHROMIUM_PATH=/chemin/vers/chrome npm run test:e2e`.

Le workflow GitHub Actions `.github/workflows/ci.yml` exécute tous ces contrôles à chaque push sur `main`
et à chaque pull request.

## Structure

```
index.html                  page unique
src/main.js                 assemblage : état, recherche, sélection, langue
src/map/map.js              carte Leaflet (tuiles, marqueurs, attribution)
src/data/places.js          lieux : coordonnées, textes FR/EN/DE/IT, sources, statut de vérification
src/data/categories.js      catégories (couleur, icône)
src/data/archive.js         modèle + validation des futures photos historiques
src/i18n/index.js           moteur de traduction (t(), langue, persistance)
src/i18n/locales/*.js       textes d'interface fr / en / de / it
src/ui/                     composants : panneau d'information, liste & filtres, recherche, sélecteur de langue
src/styles/main.css         styles (thème Léman / patrimoine suisse)
tests/unit/                 tests Vitest
tests/e2e/                  tests Playwright
docs/DATA.md                règles pour ajouter / vérifier un lieu
docs/HISTORICAL_ARCHIVE.md  conception des archives historiques (phase future)
```

## Déploiement

`npm run build` produit un dossier `dist/` statique (chemins relatifs) qui peut être servi par n'importe quel
hébergeur statique. Exemples (non configurés — à faire par le propriétaire du compte) :

- **Netlify / Cloudflare Pages :** commande de build `npm run build`, dossier de publication `dist`.
- **GitHub Pages :** activer Pages dans les paramètres du dépôt (source « GitHub Actions ») puis ajouter un
  workflow qui publie `dist/` avec `actions/upload-pages-artifact` et `actions/deploy-pages`.
- **Serveur classique (Apache/Nginx) :** copier le contenu de `dist/` à la racine du site.

Le nom de domaine `morges.info` (DNS) doit être configuré chez l'hébergeur et le registraire par le
propriétaire du domaine.

## OpenStreetMap : attribution et conditions d'utilisation

- L'attribution « © OpenStreetMap contributors » (lien vers <https://www.openstreetmap.org/copyright>) est
  toujours visible sur la carte ; sur mobile, elle est répétée dans le panneau d'information qui recouvre
  le bas de la carte.
- Les tuiles proviennent de `tile.openstreetmap.org`, soumis à la
  [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) de l'OSMF : usage modéré, pas de
  téléchargement massif, attribution obligatoire, en-tête `Referer` envoyé par le navigateur (ne pas ajouter
  de politique `no-referrer`). **Si le trafic devient important**, passer à un fournisseur de tuiles dédié
  (offre gratuite d'un fournisseur commercial, ou tuiles auto-hébergées) en changeant `TILE_URL` et
  `TILE_ATTRIBUTION` dans `src/map/map.js`.
- Les coordonnées des lieux sont tirées de sources publiques citées dans `src/data/places.js`.

## Exactitude des données

Aucune coordonnée ni aucun fait historique n'est inventé : chaque lieu cite ses sources (visibles dans le
panneau, section « Sources »). Le statut de vérification de chaque position est affiché :

| Statut | Signification |
| --- | --- |
| `cross-checked` | au moins deux sources indépendantes concordent |
| `single-source` | une seule source publiée — à confirmer sur OpenStreetMap |
| `unverified` | position inconnue : le lieu est listé mais **pas** placé sur la carte |

Voir [`docs/DATA.md`](docs/DATA.md) pour les lieux à confirmer.
