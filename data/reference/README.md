# Référentiels de l’audit des prélèvements obligatoires

Ce dossier conserve les sources officielles et les extractions normalisées utilisées pour auditer les prélèvements obligatoires français.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| [`sources.json`](sources.json) | Registre de provenance des sources déjà mobilisées comme preuves ou contexte de recherche |
| [`bulk-sources.json`](bulk-sources.json) | Registre opérationnel principal des sources exploitables en masse, avec priorité, couverture, accès, limites et prochaine action |
| [`bulk-sources-supplement-2026-09-02.json`](bulk-sources-supplement-2026-09-02.json) | Première recherche complémentaire vérifiée le 2 septembre 2026 : tableurs budgétaires, CTP, BOFiP, DSN, comptabilité et contrôles statistiques |
| [`bulk-sources-supplement-2-2026-09-02.json`](bulk-sources-supplement-2-2026-09-02.json) | Troisième passe ciblée du 2 septembre 2026 : recettes DGFiP, référentiels locaux nationaux, JORF, calculateurs fiscaux et MSA |
| [`bulk-sources-supplement-3-2026-09-03.json`](bulk-sources-supplement-3-2026-09-03.json) | Quatrième passe du 3 septembre 2026 : PLACSS, Unédic, taux et décisions locales, fiscalité environnementale, comptes Insee et bénéficiaires publics |
| [`bulk-sources-supplement-4-2026-09-03.json`](bulk-sources-supplement-4-2026-09-03.json) | Cinquième passe du 3 septembre 2026 : Douane, TARIC, COG, BANATIC, Sirene, M57, AT/MP, eau, OPCO et jeux |
| [`bulk-sources-supplement-5-2026-09-03.json`](bulk-sources-supplement-5-2026-09-03.json) | Sixième passe du 3 septembre 2026 : DVF, Sitadel3, RSVERO, ANFR, registre RTE, aviation, IREP, ARCEP, Open Medic et BDNB |
| [`bulk-sources-supplement-6-2026-09-03.json`](bulk-sources-supplement-6-2026-09-03.json) | Septième passe du 3 septembre 2026 : KALI, NAF, PCI, ICPE, BNV-D, SINOE, transports et assurance |
| [`bulk-sources-supplement-7-2026-09-03.json`](bulk-sources-supplement-7-2026-09-03.json) | Huitième passe du 3 septembre 2026 : Camino, Agence ORE, SYDEREP, Agirc-Arrco, CNRACL, Ircantec, culture et viticulture |
| [`bulk-sources-supplement-7-corrections-2026-09-03.json`](bulk-sources-supplement-7-corrections-2026-09-03.json) | Correction prioritaire de la huitième passe : remplace l’ancien état Ircantec par les jeux officiels actualisés en juillet et août 2026 |
| [`bulk-sources-supplement-8-2026-09-03.json`](bulk-sources-supplement-8-2026-09-03.json) | Neuvième passe du 3 septembre 2026 : installations nucléaires, TAEMUP, zonage des logements vacants, remontées mécaniques et octroi de mer |
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

La quatrième passe sur les comptes sociaux observés, les décisions fiscales locales,
la fiscalité environnementale, les comptes Insee et la classification des bénéficiaires
publics est décrite dans
[`docs/sources-massives-recherche-complementaire-3.md`](../../docs/sources-massives-recherche-complementaire-3.md).

La cinquième passe sur les référentiels douaniers, territoriaux, institutionnels,
comptables et sectoriels est décrite dans
[`docs/sources-massives-recherche-complementaire-4.md`](../../docs/sources-massives-recherche-complementaire-4.md).

La sixième passe sur les bases d’assiette physiques et sectorielles est décrite dans
[`docs/sources-massives-recherche-complementaire-5.md`](../../docs/sources-massives-recherche-complementaire-5.md).

La septième passe sur les nomenclatures d’activité et de branche, les installations
réglementées, les déchets, l’assurance et la BNV-D est décrite dans
[`docs/sources-massives-recherche-complementaire-6.md`](../../docs/sources-massives-recherche-complementaire-6.md).

La huitième passe sur les titres miniers, les consommations énergétiques, les filières REP,
les régimes complémentaires, les statistiques culturelles et la viticulture est décrite
dans
[`docs/sources-massives-recherche-complementaire-7.md`](../../docs/sources-massives-recherche-complementaire-7.md).

La correction de fraîcheur des jeux Ircantec est décrite dans
[`docs/sources-massives-recherche-complementaire-7-corrections.md`](../../docs/sources-massives-recherche-complementaire-7-corrections.md).
Elle prévaut sur les champs contradictoires de la première rédaction de la huitième passe.

La neuvième passe sur les installations nucléaires, la fiscalité de la plaisance, le
zonage des logements vacants, les remontées mécaniques et l’octroi de mer est décrite dans
[`docs/sources-massives-recherche-complementaire-8.md`](../../docs/sources-massives-recherche-complementaire-8.md).

## Deux registres complémentaires

`sources.json` et `bulk-sources.json` ne répondent pas à la même question :

- `sources.json` décrit **ce qu’une source prouve** et conserve sa provenance ;
- `bulk-sources.json` décrit **comment l’exploiter à grande échelle**, ce qu’elle couvre, ses clés de rapprochement et ses limites.

Une source peut apparaître dans les deux fichiers. Lorsqu’elle possède déjà un identifiant dans `sources.json`, le champ `source_record_id` de `bulk-sources.json` le reprend. Une source encore en phase d’évaluation peut rester uniquement dans le registre massif avec `source_record_id: null`.

Les fichiers datés `bulk-sources-supplement-*.json` sont des registres de recherche
intermédiaires. Les sources qui passent avec succès leur prototype ou leur première
ingestion doivent ensuite être intégrées à `bulk-sources.json`, sans perdre la date et les
preuves de leur évaluation.

Un fichier `*-corrections-*.json` doit être appliqué avant toute ingestion du supplément
qu’il vise. Il remplace explicitement les champs contradictoires sans effacer l’historique
de la recherche ayant conduit à la correction.

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
