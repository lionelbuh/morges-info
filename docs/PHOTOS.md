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

## Photo d'accueil (photo du jour)

La grande photo de l'accueil change chaque jour : les photos de `HERO_PHOTOS` (`src/data/photos.js`)
passent à tour de rôle. Le site est reconstruit chaque nuit (`deploy.yml`, tâche planifiée), ce qui
change la photo. Le navigateur garde celle choisie par la construction. Seules les photos dont la
licence permet de les recadrer y figurent : jamais de licence « ND » (refusée par les tests).

Ajouter une photo :
1. Original dans `assets/photos/` (ou une photo de la carte, `public/images/photos/`) ; ajouter une
   entrée à `HERO_PHOTOS` (auteur, source, licence, attribution, texte alternatif en 4 langues,
   recadrages ; `viewpointId` ajoute le lien vers la carte des photos).
2. Lancer `npm run images` : génère `public/images/hero/*` et `src/data/hero-manifest.json`.
3. Vérifier les recadrages ; ajuster `focusX` / `focusY` si besoin et relancer `npm run images`.

## Images de partage (réseaux sociaux)

Chaque page photo, la page Photos et la page Commerces se partagent avec leur propre photo, entière
(jamais recadrée), en JPEG. Les autres pages, et l'accueil, gardent le château vu du ciel (version
`og` de `HERO_PHOTO`). Après avoir ajouté ou changé une photo de la carte ou d'un commerce :
`npm run share` (génère `public/images/share/*` et `src/data/share-manifest.json`).

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

## Photos envoyées par les lecteurs (page « Contribuer »)

Les lecteurs écrivent à `hello@morges.info`, photos en pièce jointe. Le courriel prérempli leur demande : l'auteur,
la date (même approximative), le lieu, s'ils possèdent la photo ou ont l'accord de son propriétaire, le crédit
souhaité et leur accord pour la publication.

Avant de publier une photo reçue :

1. **Droits :** l'expéditeur est l'auteur, ou il a l'accord écrit de l'auteur ou du propriétaire. Une photo publiée
   dans un groupe Facebook ou trouvée sur Internet n'est **pas** libre pour autant. En Suisse, une photographie
   ordinaire est protégée 50 ans après sa prise, une œuvre photographique 70 ans après la mort de son auteur ; une
   carte postale ancienne a souvent un éditeur ou un photographe identifiable.
2. **Accord de publication :** l'accord écrit (le courriel suffit) est conservé avec la photo.
3. **Métadonnées :** date, lieu, auteur, crédit et source sont remplis dans `src/data/archive.js`, comme pour toute
   archive (voir `docs/HISTORICAL_ARCHIVE.md`).
4. **Retrait :** toute demande de retrait ou de correction de crédit est traitée sans discussion.
