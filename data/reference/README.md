# Référentiels de l’audit des prélèvements obligatoires

Ce dossier conserve les sources officielles et les extractions normalisées utilisées pour auditer les prélèvements obligatoires français.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| [`sources.json`](sources.json) | Registre de provenance des sources déjà mobilisées comme preuves ou contexte de recherche |
| [`bulk-sources.json`](bulk-sources.json) | Registre opérationnel principal des sources exploitables en masse, avec priorité, couverture, accès, limites et prochaine action |
| [`bulk-sources-supplement-2026-09-02.json`](bulk-sources-supplement-2026-09-02.json) | Première recherche complémentaire vérifiée le 2 septembre 2026 : tableurs budgétaires, CTP, BOFiP, DSN, comptabilité et contrôles statistiques |
| [`bulk-sources-supplement-2-2026-09-02.json`](bulk-sources-supplement-2-2026-09-02.json) | Troisième passe ciblée du 2 septembre 2026 : recettes DGFiP, référentiels locaux nationaux, JORF, calculateurs fiscaux et MSA |
| [`ntl-france-2026.json`](ntl-france-2026.json) | Extraction des 141 lignes françaises de détail de la National tax list 2026 |
| [`lfss-2026-annexe-3-impositions.json`](lfss-2026-annexe-3-impositions.json) | Transcription contrôlée du tableau 31 de l’annexe 3 du PLFSS 2026 |

La méthode générale d’exploitation des sources massives est décrite dans
[`docs/sources-massives-prelevements-obligatoires.md`](../../docs/sources-massives-prelevements-obligatoires.md).

La première recherche complémentaire sur les tableurs budgétaires, les CTP, le BOFiP, la
DSN, les balances comptables et les contrôles statistiques est décrite dans
[`docs/sources-massives-recherche-complementaire.md`](../../docs/sources-massives-recherche-complementaire.md).

La passe ciblée sur les recettes administratives, les référentiels territoriaux, JORF,
les calculateurs fiscaux et la MSA est décrite dans
[`docs/sources-massives-recherche-complementaire-2.md`](../../docs/sources-massives-recherche-complementaire-2.md).

## Deux registres complémentaires

`sources.json` et `bulk-sources.json` ne répondent pas à la même question :

- `sources.json` décrit **ce qu’une source prouve** et conserve sa provenance ;
- `bulk-sources.json` décrit **comment l’exploiter à grande échelle**, ce qu’elle couvre, ses clés de rapprochement et ses limites.

Une source peut apparaître dans les deux fichiers. Lorsqu’elle possède déjà un identifiant dans `sources.json`, le champ `source_record_id` de `bulk-sources.json` le reprend. Une source encore en phase d’évaluation peut rester uniquement dans le registre massif avec `source_record_id: null`.

Les fichiers datés `bulk-sources-supplement-*.json` sont des registres de recherche
intermédiaires. Les sources qui passent avec succès leur prototype ou leur première
ingestion doivent ensuite être intégrées à `bulk-sources.json`, sans perdre la date et les
preuves de leur évaluation.

## Principes de stockage

- Conserver les données brutes ou une transcription fidèle avant toute normalisation.
- Préserver l’identifiant de ligne, la page, la feuille ou le code de variable de la source.
- Conserver séparément observations, révisions et prévisions.
- Ne jamais déduire une abrogation de l’absence d’une ligne.
- Ne jamais ventiler un agrégat sans table de passage officielle.
- Traiter les rapprochements flous comme des candidats à relire.
- Ajouter la date de récupération et, pour tout fichier téléchargé, une empreinte cryptographique.
- Documenter explicitement la couverture et les exclusions de chaque millésime.

## Ajout d’une source massive

Avant de passer une source à `ready_to_ingest`, documenter au minimum :

```json
{
  "id": "identifiant-stable",
  "title": "Titre officiel",
  "publisher": "Producteur",
  "url": "https://…",
  "priority": 1,
  "status": "ready_to_ingest",
  "coverage": {
    "geography": "France",
    "period": "2026",
    "scope": "Champ couvert"
  },
  "access": {
    "formats": ["csv"],
    "machine_readability": "structured_table",
    "bulk_download": true,
    "api": false,
    "authentication": "none",
    "refresh": "annual"
  },
  "supports": ["candidate_discovery"],
  "unit_of_observation": "ligne source",
  "stable_keys": ["source_row"],
  "limitations": ["Limite connue"],
  "next_action": "Prochaine extraction reproductible"
}
```

Le passage à `ingested` suppose ensuite une extraction locale, un contrôle du nombre de lignes, des identifiants uniques, des unités explicites et une provenance permettant de reproduire la collecte.
