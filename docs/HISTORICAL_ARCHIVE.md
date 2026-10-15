# Archives historiques — conception (phase future)

**Statut : non activé.** Aucune photographie historique n'est affichée, et l'envoi public d'images est
désactivé (`PUBLIC_UPLOADS_ENABLED = false` dans `src/data/archive.js`, vérifié par un test).

## Principes

- Uniquement des **photographies authentiques** provenant d'institutions ou de donateurs identifiés.
- **Jamais** d'images générées, retouchées pour « faire ancien » ou copiées au hasard sur Internet.
- Une image n'est publiée que si ses **droits sont clarifiés** et sa **vérification est terminée**.

## Modèle de données

Chaque lieu possède `archive.photos[]`. Un enregistrement (`ArchivePhoto`) contient :

| Champ | Contenu |
| --- | --- |
| `id`, `placeId` | identifiant stable ; lien vers le lieu |
| `title`, `caption` | textes en `fr`, `en`, `de`, `it` |
| `date` | `value` (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`) + `precision` (`day`, `month`, `year`, `decade`, `circa`) |
| `creator` | photographe / atelier, si connu |
| `source` | `institution`, `reference` (cote d'inventaire), `url` |
| `rights` | `status` (`unknown`, `requested`, `granted`, `public-domain`, `open-licence`, `refused`), `licence`, `holder`, `credit`, `evidence` (référence du document d'autorisation, conservé hors ligne) |
| `verification` | `status` (`pending`, `in-review`, `verified`, `rejected`), `verifiedBy`, `verifiedAt`, `notes` |
| `image` | `null` tant que les droits ne sont pas clarifiés **et** que la vérification n'est pas `verified` |

`validateArchivePhoto()` applique ces règles ; `publishablePhotos()` ne renvoie que les images publiables.

## Étapes suggérées pour la phase 2

1. Contacter les fonds pertinents (archives communales, Archives cantonales vaudoises, musées locaux) et
   documenter les conditions de réutilisation.
2. Saisir les métadonnées avec `image: null` et `verification.status: 'pending'`.
3. Vérification éditoriale (date, lieu, source), puis clarification des droits.
4. Ajouter l'affichage dans le panneau d'information (galerie avec crédit et date sous chaque image).
5. Un éventuel formulaire de contribution du public nécessitera modération, stockage, conditions
   d'utilisation et protection des données : **hors périmètre de la version actuelle.**
