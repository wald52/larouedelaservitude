# Jeu de données

Les fichiers `entries-light.json` et `entries-full.json` décrivent la même liste de prélèvements. Le premier alimente rapidement la roue ; le second fournit les détails et les valeurs numériques utilisées dans la vue **Données & analyse**.

## Ce que signifie la version

Le champ `version` identifie une publication technique du jeu de données. Il ne doit pas être interprété comme l'année de référence commune des recettes : les entrées actuelles ne portent pas encore cette information de manière systématique.

## Couverture connue

Le jeu contient 371 entrées, avec de nombreux champs inconnus. Une valeur `null` signifie « non renseignée dans cette publication », et non nécessairement « inexistante » ou « nulle ». Les agrégats de recettes portent uniquement sur les montants connus et ne représentent donc pas la totalité des prélèvements obligatoires français.

## Audit 2026 en cours

La liste utilisée par l'application reste un **brouillon historique**. Elle n'est pas encore une liste exhaustive et juridiquement validée des seuls prélèvements obligatoires actuellement en vigueur.

La première phase de l'audit est conservée séparément afin de pouvoir reprendre le travail sans modifier prématurément les données servies par la roue :

- [`../docs/prelevements-obligatoires-methodologie.md`](../docs/prelevements-obligatoires-methodologie.md) définit le périmètre, les critères d'inclusion et les motifs d'exclusion ;
- [`../docs/audit-prelevements-obligatoires-2026.md`](../docs/audit-prelevements-obligatoires-2026.md) présente les résultats et les limites de la première phase ;
- [`audit/draft-2026-08-05.json`](audit/draft-2026-08-05.json) contient une décision de travail pour chacune des 371 entrées ;
- [`audit/summary-2026-09-01.json`](audit/summary-2026-09-01.json) résume l'état d'avancement ;
- [`audit/reason-codes.json`](audit/reason-codes.json) documente le vocabulaire de décision ;
- [`reference/`](reference/) archive les référentiels officiels et leur provenance utilisés pour les rapprochements.

La reprise ligne par ligne est ensuite publiée par lots autonomes :

- [`audit/financement-social-2026-09-01.json`](audit/financement-social-2026-09-01.json) rassemble cinq fiches canoniques prêtes à relire — CSG, CRDS, C3S, forfait social et taxe sur les salaires ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-financement-social.md`](../docs/audit-prelevements-obligatoires-2026-lot-financement-social.md) documente les choix, corrections et limites de ce premier lot de reprise.

Ces fichiers d'audit ne sont pas consommés par l'application et ne remplacent pas `entries-full.json`. Une entrée ne devra rejoindre le futur référentiel canonique qu'après vérification de son existence juridique, de son appartenance au périmètre des prélèvements obligatoires, de son statut en vigueur et de ses sources datées.

## Provenance à ajouter

Toute nouvelle collecte devrait conserver, pour chaque entrée, au minimum :

```json
{
  "source_url": "https://…",
  "source_titre": "…",
  "source_date": "2026-08-01",
  "recette_annee": 2025,
  "date_verification": "2026-08-05",
  "statut": "actif",
  "notes": "…"
}
```

Ces champs ne sont pas encore obligatoires afin de ne pas inventer une provenance absente des données historiques. Ils devront devenir requis lorsque la reprise documentaire aura été effectuée.

## Règles de modification

1. Modifier d'abord `entries-full.json`.
2. Conserver des identifiants uniques et stables.
3. Reporter exactement les mêmes identifiants et noms courts dans `entries-light.json`.
4. Mettre à jour la même valeur `version` dans les deux fichiers.
5. Exécuter `npm run check:data`.
6. Exécuter `npm run stamp` et committer les fichiers réécrits, car les données font partie de l'instantané hors ligne.
7. Vérifier manuellement les unités, les accords (« million »/« millions »), les années de référence et les liens de source.
