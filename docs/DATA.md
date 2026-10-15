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
modifiée lors de la revérification, faute de source plus fiable que celles déjà citées. Le 15.10.2026,
l'équipe Morges.info a contrôlé deux positions sur la carte et indiqué l'emplacement de la place du Marché.

| Lieu | Statut | Constat / à faire |
| --- | --- | --- |
| Château de Morges | cross-checked | Wikipedia et Structurae concordent (~30 m) |
| Temple de Morges | cross-checked | Mapcarta (OSM way 102523526) et AroundUs concordent |
| Hôtel de Ville | cross-checked | Wikidata et Wikipédia concordent |
| Grand-Rue | cross-checked | point représentatif d'une rue longue |
| Place du Marché | estimated | emplacement indiqué par l'équipe Morges.info : intersection de la Grand-Rue et de la place de l'Hôtel-de-Ville. Point calculé entre l'hôtel de ville (Place de l'Hôtel-de-Ville 3 / Grand-Rue 81) et le n° 68 de la Grand-Rue, en face : 46.50866, 6.49786 (± 25 m). **À confirmer sur la prévisualisation** |
| Parc de l'Indépendance | confirmed | position contrôlée sur la carte par l'équipe Morges.info (15.10.2026) |
| Quai Lochmann | confirmed | position contrôlée sur la carte par l'équipe Morges.info (15.10.2026) ; point représentatif d'un quai long |
| Port de Morges | cross-checked | trois annuaires nautiques concordent |
| Gare de Morges | cross-checked | Wikipedia et Structurae concordent |
| Théâtre de Beausobre | cross-checked | Mapcarta (OSM node 6444731534) et Wikipédia concordent |

Les traductions EN/DE/IT des descriptions ont été rédigées à partir du texte français. Une relecture par
des locuteurs natifs est recommandée.
