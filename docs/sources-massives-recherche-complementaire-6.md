# Septième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète les six passes précédentes. Le registre structuré associé est
[`data/reference/bulk-sources-supplement-6-2026-09-03.json`](../data/reference/bulk-sources-supplement-6-2026-09-03.json).

## Résultat principal

Les recherches précédentes ont identifié les sources juridiques, budgétaires, comptables,
déclaratives, territoriales et physiques. Cette passe ajoute une couche indispensable :
les **référentiels de classement et de champ** permettant de décider à quelles entreprises,
activités, conventions, installations, services ou marchés une règle peut s’appliquer.

Les résultats les plus importants sont :

1. la **BNV-D**, directement issue des déclarations utilisées pour établir la redevance
   pour pollutions diffuses, avec ventes depuis 2008 et achats depuis 2013 ;
2. la coexistence en 2026 de la **NAF rév. 2** et de la future **NAF 2025**, qui impose de
   versionner toute jointure sectorielle ;
3. la base **KALI** et sa table IDCC, qui permettent de distinguer les obligations légales
   des obligations seulement conventionnelles ;
4. le registre national des **ICPE**, disponible en export et API et mis à jour
   quotidiennement ;
5. le nouveau portail **SINOE-Déchets**, qui publie des référentiels nationaux d’acteurs,
   services, communes, compétences, équipements et flux ;
6. le triptyque **REGAFI – ACPR/Webstat – EIOPA** pour le périmètre et les agrégats du
   marché de l’assurance ;
7. les données ouvertes de l’**Autorité de régulation des transports**, qui couvrent les
   marchés ferroviaires, routiers, autoroutiers et aéroportuaires ;
8. le **PCI**, qui fournit une référence géométrique et cadastrale massive pour les
   rapprochements immobiliers.

La chaîne de résolution devient :

```text
activité ou installation
    → nomenclature ou registre de champ
    → opérateur ou bénéficiaire identifié
    → règle légale ou conventionnelle
    → code déclaratif ou de recouvrement
    → prélèvement candidat
    → recette administrative, budgétaire ou statistique
```

Aucune flèche ne doit être créée sans source, date et niveau de confiance.

## Matrice de complémentarité

| Champ | Référentiel de classement | Référentiel d’activité | Preuve juridique | Contrôle de produit |
| --- | --- | --- | --- | --- |
| Contributions de branche | NAF, IDCC, KALI | Sirene, DSN, CTP | Code du travail, CSS, textes d’extension | Urssaf, PLACSS, comptes sociaux |
| Redevance pollutions diffuses | catégories BNV-D | ventes et achats BNV-D | code de l’environnement et textes tarifaires | agences de l’eau, comptes et statistiques |
| TGAP et installations industrielles | nomenclature ICPE | ICPE, IREP | CIBS, BOFiP | DGFiP, budget et NTL |
| Déchets ménagers | services et compétences SINOE | flux, équipements et coûts | CGCT, délibérations | REI, M57, balances locales |
| Taxes d’assurance | REGAFI, branches prudentielles | ACPR/Webstat, EIOPA | CIBS et doctrine | budget, comptes bénéficiaires, NTL |
| Transports régulés | opérateurs et infrastructures ART | trafic, circulation et résultats | textes sectoriels | budget, comptes et statistiques |
| Immobilier | PCI, COG, BDNB | DVF, Sitadel3 | CGI/CIBS et décisions locales | DGFiP et comptes locaux |

Cette matrice sépare volontairement quatre notions : classification, activité, droit et
produit. Une source ne doit pas être utilisée pour répondre à une question qu’elle ne
mesure pas.

## 1. BNV-D : une source massive très proche de l’assiette d’une redevance

Sources :

- [BNV-D Traçabilité sur data.gouv.fr](https://www.data.gouv.fr/datasets/bnv-d-tracabilite-donnees-sur-les-ventes-de-produits-phytopharmaceutiques-1) ;
- [portail de consultation des ventes et achats](https://ventes-produits-phytopharmaceutiques.eaufrance.fr/search) ;
- [API Hub’Eau](https://hubeau.eaufrance.fr/page/api-vente-et-achat-de-produits-phytopharmaceutiques) ;
- [annonce du millésime 2025](https://www.eaufrance.fr/actualites/linfographie-et-les-donnees-ouvertes-de-la-bnv-d-millesime-2025-sont-disponibles).

La Banque nationale des ventes de produits phytopharmaceutiques par les distributeurs
agréés est alimentée par les déclarations des distributeurs. Les données de vente servent
notamment à établir la redevance pour pollutions diffuses.

Le millésime 2025, mis en ligne le 21 avril 2026, comprend :

- les ventes de 2008 à 2024 ;
- les achats de 2013 à 2024 ;
- les produits et substances ;
- le numéro d’autorisation de mise sur le marché ;
- la fonction du produit ;
- la catégorie de redevance ;
- le territoire du vendeur ou de l’acheteur selon le jeu ;
- les quantités agrégées.

Les données sont disponibles en téléchargement direct, en CSV ou CSV compressé selon le
millésime, et via l’API Hub’Eau.

### Pourquoi cette source est prioritaire

La BNV-D est plus proche du calcul d’un prélèvement que la plupart des bases d’activité
recensées jusque-là. Elle contient une catégorie de redevance et provient des déclarations
utilisées dans le dispositif de perception.

Elle permet notamment de :

- inventorier les produits et substances entrant dans chaque catégorie ;
- suivre les changements de catégorie entre millésimes ;
- agréger les quantités par territoire et année ;
- comparer ventes et achats ;
- détecter des produits disparus, nouveaux ou recodés ;
- rapprocher les quantités des recettes publiées par les agences de l’eau.

### Limites

La donnée ouverte reste agrégée. Les registres et bilans détaillés ne sont pas librement
accessibles. Une quantité ne donne donc pas directement :

- le redevable individuel ;
- le tarif applicable après toutes les règles de l’année ;
- les corrections ou régularisations ;
- le montant déclaré ;
- le montant acquitté ;
- l’encaissement comptable.

Le territoire du vendeur et celui de l’acheteur ont également des significations
différentes. Ils ne doivent pas être fusionnés dans une seule dimension géographique.

### Modèle d’extraction

```json
{
  "source_id": "ofb-bnvd-pesticides-2025",
  "data_kind": "sale",
  "activity_year": 2024,
  "product_id": "numero-amm-ou-identifiant-source",
  "substance_id": null,
  "charge_category": "categorie-publiee",
  "geographical_level": "department",
  "geographical_code": "00",
  "quantity": 0,
  "unit": "kg",
  "amount_kind": "physical_activity",
  "does_not_prove": [
    "amount_due",
    "payment",
    "revenue"
  ]
}
```

Livrable recommandé :
`data/reference/bnvd-pesticides-2008-2024.json`.

## 2. NAF rév. 2 et NAF 2025 : versionner l’activité économique

Sources :

- [NAF rév. 2](https://www.insee.fr/fr/information/2406147) ;
- [NAF 2025](https://www.insee.fr/fr/information/8617910) ;
- [principes et nomenclatures d’activités](https://www.insee.fr/fr/information/2120875).

La NAF rév. 2 reste la nomenclature applicable jusqu’au 31 décembre 2026. La NAF 2025
entrera en vigueur en janvier 2027. L’Insee publie les structures, libellés, notes
explicatives et une table de correspondance éditée en janvier 2026.

Cette transition concerne directement les sources suivantes :

- Sirene et les codes APE ;
- les taux et risques AT/MP ;
- les conventions collectives et IDCC ;
- les installations ICPE ;
- les statistiques sectorielles DGFiP ;
- les marchés ARCEP, ART, énergie et assurance ;
- les prélèvements dont le champ est défini par activité.

### Règle impérative

```text
code 2026 en NAF rév. 2
    ≠ code de même forme en NAF 2025
```

Chaque code doit porter sa version. La table de correspondance peut contenir des relations
un-à-plusieurs ou plusieurs-à-un ; elle ne constitue pas toujours une conversion certaine
d’un établissement individuel.

### Ce que la NAF ne prouve pas

Le code APE décrit l’activité principale exercée à des fins statistiques. Il ne prouve pas
à lui seul :

- l’assujettissement à un prélèvement ;
- la convention collective applicable ;
- le code risque AT/MP ;
- le régime fiscal d’une opération ;
- l’activité secondaire éventuellement taxable ;
- la situation de l’établissement à une autre date.

Livrable recommandé :
`data/reference/naf-versioned-crosswalk.json`.

## 3. KALI et l’IDCC : séparer le légal du conventionnel

Sources :

- [répertoire open data KALI](https://echanges.dila.gouv.fr/OPENDATA/KALI/) ;
- [recherche d’une convention collective](https://www.service-public.gouv.fr/particuliers/vosdroits/F78) ;
- [outil du Code du travail numérique](https://code.travail.gouv.fr/outils/convention-collective).

La DILA publie :

- une archive globale KALI datée du 13 juillet 2025 ;
- des incréments observés jusqu’au 2 septembre 2026 ;
- une table de correspondance entre conventions collectives et IDCC datée du 6 mars 2023.

L’IDCC est l’identifiant numérique d’une convention collective. Le corpus KALI contient les
conventions, accords, avenants et versions utiles pour suivre les contributions et
obligations instaurées au niveau d’une branche.

### Pourquoi cette source est importante pour les prélèvements obligatoires

Le brouillon historique peut contenir des contributions appelées « cotisation »,
« contribution » ou « versement » qui résultent uniquement d’un accord collectif ou d’un
contrat. Leur caractère obligatoire pour certaines entreprises ne suffit pas à les classer
comme prélèvements obligatoires au sens des comptes nationaux.

KALI doit donc servir à produire des relations telles que :

```text
obligation conventionnelle
    → prévue par un accord
    → applicable à un champ IDCC
    → éventuellement étendue
    → collectée par un organisme
    → candidate hors périmètre ou à examiner
```

Cette démarche évite d’assimiler une obligation privée conventionnelle à une créance
légale d’administration publique.

### Limites

- le fichier de correspondance IDCC visible est antérieur à 2026 ;
- le snapshot global doit être complété par les incréments dans l’ordre ;
- une entreprise peut relever d’une autre convention que celle suggérée par son seul code
  APE ;
- les accords non étendus ou d’entreprise suivent un champ différent ;
- la présence d’une contribution dans une convention ne fournit ni recette ni secteur
  bénéficiaire SEC.

Le premier prototype doit viser les textes mentionnant des contributions, garanties
collectives et organismes assureurs, plutôt que d’indexer immédiatement tout le corpus.

## 4. Installations classées : un référentiel national quotidien

Sources :

- [installations industrielles sur Géorisques](https://www.georisques.gouv.fr/donnees/bases-de-donnees/installations-industrielles) ;
- [API Géorisques](https://www.data.gouv.fr/dataservices/api-georisques).

Géorisques publie la liste des installations soumises à autorisation ou enregistrement,
en fonctionnement ou en cessation d’activité. Les données couvrent la France
métropolitaine et les DROM et sont mises à jour quotidiennement.

Les accès comprennent :

- des exports CSV et Shapefile ;
- des téléchargements nationaux, régionaux et départementaux ;
- des archives annuelles ;
- une API publique ;
- des informations sur les rubriques de nomenclature, régimes, statuts, exploitants,
  localisation, Seveso et IED selon les enregistrements.

### Apport fiscal

Le registre peut construire des candidats pour :

- certaines composantes de TGAP ;
- des redevances environnementales ;
- les contrôles de périmètre des établissements industriels ;
- le rapprochement avec IREP, Sirene et les statistiques DGFiP.

### Ce qu’il ne prouve pas

```text
installation ICPE
    ≠ établissement redevable certain
    ≠ rubrique fiscale
    ≠ quantité taxable
    ≠ dette TGAP
```

Les seuils et catégories environnementaux ne coïncident pas automatiquement avec les
seuils fiscaux. Les cessations, changements d’exploitant, modifications et évolutions de
nomenclature doivent être historisés.

Livrable recommandé :
`data/reference/icpe-snapshot-and-nomenclature.json`.

## 5. SINOE-Déchets : acteurs, services, communes et flux

Sources :

- [portail SINOE-Déchets](https://data.sinoe-dechets.ademe.fr/) ;
- [catalogue des jeux](https://data.sinoe-dechets.ademe.fr/datasets) ;
- [documentation de l’API catalogue](https://data.sinoe-dechets.ademe.fr/catalog-api-doc).

Le nouveau portail de l’ADEME affichait, lors de la vérification, 43 jeux et plus de
4,6 millions d’enregistrements. Il publie progressivement les données de la nouvelle
enquête 2025 et plusieurs référentiels historiques.

Les jeux repérés couvrent notamment :

- les acteurs ;
- les services publics ;
- les communes desservies ;
- les compétences ;
- les adhésions ;
- les équipements et déchèteries ;
- les flux de collecte ;
- les matrices et référentiels territoriaux ;
- les états de validation.

Les jeux publics sont consultables, téléchargeables et exposés par API.

### Apport pour la TEOM et la REOM

SINOE peut déterminer en masse :

- quelle collectivité organise le service ;
- quelles communes sont desservies ;
- quelles compétences sont exercées ;
- quels équipements et flux existent ;
- quel millésime et quel statut de validation décrivent le service.

Ces informations peuvent être rapprochées du REI, des comptes M57 et des balances locales.

### Limite fondamentale

Un même service peut être financé par :

- la TEOM ;
- la REOM ;
- une tarification incitative ;
- le budget général ;
- des recettes de vente ou soutiens ;
- plusieurs mécanismes successifs selon les années.

Le service ou la compétence ne prouve donc pas le prélèvement applicable. Un flux de
déchets, un coût de service et une recette fiscale sont trois mesures distinctes.

Le nouveau portail est encore en déploiement. Certaines données antérieures restent sur
l’ancien portail ; l’ingestion devra conserver un manifeste multiportail.

Livrable recommandé :
`data/reference/sinoe-waste-services-reference.json`.

## 6. Plan cadastral informatisé

Source :
[Plan cadastral informatisé](https://cadastre.data.gouv.fr/datasets/plan-cadastral-informatise).

Le PCI comprend environ 600 000 feuilles et couvre la France, à l’exception de Strasbourg
et de quelques communes voisines. Environ 34 700 communes disposent d’un plan vectoriel.

Les téléchargements sont proposés :

- en EDIGEO ou DXF-PCI ;
- en Lambert-93 ou Lambert CC neuf zones ;
- à la feuille, à l’EPCI ou au département ;
- par millésime, avec des URL stables et un alias `latest`.

Le dernier millésime vérifié est celui du 1er juin 2026.

### Apport

Le PCI peut résoudre les références géométriques entre :

- parcelles DVF ;
- autorisations Sitadel ;
- bâtiments BDNB ;
- sections cadastrales ;
- périmètres communaux ou intercommunaux.

Il évite de dépendre uniquement du rapprochement textuel des adresses.

### Limites

Le PCI ne fournit pas :

- le propriétaire ;
- le local fiscal ;
- la valeur locative cadastrale ;
- la base de taxe foncière ;
- le taux ;
- le produit fiscal.

Parcelle, bâtiment cadastral, local fiscal et bâtiment BDNB doivent rester des objets
distincts. L’alias `latest` ne doit jamais être enregistré comme millésime de provenance.

## 7. Assurance : opérateurs, marché français et contrôle européen

### REGAFI

Source :
[registre des agents financiers et organismes d’assurance](https://acpr.banque-france.fr/fr/professionnels/vos-outils-et-services/consulter-les-registres/registre-des-agents-financiers-et-des-organismes-dassurance).

REGAFI recense les entreprises autorisées dans les secteurs bancaire, financier, des
paiements et de l’assurance. Le registre est actualisé quotidiennement et dispose d’une
API.

Il peut fournir :

- l’identité d’un organisme ;
- son statut d’autorisation ;
- ses activités habilitées ;
- son pays d’origine ;
- ses droits d’intervention en établissement ou en libre prestation de services.

Une autorisation ne prouve toutefois ni l’activité réalisée en France pendant une année,
ni les primes taxables, ni le montant d’une taxe.

### ACPR / Webstat

Source :
[Webstat ACPR](https://webstat.banque-france.fr/fr/catalogue/acpr/).

Les rapports sur le marché français de la banque et de l’assurance renvoient vers des
séries Webstat. Ces séries peuvent apporter les primes, sinistres, organismes ou branches
selon les indicateurs retenus.

Le mécanisme d’export massif et les identifiants stables des séries doivent encore être
prototypés. La source reste donc `candidate`.

### EIOPA

Source :
[statistiques européennes de l’assurance](https://www.eiopa.europa.eu/tools-and-data/insurance-statistics_en).

EIOPA publie des classeurs et fichiers CSV sur les bilans, fonds propres, primes, sinistres,
dépenses, actifs et activités transfrontières. Les séries annuelles disponibles vont
jusqu’en 2025 et plusieurs tableaux trimestriels provisoires jusqu’au deuxième trimestre
2026 lors de la vérification.

### Modèle de rapprochement

```text
REGAFI
    → opérateur habilité

ACPR / Webstat
    → marché et agrégats français

EIOPA
    → contrôle européen et activité transfrontière

CIBS et doctrine
    → risques, taux et règles de territorialité fiscale

budget et comptes
    → recette du prélèvement
```

### Règles centrales

- prime prudentielle n’est pas nécessairement prime taxable ;
- branche Solvabilité II n’est pas catégorie de risque fiscal ;
- organisme autorisé n’est pas redevable actif sur toute la période ;
- activité transfrontière et territorialité de la taxe doivent être traitées séparément ;
- un agrégat de marché ne doit pas être distribué entre organismes ou risques.

## 8. Données ouvertes de l’Autorité de régulation des transports

Sources :

- [jeux de données en open data](https://www.autorite-transports.fr/observatoire-et-numerique/jeux-de-donnees-en-open-data/) ;
- [portail de données](https://opendata.autorite-transports.fr/).

L’ART publie des données issues des déclarations des acteurs régulés, retraitées à des fins
statistiques. Les domaines couverts comprennent :

- le transport ferroviaire de voyageurs et de marchandises ;
- les services librement organisés par autocar ;
- les gares routières ;
- les autoroutes concédées ;
- les aéroports ;
- les infrastructures, trafics, fréquentations, qualité et résultats financiers.

Une base de circulation des trains de voyageurs depuis 2017 est annoncée à environ 10 Go.
D’autres jeux sont annuels, trimestriels ou permanents selon le secteur.

### Apport

Ces données peuvent fournir des contrôles de marché et de bénéficiaire pour les
prélèvements portant sur :

- les infrastructures ferroviaires ;
- les entreprises de transport ;
- les autoroutes et concessions ;
- les gares routières ;
- les aéroports ;
- certaines affectations sectorielles.

### Limites

Les données ne constituent pas un audit fiscal. Les millésimes récents peuvent être
provisoires et l’année N-2 seulement semi-définitive. Le secret des affaires entraîne aussi
des agrégations ou masquages.

```text
circulation ou trafic
    ≠ assiette taxable certaine
    ≠ redevance d’infrastructure
    ≠ chiffre d’affaires fiscal
    ≠ prélèvement obligatoire
```

Un manifeste doit être créé avant toute ingestion afin de documenter pour chaque jeu son
identifiant, sa fréquence, son unité, son statut et ses règles d’agrégation.

## Nouveau graphe de classification

Les relations suivantes doivent compléter celles définies dans les passes précédentes :

- `activity_classified_as` ;
- `classification_crosswalk_to` ;
- `agreement_applies_candidate` ;
- `conventional_obligation_for` ;
- `regulated_installation_candidate_for` ;
- `operator_authorized_for` ;
- `service_organized_by` ;
- `service_covers_territory` ;
- `market_context_for` ;
- `physical_reference_of` ;
- `aggregate_control_for` ;
- `not_tax_evidence` ;
- `unresolved`.

Exemple :

```json
{
  "from_id": "icpe-installation-id",
  "to_id": "tgap-composante-candidate",
  "relation": "regulated_installation_candidate_for",
  "valid_at": "2026-09-03",
  "source_id": "georisques-icpe-current",
  "confidence": "candidate",
  "review_status": "unreviewed",
  "does_not_prove": [
    "taxable_activity",
    "tax_base",
    "amount_due",
    "payment"
  ]
}
```

## Contrôles automatiques proposés

### Redevance pour pollutions diffuses

```text
BNV-D ventes et achats
    ↔ catégories et tarifs juridiques par année
    ↔ comptes des agences de l’eau
    ↔ recette publiée
```

Le résultat est un contrôle agrégé. Il ne reconstitue pas les déclarations individuelles.

### Contributions conventionnelles

```text
Sirene et NAF versionnée
    ↔ candidat IDCC
    ↔ texte KALI et extension
    ↔ code DSN ou CTP
    ↔ bénéficiaire ou organisme
```

La sortie doit distinguer `legal_levy_candidate`, `conventional_private_obligation` et
`unresolved`.

### TGAP

```text
ICPE
    ↔ IREP
    ↔ Sirene
    ↔ composante TGAP possible
    ↔ statistique DGFiP
```

Aucun tarif ne doit être appliqué automatiquement aux quantités environnementales.

### Déchets ménagers

```text
SINOE acteur-service-commune
    ↔ COG et BANATIC
    ↔ décision TEOM ou REOM
    ↔ REI
    ↔ compte M57 et balance locale
```

Le service et son mode de financement doivent être datés séparément.

### Assurance

```text
REGAFI
    ↔ Sirene
    ↔ activité autorisée
    ↔ séries ACPR/EIOPA
    ↔ catégorie fiscale CIBS
    ↔ recette budgétaire
```

Les agrégats de primes ne doivent pas être ventilés entre les catégories fiscales sans
source officielle de passage.

## Résultats négatifs à conserver

### Pas de table NAF–IDCC–CTP–prélèvement

Les sources fournissent des correspondances partielles. Aucun référentiel officiel unique
ne relie l’activité, la convention, le code déclaratif, la créance juridique et le code
SEC.

### Correspondance IDCC visible datée de 2023

La table du répertoire KALI ne suffit pas pour une situation 2026. Elle doit être contrôlée
par le corpus et les textes courants.

### Pas de déclarations fiscales ouvertes des taxes d’assurance

REGAFI, ACPR et EIOPA couvrent les opérateurs et le marché, mais pas une table nationale
par redevable, risque fiscal, taux, assiette et bénéficiaire.

### Pas de relation certaine ICPE/IREP–TGAP

Aucune table publique univoque ne relie les rubriques environnementales, seuils fiscaux,
exonérations, déclarations et paiements.

### SINOE en transition

Le nouveau portail publie progressivement les jeux 2025, tandis qu’une partie de
l’historique reste sur l’ancien portail. L’absence actuelle d’un jeu ne signifie donc pas
qu’aucune donnée historique n’existe.

### BNV-D ouverte seulement sous forme agrégée

Les registres détaillés restent en accès restreint. Les données ouvertes ne permettent pas
de publier une dette individuelle.

### Webstat ACPR à prototyper

Les séries existent, mais l’export transversal, les identifiants stables et les limites
d’accès doivent être validés avant automatisation.

### Prélèvements culturels toujours peu couverts

Aucun jeu officiel transversal donnant simultanément assiettes, déclarants, montants et
bénéficiaires des taxes cinéma, audiovisuel et spectacle n’a été identifié pendant cette
passe.

## Ordre d’ingestion recommandé

### Lot 1 — BNV-D

Objectif : ingérer une source d’activité issue directement du dispositif d’une redevance,
avec comparaison entre téléchargement et API.

Livrable :
`data/reference/bnvd-pesticides-2008-2024.json`.

### Lot 2 — NAF versionnée

Objectif : sécuriser toutes les jointures sectorielles avant l’entrée en vigueur de la NAF
2025.

Livrable :
`data/reference/naf-versioned-crosswalk.json`.

### Lot 3 — ICPE

Objectif : produire un snapshot national des installations et de leur nomenclature, relié
à Sirene et IREP mais non aux dettes fiscales.

Livrable :
`data/reference/icpe-snapshot-and-nomenclature.json`.

### Lot 4 — prototype KALI-IDCC

Objectif : identifier les contributions seulement conventionnelles et éviter leur
classement automatique comme prélèvements obligatoires.

### Lot 5 — référentiels SINOE

Objectif : construire les dimensions acteur-service-commune-compétence nécessaires au
rapprochement TEOM/REOM.

Livrable :
`data/reference/sinoe-waste-services-reference.json`.

### Lot 6 — prototype cadastral

Objectif : tester sur un département la résolution PCI-DVF-Sitadel-BDNB, sans transformer
les objets géométriques en locaux fiscaux.

### Lot 7 — assurance

Objectif : combiner un snapshot REGAFI, les séries ACPR accessibles et les agrégats EIOPA
dans un fichier de contrôle clairement séparé des bases fiscales.

### Lot 8 — transports

Objectif : créer le manifeste des jeux ART et mesurer lesquels réduisent réellement les
recherches unitaires sur les prélèvements sectoriels.

## Règles supplémentaires anti-inférence

1. **NAF ou APE n’est pas assujettissement fiscal.**
2. **NAF 2025 n’est pas applicable aux données 2026.**
3. **Correspondance de nomenclature n’est pas identité certaine.**
4. **IDCC n’est pas prélèvement.**
5. **Obligation conventionnelle n’est pas automatiquement prélèvement obligatoire.**
6. **Code APE n’établit pas seul la convention applicable.**
7. **Installation ICPE n’est pas dette TGAP.**
8. **Rubrique ICPE n’est pas composante fiscale.**
9. **Quantité BNV-D n’est pas redevance acquittée.**
10. **Vente et achat BNV-D ont des géographies différentes.**
11. **Catégorie de redevance doit être datée avec son barème.**
12. **Service de déchets n’est pas mode de financement.**
13. **Flux physique de déchets n’est ni coût ni recette.**
14. **Parcelle PCI n’est pas local fiscal.**
15. **Alias `latest` n’est pas millésime de provenance.**
16. **Autorisation REGAFI n’est pas prime taxable.**
17. **Prime prudentielle n’est pas assiette TSCA.**
18. **Branche Solvabilité II n’est pas catégorie fiscale.**
19. **Activité de transport n’est pas prélèvement sectoriel.**
20. **Donnée provisoire ou masquée ne doit pas être attribuée à un opérateur précis.**
21. **État courant d’un registre ne remplace pas son historique.**
22. **Une jointure de noms sans identifiant reste un candidat.**
23. **Une source de classement ne prouve pas la recette.**
24. **Une source de marché ne prouve pas la base déclarée.**

## Décision recommandée pour l’issue #36

La prochaine ingestion à plus fort rendement est la **BNV-D**. Elle permet de documenter
une redevance avec une profondeur historique, des catégories de redevance, des fichiers
massifs et une API officielle, tout en offrant un bon cas de séparation entre quantité,
dette et recette.

La deuxième priorité est la dimension **NAF versionnée**, car elle conditionne la qualité
de presque toutes les jointures sectorielles et prépare le changement de nomenclature de
janvier 2027.

Le troisième chantier est le snapshot **ICPE**, qui peut couvrir nationalement les
installations réglementées et réduire les recherches établissement par établissement.

Le quatrième est le prototype **KALI-IDCC**. Sa valeur n’est pas de trouver davantage de
prélèvements, mais d’éliminer méthodiquement les obligations conventionnelles privées qui
pourraient être prises à tort pour des prélèvements obligatoires.

Cette séquence apporte une amélioration qualitative importante : elle permet non seulement
de découvrir des candidats, mais aussi de documenter en masse pourquoi certains éléments
doivent rester hors du périmètre ou en attente de preuve.
