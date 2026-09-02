# Quatrième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète :

- [`sources-massives-prelevements-obligatoires.md`](sources-massives-prelevements-obligatoires.md) ;
- [`sources-massives-recherche-complementaire.md`](sources-massives-recherche-complementaire.md) ;
- [`sources-massives-recherche-complementaire-2.md`](sources-massives-recherche-complementaire-2.md).

Le registre structuré associé est
[`data/reference/bulk-sources-supplement-3-2026-09-03.json`](../data/reference/bulk-sources-supplement-3-2026-09-03.json).

## Résultat principal

Cette passe apporte trois progrès méthodologiques importants.

Premièrement, les **prévisions sociales** du PLFSS peuvent désormais être complétées par
plusieurs classeurs du **PLACSS 2025** portant sur le dernier exercice clos : financement,
exonérations, assurance chômage, retraites complémentaires et fonds sociaux.

Deuxièmement, la fiscalité locale peut être traitée comme un ensemble de dimensions
nationales plutôt que comme une collection de recherches communales :

- taux 2026 des communes ;
- taux 2026 des EPCI ;
- délibérations 2026 hors taux ;
- composition commune-EPCI ;
- produits du REI ;
- situations comptables mensuelles ;
- balances annuelles.

Troisièmement, l’Insee et le SDES publient des référentiels qui réduisent deux vérifications
coûteuses :

- la qualification du **bénéficiaire public** dans un sous-secteur S.13 ;
- la couverture des **taxes environnementales**, grâce à un classeur national portant sur
  près de quarante taxes ou agrégats.

## Sources prioritaires de cette passe

| Priorité | Source | Apport massif | Limite centrale |
| --- | --- | --- | --- |
| 1 | PLACSS 2025 et classeurs annexes | comptes sociaux, financement, exonérations et fonds | une ligne comptable peut agréger plusieurs créances |
| 1 | SDES — fiscalité environnementale | près de quarante taxes, recettes, catégories et financeurs | définition environnementale différente de la définition juridique |
| 1 | Taux locaux 2026 communes et EPCI | quatre grandes taxes sur tout le territoire | taux sans base ni produit |
| 1 | Délibérations locales 2026 hors taux | exonérations, abattements, majorations et options | une option n’est pas un prélèvement |
| 1 | Unédic — financement de l’assurance chômage | recettes et dépenses depuis 2011 en CSV et JSON | catégories de régime, pas créances individuelles |
| 1 | Insee — comptes des APU 2025 | tableaux S.13, sous-secteurs, PO et catégories d’impôts | agrégats non ventilables entre fiches |
| 1 | DGFiP — SMCL | suivi comptable mensuel des impôts et taxes locaux | rythmes d’enregistrement et budgets principaux |
| 2 | Composition des EPCI 2026 | table de jointure commune-EPCI | aucune information fiscale en elle-même |
| 2 | Listes ODAC et ODAL | contrôle massif des bénéficiaires S.13112 et S.13132 | PDF, identifiants incomplets et millésime 2024 |

## 1. PLACSS 2025 : passer des prévisions aux comptes sociaux

Source officielle :
[Projet de loi d’approbation des comptes de la sécurité sociale pour 2025](https://www.securite-sociale.fr/home/la-secu-en-detail/loi-de-financement/projet-de-loi-d-approbation-des-comptes-de-la-securite-sociale-placss.html).

Le PLACSS a été déposé le 27 mai 2026. Sa page documentaire fournit plusieurs classeurs
qui intéressent directement l’audit des prélèvements :

- [données du REPSS Financement](https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLACSS/2025/PLACSS%202025%20-%20Annexe%201%20-%20REPSS%20Financement%202026%20-%20Donn%C3%A9es.xlsx) ;
- [données de l’annexe 2 sur les réductions, exonérations et compensations](https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLACSS/2025/PLACSS%202025%20-%20grille%20d%27analyse%20-%20vpropre.xlsx) ;
- [données de l’annexe 4 sur l’assurance chômage et les retraites complémentaires](https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLACSS/2025/Annexe%204%20Tableaux%20RCO.xlsx) ;
- [données de l’annexe 7 sur le FSV, la CADES, le FRR et les fonds sociaux](https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLACSS/2025/Annexe%207_Donn%C3%A9es_2025.xlsx).

L’annexe 1 comprend six rapports d’évaluation des politiques de sécurité sociale. Le
rapport « Financement » est le plus directement utile pour l’inventaire, mais les rapports
par branche peuvent aussi contenir des dénominateurs, périmètres et historiques nécessaires
à la compréhension des recettes.

### Complémentarité avec les sources déjà recensées

```text
PLFSS 2026, annexes 3 et 4
    → prévisions, mesures et affectations

PLACSS 2025
    → dernier exercice clos, évaluations et comptes par régime ou fonds

DREES, comptes de la protection sociale
    → séries longues harmonisées

Urssaf, CTP et encaissements
    → nomenclature et collecte administrative

NTL / Insee / Eurostat
    → classement et recettes en comptabilité nationale
```

Le PLACSS ne remplace donc aucune de ces sources. Il fournit une couche supplémentaire de
contrôle et, surtout, permet de ne plus comparer uniquement une prévision 2026 à une
observation NTL 2024.

### Granularités à conserver

Les classeurs doivent être extraits sans supposer qu’ils partagent un schéma commun. Une
ligne peut représenter :

- une branche ;
- un régime ;
- une catégorie de ressources ;
- une contribution ou famille de contributions ;
- une exonération ;
- une compensation ;
- un transfert ;
- un fonds ;
- un solde comptable.

Le type de ligne doit donc être explicite. Une compensation budgétaire ne doit pas devenir
une recette de prélèvement obligatoire et une mesure d’exonération ne doit pas créer une
fiche canonique.

### Statut des données

Les mots suivants doivent être conservés tels qu’ils sont publiés :

- observé ;
- estimé ;
- rectifié ;
- provisoire ;
- définitif ;
- compensé ;
- non compensé.

Le parcours parlementaire du projet de loi d’approbation doit rester distinct du statut
comptable des tableaux qu’il accompagne.

### Première ingestion proposée

Livrable :
`data/reference/placss-2025-social-financing.json`.

Le manifeste de chaque classeur devra contenir :

```json
{
  "annex": "annexe-4",
  "workbook_url": "https://…xlsx",
  "retrieved_at": "2026-09-03",
  "sha256": "…",
  "sheets": [],
  "units": [],
  "data_statuses": [],
  "notes": []
}
```

La première extraction doit viser les feuilles de ressources et de contributions, puis
les tableaux de l’assurance chômage. Les feuilles d’exonérations seront ensuite reliées
aux CTP et aux codes DSN sans être confondues avec les prélèvements sous-jacents.

## 2. Unédic : financement de l’assurance chômage depuis 2011

Source :
[Dépenses et recettes de l’Assurance chômage](https://www.data.gouv.fr/datasets/depenses-et-recettes-de-lassurance-chomage).

Exports directs :

- [CSV](https://data.unedic.org/api/explore/v2.1/catalog/datasets/financement-de-l-assurance-chomage/exports/csv?use_labels=true) ;
- [JSON](https://data.unedic.org/api/explore/v2.1/catalog/datasets/financement-de-l-assurance-chomage/exports/json).

Le jeu, mis à jour le 12 mai 2026 lors de cette vérification, décrit les recettes et
dépenses depuis 2011. Les recettes comprennent notamment :

- les contributions d’assurance chômage assises sur les salaires bruts ;
- la fraction de CSG sur les revenus d’activité reçue en compensation de l’ancienne part
  salariale ;
- d’autres produits, dont ceux liés au contrat de sécurisation professionnelle.

Le jeu fournit aussi les dépenses, soldes et dette. Il est donc immédiatement exploitable
pour une série historique du régime.

### Règle centrale

La fraction de CSG reçue par l’Unédic ne doit pas être comptée comme une contribution
nouvelle. Il s’agit d’une **affectation d’une partie d’un prélèvement existant**.

Le modèle doit distinguer :

```text
prélèvement juridique : CSG
    └── fraction affectée à l’assurance chômage
            └── produit comptabilisé par l’Unédic
```

De même, le total des contributions employeurs peut correspondre à plusieurs règles,
taux, populations et codes de recouvrement. La catégorie comptable ne fournit pas une
correspondance univoque avec une fiche juridique.

### Première ingestion proposée

Livrable :
`data/reference/unedic-financing-2011-2025.json`.

Les exports CSV et JSON doivent être comparés pour vérifier qu’ils représentent les mêmes
observations. Une éventuelle prévision doit porter `amount_kind: forecast`, jamais
`observed`.

## 3. Taux de fiscalité directe locale votés en 2026

Source officielle :
[Taux de fiscalité directe locale votés par les collectivités](https://www.collectivites-locales.gouv.fr/etudes-et-statistiques/acces-aux-statistiques-par-thematique/fiscalite/taux-de-fiscalite-directe-locale-votes-par-les-collectivites).

Fichiers :

- [taux 2026 des communes](https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/Taux%20de%20fiscalit%C3%A9%20directe%20locale%20vot%C3%A9s%20par%20les%20collectivit%C3%A9s/2026/Taux_2026_communes.xlsx) ;
- [taux 2026 des EPCI](https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/Taux%20de%20fiscalit%C3%A9%20directe%20locale%20vot%C3%A9s%20par%20les%20collectivit%C3%A9s/2026/Taux_2026_EPCI.xlsx).

Les deux classeurs couvrent :

- la taxe foncière sur les propriétés bâties ;
- la taxe foncière sur les propriétés non bâties ;
- la taxe d’habitation ;
- la cotisation foncière des entreprises.

La page donne aussi accès au REI et à des archives remontant à 2008. La couverture des
anciens fichiers varie selon les catégories de collectivités et les seuils de population :
un historique complet ne peut donc pas être construit par simple concaténation.

### Apport par rapport au REI

Le REI fournit bases, taux et produits à une granularité riche, mais les fichiers dédiés
aux taux ont plusieurs avantages :

- millésime courant clairement identifié ;
- séparation communes et EPCI ;
- taille plus réduite ;
- contrôle rapide des valeurs votées ;
- archives de publications successives.

Ils doivent servir de référentiel de taux, tandis que le produit observé reste obtenu du
REI ou des comptes locaux.

### Modèle proposé

```text
prélèvement national
    ├── composante communale
    ├── composante intercommunale
    ├── territoire d’application
    ├── taux voté
    ├── année d’effet
    └── décisions optionnelles hors taux
```

Une ligne par commune ou EPCI n’est donc pas une nouvelle taxe. Les composantes ne doivent
pas être additionnées sans connaître le régime applicable, les taxes annexes et le sens
du taux publié.

Livrable :
`data/reference/local-direct-tax-rates-2026.json`.

## 4. Délibérations locales applicables en 2026 hors taux

Source officielle :
[Délibérations de fiscalité directe locale](https://www.collectivites-locales.gouv.fr/etudes-et-statistiques/acces-aux-statistiques-par-thematique/fiscalite/deliberations-de-fiscalite-directe-locale-des-communes).

Jeux repérés :

- [délibérations des communes applicables en 2026](https://data.economie.gouv.fr/explore/assets/deliberations-de-fiscalite-directe-locale-des-communes-2026-hors-taux/) ;
- [délibérations des groupements à fiscalité propre applicables en 2026](https://data.economie.gouv.fr/explore/assets/deliberations-de-fiscalite-directe-locale-des-groupements-a-fiscalite-propre-2026-hors-taux/).

Ces fichiers complètent directement les taux. Ils portent sur les décisions autorisées
par la loi qui modifient les règles de droit commun, notamment :

- exonérations ;
- abattements ;
- majorations ;
- options relatives aux taxes foncières et à la taxe d’habitation ;
- décisions relatives à la CFE.

Les données annuelles sont publiées depuis 2022 sur la page consultée. Les études associées
permettent de comprendre les codes et le champ des décisions.

### Pourquoi cette source est massive

Sans ces fichiers, la vérification d’une exonération facultative ou d’une majoration
imposerait de retrouver la délibération de chaque collectivité. Le jeu national permet au
contraire de construire une table :

```text
collectivité × disposition × taxe × année d’application × option
```

### Limites

Une délibération ne fournit pas :

- le nombre de contribuables concernés ;
- l’assiette exonérée ou majorée ;
- le coût budgétaire ;
- le produit observé ;
- une nouvelle unité juridique de prélèvement.

Le dictionnaire des codes doit être archivé à chaque millésime. Un code identique ne doit
pas être supposé stable sans contrôle.

Livrable :
`data/reference/local-tax-options-2026.json`.

## 5. Situation mensuelle comptable des collectivités locales

Source générale :
[Situation mensuelle comptable des collectivités locales](https://www.collectivites-locales.gouv.fr/etudes-et-statistiques/acces-aux-statistiques-par-thematique/budget/situation-mensuelle-comptable-des-collectivites-locales-smcl).

Dernière publication vérifiée :
[Situation au 31 juillet 2026](https://www.collectivites-locales.gouv.fr/actualites/situation-mensuelle-comptable-des-collectivites-locales-au-31-juillet-2026).

Données associées :
[classeur de la SMCL n° 46](https://www.impots.gouv.fr/sites/default/files/media/9_statistiques/data_colloc/smcl/46/graphiques_smcl_46.xlsx).

La DGFiP centralise les balances dont elle dispose et publie une lecture mensuelle des
budgets principaux des communes, EPCI à fiscalité propre, départements et régions. Les
postes comprennent notamment les impôts locaux, les fractions de TVA et les droits de
mutation.

### Utilité

La SMCL permet de détecter :

- un changement important de produit avant la clôture annuelle ;
- une rupture entre niveaux de collectivités ;
- une évolution des fractions de TVA ;
- un retournement des DMTO ;
- un écart à analyser ensuite dans les balances détaillées.

Elle permet donc un contrôle fréquent entre deux millésimes du REI ou des comptes
annuels.

### Précautions

La publication avertit explicitement que les situations précoces sont affectées par les
rythmes d’enregistrement et les pratiques locales. Les données peuvent en outre être
cumulatives.

Avant ingestion, il faut déterminer pour chaque série :

- stock ou flux ;
- valeur du mois ou cumul depuis janvier ;
- champ des budgets ;
- millésime comptable ;
- date d’arrêté ;
- niveau de collectivité ;
- compte ou agrégat.

Les fractions de TVA reçues par les collectivités sont des affectations d’une taxe
nationale, pas des taxes locales nouvelles.

Livrable :
`data/reference/smcl-local-tax-aggregates.json`.

## 6. Composition des EPCI : la table de jointure territoriale

Source officielle :
[Liste et composition des EPCI à fiscalité propre](https://www.collectivites-locales.gouv.fr/etudes-et-statistiques/acces-aux-statistiques-par-thematique/perimetre-des-intercommunalites/liste-et-composition-des-epci-fiscalite-propre).

Fichiers 2026 :

- [composition communale des EPCI](https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/DESL/2026/EPCI/epcicom2026.xlsx) ;
- [liste des EPCI](https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/DESL/2026/EPCI/epcisanscom2026.xlsx).

La page renvoie également vers BANATIC pour les informations de périmètre et publie des
archives annuelles.

Cette source ne contient aucun prélèvement. Elle est néanmoins indispensable pour éviter
les erreurs de rapprochement des sources locales.

### Usages

- relier une commune à son EPCI à une date ;
- regrouper des lignes communales relevant d’une même autorité ;
- normaliser le SIREN et la catégorie d’un EPCI ;
- comprendre une rupture de série due à une fusion ou une extension ;
- éviter de compter une recette intercommunale comme une recette communale.

### Règle de temporalité

Une photographie au 1er janvier n’établit pas à elle seule toutes les dates de modification
en cours d’année. La clé doit inclure une date de référence et l’historique doit conserver
les fusions, retraits, extensions et communes isolées.

Livrable :
`data/reference/epci-composition-2026.json`.

## 7. SDES : près de quarante taxes environnementales

Source :
[La fiscalité environnementale en France — état des connaissances en 2025](https://www.statistiques.developpement-durable.gouv.fr/la-fiscalite-environnementale-en-france-etat-des-connaissances-en-2025).

Données :
[classeur associé](https://www.statistiques.developpement-durable.gouv.fr/media/8979/download?inline=).

La publication du 1er février 2026 recense près d’une quarantaine d’impôts portant sur des
produits ou activités nuisibles à l’environnement. Elle indique un total de 50 milliards
d’euros en 2023 et répartit les taxes entre :

- énergie ;
- transport ;
- pollution ;
- ressources.

Elle traite aussi des agents économiques financeurs et mobilise les conventions
d’Eurostat. La publication inclut les accises, les redevances des agences de l’eau et
d’autres taxes hors accise.

### Pourquoi cette source est complémentaire de la NTL

La NTL fournit pour chaque ligne française un code environnemental et des recettes
historiques. Le SDES apporte :

- une sélection nationale explicitement commentée ;
- des catégories environnementales ;
- des répartitions par financeur ou activité ;
- des explications sur les changements de périmètre ;
- un classeur associé plus facile à exploiter que les seuls graphiques.

Le rapprochement doit identifier :

```text
ligne SDES
    ↔ ligne NTL
    ↔ base juridique
    ↔ bénéficiaire
    ↔ recette et millésime
```

### Définition à ne pas confondre

Une taxe est qualifiée d’environnementale lorsque son assiette est une unité physique, ou
une approximation d’unité physique, ayant un impact négatif spécifique sur
environnement. Cette définition ne dépend pas de l’intention affichée par le législateur.

Par conséquent :

- une taxe peut être environnementale statistiquement sans avoir une finalité écologique
  dans son texte ;
- une taxe à finalité écologique peut être hors de cette définition si son assiette ne
  répond pas au critère ;
- une redevance incluse dans la publication doit encore être testée au regard du périmètre
  des prélèvements obligatoires du projet.

### Première ingestion proposée

Livrable :
`data/reference/sdes-environmental-taxes-2023.json`.

Il faut d’abord profiler les feuilles et distinguer :

- taxe individuelle ;
- sous-total ;
- total ;
- série historique ;
- financeur ;
- activité économique ;
- tarif effectif du carbone.

Les ventilations ne doivent jamais être additionnées aux totaux dont elles constituent la
répartition.

## 8. Insee : comptes 2025 des administrations publiques

Source :
[Dépenses et recettes des administrations publiques en 2025](https://www.insee.fr/fr/statistiques/8988845?sommaire=8988934).

La publication est datée du 28 août 2026 et utilise la base 2020. Elle fournit une suite de
tableaux XLSX :

- S.13 dans son ensemble ;
- administration centrale ;
- État ;
- ODAC ;
- administrations locales ;
- collectivités locales et niveaux territoriaux ;
- ODAL ;
- administrations de sécurité sociale ;
- régimes d’assurance sociale ;
- organismes dépendant des assurances sociales ;
- tous les sous-secteurs ;
- prélèvements obligatoires ;
- principaux impôts par catégorie.

Fichiers à ingérer en premier :

- [3.201 — administrations publiques S.13](https://www.insee.fr/fr/statistiques/fichier/8988845/t_3201_fr.xlsx) ;
- [3.212 — administrations de sécurité sociale S.1314](https://www.insee.fr/fr/statistiques/fichier/8988845/t_3212_fr.xlsx) ;
- [3.216 — prélèvements obligatoires](https://www.insee.fr/fr/statistiques/fichier/8988845/t_3216_fr.xlsx) ;
- [3.217 — principaux impôts par catégorie](https://www.insee.fr/fr/statistiques/fichier/8988845/t_3217_fr.xlsx).

### Apport

Cette suite est plus utile qu’un seul total annuel. Elle permet de tester simultanément :

- les recettes par sous-secteur bénéficiaire ;
- les opérations SEC ;
- les grandes catégories d’impôts ;
- les prélèvements des institutions européennes ;
- la cohérence du champ social ;
- les révisions entre publications.

### Limites

Les tableaux restent agrégés. Ils ne peuvent pas répartir un écart entre les 371 fiches.
L’Insee précise également que les comptes simplifiés conservent certains flux imputés,
notamment les cotisations sociales imputées et les crédits d’impôt restituables.

Le modèle doit donc conserver :

```json
{
  "base": "2020",
  "table": "3.216",
  "publication_date": "2026-08-28",
  "year": 2025,
  "sector": "S.13",
  "transaction": null,
  "amount": null,
  "unit": "EUR billion",
  "data_status": "source_status"
}
```

Le statut provisoire, semi-définitif ou révisé ne doit jamais être perdu.

Livrable :
`data/reference/insee-apu-accounts-2025.json`.

## 9. Listes ODAC et ODAL : contrôler les bénéficiaires

Sources Insee :

- [liste des ODAC, référence 2024, publiée en mai 2026](https://www.insee.fr/fr/statistiques/fichier/8988934/Liste_ODAC_SD2024.pdf) ;
- [liste des ODAL, référence 2024, publiée en mai 2026](https://www.insee.fr/fr/statistiques/fichier/8988934/Liste_ODAL_SD2024.pdf).

La liste des ODAC contient environ 700 organismes classés par fonction. Elle comprend de
nombreux bénéficiaires ou organismes liés à des taxes affectées. Le document ODAL présente
surtout les catégories et effectifs des unités des administrations publiques locales,
parmi lesquelles figurent notamment les organismes consulaires, agences de l’eau et
autorités de transport.

### Usage pour l’article 135

Le futur rapprochement peut suivre cette séquence :

```text
bénéficiaire publié dans l’article 135
    → nom normalisé et sigles
    → candidat dans la liste ODAC
    → secteur S.13112 à la date de référence 2024
    → contrôle du maintien, de la fusion ou du reclassement en 2026
```

Cette méthode permet de réduire le nombre de recherches individuelles tout en évitant de
supposer qu’un établissement public appartient nécessairement à S.13.

### Limites structurelles

- les SIREN ne sont pas systématiquement fournis ;
- les noms et sigles peuvent être ambigus ;
- la liste ODAL n’est pas une liste nominative exhaustive de toutes les unités ;
- les fichiers portent sur la classification 2024 ;
- les collectivités S.13131 et les administrations de sécurité sociale S.1314 exigent
  d’autres référentiels.

Le statut proposé reste donc `candidate`. La première extraction doit porter sur les ODAC,
avec revue humaine des homonymes et recherche séparée des identifiants institutionnels.

Livrable :
`data/reference/insee-odac-2024.json`.

## Nouvelle matrice de preuve

Une fiche de prélèvement devrait désormais indiquer quelle couche de source établit chaque
information.

| Couche | Question | Exemples de sources |
| --- | --- | --- |
| Juridique | La créance existe-t-elle et à quelles dates ? | LEGI, JORF, lois financières |
| Doctrinale | Comment l’administration interprète-t-elle la règle ? | BOFiP, BOSS |
| Déclarative | Comment est-elle codée et recouvrée ? | CTP, DSN |
| Territoriale | Où et selon quelle option s’applique-t-elle ? | taux locaux, délibérations, DELTA, VM |
| Administrative | Quel montant est déclaré, dû ou encaissé ? | DGFiP, Urssaf, Unédic |
| Budgétaire | Quelle recette est exécutée, révisée ou prévue ? | Voies et moyens, PLFSS, PLACSS |
| Comptable | Dans quel compte ou organisme le produit est-il enregistré ? | balances État/locales, comptes sociaux |
| Statistique | Est-elle dans le champ des PO et sous quel code ? | NTL, Insee, Eurostat |
| Bénéficiaire | L’entité receveuse appartient-elle à S.13 ? | ODAC, ODAL, EPCI, comptes par secteur |

Aucune couche ne doit écraser les autres. La même valeur peut être différente selon la
convention : montant dû, recette brute, recette nette, recette budgétaire et recette SEC.

## Référentiel composite des bénéficiaires

Cette passe confirme qu’aucune source unique ne fournit toutes les unités S.13 avec un
identifiant stable et leurs dates de classement. Il faudra construire un référentiel
composite.

Schéma minimal :

```json
{
  "beneficiary_id": "internal-stable-id",
  "published_name": "Nom dans la source",
  "normalized_name": "nom normalise",
  "siren": null,
  "sector": "S.13112",
  "valid_from": null,
  "valid_to": null,
  "classification_year": 2024,
  "source_id": "insee-odac-odal-2024",
  "locator": "page ou ligne",
  "confidence": "reviewed"
}
```

Les sources possibles du composite sont :

- ODAC et ODAL pour le classement ;
- listes et compositions EPCI pour les bénéficiaires intercommunaux ;
- SIRENE pour les identifiants, sans en déduire le secteur SEC ;
- article 135 et annexes financières pour les noms publiés ;
- comptes annuels pour le maintien d’une activité ou d’un périmètre ;
- textes de fusion, suppression ou changement de nom.

## Résultats négatifs à conserver

### Pas de répertoire unifié des bénéficiaires S.13

Les listes et comptes couvrent plusieurs sous-secteurs, mais aucun fichier public unique
avec identifiant, nom, dates et secteur SEC de toutes les unités n’a été identifié pendant
cette passe.

### Pas de jeu national détaillé sur les taxes d’assurance

Aucun jeu officiel structuré donnant simultanément les catégories de contrats, assiettes,
taux, recettes et bénéficiaires des taxes sur les conventions d’assurance n’a été trouvé.
Ce champ reste couvert par les sources DGFiP agrégées, la NTL, les Voies et moyens, le
BOFiP et les textes.

### Pas de jointure directe décisions locales-produits

Les taux et délibérations décrivent les règles locales. Le REI, la SMCL et les balances
décrivent des produits ou comptes. Aucune table prête à l’emploi ne relie chaque option à
son coût ou produit observé.

### Identifiants incomplets des ODAC et ODAL

Le rapprochement nominatif ne doit pas être publié comme certitude en l’absence d’un
identifiant contrôlé.

### Couverture sectorielle encore hétérogène

Les taxes culturelles, certaines contributions d’assurance et plusieurs prélèvements de
transport disposent de sources par organisme ou par rapport, mais aucun jeu transversal
homogène n’a été identifié au niveau créance, assiette, recette et bénéficiaire.

## Ordre d’ingestion recommandé

### Lot 1 — PLACSS 2025

Objectif : obtenir les ressources observées du dernier exercice social clos.

Livrables :

- manifeste des classeurs ;
- feuilles de financement normalisées ;
- catégories de contributions ;
- mesures d’exonération liées aux prélèvements ;
- comptes Unédic et retraites complémentaires ;
- comptes des fonds avec statut des données.

### Lot 2 — fiscalité environnementale SDES

Objectif : mesurer en une passe la couverture des familles énergie, transport, pollution
et ressources.

Livrables :

- liste exacte des taxes et agrégats ;
- recettes par millésime ;
- catégories environnementales ;
- financeurs séparés des totaux ;
- rapprochement avec la NTL ;
- file de revue des redevances ou agrégats incertains.

### Lot 3 — taux et décisions locales 2026

Objectif : créer une dimension territoriale réutilisable pour les quatre grandes taxes
directes locales.

Livrables :

- taux communes ;
- taux EPCI ;
- délibérations hors taux ;
- dictionnaire d’options ;
- composition EPCI ;
- intervalles d’application ;
- rapport des identifiants manquants ou contradictoires.

### Lot 4 — Unédic

Objectif : disposer d’une série propre du financement de l’assurance chômage depuis 2011.

Livrables :

- extraction des recettes et dépenses ;
- distinction contributions / CSG affectée / autres produits ;
- statut observation-prévision ;
- rapprochement avec le PLACSS, la DREES et l’Insee.

### Lot 5 — comptes Insee 2025

Objectif : actualiser les contrôles macroéconomiques et sectoriels.

Livrables :

- tableaux 3.201, 3.212, 3.216 et 3.217 ;
- conservation de la base et de la date de publication ;
- contrôles NTL et Eurostat ;
- suivi des révisions.

### Lot 6 — SMCL

Objectif : mettre en place un signal mensuel sur les recettes locales sans le confondre
avec la clôture annuelle.

### Lot 7 — bénéficiaires ODAC

Objectif : préclasser les bénéficiaires des taxes affectées et réserver la revue humaine
aux correspondances ambiguës ou obsolètes.

## Règles supplémentaires anti-inférence

1. **Compte social n’est pas créance juridique.**
2. **Exonération n’est pas prélèvement.**
3. **Compensation n’est pas recette de la créance exonérée.**
4. **CSG affectée n’est pas nouvelle contribution.**
5. **Taux voté n’est pas produit.**
6. **Option locale n’est pas taxe locale nouvelle.**
7. **Ligne territoriale n’est pas unité juridique.**
8. **Situation mensuelle n’est pas clôture annuelle.**
9. **Fraction de TVA reçue n’est pas impôt local autonome.**
10. **Taxe environnementale statistique n’est pas nécessairement taxe écologique juridique.**
11. **Ventilation par financeur n’est pas montant supplémentaire.**
12. **Agrégat Insee ne doit pas être ventilé pour équilibrer les fiches.**
13. **Présence dans ODAC ou ODAL est datée du millésime de classification.**
14. **Nom proche sans identifiant n’est qu’un candidat de bénéficiaire.**
15. **Une source annuelle ne permet pas de déduire seule les changements infra-annuels.**

## Décision recommandée pour l’issue #36

Le prochain travail à plus fort rendement est l’ingestion du **PLACSS 2025**, car il
fournit le maillon observé qui manquait entre les prévisions du PLFSS et les statistiques
plus anciennes ou plus agrégées.

Le deuxième chantier doit être le classeur du **SDES**, qui peut produire immédiatement
une liste de contrôle de près de quarante taxes environnementales et leurs correspondances
avec la NTL.

Le troisième chantier doit regrouper les quatre fichiers de **taux et délibérations
locales 2026** avec la composition EPCI. Cette architecture pourra ensuite être réutilisée
pour la taxe de séjour, le versement mobilité, la taxe d’aménagement et les autres familles
territoriales déjà documentées.

Cette séquence couvre simultanément les trois grands retards du projet : recettes sociales
observées, inventaire environnemental et applicabilité territoriale. Elle doit précéder un
nouveau lot de vérifications individuelles.
