# La roue de la servitude

Application web ludique et installable (PWA) qui présente les taxes et prélèvements obligatoires français sous la forme d'une roue à lancer. L'objectif est de rendre consultable une liste d'entrées fiscales, avec un chargement rapide au démarrage, des détails affichés au résultat, une utilisation hors ligne après la première visite et des fonctions de partage/retour hébergées côté Netlify.

## Structure des fichiers importants

- `index.html` : page principale de l'application. Elle déclare les métadonnées PWA/sociales, charge les feuilles de style, les scripts de la roue et le service worker, puis contient l'interface utilisateur.
- `js/entries.js` : module de chargement des données. Il récupère d'abord `data/entries-light.json` pour afficher rapidement la roue, puis charge `data/entries-full.json` pour les détails. Il utilise IndexedDB comme cache local.
- `js/audio.js` : module audio offline-first. Il prépare les sons de rotation/résultat, les met en cache IndexedDB et respecte le réglage utilisateur d'activation du son.
- `js/menu.js` : module de gestion du menu latéral, des panneaux de navigation, de l'historique, des paramètres et des interactions associées.
- `service-worker.js` : service worker PWA. Il précache les ressources critiques, applique une stratégie Network First avec fallback cache et ignore les fonctions Netlify pour éviter de mettre en cache les appels dynamiques.
- `netlify/functions/` : fonctions serverless Netlify.
  - `shareImage.js` téléverse une image sur ImgBB et renvoie une URL de partage dynamique servie par Netlify.
  - `sharePage.js` génère à la volée la page HTML Open Graph/Twitter Card à partir des paramètres fournis par le flux de partage.
  - `sendFeedback.js` crée une discussion GitHub à partir des retours envoyés par les utilisateurs.

## Prérequis de déploiement Netlify

1. Un site Netlify relié au dépôt Git du projet.
2. Node.js 20 côté build/runtime Netlify. Le fichier `netlify.toml` force `NODE_VERSION = "20"` pour disposer de `fetch` natif dans les fonctions.
3. Le dossier des fonctions Netlify doit rester configuré sur `netlify/functions`.
4. Les en-têtes CORS pour `/.netlify/functions/*` doivent être conservés afin que l'application puisse appeler les fonctions depuis le domaine public.
5. Les variables d'environnement listées ci-dessous doivent être configurées dans Netlify avant de tester le partage et les retours utilisateur.
6. Les pages de partage ne nécessitent plus de droit d'écriture GitHub : elles sont servies par une route dynamique Netlify (`/.netlify/functions/sharePage`).

## Variables d'environnement nécessaires

- `GITHUB_TOKEN` : token GitHub utilisé par `sendFeedback.js` pour créer une discussion GitHub via GraphQL. Il n'est plus utilisé par le partage d'image.
- `IMGBB_API_KEY` : clé API ImgBB utilisée par `shareImage.js` pour héberger l'image générée avant de créer l'URL de partage dynamique.

## Mettre à jour les données

Les données affichées par la roue sont séparées en deux fichiers :

- `data/entries-light.json` : version légère utilisée au démarrage. Chaque entrée contient au minimum un `id` et un nom court `nom`.
- `data/entries-full.json` : version complète utilisée pour l'overlay de résultat. Elle contient une clé `version` et une liste `entries` avec les champs `id`, `nom`, `nom_complet`, `recette` et `annee`.

Procédure recommandée :

1. Modifier ou ajouter les entrées dans `data/entries-full.json`.
2. Pour chaque entrée complète, vérifier que l'`id` est stable, unique et identique à celui qui sera utilisé dans le fichier léger.
3. Reporter les mêmes entrées dans `data/entries-light.json` avec uniquement les informations nécessaires au chargement rapide (`id` et `nom` court).
4. Valider que les deux fichiers JSON sont syntaxiquement corrects, par exemple avec :

   ```bash
   node -e "JSON.parse(require('fs').readFileSync('data/entries-light.json','utf8')); JSON.parse(require('fs').readFileSync('data/entries-full.json','utf8')); console.log('JSON OK')"
   ```

5. Vérifier que chaque `id` présent dans `data/entries-light.json` existe aussi dans `data/entries-full.json`.
6. Tester l'application localement ou via un deploy preview Netlify.
7. Si le service worker a déjà été publié, incrémenter `CACHE_VERSION` dans `service-worker.js` lorsque la mise à jour doit invalider les anciens caches PWA.

> Note : `scripts/convert-entries.js` peut servir de base d'automatisation si un fichier source compatible est maintenu, mais la source actuelle de vérité pour l'application est le duo `data/entries-light.json` / `data/entries-full.json`.

## Stratégie de stockage des partages

Les fichiers `shares/share-*.html` sont des artefacts générés par les utilisateurs. Ils ne doivent pas rester dans Git : ils grossissent l'historique, déclenchent des écritures concurrentes sur la branche principale et lient une action utilisateur à un redéploiement du site. Les anciens exemples versionnés ont donc été supprimés et `.gitignore` exclut désormais `shares/share-*.html`.

Le flux actuel évite la création de commits GitHub :

1. `netlify/functions/shareImage.js` reçoit l'image encodée et le texte de partage.
2. L'image est téléversée sur ImgBB, qui reste le stockage objet de l'image finale.
3. La fonction renvoie une URL `/.netlify/functions/sharePage?...` contenant l'URL ImgBB et les métadonnées courtes nécessaires aux aperçus sociaux.
4. `netlify/functions/sharePage.js` génère dynamiquement le HTML Open Graph/Twitter Card, puis redirige le visiteur vers la page d'accueil.

Cette approche correspond à une route dynamique Netlify sans persistance HTML côté dépôt. Elle évite donc toute politique de nettoyage GitHub pour les nouveaux partages. Si un stockage persistant de métadonnées devient nécessaire, Netlify Blobs serait le choix privilégié avant GitHub Gist, une base légère ou des commits GitHub, car il reste proche du runtime Netlify et évite de modifier le dépôt à chaque partage.

## Limites connues

- Pages de partage dynamiques : l'URL de partage contient les métadonnées courtes de l'aperçu et l'URL ImgBB. Les images restent dépendantes des quotas/API et de la disponibilité d'ImgBB.
- Cache service worker : malgré une stratégie Network First, les utilisateurs peuvent conserver des ressources anciennes si le service worker, le cache navigateur ou IndexedDB n'ont pas encore été rafraîchis. Incrémenter `CACHE_VERSION` et tester les scénarios offline/online après chaque changement important.
- Données fiscales à vérifier : les montants de recette, dates de création et intitulés fiscaux doivent être contrôlés avant publication. Le projet ne garantit pas à lui seul l'exactitude ou l'actualité des données fiscales.
