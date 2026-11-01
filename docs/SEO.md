# Référencement (SEO)

## Ce que le site fait automatiquement

- **Pages pré-rendues** en HTML (français) : les moteurs lisent le contenu sans exécuter JavaScript.
- **Une page par lieu** : `/lieux/<id>/` (générée à partir de `src/data/places.js`, un ajout de lieu crée sa page) et
  un index `/lieux/` classé par catégorie, relié depuis le pied de page, les cartes de lieux et la carte.
- Pour chaque page : `<title>` et description uniques, adresse canonique, alternatives de langue (`hreflang`
  fr/en/de/it + `x-default`), `robots` avec grandes vignettes d'images, aperçu de partage (Open Graph, X/Twitter).
- **Données structurées** (schema.org, JSON-LD) : site et éditeur (accueil), chaque lieu avec coordonnées, adresse
  et liens Wikidata/Wikipédia cités, fil d'Ariane, événements (Vie locale), récits (Article).
- **`sitemap.xml`** (toutes les pages, date de vérification des lieux) annoncé dans **`robots.txt`**.
- **IndexNow** : à chaque publication, le workflow `deploy.yml` signale les adresses du sitemap à Bing, Yandex,
  Seznam, Naver… (clé publique dans `public/<clé>.txt`). Google lit le sitemap.
- **Assistants IA** (ChatGPT, Claude, Gemini, Perplexity…) : `robots.txt` autorise nommément leurs robots de
  recherche et d'entraînement (choix du propriétaire, 1er novembre 2026 ; liste `AI_CRAWLERS` dans
  `build/site-plugin.js`). **`llms.txt`** (format llmstxt.org) résume le site et liste ses pages principales,
  lieux, photos et récits ; il est généré à chaque build. Ces assistants cherchent via Google (Gemini), Bing
  (ChatGPT, Copilot) ou leurs propres robots : être bien indexé dans Google et Bing reste l'essentiel.
- Page 404 exclue de l'index ; site rapide (images AVIF/WebP, polices locales, carte chargée à la demande).

## À faire par le propriétaire (une fois)

1. **Google Search Console** — <https://search.google.com/search-console> → *Ajouter une propriété* →
   **Domaine** `morges.info` → copier l'enregistrement **TXT** proposé dans le DNS de Spaceship → *Valider*.
   Puis *Sitemaps* → `https://morges.info/sitemap.xml` → *Envoyer*.
   (Variante sans DNS : propriété *Préfixe d'URL* `https://morges.info/`, méthode « Balise HTML » ; donner le code
   pour `SEARCH_VERIFICATION.google` dans `src/site/config.js`.)
2. **Bing Webmaster Tools** — <https://www.bing.com/webmasters> → *Importer depuis Google Search Console*
   (le plus simple) → vérifier que le sitemap est bien listé. Bing alimente aussi DuckDuckGo, Yahoo et Ecosia.
3. **Liens entrants** (le facteur le plus important à moyen terme) : demander un lien vers morges.info aux
   partenaires naturels — Morges Région Tourisme, sociétés locales, notreHistoire.ch, groupes Facebook, musées
   cités. Chaque récit ou photo publiée est une bonne occasion de partager une adresse précise.
4. Suivre dans Search Console les pages indexées et les requêtes (« château de Morges », « piscine Morges »…).

## Limite connue

Les versions EN/DE/IT sont servies par le même fichier HTML (paramètre `?lang=`) et traduites dans le navigateur.
Google exécute JavaScript et lit les balises mises à jour, mais des versions pré-rendues par langue (`/en/…`)
seraient plus sûres. C'est une évolution possible si le trafic non francophone devient important.
