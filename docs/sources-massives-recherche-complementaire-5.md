# Sixième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète les cinq passes précédentes. Le registre structuré associé est
[`data/reference/bulk-sources-supplement-5-2026-09-03.json`](../data/reference/bulk-sources-supplement-5-2026-09-03.json).

## Résultat principal

Cette passe recherche moins des listes de taxes que des **bases nationales décrivant les
assiettes physiques, les actifs et les marchés** auxquels les prélèvements peuvent se
rattacher.

Les sources les plus utiles sont :

1. **DVF**, pour les mutations immobilières et leur valeur déclarée ;
2. **Sitadel3**, pour les autorisations d’urbanisme susceptibles d’entrer dans le champ de
   la taxe d’aménagement ou de l’archéologie préventive ;
3. **RSVERO**, pour les immatriculations et caractéristiques des véhicules ;
4. **ANFR** et le registre **RTE**, pour les actifs susceptibles de relever des différentes
   composantes de l’IFER ;
5. les séries de trafic et les paramètres de la **DGAC**, pour les prélèvements
   aéronautiques ;
6. le registre des émissions polluantes, pour les installations, déchets et émissions à
   rapprocher avec prudence de la TGAP ;
7. l’observatoire de l’**ARCEP**, pour les contrôles sectoriels des prélèvements télécoms ;
8. **Open Medic**, comme source de contexte du marché remboursé du médicament ;
9. la **BDNB**, pour résoudre et enrichir les bâtiments sans remplacer les identifiants
   fiscaux ou cadastraux.

La règle centrale est la suivante :

```text
activité, actif ou marché observé
    ≠ assiette fiscale certaine
    ≠ dette liquidée
    ≠ paiement
    ≠ recette budgétaire
    ≠ recette de comptabilité nationale
```

Ces bases doivent donc produire des **candidats**, des mesures de couverture et des
contrôles d’ordre de grandeur. Elles ne doivent jamais fabriquer directement une recette
individuelle.

## Matrice d’utilisation

| Famille | Source d’activité ou d’actif | Source des paramètres | Source du produit |
| --- | --- | --- | --- |
| Mutations immobilières | DVF | CIBS, CGI, taux et options DMTO | DGFiP, SMCL, balances locales, NTL |
| Taxe d’aménagement | Sitadel3 | CIBS, DELTA délibérations | DGFiP et comptes locaux |
| Véhicules | RSVERO | CIBS, tarifs régionaux, barèmes CO₂ et masse | recettes DGFiP, Voies et moyens |
| IFER radio | ANFR | CGI/CIBS et barèmes IFER | REI, balances et comptes bénéficiaires |
| IFER énergie | registre RTE | CGI/CIBS, seuils et tarifs par technologie | REI, balances, NTL |
| Taxes aéronautiques | trafic DGAC | page et notices DGAC, CIBS, arrêtés | PLACSS/PLF, comptes DGAC et NTL |
| TGAP | IREP/GEREP | CIBS et BOFiP | statistiques DGFiP et budget |
| Télécommunications | observatoire ARCEP | droit et doctrine sectorielle | budget et comptes bénéficiaires |
| Contributions pharmaceutiques | Open Medic, seulement comme contexte | CSS, LFSS, doctrine sociale | PLACSS et comptes sociaux |

Cette matrice évite une erreur fréquente : utiliser une source d’activité pour remplacer
une source fiscale. Les colonnes sont complémentaires et leurs montants peuvent suivre
des calendriers et conventions différents.

## 1. Demandes de valeurs foncières

Source :
[Demandes de valeurs foncières](https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres).

DVF est produit par la DGFiP à partir des actes notariés et des informations cadastrales.
Le jeu couvre les cinq dernières années et exclut l’Alsace, la Moselle et Mayotte. Les
fichiers annuels sont publiés sous forme de textes compressés, avec le caractère `|` comme
séparateur.

La mise à jour est semestrielle, en avril et en octobre. Chaque nouvelle publication
supprime et remplace tous les fichiers précédents. Des transactions peuvent être ajoutées
rétroactivement à n’importe lequel des cinq millésimes. La dernière alimentation signalée
pendant cette vérification est datée du 7 avril 2026.

### Apport pour les droits de mutation

DVF permet de construire en masse :

- la chronologie des mutations ;
- les valeurs foncières déclarées ;
- les natures de mutation ;
- les références territoriales et cadastrales ;
- les types et caractéristiques des biens ;
- des agrégats par département, commune, période ou catégorie de bien.

Il peut être rapproché des taux DMTO et des recettes départementales afin de détecter une
incohérence manifeste de périmètre ou de tendance.

### Granularité

Une mutation peut être décrite par plusieurs dispositions, parcelles ou locaux. Le numéro
de ligne d’un fichier doit donc être conservé et un éventuel regroupement en mutation doit
rester une transformation dérivée.

```text
mutation juridique
    ├── une ou plusieurs dispositions
    ├── une ou plusieurs parcelles
    ├── zéro, un ou plusieurs locaux
    └── une valeur foncière publiée
```

Compter les lignes comme des transactions surestime mécaniquement l’activité.

### Ce que DVF ne prouve pas

- l’assiette exacte retenue lors de la liquidation ;
- la part départementale, communale ou nationale ;
- le bénéfice d’un abattement ou d’une exonération ;
- le régime de TVA immobilière ;
- les droits effectivement payés ;
- la date d’encaissement ;
- la recette de comptabilité nationale.

La réutilisation doit également respecter les conditions relatives à la non-réidentification
et à l’absence d’indexation externe des personnes concernées.

### Ingestion proposée

Créer d’abord un manifeste :

```json
{
  "source_id": "dgfip-dvf",
  "snapshot": "2026-04",
  "files": [],
  "publication_date": "2026-04-07",
  "sha256": {},
  "notice_sha256": null,
  "replacement_of": null
}
```

Chaque nouvelle publication doit être archivée intégralement. Un diff doit signaler les
lignes ajoutées ou modifiées dans les anciens millésimes.

Livrable recommandé :
`data/reference/dvf-snapshots-manifest.json`.

## 2. Sitadel3 et les autorisations d’urbanisme

Source :
[Données des permis de construire et autres autorisations d’urbanisme](https://www.statistiques.developpement-durable.gouv.fr/donnees-des-permis-de-construire-et-autres-autorisations-durbanisme).

Le SDES diffuse chaque mois quatre familles de données depuis 2013 :

- permis de construire et déclarations préalables créant des logements ;
- permis de construire et déclarations préalables créant ou étendant des locaux non
  résidentiels ;
- permis d’aménager ;
- permis de démolir.

Les fichiers sont disponibles dans l’explorateur DiDo et par API. La dernière mise à jour
observée est datée du 28 août 2026.

Depuis mars 2026, Sitadel3 remplace Sitadel2 pour la production des statistiques de
construction neuve. Le changement a conduit à des révisions et à une évolution des
variables et classifications. Le dispositif doit donc être enregistré comme une rupture
de source, même lorsque l’identifiant d’autorisation paraît stable.

### Utilité fiscale

Sitadel3 peut servir à contrôler :

- les projets susceptibles de relever de la taxe d’aménagement ;
- les projets susceptibles de relever du prélèvement d’archéologie préventive ;
- les surfaces et destinations déclarées ;
- l’activité mensuelle par commune ;
- les décalages entre autorisation, commencement et achèvement.

Il peut être relié au jeu DELTA des taux et délibérations de taxe d’aménagement déjà
recensé.

### Cycle à conserver

```text
dépôt
    → autorisation
    → modification ou transfert éventuel
    → annulation éventuelle
    → commencement
    → achèvement
    → liquidation fiscale dans une autre source
```

Une autorisation n’est pas une liquidation. Une autorisation annulée ou jamais mise en
œuvre ne doit pas rester comptée comme assiette certaine.

### Limites

- les exonérations obligatoires ou facultatives ne sont pas déductibles du seul dossier ;
- les taux locaux viennent des délibérations ;
- les valeurs forfaitaires et règles fiscales viennent du droit ;
- les surfaces administratives peuvent différer de l’assiette définitivement retenue ;
- aucune recette n’est publiée dans Sitadel.

Livrable recommandé :
`data/reference/sitadel3-authorizations-manifest.json`.

## 3. RSVERO : immatriculations de véhicules

Source :
[Immatriculations de véhicules routiers](https://www.data.gouv.fr/datasets/immatriculations-de-vehicules-routiers).

Le jeu du SDES couvre les immatriculations neuves et d’occasion de 2011 à 2025. Les
données sont publiées au niveau communal, avec notamment :

- le type de véhicule ;
- la motorisation ;
- le statut de l’utilisateur ;
- la catégorie Crit’Air pour les achats d’occasion ;
- la distinction entre marché neuf et marché d’occasion.

La dernière mise à jour observée est datée du 2 septembre 2026. Les données sont également
référencées dans le catalogue DiDo.

### Familles fiscales pouvant être contrôlées

- taxe régionale sur le certificat d’immatriculation ;
- malus sur les émissions de CO₂ ;
- malus lié à la masse ;
- taxes annuelles sur l’affectation de véhicules à des fins économiques ;
- anciennes taxes et composantes liées à certaines catégories de véhicules.

Le contrôle doit rester agrégé. Le jeu ne publie pas le montant payé lors de chaque
opération.

### Points de périmètre

Les véhicules de démonstration sont comptés comme neufs. Pour une location longue durée ou
un crédit-bail, la localisation est celle du locataire, pas celle du propriétaire. Les
changements de domicile ou de raison sociale et certaines déclarations de professionnels
sans changement de titulaire ne sont pas comptés.

Des codes communaux fictifs existent lorsque la commune est inconnue. Ils ne doivent pas
être transformés en une commune réelle.

### Limites

- immatriculation ne signifie pas exigibilité ;
- les exonérations ne sont pas identifiées ;
- les caractéristiques nécessaires au calcul fiscal complet peuvent manquer ;
- le véhicule peut être localisé chez l’utilisateur alors que le redevable juridique est
  différent ;
- un agrégat de véhicules ne fournit pas la date de paiement ou la recette nette.

Livrable recommandé :
`data/reference/vehicle-registration-aggregates-2011-2025.json`.

## 4. Installations radioélectriques de l’ANFR

Source :
[Installations radioélectriques de plus de 5 watts](https://www.data.gouv.fr/datasets/donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1).

L’ANFR publie les installations supérieures à 5 watts enregistrées dans le cadre de
l’article L.43 du code des postes et des communications électroniques. Les installations
de l’Aviation civile et des ministères de la Défense et de l’Intérieur sont exclues.

Le catalogue comportait 276 ressources lors de la vérification, avec des archives et un
snapshot d’environ 63 Mo mis à jour le 24 août 2026. Cette profondeur rend possible une
historisation des états mensuels.

### Apport pour l’IFER

Le jeu permet d’inventorier :

- les supports ;
- les stations et systèmes ;
- les exploitants ;
- les technologies et fréquences ;
- les implantations ;
- les statuts administratifs disponibles ;
- les changements entre snapshots.

Il constitue donc une excellente source de candidats pour la composante de l’IFER portant
sur certaines stations radioélectriques.

### Règle de granularité

```text
site physique
    ├── un ou plusieurs supports
    ├── une ou plusieurs stations
    ├── plusieurs antennes ou systèmes
    └── un ou plusieurs exploitants
```

Aucun de ces niveaux ne doit être choisi comme unité fiscale sans lecture du droit et du
schéma ANFR. Additionner supports, antennes et systèmes créerait des doubles comptes.

### Limites

Le seuil technique de 5 watts n’est pas nécessairement le seuil fiscal. Le régime dépend
aussi du type d’équipement, de la date de mise en service, de l’exploitant et des
exonérations. Les installations exclues de la base empêchent enfin d’utiliser l’absence
comme preuve d’exonération ou d’inexistence.

Livrable recommandé : un inventaire candidat IFER conservant les identifiants ANFR et le
snapshot source.

## 5. Registre national des installations électriques

Source :
[Registre national des installations de production et de stockage d’électricité](https://odre.opendatasoft.com/explore/dataset/registre-national-installation-production-stockage-electricite-agrege/).

RTE est chargé par l’article L.142-9-1 du code de l’énergie de produire ce registre, à
partir de ses données et de celles des gestionnaires de réseaux de distribution. Le
snapshot vérifié est daté du 30 juin 2026 et couvre la France métropolitaine et les zones
non interconnectées.

Le portail fournit un identifiant de jeu stable et un accès Opendatasoft permettant des
exports CSV et JSON ainsi que des requêtes API.

### Familles d’actifs utiles

Le registre peut produire des candidats pour les composantes IFER relatives aux :

- centrales de production ;
- installations éoliennes ;
- installations photovoltaïques ;
- installations hydrauliques ;
- autres technologies selon les catégories du registre ;
- unités de stockage, lorsqu’elles entrent dans un champ fiscal à étudier.

Les attributs utiles sont notamment la technologie, la puissance, la localisation, le
raccordement et les identifiants de l’installation ou du producteur.

### Petites installations

Les installations de moins de 36 kW sont publiées séparément sous forme agrégée à la
maille IRIS et au pas annuel. Une ligne de ce fichier ne représente donc jamais une
installation individuelle.

### Limites

- le registre n’est pas un rôle IFER ;
- la puissance installée n’est pas automatiquement la valeur imposable ;
- propriétaire, producteur et exploitant peuvent être différents ;
- les seuils et exonérations doivent être lus dans le droit ;
- la liste des gestionnaires contributeurs évolue ;
- certains identifiants EIC ont fait l’objet de corrections.

Livrable recommandé : un inventaire candidat par technologie, avec les lignes agrégées
explicitement marquées comme telles.

## 6. Trafic aérien commercial

Source :
[Trafic aérien commercial mensuel français](https://www.data.gouv.fr/datasets/trafic-aerien-commercial-mensuel-francais-par-paire-daeroports-par-sens-depuis-1990).

La DGAC publie trois séries CSV :

| Série | Granularité | Début |
| --- | --- | --- |
| `ASP_APT_AAAA` | aérodrome et mois | 1990 |
| `ASP_LSN_AAAA` | segment, faisceau ou liaison et mois | 1990 |
| `ASP_CIE_AAAA` | transporteur et mois | 2010 |

Les données proviennent des relevés transmis par les exploitants d’aérodromes et les
transporteurs. La dernière mise à jour observée est datée du 31 juillet 2026.

### Seuils de diffusion

La publication regroupe les acteurs ou liaisons sous certains seuils :

- aérodromes sous une unité de trafic ;
- liaisons sous 5 000 passagers équivalents ;
- transporteurs sous dix unités de trafic selon la définition propre à cette série.

Ces lignes agrégées doivent être conservées, car les supprimer réduirait les totaux.
Elles ne doivent pas être attribuées à un aérodrome ou transporteur particulier.

### Usages fiscaux

Le trafic peut contrôler les ordres de grandeur de :

- la taxe sur le transport aérien de passagers ;
- la taxe sur le transport aérien de marchandises ;
- les tarifs de sûreté et de sécurité ;
- la péréquation aéroportuaire ;
- la taxe sur les nuisances sonores aériennes ;
- certaines majorations territoriales.

### Limites

Passager transporté ne signifie pas passager taxable. Il faut tenir compte des
correspondances, exemptions, territoires, destinations finales et règles de redevable.
Le fret statistique n’est pas non plus nécessairement le tonnage taxable après exclusions.

Les séries sont ouvertes annuellement après un délai de trois mois révolus suivant la fin
de l’année. Elles ne constituent donc pas un registre fiscal en temps réel.

## 7. Paramètres des taxes aéronautiques

Source :
[Taxes aéronautiques](https://www.ecologie.gouv.fr/politiques-publiques/taxes-aeronautiques).

La page DGAC centralise les règles, tarifs et notices des taxes désormais organisées dans
le CIBS. Elle documente notamment :

- le tarif de l’aviation civile ;
- le tarif de solidarité ;
- le tarif de sûreté et de sécurité ;
- le tarif de péréquation aéroportuaire ;
- les majorations Corse et outre-mer ;
- les tarifs du transport aérien de marchandises ;
- la taxe sur les nuisances sonores aériennes ;
- les bénéficiaires et principales règles d’exonération.

La page indique les tarifs applicables en 2026 et 2027 et renvoie vers les articles du
CIBS et les notices PDF.

### Modèle proposé

```text
taxe juridique
    ├── composante tarifaire
    ├── assiette : passager, tonne, mouvement ou autre
    ├── zone ou classe
    ├── date de début
    ├── date de fin
    ├── bénéficiaire
    └── exemptions
```

Une composante tarifaire n’est pas une nouvelle taxe. Les recettes d’une composante peuvent
être réparties entre plusieurs bénéficiaires ou plafonnées.

### Rapprochement avec le trafic

Le rapprochement peut produire des ordres de grandeur et détecter :

- un tarif manquant ;
- une période mal datée ;
- un aérodrome classé dans la mauvaise catégorie ;
- une majoration appliquée au mauvais territoire ;
- une variation de trafic incompatible avec la recette publiée.

Le résultat calculé doit toujours être nommé `estimated_control`, jamais `observed_revenue`.

Livrable recommandé :
`data/reference/aviation-tax-parameters-and-traffic.json`.

## 8. Registre français des émissions polluantes

Sources :

- [jeu national](https://www.data.gouv.fr/datasets/registre-francais-des-emissions-polluantes) ;
- [dossier méthodologique Géorisques](https://www.georisques.gouv.fr/consulter-les-dossiers-thematiques/registre-des-emissions-polluantes).

Le registre recense des rejets dans l’air, l’eau et le sol, des transferts et traitements
de déchets et, selon les seuils, des volumes d’eau prélevés ou rejetés. Il couvre les
principales installations industrielles, certaines grandes stations d’épuration et
certains élevages.

Le jeu national dispose d’un fichier ZIP ; le catalogue était daté du 11 octobre 2025 et
signalait que certains fichiers n’étaient pas disponibles.

### Apport pour la TGAP

Le registre peut aider à identifier :

- les établissements industriels ;
- les catégories et quantités de déchets ;
- les types d’émissions ;
- les secteurs ;
- les changements d’activité ;
- les établissements susceptibles d’appartenir à une famille de redevables.

Il peut être joint à Sirene et aux tableaux DGFiP de TGAP déjà recensés.

### Champ non exhaustif

Le dossier Géorisques précise que la déclaration est limitée aux établissements et
paramètres dépassant les seuils réglementaires. Les petits émetteurs, plusieurs secteurs,
les sources diffuses, les transports et les particuliers ne sont pas couverts.

Le nombre de déclarants et de polluants varie également avec les textes. Une hausse du
nombre de lignes ne signifie donc pas nécessairement une hausse réelle de la pollution.

### Ce que le registre ne prouve pas

- l’assujettissement effectif à une composante de TGAP ;
- la quantité retenue fiscalement ;
- l’application d’une exemption ou d’un tarif réduit ;
- le montant déclaré ou payé ;
- la recette encaissée.

Livrable recommandé :
`data/reference/irep-establishment-declarations.json`.

## 9. Observatoire des communications électroniques

Source :
[Observatoire des communications électroniques](https://www.data.gouv.fr/datasets/observatoire-des-communications-electroniques).

L’ARCEP publie quatre classeurs principaux, issus d’enquêtes auprès des opérateurs. Ils
portent principalement sur le marché de détail et comprennent :

- revenus ;
- trafics voix, SMS et données ;
- parcs ;
- investissements ;
- emplois ;
- marché entreprises ;
- indices de prix.

Les séries ont des fréquences trimestrielles, annuelles ou mensuelles selon l’indicateur.
Le catalogue était mis à jour le 23 juillet 2026.

### Apport

Ces données peuvent contrôler la cohérence d’ensemble des prélèvements portant sur les
opérateurs, les communications électroniques ou certains équipements de réseau. Elles
peuvent aussi être rapprochées du registre ANFR afin de comparer parc de services et parc
d’infrastructures.

### Limites

- les données sont agrégées pour le marché ;
- elles ne fournissent pas les bases déclarées par opérateur ;
- le marché de détail ne correspond pas nécessairement au champ fiscal ;
- la notion de revenu ARCEP doit rester distincte du chiffre d’affaires fiscal ;
- le catalogue signale des formats non standards et une documentation incomplète.

Livrable recommandé :
`data/reference/arcep-market-series.json` après profilage manuel des quatre classeurs.

## 10. Open Medic

Source :
[Open Medic — base complète](https://www.assurance-maladie.ameli.fr/etudes-et-donnees/open-medic-base-complete-depenses-medicaments).

Open Medic est une série annuelle CSV couvrant les médicaments délivrés en ville de 2014
à 2025 pour l’ensemble des régimes d’assurance maladie. Les données sont issues du SNDS et
classées selon la nomenclature ATC.

La base fournit notamment :

- le montant remboursé ;
- la base remboursable ;
- le nombre de boîtes délivrées ;
- des dimensions liées au bénéficiaire ;
- la région ;
- la spécialité du prescripteur.

Une anomalie portant sur la région des bénéficiaires dans les données 2025 a été signalée
le 25 juin 2026 puis déclarée corrigée le 10 juillet 2026. La version ingérée doit donc
être explicitement postérieure à cette correction.

### Utilité limitée mais réelle

Open Medic peut contrôler l’évolution du marché remboursé et des classes de produits dans
le champ des contributions pharmaceutiques. Il peut aussi fournir des dénominateurs et
repérer une rupture de consommation.

### Ce qu’il ne faut pas en déduire

```text
montant remboursé
    ≠ chiffre d’affaires du laboratoire
    ≠ chiffre d’affaires taxable
    ≠ contribution due
    ≠ recette sociale
```

La base ne couvre pas tout le marché hospitalier ni tous les produits de santé. Des
modalités sont floutées lorsque le secret statistique l’exige. Les honoraires de
dispensation sont exclus des montants décrits.

Le statut proposé reste donc `support_only`.

## 11. Base de données nationale des bâtiments

Source :
[Base de données nationale des bâtiments](https://www.data.gouv.fr/datasets/base-de-donnees-nationale-des-batiments).

La BDNB du CSTB constitue une carte d’identité du parc bâti par croisement géospatial de
nombreuses bases publiques. Des extractions départementales sont disponibles. Le dernier
millésime repéré est `2026-02.a`, publié le 25 mai 2026 et intégrant notamment des mises à
jour des fichiers fonciers, de la BAN et de la BD TOPO.

### Utilité

La BDNB peut servir de couche de résolution entre :

- parcelle cadastrale ;
- bâtiment géographique ;
- mutation DVF ;
- autorisation Sitadel ;
- adresse ;
- usage et caractéristiques du bâtiment.

Elle peut donc réduire les rapprochements manuels entre des sources utilisant des unités
immobilières différentes.

### Limites

La BDNB est une base dérivée, pas une source fiscale probatoire. Un bâtiment BDNB ne
correspond pas nécessairement à un local fiscal, une parcelle ou une autorisation unique.
Les attributs héritent des dates, erreurs et incertitudes des bases croisées.

Elle ne doit jamais servir à recalculer une taxe foncière ou une taxe d’aménagement à
partir des seules surfaces ou usages publiés.

Le statut proposé reste `support_only` jusqu’à un prototype départemental.

## Modèle « activité → fiscalité »

Les nouvelles sources nécessitent une table de relations distincte des fiches canoniques.

```json
{
  "activity_source_id": "sdes-sitadel3-authorizations",
  "activity_record_id": "identifiant source",
  "candidate_levy_id": "taxe-amenagement",
  "relation": "potential_taxable_event_for",
  "valid_at": "2026-06-01",
  "reason": "type d'autorisation et caractéristiques publiées",
  "confidence": "candidate",
  "review_status": "unreviewed",
  "does_not_prove": [
    "taxable_event",
    "tax_base",
    "amount_due",
    "payment"
  ]
}
```

Types de relations supplémentaires à prévoir :

- `potential_taxable_event_for` ;
- `potential_taxable_asset_for` ;
- `market_context_for` ;
- `physical_base_context_for` ;
- `parameter_for` ;
- `aggregate_control_for` ;
- `excluded_from` ;
- `below_publication_threshold` ;
- `unresolved`.

## Contrôles automatiques recommandés

### Contrôle immobilier

```text
DVF par département et mois
    ↔ taux et options DMTO
    ↔ SMCL puis balances annuelles
```

L’objectif est de signaler un écart de tendance, pas de reconstruire les droits ligne par
ligne.

### Contrôle taxe d’aménagement

```text
Sitadel3
    ↔ délibérations DELTA
    ↔ taux, zones et exonérations
    ↔ comptes locaux
```

Les autorisations annulées ou modifiées doivent rester visibles dans le cycle.

### Contrôle IFER

```text
ANFR ou registre RTE
    ↔ technologie et date
    ↔ seuil et tarif juridique
    ↔ bénéficiaire territorial
    ↔ produit REI ou compte M57
```

Le nombre d’actifs candidats ne doit pas être présenté comme un nombre d’unités taxées.

### Contrôle aéronautique

```text
paramètres DGAC
    ↔ trafic DGAC
    ↔ exemptions et correspondances
    ↔ recette publiée
```

Le calcul reste une estimation de contrôle.

### Contrôle TGAP

```text
IREP
    ↔ établissement Sirene
    ↔ composante TGAP possible
    ↔ statistiques DGFiP
```

Une quantité déclarée ne doit jamais être multipliée automatiquement par un tarif sans
preuve d’assujettissement et d’assiette fiscale.

## Résultats négatifs à conserver

### Pas de rôle national public des DMTO

DVF ne relie pas chaque mutation aux droits liquidés, exonérations et fractions
bénéficiaires. Cette absence interdit une reconstruction individuelle certaine.

### Pas de taxes d’immatriculation payées par véhicule

RSVERO ne contient ni la taxe régionale, ni les malus, ni les exonérations et remboursements
au niveau de chaque opération.

### Pas de rôle public IFER

ANFR et RTE décrivent les infrastructures. Aucun fichier national ouvert reliant chaque
actif à sa valeur imposable, son bénéficiaire et son produit n’a été identifié pendant
cette passe.

### Pas de table IREP → TGAP

Le registre environnemental et les déclarations fiscales obéissent à des seuils et champs
différents. Aucune correspondance nationale univoque n’a été trouvée.

### Pas de bases fiscales d’entreprise dans ARCEP ou Open Medic

Les jeux décrivent un marché agrégé ou des remboursements. Ils ne donnent pas les assiettes
déclarées aux prélèvements par opérateur ou laboratoire.

### Pas d’export public des déclarations aéronautiques

Les paramètres et le trafic sont ouverts, mais pas les déclarations et paiements détaillés
par taxe, aérodrome et transporteur.

## Ordre d’ingestion recommandé

### Lot 1 — DVF

Objectif : archiver correctement une source volumineuse à remplacement intégral et valider
le regroupement des lignes en mutations candidates.

### Lot 2 — Sitadel3

Objectif : mettre en place une collecte mensuelle par API avec gestion des événements et
de la rupture Sitadel2/Sitadel3.

### Lot 3 — inventaires candidats IFER

Objectif : ingérer un snapshot ANFR et un snapshot RTE, puis tester le modèle
`actif × technologie × exploitant × territoire × date`.

### Lot 4 — aviation

Objectif : joindre les tarifs versionnés de la DGAC aux trois séries de trafic, sans
convertir l’estimation en recette observée.

### Lot 5 — RSVERO

Objectif : construire des agrégats stables par type de véhicule et motorisation et les
rapprocher des recettes nationales.

### Lot 6 — IREP

Objectif : préparer la couverture des installations et déchets du champ TGAP en conservant
les seuils et ruptures déclaratives.

### Lot 7 — ARCEP

Objectif : versionner les définitions des indicateurs sectoriels et produire des contrôles
de marché.

### Lot 8 — sources de support

Objectif : tester Open Medic et une extraction départementale BDNB sans les promouvoir au
rang de preuve fiscale.

## Règles supplémentaires anti-inférence

1. **Mutation DVF n’est pas liquidation DMTO.**
2. **Ligne DVF n’est pas transaction.**
3. **Valeur foncière n’est pas automatiquement assiette taxable.**
4. **Autorisation d’urbanisme n’est pas fait générateur définitif.**
5. **Surface autorisée n’est pas assiette fiscale validée.**
6. **Immatriculation n’est pas taxe payée.**
7. **Commune de l’utilisateur n’est pas nécessairement domicile du redevable.**
8. **Support, antenne, station et système radio sont des unités différentes.**
9. **Installation électrique n’est pas unité IFER certaine.**
10. **Puissance installée n’est pas valeur imposable.**
11. **Passager ou tonne transportée n’est pas toujours taxable.**
12. **Composante tarifaire aéronautique n’est pas nouvelle taxe.**
13. **Estimation trafic × tarif n’est pas recette observée.**
14. **Émission ou déchet déclaré n’est pas dette TGAP.**
15. **Absence dans IREP n’est pas absence d’activité polluante.**
16. **Revenu de marché ARCEP n’est pas chiffre d’affaires fiscal.**
17. **Remboursement Open Medic n’est pas chiffre d’affaires pharmaceutique.**
18. **Bâtiment BDNB n’est pas local fiscal.**
19. **Agrégat protégé ou ligne résiduelle ne doit pas être attribué à une unité précise.**
20. **Toute estimation doit porter un type et une incertitude distincts des observations.**

## Décision recommandée pour l’issue #36

Le prochain chantier à fort rendement est **DVF**, non pour recalculer les DMTO, mais pour
mettre en place un pipeline robuste de snapshots remplacés et de regroupement de lignes.
Ce mécanisme sera réutilisable pour plusieurs autres sources volumineuses.

Le deuxième chantier est **Sitadel3**, qui apporte une source mensuelle et une API pour les
familles taxe d’aménagement et archéologie préventive.

Le troisième chantier doit ingérer conjointement **ANFR** et le registre **RTE**. Cette
comparaison démontrera comment plusieurs registres techniques peuvent documenter les
composantes de l’IFER sans transformer chaque actif en dette fiscale.

Enfin, le couple **paramètres DGAC + trafic DGAC** fournit un bon cas de test pour les
estimations de contrôle : le projet pourra comparer une assiette physique, un tarif daté
et une recette publiée tout en conservant explicitement les exemptions et agrégats.
