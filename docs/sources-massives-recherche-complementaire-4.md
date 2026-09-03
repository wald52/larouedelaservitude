# Cinquième recherche complémentaire sur les sources massives

Date de vérification : **3 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète :

- [`sources-massives-prelevements-obligatoires.md`](sources-massives-prelevements-obligatoires.md) ;
- [`sources-massives-recherche-complementaire.md`](sources-massives-recherche-complementaire.md) ;
- [`sources-massives-recherche-complementaire-2.md`](sources-massives-recherche-complementaire-2.md) ;
- [`sources-massives-recherche-complementaire-3.md`](sources-massives-recherche-complementaire-3.md).

Le registre structuré associé est
[`data/reference/bulk-sources-supplement-4-2026-09-03.json`](../data/reference/bulk-sources-supplement-4-2026-09-03.json).

## Résultat principal

Les recherches précédentes ont surtout recensé des sources de droit, de recettes et de
décisions. Cette passe identifie les **référentiels d’infrastructure** qui permettent de
les relier sans rapprochement manuel ligne par ligne.

Les trois résultats les plus structurants sont :

1. une épine dorsale territoriale et institutionnelle composée du **COG**, de
   **BANATIC**, de **Sirene** et du plan comptable **M57** ;
2. des sources de paramètres ou d’assiettes massives pour les **accises énergétiques**,
   les **tabacs**, les **cotisations AT/MP**, les **redevances de l’eau** et les
   **contributions de formation et d’apprentissage** ;
3. des contrôles sectoriels supplémentaires pour les **droits de douane** et les
   **prélèvements sur les jeux**.

La priorité n’est plus seulement de trouver des listes de prélèvements. Il faut aussi
construire les tables qui relient :

```text
nom publié
    ↔ identifiant juridique
    ↔ SIREN ou SIRET
    ↔ code géographique
    ↔ périmètre intercommunal
    ↔ code de déclaration
    ↔ compte comptable
    ↔ ligne statistique
    ↔ bénéficiaire
```

Sans ces dimensions, chaque nouvelle source produit ses propres noms, territoires et
unités, et le coût de rapprochement se déplace simplement de la recherche vers la
normalisation.

## Sources nouvelles de cette passe

| Priorité | Source | Apport massif | Limite centrale |
| --- | --- | --- | --- |
| 1 | Douane — droits et taxes énergétiques | instantanés ODS des tarifs par produit et date | tarif sans quantité ni recette |
| 1 | Douane — tabacs | prix homologués et volumes mensuels depuis 2018 | prix ou livraison sans recette fiscale |
| 1 | COG 2026 et historique | codes, noms, événements et continuité territoriale | aucune information fiscale |
| 1 | BANATIC | groupements, compétences, profils et périmètres fiscaux | compétence déclarée sans preuve de bénéficiaire |
| 1 | Sirene | SIREN/SIRET, historiques et successions | identité sans classement SEC |
| 1 | M57 2026 | comptes locaux et transpositions M14/M52 | compte comptable différent d’une créance |
| 1 | Taux AT/MP 2026 | codes risque et taux collectifs annuels | taux collectif différent du taux employeur |
| 1 | SISPEA | services, performances et tarifs de l’eau de 2008 à 2026 | prix du service mêlant plusieurs composantes |
| 2 | BNPE / Hub’Eau | volumes annuels prélevés issus de la gestion des redevances | volume sans tarif ni montant acquitté |
| 2 | SIRET-OPCO | rattachement des employeurs à leur OPCO | rattachement sans montant de contribution |
| 2 | TARIC | mesures douanières européennes quotidiennes | export brut à sécuriser et accises nationales exclues |
| 2 | ANJ | mises et produit brut des jeux en ligne depuis 2010 | indicateur d’assiette différent d’une recette fiscale |
| 3 | Liste des casinos | périmètre des établissements autorisés | état 2025 sans données fiscales |

## 1. Douane : droits et taxes sur les produits énergétiques

Source officielle :
[Droits et taxes applicables aux produits énergétiques](https://www.douane.gouv.fr/la-douane/opendata/auteurs/energie-environnement-et-lois-de-finances).

La Douane publie des tableaux ODS accompagnant les bulletins officiels successifs. Pour
2026, des états ont été repérés aux dates suivantes :

- 1er janvier ;
- 1er février ;
- 1er mars ;
- 1er juillet ;
- 1er août.

L’état applicable au 1er août 2026 accompagne le bulletin officiel des douanes n° 7659 et
la décision administrative 26-058. Il remplace l’état du 1er juillet. Le tableau décrit
les tarifs d’accise sur les énergies, la TVA et la CPSSP par produit et usage, pour le
territoire douanier métropolitain composé de la France continentale, de la Corse et de
Monaco.

### Valeur documentaire

Ces fichiers peuvent produire automatiquement :

- les codes ou descriptions de produits ;
- les usages et régimes tarifaires ;
- la nature de la composante fiscale ;
- le tarif ;
- l’unité ;
- la date d’effet ;
- le bulletin créant ou remplaçant l’état ;
- la chronologie des changements pendant l’année.

Ils évitent de rechercher individuellement le tarif de chaque combustible ou usage et de
relire les circulaires à chaque variation.

### Granularité correcte

```text
accise sur les énergies
    ├── produit
    ├── usage ou régime
    ├── tarif et unité
    ├── date d’effet
    └── éventuelle composante distincte : TVA ou CPSSP
```

Une ligne tarifaire n’est pas un prélèvement autonome. De même, la TVA et la CPSSP ne
doivent pas être absorbées dans l’accise sous un identifiant unique.

### Limites

- le tableau ne fournit pas les quantités taxées ;
- il ne fournit pas les montants dus ou encaissés ;
- son champ géographique n’est pas celui de tous les territoires français ;
- un nouveau bulletin peut remplacer un état antérieur en cours d’année ;
- les produits à tarif réduit, exonéré ou remboursé doivent conserver le régime exact au
  lieu d’être regroupés sous le seul nom du produit.

Livrable proposé :
`data/reference/dgddi-energy-tax-rates-2026.json`.

## 2. Douane : prix et livraisons de tabac

Sources officielles :

- [open data tabacs](https://www.douane.gouv.fr/la-douane/opendata/mots-cles/tabacs) ;
- [ventes de tabacs en France](https://www.douane.gouv.fr/en/node/141).

La Douane publie deux familles complémentaires.

La première est la nomenclature des prix de vente au détail homologués. Plusieurs états
peuvent être publiés dans l’année. Le dernier état repéré est applicable au 1er septembre
2026 et porte sur la France hors départements d’outre-mer.

La seconde est une série mensuelle des volumes livrés au réseau des buralistes depuis
janvier 2018. Les catégories comprennent notamment les cigarettes, le tabac à rouler, les
cigares, les autres tabacs à fumer, à mâcher, à priser et à chauffer. Le dernier mois
repéré pendant cette recherche est juillet 2026.

### Usages

Les nomenclatures de prix permettent de normaliser :

- les références commerciales ;
- les catégories fiscales de produits ;
- les prix homologués ;
- les fournisseurs ;
- les dates d’entrée en vigueur.

Les livraisons mensuelles apportent :

- les volumes ;
- l’unité propre à chaque catégorie ;
- le mois ;
- le nombre de jours de livraison lorsqu’il est publié ;
- les changements de périmètre, notamment entre France continentale, Corse et France
  métropolitaine.

### Ce qu’il ne faut pas calculer

```text
prix homologué × quantité livrée ≠ recette d’accise certaine
```

Le calcul manquerait notamment la structure fiscale exacte, les changements de prix en
cours de mois, les stocks, retours, différences de catégories, livraisons hors période et
règles d’arrondi.

Une livraison n’est pas non plus une consommation finale. Les fichiers doivent donc
rester des sources de paramètres et de contrôle de l’assiette, non une preuve du produit
fiscal.

## 3. TARIC : couverture douanière européenne

Source :
[TARIC — tarif intégré de l’Union européenne](https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/eu-customs-tariff-taric_en).

TARIC centralise notamment :

- les droits de pays tiers ;
- les préférences tarifaires ;
- les suspensions ;
- les contingents ;
- les composantes agricoles ;
- les droits antidumping ;
- les droits compensateurs ;
- les sauvegardes ;
- la nomenclature des marchandises et les codes additionnels.

Les données sont mises à jour et transmises quotidiennement aux administrations
nationales. La Commission indique aussi qu’un export brut Excel est librement disponible.

### Pourquoi la source reste `candidate`

Lors de la vérification du 3 septembre 2026, le lien officiel vers les données brutes ne
permettait pas de récupérer l’export attendu. La consultation en ligne est disponible,
mais son aspiration ne constituerait pas une méthode stable ni documentée.

TARIC exclut en outre explicitement les taux nationaux de TVA et d’accise. Il complète les
sources douanières françaises ; il ne les remplace pas.

### Périmètre à extraire

Une première extraction doit exclure les mesures non pécuniaires et conserver :

```text
code marchandise
× type de mesure
× origine ou destination
× code additionnel
× période de validité
× taux ou montant
× unité
```

Un droit antidumping limité à une origine ou à un producteur ne doit pas être publié
comme un prélèvement général applicable à tous les importateurs.

### Lacune nationale associée

Le service RITA de la Douane permet des recherches riches sur les mesures nationales et
européennes, mais aucun export complet ou point d’API public documenté n’a été identifié
pendant cette passe. RITA reste donc une source de contrôle ponctuel.

## 4. COG 2026 : normaliser le territoire dans le temps

Source :
[Code officiel géographique au 1er janvier 2026](https://www.insee.fr/fr/information/8740222).

L’Insee fournit un ZIP CSV complet du millésime 2026, ainsi que des fichiers séparés pour
les communes, cantons, arrondissements, départements, régions et collectivités
particulières.

Deux fichiers sont particulièrement importants pour l’audit :

- les événements sur les communes depuis 1943 ;
- les couples code-libellé de commune depuis 1943 avec dates de début et de fin.

La publication 2026 mentionne notamment des changements de noms, la suppression de
communes associées ou déléguées et l’évolution du code de Mayotte. Ces événements
montrent pourquoi le simple libellé d’une commune n’est pas une clé suffisamment stable.

### Règle de jointure

Toute donnée locale doit porter :

```json
{
  "geography_type": "COM",
  "geography_code": "00000",
  "geography_reference_date": "2026-01-01",
  "source_name": "libellé publié"
}
```

Le libellé brut reste conservé. Le code normalisé est dérivé à l’aide du COG du bon
millésime.

### Limites

Le COG ne dit rien sur le prélèvement, le taux, la compétence, le bénéficiaire ou la
recette. Il résout uniquement l’identité territoriale et les transformations du
périmètre.

## 5. BANATIC : groupements, compétences et périmètres

Source :
[Base nationale sur les intercommunalités](https://www.data.gouv.fr/datasets/base-nationale-sur-les-intercommunalites).

La base officielle de la DGCL comprend :

- la liste des groupements ;
- leur localisation et nature juridique ;
- leur date de création ;
- leur profil financier ;
- leurs coordonnées ;
- les compétences exercées ;
- le périmètre des EPCI à fiscalité propre ;
- une table de passage entre code INSEE de commune et SIREN.

Lors de la recherche, le jeu était indiqué comme mis à jour le 1er septembre 2026. Les
ressources individuelles ont toutefois des dates différentes. La date de chaque fichier
doit donc être conservée et non remplacée par la seule date globale du jeu.

### Complémentarité avec la liste EPCI déjà documentée

La précédente passe a recensé la photographie annuelle de la composition des EPCI à
fiscalité propre. BANATIC élargit cette couverture :

- autres groupements ;
- compétences ;
- profils financiers ;
- dates de création ;
- identifiants SIREN ;
- ressources courantes mises à jour séparément.

### Ce que BANATIC ne prouve pas

Une compétence `eau`, `mobilité`, `déchets` ou `tourisme` ne prouve pas que le groupement
est bénéficiaire de chaque prélèvement lié à cette politique. Elle produit un candidat à
rapprocher d’une délibération, d’un texte d’affectation ou d’un compte.

## 6. Sirene : résoudre les personnes morales et établissements

Source :
[Consulter et télécharger la base Sirene](https://www.insee.fr/fr/information/3591226).

L’Insee donne accès à l’API Sirene mise à jour quotidiennement et à cinq stocks
librement téléchargeables :

- entreprises dans leur état courant ;
- valeurs historisées des entreprises ;
- établissements dans leur état courant ;
- valeurs historisées des établissements ;
- liens de succession des établissements.

La page indique que l’API couvre près de 25 millions d’entreprises et 36 millions
d’établissements enregistrés depuis 1973.

### Usages dans l’audit

Sirene permet de résoudre :

- le SIREN d’un bénéficiaire ;
- le SIRET d’un redevable ou collecteur ;
- les anciennes dénominations ;
- les changements d’activité ou de catégorie juridique ;
- les établissements fermés ;
- les liens de succession.

Cette couche est essentielle pour la table SIRET-OPCO, la liste des casinos, les
bénéficiaires de taxes affectées et les organismes locaux.

### Limite déterminante

Sirene ne fournit pas le classement institutionnel SEC. Une association, un établissement
public, une société ou un groupement peut être situé dans ou hors S.13 selon des critères
qui ne se déduisent pas de la seule catégorie juridique.

Le rapprochement correct reste :

```text
nom source
    → SIREN/SIRET Sirene
    → candidat ODAC/ODAL ou autre classement Insee
    → secteur SEC daté
```

## 7. M57 2026 : comprendre les recettes dans les comptes locaux

Source :
[Référentiel budgétaire et comptable M57](https://www.collectivites-locales.gouv.fr/gerer-les-finances-publiques-locales/budget/instructions-budgetaires-et-comptables/le-referentiel-m57/le-referentiel-budgetaire-et-comptable-m57).

Le portail publie :

- l’instruction M57 applicable en 2026 ;
- le plan de comptes développé ;
- le plan de comptes abrégé ;
- les modèles de documents budgétaires ;
- des tables de transposition M14-M57 et M52-M57 ;
- des transpositions propres aux petites communes, CCAS, CIAS et caisses des écoles.

Le plan développé contient des comptes explicitement nommés d’après certaines ressources,
par exemple la taxe d’aménagement, la TICPE, les DMTO ou des taxes affectées à
l’investissement. Il contient aussi des comptes de reprise, de réserve, de transfert et
d’attribution.

### Pourquoi une table de passage est nécessaire

Les balances locales n’ont de sens que si le code du compte est interprété avec :

- le plan comptable ;
- la variante développée ou abrégée ;
- le millésime ;
- le type de budget ;
- le caractère budgétaire ou non budgétaire ;
- le niveau de collectivité ;
- les éventuelles transpositions depuis une ancienne nomenclature.

### Règle centrale

```text
un compte M57 ≠ un prélèvement
```

Un compte peut agréger plusieurs ressources. Une ressource peut aussi apparaître dans un
compte de produit, de réserve, de reprise ou de transfert. Le nom d’un prélèvement dans le
plan ne suffit donc pas à attribuer le solde complet de ce compte à sa fiche.

Livrable proposé :
`data/reference/m57-tax-account-crosswalk-2026.json`.

## 8. Taux collectifs AT/MP 2026

Sources :

- [arrêté général 2026](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000053228986) ;
- [annexe 1 — taux collectifs](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000053266180) ;
- [annexe 3 — Alsace-Moselle](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000053266194) ;
- [arrêté du régime minier](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000053228971).

Les annexes sont publiées sous forme de grandes tables associant :

- une catégorie ou nature de risque ;
- un code risque ;
- un taux net collectif ;
- le régime ou territoire concerné.

Le texte général publie aussi les coûts moyens et indique un taux net moyen national. Le
texte minier donne une correspondance entre codes miniers et codes du régime général.

### Apport massif

La table permet de documenter une famille entière sans rechercher le taux de chaque
activité. Elle peut être rapprochée des codes d’activité et établissements pour produire
des **candidats**, mais pas des dettes certaines.

### Granularité correcte

```text
cotisation AT/MP
    ├── code risque
    ├── taux collectif annuel
    ├── régime ou territoire
    ├── règle de tarification
    └── éventuel taux individuel ou mixte non public
```

Un code risque ne crée pas une cotisation autonome. Le taux collectif n’est pas
nécessairement le taux effectivement notifié à un employeur, car la tarification peut être
collective, mixte ou individuelle selon les règles applicables.

Livrable proposé :
`data/reference/atmp-collective-risk-rates-2026.json`.

## 9. SISPEA : services, tarifs et indicateurs de performance

Source :
[Téléchargements SISPEA](https://services.eaufrance.fr/pro/telechargement).

SISPEA publie des fichiers XLS et ODS annuels pour :

- l’eau potable ;
- l’assainissement collectif ;
- l’assainissement non collectif ;
- les tarifs d’eau potable ;
- les tarifs d’assainissement collectif.

Les millésimes vont de 2008 à 2026 sur la page vérifiée. Les fichiers sont régénérés chaque
semaine. Un avertissement, des métadonnées et un dictionnaire accompagnent les données.

Depuis 2025, SISPEA sert aussi à la saisie des données techniques nécessaires à
l’estimation du coefficient de modulation de la redevance pour performance des réseaux
d’eau potable.

### Deux usages distincts

#### Inventaire des services

SISPEA permet d’identifier :

- l’autorité organisatrice ;
- les communes desservies ;
- la compétence ;
- le mode de gestion ;
- l’agence de l’eau ;
- les ouvrages ;
- le statut de publication ou de validation.

#### Analyse de la facture et de la performance

Les fichiers permettent d’extraire les composantes tarifaires et les indicateurs de
performance. Ils ne doivent pas être réduits à un simple `prix par m³`.

```text
prix total de l’eau
    = service d’eau
    + service d’assainissement éventuel
    + taxes et redevances
    + composantes territoriales ou de performance
```

Chaque composante doit conserver son libellé, son unité et son année.

### Limites

- les données 2025 et 2026 sont encore partielles ;
- tous les services n’ont pas le même statut de validation ;
- un indicateur technique ne suffit pas à calculer la redevance définitive ;
- les tarifs de service rendu ne sont pas tous des prélèvements obligatoires ;
- les ventilations et totaux ne doivent pas être additionnés ensemble.

Le premier millésime recommandé pour une ingestion de référence est 2024, dernier
millésime couvert par le rapport national publié en juin 2026.

## 10. BNPE et Hub’Eau : volumes prélevés sur la ressource

Sources :

- [Hub’Eau](https://hubeau.eaufrance.fr/) ;
- [présentation de l’API Prélèvements en eau](https://www.eaufrance.fr/actualites/un-acces-aux-donnees-nationales-de-prelevements-en-eau).

La BNPE rassemble les données issues de la gestion des redevances par les agences et
offices de l’eau et la DEAL Mayotte. L’API diffuse les ouvrages et les volumes annuels
prélevés selon :

- la localisation ;
- l’usage, par exemple eau potable, irrigation ou industrie ;
- le type de ressource : souterraine, littorale, cours d’eau ou plan d’eau.

Les données couvrent généralement la période depuis 2012, voire 2008 pour certains
bassins, jusqu’à l’année N-2. Hub’Eau annonce plus d’un million de volumes annuels.

### Complémentarité avec SISPEA

```text
BNPE
    → prélèvement physique dans la ressource

SISPEA
    → organisation et performance du service public

agence de l’eau
    → tarif, coefficient, déclaration et encaissement
```

Ces trois niveaux ne doivent pas être confondus.

### Limites

- volume prélevé ne signifie pas volume consommé ;
- la donnée ne fournit pas le tarif de redevance ;
- elle ne fournit pas le montant payé ;
- le champ dépend des seuils et règles de gestion des redevances ;
- les petits prélèvements ou usages exonérés peuvent être absents ;
- le délai N-2 interdit de l’utiliser pour un montant courant.

Le dictionnaire Sandre doit être conservé avec l’extraction afin de stabiliser les codes
d’ouvrage, d’usage et de statut.

## 11. Table SIRET-OPCO

Source :
[Table SIRET-OPCO](https://www.data.gouv.fr/datasets/table-siret-opco).

France compétences publie un fichier CSV de plus de 100 Mo reliant les établissements des
employeurs redevables des contributions légales de formation professionnelle et
d’apprentissage à leur opérateur de compétences.

Le jeu inclut le SIRET et l’IDCC public applicable, ou une valeur d’échappement. Il est
construit à partir de la rubrique DSN `S21.G00.11.022`. La page précise que cet IDCC au
niveau de l’établissement peut différer de l’IDCC déclaré au niveau des contrats de
travail.

Lors de la vérification, le fichier était indiqué comme mis à jour le 11 août 2026 et
pesait environ 103,5 Mo.

### Apport

La table donne une vue nationale du champ déclaratif :

```text
SIRET employeur
    → OPCO
    → IDCC public ou valeur d’échappement
```

Elle peut être reliée :

- à Sirene pour l’identité et les successions ;
- à la DSN pour les codes déclaratifs ;
- aux CTP pour le recouvrement ;
- aux textes et au BOFiP ou BOSS pour les règles ;
- aux comptes de France compétences et organismes pour les flux agrégés.

### Limites

La table ne fournit ni taux, ni assiette, ni montant dû, ni paiement. Le rattachement à un
OPCO ne prouve pas que toutes les contributions du champ sont dues par le SIRET à une date
donnée.

### SOLTéA : lacune associée

Un catalogue des établissements habilités à recevoir le solde de la taxe d’apprentissage
est consultable et des listes officielles sont publiées. Aucun export public complet,
versionné et reproductible de tout le catalogue n’a toutefois été identifié pendant cette
passe. Il faut donc maintenir cette recherche ouverte au lieu de promettre une ingestion
massive immédiate.

## 12. Jeux d’argent : ANJ et casinos

Sources :

- [données du marché des jeux en ligne 2010-2024](https://www.data.gouv.fr/datasets/donnees-sur-le-marche-des-jeux-en-ligne-paris-sportifs-hippiques-et-poker-de-2010-a-2024) ;
- [liste des casinos autorisés](https://www.data.gouv.fr/datasets/liste-des-casinos-de-france).

L’ANJ publie un petit jeu CSV/XLSX couvrant les paris sportifs, les paris hippiques et le
poker en ligne. Les indicateurs comprennent notamment les comptes joueurs actifs, les
mises, le produit brut des jeux et différentes répartitions.

Le jeu ouvert vérifié couvre 2010 à 2024. Des publications relatives à 2025 existent, mais
elles ne doivent pas être ajoutées à cette série avant d’avoir contrôlé la continuité des
définitions et du format.

### Utilité fiscale

Selon la règle juridique étudiée, les mises ou le produit brut des jeux peuvent fournir
un contexte d’assiette. Ils ne représentent jamais automatiquement la recette fiscale.

```text
mises
≠ produit brut des jeux
≠ produit net de l’opérateur
≠ montant du prélèvement
≠ recette budgétaire ou SEC
```

La liste du ministère de l’Intérieur complète le périmètre des casinos terrestres. Elle
indique la commune et, depuis 2021, l’exploitant. Son dernier état repéré est daté du
11 août 2025 ; elle ne doit donc servir pour 2026 qu’après contrôle des changements.

Les communes doivent être normalisées avec le COG et les exploitants avec Sirene.

## L’épine dorsale territoriale et comptable

La combinaison suivante doit devenir une infrastructure partagée par toutes les sources
locales :

```text
COG
    → code et histoire de la commune

BANATIC
    → groupement, compétence, SIREN et périmètre fiscal

Sirene
    → identité et histoire de l’organisme ou établissement

M57
    → sens du compte dans lequel la ressource est enregistrée

source fiscale locale
    → taux, option, assiette ou produit
```

### Exemple abstrait

```text
ligne de balance : compte 73xxx, SIREN bénéficiaire, exercice 2026
    ├── M57 2026 : sens du compte
    ├── Sirene : nom et histoire du bénéficiaire
    ├── BANATIC : nature, compétence et périmètre du groupement
    ├── COG : communes du périmètre au bon millésime
    ├── délibérations : option ou taux applicable
    └── REI ou autre source : base et produit fiscal
```

Chaque jointure doit conserver sa source et sa date. Un rapprochement réussi ne transforme
pas pour autant le compte en créance : il produit une relation auditable.

## Modèle de relation enrichi

Les types de relations à prévoir sont désormais :

- `same_levy` ;
- `historical_name` ;
- `declared_with` ;
- `collected_by` ;
- `allocated_to` ;
- `applies_in` ;
- `rate_for` ;
- `component_of` ;
- `accounted_in` ;
- `reported_by` ;
- `classified_as` ;
- `identity_of` ;
- `successor_of` ;
- `candidate_match` ;
- `unresolved`.

Une relation minimale doit contenir :

```json
{
  "from_id": "source-object-id",
  "to_id": "canonical-or-reference-id",
  "relation": "accounted_in",
  "valid_from": "2026-01-01",
  "valid_to": null,
  "source_id": "dgfip-m57-2026-chart-of-accounts",
  "locator": "compte ou ligne",
  "confidence": "reviewed",
  "review_status": "accepted"
}
```

## Résultats négatifs à conserver

### Export TARIC non stabilisé

L’export Excel est annoncé par la Commission, mais le lien consulté n’a pas produit le
fichier attendu. TARIC reste en `candidate` jusqu’à récupération d’un point d’accès stable.

### RITA sans export massif public identifié

RITA est utile pour valider un cas douanier particulier. Aucune méthode publique de
récupération complète n’a été trouvée.

### SOLTéA sans catalogue complet versionné identifié

La consultation nationale ne suffit pas à garantir une extraction complète et
reproductible des bénéficiaires du solde de taxe d’apprentissage.

### Pas de taux AT/MP individuel par établissement

Le barème collectif ne donne pas le taux mixte ou individuel notifié à chaque employeur.
Une jointure code risque-SIRET ne doit donc pas produire une dette calculée.

### Pas de fichier unique des redevances de l’eau

Les données de service, volumes, performances, tarifs, coefficients, déclarations et
encaissements restent réparties entre SISPEA, BNPE et les agences.

### Sirene et BANATIC sans classement SEC

Ces bases résolvent l’identité et le périmètre, pas l’appartenance à S.13.

### Série ouverte ANJ limitée à 2024

Le millésime 2025 devra être ajouté seulement lorsqu’un fichier et des définitions
comparables seront disponibles ou qu’une table de continuité aura été documentée.

## Ordre d’ingestion recommandé

### Lot 1 — accises énergétiques

Livrable : `data/reference/dgddi-energy-tax-rates-2026.json`.

Objectif : valider le modèle `produit × régime × composante × période de validité` sur des
fichiers ODS officiels peu volumineux.

### Lot 2 — SISPEA 2024

Objectif : archiver les fichiers et dictionnaires d’un millésime largement validé et
séparer les composantes de service des taxes et redevances.

### Lot 3 — AT/MP 2026

Livrable : `data/reference/atmp-collective-risk-rates-2026.json`.

Objectif : extraire toutes les annexes en une passe et démontrer qu’une seule créance peut
porter des centaines de lignes de barème.

### Lot 4 — tabacs

Objectif : constituer deux séries séparées, prix homologués et volumes livrés, avec leurs
périmètres et unités.

### Lot 5 — COG, BANATIC et Sirene

Objectif : produire les dimensions communes nécessaires aux jointures territoriales et
institutionnelles.

### Lot 6 — M57

Livrable : `data/reference/m57-tax-account-crosswalk-2026.json`.

Objectif : interpréter les comptes fiscaux des balances locales et préparer les ruptures
de nomenclature.

### Lot 7 — BNPE

Objectif : rattacher les volumes physiques aux familles de redevances de prélèvement sans
calculer de produit.

### Lot 8 — SIRET-OPCO

Objectif : normaliser le champ des contributions de formation et d’apprentissage et
repérer les établissements fermés ou successeurs.

### Lot 9 — jeux

Objectif : contrôler les assiettes sectorielles et le périmètre des opérateurs après les
sources prioritaires.

### Lot 10 — prototype TARIC

Objectif : sécuriser le téléchargement brut et mesurer la proportion des mesures pouvant
correspondre à des droits ou prélèvements pécuniaires.

## Règles supplémentaires anti-inférence

1. **Tarif n’est pas recette.**
2. **Prix homologué n’est pas accise.**
3. **Volume livré n’est pas consommation.**
4. **Mesure TARIC n’est pas nécessairement droit de douane.**
5. **TARIC ne contient pas les taux nationaux de TVA ou d’accise.**
6. **Code géographique n’est pas périmètre fiscal sans date.**
7. **Compétence BANATIC n’est pas affectation fiscale.**
8. **SIREN ou SIRET n’est pas secteur SEC.**
9. **Compte M57 n’est pas créance.**
10. **Code risque AT/MP n’est pas cotisation autonome.**
11. **Taux collectif AT/MP n’est pas taux individuel.**
12. **Prix total de l’eau n’est pas prélèvement.**
13. **Volume prélevé n’est pas volume consommé.**
14. **Donnée de performance n’est pas coefficient définitif.**
15. **OPCO de rattachement n’est pas preuve d’un montant dû.**
16. **Mise ou PBJ n’est pas recette fiscale.**
17. **Autorisation de casino n’est pas activité annuelle prouvée.**
18. **Un état courant ne remplace jamais l’historique des identifiants.**

## Décision recommandée pour l’issue #36

La prochaine ingestion doit porter sur les **tableaux d’accises énergétiques**. Ils sont
petits, structurés, versionnés pendant l’année et suffisamment riches pour valider une
architecture de paramètres avec dates d’effet.

Le chantier suivant doit être **SISPEA 2024**, car il combine une longue série, une forte
couverture territoriale, des dictionnaires et un lien nouveau avec le calcul des
redevances de performance.

L’extraction des **taux AT/MP 2026** viendra ensuite démontrer la gestion correcte d’un
barème très détaillé rattaché à une seule famille juridique.

Enfin, le triptyque **COG + BANATIC + Sirene**, complété par **M57**, doit être traité comme
une infrastructure transversale et non comme un lot thématique. Il réduira le coût de
toutes les ingestions locales suivantes et évitera de refaire les mêmes résolutions de
noms, codes et périmètres à chaque source.
