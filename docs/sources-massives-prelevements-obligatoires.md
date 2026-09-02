# Sources massives pour documenter les prélèvements obligatoires

Date de vérification : **2 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

## Objet

L’audit ne peut pas progresser durablement par une succession de recherches isolées. Il faut d’abord constituer un petit nombre de référentiels reproductibles qui couvrent chacun une partie du problème :

- découvrir les prélèvements et leurs anciennes appellations ;
- retrouver leur base juridique et leur état de vigueur ;
- établir leur bénéficiaire économique ;
- obtenir un classement de comptabilité nationale ;
- rattacher des recettes à une année et à une unité ;
- conserver les agrégats, fractions et changements de périmètre sans les transformer artificiellement en prélèvements autonomes.

Le registre machine-readable associé est
[`data/reference/bulk-sources.json`](../data/reference/bulk-sources.json).

## Conclusion opérationnelle

**Aucune source massive ne remplit seule le test cumulatif du projet.** La stratégie doit donc croiser plusieurs référentiels plutôt que chercher une liste unique prétendument exhaustive.

Les quatre pivots prioritaires sont :

1. la **National tax list 2026** pour le classement SEC et les recettes observées jusqu’en 2024 ;
2. l’**article 135 de la loi de finances pour 2026** pour 135 lignes de ressources affectées, leurs références juridiques, bénéficiaires, rendements prévisionnels et plafonds ;
3. l’**annexe 3 du PLFSS 2026** pour les impositions affectées à la sécurité sociale et leurs prévisions ;
4. le **tome I des Voies et moyens du PLF 2026** pour les lignes de recettes de l’État, l’exécution 2024, la révision 2025 et les prévisions 2026.

Ces sources produisent des **candidats, des montants et des relations**. Elles ne publient pas automatiquement des fiches canoniques. La vigueur doit être contrôlée dans le droit consolidé et les correspondances ambiguës doivent rester en attente.

## Critères d’une source « massive »

Une source est retenue dans ce registre lorsqu’elle satisfait la plupart des critères suivants :

- elle couvre une famille entière ou plusieurs dizaines de lignes ;
- elle fournit des identifiants, lignes, articles, codes ou variables réutilisables ;
- son extraction peut être répétée à chaque millésime ;
- sa provenance et son état à une date donnée peuvent être archivés ;
- elle réduit réellement le nombre de recherches unitaires ;
- ses limites sont assez explicites pour éviter les faux rapprochements.

Un portail thématique sans export, un article explicatif isolé ou une page de barème reste utile comme preuve ciblée, mais n’est pas une source massive au sens de ce document.

## Ordre de priorité

| Priorité | Source | État | Rendement documentaire principal |
| --- | --- | --- | --- |
| 1 | National tax list 2026 — France | déjà ingérée | 141 lignes statistiques, codes SEC et recettes 1995-2024 |
| 1 | LFI 2026, article 135 | prête à ingérer | 135 lignes d’affectation, références juridiques, bénéficiaires, prévisions et plafonds |
| 1 | PLFSS 2026, annexe 3, tableau 31 | déjà ingérée | impositions sociales affectées, bases juridiques et prévisions 2025-2026 |
| 1 | PLF 2026, Voies et moyens, tome I | prête à ingérer | recettes fiscales de l’État et impôts affectés, avec trois millésimes budgétaires |
| 2 | DGFiP — REI | prête à ingérer | fiscalité directe locale par commune, taxe et bénéficiaire depuis 1982 |
| 2 | DILA — archives LEGI | prototype requis | droit consolidé et historique à grande échelle |
| 2 | API Légifrance | prototype requis | enrichissement ciblé des articles et de leurs versions |
| 3 | DGFiP — fiscalité locale des particuliers | source de contrôle | taux courants et composition territoriale |
| 3 | Open Urssaf | source de contrôle | encaissements administratifs, exonérations et périmètres de collecte |
| 3 | Insee — agrégats de prélèvements obligatoires | source de contrôle | cohérence macroéconomique annuelle |
| 3 | API catalogue et API tabulaire data.gouv.fr | infrastructure | découverte, métadonnées, schémas et accès aux ressources |

Les états détaillés, formats, clés de jointure, limites et prochaines actions sont conservés dans
[`bulk-sources.json`](../data/reference/bulk-sources.json).

## Matrice de couverture

`Fort` signifie que la source fournit directement le champ pour de nombreuses lignes.  
`Partiel` signifie qu’elle ne le fournit que pour son périmètre ou sous une forme à retraiter.

| Source | Découverte | Base juridique | Vigueur | Bénéficiaire | Recette observée | Prévision | Code SEC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| National tax list | fort | faible | non | partiel | fort | non | fort |
| LFI, article 135 | fort | fort | partiel | fort | non | fort | non |
| PLFSS, annexe 3 | fort | fort | partiel | fort | partiel | fort | non |
| Voies et moyens, tome I | fort | partiel | partiel | partiel | fort | fort | non |
| REI | fort pour le local | faible | partiel | fort | fort | non | non |
| LEGI / API Légifrance | découverte assistée | fort | fort | faible | non | non | non |
| Open Urssaf | partiel | faible | partiel | partiel | administratif | non | non |
| Insee agrégé | non | non | non | non | agrégé | non | agrégé |

Cette matrice explique les blocages rencontrés dans les lots précédents : une ligne peut avoir une base juridique et un rendement budgétaire sans code SEC individuel, ou un code SEC et une recette historique sans preuve de vigueur en 2026.

## Sources pivots

### 1. National tax list 2026 — feuille France

Source officielle :
[Data on Taxation Trends — National tax list](https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en).

Extraction locale :
[`ntl-france-2026.json`](../data/reference/ntl-france-2026.json).

La feuille française apporte :

- 141 lignes nationales de détail ;
- un code SEC et un code national ;
- un libellé français et anglais ;
- une fonction économique ;
- des recettes annuelles de 1995 à 2024.

C’est la meilleure source de masse actuellement intégrée pour établir l’appartenance statistique au champ des prélèvements obligatoires et documenter des recettes observées.

Limites impératives :

- une ligne NTL est une unité statistique, pas nécessairement une créance juridique ;
- certaines lignes sont des agrégats ou des résidus ;
- une recette positive en 2024 ne prouve pas que la taxe est encore en vigueur le 2 septembre 2026 ;
- une ligne à zéro n’autorise ni l’exclusion ni la conclusion d’une recette nulle en 2026.

Prochaine exploitation : produire un rapport de rapprochement des 371 lignes historiques vers les 141 lignes NTL, avec quatre états explicites : `exact`, `probable`, `ambiguous`, `unmatched`.

### 2. Loi de finances pour 2026 — article 135

Source officielle :
[Légifrance — article 135 de la loi n° 2026-103 du 19 février 2026](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053511577).

Le tableau contient 135 lignes et fournit pour chacune :

- les références juridiques ;
- l’intitulé de la ressource ;
- le bénéficiaire actuel ;
- un éventuel nouveau bénéficiaire ;
- le rendement prévisionnel 2026 ;
- le plafond d’affectation 2026.

C’est le prochain référentiel à ingérer : son rapport entre volume, précision juridique et facilité d’extraction est particulièrement favorable.

Limites impératives :

- le tableau porte sur des « impositions de toutes natures ou ressources affectées » ; toutes ses lignes ne sont donc pas automatiquement des prélèvements obligatoires ;
- il exclut les collectivités territoriales et leurs établissements publics, les organismes de sécurité sociale et l’audiovisuel public ;
- une taxe peut apparaître plusieurs fois selon la fraction ou le bénéficiaire ;
- les rendements sont prévisionnels et indiqués comme tels par la loi.

Sortie attendue :
`data/reference/lfi-2026-article-135-impositions.json`, avec conservation du numéro de ligne, du texte brut, des références, des bénéficiaires et des montants en euros.

### 3. PLFSS 2026 — annexe 3, tableau 31

Source officielle :
[Annexe 3 du PLFSS 2026](https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2026/PLFSS2026-Annexe3-20251015-103900-55-4_avec%20couverture.pdf).

Extraction locale :
[`lfss-2026-annexe-3-impositions.json`](../data/reference/lfss-2026-annexe-3-impositions.json).

Le tableau couvre plusieurs impositions affectées à la sécurité sociale, avec leur base juridique et leurs prévisions 2025 et 2026. Il complète directement l’article 135, qui exclut précisément les bénéficiaires de sécurité sociale.

Limites impératives :

- il s’agit d’une annexe au projet de loi ; les mesures ponctuelles doivent être contrôlées dans la loi promulguée ;
- la présence dans le tableau établit une information budgétaire et d’affectation, pas le code SEC individuel ;
- les enveloppes communes à plusieurs mécanismes ne doivent pas être ventilées sans source explicite ;
- les anciennes références doivent être rapprochées des recodifications intervenues depuis la publication.

Prochaine exploitation : compléter l’extraction par les bénéficiaires et les identifiants de ligne source lorsque le tableau les distingue.

### 4. PLF 2026 — Voies et moyens, tome I

Source officielle :
[Évaluation des voies et moyens — tome I : recettes](https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf).

Le document fournit en masse :

- les lignes de recettes fiscales et non fiscales de l’État ;
- l’exécution 2024 ;
- l’évaluation révisée 2025 ;
- la prévision 2026 ;
- un tableau des impôts affectés à des personnes morales autres que l’État ;
- des classeurs de calcul associés pour les mesures nouvelles et les modifications des règles fiscales.

Cette source est essentielle pour documenter les recettes d’État qui ne figurent ni dans l’article 135 ni dans l’annexe sociale.

Limites impératives :

- les comptes budgétaires de l’État ne se confondent pas avec les comptes nationaux ;
- les lignes peuvent être nettes, agrégées ou construites selon une nomenclature budgétaire ;
- les montants révisés et prévisionnels ne sont pas des observations ;
- les classeurs associés doivent être retrouvés, archivés et hachés avant automatisation.

Prochaine exploitation : archiver les classeurs, extraire les lignes fiscales et conserver trois champs distincts pour 2024 observé, 2025 révisé et 2026 prévu.

## Sources complémentaires à forte couverture

### DGFiP — REI

Source :
[Recensement des éléments d’imposition à la fiscalité directe locale](https://www.data.gouv.fr/datasets/impots-locaux-fichier-de-recensement-des-elements-dimposition-a-la-fiscalite-directe-locale-rei-4).

Le REI est agrégé au niveau communal et détaille la fiscalité directe locale par taxe et collectivité bénéficiaire depuis 1982. Il couvre notamment la TFPB, la TFPNB, la taxe d’habitation, la CFE, les TSE, la TEOM, les IFER et la TASCOM, ainsi que plusieurs taxes annexes.

Il permet de remplacer de nombreuses vérifications unitaires par une extraction annuelle commune à l’ensemble de la fiscalité directe locale.

Précautions :

- seules les impositions primitives sont couvertes ;
- les dictionnaires de variables et formats peuvent changer entre millésimes ;
- les fractions de TVA et taxes annexes ne doivent pas être transformées automatiquement en unités juridiques ;
- il ne couvre pas toutes les taxes locales indirectes ni les redevances.

La première ingestion doit porter sur le dictionnaire du dernier millésime et sur une agrégation nationale par taxe et bénéficiaire. L’historique complet peut venir ensuite.

### DILA — base LEGI et API Légifrance

Archives :
[index des fichiers LEGI](https://echanges.dila.gouv.fr/OPENDATA/LEGI/).

Documentation :
[Open data et API Légifrance](https://www.legifrance.gouv.fr/contenu/pied-de-page/open-data-et-api).

La DILA publie une archive globale de la base LEGI et des incréments quotidiens. Au 2 septembre 2026, l’archive globale visible est datée du 13 juillet 2025 et les incréments vont jusqu’au 1er septembre 2026. L’API stable Légifrance est gratuite après inscription sur PISTE et soumise à des quotas.

Ces deux accès peuvent industrialiser :

- la résolution d’une référence de code vers un identifiant juridique stable ;
- la récupération de la version en vigueur à une date donnée ;
- le suivi des créations, remplacements et abrogations ;
- l’identification des renvois entre création, affectation et recouvrement.

Ils ne permettent pas, seuls, d’identifier tous les prélèvements : le mot « taxe » apparaît aussi dans des dispositifs hors périmètre et de nombreuses cotisations ne sont pas repérables par un simple motif lexical.

Le prototype doit donc indexer d’abord un sous-ensemble : CIBS, CGI, CSS, CGCT, code de l’environnement, code des transports et code du travail.

### Open Urssaf

API :
[Open Urssaf — Explore API 2.0](https://open.urssaf.fr/api/explore/v2.0).

Jeux repérés :

- [Encaissements annuels des Urssaf](https://open.urssaf.fr/explore/dataset/encaissements-annuels-des-urssaf/) ;
- [Exonérations par grandes catégories](https://open.urssaf.fr/explore/dataset/exos-champ-large-par-grandes-categories/).

L’API donne accès à l’ensemble des jeux publics du portail. Les jeux repérés peuvent documenter des montants administratifs, des catégories de collecte et le champ des exonérations.

Ils restent des sources de contrôle :

- aucune extraction publique exhaustive par prélèvement ou code type de personnel n’a encore été identifiée ;
- une catégorie d’encaissement ne correspond pas nécessairement à une créance juridique ;
- les champs institutionnels et géographiques diffèrent selon les jeux ;
- les montants administratifs ne valent pas classement SEC.

Le prochain test doit inventorier les schémas de tous les jeux liés aux encaissements et vérifier si une dimension CTP suffisamment fine existe.

### Fiscalité locale des particuliers

Source :
[DGFiP — Fiscalité locale des particuliers](https://www.data.gouv.fr/datasets/fiscalite-locale-des-particuliers).

Ce jeu fournit des taux globaux et leurs composantes pour la TFPB, la TFPNB et la taxe d’habitation, ainsi que le taux de TEOM. Il sert à contrôler l’applicabilité et les taux courants après ingestion du REI.

Il ne doit pas être utilisé comme inventaire canonique : certains taux agrègent plusieurs niveaux ou taxes annexes, les taxes des chambres ne sont pas incluses et les zonages ou parts incitatives de TEOM ne sont pas restitués.

### Insee — série agrégée

Source :
[Prélèvements obligatoires — séries annuelles](https://www.insee.fr/fr/statistiques/2381412).

La série sert à vérifier la cohérence macroéconomique globale, pas à répartir un écart entre fiches. Une divergence peut résulter de la couverture, du calendrier, des consolidations, des crédits d’impôt ou des conventions de comptes nationaux.

### data.gouv.fr — infrastructure d’accès

API catalogue :
[`https://www.data.gouv.fr/api/1`](https://www.data.gouv.fr/api/1).

API tabulaire :
[`https://tabular-api.data.gouv.fr/api`](https://tabular-api.data.gouv.fr/api).

L’API catalogue permet de surveiller les métadonnées, licences, producteurs, dates de mise à jour et URL des ressources. L’API tabulaire permet de profiler et requêter les ressources compatibles, notamment en CSV, CSV compressé, XLS, XLSX et Parquet dans les limites publiées.

data.gouv.fr n’est pas l’autorité probatoire de fond : cette qualité reste celle du producteur de chaque jeu. Les identifiants de jeu et de ressource, l’URL réelle, le schéma, la date de collecte et l’empreinte du fichier doivent être archivés.

## Pipeline d’exploitation

### Étape 1 — Geler la source

Pour chaque millésime :

- enregistrer l’URL de la page et l’URL réelle de la ressource ;
- enregistrer le producteur, la licence, la date de publication et la date de récupération ;
- calculer une empreinte du fichier téléchargé ;
- conserver le nom de feuille, la page, le numéro de ligne ou le code de variable ;
- archiver le schéma ou dictionnaire associé.

### Étape 2 — Extraire sans interpréter

L’extraction brute doit conserver :

- l’identifiant de ligne source ;
- le libellé original ;
- les références juridiques telles que publiées ;
- les bénéficiaires tels que publiés ;
- chaque montant avec son type, son année, son unité et son statut observé, révisé ou prévu ;
- les notes et avertissements de la source.

Aucune fusion, scission ou correction de nom ne doit écraser les champs bruts.

### Étape 3 — Normaliser pour le rapprochement

Créer des champs dérivés séparés :

- nom normalisé sans ponctuation ni accents ;
- sigles et anciennes appellations ;
- références structurées `code + article + version` ;
- bénéficiaire normalisé ;
- année et type de montant ;
- identifiants statistiques SEC et nationaux lorsqu’ils sont fournis.

Les transformations doivent être déterministes et testables.

### Étape 4 — Proposer des correspondances

Ordre de confiance recommandé :

1. même référence juridique stable ;
2. même référence et même bénéficiaire ;
3. même libellé normalisé ou même sigle non ambigu ;
4. même libellé, même bénéficiaire et millésime compatible ;
5. similarité textuelle utilisée uniquement pour créer une file de revue.

Une correspondance floue ne doit jamais attribuer automatiquement un code SEC, une recette ou un statut juridique.

### Étape 5 — Conserver les relations de granularité

Une source peut décrire :

- la même créance sous un ancien nom ;
- une fraction affectée ;
- un agrégat de plusieurs prélèvements ;
- plusieurs bénéficiaires d’un même prélèvement ;
- une ligne statistique qui regroupe plusieurs bases juridiques ;
- une ligne juridique qui correspond à plusieurs sous-lignes statistiques.

Le futur rapprochement doit donc être une table de relations, pas une simple clé unique. Les types minimaux à prévoir sont :

- `same_levy`;
- `historical_name`;
- `fraction_of`;
- `aggregate_of`;
- `replaced_by`;
- `candidate_match`;
- `unresolved`.

### Étape 6 — Réserver la revue humaine aux ambiguïtés

L’automatisation doit sortir au minimum :

- les candidats nouveaux absents des 371 lignes ;
- les lignes historiques sans source massive correspondante ;
- les correspondances univoques ;
- les agrégats ou fractions nécessitant une décision ;
- les divergences de nom, de bénéficiaire, d’année ou de montant ;
- les prélèvements statistiquement attestés mais juridiquement incertains ;
- les prélèvements juridiquement actifs sans classement SEC individuel.

Le travail manuel peut alors se concentrer sur ces exceptions au lieu de reprendre toutes les lignes.

## Schéma minimal d’une ligne extraite

```json
{
  "source_id": "legifrance-lfi-2026-article-135",
  "source_row_id": "135:42",
  "raw_name": "Libellé publié par la source",
  "legal_references": [
    {
      "code": "CIBS",
      "article": "L. 000-0",
      "raw": "Art. L. 000-0 du code des impositions sur les biens et services"
    }
  ],
  "beneficiaries": [
    {
      "raw": "Bénéficiaire publié",
      "normalized_id": null
    }
  ],
  "amounts": [
    {
      "kind": "forecast",
      "year": 2026,
      "value": 0,
      "unit": "EUR"
    }
  ],
  "locator": "tableau, ligne 42",
  "retrieved_at": "2026-09-02",
  "raw_record": {}
}
```

`raw_record` permet de réauditer l’extraction sans retourner immédiatement au document original.

## Règles non négociables

1. **Absence n’est pas abrogation.** Une ligne absente d’une source spécialisée peut être hors de son périmètre.
2. **Zéro n’est pas inconnu.** Une prévision explicitement nulle se conserve comme `0`; une donnée absente reste `null`.
3. **Prévision n’est pas observation.** Les montants 2026 des lois financières ne remplacent jamais une recette NTL 2024.
4. **Ligne n’est pas prélèvement.** Une ligne d’affectation, un agrégat budgétaire ou une variable locale ne crée pas une fiche canonique.
5. **Le droit ne prouve pas le SEC.** Un article en vigueur doit encore être relié à S.13/S.212 et à une opération D.2, D.5, D.91 ou de cotisation sociale effective obligatoire.
6. **Le SEC ne prouve pas la vigueur.** Une ligne statistique historique doit être contrôlée dans le droit au jour de référence.
7. **Aucune ventilation implicite.** Un total familial reste non alloué tant qu’une source ne publie pas sa répartition.
8. **Toute transformation reste réversible.** Les valeurs normalisées ne remplacent jamais les valeurs brutes.
9. **Toute correspondance porte une confiance et une justification.**
10. **Les identifiants de source sont stables d’un millésime à l’autre.**

## Backlog recommandé

### Lot A — extraire l’article 135

Livrable : `data/reference/lfi-2026-article-135-impositions.json`.

Critères :

- exactement 135 lignes sources ;
- montants en euros, sans conversion implicite ;
- `null` distinct de « non plafonnée » ;
- références et bénéficiaires conservés en texte brut ;
- numéro de ligne et URL de version présents ;
- contrôle de somme uniquement informatif, sans dédoublonnage automatique.

### Lot B — extraire les Voies et moyens

Livrables :

- archive de provenance des classeurs associés ;
- extraction des lignes fiscales de l’État ;
- extraction des impôts affectés ;
- séparation stricte entre `observed_2024`, `revised_2025` et `forecast_2026`.

### Lot C — couvrir la fiscalité directe locale

Livrables :

- registre versionné des variables du dernier REI ;
- table nationale agrégée par taxe et bénéficiaire ;
- rapport des taxes du brouillon présentes, absentes ou agrégées dans le REI ;
- documentation des ruptures de série avant ingestion historique complète.

### Lot D — construire le résolveur juridique

Livrables :

- prototype LEGI sur les codes prioritaires ;
- résolution d’une référence en identifiant et version en vigueur ;
- détection des articles abrogés, remplacés ou à entrée en vigueur future ;
- comparaison documentée avec l’API Légifrance.

### Lot E — produire le rapport de rapprochement

Livrable : un fichier de travail reliant les 371 entrées historiques aux sources massives.

Chaque relation devra contenir :

- l’identifiant de l’entrée historique ;
- l’identifiant et la ligne de source ;
- le type de relation ;
- la confiance ;
- la justification ;
- les conflits détectés ;
- l’état de revue.

## Définition de fini pour l’ingestion d’une source massive

Une source n’est considérée comme ingérée que lorsque :

- sa provenance, son millésime et son empreinte sont conservés ;
- le nombre de lignes extrait est contrôlé ;
- les champs bruts peuvent être retrouvés ;
- les valeurs absentes sont distinguées des zéros ;
- les unités et types de montant sont explicites ;
- les limites de couverture sont documentées ;
- l’extraction est reproductible ;
- aucun rapprochement ambigu n’a été publié comme certitude ;
- les tests vérifient les identifiants uniques et le schéma ;
- le registre [`bulk-sources.json`](../data/reference/bulk-sources.json) est mis à jour.

## Décision pour la suite de l’issue #36

La prochaine étape à plus fort rendement n’est pas un nouveau lot thématique ligne par ligne. C’est l’extraction structurée de l’article 135 de la LFI 2026, puis son rapprochement avec la NTL, l’annexe sociale et le brouillon de 371 lignes.

Cette séquence doit faire apparaître en une passe :

- des prélèvements absents du brouillon ;
- des anciennes appellations ;
- des fractions à ne pas compter séparément ;
- des bénéficiaires à contrôler au regard de S.13 ;
- des rendements prévisionnels à conserver sans les confondre avec les observations ;
- les lignes pour lesquelles seule la preuve SEC reste manquante.
