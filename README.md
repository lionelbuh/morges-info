# Morges.info

**La vie locale, les bonnes adresses et la mémoire de Morges.**
Guide local indépendant consacré à la commune de Morges (VD, Suisse).

| Page | URL | Contenu |
| --- | --- | --- |
| Accueil | `/` | présentation, aperçu de la carte, lieux, vie locale, récit à la une |
| Carte | `/carte/` | carte interactive en 3D par défaut (2D au choix, mémorisée), recherche, filtres, fiches des lieux |
| Commerces | `/commerces/` | sélection éditoriale de commerces indépendants (en préparation) |
| Histoire | `/histoire/` | repères historiques sourcés, futures archives photographiques |
| Vie locale | `/vie-locale/` | événements à venir et infos pratiques, sources et dates de vérification |
| Récits | `/recits/` | récits écrits à partir de sources citées |
| Charte éditoriale | `/a-propos/` | indépendance, sources, publicité, crédits (lien en pied de page) |
| Qui sommes-nous | `/qui-sommes-nous/` | note personnelle des auteurs (lien discret en pied de page) |
| Contribuer | `/contribuer/` | appel aux lecteurs : photos anciennes, nouvelles, corrections, par e-mail à hello@morges.info |
| Photos | `/photos/`, `/photos/<id>/` | galerie hier / aujourd'hui et une page par point de vue (générées depuis les données) |
| Lieux | `/lieux/`, `/lieux/<id>/` | index des lieux et une page par lieu (générées depuis les données) |
| Mentions légales | `/mentions-legales/` | éditeur, contact, protection des données (lien en pied de page) |

- **Langues :** français (par défaut), English, Deutsch, Italiano — `FR | EN | DE | IT` sur toutes les pages
- **Carte :** [MapLibre GL JS](https://maplibre.org) + tuiles vectorielles [OpenFreeMap](https://openfreemap.org)
  (données [OpenStreetMap](https://www.openstreetmap.org/copyright)), **sans clé d'API**
- **Contenus vérifiables :** chaque fait cite sa source ; les informations changeantes indiquent leur date de
  vérification ; rien n'est inventé pour remplir un champ (voir [`docs/CONTENT.md`](docs/CONTENT.md))
- **Apparence « Gazette » :** titres en Fraunces (police libre, licence SIL OFL, paquet `@fontsource-variable/fraunces`
  servi par le site lui-même : aucun appel à Google Fonts ni à un service externe), texte en police système
- **Contact :** `hello@morges.info` (constante `CONTACT_EMAIL` dans `src/site/config.js`), en pied de page, sur
  « Contribuer », « Qui sommes-nous » et les mentions légales ; l'adresse est écrite en entités HTML dans le code
  source pour gêner les robots collecteurs. Les contributions arrivent par e-mail : **aucun envoi public**, rien
  n'est publié sans vérification ni accord (voir [`docs/PHOTOS.md`](docs/PHOTOS.md))
- **Carte des photos :** bouton « Lieux | Photos » sur la carte ; photo ancienne et/ou actuelle par point de vue,
  comparaison avant/après, appel à la photo manquante, galerie `/photos/` — voir [`docs/PHOTO_MAP.md`](docs/PHOTO_MAP.md)
- **Référencement :** une page par lieu (`/lieux/<id>/`), données structurées schema.org, sitemap, IndexNow ;
  démarches Google / Bing dans [`docs/SEO.md`](docs/SEO.md)
- **Mesure d'audience :** Cloudflare Web Analytics, sans cookies, seulement sur le domaine en ligne, désactivable
  (Do Not Track, Global Privacy Control, bouton sur les mentions légales). Active dès que `ANALYTICS_TOKEN` est
  renseigné dans `src/site/config.js` — voir [`docs/ANALYTICS.md`](docs/ANALYTICS.md)
- **Partage :** image d'aperçu 1200 × 630 (`og:image`) générée par `npm run images` à partir de la photo d'accueil
- **Fiche d'un lieu :** elle s'ouvre en plein écran (ordinateur, tablette et téléphone), le texte dans une colonne
  de lecture ; « Retour à la carte », ×, Échap ou le bouton Retour du navigateur la referment, et la carte est
  centrée sur le lieu
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
index.html, carte/, commerces/, histoire/, vie-locale/, recits/, a-propos/, qui-sommes-nous/   une page HTML par section
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

## Déploiement : GitHub Pages + domaine chez Spaceship

Le site est publié par **GitHub Pages** (gratuit, dépôt public) à chaque modification de `main`, par le workflow
`.github/workflows/deploy.yml` (lint, tests unitaires, build, puis publication de `dist/`). Le domaine
`morges.info` reste chez **Spaceship**, qui garde aussi la messagerie `hello@morges.info`.

Réglages à faire une fois (propriétaire du dépôt et du domaine) :

1. GitHub → dépôt → **Settings → Pages** → *Build and deployment* → Source : **GitHub Actions**.
2. Après la première publication : **Custom domain** `morges.info` → *Save*, puis cocher **Enforce HTTPS** dès
   que GitHub l'autorise (certificat automatique, quelques minutes à 24 h).
3. Spaceship → DNS de `morges.info` :

   | Type | Hôte | Valeur |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `lionelbuh.github.io` |

   Supprimer d'éventuels anciens enregistrements A/AAAA/CNAME de `@` et `www` (page de parking) ; **ne pas toucher**
   aux enregistrements MX et TXT de la messagerie.
4. Recommandé : GitHub → *Settings* (du compte) → **Pages → Verified domains** → ajouter `morges.info` et créer chez
   Spaceship l'enregistrement TXT `_github-pages-challenge-lionelbuh` indiqué par GitHub (empêche un tiers
   d'utiliser le domaine sur GitHub).

Le site utilise des URL absolues (`/carte/`, `/histoire/` …) : il doit être servi à la racine du domaine, ce qui est
le cas avec un domaine personnalisé. Une adresse `utilisateur.github.io/morges-info/` nécessiterait d'adapter `base`
dans `vite.config.js`. GitHub Pages sert `404.html` pour toute adresse inconnue.

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
