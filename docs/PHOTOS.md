# Photographies — registre et procédure

*Mis à jour le 16 octobre 2026.*

Règles : uniquement des photographies **réelles**, dont l'auteur, la source et la licence sont connus et
vérifiés sur la page d'origine. Pas d'image générée, pas d'image reprise d'un moteur de recherche sans
vérifier l'original. Le crédit est affiché sous chaque photo.

## Registre

| Photo | Auteur | Source | Licence | Statut |
| --- | --- | --- | --- | --- |
| Vue aérienne du château de Morges, du port et du lac (2016) — *photo d'accueil* | D. Jaquet – Archéodom 2016 ([www.chateau-morges.ch](https://www.chateau-morges.ch)) | [Wikimedia Commons, curid 61175456](https://commons.wikimedia.org/w/index.php?curid=61175456) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr) | **Publiée.** Choisie et fournie par l'équipe Morges.info le 16.10.2026, avec l'attribution de la page Commons (ci-dessous). Commons n'était pas accessible depuis l'environnement de développement : la licence n'y a pas été revérifiée directement. |

Attribution fournie (telle qu'indiquée sur Commons) :

> By D. Jaquet - Template:Archéodom2016 www.chateau-morges.ch, CC BY-SA 4.0,
> https://commons.wikimedia.org/w/index.php?curid=61175456

(« Template:Archéodom2016 » est un modèle de la page Commons ; sur le site, il est affiché « Archéodom 2016 ».)

Crédit affiché sous la photo : « Photo : D. Jaquet – Archéodom 2016 (www.chateau-morges.ch), CC BY-SA 4.0,
Wikimedia Commons (recadrée) », avec liens vers le site du château, la licence et la page Commons.

Obligations de la licence CC BY-SA 4.0 : nommer l'auteur, indiquer la licence (lien) et la source, signaler la
modification (« recadrée ») et diffuser le recadrage sous la même licence.

Fichiers :

- original reçu, inchangé : `assets/photos/Chateau_de_Morges_aerien_D_Jaquet_Archeodom_2016.jpg` (2000 × 1125)
- versions publiées : `public/images/hero/` — recadrage **2:1** pour ordinateur (960, 1440, 1920 px) et
  **carré** pour téléphone (480, 720, 1080 px, centré sur le château pour garder les quatre tours), en AVIF,
  WebP et JPEG ; métadonnées supprimées. Exemple : 1440 px = 93 kB en AVIF (169 kB en JPEG).
- pas de titre en surimpression : sur cette vue aérienne sans ciel, le texte couvrirait le château ou le port.

Photos écartées : « Morges château.jpg » (Pierre Bona) — non retenue par l'équipe ; « Les tours du vieux port
à Morges » (Edouard55, Flickr) — tous droits réservés, à n'utiliser qu'avec une autorisation écrite (modèle
ci-dessous).

## Changer la photo d'accueil

1. Enregistrer l'original sans le modifier dans `assets/photos/` et mettre à jour `HERO_PHOTO` dans
   `src/data/photos.js` (auteur, source, licence, attribution, texte alternatif en 4 langues).
2. Lancer `npm run images` : génère `public/images/hero/*` et `src/data/hero-manifest.json`.
3. Vérifier les recadrages ; ajuster `focusX` / `focusY` si besoin et relancer `npm run images`.

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
