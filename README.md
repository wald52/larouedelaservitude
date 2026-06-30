# La roue de la servitude

Application web ludique et installable (PWA) qui présente les taxes et prélèvements obligatoires français sous la forme d'une roue à lancer. L'objectif est de rendre consultable une liste d'entrées fiscales, avec un chargement rapide au démarrage, des détails affichés au résultat, une utilisation hors ligne après la première visite et des fonctions de partage/retour hébergées côté Netlify.

## Structure des fichiers importants

- `index.html` : page principale de l'application. Elle déclare les métadonnées PWA/sociales, charge les feuilles de style, les scripts de la roue et le service worker, puis contient l'interface utilisateur.
- `js/entries.js` : module de chargement des données. Il récupère d'abord `data/entries-light.json` pour afficher rapidement la roue, puis charge `data/entries-full.json` pour les détails. Il utilise IndexedDB comme cache local.
- `js/audio.js` : module audio offline-first. Il prépare les sons de rotation/résultat, les met en cache IndexedDB et respecte le réglage utilisateur d'activation du son.
- `js/menu.js` : module de gestion du menu latéral, des panneaux de navigation, de l'historique, des paramètres et des interactions associées.
- `service-worker.js` : service worker PWA. Il précache les ressources critiques, applique une stratégie Network First avec fallback cache et ignore les fonctions Netlify pour éviter de mettre en cache les appels dynamiques.
- `netlify/functions/` : fonctions serverless Netlify.
  - `shareImage.js` téléverse une image sur ImgBB, génère une page de partage dans `shares/` et la commit via l'API GitHub.
  - `sendFeedback.js` crée une discussion GitHub à partir des retours envoyés par les utilisateurs.

## Prérequis de déploiement Netlify

1. Un site Netlify relié au dépôt Git du projet.
2. Node.js 20 côté build/runtime Netlify. Le fichier `netlify.toml` force `NODE_VERSION = "20"` pour disposer de `fetch` natif dans les fonctions.
3. Le dossier des fonctions Netlify doit rester configuré sur `netlify/functions`.
4. Les en-têtes CORS pour `/.netlify/functions/*` doivent être conservés afin que l'application puisse appeler les fonctions depuis le domaine public.
5. Les variables d'environnement listées ci-dessous doivent être configurées dans Netlify avant de tester le partage et les retours utilisateur.
6. Pour les pages de partage, le token GitHub utilisé doit avoir les droits nécessaires pour écrire sur la branche cible configurée dans `netlify/functions/shareImage.js`.

## Variables d'environnement nécessaires

- `GITHUB_TOKEN` : token GitHub utilisé par les fonctions Netlify.
  - Dans `shareImage.js`, il sert à créer un commit ajoutant une page HTML dans `shares/`.
  - Dans `sendFeedback.js`, il sert à créer une discussion GitHub via GraphQL.
- `IMGBB_API_KEY` : clé API ImgBB utilisée par `shareImage.js` pour héberger l'image générée avant de créer la page de partage.

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

## Limites connues

- Pages de partage générées : chaque partage peut créer une page HTML statique dans `shares/` via un commit GitHub. Cela peut augmenter le nombre de fichiers générés et dépend des quotas/API GitHub et ImgBB.
- Cache service worker : malgré une stratégie Network First, les utilisateurs peuvent conserver des ressources anciennes si le service worker, le cache navigateur ou IndexedDB n'ont pas encore été rafraîchis. Incrémenter `CACHE_VERSION` et tester les scénarios offline/online après chaque changement important.
- Données fiscales à vérifier : les montants de recette, dates de création et intitulés fiscaux doivent être contrôlés avant publication. Le projet ne garantit pas à lui seul l'exactitude ou l'actualité des données fiscales.
