# Audit 2026 des prélèvements obligatoires — lot « financement social »

Date de vérification : **1er septembre 2026**  
Fichier de données : [`data/audit/financement-social-2026-09-01.json`](../data/audit/financement-social-2026-09-01.json)  
Périmètre général : [`docs/prelevements-obligatoires-methodologie.md`](prelevements-obligatoires-methodologie.md)

## Objet du lot

La première phase de l'audit a confirmé l'appartenance au périmètre de 106 entrées, mais aucune fiche n'était encore publiable : les montants du brouillon n'avaient pas d'année de référence fiable et les bases juridiques n'étaient pas toujours reprises dans un schéma canonique.

Ce lot poursuit le travail sur cinq prélèvements de financement social disposant d'un croisement robuste entre comptabilité nationale, droit en vigueur et documentation financière :

- contribution sociale généralisée (CSG) ;
- contribution pour le remboursement de la dette sociale (CRDS) ;
- contribution sociale de solidarité des sociétés (C3S) ;
- forfait social ;
- taxe sur les salaires.

Les cinq fiches sont marquées `ready_for_review`. Elles ne modifient pas encore `entries-full.json` ni `entries-light.json`.

## Résultat synthétique

| Prélèvement | Code NTL | Création retenue | Recette observée 2024 | Prévision totale 2026 | Base juridique au 1er septembre 2026 |
| --- | --- | ---: | ---: | ---: | --- |
| CSG | D51M C04 | 1991 | 153 131 M€ | non disponible dans l'annexe 3 | CSS, art. L. 136-1 à L. 136-8 |
| CRDS | D51M C03 | 1996 | 9 084 M€ | non disponible dans l'annexe 3 | Ordonnance n° 96-50, art. 14 à 19 |
| C3S | D29H C02 | 1970 | 5 228 M€ | 5 452 M€ | CSS, art. L. 137-30 à L. 137-39 |
| Forfait social | D29C C09 | 2009 | 6 300 M€ | 7 640 M€ | CSS, art. L. 137-15 à L. 137-17 |
| Taxe sur les salaires | D29C C03 | 1948 | 17 315 M€ | 17 877 M€ | CGI, art. 231 |

La recette observée provient de la **National tax list 2026** et porte dans tous les cas sur 2024. La prévision 2026 provient de l'annexe 3 du PLFSS 2026. Ces deux séries restent séparées : une prévision ne remplace jamais un montant constaté.

## Décisions méthodologiques

### CSG et CRDS : ne pas fabriquer un total 2026

L'annexe 3 fournit quatre lignes utiles, mais partielles : CSG sur les produits de placement, CSG sur les revenus du patrimoine, CRDS sur les produits de placement et CRDS sur les revenus du patrimoine. Ces lignes ne couvrent pas les revenus d'activité et de remplacement ; leur somme ne peut donc pas servir de recette totale 2026.

Le fichier conserve les composantes pour la traçabilité, tout en laissant `forecast_total` à `null` pour la CSG et la CRDS.

### Doublons fonctionnels de la NTL

La NTL répète le total 2024 de la CSG aux lignes 139 et 148, et celui de la CRDS aux lignes 138 et 147, dans des ventilations fonctionnelles distinctes. Les montants étant identiques, ils ne sont pas additionnés. Les lignes canoniques retenues sont 139 pour la CSG et 138 pour la CRDS.

### C3S : deux corrections du brouillon

Le brouillon indiquait une création en **1992**. La contribution a été créée par la loi n° 70-13 du 3 janvier **1970** ; le décret n° 70-368 du 29 avril 1970 en a fixé les conditions d'application. La fiche canonique retient donc 1970.

L'annexe 3 du PLFSS cite encore l'article **L. 651-5** du code de la sécurité sociale. Cette numérotation est antérieure à l'ordonnance n° 2018-470 : l'ancien article L. 651-5 est devenu l'article L. 137-33 et la C3S figure désormais aux articles L. 137-30 à L. 137-39. Le fichier conserve la référence imprimée comme information de provenance, mais emploie la numérotation actuelle comme base juridique.

### Années de création

Le millésime retenu correspond à l'origine du prélèvement ou à sa première application :

- CSG : revenus perçus à compter du 1er février 1991 ;
- CRDS : perception à compter du 1er février 1996 ;
- C3S : loi créatrice du 3 janvier 1970 ;
- forfait social : sommes versées à compter du 1er janvier 2009 ;
- taxe sur les salaires : origine dans le versement forfaitaire institué en 1948, avant sa pérennisation et son appellation actuelle.

## Affectation documentée par le PLFSS 2026

Pour 2026, l'annexe 3 affecte la C3S et le forfait social à la CNAV. Elle répartit la taxe sur les salaires entre la CNAV (62,73 %), la CNAF (10,74 %), la CNAM (20,39 %) et la CNSA (6,14 %). La somme des parts est contrôlée à 100 % dans le fichier de lot.

Ces affectations décrivent le document financier 2026 ; elles ne sont pas utilisées pour créer plusieurs prélèvements. Une fraction affectée reste une modalité de répartition d'un prélèvement unique.

## État de complétude

Chaque fiche possède désormais :

- un identifiant canonique unique ;
- une preuve de classification en comptabilité nationale ;
- une base juridique vérifiée au 1er septembre 2026 ;
- une année de création sourcée ;
- une recette observée avec année, unité et localisateur ;
- les éventuelles prévisions, affectations, discordances et limites de source.

Le passage dans les données de production reste volontairement différé. Il faudra d'abord arrêter le schéma final des fiches canoniques, décider quelles métadonnées afficher dans l'interface, puis reconstruire simultanément les fichiers léger et complet avec une nouvelle version et les estampilles hors ligne.
