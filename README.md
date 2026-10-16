# Morges.info

**La vie locale, les bonnes adresses et la mémoire de Morges.**
Guide local indépendant consacré à la commune de Morges (VD, Suisse).

| Page | URL | Contenu |
| --- | --- | --- |
| Accueil | `/` | présentation, aperçu de la carte, lieux, vie locale, récit à la une |
| Carte | `/carte/` | carte interactive 2D / 3D, recherche, filtres, fiches des lieux |
| Commerces | `/commerces/` | sélection éditoriale de commerces indépendants (en préparation) |
| Histoire | `/histoire/` | repères historiques sourcés, futures archives photographiques |
| Vie locale | `/vie-locale/` | événements à venir et infos pratiques, sources et dates de vérification |
| Récits | `/recits/` | récits écrits à partir de sources citées |
| À propos | `/a-propos/` | charte éditoriale, indépendance, publicité, crédits |

- **Langues :** français (par défaut), English, Deutsch, Italiano — `FR | EN | DE | IT` sur toutes les pages
- **Carte :** [MapLibre GL JS](https://maplibre.org) + tuiles vectorielles [OpenFreeMap](https://openfreemap.org)
  (données [OpenStreetMap](https://www.openstreetmap.org/copyright)), **sans clé d'API**
- **Contenus vérifiables :** chaque fait cite sa source ; les informations changeantes indiquent leur date de
  vérification ; rien n'est inventé pour remplir un champ (voir [`docs/CONTENT.md`](docs/CONTENT.md))
- Site statique multipage, pré-rendu en français pour le référencement ; aucune dépendance payante

> Les archives historiques (photos anciennes) sont une phase future : le modèle de données est prêt
> (`src/data/archive.js`, `src/data/history.js`), aucune image n'est publiée et **aucun envoi public n'est possible**.
> Aucun commerce n'est encore listé : chaque adresse doit d'abord être vérifiée.

## Prérequis

- Node.js 20 ou plus récent (testé avec Node 22) et npm
- Un navigateur avec WebGL 2 pour la carte (tous les navigateurs récents)

## Lancer et prévisualiser en local

```bash
npm install
npm run dev          # développement : http://localhost:5173 (accueil), /carte/, /histoire/ …
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
index.html, carte/, commerces/, histoire/, vie-locale/, recits/, a-propos/   une page HTML par section
build/site-plugin.js        pré-rendu français des pages, sitemap.xml, robots.txt (plugin Vite, sans dépendance)
src/site/                   pages de contenu : config (URL), layout (en-tête, pied, <head>), pages, composants, client
src/main.js                 page carte : état, recherche, sélection, 2D/3D, chargement différé de MapLibre
src/map/                    carte MapLibre (map.js) et style « Léman » (style.js)
src/data/                   contenus : lieux, commerces, événements, infos pratiques, récits, histoire, archives, schéma
src/i18n/                   moteur de traduction et textes fr / en / de / it
src/ui/                     composants de la carte : panneau d'information, liste & filtres, recherche
src/styles/main.css         styles
tests/unit/                 tests Vitest (données, traductions, recherche, style, contenus, pages)
tests/e2e/                  tests Playwright (carte, site, liens internes, SEO) + fixtures
docs/                       CONTENT.md (contenus), PHOTOS.md (photos, licences), MAP.md (carte), DATA.md (lieux), HISTORICAL_ARCHIVE.md
scripts/build-hero.mjs      npm run images : versions AVIF/WebP/JPEG de la photo d'accueil
```

## Déploiement

`npm run build` produit un dossier `dist/` statique (chemins relatifs) qui peut être servi par n'importe quel
hébergeur statique. Exemples (non configurés — à faire par le propriétaire du compte) :

Le site utilise des URL absolues (`/carte/`, `/histoire/` …) : il doit être servi **à la racine** d'un domaine
ou d'un sous-domaine (les prévisualisations Netlify / Cloudflare Pages le sont).

- **Netlify / Cloudflare Pages :** commande de build `npm run build`, dossier de publication `dist`.
  Les deux proposent des prévisualisations automatiques par branche.
- **GitHub Pages :** possible avec un domaine personnalisé (site servi à la racine) ; une adresse de projet
  `utilisateur.github.io/morges-info/` nécessiterait d'adapter `base` dans `vite.config.js`.
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
