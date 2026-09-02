# Troisième recherche complémentaire sur les sources massives

Date de vérification : **2 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète :

- [`sources-massives-prelevements-obligatoires.md`](sources-massives-prelevements-obligatoires.md) ;
- [`sources-massives-recherche-complementaire.md`](sources-massives-recherche-complementaire.md).

Le registre structuré de cette passe est
[`data/reference/bulk-sources-supplement-2-2026-09-02.json`](../data/reference/bulk-sources-supplement-2-2026-09-02.json).

## Résultat principal

La recherche confirme qu’il existe encore plusieurs référentiels permettant de remplacer
des centaines de vérifications territoriales ou périodiques par une ingestion unique.
Les gains les plus importants de cette passe sont :

1. deux classeurs DGFiP de **recettes fiscales brutes**, annuelles depuis 2010 et
   mensuelles depuis 2012 ;
2. des tableaux DGFiP détaillés par impôt, comprenant assiettes, déclarants, quantités,
   taux, montants dus ou montants nets selon la série ;
3. le référentiel national **DELTA de taxe de séjour**, qui couvre les communes, les
   catégories d’hébergement, les régimes et les taxes additionnelles ;
4. la table Urssaf des taux de **versement mobilité, versement mobilité additionnel et
   versement mobilité régional et rural** par commune et date d’effet ;
5. le référentiel DELTA des délibérations de **taxe d’aménagement** ;
6. les tableaux mensuels des taux et options départementales des **droits de mutation à
   titre onéreux** ;
7. l’archive globale et les flux quotidiens du **Journal officiel** ;
8. les codes sources officiels des principaux calculateurs fiscaux ;
9. le classeur national de financement et de cotisations de la **MSA**.

Ces sources couvrent quatre dimensions encore insuffisamment industrialisées :

- les recettes administratives réellement constatées ;
- l’applicabilité territoriale et les taux locaux ;
- les textes non codifiés et les arrêtés de paramètres ;
- le régime agricole.

## Priorité révisée

| Priorité | Source | Apport principal | Première limite |
| --- | --- | --- | --- |
| 1 | DGFiP — recettes fiscales brutes | recettes nationales observées, annuelles et mensuelles | brut administratif, différent du budget et du SEC |
| 1 | DGFiP — tableaux détaillés par impôt | assiettes, déclarants, quantités et montants dus | schémas et sémantiques variables |
| 1 | DELTA — taxe de séjour | couverture communale, tarifs et taxes additionnelles | aucun encaissement publié |
| 1 | Urssaf — VM, VMA et VMRR | taux territoriaux et dates d’effet | une ligne communale n’est pas un prélèvement |
| 1 | DILA — JORF en masse | textes non codifiés, publication et dispositions transitoires | snapshot ancien à compléter par les flux |
| 2 | DELTA — taxe d’aménagement | délibérations, zones et taux locaux | aucun produit liquidé ou encaissé |
| 2 | DGFiP — DMTO | taux, abattements et exonérations par département | tableaux PDF, sans assiette ni recette |
| 2 | DGFiP — codes sources fiscaux | formules et paramètres officiels de calcul | mise en œuvre administrative, pas source normative |
| 3 | MSA — chiffres utiles 2026 | contrôle agrégé du financement agricole | aucun détail par contribution juridique |

## 1. Recettes fiscales brutes DGFiP

Source officielle :
[Recettes fiscales](https://www.impots.gouv.fr/recettes-fiscales).

La page du Département des études et statistiques fiscales publie :

- les recettes fiscales brutes annuelles, en récapitulation nationale détaillée depuis
  2010 ;
- les recettes fiscales brutes mensuelles, en récapitulation nationale détaillée depuis
  2012 ;
- un lexique, des abréviations et un calendrier de publication ;
- l’ancien annuaire statistique couvrant notamment la période 2004-2019.

Les deux séries sont disponibles en XLS. Lors de la vérification, la série annuelle était
indiquée comme mise à jour le 10 mars 2026 et la série mensuelle le 11 août 2026.

### Pourquoi cette source est prioritaire

Le projet dispose déjà de montants issus des Voies et moyens, des balances de l’État et
de la NTL. Ces sources répondent à des conventions différentes :

- les Voies et moyens décrivent l’exécution budgétaire et les prévisions ;
- les balances décrivent les mouvements et soldes comptables ;
- la NTL décrit les recettes en comptabilité nationale ;
- les tableaux de recettes fiscales brutes décrivent la collecte administrative avant
  certains retraitements.

Leur intérêt n’est pas de remplacer ces autres séries, mais de fournir un quatrième point
de contrôle, disponible mensuellement et sur une longue période.

### Modèle minimal d’extraction

```json
{
  "source_id": "dgfip-gross-tax-receipts",
  "series": "monthly",
  "raw_line_name": "Libellé publié",
  "period": "2026-07",
  "amount": 0,
  "amount_kind": "gross_administrative_receipt",
  "unit": "source_unit",
  "sheet": "Feuille source",
  "source_row": 0
}
```

### Contrôles requis

- inventorier les feuilles, années et unités avant toute conversion ;
- distinguer le cumul annuel d’une observation mensuelle ;
- préserver les anciennes appellations ;
- détecter les changements de périmètre et de présentation ;
- ne pas soustraire automatiquement remboursements ou dégrèvements absents du fichier ;
- expliquer les écarts avec les recettes budgétaires nettes et les comptes nationaux au
  lieu de les répartir entre fiches.

Livrable recommandé :
`data/reference/dgfip-gross-tax-receipts.json`.

## 2. Tableaux DGFiP détaillés par impôt

Sources principales :

- [Tableaux statistiques DGFiP](https://www.data.gouv.fr/datasets/tableaux-statistiques-de-la-direction-generale-des-finances-publiques-dgfip) ;
- [TVA et taxe sur les salaires](https://www.impots.gouv.fr/taxe-sur-la-valeur-ajoutee-et-taxe-sur-les-salaires) ;
- [TGAP et accises sur les énergies](https://www.impots.gouv.fr/taxe-generale-sur-les-activites-polluantes-et-accises-sur-les-energies).

Le catalogue historique recense les principales données relatives aux fiscalités
personnelle, professionnelle et directe locale. La collection a été refondue à compter
de 2022. Les pages courantes d’impots.gouv.fr donnent accès à des classeurs plus récents,
parfois mis à jour selon un calendrier propre à chaque impôt.

### Familles particulièrement utiles

| Famille | Dimensions publiées |
| --- | --- |
| TVA | déclarants, assiette et taxe par secteur et taux |
| Taxe sur les salaires | déclarants, assiette, taxe brute, taxe nette et taux |
| Impôt sur les sociétés | bénéfice fiscal, IS brut et net, taille, secteur et chiffre d’affaires |
| Impôt sur le revenu | foyers, montants, tranches, catégories de revenus, réductions et crédits |
| CFE, IFER et CVAE | données territoriales, sectorielles et bénéficiaires locaux |
| TGAP | déclarants, quantités et montants dus depuis 2020 |
| Accises énergétiques | déclarants, quantités, taux et montants dus depuis 2022 |
| IFI et ancien ISF | montants et répartitions nationales ou locales |

La page consacrée à la TGAP et aux accises publie séparément :

- la TGAP ;
- les accises sur l’électricité, le gaz naturel et le charbon ;
- l’accise sur l’électricité ;
- l’accise sur les gaz naturels ;
- l’accise sur les charbons.

Cette granularité réduit fortement la lacune signalée lors de la passe précédente sur les
accises : il existe bien des fichiers administratifs structurés pour plusieurs familles
énergétiques, même si toutes les accises ne sont pas nécessairement couvertes.

### Règle de modélisation

Les champs suivants doivent rester distincts :

- `amount_due` ;
- `gross_tax` ;
- `net_tax` ;
- `gross_receipt` ;
- `budget_revenue` ;
- `national_accounts_revenue`.

Une série portant sur des déclarants ou des montants dus ne doit jamais être présentée
comme une série d’encaissements.

### Première ingestion proposée

Créer un manifeste indiquant pour chaque classeur :

- l’impôt ;
- l’URL réelle ;
- la date de publication ;
- le millésime couvert ;
- les feuilles ;
- l’unité ;
- le type de montant ;
- les dimensions ;
- l’empreinte ;
- la correspondance éventuelle avec l’ancien annuaire.

Les quatre premiers fichiers à extraire devraient être la TVA, la taxe sur les salaires,
la TGAP et les accises énergétiques.

## 3. DELTA — taxe de séjour

Source officielle :
[Tarifs de taxe de séjour — DELTA à partir de 2024](https://www.data.gouv.fr/datasets/tarifs-taxe-de-sejour-delta-a-partir-de-2024).

Le jeu publie les éléments transmis par les communes ou EPCI :

- régime réel ou forfaitaire ;
- tarifs par nature et catégorie d’hébergement ;
- périodes de perception ;
- loyer minimum ;
- abattements éventuels du régime forfaitaire ;
- taxe additionnelle départementale ;
- taxes additionnelles réglementaires ou territoriales ;
- tarif total.

Les données sont disponibles en CSV et JSON. Un fichier XML est aussi publié pour les
opérateurs numériques. Le jeu doit être publié annuellement pour les tarifs de l’année N
et de l’année N+1.

### Valeur documentaire

Cette source permet de répondre en masse à trois questions :

1. la taxe de séjour s’applique-t-elle sur le territoire d’une commune donnée ?
2. quelle autorité a fixé le tarif et selon quel régime ?
3. quelles taxes additionnelles s’ajoutent au tarif de base ?

Elle permet aussi de repérer plusieurs prélèvements additionnels qui risqueraient d’être
masqués dans un simple tarif total :

- taxe additionnelle départementale ;
- taxe additionnelle au profit d’Île-de-France Mobilités ;
- taxe liée à la Société des grands projets ;
- taxes liées à certaines lignes à grande vitesse.

### Précautions

- une commune et une catégorie d’hébergement ne créent pas une nouvelle taxe ;
- le tarif total ne doit pas être additionné aux composantes qui le forment ;
- l’absence d’une nouvelle délibération peut entraîner la reconduction du tarif antérieur ;
- le jeu ne contient ni nombre de nuitées, ni déclarations, ni encaissements ;
- chaque taxe additionnelle doit conserver sa propre base juridique et son bénéficiaire.

Livrable recommandé :
`data/reference/tourist-tax-rates-and-additions.json`.

## 4. Urssaf — taux de VM, VMA et VMRR

Source officielle :
[Table des taux VM, VMA et VMRR](https://www.data.gouv.fr/datasets/table-taux-vm-vma-vmrr).

Le jeu recense, par commune et date d’effet :

- le versement mobilité ;
- le versement mobilité additionnel ;
- le versement mobilité régional et rural.

Il est diffusé en CSV et JSON et provient du portail Open Urssaf. Lors de la vérification,
sa dernière mise à jour était datée du 23 juillet 2026.

### Apport

Cette table permet d’éviter la consultation individuelle des délibérations pour déterminer
les taux appliqués en paie. Elle complète la table historique CTP :

- la table CTP identifie les codes opérationnels de déclaration ;
- la table des taux identifie le territoire, le type de versement, la date et le taux ;
- les textes et délibérations établissent la base juridique ;
- les comptes Urssaf, budgétaires ou statistiques apportent les montants.

### Granularité correcte

La future entité canonique ne doit pas être la ligne communale. Plusieurs communes peuvent
partager une autorité, une période et un taux. Le modèle doit donc séparer :

- la contribution juridique ;
- l’autorité organisatrice ou bénéficiaire ;
- le territoire d’application ;
- l’intervalle de validité ;
- le taux ;
- le code de déclaration.

Les VM, VMA et VMRR doivent rester trois familles distinctes tant qu’une source juridique
ne démontre pas une relation plus précise.

Livrable recommandé :
`data/reference/mobility-contribution-rates.json`.

## 5. JORF en masse

Source officielle :
[Répertoire open data JORF](https://echanges.dila.gouv.fr/OPENDATA/JORF/).

La DILA publie :

- une archive globale ;
- des fichiers de mise à jour quotidiens ;
- une documentation des métadonnées ;
- une présentation du corpus.

Lors de la vérification, l’archive globale visible était
`Freemium_jorf_global_20250713-140000.tar.gz`, d’une taille indiquée de 1,6 Gio. Les flux
allaient jusqu’à `JORF_20260902-210756.tar.gz`.

### Pourquoi JORF complète LEGI

LEGI répond principalement à la question : « quelle version consolidée de cet article
était en vigueur à cette date ? »

JORF répond notamment aux questions suivantes :

- dans quel texte et à quelle date la mesure a-t-elle été publiée ?
- existe-t-il un arrêté annuel fixant un taux, un tarif ou une répartition ?
- une disposition non codifiée crée-t-elle ou modifie-t-elle un prélèvement ?
- quelles mesures transitoires accompagnent une réforme ?
- quel texte a remplacé une ancienne référence ?

La recherche doit viser en priorité :

- lois de finances et de financement de la sécurité sociale ;
- décrets et arrêtés cités dans les fiches ;
- arrêtés fixant des taux, coefficients, plafonds ou répartitions ;
- textes contenant les anciennes appellations du brouillon ;
- dispositions d’entrée en vigueur ou de suppression.

### Difficulté technique

Le snapshot observé n’est pas courant. Il faut rejouer plus d’un an de flux quotidiens.
Le prototype doit donc garantir :

- l’ordre strict d’application ;
- la détection des fichiers manquants ;
- l’idempotence ;
- un journal de traitement ;
- la conservation de chaque archive et de son empreinte ;
- la capacité à reconstruire l’index à partir de zéro.

Il serait inutile d’indexer tout le texte avant d’avoir validé ce mécanisme sur les textes
cités par les 371 lignes.

## 6. DELTA — taxe d’aménagement

Source officielle :
[Taxe d’aménagement — éléments de taxation votés par les collectivités à partir de 2022](https://data.economie.gouv.fr/explore/assets/delta_deliberation_tam_17_01_23/).

Ce jeu apporte les délibérations et éléments territoriaux nécessaires pour déterminer
les taux et zones applicables. Il est exploitable en masse via le portail de données du
ministère.

### Ce qu’il permet

- inventorier les collectivités ayant institué ou modifié la taxe ;
- reconstruire les taux par zone et année ;
- repérer les exonérations ou ajustements publiés ;
- distinguer les parts territoriales ;
- contrôler l’applicabilité d’une fiche locale.

### Ce qu’il ne permet pas

- connaître le nombre d’autorisations d’urbanisme ;
- connaître la surface ou valeur taxable ;
- connaître les liquidations et recouvrements ;
- déduire une recette à partir du taux ;
- confondre plusieurs zones d’une collectivité avec plusieurs prélèvements.

Le rapprochement devra aussi distinguer la taxe d’aménagement des prélèvements liés à
l’archéologie préventive, même lorsqu’ils apparaissent dans un même processus déclaratif
ou de recouvrement.

Livrable recommandé :
`data/reference/development-tax-deliberations.json`.

## 7. Tarifs mensuels des DMTO

Source officielle :
[Droits d’enregistrement](https://www.impots.gouv.fr/droits-denregistrement).

La DGFiP publie des tableaux recensant :

- les tarifs des droits d’enregistrement et de la taxe de publicité foncière ;
- les abattements ;
- les réductions ;
- les exonérations ;
- les options applicables à la taxe communale additionnelle.

Lors de la vérification, six instantanés 2026 étaient disponibles, du 1er janvier au
1er juin.

### Méthode d’exploitation

Les tableaux étant en PDF, chaque extraction doit conserver :

- la date de l’instantané ;
- le département ;
- l’article ou l’option ;
- le taux ou avantage ;
- le texte brut ;
- le numéro de page ;
- la méthode de contrôle visuel.

Chaque nouveau fichier doit être comparé au précédent pour produire uniquement les
changements de taux ou d’option.

### Limites

Cette série ne donne pas les assiettes, mutations ou recettes. Elle couvre principalement
les mutations à titre onéreux et ne doit pas être étendue aux successions, donations et
autres droits d’enregistrement sans source distincte.

Livrable recommandé :
`data/reference/dmto-rates-2026.json`.

## 8. Codes sources des calculateurs fiscaux

Source officielle :
[Ouverture des données publiques de la DGFiP](https://www.impots.gouv.fr/ouverture-des-donnees-publiques-de-la-dgfip).

La DGFiP répertorie des codes ou algorithmes pour :

- l’impôt sur le revenu et le prélèvement à la source ;
- l’ancien ISF et l’IFI ;
- la CFE ;
- l’IFER ;
- la CVAE ;
- l’impôt sur les sociétés ;
- la taxe d’habitation ;
- la taxe foncière.

La page indique explicitement des séries de millésimes pour l’IR/PAS, l’ISF et l’IFI.
Les sources locales exposées pour la taxe d’habitation et la taxe foncière concernent en
partie le millésime 2020.

### Utilité correcte

Ces dépôts peuvent :

- confirmer la structure d’une formule complexe ;
- retrouver le nom d’un paramètre ;
- suivre un changement de calcul entre millésimes ;
- générer des tests de régression ;
- retrouver des alias techniques ;
- contrôler qu’une documentation humaine n’a pas omis une branche de calcul.

Ils ne peuvent pas établir seuls :

- la base juridique ;
- la vigueur au 2 septembre 2026 ;
- l’exhaustivité des cas rares ;
- la recette ;
- le bénéficiaire ;
- le classement SEC.

La provenance doit toujours inclure le dépôt, le commit ou la release, le chemin du
fichier et le millésime fiscal.

## 9. MSA — données nationales 2026

Source officielle :
[Chiffres utiles — édition nationale 2026](https://statistiques.msa.fr/publication/chiffres-utiles-edition-nationale-2026/).

La MSA publie un PDF et les données associées en XLSX pour les millésimes 2024 et 2025.
Le panorama couvre la démographie, les prestations, le financement et les cotisations du
régime agricole.

La publication indique pour 2025 près de 11,5 milliards d’euros de cotisations émises,
dont près de 2,8 milliards pour les non-salariés et plus de 8,7 milliards pour les
salariés agricoles.

### Sémantique à conserver

Le terme `cotisations émises` ne signifie pas `cotisations encaissées`. La publication
précise que le total comprend des montants :

- payés par les exploitants, entreprises ou salariés ;
- exonérés ;
- pris en charge par l’État ;
- compensés par des recettes fiscales.

Il faut donc conserver la définition source et ne pas rapprocher directement ce montant
des encaissements Urssaf ou des cotisations effectives de la NTL.

### Rôle

Cette source sert à :

- contrôler la couverture du régime agricole ;
- séparer salariés et non-salariés ;
- disposer d’un dénominateur de population ;
- vérifier les agrégats de financement avec la DREES et la LFSS ;
- repérer des familles qui nécessitent une recherche juridique plus fine.

Elle ne résout pas la lacune principale : aucune table publique historique équivalente
au référentiel CTP Urssaf n’a été identifiée pour la MSA.

Livrable recommandé :
`data/reference/msa-financing-aggregates-2024-2025.json`.

## Nouveau tableau de complémentarité

| Niveau | Sources de masse désormais identifiées |
| --- | --- |
| Droit consolidé | LEGI, API Légifrance |
| Publication et textes non codifiés | JORF en masse |
| Doctrine fiscale | BOFiP |
| Doctrine sociale | BOSS, sous réserve d’un accès massif stable |
| Déclaration sociale | CTP Urssaf, tables DSN, taux VM/VMA/VMRR |
| Délibérations locales | DELTA taxe de séjour, DELTA taxe d’aménagement, tableaux DMTO |
| Recettes administratives fiscales | recettes brutes DGFiP et tableaux détaillés par impôt |
| Comptabilité publique | balances de l’État et des collectivités |
| Budgets | Voies et moyens, article 135, annexes PLFSS |
| Comptabilité nationale | NTL, Eurostat `gov_10a_taxag`, Insee |
| Régime agricole | MSA, DREES, LFSS, DSN |

## Ordre d’ingestion proposé après cette passe

### Lot 1 — recettes fiscales brutes

Objectif : disposer d’une série observée mensuelle et annuelle avant de poursuivre le
rapprochement des montants.

Contrôles : schéma, unités, doublons, cumul, libellés et ruptures.

### Lot 2 — taxe de séjour

Objectif : documenter une famille locale complète, y compris ses taxes additionnelles,
sans recherche commune par commune.

Contrôles : reconduction des délibérations, absence territoriale, tarif total et
composantes.

### Lot 3 — versements mobilité

Objectif : reconstruire les taux et territoires du VM, VMA et VMRR à chaque date.

Contrôles : communes multiples, autorités, intervalles de validité et liens CTP.

### Lot 4 — statistiques détaillées par impôt

Objectif : ajouter les assiettes, déclarants, quantités et montants dus aux recettes déjà
collectées.

Premières familles : TVA, taxe sur les salaires, TGAP et accises énergétiques.

### Lot 5 — taxe d’aménagement

Objectif : reconstruire les délibérations et taux par zone depuis 2022.

### Lot 6 — prototype JORF

Objectif : valider l’application du snapshot et des flux sur un sous-ensemble de textes,
avant toute indexation générale.

### Lot 7 — DMTO

Objectif : produire une chronologie 2026 des taux, abattements et exonérations par
département.

### Lot 8 — calculateurs fiscaux et MSA

Objectif : préparer les tests de formules et renforcer le contrôle du régime agricole,
sans utiliser ces sources comme preuves uniques.

## Règles supplémentaires anti-inférence

1. **Recette brute n’est pas recette nette.**
2. **Montant dû n’est pas montant encaissé.**
3. **Cotisation émise n’est pas cotisation payée.**
4. **Délibération locale n’est pas recette.**
5. **Tarif total n’est pas une taxe supplémentaire.**
6. **Une ligne par commune n’est pas une créance par commune.**
7. **Une zone de taxe d’aménagement n’est pas un prélèvement autonome.**
8. **Un code source administratif n’est pas la loi.**
9. **JORF publié n’est pas droit consolidé.**
10. **Un snapshot ancien complété par des flux doit être auditable et reproductible.**
11. **Une statistique par taux ou secteur ne doit pas être additionnée sans vérifier que les catégories sont exclusives.**
12. **Les taxes additionnelles restent séparées du prélèvement de base.**

## Décision recommandée pour l’issue #36

La meilleure prochaine ingestion est désormais le couple :

1. **recettes fiscales brutes DGFiP** pour les montants administratifs observés ;
2. **taxe de séjour DELTA** pour démontrer le fonctionnement complet d’un référentiel
   territorial avec plusieurs taxes additionnelles.

Le premier chantier améliorera le rapprochement des recettes à l’échelle nationale. Le
second permettra de valider le modèle de granularité `prélèvement × bénéficiaire ×
territoire × période × taux` sur une famille locale particulièrement bien documentée.

Le versement mobilité et la taxe d’aménagement pourront réutiliser directement cette
architecture. Le prototype JORF viendra ensuite compléter l’infrastructure juridique
construite autour de LEGI et du BOFiP.
