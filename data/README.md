# Jeu de données

Les fichiers `entries-light.json` et `entries-full.json` décrivent la même liste de prélèvements. Le premier alimente rapidement la roue ; le second fournit les détails et les valeurs numériques utilisées dans la vue **Données & analyse**.

## Ce que signifie la version

Le champ `version` identifie une publication technique du jeu de données. Il ne doit pas être interprété comme l'année de référence commune des recettes : les entrées actuelles ne portent pas encore cette information de manière systématique.

## Couverture connue

Le jeu contient 371 entrées, avec de nombreux champs inconnus. Une valeur `null` signifie « non renseignée dans cette publication », et non nécessairement « inexistante » ou « nulle ». Les agrégats de recettes portent uniquement sur les montants connus et ne représentent donc pas la totalité des prélèvements obligatoires français.

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
