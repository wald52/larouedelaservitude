# Huitième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète les sept passes précédentes. Le registre structuré associé est
[`data/reference/bulk-sources-supplement-7-2026-09-03.json`](../data/reference/bulk-sources-supplement-7-2026-09-03.json).

## Résultat principal

Cette passe ferme partiellement six angles encore mal couverts :

- les titres miniers et leurs titulaires ;
- les consommations territoriales d’électricité et de gaz ;
- les filières de responsabilité élargie des producteurs ;
- les paramètres et comptes des régimes complémentaires de retraite ;
- les activités culturelles liées à plusieurs taxes ou redevances ;
- les quantités de vin historiquement rattachées au droit de circulation.

Trois sources présentent un rendement documentaire particulièrement élevé :

1. **SYDEREP**, parce qu’il publie une liste nationale de producteurs et d’identifiants
   uniques, les adhérents des éco-organismes et plusieurs séries de quantités ;
2. **l’Agence ORE**, parce qu’elle diffuse en masse les consommations d’électricité et de
   gaz à cinq mailles territoriales ;
3. **Camino**, parce que son API GeoJSON rassemble les titres miniers, titulaires,
   substances, statuts, dates et périmètres.

Cette passe montre aussi que les sources massives doivent aider à **exclure** certains
objets autant qu’à découvrir des prélèvements. En particulier :

```text
obligation REP ou éco-contribution
    ≠ automatiquement prélèvement obligatoire

affiliation à un régime
    ≠ montant de cotisation observé

consommation physique
    ≠ quantité taxable

titre minier
    ≠ production ou redevance payée

activité culturelle
    ≠ assiette fiscale
```

## Matrice de complémentarité

| Famille | Référentiel de champ | Quantité ou activité | Paramètres | Produit ou contrôle |
| --- | --- | --- | --- | --- |
| Redevances minières | Camino, LEGI, JORF | volumes publiés ou statistiques minières à rechercher | textes et tarifs | comptes des bénéficiaires, budget, NTL |
| Accises énergétiques | CIBS, Douane | Agence ORE, statistiques DGFiP | tableaux douaniers énergétiques | recettes DGFiP, budget, NTL |
| Filières REP | SYDEREP | mises sur le marché et tonnages collectés | Code de l’environnement et décisions de filière | comptes ADEME, éco-organismes et bénéficiaires |
| Retraite complémentaire privée | Agirc-Arrco | entreprises et cotisants | taux, tranches et valeurs de point | compte de résultat, PLACSS, DREES, NTL |
| Retraite des agents publics | CNRACL, Ircantec | effectifs de cotisants et employeurs | textes et paramètres de régime | PLACSS, DREES et comptes des régimes |
| Culture | Chiffres clés du ministère et producteurs sectoriels | billetterie, diffusion, marché et fréquentation | CIBS, lois financières, textes sectoriels | CNC, CNM, ASTP, budget et NTL |
| Vins et cidres | Douane, catégories de produits | quantités soumises et sorties de chais | tarifs d’accise par campagne ou année | recettes douanières et budget |

Une source de la colonne « quantité ou activité » ne remplace jamais la colonne
« produit ». La matrice doit seulement faciliter les contrôles croisés.

## 1. Camino : un cadastre minier ouvert et interrogeable

Sources :

- [Camino](https://camino.beta.gouv.fr/) ;
- [documentation du flux GeoJSON](https://docs.camino.beta.gouv.fr/qgis/) ;
- [flux public des titres](https://api.camino.beta.gouv.fr/titres?format=geojson).

Camino est le cadastre numérique des titres miniers et autorisations. Sa documentation
indique que les flux sont générés par l’API REST et exposés au format GeoJSON.

Chaque titre public peut notamment comporter :

- un identifiant et un nom ;
- un type, une nature et un domaine minier ;
- un statut ;
- les dates de demande, de début et de fin ;
- la surface du périmètre ;
- les communes, départements et régions concernés ;
- les administrations concernées ;
- les titulaires et amodiataires avec leur SIREN ;
- un engagement financier ;
- les substances ;
- un volume ;
- la géométrie du périmètre.

Le flux accepte les mêmes paramètres de filtre que le site. Il est ainsi possible de
produire un snapshot national, puis des sous-ensembles par domaine, type et statut sans
interroger chaque fiche.

### Apport pour les prélèvements miniers

Camino peut résoudre en masse :

```text
titre ou autorisation
    → titulaire ou amodiataire
    → SIREN
    → substance
    → périmètre territorial
    → période de validité
    → bénéficiaire territorial candidat
    → famille de redevance minière candidate
```

Cette chaîne permettra de rechercher ensuite les tarifs, déclarations et recettes dans les
textes et les comptes, avec des identifiants stables.

### Couverture publique incomplète

La documentation précise que certains titres et autorisations ne sont accessibles qu’aux
utilisateurs authentifiés, via une route spécifique et un jeton. Le flux public ne doit
donc pas être présenté comme une liste exhaustive de tout le cadastre.

Un champ absent du GeoJSON ne doit pas être interprété comme une absence juridique. De
même, un titre disparu d’un snapshot peut avoir changé de statut, de visibilité ou de
périmètre.

### Ce que Camino ne prouve pas

- une extraction effective ;
- une quantité fiscalement retenue ;
- un tarif de redevance ;
- une déclaration ;
- un paiement ;
- une recette comptable ;
- le classement SEC du prélèvement ou du bénéficiaire.

Le champ `volume`, lorsqu’il existe, doit conserver sa définition source. Il ne doit pas
être multiplié automatiquement par un tarif.

### Première ingestion proposée

Livrable :
`data/reference/camino-mining-titles-snapshot.geojson`.

Le manifeste associé devra indiquer :

```json
{
  "endpoint": "https://api.camino.beta.gouv.fr/titres?format=geojson",
  "retrieved_at": "2026-09-03",
  "query_parameters": {},
  "feature_count": 0,
  "sha256": "…",
  "public_scope_only": true
}
```

Les titulaires devront ensuite être reliés à Sirene et les territoires au COG, sans
écraser les noms bruts publiés par Camino.

## 2. Agence ORE : consommations d’électricité et de gaz à cinq mailles

Source :
[open data de l’Agence ORE](https://www.agenceore.fr/opendata/recherche).

L’Agence ORE publie des jeux nationaux de consommation annuelle d’électricité et de gaz
aux mailles suivantes :

- IRIS ;
- commune ;
- EPCI ;
- département ;
- région.

Les séries courantes permettent d’étudier l’évolution de 2011 à 2024 selon :

- l’énergie ;
- le secteur d’activité ;
- la catégorie de consommation ;
- le code NAF ;
- le territoire ;
- la consommation ;
- le nombre de points de livraison.

Le catalogue contient également le référentiel des distributeurs d’électricité et de gaz
par commune et un historique des mises à jour des jeux.

### Volume et rendement potentiel

Les fichiers à la maille communale ou IRIS comportent plusieurs millions de lignes. Ils
permettent de remplacer une multitude de recherches locales par une seule extraction
versionnée.

Leur intérêt est particulièrement élevé pour :

- les accises sur l’électricité et les gaz naturels ;
- les taxes ou contributions liées aux réseaux ;
- les contrôles sectoriels par code NAF ;
- les comparaisons avec les recettes énergétiques de la NTL ;
- la répartition territoriale de la consommation ;
- l’identification du distributeur du réseau sur un territoire.

### Rupture méthodologique

L’Agence ORE a publié une nouvelle méthodologie pour les données de consommation annuelle.
Les anciens jeux, notamment ceux présentés comme allant jusqu’en 2021, ne sont plus
maintenus et renvoient vers les jeux courants.

Chaque observation doit donc porter :

```json
{
  "methodology_version": "current-or-legacy",
  "dataset_id": "stable-source-id",
  "year": 2024,
  "geographical_level": "COM",
  "geographical_code": "00000"
}
```

Une simple concaténation des anciennes et nouvelles séries pourrait créer une fausse
rupture ou un double compte.

### Ce que la consommation ORE ne prouve pas

- la quantité soumise à accise ;
- le redevable fiscal ;
- le tarif applicable ;
- les exemptions ou remboursements ;
- l’autoconsommation hors réseau ;
- le montant dû ou encaissé ;
- le millésime fiscal 2026.

Les données peuvent aussi être masquées ou agrégées pour respecter le secret commercial.
La somme des lignes détaillées ne doit pas être supposée égale au total sans contrôle des
résidus et des catégories protégées.

### Première ingestion proposée

Livrable :
`data/reference/ore-energy-consumption-manifest.json`.

Commencer par les jeux commune et EPCI, plus faciles à rapprocher du COG et de BANATIC.
L’IRIS pourra être ajouté lorsque la politique de secret et les changements de millésime
géographique auront été testés.

## 3. SYDEREP : producteurs, IDU et données des filières REP

Sources :

- [API des producteurs enregistrés](https://www.data.gouv.fr/dataservices/rep-liste-des-producteurs-enregistres-dans-syderep-avec-leur-identifiant-unique) ;
- [API Data Fair ADEME](https://data.ademe.fr/data-fair/api/v1/datasets/rep-producteurs-idu/) ;
- [adhérents des éco-organismes](https://www.data.gouv.fr/datasets/rep-liste-des-membres-adherents-des-eco-organismes-en-fin-dannee) ;
- [portail des filières REP](https://filieres-rep.ademe.fr/).

SYDEREP rassemble les registres des producteurs relevant des filières à responsabilité
élargie du producteur. La liste publique fournit leur identifiant unique, prévu par
l’article L. 541-10-13 du code de l’environnement.

Les filières mentionnées dans le jeu des producteurs comprennent notamment :

- articles de bricolage et de jardin ;
- articles de sport et de loisirs ;
- équipements électriques et électroniques ;
- bateaux et navires de plaisance ;
- dispositifs médicaux perforants ;
- éléments d’ameublement ;
- emballages ;
- jouets ;
- huiles et lubrifiants ;
- médicaments non utilisés ;
- piles et accumulateurs ;
- produits chimiques ;
- produits et matériaux de construction ;
- pneumatiques ;
- textiles ;
- tabacs.

L’ADEME publie aussi :

- les membres adhérents des éco-organismes, mis à jour annuellement ;
- les quantités mises sur le marché pour plusieurs filières ;
- les tonnages collectés ;
- certains indicateurs de performance.

### Pourquoi cette source est importante pour le périmètre

Le vocabulaire des filières REP utilise fréquemment les mots `redevance`, `contribution`,
`éco-contribution`, `obligation` et `sanction`. Ces termes peuvent être confondus avec des
prélèvements obligatoires alors que les mécanismes ont des natures différentes.

Le futur modèle doit permettre de classer :

```text
producteur REP
    ├── enregistrement et IDU
    ├── adhésion à un éco-organisme
    ├── contribution privée réglementée éventuelle
    ├── système individuel éventuel
    ├── redevance publique ADEME éventuelle
    ├── sanction éventuelle
    └── quantités et tonnages de filière
```

Une adhésion ou une éco-contribution privée ne doit pas être intégrée automatiquement à
l’inventaire des prélèvements obligatoires.

### Granularité

Une entreprise peut avoir plusieurs identifiants ou obligations selon les filières. Une
ligne `producteur` ne représente donc pas une créance unique.

Le schéma interne devra distinguer :

- l’identité de l’entreprise ;
- la filière ;
- l’IDU ;
- l’éco-organisme ;
- la période d’adhésion ;
- la quantité mise sur le marché ;
- le type d’obligation ;
- le bénéficiaire ;
- la preuve du classement public ou privé.

### Limites

- l’IDU ne prouve pas un paiement ;
- les unités et périodes diffèrent entre filières ;
- les données de marché sont agrégées ;
- le montant des contributions privées n’est pas nécessairement ouvert ;
- la redevance annuelle ADEME et les contributions d’éco-organisme ne doivent pas être
  fusionnées ;
- le classement SEC doit être recherché séparément.

### Première ingestion proposée

Livrable :
`data/reference/syderep-producers-and-rep-obligations.json`.

L’ingestion doit commencer par la liste des producteurs et des adhérents. Les séries de
quantités seront ajoutées par filière seulement après profilage de leurs unités et de leur
secret statistique.

## 4. Agirc-Arrco : paramètres courants et compte de résultat

Source :
[paramètres et chiffres du régime](https://www.agirc-arrco.fr/nous-connaitre/nos-etudes-et-publications/documentation-institutionnelle/parametres-et-donnees-statistiques/).

La page rassemble des éléments qui sont généralement dispersés entre barèmes et comptes :

- plafond de la Sécurité sociale et tranches de rémunération ;
- taux de cotisation de retraite ;
- contribution d’équilibre général ;
- contribution d’équilibre technique ;
- cotisation Apec recouvrée par les caisses ;
- prix d’achat et valeur de service du point ;
- compte de résultat du régime.

Pour 2026, les taux publiés comprennent notamment :

| Composante | Employeur | Salarié | Total |
| --- | ---: | ---: | ---: |
| Retraite T1 | 4,72 % | 3,15 % | 7,87 % |
| Retraite T2 | 12,95 % | 8,64 % | 21,59 % |
| CEG T1 | 1,29 % | 0,86 % | 2,15 % |
| CEG T2 | 1,62 % | 1,08 % | 2,70 % |
| CET | 0,21 % | 0,14 % | 0,35 % |
| Apec | 0,036 % | 0,024 % | 0,06 % |

Le compte de résultat publié indique pour 2025, en millions d’euros :

- 91 084 de cotisations des entreprises ;
- 8 253 de produits de compensation des réductions et exonérations ;
- 4 003 de cotisations de tiers ;
- 103 340 de ressources totales.

### Règles de séparation

```text
cotisation de retraite
≠ CEG
≠ CET
≠ cotisation Apec
≠ compensation des exonérations
≠ cotisation versée par un tiers
```

La cotisation Apec est recouvrée par les institutions Agirc-Arrco pour le compte d’un autre
organisme. Elle doit donc conserver son propre bénéficiaire.

Les produits de compensation ne doivent pas être présentés comme des cotisations payées
par les employeurs. Les cotisations de tiers ne doivent pas être attribuées aux entreprises
sans détail.

### Taux non standard

Agirc-Arrco indique que certaines entreprises peuvent appliquer des taux de cotisation
supérieurs aux taux standard ou des assiettes dérogatoires. Le barème minimal ne suffit
donc pas à reconstruire le montant individuel de toutes les entreprises.

### Première ingestion proposée

Livrable :
`data/reference/agirc-arrco-parameters-and-results.json`.

Chaque composante portera une clé distincte, une assiette, une tranche, une part employeur,
une part salariée et une date d’effet. Les comptes porteront un `amount_kind` séparant
cotisation, compensation, transfert et total.

## 5. CNRACL : effectifs et familles d’employeurs

Source :
[Actifs et cotisants CNRACL](https://www.data.gouv.fr/datasets/actifs-et-cotisants-cnracl-1).

La CNRACL couvre le risque vieillesse et invalidité des fonctionnaires territoriaux et
hospitaliers. Les collectivités locales cotisent en tant qu’employeurs et les titulaires
des fonctions publiques territoriale et hospitalière sont affiliés sous réserve des règles
de durée d’activité.

Les jeux ouverts repérés décrivent principalement :

- les actifs ;
- les cotisants ;
- les répartitions territoriales ou institutionnelles ;
- les employeurs et familles d’employeurs ;
- le champ territorial et hospitalier.

Le catalogue avait été mis à jour en août 2026 lors de la recherche, mais la documentation
et la disponibilité varient selon les ressources.

### Utilité

Les effectifs peuvent servir de dénominateur pour :

- contrôler le champ d’affiliation ;
- comparer les branches territoriale et hospitalière ;
- détecter une rupture de population ;
- rapprocher les employeurs de Sirene, BANATIC et des comptes publics ;
- expliquer l’évolution agrégée des cotisations publiée ailleurs.

### Ce que les effectifs ne permettent pas

```text
nombre de cotisants × taux moyen
    ≠ cotisation observée
```

Le calcul manquerait les rémunérations, temps de travail, assiettes, régularisations,
rappels, exonérations et changements de taux.

Une famille d’employeurs ne constitue pas non plus un secteur institutionnel SEC. Le
bénéficiaire, le redevable et le régime doivent rester des objets séparés.

### Première ingestion proposée

Créer d’abord un manifeste des ressources et de leur documentation, puis ingérer uniquement
les fichiers dont le millésime, le grain et les unités sont établis.

Livrable :
`data/reference/cnracl-contributors-employers-manifest.json`.

## 6. Ircantec : une source utile mais trop ancienne

La Caisse des Dépôts a publié des données sur les cotisants Ircantec par employeur ou
famille d’employeurs. Le régime couvre notamment les agents contractuels de droit public,
d’autres agents publics et certaines catégories d’élus.

Le dernier état de catalogue identifié pendant cette passe était daté de novembre 2023.
La source reste donc classée `support_only`.

### Utilité historique

- mesurer les effectifs par famille d’employeurs ;
- retrouver des appellations institutionnelles ;
- comparer le champ des contractuels à celui de la CNRACL ;
- préparer le rapprochement avec les comptes sociaux.

### Limites

- aucune preuve de fraîcheur pour 2026 ;
- les effectifs ne fournissent pas les cotisations ;
- un cotisant peut avoir plusieurs employeurs ;
- certaines populations ont des règles particulières ;
- la famille d’employeurs n’est ni une créance, ni un bénéficiaire, ni un secteur SEC.

La prochaine action n’est pas une ingestion complète, mais une évaluation de la dernière
ressource, de son millésime et de sa documentation.

## 7. Chiffres clés 2025 de la culture : des dizaines de tableurs sectoriels

Source :
[Chiffres clés 2025 de la culture et de la communication](https://www.culture.gouv.fr/espace-documentation/statistiques-ministerielles-de-la-culture2/publications/chiffres-cles-2025-de-la-culture-et-de-la-communication).

Le ministère de la Culture a publié cette édition le 16 juin 2026. Chaque fiche synthétique
est accompagnée de données au format XLS ou XLSX.

Les thèmes comprennent notamment :

- économie et financement de la culture ;
- entreprises, emplois et revenus ;
- spectacle vivant ;
- musique enregistrée et diffusion en ligne ;
- théâtre ;
- cinéma ;
- vidéo ;
- télévision et publicité ;
- presse et livre ;
- patrimoine et pratiques culturelles.

### Intérêt fiscal

Plusieurs prélèvements du brouillon sont liés à ces marchés ou bénéficiaires :

- taxes et cotisations sur la billetterie des spectacles ;
- prélèvements liés au cinéma et à la vidéo ;
- taxe sur la diffusion en ligne de musique enregistrée ;
- prélèvements sur les services audiovisuels ou la publicité ;
- taxes affectées à des établissements culturels.

Les tableurs permettent d’obtenir rapidement les ordres de grandeur, séries de marché,
fréquentations et noms des producteurs statistiques sous-jacents.

### Exemples de dimensions publiées

Selon les fiches, on retrouve :

- nombre de représentations ;
- fréquentation et billetterie ;
- chiffre d’affaires ;
- diffusion physique et numérique ;
- entrées de cinéma ;
- recettes publicitaires ;
- consommation de biens et services culturels ;
- financement public ;
- entreprises et emplois.

### Limites

Le recueil agrège de nombreuses sources. Le ministère n’est pas nécessairement le
producteur initial de chaque tableau. Pour toute preuve individuelle, il faudra revenir à
la source sous-jacente, par exemple le CNC, le CNM, l’ASTP, l’Arcom, l’Insee ou les comptes
d’un organisme.

```text
billetterie
≠ assiette fiscale certaine
≠ montant déclaré
≠ recette de la taxe
```

Une dépense, une fréquentation ou un chiffre d’affaires sectoriel ne doit pas être multiplié
par un taux pour produire une observation.

### Première ingestion proposée

Livrable :
`data/reference/culture-2025-workbooks-manifest.json`.

Le manifeste doit sélectionner les classeurs réellement utiles, conserver le producteur
sous-jacent, les unités, millésimes, feuilles et notes, et éviter de télécharger les
nombreux fichiers sans rapport direct avec les prélèvements.

## 8. Quantités de vins soumises au droit de circulation

Sources :

- [portail Douane — droit de circulation](https://www.douane.gouv.fr/la-douane/opendata/mots-cles/droit-de-circulation) ;
- [archive des campagnes depuis 2011](https://data.economie.gouv.fr/explore/assets/campagne-viti-vinicole/) ;
- [catalogue data.gouv.fr](https://www.data.gouv.fr/datasets/campagnes-viti-vinicoles-depuis-2011).

La Douane publie des classeurs par campagne viti-vinicole donnant :

- les quantités de vins soumises au droit de circulation ;
- les quantités de vins sorties des chais des récoltants et négociants vinificateurs ;
- des ventilations par département ;
- des fichiers mensuels dans les archives historiques ;
- certaines séries nationales relatives au cidre.

La campagne commence le 1er août et se termine le 31 juillet de l’année suivante. La
dernière campagne complète repérée pendant cette recherche est 2024-2025, publiée le
1er octobre 2025.

### Apport

Cette source est particulièrement intéressante parce que l’une des mesures est explicitement
nommée « quantité soumise au droit de circulation ». Elle permet de suivre une assiette
physique ou administrative historiquement liée à une accise.

### Ce que le fichier ne prouve pas

- le tarif effectivement appliqué ;
- le montant liquidé ;
- les corrections et régularisations ;
- le montant encaissé ;
- la date budgétaire de la recette ;
- la correspondance avec le régime juridique courant après recodification ;
- toutes les boissons alcooliques.

Les sorties de chais ne sont pas des ventes finales. Elles ne doivent pas être additionnées
aux quantités soumises comme si les deux colonnes mesuraient des produits fiscaux distincts.

### Calendrier

Une campagne 2024-2025 chevauche deux années civiles et peut ne pas correspondre au
millésime de la loi, du budget ou de la NTL. Le champ temporel doit donc conserver :

```json
{
  "campaign": "2024-2025",
  "campaign_start": "2024-08-01",
  "campaign_end": "2025-07-31",
  "month": null,
  "publication_date": "2025-10-01"
}
```

Livrable recommandé :
`data/reference/viticulture-duty-quantities-2011-2025.json`.

## Modèle de qualification public–privé

La recherche sur SYDEREP, Agirc-Arrco et les régimes publics confirme que le mot
« obligatoire » ne suffit pas au classement.

Le futur référentiel devrait porter au minimum :

```json
{
  "obligation_id": "stable-id",
  "obligation_kind": "public_levy | regulated_private_contribution | contractual | sanction | unresolved",
  "legal_basis": [],
  "beneficiary_id": null,
  "beneficiary_sector": null,
  "collection_body_id": null,
  "mandatory_population": null,
  "source_id": "source-id",
  "valid_from": null,
  "valid_to": null,
  "classification_confidence": "candidate",
  "review_status": "unreviewed"
}
```

Questions à documenter avant de promouvoir un mécanisme :

1. l’obligation résulte-t-elle directement de la loi ou d’un acte privé ?
2. le bénéficiaire économique appartient-il aux administrations publiques ?
3. le paiement est-il sans contrepartie directe individualisable ?
4. le mécanisme est-il inclus dans les comptes nationaux ?
5. la ligne source représente-t-elle une créance, une contribution de filière, une sanction
   ou seulement un indicateur d’activité ?

## Contrôles automatiques proposés

### Mines

```text
Camino
    ↔ titulaire Sirene
    ↔ périmètre COG
    ↔ substance
    ↔ base juridique
    ↔ comptes du bénéficiaire
```

La sortie est une file de titres susceptibles de relever d’une famille de redevance.

### Énergie

```text
Agence ORE
    ↔ NAF versionnée
    ↔ tableaux de tarifs Douane
    ↔ statistiques DGFiP
    ↔ NTL
```

Le contrôle porte sur les tendances et ordres de grandeur, jamais sur un calcul de dette.

### Filières REP

```text
SYDEREP producteur et IDU
    ↔ filière
    ↔ éco-organisme ou système individuel
    ↔ obligation juridique
    ↔ bénéficiaire et secteur SEC
```

La sortie doit distinguer prélèvement public, contribution privée réglementée et statut
non résolu.

### Retraites complémentaires

```text
barème annuel
    ↔ population et employeurs
    ↔ cotisations observées du compte
    ↔ compensation
    ↔ comptes sociaux et NTL
```

Aucun effectif ne doit servir à reconstruire le produit individuel.

### Culture

```text
activité sectorielle
    ↔ prélèvement candidat
    ↔ producteur statistique sous-jacent
    ↔ compte du bénéficiaire
    ↔ recette budgétaire ou SEC
```

La table doit signaler lorsque le même chiffre est un total et lorsque d’autres lignes en
sont seulement la ventilation.

### Viticulture

```text
quantités de campagne
    ↔ produit et département
    ↔ tarif juridique daté
    ↔ recette douanière
```

Le résultat reste un contrôle agrégé et doit expliciter le décalage campagne–année.

## Résultats négatifs à conserver

### Pas de chaîne complète titre minier–production–redevance

Camino fournit le cadastre, mais aucun jeu national ouvert ne relie chaque titre à la
production taxable, au tarif, à la déclaration, au paiement et au bénéficiaire.

### Flux Camino public incomplet

Une partie du contenu nécessite une authentification. L’absence du flux public n’est donc
pas une preuve d’absence juridique.

### Pas de déclaration énergétique fiscale ouverte par redevable

Les données ORE décrivent la consommation de réseau par territoire et activité, pas les
quantités déclarées à l’accise avec exemptions et remboursements.

### Pas de classification automatique des contributions REP

SYDEREP ne fournit pas une variable indiquant si chaque flux est un prélèvement obligatoire
au sens SEC. Cette qualification doit être ajoutée par le projet.

### Pas de registre fiscal culturel transversal

Les classeurs culturels couvrent les marchés, mais pas une table unique déclarant,
assiette, taux, recette et bénéficiaire pour tous les prélèvements.

### Données CNRACL et Ircantec principalement démographiques

Les jeux ouverts recensés portent sur les effectifs et employeurs, pas sur le détail des
cotisations observées par composante.

### Ircantec non courant

Aucune ressource ouverte suffisamment récente n’a été identifiée pour qualifier le champ
2026 sans recherche complémentaire.

### Octroi de mer toujours fragmenté

Les taux et exonérations restent répartis par territoire, date et nomenclature de produits.
Aucun fichier courant unique couvrant les cinq territoires, les composantes internes,
externes et régionales n’a été trouvé.

### Taxe annuelle sur les engins maritimes

Aucun fichier national massif combinant caractéristiques du navire, longueur, puissance
fiscale, exonérations et taxe payée n’a été identifié.

## Ordre d’ingestion recommandé

### Lot 1 — SYDEREP

Objectif : construire la première classification de masse entre prélèvement public et
contribution privée réglementée.

Livrable :
`data/reference/syderep-producers-and-rep-obligations.json`.

### Lot 2 — Agence ORE

Objectif : archiver les jeux par maille et méthodologie avant de traiter les volumes
importants.

Livrable :
`data/reference/ore-energy-consumption-manifest.json`.

### Lot 3 — Camino

Objectif : produire un snapshot public des titres et mesurer explicitement la couverture
publique.

Livrable :
`data/reference/camino-mining-titles-snapshot.geojson`.

### Lot 4 — viticulture

Objectif : normaliser les campagnes depuis 2011 et distinguer quantités soumises et sorties
de chais.

Livrable :
`data/reference/viticulture-duty-quantities-2011-2025.json`.

### Lot 5 — Agirc-Arrco

Objectif : structurer les paramètres 2026 et le compte de résultat 2025 avec des types de
montants explicites.

Livrable :
`data/reference/agirc-arrco-parameters-and-results.json`.

### Lot 6 — culture

Objectif : construire le manifeste des classeurs pertinents avant toute extraction
sectorielle.

Livrable :
`data/reference/culture-2025-workbooks-manifest.json`.

### Lot 7 — CNRACL

Objectif : inventorier les ressources et utiliser les effectifs comme dénominateurs des
comptes sociaux.

### Lot 8 — Ircantec

Objectif : retrouver une publication courante ou documenter définitivement le caractère
historique des jeux ouverts recensés.

## Règles supplémentaires anti-inférence

1. **Titre minier n’est pas production.**
2. **Volume Camino n’est pas assiette de redevance sans définition juridique.**
3. **Flux public incomplet n’est pas cadastre exhaustif.**
4. **Consommation de réseau n’est pas quantité taxable.**
5. **Point de livraison n’est pas redevable.**
6. **Série ancienne et série nouvelle ORE ne doivent pas être concaténées sans rupture.**
7. **IDU REP n’est pas preuve de paiement.**
8. **Adhésion à un éco-organisme n’est pas prélèvement public.**
9. **Éco-contribution privée réglementée n’est pas automatiquement prélèvement obligatoire.**
10. **Quantité mise sur le marché n’est pas montant de contribution.**
11. **Tonnage collecté n’est pas assiette.**
12. **Cotisation retraite Agirc-Arrco n’est pas CEG ou CET.**
13. **Cotisation Apec conserve un bénéficiaire distinct.**
14. **Compensation d’exonération n’est pas cotisation d’entreprise.**
15. **Nombre de cotisants CNRACL ou Ircantec n’est pas produit de cotisation.**
16. **Famille d’employeurs n’est pas secteur SEC.**
17. **Donnée Ircantec ancienne n’est pas état 2026.**
18. **Billetterie ou chiffre d’affaires culturel n’est pas assiette fiscale certaine.**
19. **Tableur de synthèse n’est pas toujours source primaire.**
20. **Quantité de vin soumise n’est pas droit encaissé.**
21. **Sortie de chais n’est pas vente finale.**
22. **Campagne viti-vinicole n’est pas année civile.**
23. **Une composante, ventilation ou fraction ne doit pas être ajoutée à son total.**
24. **Toute classification public–privé doit être sourcée et datée.**

## Décision recommandée pour l’issue #36

La prochaine ingestion à plus fort rendement est **SYDEREP**. Elle couvre de nombreuses
filières, dispose d’une API officielle et peut résoudre une question méthodologique majeure :
quelles obligations appelées « contributions » ou « redevances » relèvent réellement du
périmètre des prélèvements obligatoires ?

La deuxième priorité est le manifeste **Agence ORE**, car ces jeux sont très volumineux,
réguliers et réutilisables pour plusieurs familles énergétiques. Le manifeste doit précéder
le téléchargement afin de fixer les identifiants, méthodes et mailles.

La troisième priorité est **Camino**, dont le flux GeoJSON permet de remplacer les recherches
individuelles de titres miniers par un snapshot national auditable.

La quatrième priorité est la série **viti-vinicole**, parce qu’elle constitue une source
historique directement liée à une accise et suffisamment structurée pour une ingestion
rapide.

Cette séquence doit être engagée avant une nouvelle accumulation de sources. Elle permettra
de tester quatre architectures différentes : registre d’opérateurs, données territoriales
massives, cadastre juridique géospatial et série d’assiette physique par campagne.
