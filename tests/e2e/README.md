# Tests navigateur Playwright

Cette suite couvre l'issue #37 dans un vrai Chromium :

- chargement initial, tirages successifs et carte de résultat ;
- navigation entre les quatre vues et historique du navigateur ;
- filtres, tris et état partageable de la vue Données ;
- ouverture d'une fiche au clavier ;
- partage et retour utilisateur avec réponses Netlify simulées ;
- préférence de mouvement réduit ;
- écrans 320 × 568 et 568 × 320, zoom et texte agrandi ;
- second chargement hors ligne ;
- installation d'une nouvelle génération du service worker sans rechargement imposé.

## Exécution locale

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

Le serveur HTTP est lancé automatiquement par `playwright.config.mjs`. Il expose uniquement pendant les tests un petit endpoint de contrôle qui change le contenu servi de `service-worker.js`, afin de vérifier le cycle de mise à jour sans modifier le code de production.

Les appels vers Netlify sont interceptés avant de quitter le navigateur. Toute autre requête HTTP externe est bloquée et fait échouer le test. Aucun secret de production n'est nécessaire.

En cas d'échec, Playwright conserve la trace, la capture d'écran et la vidéo du test concerné. Le workflow GitHub Actions publie `playwright-report/` et `test-results/` pendant sept jours.
