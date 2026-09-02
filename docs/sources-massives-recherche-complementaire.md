# Recherche complémentaire sur les sources massives

Date de vérification : **2 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète
[`sources-massives-prelevements-obligatoires.md`](sources-massives-prelevements-obligatoires.md).
Le registre machine-readable de cette passe est
[`data/reference/bulk-sources-supplement-2026-09-02.json`](../data/reference/bulk-sources-supplement-2026-09-02.json).

## Résultat principal

La recherche fait apparaître quatre sources qui doivent être promues au premier rang du pipeline :

1. les **tableurs officiels du PLF 2026**, qui donnent directement l’évolution des
   recettes, les taxes affectées, la TVA toutes APU et les dépenses fiscales ;
2. les **données chiffrées de l’annexe 4 du PLFSS 2026**, consacrées aux réductions,
   exonérations et compensations de cotisations et contributions ;
3. la **table historique des codes types de personnel de l’Urssaf**, qui donne une vue
   structurée des codes de déclaration et de recouvrement, de leurs libellés, dates et
   taux publiés ;
4. le **BOFiP en open data**, diffusé sous forme de stock mensuel et de flux hebdomadaire,
   qui rend indexable en masse la doctrine fiscale et ses métadonnées.

Les **balances de comptabilité générale de l’État** et les **tables de nomenclature DSN**
deviennent ensuite prioritaires pour compléter les recettes observées, organismes,
bases et codes déclaratifs.

Ces sources ne remplacent pas la loi, la NTL ou les documents budgétaires. Elles réduisent
le travail unitaire en fournissant des listes de candidats, des identifiants, des dates,
des paramètres et des contrôles de masse.

## Changement de stratégie recommandé

L’entrée générale `urssaf-open-data` du registre initial sous-estime désormais le potentiel
du portail. La table historique CTP mérite une entrée dédiée de priorité 1.

De même, les archives LEGI ne doivent pas être le seul corpus textuel indexé. Pour les
prélèvements fiscaux, le BOFiP apporte souvent plus directement :

- les appellations administratives ;
- les renvois aux articles applicables ;
- les assiettes et taux ;
- les exonérations ;
- les dates de mise à jour ;
- les liens entre commentaires, annexes et barèmes.

Une autre correction importante concerne les documents budgétaires : le portail de la
Direction du Budget fournit les tableaux officiels en XLS/XLSX. Lorsqu’un classeur couvre
le même tableau, il doit être préféré à une transcription du PDF, tout en conservant le
PDF comme source de contexte.

La combinaison recommandée devient donc :

| Besoin | Référentiel principal | Référentiel de contrôle |
| --- | --- | --- |
| Cotisations et contributions déclarées | table historique CTP | DSN, BOSS, LFSS |
| Doctrine et paramètres fiscaux | BOFiP open data | LEGI, LFI, Voies et moyens |
| Recettes observées de l’État | balances générales de l’État | Voies et moyens, NTL |
| Recettes et bénéficiaires locaux | balances locales et REI | OFGL, NTL |
| Financement social observé | comptes DREES | LFSS, NTL, Eurostat |
| Classement et totaux SEC | NTL et `gov_10a_taxag` | Insee, OCDE |
| Taxes environnementales | NTL et `env_ac_tax` | `env_ac_taxind2` |

## Tableau des nouvelles sources

| Priorité | Source | État proposé | Apport massif | Limite centrale |
| --- | --- | --- | --- | --- |
| 1 | Direction du Budget — tableurs PLF 2026 | prête à ingérer | recettes, taxes affectées, TVA toutes APU et dépenses fiscales | données de projet et agrégats |
| 1 | DSS — données chiffrées de l’annexe 4 du PLFSS | prête à ingérer | réductions, exonérations et compensations sociales | une mesure n’est pas un prélèvement |
| 1 | Urssaf — table historique CTP | prête à ingérer | codes, libellés, dates et taux publiés | un CTP n’est pas nécessairement un prélèvement |
| 1 | DGFiP — BOFiP open data | prête à ingérer | doctrine fiscale structurée, stock et flux | la doctrine n’est pas la loi |
| 2 | DGFiP — balances générales de l’État | prête à ingérer | recettes comptables 2016-2025 | un compte peut agréger plusieurs prélèvements |
| 2 | Net-entreprises — DSN P26V01 | prête à ingérer | référentiels sociaux globaux en CSV | nomenclature déclarative, sans recettes |
| 2 | DREES — comptes de la protection sociale | prête à ingérer | ressources sociales depuis 1959 | catégories agrégées et champ plus large que les PO |
| 2 | DGFiP / OFGL — balances locales | prête à ingérer | recettes chez les bénéficiaires territoriaux | consolidation et nomenclatures comptables |
| 2 | Eurostat — `gov_10a_taxag` | prête à ingérer | totaux par transaction SEC et sous-secteur | moins fin que la NTL |
| 2 | Commission européenne — TEDB | prototype requis | fiches des principaux impôts européens | accès massif et exhaustivité à vérifier |
| 3 | OCDE — Global Revenue Statistics | contrôle | catégories fiscales harmonisées | 63 catégories, trop agrégées |
| 3 | Eurostat — taxes environnementales | contrôle | familles énergie, transport, pollution et ressources | aucun montant individuel français |
| 3 | BOSS | prototype requis | doctrine sociale, paramètres et versions | aucun stock complet ou API identifié |

## 1. Tableurs officiels du PLF 2026

Source :
[Projet de loi de finances et documents annexés pour 2026](https://www.budget.gouv.fr/documentation/documents-budgetaires-lois/exercice-2026/plf-2026).

Le portail de la Direction du Budget publie, à côté des deux tomes des Voies et moyens,
plusieurs fichiers directement exploitables :

- [évolution des recettes du budget général — XLSX](https://www.budget.gouv.fr/documentation/fid-download/80398) ;
- [taxes affectées — XLS](https://www.budget.gouv.fr/documentation/fid-download/80134) ;
- [TVA toutes administrations publiques — XLSX](https://www.budget.gouv.fr/documentation/fid-download/79324) ;
- [principales dépenses fiscales — XLSX](https://www.budget.gouv.fr/documentation/fid-download/79327) ;
- [liste complète des dépenses fiscales — XLS](https://www.budget.gouv.fr/documentation/fid-download/80059).

### Pourquoi cette découverte est importante

Le registre initial signalait l’existence de classeurs associés sans en établir
précisément la liste. Ils permettent maintenant de remplacer plusieurs extractions PDF
par une lecture tabulaire reproductible.

Le fichier des taxes affectées devrait être rapproché directement de l’article 135 de la
LFI 2026. L’évolution des recettes du budget général peut fournir les séries et unités
des lignes d’État. Le fichier TVA toutes APU peut documenter les fractions et
bénéficiaires sans inventer une ventilation à partir d’un total. Les dépenses fiscales
peuvent enfin relier un prélèvement aux régimes dérogatoires qui le concernent.

### Limites

- ces fichiers accompagnent le projet de loi de finances ;
- une dépense fiscale n’est pas un prélèvement autonome ;
- une ligne budgétaire ou un total TVA peut agréger plusieurs mécanismes ;
- les classeurs peuvent contenir des cellules fusionnées, unités implicites et notes hors
  tableau ;
- toute modification intervenue entre le PLF et la loi promulguée doit être contrôlée.

### Ingestion proposée

1. archiver les cinq fichiers et leurs URL de téléchargement ;
2. calculer une empreinte de chaque fichier ;
3. inventorier les feuilles, plages, unités et formules ;
4. conserver la cellule ou ligne d’origine ;
5. comparer les sommes aux tableaux PDF ;
6. utiliser les classeurs comme source primaire d’extraction et le PDF pour les notes
   méthodologiques.

## 2. Données chiffrées de l’annexe 4 du PLFSS 2026

Sources :

- [page des documents de la LFSS en cours](https://www.securite-sociale.fr/la-secu-en-detail/loi-de-financement/annee-en-cours) ;
- [tableaux de l’annexe 4 — XLSX](https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2026/Tableaux%20Annexe%204%20PLFSS%202026.xlsx).

L’annexe 4 présente les mesures de réduction et d’exonération de cotisations et
contributions ainsi que leur compensation. Le site fournit un classeur chiffré séparé du
PDF.

Cette source complète directement :

- la table historique CTP, en révélant les dispositifs d’exonération et de réduction ;
- les tables DSN, en aidant à identifier les codes et populations concernés ;
- l’annexe 3, qui documente les impositions affectées ;
- les comptes DREES, qui fournissent les agrégats observés de financement.

### Utilité

Une extraction en masse peut produire :

- la liste des mesures d’exonération ;
- les familles de cotisations concernées ;
- les références juridiques publiées ;
- les populations ou secteurs visés ;
- les montants par année ;
- le caractère compensé ou non ;
- l’organisme de collecte lorsqu’il est indiqué.

### Limites

Une mesure d’allègement ne correspond pas nécessairement à une créance unique. Elle peut
porter simultanément sur plusieurs cotisations, régimes ou catégories d’employeurs. Les
montants sont susceptibles d’être estimés ou prévisionnels. Le classeur est rattaché au
PLFSS et doit être recoupé avec la LFSS promulguée.

Livrable proposé :
`data/reference/lfss-2026-annexe-4-measures.json`.

## 3. Table historique des codes types de personnel de l’Urssaf

Sources :

- [Open Urssaf — `histocodestypescsv`](https://open.urssaf.fr/explore/dataset/histocodestypescsv/) ;
- [data.gouv.fr — Table CTP avec historique](https://www.data.gouv.fr/datasets/table-ctp-avec-historique) ;
- [Urssaf — tables de référence](https://fichierdirect.declaration.urssaf.fr/TablesReference.htm).

Le jeu est publié en CSV, JSON et via l’API du portail. Le miroir data.gouv.fr
identifie l’Urssaf Caisse nationale comme créateur et éditeur, sous licence ODbL.

Les champs observés comprennent notamment :

- le code ;
- le libellé et le libellé court ;
- une spécificité ;
- un taux plafonné ;
- un taux déplafonné ;
- un taux accidents du travail ;
- une date d’effet ;
- une date de fin.

### Pourquoi cette source change la méthode

Jusqu’ici, la recherche Urssaf était surtout envisagée comme un contrôle de recettes.
La table CTP constitue plutôt un **référentiel d’inventaire opérationnel et historique**.
Elle permet de produire automatiquement :

- la liste des codes actifs à une date donnée ;
- la liste des codes terminés ;
- les changements de libellé ;
- les candidats qui comportent les mots `taxe`, `contribution`, `cotisation`,
  `versement`, `forfait`, `dialogue social`, `formation`, etc. ;
- les chevauchements entre codes portant des libellés voisins ;
- les changements de taux publiés ;
- une file de rapprochement vers les fiches historiques.

### Ce qu’il ne faut pas en déduire

Un CTP n’est pas une unité juridique fiable par construction. Un code peut désigner :

- une créance autonome ;
- une composante de taux ;
- une catégorie de salariés ;
- un dispositif d’exonération ;
- une réduction ;
- une régularisation ;
- une modalité de versement ;
- plusieurs contributions recouvrées ensemble.

Le futur rapprochement doit donc autoriser les relations `same_levy`, `component_of`,
`collection_code_for`, `exemption_for`, `historical_code` et `unresolved`.

### Première ingestion proposée

Livrable :
`data/reference/urssaf-ctp-history.json`.

Contrôles minimaux :

- archivage des CSV et JSON avec empreinte ;
- conservation exacte de toutes les colonnes ;
- normalisation des dates sans perdre la valeur brute ;
- clé composite `code + date_effet + date_fin + specificite` ;
- rapport des intervalles qui se chevauchent ;
- rapport des codes sans date de fin ;
- aucun écrasement d’une ancienne version par la version courante.

## 4. BOFiP en open data

Sources :

- [BOFiP — publications en vigueur](https://www.data.gouv.fr/datasets/bofip-impots-publications-en-vigueur) ;
- [jeu `bofip-vigueur`](https://data.economie.gouv.fr/explore/dataset/bofip-vigueur/) ;
- [jeu `bofip-impots`](https://data.economie.gouv.fr/explore/dataset/bofip-impots/) ;
- [documentation technique](https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/bofip-impots/attachments/bofip_documentation_pdf) ;
- [plan de classement courant](https://bofip.impots.gouv.fr/plan-de-classement).

La documentation technique décrit :

- un stock complet extrait une fois par mois ;
- un flux extrait chaque semaine depuis le dernier flux ;
- des archives `tar.gz` ;
- des empreintes MD5 ;
- des métadonnées XML ;
- un identifiant de document ;
- un permalien ;
- un titre, une date, des sujets et un type de contenu ;
- des relations `references` et `isReferencedBy` ;
- le contenu principal en HTML et d’éventuels fichiers sources.

Les conventions de nommage documentées sont :

- `bofip_stock_live_AAAAMMJJ` ;
- `bofip_flux_live_AAAAMMJJ_BBBBNNKK`.

### Usages possibles

Un index local permettrait de rechercher en une seule passe :

- les 371 noms historiques et leurs variantes ;
- chaque référence de code déjà connue ;
- les barèmes et taux cités ;
- les termes d’affectation ou de recouvrement ;
- les commentaires signalant une création, suppression ou substitution ;
- les annexes et tableaux liés ;
- les documents qui citent un même article.

Le BOFiP peut aussi produire un dictionnaire d’alias particulièrement utile pour
rapprocher les noms juridiques, budgétaires, statistiques et administratifs.

### Limites

Le BOFiP est de la doctrine administrative. Il ne prouve pas seul :

- qu’un article est encore en vigueur ;
- que la créance appartient au champ SEC des prélèvements obligatoires ;
- que le bénéficiaire relève de S.13 ;
- qu’un rendement est observé ;
- qu’une ancienne doctrine décrit encore le droit courant.

Chaque résultat devra conserver l’identifiant BOFiP, sa date, son type et son lien vers
la base juridique citée.

### Première ingestion proposée

1. télécharger le dernier stock mensuel ;
2. vérifier le MD5 ;
3. extraire les métadonnées sans modifier les fichiers sources ;
4. indexer `document.xml` et `data.html` ;
5. limiter d’abord la recherche aux séries fiscales rencontrées dans le brouillon ;
6. appliquer ensuite les flux hebdomadaires dans l’ordre ;
7. tester qu’un second passage est idempotent.

## 5. Comptabilité générale de l’État

Source :
[Données de comptabilité générale de l’État sur dix ans](https://data.economie.gouv.fr/explore/dataset/balances_des_comptes_etat/).

Le jeu rassemble les balances qui ont servi au Compte général de l’État de 2016 à 2025.
Un guide de lecture et des états financiers sont associés.

Cette source répond à une faiblesse importante des Voies et moyens : elle apporte des
données comptables observées sur dix exercices, plutôt que seulement une exécution,
une révision et une prévision budgétaires.

### Exploitation proposée

- importer le plan de comptes et le guide ;
- isoler les comptes de produits fiscaux ;
- conserver les débits, crédits et soldes au lieu de ne prendre qu’un net ;
- repérer les comptes de remboursements, dégrèvements et admissions en non-valeur ;
- construire une table de passage vers les lignes des Voies et moyens ;
- rapprocher les totaux avec les lignes NTL correspondantes.

### Précaution centrale

`Un compte comptable = un prélèvement` est une hypothèse invalide. Un compte peut agréger
plusieurs créances, tandis qu’une même créance peut alimenter plusieurs comptes selon
les opérations. Toute relation doit donc être datée, sourcée et typée.

## 6. Tables de référence DSN P26V01

Source :
[Tables de référence de la norme DSN — P26V01](https://www.net-entreprises.fr/nomenclatures-dsn-p26v01/).

La page indique que les tables sont applicables en production en 2026 et téléchargeables
en CSV, individuellement ou dans un fichier global. La version observée pendant cette
recherche est **P26V01 v12 du 23 juillet 2026**. Une release note accompagne le fichier.

Les tables couvrent notamment des organismes, institutions, contrats, conventions,
codes de risque et référentiels externes. Certaines ressources et classeurs décrivent
aussi les bases assujetties, composants de base et cotisations individuelles utilisés
dans les blocs DSN.

### Utilité

Elles peuvent normaliser :

- les organismes collecteurs ou destinataires ;
- les identifiants d’institutions ;
- les périodes de validité ;
- les codes de bases et cotisations individuelles ;
- les correspondances entre rubriques DSN ;
- certains barèmes ou référentiels utilisés pour le prélèvement à la source.

### Limites

Ces tables décrivent le langage de la déclaration. Elles ne constituent pas :

- une liste exhaustive de prélèvements ;
- une preuve de vigueur juridique ;
- un relevé de recettes ;
- une classification SEC.

Le numéro de norme, le numéro de version et la date de publication doivent faire partie
de chaque clé de provenance.

## 7. Comptes de la protection sociale de la DREES

Source :
[Les comptes de la protection sociale](https://data.drees.solidarites-sante.gouv.fr/explore/dataset/305_les-comptes-de-la-protection-sociale/).

La DREES publie des séries depuis 1959. Le classeur joint contient les prestations,
opérations et ressources de la protection sociale. Ces comptes alimentent le système
européen ESSPROS.

Cette source peut documenter en masse l’évolution du financement social par régime et
catégorie de ressource, puis servir de contrôle entre :

- les lignes NTL ;
- les annexes LFSS ;
- les encaissements Urssaf ;
- les contributions identifiées via les CTP ;
- les agrégats européens.

### Limites de champ

Les comptes de la protection sociale incluent des régimes privés et des ressources qui
ne sont pas toutes des prélèvements obligatoires. Les catégories de financement sont
souvent plus agrégées que les créances juridiques. Les millésimes provisoires,
semi-définitifs et définitifs doivent rester séparés.

La première ingestion doit porter sur les feuilles de **ressources**, et non seulement
sur le jeu fin des prestations présenté dans l’interface.

## 8. Balances comptables locales et OFGL

Sources :

- [Balances comptables des communes en 2025](https://data.economie.gouv.fr/explore/assets/balances-comptables-des-communes-en-2025/) ;
- [export des balances 2025](https://data.economie.gouv.fr/explore/assets/balances-comptables-des-communes-en-2025/export/) ;
- [portail de l’OFGL](https://data.ofgl.fr/pages/accueil/).

Le REI décrit les bases, taux et produits de fiscalité directe locale. Les balances
comptables apportent une autre vue : les recettes enregistrées chez les bénéficiaires.

Elles peuvent notamment aider à contrôler :

- les produits fiscaux agrégés ;
- les niveaux de collectivités bénéficiaires ;
- les comptes de reversement et d’attribution ;
- les recettes hors champ du REI ;
- les écarts entre produits votés, rôles et comptabilité.

### Difficultés à traiter explicitement

- budgets principaux et annexes ;
- consolidation des flux internes ;
- changements de nomenclature, notamment vers M57 ;
- comptes qui regroupent plusieurs taxes ;
- fractions de fiscalité nationale reversées ;
- différences de périmètre entre communes, EPCI, départements et régions.

L’ingestion doit commencer par un seul millésime et tous les fichiers de structure.
L’extension historique ne doit venir qu’après validation de la consolidation.

## 9. Eurostat — `gov_10a_taxag`

Sources :

- [Data Browser — `gov_10a_taxag`](https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table) ;
- [métadonnées](https://ec.europa.eu/eurostat/cache/metadata/en/gov_10a_taxag_esms.htm).

Le jeu fournit les principaux agrégats annuels d’impôts et cotisations sociales par
transaction SEC, secteur destinataire et unité. Il couvre les administrations publiques
et leurs sous-secteurs, ainsi que les institutions de l’Union européenne.

Il est cohérent par construction avec le cadre de la NTL et permet de vérifier :

- la somme annuelle des D.2 ;
- la somme annuelle des D.5 ;
- les impôts en capital D.91 ;
- les cotisations sociales ;
- la répartition entre administration centrale, locale et fonds de sécurité sociale ;
- les ratios et révisions annuelles.

### Rôle correct

Cette source doit déclencher des alertes d’écart. Elle ne doit jamais répartir
automatiquement un écart agrégé entre les fiches individuelles.

## 10. Taxes in Europe Database

Sources :

- [TEDB](https://ec.europa.eu/taxation_customs/tedb/) ;
- [catalogue européen](https://data.europa.eu/data/datasets/taxes-in-europe-database?locale=en).

TEDB présente les principaux impôts communiqués par les États membres. Les fiches peuvent
contenir des noms, bases juridiques, assiettes, exonérations, taux, dates, classifications
et parfois des recettes.

Cette base serait très utile comme inventaire comparatif et comme seconde source de noms,
mais elle reste en statut `candidate` :

- le site a été temporairement indisponible pendant une partie de la recherche ;
- l’export courant doit être retrouvé et testé ;
- la stabilité des identifiants et versions doit être mesurée ;
- la base est consacrée aux principaux impôts, pas à une exhaustivité juridique annoncée ;
- les informations ne sont pas une référence juridique.

Le prototype doit obtenir l’export France puis mesurer son rappel face aux 371 lignes
historiques et aux 141 lignes NTL.

## 11. OCDE — Global Revenue Statistics

Source :
[Global Revenue Statistics Database](https://www.oecd.org/en/data/datasets/global-revenue-statistics-database.html).

La base harmonise les recettes fiscales de 141 économies depuis 1990 selon 63 types
d’impôts et plusieurs niveaux d’administration.

Elle apporte un contrôle indépendant de la NTL et d’Eurostat, notamment pour :

- les cotisations de sécurité sociale ;
- les recettes locales ;
- la ventilation par grandes catégories ;
- les ruptures de série internationales.

Elle reste une source de contrôle : la classification OCDE ne se superpose pas
exactement au SEC et ses catégories sont trop larges pour documenter les fiches une par
une.

## 12. Eurostat — comptes des taxes environnementales

Sources :

- [`env_ac_tax`](https://ec.europa.eu/eurostat/databrowser/view/env_ac_tax/default/table) ;
- [`env_ac_taxind2`](https://ec.europa.eu/eurostat/databrowser/view/env_ac_taxind2/default/table) ;
- [métadonnées](https://ec.europa.eu/eurostat/cache/metadata/en/env_ac_tax_esms.htm).

Ces jeux distinguent les familles :

- énergie ;
- transport ;
- pollution ;
- ressources.

`env_ac_taxind2` ajoute une ventilation par activité économique ou groupe de payeurs.
Les données reposent sur le code environnemental attribué aux lignes des NTL et sur les
concepts de comptabilité nationale.

Elles peuvent contrôler que la couverture environnementale du projet n’est pas
manifestement incomplète. Elles ne fournissent pas un rendement par prélèvement français.

## 13. BOSS

Sources :

- [Bulletin officiel de la Sécurité sociale](https://boss.gouv.fr/) ;
- [flux RSS](https://boss.gouv.fr/portail/accueil/flux-rss.html) ;
- [actualités et mises à jour](https://boss.gouv.fr/portail/accueil/actualites.html).

Le BOSS est la source doctrinale naturelle pour comprendre les assiettes, taux,
exonérations, paramètres et positions administratives relatives aux cotisations et
contributions sociales.

Il complète la table CTP :

- le CTP dit comment une opération est codée pour le recouvrement ;
- le BOSS explique souvent la règle d’assiette ou de calcul ;
- le Code de la sécurité sociale et les textes d’application établissent la base juridique ;
- la NTL ou Eurostat établissent le classement statistique.

### Pourquoi le statut reste `candidate`

Aucun stock complet ni API publique comparable au BOFiP n’a été identifié dans cette
passe. Le flux RSS permet de détecter des mises à jour, mais ne remplace pas un export du
corpus. Il faut tester les permaliens et versions avant toute collecte automatisée.

## Sources secondaires utiles pour la détection et les tests

### OpenFisca-France

Source :
[OpenFisca-France](https://github.com/openfisca/openfisca-france).

Le dépôt libre modélise le système socio-fiscal français et publie une API. Il peut
accélérer :

- la découverte de noms de variables ;
- la recherche de paramètres historiques ;
- le repérage des références citées dans le code ;
- les tests de calcul et de régression.

Il n’est ni le droit positif ni une source officielle de recettes. Toute donnée doit être
reliée à sa source normative.

### Barèmes IPP

Source :
[Barèmes IPP — système social et fiscal français](https://www.data.gouv.fr/datasets/baremes-ipp-systeme-social-et-fiscal-francais).

L’IPP rassemble des barèmes historiques et indique des références législatives lorsque
possible. Les séries remontent très loin pour certaines familles, ce qui peut aider à
identifier les anciennes appellations et dates de réforme.

Cette source scientifique est particulièrement utile pour l’histoire des paramètres,
mais ne doit pas établir seule la vigueur, le classement SEC ou la recette.

## Résultats négatifs à conserver

Une recherche utile doit aussi documenter ce qui n’a pas été trouvé.

### Pas de table officielle univoque CTP → prélèvement juridique

Aucune source publique identifiée ne relie chaque version de CTP à :

- une créance canonique unique ;
- une base juridique versionnée ;
- un bénéficiaire économique final ;
- un code SEC ;
- une recette.

Cette table devra être construite comme un graphe sourcé et non comme une jointure forcée.

### Pas d’export massif documenté du BOSS

Le corpus est consultable et des flux de mise à jour existent, mais aucun stock complet
ou point d’API public n’a été repéré. Il ne faut pas annoncer une ingestion complète
avant d’avoir validé une méthode stable et autorisée.

### Pas de référentiel massif MSA équivalent trouvé

La norme DSN couvre aussi le régime agricole, mais aucune table MSA publique offrant le
même niveau historique que la table CTP Urssaf n’a été identifiée. Les prélèvements
agricoles restent donc un angle à traiter par croisement DSN, LFSS, textes et sources MSA
ciblées.

### TEDB : export courant non validé

La base européenne reste prometteuse, mais elle ne doit pas passer en
`ready_to_ingest` tant qu’un export France reproductible et des identifiants stables
n’ont pas été confirmés.

### Pas de jeu massif DGDDI de recettes par accise identifié

Cette passe n’a pas fait apparaître de jeu public officiel clairement exploitable en
masse, ventilant les recettes douanières et les accises par prélèvement. Les accises
restent donc couvertes par le CIBS, le BOFiP, les Voies et moyens et la NTL, avec des
recherches DGDDI ciblées.

Cette absence doit rester documentée afin d’éviter de supposer à tort qu’un portail de
commerce extérieur fournit aussi les recettes fiscales correspondantes.

## Nouveau modèle de rapprochement recommandé

Le rapprochement ne doit plus seulement relier une ligne historique à une ligne NTL.
Il doit pouvoir relier cinq niveaux :

1. **unité juridique** : article, dispositif ou créance ;
2. **unité de déclaration** : CTP, code DSN, rubrique ;
3. **unité budgétaire ou comptable** : ligne de recette, compte ;
4. **unité statistique** : ligne NTL ou agrégat SEC ;
5. **unité doctrinale** : document BOFiP ou rubrique BOSS.

Exemple conceptuel :

```text
article juridique
    ├── commenté par ──> document BOFiP ou BOSS
    ├── déclaré avec ──> CTP / code DSN
    ├── comptabilisé dans ──> compte ou ligne budgétaire
    ├── affecté à ──> bénéficiaire
    └── classé dans ──> ligne NTL / transaction SEC
```

Chaque arête doit contenir :

- la source ;
- le localisateur ;
- la date de validité ;
- le type de relation ;
- la confiance ;
- l’état de revue ;
- les éventuels conflits.

## Ordre d’ingestion révisé

### Lot 1 — tableurs du PLF 2026

Objectif : remplacer les extractions PDF par les sources XLS/XLSX officielles.

Livrables :

- extraction des taxes affectées ;
- extraction de l’évolution des recettes ;
- table TVA toutes APU ;
- inventaire des dépenses fiscales liées aux prélèvements suivis ;
- rapport des écarts avec les PDF et la loi promulguée.

### Lot 2 — annexe 4 du PLFSS

Objectif : inventorier en masse les réductions, exonérations et compensations sociales.

Livrables :

- `data/reference/lfss-2026-annexe-4-measures.json` ;
- références juridiques et familles concernées ;
- montants par année et statut ;
- liens vers CTP, DSN et fiches canoniques ;
- agrégats non ventilables explicitement signalés.

### Lot 3 — table historique CTP

Objectif : produire immédiatement une couverture sociale historique exploitable.

Livrables :

- `data/reference/urssaf-ctp-history.json` ;
- rapport des codes actifs au 2 septembre 2026 ;
- rapport des anciennes versions ;
- candidats rapprochés des 371 lignes ;
- liste des codes ambigus ou techniques.

### Lot 4 — index BOFiP

Objectif : réduire les recherches unitaires d’assiette, taux, exonération et référence.

Livrables :

- archive et empreinte du stock ;
- index des documents et permaliens ;
- dictionnaire d’alias fiscaux ;
- résultats de recherche pour les 371 entrées ;
- pipeline incrémental des flux.

### Lot 5 — comptes fiscaux de l’État

Objectif : retrouver des recettes observées sur dix exercices.

Livrables :

- extraction des comptes fiscaux ;
- table de passage vers les Voies et moyens ;
- rapport des comptes agrégés ;
- contrôle avec NTL et `gov_10a_taxag`.

### Lot 6 — nomenclatures DSN

Objectif : normaliser les acteurs et codes du champ social.

Livrables :

- archive P26V01 v12 ;
- tables structurées avec dates de validité ;
- liens vers CTP et organismes ;
- rapport des codes nouveaux, supprimés et désactivés.

### Lot 7 — contrôles sociaux et locaux

Objectif : consolider les montants observés chez les bénéficiaires.

Livrables :

- ressources historiques DREES ;
- agrégats de balances locales ;
- rapprochement avec LFSS, REI et NTL ;
- écarts non alloués explicitement conservés.

## Règles supplémentaires anti-inférence

1. **CTP n’est pas prélèvement.**
2. **Code DSN n’est pas créance.**
3. **Doctrine n’est pas loi.**
4. **Compte comptable n’est pas taxe.**
5. **Produit comptabilisé n’est pas automatiquement produit SEC.**
6. **Catégorie DREES ou OCDE n’est pas fiche individuelle.**
7. **Date de publication n’est pas date d’effet.**
8. **Code sans date de fin n’est pas nécessairement actif sans contrôle du référentiel courant.**
9. **Une version courante du BOFiP ne suffit pas à reconstruire l’historique.**
10. **Un écart agrégé ne doit jamais être ventilé pour faire équilibrer les totaux.**

## Décision recommandée pour l’issue #36

La priorité immédiate devient l’exploitation des **tableurs officiels du PLF 2026** :
ils fournissent déjà la matière nécessaire à l’extraction des taxes affectées, des
recettes et de la TVA toutes APU. L’**annexe 4 chiffrée du PLFSS** doit être traitée en
même temps pour le champ des exonérations sociales.

Ensuite, la **table CTP historique** doit devenir le premier chantier d’infrastructure
du champ social et le **stock BOFiP** le premier chantier textuel du champ fiscal.

Ces quatre ingestions fourniront plus de candidats, d’alias, de dates, de paramètres et
de montants que la poursuite immédiate d’un nouveau lot de quelques prélèvements vérifiés
un par un.
