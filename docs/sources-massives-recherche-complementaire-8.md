# Neuvième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète les huit passes précédentes. Le registre structuré associé est
[`data/reference/bulk-sources-supplement-8-2026-09-03.json`](../data/reference/bulk-sources-supplement-8-2026-09-03.json).

## Résultat principal

Cette passe documente cinq champs encore mal couverts :

- les installations nucléaires de base et leur état réglementaire ;
- la taxe annuelle sur les engins maritimes à usage personnel ;
- le zonage national des taxes portant sur les logements vacants ;
- les remontées mécaniques et les taxes communales liées à leur exploitation ;
- l’octroi de mer dans les cinq territoires concernés.

Les trois sources les plus directement exploitables sont :

1. les deux listes annuelles de l’**ASNR**, qui fournissent un inventaire national des
   installations nucléaires de base avec numéro, exploitant, catégorie, dates et état ;
2. les annexes juridiques de **Légifrance**, qui donnent directement les codes INSEE des
   communes relevant du zonage de la vacance des logements en 2026 et à partir de 2027 ;
3. le couple **paramètres TAEMUP + rapport annuel GUFIP**, qui relie règles de calcul,
   population taxable, population taxée, collecte et affectataires.

Les sources relatives aux remontées mécaniques et à l’octroi de mer sont utiles, mais leur
accès massif est moins homogène : CAIRN ne dispose pas d’un export public complet validé et
les documents d’octroi de mer restent fragmentés entre territoires, millésimes et formats.

La règle commune à toute cette passe est :

```text
installation, commune ou engin figurant dans un référentiel
    ≠ unité fiscale certaine
    ≠ montant dû
    ≠ paiement
    ≠ recette
```

Ces référentiels permettent d’établir le **périmètre candidat**. La qualification fiscale,
les règles de calcul et les montants doivent être apportés par d’autres couches de preuve.

## Matrice de complémentarité

| Famille | Référentiel de périmètre | Paramètres et droit | Activité ou population | Produit et affectation |
| --- | --- | --- | --- | --- |
| Taxes nucléaires | listes ASNR | lois financières, code de l’environnement et textes tarifaires | état et catégorie des INB | budget, comptes des bénéficiaires, NTL |
| TAEMUP | flotte enregistrée et taxable du GUFIP | CIBS et page ministérielle | navires et VNM taxables ou taxés | collecte GUFIP et affectataires |
| Logements vacants | annexes communales Légifrance | CGI et décrets de zonage | parc vacant dans d’autres sources | statistiques DGFiP et comptes publics |
| Remontées mécaniques | CAIRN | CGCT, délibérations et tarifs locaux | parc, trafic et investissements STRMTG | comptes communaux et statistiques locales |
| Octroi de mer | nomenclatures et délibérations territoriales | droit européen, loi nationale et actes locaux | importations et livraisons locales | Douane, budgets territoriaux et comptes |

Cette matrice évite d’utiliser une liste réglementaire pour répondre à une question de
recette ou une statistique d’activité pour répondre à une question de droit.

## 1. Listes annuelles des installations nucléaires de base

Sources :

- [page ASNR des listes d’INB](https://reglementation-controle.asnr.fr/espace-professionnels/installations-nucleaires/listes-des-installations-nucleaires-de-base) ;
- [décision n° 2026-DC-030 du 13 janvier 2026](https://reglementation-controle.asnr.fr/reglementation/bulletin-officiel-de-l-asnr/installations-nucleaires/decisions-reglementaires/decision-n-2026-dc-030-de-l-asnr-du-13-janvier-2026).

L’ASNR publie chaque année deux listes :

- les installations nucléaires de base figurant dans la liste dite « en exploitation » ;
- les installations déclassées depuis le 13 juin 2006.

Les listes vérifiées décrivent la situation au **31 décembre 2025**. La décision a été
adoptée le 13 janvier 2026 et publiée le 15 janvier 2026.

La liste dite en exploitation comporte **121 INB**. La liste historique comporte **13 INB
déclassées depuis le 13 juin 2006**.

### Champs disponibles

Les tableaux fournissent notamment :

- le numéro d’INB ;
- le nom et la localisation ;
- l’exploitant ;
- la nature de l’installation ;
- une catégorie ;
- la date de déclaration ou d’autorisation ;
- l’état réglementaire ;
- des observations.

Le numéro d’INB constitue une clé bien plus robuste qu’un nom d’installation, qui peut
évoluer ou désigner un site regroupant plusieurs unités.

### Attention au sens de « en exploitation »

Le titre de la liste ne signifie pas que toutes les installations produisent ou
fonctionnent. Le tableau contient des états distincts, notamment :

- fonctionnement ;
- arrêt définitif ;
- démantèlement ;
- autres situations précisées dans les observations.

Le champ `state` doit donc être conservé et utilisé. Il serait incorrect d’attribuer le
statut `operating` à toutes les lignes à partir du seul titre du PDF.

### Apport pour les prélèvements nucléaires

Le futur rapprochement peut suivre cette structure :

```text
INB ASNR
    → numéro stable
    → exploitant réglementaire
    → nature et catégorie
    → état et dates
    → prélèvement nucléaire candidat
    → coefficient ou tarif juridique
    → redevable fiscal
    → bénéficiaire
    → recette
```

Cette méthode permettra de détecter :

- une installation absente des anciennes fiches ;
- un exploitant ou un nom modifié ;
- une installation entrée en démantèlement ;
- une INB déclassée qui ne doit plus être traitée comme une installation courante ;
- une différence entre l’unité réglementaire et l’unité retenue par un texte fiscal.

### Ce que la liste ne prouve pas

La présence d’une INB ne prouve pas :

- qu’elle constitue l’unité retenue par le prélèvement ;
- que l’exploitant ASNR est le redevable juridique ;
- que la catégorie ASNR correspond directement à une catégorie tarifaire ;
- qu’une taxe a été liquidée ou payée ;
- le montant du produit ;
- le secteur institutionnel du bénéficiaire.

La catégorie réglementaire ne doit jamais être transformée automatiquement en coefficient
ou tarif fiscal.

### Ingestion proposée

Livrable :

```text
data/reference/asnr-inb-2025.json
```

Schéma minimal :

```json
{
  "reference_date": "2025-12-31",
  "list_kind": "listed_as_operating | declassified_since_2006",
  "inb_number": "000",
  "raw_name_and_location": "Texte de la source",
  "operator_raw": "Exploitant publié",
  "nature_raw": "Nature publiée",
  "category_raw": "Catégorie publiée",
  "declared_or_authorized_date": null,
  "state_raw": "État publié",
  "observations_raw": "Observations",
  "pdf_page": 1
}
```

Le fichier doit conserver les deux listes séparées, sans supprimer les installations
déclassées. Un diff entre millésimes permettra ensuite de suivre les changements d’état,
d’exploitant et de dénomination.

## 2. TAEMUP : paramètres, population et résultats

Sources :

- [page ministérielle de la TAEMUP](https://www.mer.gouv.fr/la-taxe-annuelle-sur-les-engins-maritimes-usage-personnel-taemup) ;
- rapport d’activité 2025 du Guichet unique de la fiscalité de la plaisance, publié en
  juin 2026.

La page ministérielle, mise à jour le **8 juin 2026** lors de la vérification, présente les
règles applicables aux engins maritimes à usage personnel. Elle renvoie au CIBS, articles
L. 423-1 à L. 423-37.

Elle documente notamment :

- les redevables ;
- les critères tenant au pavillon, à la résidence ou à l’enregistrement ;
- la date de référence ;
- les navires et véhicules nautiques à moteur concernés ;
- les seuils de longueur, de puissance administrative ou propulsive ;
- les droits liés à la coque et à la motorisation ;
- les tarifs particuliers des yachts et VNM ;
- les minorations liées à l’âge ;
- les exonérations ;
- la réduction applicable en Corse ;
- les paramètres annoncés à partir de 2027.

### Séparer la taxe de ses composantes de calcul

```text
TAEMUP
    ├── composante coque
    ├── composante moteur
    ├── tarif VNM éventuel
    ├── tarif yacht éventuel
    ├── minoration liée à l’âge
    ├── réduction territoriale éventuelle
    └── exonération éventuelle
```

Ces composantes ne doivent pas être publiées comme autant de prélèvements autonomes.

Les anciennes appellations — droit annuel de francisation et de navigation et droit de
passeport — doivent être conservées comme relations historiques, non comme prélèvements
courants supplémentaires.

### Transition entre 2026 et 2027

La page distingue les règles valables jusqu’au **31 décembre 2026** de paramètres qui
entreront en application le **1er janvier 2027**.

Chaque règle doit donc porter :

```text
valid_from
valid_to
publication_date
legal_reference
```

Un tarif annoncé pour 2027 ne doit jamais être appliqué à une situation ou à une collecte
2026.

### Rapport du GUFIP

Le rapport d’activité apporte la couche de résultats. Pour 2025, il indique notamment :

| Indicateur | Valeur publiée |
| --- | ---: |
| Flotte enregistrée | 1 109 000 engins |
| Flotte taxable | 159 255 engins |
| Engins taxés à l’ouverture de campagne | 96 841 |
| Cible brute | 54,62 M€ |
| Collecte nette | 52,67 M€ |

Le rapport distingue également les navires et les véhicules nautiques à moteur et décrit
les opérations de fiabilisation du registre.

### Affectations publiées pour 2025

| Affectataire | Montant publié |
| --- | ---: |
| Conservatoire du littoral | 39,00 M€ |
| Collectivité de Corse | 4,99 M€ |
| Société nationale de sauvetage en mer | 3,93 M€ |
| Budget général de l’État | 3,81 M€ |
| APER | 0,94 M€ |

Ces montants décrivent des affectations. Ils ne prouvent pas à eux seuls le classement SEC
de chaque bénéficiaire.

### Populations et montants à ne pas confondre

```text
flotte enregistrée
≠ flotte taxable
≠ flotte taxée à l’ouverture
≠ nombre de créances
≠ nombre de paiements

cible brute
≠ paiement spontané
≠ recouvrement complémentaire
≠ collecte nette
```

Les ventilations par âge, région ou catégorie d’engin sont des répartitions des populations
ou montants. Elles ne doivent pas être additionnées aux totaux dont elles constituent la
ventilation.

### Limite de l’accès public

Le rapport ne publie ni le registre individuel des navires et propriétaires ni les
créances détaillées. Il n’est donc pas possible de recalculer ou de vérifier individuellement
la taxe de chaque engin à partir des seules sources ouvertes.

Cette limitation est utile : le pipeline doit s’arrêter aux paramètres et contrôles
agrégés plutôt que fabriquer un pseudo-rôle fiscal.

### Ingestion proposée

Livrable :

```text
data/reference/taemup-parameters-and-results-2022-2027.json
```

Le fichier doit séparer :

- les règles et tarifs versionnés ;
- les populations annuelles ;
- les montants par type ;
- les affectataires ;
- les anciennes appellations ;
- les paramètres futurs.

Exemple :

```json
{
  "record_kind": "aggregate_result",
  "year": 2025,
  "indicator": "net_collection",
  "value": 52670000,
  "unit": "EUR",
  "amount_kind": "observed_net_collection",
  "source_locator": "rapport GUFIP, tableau ou page"
}
```

## 3. Zonage des logements vacants : 2026 et 2027

Sources :

- [décret n° 2013-392 du 10 mai 2013](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000027399823/) ;
- [décret n° 2025-1267 du 22 décembre 2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053143539) ;
- [décret n° 2026-831 du 25 août 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054761859).

Légifrance publie de très grandes annexes contenant les noms et codes INSEE des communes
relevant du zonage caractérisé par un déséquilibre marqué entre l’offre et la demande de
logements.

### Situation applicable en 2026

Le décret du 10 mai 2013, dans sa version modifiée par le décret du 22 décembre 2025,
reste applicable jusqu’au **31 décembre 2026**.

Pour cette période, il faut distinguer :

- la taxe sur les logements vacants applicable de plein droit dans son champ ;
- la taxe d’habitation sur les logements vacants qui suppose une décision locale dans les
  conditions prévues par la loi ;
- la majoration de taxe d’habitation sur les résidences secondaires, également dépendante
  d’une décision locale.

Le fait qu’une commune soit présente dans le zonage ne fusionne pas ces mécanismes.

### Nouveau régime à partir de 2027

Le décret n° 2026-831 du 25 août 2026 accompagne la création de la taxe sur la vacance des
logements et l’habitation des logements vacants, appelée ici **TVLH**, applicable à partir
du **1er janvier 2027**.

Le texte précise que le nouveau régime remplace les mécanismes antérieurs et maintient le
même périmètre géographique de référence, organisé en deux catégories de communes.

Le décret de 2013 sera abrogé à compter du 1er janvier 2027.

### Importance de la transition

Le modèle ne doit pas prolonger artificiellement une fiche `TLV` après le 31 décembre 2026.
Il faut publier une relation de remplacement :

```text
TLV / THLV jusqu’au 2026-12-31
    └── replaced_by à partir du 2027-01-01
            → TVLH
```

Les règles propres à la majoration sur les résidences secondaires doivent rester séparées.

### Avantage massif de la source

Les annexes comportent directement :

- le code INSEE ;
- le nom de la commune ;
- l’agglomération ou le groupe ;
- la catégorie juridique ;
- la version du texte ;
- la date d’application.

Il est donc inutile de tester les communes une par une dans un simulateur. La liste peut
être extraite une seule fois, reliée au COG et historisée.

### Ce que le zonage ne prouve pas

La présence d’une commune ne prouve pas qu’un logement individuel :

- est effectivement vacant ;
- atteint la durée requise ;
- est habitable ;
- ne bénéficie pas d’une exemption ;
- appartient au bon redevable ;
- a fait l’objet d’une imposition ;
- a généré un montant donné.

Le zonage est un filtre de périmètre, pas un rôle fiscal.

### Ingestion proposée

Livrable :

```text
data/reference/vacant-housing-tax-communes-2026-2027.json
```

Schéma :

```json
{
  "legal_text_id": "JORFTEXT…",
  "scope_category": "category_1 | category_2",
  "commune_code": "00000",
  "commune_name_raw": "Nom publié",
  "agglomeration_raw": null,
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31",
  "applicable_mechanism": "TLV_or_local_option",
  "cog_match_status": "exact | historical | ambiguous | unmatched"
}
```

Le pipeline doit comparer les annexes 2026 et 2027, signaler toute différence et conserver
les changements communaux issus des fusions ou modifications de code.

## 4. CAIRN et les remontées mécaniques

Sources :

- [consultation publique CAIRN](https://cairn.din.developpement-durable.gouv.fr/consultationInternet.do) ;
- [présentation par le STRMTG](https://www.strmtg.developpement-durable.gouv.fr/base-de-donnees-cairn-a398.html) ;
- [rapports annuels sur le parc](https://www.strmtg.developpement-durable.gouv.fr/le-parc-et-les-dispositions-du-controle-des-a666.html).

CAIRN est le catalogue informatique national des remontées mécaniques et tapis roulants de
stations de montagne. La consultation publique vérifiée affichait la version **V7.22.1**,
mise à jour le **13 mai 2026**.

Le service distingue :

- une consultation publique ;
- des fonctions destinées aux exploitants ;
- des accès pour certains organismes agréés ;
- des guides ou documents d’utilisation.

### Potentiel documentaire

CAIRN peut fournir ou aider à résoudre :

- un identifiant d’installation ;
- la station ;
- la commune ;
- la famille ou le type de remontée ;
- l’exploitant candidat ;
- des caractéristiques techniques ;
- l’état de l’installation.

Cette information est utile pour contrôler le périmètre technique des taxes communales
sur les remontées mécaniques.

### Pourquoi la source reste `candidate`

Aucun export public exhaustif ni aucune API documentée n’a été validé pendant cette passe.
L’interface peut être interrogée publiquement, mais elle ne doit pas être aspirée de manière
non documentée.

Avant toute promotion à `ready_to_ingest`, il faut :

1. tester la stabilité des identifiants ;
2. documenter précisément les filtres et résultats ;
3. déterminer si un export officiel peut être obtenu ;
4. mesurer la couverture des installations actives et historiques ;
5. conserver la version de l’application et la date de la consultation.

### Une installation n’est pas une unité fiscale certaine

```text
remontée mécanique
    → installation technique

exploitant
    → opérateur du service

propriétaire
    → détenteur de l’actif

commune ou groupement
    → autorité ou bénéficiaire potentiel
```

Ces rôles peuvent être portés par des personnes différentes. La taxe peut aussi dépendre
d’une délibération, d’un chiffre d’affaires ou d’une autre assiette qui n’apparaît pas dans
CAIRN.

### Rapports annuels du STRMTG

Le STRMTG publie séparément des rapports sur :

- le parc ;
- le trafic ;
- les investissements ;
- les événements d’exploitation ;
- les contrôles ;
- l’accidentologie.

Les rapports, dont celui de la campagne 2024-2025, sont téléchargeables et immédiatement
utilisables pour contrôler les agrégats par massif ou famille d’installation.

Ils ne remplacent pas le catalogue installation par installation et ne fournissent ni le
chiffre d’affaires taxable ni le produit communal.

### Ingestion proposée

Première étape :

```text
data/reference/strmtg-ski-lifts-reports-manifest.json
```

La comparaison entre le parc agrégé des rapports et les résultats accessibles dans CAIRN
permettra ensuite de mesurer la couverture avant de demander un export officiel.

## 5. Corpus de l’octroi de mer

Sources :

- [open data Douane consacré à l’octroi de mer](https://www.douane.gouv.fr/la-douane/opendata/mots-cles/octroi-de-mer) ;
- [jeu data.gouv.fr sur l’octroi de mer](https://www.data.gouv.fr/datasets/octroi-de-mer-dans-les-departements-doutre-mer) ;
- [présentation de la fiscalité douanière outre-mer](https://www.douane.gouv.fr/fiche/fiscalite-douaniere-dans-les-departements-doutre-mer).

L’octroi de mer concerne les cinq territoires suivants :

- Guadeloupe ;
- Guyane ;
- Martinique ;
- Mayotte ;
- La Réunion.

Il peut porter sur les importations et sur certaines livraisons de productions locales,
selon les règles et exonérations applicables.

Le portail Douane recensait une quarantaine de publications relatives à ce thème pendant
la recherche. Les ressources comprennent des PDF, feuilles de calcul et archives
compressées, mais leur répartition est très hétérogène.

### Dimensions à conserver séparément

```text
octroi de mer
    ├── territoire
    ├── composante externe ou interne
    ├── octroi de mer régional
    ├── nomenclature de produit
    ├── taux
    ├── exonération
    ├── secteur ou intrant éligible
    ├── délibération
    └── date d’effet
```

Une ligne de nomenclature ou un taux territorial n’est pas une taxe autonome.

### Problème d’actualité des documents

Les ressources historiques sont utiles pour reconstruire les séries, mais leur présence
sur data.gouv.fr ou le portail Douane ne prouve pas qu’elles décrivent encore le tarif
en vigueur en 2026.

Les exemples retrouvés comprennent des documents territoriaux allant notamment jusqu’en
2024. Aucun fichier machine-readable unique et courant couvrant simultanément les cinq
territoires, les composantes internes, externes et régionales, les taux et les exonérations
n’a été identifié.

La source reste donc `candidate`.

### Pourquoi un manifeste est nécessaire

Avant toute extraction nationale, chaque ressource doit porter :

```json
{
  "territory": "Guadeloupe",
  "component": "external | internal | regional | exemption",
  "publication_id": "identifiant ou nom du fichier",
  "deliberation_id": null,
  "valid_from": null,
  "valid_to": null,
  "product_nomenclature": "version publiée",
  "format": "xlsx",
  "retrieved_at": "2026-09-03",
  "sha256": "…",
  "current_status": "current | superseded | unknown"
}
```

Le statut `unknown` doit être utilisé lorsque la ressource la plus récente n’a pas été
reliée à une délibération et une date d’effet certaines.

### Ingestion proposée

Livrable :

```text
data/reference/octroi-de-mer-publications-manifest.json
```

Le prototype doit porter sur un territoire disposant d’un tableur suffisamment récent,
puis comparer le résultat à la délibération correspondante. Une consolidation des cinq
territoires ne doit être tentée qu’après stabilisation des nomenclatures et composantes.

## Modèle de relations enrichi

Cette passe nécessite les types de relations suivants :

- `regulated_installation_candidate_for` ;
- `listed_in_scope_for` ;
- `declassified_from` ;
- `historical_name_of` ;
- `parameter_for` ;
- `component_of` ;
- `allocated_to` ;
- `replaced_by` ;
- `local_option_for` ;
- `technical_asset_candidate_for` ;
- `territorial_rate_for` ;
- `exemption_for` ;
- `aggregate_control_for` ;
- `unresolved`.

Exemple nucléaire :

```json
{
  "from_id": "asnr-inb-000",
  "to_id": "nuclear-tax-candidate",
  "relation": "regulated_installation_candidate_for",
  "valid_at": "2025-12-31",
  "source_id": "asnr-inb-lists-2025",
  "confidence": "candidate",
  "review_status": "unreviewed",
  "does_not_prove": [
    "taxable_unit",
    "liable_person",
    "rate",
    "amount_due",
    "payment"
  ]
}
```

Exemple de transition juridique :

```json
{
  "from_id": "tlv-2026",
  "to_id": "tvlh-2027",
  "relation": "replaced_by",
  "valid_from": "2027-01-01",
  "source_id": "legifrance-vacant-housing-geography-2026-2027",
  "confidence": "verified"
}
```

## Contrôles automatiques proposés

### Nucléaire

```text
liste ASNR annuelle
    ↔ installations du millésime précédent
    ↔ exploitants Sirene
    ↔ textes tarifaires
    ↔ comptes des bénéficiaires
```

Alertes : nouvelle INB, déclassement, changement d’état, changement d’exploitant, absence de
relation fiscale ou correspondance multiple.

### Plaisance

```text
paramètres TAEMUP
    ↔ populations GUFIP
    ↔ collecte nette
    ↔ affectataires
```

Alertes : utilisation d’un tarif futur, confusion flotte enregistrée-taxable-taxée,
confusion cible brute-collecte nette ou somme des affectations différente du total publié.

### Logements vacants

```text
annexe Légifrance 2026
    ↔ annexe 2027
    ↔ COG
    ↔ décisions locales
```

Alertes : changement de code, commune sans correspondance COG, mécanisme appliqué hors de sa
période, perte de la catégorie juridique ou décision locale manquante.

### Remontées mécaniques

```text
agrégats STRMTG
    ↔ résultats CAIRN
    ↔ COG et Sirene
    ↔ délibérations et comptes locaux
```

Alertes : identifiant instable, commune ou exploitant ambigu, parc technique non couvert,
installation historique traitée comme active.

### Octroi de mer

```text
manifestes territoriaux
    ↔ délibérations
    ↔ nomenclatures produits
    ↔ dates d’effet
    ↔ recettes douanières et territoriales
```

Alertes : tarif ancien traité comme courant, produit sans version de nomenclature,
composantes interne-régionale fusionnées ou document non relié à une date d’entrée en
vigueur.

## Résultats négatifs à conserver

### Pas de table fiscale nucléaire complète

L’ASNR fournit un excellent inventaire réglementaire, mais aucune table publique unique ne
relie chaque INB, le coefficient fiscal, le redevable, le paiement et le bénéficiaire.

### Pas de rôle individuel TAEMUP ouvert

Le GUFIP publie des populations et résultats agrégés, mais pas le registre individuel des
navires et créances.

### Pas de rôle national des logements vacants

Les décrets donnent le champ communal. Aucun fichier public ne relie chaque logement, sa
durée de vacance, ses exemptions et son montant.

### Pas d’export complet CAIRN validé

La consultation publique existe, mais aucune API ou extraction nationale officiellement
documentée n’a été trouvée.

### Pas de produit fiscal des remontées mécaniques dans le catalogue technique

CAIRN et les rapports STRMTG décrivent les installations et l’activité, pas les chiffres
d’affaires taxables, délibérations et produits communaux.

### Pas de table nationale courante de l’octroi de mer

Le corpus est officiel mais fragmenté. Il n’existe pas, parmi les ressources identifiées,
un fichier unique et contemporain couvrant toutes les composantes et tous les territoires.

## Ordre d’ingestion recommandé

### Lot 1 — communes des taxes de vacance

Objectif : profiter de listes juridiques déjà codées en INSEE et documenter correctement
la transition du 1er janvier 2027.

Livrable :

```text
data/reference/vacant-housing-tax-communes-2026-2027.json
```

### Lot 2 — listes ASNR

Objectif : construire un référentiel annuel national de taille maîtrisée et tester les
diffs d’état réglementaire.

Livrable :

```text
data/reference/asnr-inb-2025.json
```

### Lot 3 — TAEMUP

Objectif : structurer dans une même famille les paramètres, populations, montants et
affectataires, sans fabriquer de microdonnées.

Livrable :

```text
data/reference/taemup-parameters-and-results-2022-2027.json
```

### Lot 4 — rapports STRMTG

Objectif : archiver les rapports téléchargeables et obtenir des agrégats de référence avant
tout prototype CAIRN.

### Lot 5 — prototype CAIRN

Objectif : vérifier la stabilité des identifiants et rechercher une voie officielle
d’export, sans automatiser l’interface de consultation.

### Lot 6 — manifeste de l’octroi de mer

Objectif : identifier, dater et classer chaque document territorial avant toute
normalisation des taux.

## Règles supplémentaires anti-inférence

1. **INB réglementaire n’est pas unité fiscale.**
2. **Liste dite en exploitation n’est pas synonyme de fonctionnement.**
3. **Catégorie ASNR n’est pas coefficient fiscal.**
4. **Exploitant réglementaire n’est pas nécessairement redevable.**
5. **Installation déclassée ne doit pas disparaître de l’historique.**
6. **Flotte enregistrée n’est pas flotte taxable.**
7. **Flotte taxable n’est pas flotte effectivement taxée.**
8. **Cible brute TAEMUP n’est pas collecte nette.**
9. **Composante coque ou moteur n’est pas prélèvement autonome.**
10. **Ancienne appellation n’est pas nouvelle créance.**
11. **Paramètre 2027 n’est pas applicable en 2026.**
12. **Affectation publiée n’est pas classement SEC du bénéficiaire.**
13. **Commune dans le zonage n’est pas logement taxable.**
14. **TLV, THLV, majoration sur les résidences secondaires et TVLH ne doivent pas être fusionnées.**
15. **Décision locale requise ne se déduit pas du seul zonage national.**
16. **Code communal doit être interprété avec le bon millésime du COG.**
17. **Remontée mécanique n’est pas unité fiscale certaine.**
18. **Parc ou trafic STRMTG n’est pas chiffre d’affaires taxable.**
19. **Consultation publique n’est pas export massif.**
20. **Absence de résultat CAIRN n’est pas absence d’installation.**
21. **Ligne de produit d’octroi de mer n’est pas prélèvement autonome.**
22. **Octroi de mer interne, externe et régional restent séparés.**
23. **Document ancien présent sur un portail n’est pas tarif courant.**
24. **Nombre de publications n’est ni nombre de taux ni nombre de créances.**
25. **Toute valeur future doit porter une date d’entrée en vigueur.**
26. **Toute table réglementaire doit conserver le texte brut et le localisateur source.**

## Décision recommandée pour l’issue #36

La prochaine ingestion à plus fort rendement est le **zonage des logements vacants**. Les
deux annexes comportent directement les codes INSEE, leur extraction est déterministe et
la réforme applicable au 1er janvier 2027 fournit un excellent cas de gestion d’une
transition juridique.

Le deuxième chantier est le référentiel **ASNR des INB**. Il est national, annuel, de
taille raisonnable et possède un identifiant réglementaire stable. Il permettra de tester
la différence entre périmètre réglementaire et unité fiscale.

Le troisième chantier est le couple **TAEMUP–GUFIP**. Il permettra de démontrer comment
combiner des paramètres semi-structurés et un rapport agrégé sans inventer de registre
individuel.

Les remontées mécaniques et l’octroi de mer doivent rester en phase de manifeste et de
prototype. Dans les deux cas, la priorité est d’établir une méthode d’accès officielle,
versionnée et reproductible avant de promettre une ingestion nationale.
