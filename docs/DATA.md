# Données des lieux — règles et état de vérification

Fichier : `src/data/places.js`.

## Règles

1. **Ne jamais inventer** de coordonnées, de dates ou de faits.
2. Chaque position cite ses sources dans `geo.sources` ; chaque fait de la description est couvert par
   `factSources`.
3. Si une position ne peut pas être vérifiée : `coordinates: null` et `geo.status: 'unverified'`.
   Le lieu reste dans la liste, avec un avertissement, mais n'apparaît pas sur la carte.
4. Les textes `name`, `location` et `description` doivent exister en `fr`, `en`, `de` et `it`
   (contrôlé par `tests/unit/places.test.js`).
5. Les coordonnées doivent se trouver dans le périmètre de Morges (contrôlé par les tests).

## Ajouter un lieu

1. Trouver le lieu sur <https://www.openstreetmap.org> et, si possible, dans une deuxième source
   (Wikidata, inventaire PBC/KGS, géoportail <https://map.geo.admin.ch>).
2. Ajouter un objet dans `PLACES` en suivant les exemples existants (garder `archive: { photos: [] }`).
3. Si besoin, ajouter une catégorie dans `src/data/categories.js` **et** son libellé dans les quatre fichiers
   `src/i18n/locales/*.js`.
4. Lancer `npm run check` et `npm run test:e2e` (les tests e2e comptent les marqueurs : mettre à jour les
   nombres attendus).

## État actuel (revérifié le 15 octobre 2026)

Les positions ont été vérifiées par recherche web (Wikipedia, Wikidata, Mapcarta/OSM, annuaires nautiques,
annuaires de rues, etc.). **L'accès direct à OpenStreetMap, Nominatim, Overpass, Wikidata et au géoportail
fédéral était bloqué dans l'environnement de développement** : un contrôle visuel des marqueurs sur la carte
réelle est donc nécessaire avant publication (prévisualisation, voir README). Aucune coordonnée n'a été
modifiée lors de la revérification, faute de source plus fiable que celles déjà citées.

| Lieu | Statut | Constat / à faire |
| --- | --- | --- |
| Château de Morges | cross-checked | Wikipedia et Structurae concordent (~30 m) |
| Temple de Morges | cross-checked | Mapcarta (OSM way 102523526) et AroundUs concordent |
| Hôtel de Ville | cross-checked | Wikidata et Wikipédia concordent |
| Grand-Rue | cross-checked | point représentatif d'une rue longue |
| **Place du Marché** | **unverified** | aucune source de position fiable ; aucun annuaire de rues actuel ne liste une « place du Marché » à Morges ; le DHS la mentionne comme place de marché historique ; le marché actuel se tient sur la Grand-Rue. **À localiser** (OSM / Ville de Morges) — peut-être une place connue aujourd'hui sous un autre nom |
| Parc de l'Indépendance | single-source | une seconde fiche web (éditeur non identifiable) donne un point à ~40 m ; à confirmer sur OSM |
| Quai Lochmann | single-source | quai long ; point représentatif ; une autre fiche sur le même quai se trouve ~300 m au nord-est ; choisir un point central sur OSM |
| Port de Morges | cross-checked | trois annuaires nautiques concordent |
| Gare de Morges | cross-checked | Wikipedia et Structurae concordent |
| Théâtre de Beausobre | cross-checked | Mapcarta (OSM node 6444731534) et Wikipédia concordent |

Les traductions EN/DE/IT des descriptions ont été rédigées à partir du texte français. Une relecture par
des locuteurs natifs est recommandée.
