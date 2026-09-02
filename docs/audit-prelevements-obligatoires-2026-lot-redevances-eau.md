# Audit des prélèvements obligatoires 2026 — lot redevances de l’eau

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/redevances-eau-2026-09-02`**  
**Données de production modifiées : non**

Ce lot poursuit la reprise documentaire avec les redevances perçues par les agences de l’eau en métropole et par les offices de l’eau dans les départements d’outre-mer. Il couvre les lignes 35 à 39 du brouillon historique et ajoute les créances apparues lors de la réforme entrée en vigueur en 2025 ainsi que la nouvelle redevance sur les rejets de PFAS créée en 2026.

La fiche structurée correspondante est publiée dans [`data/audit/redevances-eau-2026-09-02.json`](../data/audit/redevances-eau-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche ou décision | Origine | Situation au 2 septembre 2026 | Donnée disponible | Décision |
|---|---|---|---:|---|
| Redevance pour prélèvement sur la ressource en eau | absente comme fiche nationale ; présente dans l’agrégat outre-mer | active, code de l’environnement L. 213-10-9 et L. 213-14-1 | 826 M€ observés en 2024 | ajouter à l’inventaire et publier pour revue |
| Pollution de l’eau d’origine non domestique | ligne 35 | active, périmètre industriel non raccordé précisé | ancien montant de 107 M€ non daté | conserver comme candidate bloquée |
| Pollutions diffuses | ligne 36 | active, article L. 213-10-8 | ancien montant de 107 M€ non daté | conserver comme candidate bloquée |
| Stockage d’eau en période d’étiage | ligne 37 | active, article L. 213-10-10 | ancien montant de 1,3 M€ non daté | conserver comme candidate bloquée |
| Protection du milieu aquatique | ligne 38 | active, article L. 213-10-12 | ancien montant de 8,5 M€ non daté | conserver comme candidate bloquée |
| Redevances de l’eau dans les départements d’outre-mer | ligne 39 | agrégat territorial de plusieurs créances | ancien montant de 2 M€ non daté | scinder et fusionner dans les profils territoriaux |
| Pollution de l’eau par les activités d’élevage | absente du brouillon | active, article L. 213-10-3 | aucune recette individuelle | ajout d’inventaire bloqué |
| Pollution de l’eau par les PFAS | absente du brouillon | active depuis le 1er mars 2026 | aucune recette individuelle | ajout d’inventaire bloqué |
| Consommation d’eau potable | absente du brouillon | active depuis le 1er janvier 2025 | enveloppe globale des agences | ajout d’inventaire bloqué |
| Performance des réseaux d’eau potable | absente du brouillon | active depuis le 1er janvier 2025 | enveloppe globale des agences | ajout d’inventaire bloqué |
| Performance des systèmes d’assainissement collectif | absente du brouillon | active depuis le 1er janvier 2025 | enveloppe globale des agences | ajout d’inventaire bloqué |

Une seule créance dispose d’une ligne de comptabilité nationale directement nommée et franchit tous les contrôles de publication : la redevance pour prélèvement sur la ressource en eau. Les autres redevances sont juridiquement documentées mais restent bloquées faute de correspondance SEC individuelle ou, pour la protection du milieu aquatique, faute de documentation complète du reroutage entre collecteurs et bénéficiaires publics.

## Une famille juridique, plusieurs créances

Le code de l’environnement énumère plusieurs redevances juridiquement distinctes. Le fait qu’elles soient perçues par les mêmes agences ou offices et financent une politique commune de l’eau ne permet pas de les fusionner.

La granularité retenue suit les faits générateurs et les assiettes :

- prélèvement physique dans la ressource ;
- pollution industrielle directe ;
- pollution d’origine agricole ou phytopharmaceutique ;
- stockage pendant l’étiage ;
- exercice de la pêche ;
- consommation d’eau potable facturée ;
- performance d’un réseau de distribution ;
- performance d’un système d’assainissement collectif.

À l’inverse, les catégories d’usage, les zones de répartition, les tarifs de bassin et les profils territoriaux ne deviennent pas des fiches autonomes.

## Redevance pour prélèvement sur la ressource en eau

La redevance est due par les personnes dont l’activité entraîne un prélèvement sur la ressource en eau, sous réserve des exonérations prévues par les textes. Son assiette repose principalement sur le volume prélevé pendant l’année.

Pour les bassins couverts par les agences de l’eau, les usages comprennent notamment :

- l’irrigation gravitaire ou non gravitaire ;
- l’alimentation en eau potable ;
- l’alimentation d’un canal ;
- certains usages de refroidissement industriel ;
- les autres usages économiques ;
- l’hydroélectricité.

Les agences fixent les tarifs dans les limites légales. Pour l’usage hydroélectrique, la règle combine le volume turbiné et la hauteur de chute. Cette composante reste une modalité de la redevance de prélèvement : elle ne doit pas être confondue avec les redevances de concession ou d’autorisation prévues par le code de l’énergie.

Dans les départements d’outre-mer dotés d’un office de l’eau, une redevance de même nature est prévue par l’article L. 213-14-1, avec ses propres règles territoriales. Les exonérations peuvent notamment différer pour les prélèvements destinés à certaines productions d’énergie renouvelable.

Les agences de l’eau sont des établissements publics administratifs de l’État. Les offices de l’eau sont des établissements publics locaux à caractère administratif rattachés au département. Le bénéficiaire institutionnel satisfait donc au test du secteur public pour cette fiche.

### Correspondance statistique directe

La ligne 67 de la National tax list est intitulée « Redevances sur les prélèvements de l’eau », classée `D214H C07`, et porte **826 M€ en 2024**.

Cette ligne est directement attribuée à la fiche canonique. Le montant reste un total national : il n’est pas réparti entre bassins, agences, offices, usages ou territoires.

L’année historique de création n’est pas déduite de la réforme récente et reste à établir.

## Pollution non domestique : périmètre courant resserré

La ligne 35 du brouillon utilisait un intitulé général de pollution non domestique. Dans la forme applicable en 2026, la créance correspond à la pollution annuelle rejetée directement dans le milieu naturel par les industriels non raccordés au réseau public de collecte, selon les seuils, paramètres et méthodes de mesure prévus par les articles L. 213-10-1 et L. 213-10-2.

Le montant de 107 M€ du brouillon ne porte pas d’année de référence. Il n’est pas repris.

La ligne statistique résiduelle « Autres taxes sur la pollution » ne nomme pas cette redevance et peut couvrir de nombreuses autres taxes environnementales. La fiche reste donc bloquée sur le classement individuel et la recette.

## Pollution de l’eau par les activités d’élevage

Cette redevance active ne disposait pas d’entrée autonome dans le brouillon.

L’assiette est construite à partir du nombre d’unités de gros bétail, avec les conditions de chargement, seuils et réfactions prévus par l’article L. 213-10-3. Le dossier conserve notamment :

- un seuil de 150 unités de gros bétail dans certaines zones de montagne ;
- un seuil de 90 unités dans les autres zones ;
- une réfaction de 40 unités au-dessus du seuil ;
- un tarif de référence de 3 € par unité avant indexation ;
- une multiplication par trois dans certaines situations de condamnation prévues par le texte.

Ces paramètres ne constituent ni des recettes ni des prélèvements distincts.

## Nouvelle redevance PFAS

La loi de finances pour 2026 a créé une redevance sur les rejets de substances perfluoroalkylées et polyfluoroalkylées, applicable depuis le **1er mars 2026**.

Elle vise les exploitants d’installations soumises à autorisation rejetant les substances figurant dans la liste réglementaire. Le dossier enregistre :

- un seuil annuel d’exonération de 100 grammes ;
- un tarif de 100 € par hectogramme avant indexation.

Cette créance est postérieure à l’année 2024 couverte par la National tax list archivée. Elle ne peut donc pas recevoir par rétroprojection une recette ou une classification individuelle tirée de cette statistique.

## Redevance pour pollutions diffuses

La ligne 36 correspond à la redevance prévue par l’article L. 213-10-8, due notamment lors de l’acquisition de certains produits phytopharmaceutiques, de semences traitées ou de prestations de traitement entrant dans son champ.

Le code fixe plusieurs tarifs par kilogramme de substance, différenciés selon la catégorie de danger. Ces tarifs restent les composantes d’une seule redevance.

L’année 1964 du brouillon n’est pas conservée comme année de création : elle peut correspondre à l’origine générale des agences de l’eau, sans établir l’origine de cette créance dans sa forme et sa granularité actuelles. Le montant non daté de 107 M€ est également écarté.

## Stockage d’eau en période d’étiage

La redevance de l’article L. 213-10-10 vise les installations de stockage dépassant un million de mètres cubes lorsque tout ou partie du volume écoulé dans un cours d’eau est stocké pendant l’étiage.

L’assiette correspond à la différence de volume stocké entre le début et la fin de la période, avec les exclusions prévues pour certaines crues. Le tarif maximal de référence est de 0,01 € par mètre cube avant indexation.

Le montant de 1,3 M€ et l’année 2006 du brouillon restent non validés faute de source de recette et de recherche historique complète.

## Protection du milieu aquatique

La redevance de l’article L. 213-10-12 est liée à l’exercice de la pêche et comporte plusieurs limites tarifaires :

| Modalité | Limite avant indexation |
|---|---:|
| pêche annuelle d’une personne majeure | 10 € |
| pêche pendant sept jours consécutifs | 4 € |
| pêche à la journée | 1 € |
| supplément annuel pour certaines espèces migratrices | 20 € |

La collecte peut être effectuée par les fédérations ou associations de pêche et les autres structures désignées par le texte. La créance reste bloquée tant que la correspondance SEC et le reroutage vers les agences ou offices ne sont pas documentés de façon suffisamment précise.

L’année 1941 du brouillon ne doit pas être assimilée à la création de la redevance actuelle, et les 8,5 M€ non datés ne sont pas repris.

## Réforme appliquée depuis 2025

La loi de finances pour 2024 a créé trois redevances applicables à compter du **1er janvier 2025** :

1. la redevance sur la consommation d’eau potable ;
2. la redevance pour la performance des réseaux d’eau potable ;
3. la redevance pour la performance des systèmes d’assainissement collectif.

Dans le mécanisme courant de facturation, elles ont remplacé la redevance pour pollution de l’eau d’origine domestique et la redevance pour modernisation des réseaux de collecte.

### Consommation d’eau potable

Cette redevance est due par l’abonné au service d’eau potable et repose principalement sur le volume facturé. Le tarif maximal légal de référence est de 1 € par mètre cube avant indexation.

Elle ne peut pas être rapprochée de la ligne NTL 67 : cette ligne vise le prélèvement dans la ressource naturelle, alors que la nouvelle redevance vise la consommation facturée.

### Performance des réseaux d’eau potable

La redevance est due par la commune ou l’établissement public compétent. Son calcul combine le volume facturé, un tarif de bassin et un coefficient de modulation tenant notamment aux pertes du réseau et à la gestion patrimoniale.

Le tarif maximal de référence est de 1 € par mètre cube avant indexation. Les coefficients de performance sont des paramètres de calcul et non des créances autonomes.

### Performance des systèmes d’assainissement collectif

Cette redevance est due par la commune ou l’établissement public compétent en matière d’épuration. Son calcul combine également le volume facturé, un tarif de bassin et des coefficients liés au suivi, à la conformité et à l’efficacité du système.

Comme les deux autres redevances créées pour 2025, elle est postérieure aux observations 2024 de la NTL et reste sans classement SEC individuel dans les sources archivées.

## La ligne outre-mer n’est pas une créance

La ligne 39, « Redevances de l’eau dans les départements d’outre-mer », regroupe plusieurs redevances établies par les offices de l’eau. Elle ne correspond ni à une assiette unique ni à un fait générateur unique.

Elle est donc supprimée comme unité canonique et transformée en profils territoriaux des fiches juridiques correspondantes.

Le montant de 2 M€ du brouillon, sans année et sans ventilation, n’est attribué à aucune redevance.

## Enveloppes non ventilées

### National tax list

La ligne 64, « Autres taxes sur la pollution », porte **1 095 M€ en 2024**. Son caractère résiduel interdit de la répartir entre pollution industrielle, élevage, PFAS, pollutions diffuses ou d’autres taxes environnementales.

### Loi de finances pour 2026

L’article 135 documente, pour les agences de l’eau :

- un rendement prévisionnel de **2 485,65912 M€** en 2026 ;
- un plafond d’affectation de **2 482,62 M€**.

Cette enveloppe couvre une liste beaucoup plus large que les seules redevances reprises ici. Elle comprend notamment prélèvement, pollution, consommation, performance, pollutions diffuses, stockage et protection du milieu aquatique, ainsi que des libellés de transition. Aucun montant n’est réparti entre les fiches.

Le plafond est une règle budgétaire d’affectation, pas la recette d’une redevance particulière.

## Mentions transitoires à ne pas publier seules

La loi de finances pour 2026 réinsère les libellés « modernisation des réseaux de collecte » et « obstacle sur les cours d’eau » dans la liste générale des ressources plafonnées et dans l’énumération de l’article L. 213-10.

Au 2 septembre 2026, la sous-section opérationnelle des articles L. 213-10-1 à L. 213-10-12 ne fournit cependant pas de nouvel article autonome fixant une assiette et un tarif pour ces deux libellés.

Le lot ne crée donc aucune fiche active sur le seul fondement d’une mention dans une liste de ressources. Une recherche ultérieure devra déterminer s’il s’agit d’encaissements de droits antérieurs, d’une règle transitoire ou d’une coordination législative incomplète.

## Limite avec l’hydroélectricité

La ligne 31 du brouillon, « redevance proportionnelle sur l’énergie hydraulique », est réservée à un lot distinct. Le code de l’énergie a connu une transition importante au 1er septembre 2026 entre d’anciennes redevances de concession et une nouvelle architecture.

Cette recherche ne doit pas être confondue avec la modalité hydroélectrique de la redevance pour prélèvement sur la ressource en eau. Un même ouvrage peut relever de normes différentes sans que leurs créances soient identiques.

## Garde-fous appliqués

1. Une ligne territoriale regroupant plusieurs assiettes n’est pas publiée comme prélèvement unique.
2. Une redevance nationale et ses profils outre-mer ne sont pas dupliqués lorsque l’objet juridique reste commun.
3. La seule ligne statistique directement nommée est attribuée à la seule redevance correspondante.
4. Une enveloppe résiduelle sur la pollution n’est pas ventilée.
5. Le rendement et le plafond globaux des agences ne deviennent pas des recettes individuelles.
6. Les créances créées en 2025 ou 2026 ne sont pas rétroprojetées dans des observations arrêtées à 2024.
7. Un tarif, un seuil, un plafond ou un coefficient n’est pas une recette.
8. Un libellé budgétaire sans assiette opérationnelle n’est pas transformé en fiche active.
9. L’usage hydroélectrique de l’eau n’est pas confondu avec une redevance du code de l’énergie.
10. Les montants non datés du brouillon ne sont pas promus.
11. Les données servies par l’application restent inchangées.
