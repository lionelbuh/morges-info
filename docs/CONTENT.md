# Contenus de Morges.info — modèle et règles éditoriales

*Version du 15 octobre 2026.*

Positionnement : **« Morges.info : la vie locale, les bonnes adresses et la mémoire de Morges. »**
Périmètre : la **commune de Morges uniquement**. Français d'abord ; anglais, allemand et italien quand une
traduction soignée existe.

## Où se trouvent les contenus

| Contenu | Fichier | Affiché sur |
| --- | --- | --- |
| Lieux de la carte | `src/data/places.js` | `/carte/`, accueil |
| Commerces indépendants | `src/data/businesses.js` (vide) | `/commerces/`, accueil (bloc masqué tant qu'il est vide) |
| Événements | `src/data/events.js` | `/vie-locale/`, accueil (événements à venir uniquement) |
| Infos pratiques, sites officiels | `src/data/practical.js` | `/vie-locale/`, accueil |
| Récits | `src/data/stories.js` | `/recits/`, accueil (récit à la une) |
| Repères historiques, « hier et aujourd'hui » | `src/data/history.js` | `/histoire/` |
| Photos d'archives (phase future) | `src/data/archive.js` | — |
| Textes d'interface et des pages | `src/i18n/locales/*.js` | partout |

Champs communs et validateurs : `src/data/schema.js`. Chaque type de contenu a son validateur, appliqué par les
tests (`npm test`) : une donnée incomplète fait échouer les tests.

## Règles

1. **Ne rien inventer.** Un champ inconnu reste `null` ou vide ; il n'est pas affiché.
2. **Sources.** Chaque fait cite au moins une source (`{ label, url }`). Une indication de l'équipe
   Morges.info (visite sur place, vérification sur la carte) est une source sans URL dont le libellé contient
   « Morges.info » et la date.
3. **Date de vérification** (`lastVerified`, `AAAA-MM-JJ`) pour tout ce qui peut changer : lieux, horaires,
   événements, infos pratiques, commerces.
4. **Horaires** : publiés seulement s'ils ont été vérifiés, avec leurs propres sources et leur date
   (`openingHours: { text, sources, lastVerified }`).
5. **Photos actuelles** : `{ src, alt: { fr, … }, credit, licence, sourceUrl?, date? }` — sans auteur ni
   licence, pas de publication. Photos historiques : modèle plus strict de `archive.js` (droits, vérification).
6. **Langues** : `fr` obligatoire. Une langue manquante affiche le texte français avec la mention « Ce contenu
   est pour l'instant disponible uniquement en français ».
7. **Pas d'aspiration de sites** ni de reprise de textes tiers ; pas de flux automatique d'actualités.
8. **Pas de politique** : Morges.info n'est lié ni à la Ville ni à un parti.

## Ajouter un commerce

Après vérification (idéalement sur place), ajouter une entrée dans `BUSINESSES` :

```js
{
  id: 'nom-du-commerce',
  name: 'Nom officiel',
  category: 'shop',                 // food | cafe | shop | crafts | services
  address: 'Rue …, 1110 Morges',     // obligatoirement dans 1110 Morges
  coordinates: { lat: 46.5…, lng: 6.4… },
  description: { fr: 'Deux phrases écrites par la rédaction.' },
  website: 'https://…',             // ou null
  openingHours: null,               // ou { text: { fr }, sources, lastVerified }
  photos: [],
  sources: [{ label: 'Visite sur place par l’équipe Morges.info (2026-11-02)' }],
  lastVerified: '2026-11-02',
  editorial: { selected: true },    // choix de la rédaction — ne s'achète pas
  commercial: { status: 'none' },
}
```

Le bloc « Commerces indépendants » de l'accueil apparaît automatiquement dès la première entrée.

## Préparation à une monétisation future (rien n'est activé)

- Le statut commercial vit dans un champ séparé : `commercial.status` = `none` | `enhanced` | `sponsored`.
- `COMMERCIAL_LISTINGS_ENABLED = false` (`src/data/schema.js`) : tant que ce drapeau est faux, les tests
  refusent toute valeur autre que `none`.
- Le choix éditorial (`editorial.selected`) est indépendant du statut commercial ; une entrée `sponsored`
  n'apparaît jamais dans la sélection éditoriale (`editorialSelection()`).
- Le composant d'affichage ajoute toujours l'étiquette « Contenu sponsorisé » à une entrée `sponsored`
  (testé).
- Aucun paiement, abonnement ni publicité n'est implémenté.

## Événements

Chaque événement : titre, dates de début et de fin, lieu (`placeId`), horaires si publiés par la source,
sources et date de vérification. Les événements terminés disparaissent automatiquement (date du jour à
Morges). Aucun événement n'est ajouté sans source officielle ou fiable.

## Pages et référencement

- URL propres en français : `/`, `/carte/`, `/commerces/`, `/histoire/`, `/vie-locale/`, `/recits/`,
  `/a-propos/`. Langue choisie : paramètre `?lang=en|de|it` (aucun pour le français), mémorisée par le
  navigateur.
- Le contenu français est **pré-rendu** dans le HTML au moment du build (`build/site-plugin.js`) : lisible par
  les moteurs de recherche et sans JavaScript. Le navigateur re-rend la page dans la langue choisie.
- Chaque page : titre et description propres, lien canonique, alternatives `hreflang` (fr, en, de, it,
  x-default), balises Open Graph. `sitemap.xml` et `robots.txt` sont générés au build.
- L'adresse du site (`SITE_URL`, `src/site/config.js`) vaut `https://morges.info`.
