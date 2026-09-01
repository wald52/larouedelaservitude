# La roue de la servitude

Application web statique et installable qui présente 371 taxes et prélèvements obligatoires français sous la forme d'une roue à lancer. La même page propose quatre vues : **Accueil**, **Historique**, **Données** et **Réglages**.

Le front-end est servi par GitHub Pages. Deux fonctions facultatives — partage d'image et retour utilisateur — sont exécutées sur Netlify.

## Architecture

Le projet n'utilise ni framework, ni transpilation, ni bundler pour le front-end. `index.html` est servi tel quel et charge des modules ES natifs.

| Élément | Rôle |
| --- | --- |
| `index.html` | Coquille unique de l'application, métadonnées PWA et interface des vues Accueil/Données |
| `js/app.js` | Roue, animation, résultat, partage, formulaire de retour et initialisation générale |
| `js/menu.js` | Barre d'onglets, vues Historique/Réglages et persistance des réglages |
| `js/entries.js` | Chargement léger puis complet des données, avec cache IndexedDB |
| `js/data-explorer.js` | Filtres, tris, statistiques, graphiques et exports de la vue Données |
| `service-worker.js` | Instantané hors ligne et stratégie de mise à jour de la PWA |
| `netlify/functions/*.mjs` | Fonctions modernes Netlify pour le partage et les retours |
| `scripts/` | Validation des imports/données et estampillage des assets |
| `tests/` | Tests Node des statistiques, des données, du précache et des fonctions |

## Développement local

Prérequis : Node.js 20 ou supérieur.

```bash
npm ci
npm run ci
python3 -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`. Ne pas ouvrir directement `index.html` avec `file://` : les modules ES, `fetch` et le service worker exigent HTTP.

Commandes utiles :

```bash
npm run check        # imports, données, précache et estampillage
npm run lint         # ESLint
npm run format       # contrôle Prettier
npm test             # tests Node
npm run stamp        # recalcule les hachages d'assets et le précache
npm run ci           # validations principales du dépôt
```

## Mise à jour du front-end

Les scripts et feuilles de style portent `?v=<hachage>` dans leurs URL. Le script `scripts/stamp-assets.mjs` suit le graphe d'imports, recalcule ces hachages et régénère la génération du service worker.

Après toute modification d'un fichier JavaScript ou CSS utilisé par l'application :

```bash
npm run stamp
npm run ci
```

Il faut committer tous les fichiers réécrits. Il n'existe plus de numéro `CACHE_VERSION` à incrémenter manuellement.

## Données

- `data/entries-light.json` est chargé au démarrage et ne contient que ce qui est nécessaire à la roue.
- `data/entries-full.json` fournit les intitulés complets, recettes, années et valeurs numériques.
- Les deux fichiers doivent contenir exactement les mêmes identifiants et la même `version`.

Le jeu contient des champs inconnus. Une recette ou une année `null` signifie « non renseignée dans cette publication », pas nécessairement « inexistante ». Les statistiques de recettes portent uniquement sur les montants connus.

La provenance historique n'est pas encore documentée entrée par entrée. Les champs attendus pour la reprise documentaire et la procédure de modification sont décrits dans [`data/README.md`](data/README.md).

## Déploiement GitHub Pages

GitHub Pages sert le front-end statique depuis la branche configurée dans le dépôt. Le site public canonique est actuellement :

```text
https://wald52.github.io/larouedelaservitude/
```

Le service worker est enregistré relativement à ce chemin. Les URL de fichiers du front-end doivent donc rester relatives.

## Déploiement Netlify

Relier le même dépôt à un site Netlify. `netlify.toml` configure :

- le dossier `netlify/functions` ;
- Node.js 20 ;
- le bundler `esbuild` ;
- l'adresse publique canonique `PUBLIC_SITE_URL` ;
- les politiques de cache des ressources statiques.

Les fonctions exposent deux routes pour conserver la compatibilité :

| Fonction | Route historique | Route explicite |
| --- | --- | --- |
| Téléversement d'une image | `/.netlify/functions/shareImage` | `/api/share-image` |
| Création d'un retour | `/.netlify/functions/sendFeedback` | `/api/feedback` |
| Page sociale dynamique | `/.netlify/functions/sharePage` | `/share` |

Le front-end actuel utilise encore les routes historiques. Les deux routes d'une fonction exécutent le même code et la même limitation de débit.

### Variables d'environnement

Secrets, à définir dans Netlify avec la portée **Functions** :

- `IMGBB_API_KEY` : téléversement de l'image sociale ;
- `GITHUB_TOKEN` : création d'une Discussion GitHub.

Le token GitHub doit être limité à ce dépôt et aux permissions strictement nécessaires.

Configuration non secrète :

- `PUBLIC_SITE_URL` : adresse vers laquelle la page sociale redirige ;
- `GITHUB_REPOSITORY_ID` : surcharge éventuelle de l'identifiant GraphQL du dépôt ;
- `GITHUB_DISCUSSION_INFO_CATEGORY_ID` : catégorie des compléments ;
- `GITHUB_DISCUSSION_ERROR_CATEGORY_ID` : catégorie des erreurs.

Les trois identifiants GitHub ont actuellement une valeur de repli dans le code. Il faut les mettre à jour si le dépôt ou ses catégories de Discussions sont recréés.

## Sécurité des fonctions

Les endpoints publics sont protégés par plusieurs couches :

- limitation native Netlify par IP et domaine ;
- origine obligatoire et comparée à une allow-list exacte pour les POST navigateur ;
- `Content-Type` JSON obligatoire ;
- taille maximale de chaque corps et de chaque champ ;
- validation de la signature binaire des images PNG, JPEG et WebP ;
- hôtes ImgBB autorisés explicitement ;
- délais maximum pour ImgBB et GitHub ;
- neutralisation des mentions dans les Discussions ;
- en-têtes CSP, anti-frame et `noindex` sur les pages sociales.

CORS ne constitue pas une authentification : un client serveur peut forger un en-tête `Origin`. La limitation côté plateforme et la surveillance des quotas restent indispensables. Voir [`SECURITY.md`](SECURITY.md).

### Limites appliquées

- partage d'image : 5 requêtes par minute, agrégées par IP et domaine ;
- retour utilisateur : 2 requêtes sur 180 secondes, agrégées par IP et domaine ;
- image : data-URI PNG/JPEG/WebP, 4 Mio de base64 au maximum et 3 Mio décodés ;
- message utilisateur : de 10 à 3 000 caractères et 3 liens au maximum.

Les limites Netlify sont déclarées dans l'objet `config` exporté par chaque fonction moderne ; elles ne doivent pas être déplacées dans `netlify.toml`.

## Flux de partage

1. Le navigateur génère une image WebP du résultat.
2. `shareImage.mjs` vérifie la requête puis téléverse l'image sur ImgBB.
3. La fonction renvoie une page sociale dynamique hébergée sur le domaine Netlify.
4. Les robots sociaux lisent ses métadonnées Open Graph/Twitter.
5. Un visiteur humain est redirigé vers `PUBLIC_SITE_URL`, donc vers GitHub Pages et non vers un second stockage local Netlify.

La page de partage ignore toute redirection vers un autre domaine. Elle n'est pas indexable et n'exécute aucun script.

## Retours utilisateur

`sendFeedback.mjs` crée une Discussion GitHub dans l'une des deux catégories configurées. Le formulaire contient un honeypot, mais celui-ci n'est qu'un filtre supplémentaire : la protection principale est la limitation Netlify et la validation serveur.

Le message, le résultat et le type sont bornés avant l'appel GraphQL. Les mentions telles que `@everyone` ou `@admin` sont neutralisées pour éviter le spam de notifications.

## Mode hors ligne et mises à jour

Le service worker précache l'instantané complet de la génération publiée. Les documents sont servis réseau d'abord avec repli sur le cache ; les scripts et styles estampillés sont servis cache d'abord ; les données et médias non estampillés sont revalidés.

Une nouvelle génération n'impose jamais un rechargement. Elle s'installe en attente et prend la main lorsque les anciennes pages sont fermées. Un rechargement volontaire en ligne reçoit le dernier HTML publié.

## Vérifications avant publication

```bash
npm run stamp
npm run check
npm run format
npm run lint
npm test
```

Vérifier ensuite manuellement :

- premier chargement et premier tirage ;
- navigation entre les quatre vues et bouton précédent ;
- second chargement hors ligne ;
- partage depuis GitHub Pages et retour vers GitHub Pages ;
- formulaire de retour avec les deux catégories ;
- petit écran en portrait et paysage ;
- navigation au clavier et préférence de mouvement réduit.

## Limites connues

- Les images sociales dépendent du quota et de la disponibilité d'ImgBB.
- Les fonctions restent publiques ; la limitation de débit réduit l'abus mais ne remplace pas une identité utilisateur.
- La provenance, l'année de référence et le statut juridique ne sont pas encore renseignés pour chaque prélèvement.
- Une partie importante des recettes et dates de création est inconnue dans le jeu actuel.
- Les tests automatisés ne remplacent pas encore une vraie suite de navigation dans plusieurs navigateurs.
