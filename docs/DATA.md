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

## État actuel (version 0.1)

Les positions ont été vérifiées le 15 octobre 2026 par recherche web (Wikipedia, Wikidata, Mapcarta/OSM,
annuaires nautiques, etc.). L'accès direct à OpenStreetMap / Nominatim n'était pas disponible pendant le
développement, donc **un contrôle visuel sur OpenStreetMap est recommandé avant publication**.

| Lieu | Statut | À faire |
| --- | --- | --- |
| Château de Morges | cross-checked | — |
| Temple de Morges | cross-checked | — |
| Hôtel de Ville | cross-checked | — |
| Grand-Rue | cross-checked | point représentatif de la rue |
| **Place du Marché** | **unverified** | **trouver la position exacte** (OSM / Ville de Morges), puis ajouter les coordonnées |
| Parc de l'Indépendance | single-source | confirmer sur OSM |
| Quai Lochmann | single-source | confirmer sur OSM (le quai est long ; choisir un point représentatif) |
| Port de Morges | cross-checked | — |
| Gare de Morges | cross-checked | — |
| Théâtre de Beausobre | cross-checked | — |

Les traductions EN/DE/IT des descriptions ont été rédigées à partir du texte français. Une relecture par
des locuteurs natifs est recommandée.
