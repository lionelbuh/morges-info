# Mesure d'audience — Cloudflare Web Analytics

Vérifié le 17 octobre 2026 dans la documentation de Cloudflare.

## Ce que fait le service (selon Cloudflare)

- Le script (« beacon ») **ne lit et n'écrit aucun stockage du navigateur** : ni cookies, ni localStorage,
  ni sessionStorage, ni IndexedDB ; ses données vivent en mémoire et disparaissent au rechargement
  ([RUM beacon](https://developers.cloudflare.com/speed/observatory/rum-beacon/),
  [Core Web Vitals](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/)).
- **Pas de suivi d'une personne dans le temps, pas d'empreinte** (fingerprinting) par l'IP ou le navigateur
  ([blog Cloudflare](https://blog.cloudflare.com/free-privacy-first-analytics-for-a-better-web/)).
- L'adresse IP est écartée au centre de données le plus proche et n'est pas conservée (page RUM beacon).
- Données mesurées : pages vues, visites, site de provenance, navigateur, système, type d'appareil, pays,
  temps de chargement (Core Web Vitals).
- Cloudflare, Inc. (États-Unis) est certifiée au Swiss-U.S. Data Privacy Framework
  ([Cloudflare Trust Hub](https://www.cloudflare.com/trust-hub/gdpr/)) ; la Suisse reconnaît ce cadre depuis le
  15 septembre 2024.
- Un article de 2021 ([ctrl.blog](https://www.ctrl.blog/entry/review-cloudflare-analytics/)) signalait un cookie
  posé par le script à l'époque ; la documentation actuelle l'exclut. À vérifier dans l'onglet *Application*
  des outils du navigateur après la mise en ligne.

## Consentement : notre analyse (pas un avis juridique)

- **Droit suisse (nLPD, art. 45c LTC)** : pas de consentement requis pour des statistiques sans cookies ni
  profil, traitées par un sous-traitant ; il faut **informer** (page Mentions légales) et permettre de **refuser**.
  Le guide du PFPDT sur les cookies et technologies similaires (2025) admet l'analyse de fréquentation au titre de
  l'intérêt privé prépondérant, avec possibilité d'opposition.
- Le site s'adresse au public de Morges ; pour des visiteurs de l'UE, certaines autorités interprètent l'art. 5(3)
  de la directive ePrivacy de façon large. Le risque est faible pour un outil sans stockage, mais il existe.
- **Donc pas de bandeau de cookies.** Le refus est possible de trois façons : signal *Do Not Track* ou
  *Global Privacy Control* du navigateur, bouton sur la page Mentions légales, ou bloqueur de contenu.

## Mise en place sur morges.info

Le site est hébergé sur GitHub Pages et le DNS reste chez Spaceship : **aucun changement de DNS**. On utilise
l'installation manuelle (script JS), sans passer le domaine par Cloudflare.

1. Créer un compte gratuit sur <https://dash.cloudflare.com>.
2. **Analytics & Logs → Web Analytics → Add a site** → nom d'hôte `morges.info` → *Done*.
3. **Manage site** : dans le code proposé, copier la valeur de `"token"` (une suite de lettres et de chiffres).
4. La coller dans `ANALYTICS_TOKEN` (`src/site/config.js`), puis fusionner la modification dans `main`.

Le script n'est chargé que sur `morges.info` / `www.morges.info` (jamais en local, dans les tests ou les
prévisualisations), avec `spa: false` (seuls les vrais chargements de page comptent), et pas du tout si le visiteur
a refusé. Code : `src/site/analytics.js`.
