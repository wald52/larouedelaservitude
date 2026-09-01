# Politique de sécurité

## Signaler une vulnérabilité

Merci de ne pas publier immédiatement une vulnérabilité exploitable dans une issue ou une discussion publique. Utilisez en priorité l'onglet **Security** du dépôt pour envoyer un avis de sécurité privé. À défaut, contactez le propriétaire du dépôt par un canal privé et indiquez :

- le composant concerné ;
- les étapes minimales de reproduction ;
- l'impact probable ;
- toute mesure temporaire permettant de réduire le risque.

Aucun secret réel, token ou donnée personnelle ne doit être inclus dans le rapport.

## Modèle de sécurité des fonctions publiques

Les endpoints de partage et de retour sont publics par nature. Ils reposent sur plusieurs couches complémentaires :

- limitation de débit native Netlify, agrégée par IP et domaine ;
- contrôle strict de l'origine pour les appels depuis un navigateur ;
- taille et type de contenu bornés ;
- validation du contenu réel des images ;
- délais maximum pour les appels ImgBB et GitHub ;
- neutralisation des mentions GitHub dans les retours ;
- permissions minimales pour les secrets de déploiement.

Le contrôle CORS n'est pas une authentification. Un client serveur peut forger un en-tête `Origin` ; la limitation Netlify et les quotas des services tiers restent donc indispensables.

## Secrets de production

Les valeurs suivantes doivent être stockées uniquement dans les variables d'environnement Netlify, avec la portée **Functions** :

- `IMGBB_API_KEY` ;
- `GITHUB_TOKEN`.

Le token GitHub doit être limité au seul dépôt et aux permissions nécessaires à la création de Discussions. En cas de hausse anormale des appels, il faut désactiver ou renouveler les secrets, puis consulter les journaux Netlify, ImgBB et GitHub.

Les identifiants non secrets peuvent aussi être surchargés :

- `PUBLIC_SITE_URL` ;
- `GITHUB_REPOSITORY_ID` ;
- `GITHUB_DISCUSSION_INFO_CATEGORY_ID` ;
- `GITHUB_DISCUSSION_ERROR_CATEGORY_ID`.

Toute modification d'une variable d'environnement nécessite un nouveau déploiement Netlify.
