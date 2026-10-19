# Carte des photos — hier et aujourd'hui

Sur la page Carte, le bouton **Lieux | Photos** affiche soit les lieux, soit les **points de vue** : l'endroit d'où
une photo a été prise. Chaque point de vue peut avoir :

| Photos disponibles | Ce que voit le visiteur |
| --- | --- |
| ancienne + actuelle | une **comparaison avant / après** : on fait glisser le curseur sur la photo |
| ancienne seule | la photo et l'encadré **« Photo d'aujourd'hui recherchée »** avec un e-mail prérempli |
| actuelle seule | la photo et l'encadré **« Photo ancienne recherchée »** |

Sur la carte, les points rouges ont les deux photos, les points noirs une seule. Chaque point de vue a aussi sa page
(`/photos/<id>/`) et figure dans la galerie `/photos/`, tant qu'au moins une photo est publiable.

Quand un lecteur envoie la photo manquante, l'objet de l'e-mail contient l'identifiant du point de vue
(par ex. `[vue-grand-rue-est]`) : il suffit de remplir `now` (ou `then`) de ce point de vue.

## Envoyer des photos (propriétaire du site)

1. Remplir le modèle [`photos-modele.csv`](photos-modele.csv) (s'ouvre dans Excel, Numbers ou LibreOffice) :
   une ligne par photo, le même titre et les mêmes coordonnées pour la photo ancienne et la photo actuelle d'un
   même point de vue.
2. Coordonnées : l'endroit **où se tenait le photographe**. Sur Google Maps, clic droit à cet endroit → copier les
   chiffres affichés (latitude, longitude). À défaut, une adresse précise suffit.
3. Envoyer le tableau et les fichiers originaux (la meilleure qualité disponible).

## Ajouter les photos (technique)

1. Originaux dans `assets/photos/map/` (non versionnés), puis `npm run photos` : copies optimisées en WebP
   (1600 px, sans métadonnées GPS) dans `public/images/photos/`, et la valeur `image` à reprendre.
2. Ajouter le point de vue dans `src/data/viewpoints.js` : `then` / `now` suivent le modèle d'archive
   (`src/data/archive.js`) — date et précision, auteur, source, droits, vérification.
3. Une image n'est publiée que si `rights.status` est `granted`, `public-domain` ou `open-licence` **et**
   `verification.status` vaut `verified`. Sinon le point de vue reste caché.
4. `npm run check` et `npm run test:e2e`, puis pull request.

## Règles

- Uniquement des photos **authentiques**, avec l'accord de leur auteur ou propriétaire (voir `docs/PHOTOS.md`).
  Jamais d'image générée ni copiée au hasard sur Internet.
- Le crédit demandé par la personne est affiché sous chaque photo.
- Un retrait ou une correction de crédit est fait sans discussion.

## Évolutions prévues quand les photos seront nombreuses

- Regroupement des points proches en bulles numérotées (au-delà d'une cinquantaine de points).
- Filtre par période (avant 1900, 1900–1950, 1950–2000, aujourd'hui).
