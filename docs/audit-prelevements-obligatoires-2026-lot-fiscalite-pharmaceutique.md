# Audit des prélèvements obligatoires 2026 — lot fiscalité pharmaceutique

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/fiscalite-pharmaceutique-2026-09-02`**  
**Données de production modifiées : non**

Ce sixième lot poursuit la reprise documentaire des prélèvements obligatoires en traitant quatre lignes contiguës du brouillon historique relatives aux entreprises pharmaceutiques : ventes en gros, ancien mécanisme « Lv/Lh », dépenses de promotion et chiffre d'affaires.

La fiche structurée correspondante est publiée dans [`data/audit/fiscalite-pharmaceutique-2026-09-02.json`](../data/audit/fiscalite-pharmaceutique-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Origine | Base juridique au 2 septembre 2026 | Donnée budgétaire | Décision |
|---|---|---|---:|---|
| Contribution sur les ventes en gros de spécialités pharmaceutiques | ligne 19 | CSS, articles L. 138-1 à L. 138-9-1 | 271 M€ prévus en 2026 | conserver et actualiser |
| Contribution sur les dépenses de promotion des médicaments | ligne 21 | CSS, articles L. 245-1 à L. 245-5-1 A | 130 M€ prévus en 2026 | conserver et corriger l'année de création |
| Contribution de base sur le chiffre d'affaires pharmaceutique | ligne 22 | CSS, article L. 245-6, I | enveloppe familiale de 659 M€ | scinder et conserver |
| Contribution additionnelle sur le chiffre d'affaires pharmaceutique | ligne 22 | CSS, article L. 245-6, II | enveloppe familiale de 659 M€ | scinder et conserver |
| Contribution supplémentaire sur le chiffre d'affaires pharmaceutique | ligne 22 | CSS, article L. 245-6, III | enveloppe familiale de 659 M€ | scinder et conserver |
| Contribution de sauvegarde sur les médicaments — montant M | ligne 20, ancien libellé Lv/Lh | CSS, articles L. 138-10 à L. 138-16 | aucune recette individuelle archivée | remapper, classement SEC à confirmer |
| Taxe sur le retard injustifié d'entrée d'un générique | absente du brouillon | CSS, article L. 138-10-1 | aucune recette archivée | ajout d'inventaire bloqué |
| Contribution sur la promotion des dispositifs médicaux | absente du brouillon | CSS, articles L. 245-5-1 à L. 245-5-6 | 48 M€ prévus en 2026 | ajout d'inventaire bloqué |

Cinq fiches franchissent les contrôles de publication. Trois créances juridiquement actives restent bloquées parce que leur correspondance avec une ligne de comptabilité nationale n'est pas assez explicite.

## Une seule enveloppe statistique pour plusieurs créances

La National tax list 2026 publie une ligne 73 classée D214I C01 et intitulée « Taxes pharmaceutiques (contribution grossistes répartiteurs, taxe sur les ventes de médicaments et de cosmétiques) ». Son montant est de **957 M€ en 2024**.

Cette ligne confirme le classement de la famille pharmaceutique mais ne fournit pas le détail des créances. Les 957 M€ ne sont attribués ni à la contribution sur les ventes en gros, ni à la promotion des médicaments, ni à l'une des trois contributions de l'article L. 245-6.

Le lot conserve cette valeur comme enveloppe statistique non ventilée.

## Contribution sur les ventes en gros

La ligne 19 du brouillon portait une recette de 265 M€ sans année et une création en 1991.

La contribution correspondant aux articles L. 138-1 à L. 138-9-1 a été créée en **1996**. Pour les contributions dues au titre de 2026, l'assiette comporte trois parts auxquelles s'appliquent respectivement les taux suivants :

| Part | Taux 2026 |
|---|---:|
| chiffre d'affaires annuel | 1,3 % |
| variation du chiffre d'affaires | 2,25 % |
| écart défini entre prix fabricant, marge et prix de vente aux officines | 20 % |

Le cumul des deux premières parts ne peut être inférieur à 1,25 % ni supérieur à 2,55 % du chiffre d'affaires annuel. Le produit est affecté à la CNAM.

Le PLFSS 2026 fournit des prévisions de 261 M€ en 2025 et 271 M€ en 2026. Le montant non daté de 265 M€ du brouillon n'est pas repris comme recette observée.

## Promotion des médicaments

La ligne 21 indiquait une création en 2005. La contribution a été instituée dès **1983**. L'année 2005 correspond à la première application du barème issu de la réforme de 2004, et non à la création du prélèvement.

L'assiette comprend notamment les rémunérations et charges des personnels de présentation, de promotion ou de vente, les déplacements, les publications et achats d'espaces, les congrès et certaines prestations externalisées, après les abattements prévus par le code.

Le barème comporte quatre tranches :

| Rapport entre dépenses et chiffre d'affaires | Taux |
|---|---:|
| moins de 6,5 % | 19 % |
| de 6,5 % à moins de 12 % | 29 % |
| de 12 % à moins de 14 % | 36 % |
| 14 % ou plus | 39 % |

Ces taux constituent un barème par tranches d'une même contribution ; ils ne doivent pas devenir quatre fiches.

Le PLFSS prévoit 125 M€ en 2025 et 130 M€ en 2026. La recette de 25 M€ du brouillon, dépourvue d'année, est écartée.

## La ligne 22 doit être scindée en trois contributions

Le libellé générique « contribution sur le chiffre d'affaires » ne correspond plus à une unité juridique suffisamment précise.

La rédaction de l'article L. 245-6 applicable aux contributions dues au titre de 2026 institue expressément :

1. une **contribution de base**, au taux de 0,20 % ;
2. une **contribution additionnelle**, au taux de 1,6 % ;
3. une **contribution supplémentaire**, avec un taux de base de 6,45 % en 2026 et un taux différencié de 4,01 % pour les entreprises dont le chiffre d'affaires de référence est inférieur à 50 M€.

Les trois créances ont des champs et des assiettes liés mais distincts. Elles sont donc publiées sous trois identifiants canoniques.

La somme de la contribution supplémentaire et de la contribution de sauvegarde des articles L. 138-10 à L. 138-16 est plafonnée à 10 % du chiffre d'affaires pertinent de chaque entreprise.

L'annexe 3 du PLFSS conserve une seule ligne « contribution due par les entreprises exploitant des médicaments bénéficiant d'une AMM », avec 634 M€ en 2025 et 659 M€ en 2026. Cette enveloppe n'est répartie entre aucune des trois fiches.

## L'ancien mécanisme Lv/Lh devient la contribution de sauvegarde au montant M

Les taux « Lv/Lh » de la ligne 20 correspondent à une version historique de l'article L. 138-10. Le droit applicable en 2026 déclenche une contribution lorsque le chiffre d'affaires agrégé entrant dans le champ dépasse un montant **M**.

Pour 2026, M est fixé à **22,10 milliards d'euros**. Le montant total de la contribution est calculé par tranches marginales à 50 %, 60 % et 70 % de la fraction dépassant ce seuil. La charge est répartie entre les entreprises à 70 % selon leur chiffre d'affaires et à 30 % selon sa progression, avec un plafond individuel de 10 %.

La première version de l'article L. 138-10 date de décembre 1998. L'année 1999 du brouillon est donc corrigée.

La créance reste cependant bloquée dans ce lot : la NTL ne la nomme pas séparément et l'extraction budgétaire archivée ne fournit pas de recette individuelle. Les règles annoncées pour le 1er janvier 2027 ne sont pas appliquées par anticipation.

## Taxe sur le retard d'entrée d'un générique

L'article L. 138-10-1, créé par la loi de financement de la sécurité sociale pour 2026, institue une taxe lorsque le maintien artificiel de l'exclusivité d'une spécialité retarde de manière injustifiée l'entrée effective d'un générique plus d'un an après l'expiration du brevet ou du certificat complémentaire de protection.

Le taux est de 3 % du chiffre d'affaires français de la spécialité concernée et peut être porté à 5 % en cas de récidive dans les cinq ans. Le produit est affecté à la CNAM.

Cette taxe était absente du brouillon. Elle est ajoutée à l'inventaire de recherche, mais reste bloquée : elle est postérieure à l'année 2024 couverte par la NTL et aucune recette autonome n'est disponible dans les sources archivées.

## Promotion des dispositifs médicaux

Le PLFSS 2026 documente également une contribution de 46 M€ en 2025 et 48 M€ en 2026 au titre des dépenses de promotion des dispositifs médicaux et prestations associées.

La contribution, créée en 2003, est fixée à 15 %. Son assiette bénéficie notamment d'un abattement forfaitaire de 50 000 €, d'un abattement de 75 % des frais de congrès et d'une exonération sous le seuil de 11 M€ de chiffre d'affaires, sous réserve des règles de groupe.

Cette imposition n'avait pas de ligne autonome dans le brouillon. Elle demeure bloquée car la ligne NTL 73 ne nomme pas les dispositifs médicaux. Elle est également maintenue distincte de la contribution de sauvegarde sur les dispositifs médicaux fondée sur le montant Z.

## Calendrier de versement

Les mécanismes de versement ont été actualisés pour 2026 :

- ventes en gros : acompte de 80 % le 1er juin, puis régularisation le 1er octobre de l'année suivante ;
- promotion des médicaments et des dispositifs médicaux : acompte de 75 % le 1er juin, puis régularisation le 1er octobre ;
- contributions de l'article L. 245-6 : acompte de 95 % le 1er juin, puis régularisation le 1er octobre.

Ces modalités sont des règles de recouvrement ; elles ne créent pas de prélèvements supplémentaires.

## Garde-fous appliqués

1. Une enveloppe statistique de famille n'est pas distribuée entre ses composantes sans source.
2. Une ligne budgétaire unique n'est pas ventilée entre trois créances nouvellement nommées.
3. Un ancien nom de mécanisme n'est pas publié comme droit positif.
4. Les règles applicables en 2027 ne sont pas anticipées en 2026.
5. Une imposition absente du brouillon est signalée explicitement comme ajout d'inventaire.
6. Une base juridique active ne suffit pas à résoudre seule le classement SEC.
7. Un montant du brouillon sans année ne devient pas une recette canonique.
8. Les données servies par l'application restent inchangées.
