# Photographies — registre et procédure

*Mis à jour le 16 octobre 2026.*

Règles : uniquement des photographies **réelles**, dont l'auteur, la source et la licence sont connus et
vérifiés sur la page d'origine. Pas d'image générée, pas d'image reprise d'un moteur de recherche sans
vérifier l'original. Le crédit est affiché sous chaque photo.

## Registre

| Photo | Auteur | Source | Licence | Statut |
| --- | --- | --- | --- | --- |
| Château de Morges, côté nord-est (avril 2009) — *photo d'accueil* | Pierre Bona | [Wikimedia Commons — Morges château.jpg](https://commons.wikimedia.org/wiki/File:Morges_ch%C3%A2teau.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.fr) (selon la page Commons, avec d'autres licences libres) | **Choisie par l'équipe (16.10.2026). Fichier à télécharger** ; licence à reconfirmer sur la page au moment du téléchargement (`licenceVerified` dans `src/data/photos.js`) |
| Les tours du vieux port à Morges (21 juin 2020) | Edouard55 (Flickr) | [Flickr](https://www.flickr.com/photos/19239093@N03/50043489063) | **Tous droits réservés** | **Non utilisable sans autorisation écrite** de l'auteur — voir le modèle de demande ci-dessous |

Obligations de la licence CC BY-SA 3.0 pour la photo d'accueil : nommer l'auteur, indiquer la licence (lien)
et la source, signaler la modification (« recadrée ») et diffuser le recadrage sous la même licence. Le
composant `heroPhoto` (`src/site/components.js`) affiche ce crédit sous l'image.

## Mettre en place la photo d'accueil

1. Télécharger le fichier **original** depuis la page Commons (« Original file ») et l'enregistrer sans le
   modifier sous `assets/photos/Morges_chateau_Pierre_Bona_2009.jpg`.
2. Vérifier sur la page Commons l'auteur et la licence, puis renseigner `licenceVerified: 'AAAA-MM-JJ'` dans
   `src/data/photos.js`.
3. Lancer `npm run images` : génère `public/images/hero/*` (AVIF, WebP, JPEG ; recadrage large 21:9 pour
   ordinateur et 4:5 pour téléphone) et `src/data/hero-manifest.json`. Les métadonnées (EXIF, GPS) sont
   supprimées.
4. Regarder le résultat (`npm run build && npm run preview`). Si le château ou ses tours sont coupés, ajuster
   `focusX` / `focusY` des recadrages dans `src/data/photos.js` et relancer `npm run images`.
5. Relire le texte alternatif (4 langues) au vu de la photo.
6. Titre en surimpression (`overlayTitle`) : seulement s'il reste lisible sans masquer le château.

Tant que `hero-manifest.json` est vide, la page d'accueil garde son introduction sans photo.

## Modèle de demande d'autorisation (Flickr, message à Edouard55)

> Bonjour,
>
> Je prépare Morges.info, un site indépendant et non commercial consacré à la commune de Morges. Votre
> photographie « Les tours du vieux port à Morges » (21 juin 2020,
> https://www.flickr.com/photos/19239093@N03/50043489063) illustre parfaitement le vieux port.
>
> Accepteriez-vous que nous la publiions sur le site, avec la mention « Photo : Edouard55 » et un lien vers
> votre page Flickr ? Nous la recadrerions pour l'affichage sur ordinateur et sur téléphone, sans autre
> modification. Si vous préférez, vous pouvez aussi la placer sous une licence Creative Commons sur Flickr.
>
> Merci beaucoup et meilleures salutations,
> [nom], Morges.info

Conserver la réponse écrite (capture ou courriel) et la référencer dans ce registre avant toute publication.
