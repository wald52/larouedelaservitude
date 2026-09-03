# Dixième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète les neuf passes précédentes. Le registre structuré associé est
[`data/reference/bulk-sources-supplement-9-2026-09-03.json`](../data/reference/bulk-sources-supplement-9-2026-09-03.json).

## Résultat principal

Cette passe apporte trois chaînes de sources qui peuvent accélérer fortement l’audit.

La première résout le champ sanitaire et médico-social :

```text
FINESS+ Structures
    ↔ FINESS+ Activités
    ↔ SAE
    ↔ Sirene et COG
    ↔ comptes et statistiques sociales
```

La deuxième fournit des dénominateurs structurés pour les prélèvements sociaux :

```text
emploi et masse salariale Urssaf
    ↔ CTP et DSN
    ↔ épargne salariale Dares
    ↔ paramètres juridiques
    ↔ recettes de recouvrement et comptes sociaux
```

La troisième industrialise l’identification du champ candidat de la taxe sur les
transactions financières :

```text
liste annuelle BOFiP
    → société nommée
    → SIREN et LEI
    → ISIN
    → instrument FIRDS
    → conditions fiscales
    → recette agrégée
```

Ces chaînes ne transforment pas les référentiels en rôles fiscaux. Elles servent à résoudre
les identités, dates, activités, secteurs et instruments afin de réserver la revue humaine
aux ambiguïtés.

## Sources nouvelles de cette passe

| Priorité | Source | Apport massif | Limite centrale |
| --- | --- | --- | --- |
| 1 | FINESS+ Structures | identités FINESS, SIREN, SIRET, statuts, groupes, dates et adresses | registre institutionnel sans dette ni secteur SEC |
| 1 | FINESS+ Activités | activités autorisées ou exercées, équipements, capacités et dates | autorisation différente de l’activité et de l’assiette |
| 1 | SAE 2025 | capacité, activité, plateaux techniques et personnels par établissement | base administrative provisoire, distincte de la base statistique |
| 1 | Open Urssaf — masse salariale | séries depuis 1998 par secteur et territoire | assiette déplafonnée, pas base universelle de tous les prélèvements |
| 2 | Open Urssaf — auto-entrepreneurs | populations et chiffre d’affaires depuis 2009 | chiffre d’affaires différent de la cotisation |
| 2 | Dares — épargne salariale 2024 | participation, intéressement, abondements et populations | primes différentes des prélèvements et de leurs recettes |
| 1 | BOFiP — liste TTF | 121 émetteurs nommés pour le seuil annuel de capitalisation | liste de sociétés sans identifiants ni transactions |
| 1 | GLEIF — LEI et ISIN | identité juridique, groupes et correspondances instrument-émetteur | couverture ISIN partielle et absence de qualification fiscale |
| 2 | ESMA FIRDS | instruments, plateformes, dates et états de négociation | référence de marché, pas champ fiscal français |

## 1. FINESS+ Structures

Source :
[FINESS — Structures FINESS-STR](https://www.data.gouv.fr/datasets/finess-structures-1).

Schéma :
[`schema-structures-v1.json`](https://github.com/ansforge/finess/blob/main/flux/out/data.gouv/structure/schema/schema-structures-v1.json).

L’Agence du Numérique en Santé diffuse un flux de nouvelle génération décrivant les
structures publiées dans FINESS. Le jeu comprend :

- les personnes morales-entités juridiques, appelées PMEJ ;
- les entités géographiques d’exercice, appelées EGE ;
- les groupements de coopération organiques, appelés GCO ;
- les groupements de coopération conventionnels, appelés GCC.

Le fichier complet est généré automatiquement chaque jour. Le quotidien remplace la
version précédente. Un snapshot est publié le premier jour de chaque mois et un autre au
début de chaque année.

La dernière mise à jour observée le 3 septembre 2026 proposait un fichier quotidien JSON
compressé d’environ 47,9 Mo.

### Champs utiles

Le schéma officiel expose notamment, selon les objets :

- un numéro FINESS ;
- un identifiant interne de structure ;
- un SIREN pour la personne morale ;
- un SIRET pour certaines entités géographiques ;
- la dénomination ;
- le statut juridique ;
- le type de personne morale ;
- les dates d’ouverture, de création ou de fermeture ;
- les adresses et le code COG de la commune ;
- le mode de fixation tarifaire ;
- les types de budget ;
- les événements et engagements ;
- les relations avec les groupements.

Cette richesse permet de résoudre automatiquement une grande partie des noms de structures
présents dans les annexes sociales, les comptes et les tableaux de bénéficiaires.

### Modèle de structure

```text
personne morale FINESS
    ├── SIREN
    ├── une ou plusieurs entités géographiques
    │       ├── numéro FINESS EGE
    │       ├── SIRET éventuel
    │       └── adresse et commune
    ├── groupements organiques éventuels
    └── groupements conventionnels éventuels
```

La personne morale, le site géographique et le groupement sont des objets distincts. Une
jointure qui ramènerait tout au seul numéro FINESS créerait des doublons ou perdrait des
relations.

### Ce que FINESS ne prouve pas

FINESS ne fournit pas :

- l’assiette d’une cotisation ou contribution ;
- le montant dû ou payé ;
- une recette comptable ;
- un code SEC ;
- le classement automatique dans S.13 ;
- la qualité de redevable d’un prélèvement particulier.

Un établissement public n’appartient pas nécessairement à S.13 et une structure privée
peut participer à une mission de service public sans devenir une administration publique.
Le statut juridique et le mode de financement sont des indices, non une preuve de secteur.

### Historisation

Le quotidien étant remplacé, l’ingestion doit archiver :

```json
{
  "dataset": "finess-structures",
  "generated_at": "horodatage du fichier",
  "retrieved_at": "2026-09-03",
  "resource_kind": "daily | monthly | annual",
  "schema_version": "version publiée",
  "sha256": "empreinte du fichier"
}
```

Les snapshots mensuels et annuels sont préférables pour reconstruire l’historique. Le
quotidien sert au contrôle courant et à la détection des changements.

## 2. FINESS+ Activités

Source :
[FINESS — Activités FINESS-ACT](https://www.data.gouv.fr/datasets/finess-activites-1).

Schéma :
[`schema-activites-v1.json`](https://github.com/ansforge/finess/blob/main/flux/out/data.gouv/activite/schema/schema-activites-v1.json).

Le second flux contient les activités autorisées ou exercées et leurs relations avec les
structures FINESS. Il suit la même politique de publication : quotidien complet remplacé,
snapshot mensuel et snapshot annuel.

Le fichier quotidien observé le 3 septembre 2026 pesait environ 55,5 Mo.

### Champs utiles

Le schéma permet notamment de conserver :

- l’identifiant technique de l’activité ;
- l’identifiant d’autorisation ;
- le numéro fonctionnel d’autorisation ;
- la structure et l’entité géographique concernées ;
- la nature de l’activité ;
- le macro-état actif ou inactif ;
- les dates de début, de fin, de caducité ou de fin effective ;
- les activités sanitaires réglementées ;
- certains équipements matériels lourds ;
- les capacités ;
- les zones d’intervention ;
- les événements et engagements.

### Trois états à ne pas confondre

```text
activité autorisée
    → droit réglementaire d’exercer

activité exercée
    → activité déclarée comme mise en œuvre

entité facturante
    → rôle administratif ou financier d’une entité
```

Une activité autorisée peut ne pas être exercée. Une activité exercée peut évoluer ou
prendre fin. Le statut du jour ne suffit pas à reconstituer toute la période.

### Usage pour l’audit

Le flux peut produire des candidats pour :

- les contributions ou taxes visant certains établissements ou activités sanitaires ;
- les bénéficiaires de financements sociaux ;
- les établissements associés à des équipements ou capacités ;
- les changements de dénomination ou d’autorisation ;
- le rattachement de données SAE à la bonne structure juridique.

Il ne permet pas de calculer une dette. Une capacité autorisée, un équipement ou une zone
d’intervention ne devient une assiette que si un texte fiscal le prévoit explicitement.

## 3. SAE 2025 : déclaration administrative et future base statistique

Sources :

- [Bases administratives SAE](https://data.drees.solidarites-sante.gouv.fr/explore/dataset/707_bases-administratives-sae/) ;
- [annonce de la diffusion 2025](https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/sae-2025-mise-disposition-des-bases).

La Statistique annuelle des établissements de santé est une enquête administrative
exhaustive et obligatoire. Elle constitue une source principale sur les établissements de
santé publics et privés.

La base administrative 2025 a été publiée le 23 juillet 2026. Elle restitue les réponses
aux questionnaires telles qu’elles ont été validées par les établissements avec la DREES,
sans redressement statistique supplémentaire.

Elle porte notamment sur :

- les capacités d’accueil ;
- les volumes d’activité ;
- les plateaux techniques ;
- les personnels ;
- les réponses aux différents bordereaux thématiques.

### Formats

La diffusion 2025 est disponible en :

- CSV ;
- Parquet, pour la première fois ;
- SAS7BDAT, pour la dernière année annoncée.

Parquet doit être privilégié pour l’ingestion, mais les CSV restent utiles pour les
contrôles indépendants de lecture et les comparaisons de schéma.

### Calendrier des versions

La DREES annonce le calendrier suivant :

```text
juillet N+1
    → base administrative, données déclarées

août N+1
    → mise à jour du site SAE-Diffusion

octobre N+1
    → premiers résultats agrégés

fin octobre N+1
    → base statistique redressée
```

Au 3 septembre 2026, la base statistique 2025 n’est donc pas encore publiée. Il faut
conserver explicitement :

```json
{
  "survey_year": 2025,
  "release_kind": "administrative",
  "data_status": "provisional",
  "publication_date": "2026-07-23"
}
```

La base statistique future ne devra pas écraser la base administrative. Elle représente
une autre vue, avec traitement de la non-réponse et contrôles de cohérence supplémentaires.

### Rapprochement avec FINESS+

```text
FINESS+
    → identité, structure et autorisation

SAE administrative
    → déclaration thématique validée

SAE statistique
    → version redressée pour les études
```

Les clés FINESS doivent être contrôlées par fichier. Une même structure peut apparaître
dans plusieurs bordereaux et une ligne d’un fichier ne doit pas être comptée comme un
établissement supplémentaire.

### Limites fiscales

La SAE décrit une activité et des ressources hospitalières. Elle ne publie pas les dettes
sociales ou fiscales de chaque établissement. Les personnels et capacités sont des
dénominateurs possibles, mais ils ne doivent pas être multipliés par un taux moyen pour
reconstruire une cotisation.

## 4. Open Urssaf : emploi et masse salariale depuis 1998

Sources :

- [France entière par secteur NA88](https://open.urssaf.fr/explore/dataset/effectifs-salaries-et-masse-salariale-du-secteur-prive-france-entiere-x-na88/) ;
- [départements par secteur NA17i](https://open.urssaf.fr/explore/dataset/nombre-etab-effectifs-salaries-et-masse-salariale-secteur-prive-dep-x-na17i/).

Open Urssaf publie plusieurs jeux complémentaires de séries trimestrielles ou annuelles :

- France entière par secteur ;
- régions ;
- départements ;
- zones d’emploi ;
- EPCI pour certaines séries ;
- nombre d’établissements employeurs ;
- effectifs salariés ;
- masse salariale ;
- distinction des intérimaires dans certains jeux.

La profondeur historique remonte à 1998.

### Proximité avec une assiette sociale

Dans le jeu annuel départemental, la masse salariale est définie comme l’assiette
déplafonnée de Sécurité sociale. Elle exclut donc certains éléments non soumis aux
cotisations sociales, comme des indemnités de chômage partiel.

Cette définition rend la source particulièrement utile pour contrôler :

- les cotisations assises sur la totalité du salaire ;
- les prélèvements dont la recette suit la masse salariale ;
- les effets sectoriels et territoriaux ;
- les ruptures liées aux exonérations ou à la conjoncture ;
- les ordres de grandeur des taux implicites agrégés.

### Limite de champ

Le champ est celui du secteur privé du régime général, hors agriculture et hors Mayotte.
Il ne faut donc pas l’utiliser comme total de l’économie française.

Les autres champs déjà recensés restent nécessaires :

```text
Urssaf secteur privé
+ MSA agriculture
+ fonction publique et régimes particuliers
+ travailleurs indépendants
+ autres champs sociaux
```

### Ruptures méthodologiques

Deux avertissements sont particulièrement importants :

- les apprentis sont intégrés aux effectifs à partir de la publication du premier trimestre
  2023 alors qu’ils étaient auparavant exclus ;
- la montée en charge de la DSN a modifié la production des indicateurs et entraîné des
  révisions de niveau, achevées pour les effectifs au premier trimestre 2021.

Chaque série dérivée doit porter des marqueurs de rupture. Les données révisées doivent
remplacer les anciennes valeurs dans la vue courante, tout en restant historisées dans le
registre de provenance.

### Ce que la masse salariale ne prouve pas

L’assiette déplafonnée n’est pas l’assiette universelle de tous les prélèvements :

- certaines cotisations sont plafonnées ;
- certains versements sont exonérés ;
- des réductions générales ou ciblées s’appliquent ;
- certains prélèvements suivent d’autres définitions de rémunération ;
- le taux effectif dépend de la population, du territoire ou du secteur ;
- la date d’encaissement peut différer de la période de rémunération.

La source doit donc servir de dénominateur et de contrôle, pas de générateur automatique de
recettes.

## 5. Auto-entrepreneurs : population et chiffre d’affaires

Source :
[Auto-entrepreneurs par secteur d’activité](https://open.urssaf.fr/explore/dataset/auto-entrepreneurs-par-secteur-dactivite/).

Le jeu couvre depuis 2009 :

- les immatriculations trimestrielles ;
- les radiations ;
- les auto-entrepreneurs administrativement actifs ;
- les auto-entrepreneurs économiquement actifs, ayant déclaré un chiffre d’affaires
  positif ;
- le chiffre d’affaires trimestriel total ;
- le secteur d’activité.

### Utilité

Cette source complète les séries salariales pour documenter :

- le champ des cotisations des micro-entrepreneurs ;
- les évolutions de population ;
- les différences entre inscription et activité économique ;
- le chiffre d’affaires déclaré agrégé ;
- les changements de secteurs ;
- les ordres de grandeur des recettes sociales publiées ailleurs.

### Corrections rétrospectives

Le traitement des radiations administratives peut être différé. Open Urssaf signale des
réaffectations et estimations destinées à préserver la cohérence des séries lorsque des
radiations n’ont pas été effectuées à la date attendue.

La date de publication et les avertissements doivent donc accompagner chaque extraction.

### Règle centrale

```text
chiffre d’affaires micro-entrepreneur
    ≠ revenu fiscal
    ≠ assiette après toutes les règles
    ≠ cotisation due
    ≠ cotisation encaissée
```

Le taux peut varier selon la catégorie d’activité et les dispositifs applicables. Les
exonérations, versements libératoires et régularisations ne sont pas déductibles du seul
agrégat de chiffre d’affaires.

## 6. Dares : participation, intéressement et abondements

Sources :

- [L’épargne salariale en 2024](https://dares.travail-emploi.gouv.fr/publication/lepargne-salariale-en-2024) ;
- [page de données consacrée à la participation et à l’intéressement](https://dares.travail-emploi.gouv.fr/donnees/participation-interessement-et-epargne-salariale).

La Dares a publié le 10 juin 2026 les résultats portant sur 2024, avec un classeur de
données associé. La page de données indique un total brut de 27,2 milliards d’euros pour
les primes de participation ou d’intéressement et les abondements de l’employeur.

Les tableaux peuvent notamment documenter :

- les entreprises couvertes ;
- les salariés bénéficiaires ;
- la participation ;
- l’intéressement ;
- les abondements ;
- les montants moyens ;
- les plans d’épargne ;
- la taille ou le secteur de l’entreprise.

### Apport pour les prélèvements sociaux

Ces données fournissent le dénominateur de plusieurs mécanismes :

- forfait social selon le dispositif et le champ applicable ;
- CSG et CRDS ;
- cotisations sociales lorsque les conditions d’exonération ne sont pas remplies ;
- impôt sur le revenu selon le choix de perception ou de placement ;
- autres régimes propres à l’épargne salariale.

### Règle de séparation

```text
prime brute versée ou affectée
    ≠ assiette de chaque prélèvement
    ≠ prélèvement acquitté
    ≠ recette de recouvrement
    ≠ encours du plan d’épargne
```

Le même versement peut relever de plusieurs régimes selon l’entreprise, l’effectif, le
dispositif, la date et la destination des sommes.

Les résultats Pipa sont statistiques. Les estimations, redressements et arrondis doivent
être conservés. Les ventilations ne doivent pas être additionnées à leur total.

### Ingestion proposée

Livrable :

```text
data/reference/pipa-employee-savings-2024.json
```

Chaque observation doit porter :

```json
{
  "reference_year": 2024,
  "scheme": "participation | profit_sharing | employer_match | total",
  "population": "companies | employees | payments",
  "dimension": "company_size_or_sector",
  "value": null,
  "unit": "EUR | person | company | percent",
  "amount_kind": "gross_payment | average_payment | stock | rate"
}
```

## 7. Liste annuelle BOFiP de la taxe sur les transactions financières

Source :
[BOI-ANNX-000467, version du 17 décembre 2025](https://bofip.impots.gouv.fr/bofip/9789-PGP.html/identifiant=BOI-ANNX-000467-20251217).

L’annexe publie la liste des sociétés dont le siège social est situé en France et dont la
capitalisation boursière dépasse un milliard d’euros au 1er décembre 2025, critère prévu
par l’article 235 ter ZD du CGI.

La version contient **121 noms de sociétés**.

### Avantage massif

Cette liste constitue un point de départ déterministe pour le millésime concerné. Elle
évite de recalculer la capitalisation de toutes les sociétés françaises ou de chercher
chaque émetteur dans les commentaires fiscaux.

Les versions antérieures du même identifiant BOFiP peuvent être archivées pour suivre :

- les entrées ;
- les sorties ;
- les changements de nom ;
- les fusions ou scissions ;
- les variations de périmètre.

### Défaut d’identifiants

Le document publie des noms, mais pas :

- le SIREN ;
- le LEI ;
- l’ISIN ;
- la catégorie de titres ;
- la place de négociation.

Une jointure directe sur le nom normalisé serait fragile. Il faut construire une table de
résolution avec confiance et justification.

### La liste n’est pas la transaction taxable

```text
émetteur présent dans la liste
    ≠ tout titre de l’émetteur taxable
    ≠ toute acquisition taxable
    ≠ absence d’exemption
    ≠ déclaration ou paiement
```

La nature du titre, l’opération, les exemptions, la date et les autres conditions doivent
être vérifiées séparément.

### Première extraction proposée

```text
data/reference/ttf-issuers-2026-identifiers.json
```

États de rapprochement :

- `exact` : identifiant légal ou relation certaine ;
- `probable` : nom et contexte concordants, à relire ;
- `ambiguous` : plusieurs entités candidates ;
- `unmatched` : aucun identifiant trouvé ;
- `historical` : nom remplacé ou société absorbée.

## 8. GLEIF : LEI, groupes et relation ISIN-émetteur

Sources :

- [Golden Copy et deltas LEI](https://www.gleif.org/en/lei-data/gleif-golden-copy/download-the-golden-copy) ;
- [relations ISIN-LEI](https://www.gleif.org/en/lei-data/lei-mapping/download-isin-to-lei-relationship-files).

Les Golden Copy Files de GLEIF fournissent des données prêtes à l’emploi sur les
identifiants d’entités juridiques. Ils sont publiés trois fois par jour, à 02:00, 10:00 et
18:00 UTC, aux formats XML, CSV et JSON.

GLEIF publie aussi quatre deltas associés à chaque version :

- huit heures ;
- vingt-quatre heures ;
- sept jours ;
- trente-et-un jours.

### Niveaux de données

```text
Level 1
    → who is who : identité et données de référence

Level 2 Relationship Records
    → who owns whom : parents comptables directs et ultimes

Level 2 Reporting Exceptions
    → absence de parent ou exception de déclaration
```

Les Golden Copy évitent les doublons techniques et enrichissent les adresses. Les statuts
et dates de chaque LEI doivent néanmoins être conservés.

### Relation ISIN-LEI

GLEIF et l’ANNA publient quotidiennement des fichiers reliant certains ISIN à leur émetteur
LEI. Le fichier du 3 septembre 2026 était disponible lors de la vérification.

Cette relation permet de passer de l’émetteur BOFiP aux instruments sans comparer
manuellement des milliers de libellés.

### Couverture incomplète

La page précise que les fichiers couvrent les nouvelles émissions provenant des agences de
codification participantes. Toutes les agences nationales ne participent pas encore et
l’extension aux anciens ISIN reste un objectif de plus long terme.

Un ISIN absent du fichier ne doit donc pas être traité comme inexistant ou hors champ.

### Ce que LEI et ISIN ne prouvent pas

- le siège fiscal retenu par la règle française ;
- le dépassement annuel du seuil de capitalisation ;
- la nature fiscale du titre ;
- une acquisition ;
- une exemption ;
- la dette ou le paiement.

La relation de parenté Level 2 est comptable, pas fiscale.

## 9. FIRDS : référence des instruments financiers

Sources :

- [fichiers FIRDS](https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_firds_files) ;
- [registre FIRDS](https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_firds) ;
- [catalogue des bases ESMA](https://www.esma.europa.eu/publications-and-data/databases-and-registers).

L’ESMA collecte auprès des plateformes de négociation et des autorités nationales
compétentes les données de référence prévues par MAR et MiFIR.

Deux types de fichiers sont particulièrement importants :

```text
FULINS
    → fichiers complets des instruments actifs et de leur dernière référence

DLTINS
    → fichiers différentiels décrivant les changements
```

Le registre peut également être interrogé, mais son export textuel est limité lorsque le
nombre de lignes est trop élevé. Une ingestion exhaustive doit donc utiliser les fichiers
complets et différentiels conformément aux instructions de l’ESMA.

### Champs utiles attendus

Selon le schéma réglementaire et les fichiers, FIRDS permet de rechercher notamment :

- l’ISIN ;
- l’émetteur et son LEI lorsqu’il est déclaré ;
- le nom ou la classification de l’instrument ;
- la plateforme ou le MIC ;
- les dates d’admission, de négociation ou de terminaison ;
- l’autorité compétente pertinente ;
- les changements de référence.

Les champs exacts doivent être établis à partir du schéma et du type de fichier avant toute
normalisation.

### Pourquoi FIRDS reste `candidate`

La source est officielle et exploitable en masse, mais le pipeline opérationnel n’a pas
encore été testé dans le projet. Il faut vérifier :

- le volume quotidien ;
- le nombre et la convention de nommage des fichiers ;
- l’ordre FULINS-DLTINS ;
- les corrections et republications ;
- l’idempotence ;
- les fichiers manquants ;
- les doublons d’ISIN selon les plateformes ;
- la couverture réelle des émetteurs BOFiP.

### FIRDS n’est pas une source fiscale

Un instrument présent dans FIRDS n’est pas automatiquement un titre de capital taxable à
la TTF française. La base ne contient pas une variable `french_ttf_eligible`.

Le futur pipeline doit conserver :

```text
instrument de marché
    → candidat à une catégorie de titre
    → émetteur identifié
    → présence annuelle dans la liste BOFiP
    → conditions fiscales
```

## Pipeline proposé pour la TTF

### Étape 1 — geler la liste annuelle

Extraire les 121 noms, la date de capitalisation, la date de publication et l’identifiant
BOFiP.

### Étape 2 — résoudre l’entité

Rapprocher chaque nom avec :

- Sirene pour le SIREN et les dénominations françaises ;
- GLEIF pour le LEI et les noms alternatifs ;
- l’historique des fusions, changements de nom et statuts.

### Étape 3 — résoudre les instruments

Utiliser :

- le fichier ISIN-LEI de GLEIF ;
- FIRDS pour les instruments non couverts ou pour compléter les attributs de marché ;
- une file de revue pour les instruments et émetteurs ambigus.

### Étape 4 — appliquer les conditions fiscales sans les confondre avec l’identité

Conserver séparément :

- type de titre ;
- nature de l’acquisition ;
- date ;
- exemptions ;
- lieu ou mode de négociation lorsque pertinent ;
- redevable ;
- déclaration et paiement, s’ils sont disponibles dans une autre source.

### Étape 5 — contrôler la recette agrégée

Comparer seulement les agrégats avec :

- recettes budgétaires ;
- recettes DGFiP ;
- NTL ;
- comptes de l’État.

Aucune transaction ne doit être reconstituée ou publiée comme observation à partir des
seules données de référence.

## Pipeline proposé pour le champ sanitaire

```text
FINESS Structures
    → identité juridique et géographique

FINESS Activités
    → autorisation, activité, équipement et période

SAE administrative
    → déclaration thématique 2025

SAE statistique future
    → données redressées

Sirene et COG
    → identité institutionnelle et territoire

ODAC/ODAL ou comptes par secteur
    → candidat de classement S.13
```

Sorties attendues :

- structures sans activité publiée ;
- activités sans structure résolue ;
- clés FINESS absentes ou multiples dans la SAE ;
- structures fermées encore présentes dans une source annuelle ;
- personnes morales avec plusieurs EGE ;
- bénéficiaires sociaux sans identifiant ;
- établissements dont le secteur SEC reste non résolu.

## Pipeline proposé pour les assiettes sociales

```text
Urssaf masse salariale
    → dénominateur secteur privé

Urssaf micro-entrepreneurs
    → population et chiffre d’affaires indépendant

Dares Pipa
    → flux d’épargne salariale

CTP et DSN
    → codes déclaratifs

BOSS, CSS et lois
    → règles, taux et exonérations

comptes et encaissements
    → produit observé
```

Les taux implicites agrégés peuvent être utilisés comme signaux de contrôle :

```text
recette observée / dénominateur publié
```

Ils ne doivent pas être présentés comme les taux juridiques ni utilisés pour calculer une
dette individuelle.

## Résultats négatifs à conserver

### Pas de classement SEC dans FINESS

Le registre fournit de nombreux attributs institutionnels, mais pas une appartenance S.13
datée. Le rapprochement avec ODAC, ODAL, Sirene et les comptes reste nécessaire.

### Pas de paiement social par établissement de santé

FINESS et SAE ne contiennent pas les déclarations de cotisations, exonérations et paiements
de chaque établissement.

### Base statistique SAE 2025 encore future

Au 3 septembre 2026, seule la base administrative est disponible. La base statistique est
annoncée pour fin octobre 2026 et ne doit pas être décrite comme déjà ingérée ou disponible.

### Pas d’assiette individuelle ouverte dans les séries Urssaf

Masse salariale et chiffre d’affaires sont agrégés. Ils ne permettent pas de reconstruire
une dette par employeur ou travailleur indépendant.

### Pas de détail du régime social de chaque prime Pipa

La Dares décrit les dispositifs et montants mais pas chaque versement avec l’ensemble de
ses exonérations et prélèvements effectifs.

### Noms BOFiP sans identifiants

La liste TTF ne contient pas SIREN, LEI ou ISIN. Cette lacune justifie la création d’une
table de passage relue.

### ISIN-LEI incomplet

Les agences de codification participantes ne couvrent pas encore tout l’univers, en
particulier les anciens ISIN.

### Pas de transactions TTF ouvertes

Aucune source publique identifiée ne relie chaque acquisition, exemption, déclaration,
paiement et recette. BOFiP, GLEIF et FIRDS ne documentent que le périmètre candidat et les
identités.

## Ordre d’ingestion recommandé

### Lot 1 — FINESS+ Structures et Activités

Objectif : archiver les deux flux et leurs schémas et créer une dimension institutionnelle
sanitaire commune.

Livrable :

```text
data/reference/finess-plus-2026-09-03-manifest.json
```

### Lot 2 — émetteurs TTF et identifiants

Objectif : extraire les 121 sociétés et tester la résolution BOFiP-Sirene-GLEIF-ISIN.

Livrable :

```text
data/reference/ttf-issuers-2026-identifiers.json
```

### Lot 3 — séries de masse salariale

Objectif : inventorier les jeux Urssaf et conserver les ruptures de champ et méthode.

Livrable :

```text
data/reference/urssaf-private-payroll-series-manifest.json
```

### Lot 4 — SAE administrative 2025

Objectif : profiler les fichiers Parquet et leurs clés FINESS sans anticiper la base
statistique.

Livrable :

```text
data/reference/sae-2025-administrative-manifest.json
```

### Lot 5 — épargne salariale

Objectif : structurer les flux, populations et dimensions du classeur Pipa.

Livrable :

```text
data/reference/pipa-employee-savings-2024.json
```

### Lot 6 — auto-entrepreneurs

Objectif : ingérer les populations et chiffres d’affaires depuis 2009 avec les corrections
rétrospectives.

### Lot 7 — prototype FIRDS

Objectif : traiter trente jours de fichiers complets et différentiels et mesurer la
couverture des ISIN liés aux émetteurs BOFiP.

## Règles supplémentaires anti-inférence

1. **Numéro FINESS, SIREN et SIRET sont des identifiants distincts.**
2. **Personne morale FINESS et entité géographique ne doivent pas être fusionnées.**
3. **Groupement FINESS n’est pas bénéficiaire fiscal certain.**
4. **Statut juridique FINESS n’est pas secteur SEC.**
5. **Activité autorisée n’est pas activité exercée.**
6. **Activité exercée n’est pas assiette fiscale.**
7. **Équipement ou capacité n’est pas unité taxable sans texte.**
8. **Base administrative SAE n’est pas base statistique redressée.**
9. **Ligne SAE n’est pas établissement unique.**
10. **Personnel hospitalier n’est pas masse salariale.**
11. **Masse salariale déplafonnée n’est pas assiette de tous les prélèvements.**
12. **Champ privé Urssaf n’est pas ensemble de l’économie.**
13. **Rupture DSN ou inclusion des apprentis doit être datée.**
14. **Chiffre d’affaires micro-entrepreneur n’est pas cotisation.**
15. **Actif administratif n’est pas actif économique.**
16. **Radiation réaffectée doit rester identifiée comme correction.**
17. **Prime d’épargne salariale n’est pas prélèvement social.**
18. **Montant brut Pipa n’est pas assiette universelle.**
19. **Versement annuel n’est pas encours.**
20. **Société BOFiP n’est pas transaction taxable.**
21. **Nom normalisé sans identifiant n’est qu’un candidat.**
22. **LEI n’est pas siège fiscal ni éligibilité annuelle.**
23. **Parent comptable GLEIF n’est pas groupe fiscal.**
24. **ISIN lié à un LEI n’est pas titre taxable.**
25. **Absence d’ISIN dans le fichier GLEIF n’est pas absence d’instrument.**
26. **Présence dans FIRDS n’est pas éligibilité TTF.**
27. **Enregistrement FIRDS par plateforme n’est pas instrument supplémentaire.**
28. **Export limité du registre n’est pas extraction exhaustive.**
29. **Dénominateur × taux moyen n’est pas recette observée.**
30. **Toute source future annoncée reste indisponible tant que sa publication n’est pas vérifiée.**

## Décision recommandée pour l’issue #36

Le premier chantier doit être **FINESS+**. Les deux fichiers sont immédiatement
exploitables, possèdent des schémas officiels et résolvent une infrastructure d’identité
qui sera réutilisée par la SAE, le PLACSS, les comptes sociaux et les bénéficiaires de
financements sanitaires.

Le deuxième chantier doit être le couple **liste BOFiP TTF + GLEIF**. La liste ne contient
que 121 émetteurs, ce qui permet de tester rapidement et complètement le modèle de
résolution de noms vers SIREN, LEI et ISIN avant d’aborder le volume de FIRDS.

Le troisième chantier doit porter sur le manifeste des séries **Open Urssaf**. Ces jeux
fournissent le meilleur dénominateur de masse pour contrôler les prélèvements assis sur les
rémunérations, tout en documentant précisément les exclusions et ruptures de méthode.

La SAE, le classeur Pipa, les micro-entrepreneurs et FIRDS pourront ensuite réutiliser ces
dimensions. Cette séquence doit maintenant remplacer une nouvelle accumulation de sources :
les référentiels sont suffisamment nombreux pour commencer des ingestions qui réduiront
concrètement le nombre de recherches individuelles.
