# Audit des prélèvements obligatoires 2026 — lot fiscalité comportementale

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/fiscalite-comportementale-2026-09-02`**  
**Données de production modifiées : non**

Ce troisième lot prolonge le lot TVA et accises en traitant quatre prélèvements voisins dont deux étaient absents de l'inventaire historique :

- la contribution sur les boissons contenant des sucres ajoutés ;
- la cotisation sur les boissons alcooliques de plus de 18 % vol. ;
- la taxe dite « prémix » ;
- le droit de licence sur la rémunération des débitants de tabac.

La fiche structurée correspondante est publiée dans [`data/audit/fiscalite-comportementale-2026-09-02.json`](../data/audit/fiscalite-comportementale-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Situation dans le brouillon | Base juridique au 1er septembre 2026 | Prévision 2025 | Prévision 2026 | Décision |
|---|---|---|---:|---:|---|
| Contribution sur les boissons contenant des sucres ajoutés | aucune ligne autonome retrouvée | CGI, article 1613 ter | 817 M€ | 967 M€ | ajouter à l'inventaire |
| Cotisation sur les boissons alcooliques de plus de 18 % vol. | ligne 23 | CSS, articles L. 245-7 à L. 245-12 | 732 M€ | 734 M€ | conserver et renommer |
| Taxe dite « prémix » | ligne 197 | CGI, article 1613 bis | 0 M€ | 0 M€ | conserver et actualiser le périmètre |
| Droit de licence sur la rémunération des débitants de tabac | aucune ligne autonome retrouvée | CGI, article 568 et annexe IV, article 56 AJ | 340 M€ | 330 M€ | ajouter à l'inventaire |

Les quatre fiches sont prêtes à relire. Les montants du PLFSS restent des prévisions ; ils ne sont pas présentés comme des recettes observées.

## Deux lacunes d'inventaire confirmées

Le rapprochement du brouillon avec le tableau 31 de l'annexe 3 du PLFSS 2026 révèle deux prélèvements disposant à la fois d'une base juridique active et d'une prévision officielle, mais sans ligne autonome retrouvée parmi les 371 entrées :

1. la contribution sur les boissons contenant des sucres ajoutés ;
2. le droit de licence sur la rémunération des débitants de tabac.

Leur absence du brouillon ne constitue donc pas une décision d'exclusion. Le lot les enregistre comme **ajouts d'inventaire**, sans les injecter dans les fichiers de production avant revue.

## Contribution sur les boissons contenant des sucres ajoutés

L'article 1613 ter du CGI est en vigueur au 1er septembre 2026. Il porte sur certaines boissons et préparations relevant des codes NC 2009 et 2202, contenant des sucres ajoutés, conditionnées pour la consommation humaine et non alcooliques.

Les tarifs applicables dans la version de l'article entrée en vigueur le 1er juillet 2026 sont :

| Quantité de sucre ajouté | Tarif |
|---|---:|
| moins de 5 kg par hectolitre | 4,07 €/hl |
| de 5 à 8 kg par hectolitre | 21,38 €/hl |
| plus de 8 kg par hectolitre | 35,63 €/hl |

La contribution a été créée par l'article 26 de la loi de finances pour 2012. Son produit est affecté à la branche maladie des non-salariés agricoles.

L'article affiche une abrogation au 1er janvier 2027 dans le cadre de la recodification programmée. Cette échéance future ne change pas son statut actif au 1er septembre 2026 ; la fiche devra être remappée vers le CIBS lors d'un lot ultérieur.

## Cotisation sur les boissons alcooliques de plus de 18 % vol.

La ligne 23 du brouillon utilisait le libellé « Cotisation spéciale sur les boissons alcooliques » et une recette de 700 M€ sans année. La fiche canonique reprend le seuil légal courant et écarte le montant non daté.

La cotisation a été créée en 1983, initialement pour les boissons de plus de 25 % vol. Le seuil actuel est de 18 % vol. Depuis le 1er janvier 2024, ses règles de fait générateur, d'exigibilité, de déclaration, de paiement, de contrôle et de recouvrement suivent celles de l'accise sur les alcools.

Les tarifs 2026 publiés par la douane sont :

| Catégorie | Tarif 2026 |
|---|---:|
| alcools de plus de 18 % vol. | 620,47 €/hl d'alcool pur |
| produits intermédiaires et bières de plus de 18 % vol. | 52,39 €/hl |
| certains produits intermédiaires de la vigne, taux réduit à 40 % | 20,97 €/hl |

Cette cotisation reste une unité juridique distincte de l'accise sur les alcools, même si les mécanismes de perception sont alignés.

## Taxe dite « prémix »

La ligne 197 est conservée. Sa recette historique de 2,3 M€ n'avait pas d'année et n'est pas reprise.

Le PLFSS prévoit explicitement une recette nulle en 2025 et en 2026. Ces zéros sont conservés comme valeurs documentées, mais ne signifient ni disparition ni abrogation de la taxe : l'article 1613 bis du CGI est toujours en vigueur.

Le tarif est fixé à 3 € par décilitre d'alcool pur pour les vins et autres boissons fermentées concernés, et à 11 € par décilitre d'alcool pur pour les autres produits.

Le périmètre doit également être daté. Depuis le 1er septembre 2026, l'arrêté du 25 juin 2026 applique la taxe aux boissons répondant aux conditions légales et comportant une adjonction de caféine, guaranine, taurine ou ginseng.

## Droit de licence des débitants de tabac

L'article 568 du CGI soumet les débitants de tabac à un droit de licence fondé sur leur remise brute. Il prévoit un taux fixé par arrêté entre 15 % et 30 % de cette remise. L'article 56 AJ de l'annexe IV traduit ce mécanisme, pour la France métropolitaine depuis le 1er janvier 2026, par un taux opérationnel de 1,78 % du montant des livraisons de tabacs manufacturés.

Ces deux pourcentages ne portent pas sur la même assiette et ne doivent pas être comparés directement.

Le droit est liquidé et acquitté par les fournisseurs agréés pour le compte des débitants. L'annexe 3 du PLFSS l'identifie séparément de l'accise sur les tabacs et prévoit 330 M€ en 2026.

L'année de création n'est pas établie dans ce lot et reste `null`.

## Traitement des lignes statistiques

La National tax list fournit pour 2024 :

- 4 749 M€ pour la ligne « Taxes sur les boissons » ;
- 13 606 M€ pour la ligne « Taxes sur les tabacs ».

Ces lignes couvrent plusieurs unités juridiques. Elles sont conservées comme enveloppes statistiques utiles à la classification, mais aucun de leurs montants n'est attribué à une fiche du lot.

Cela empêche notamment :

- de confondre la contribution sur les boissons sucrées, la cotisation sur les alcools et la taxe prémix avec la totalité des taxes sur les boissons ;
- d'attribuer la totalité des taxes sur les tabacs à l'accise ou au seul droit de licence.

## Nouvelle piste : cotisation RAVGDT

Le portail des douanes décrit, en plus du droit de licence, une cotisation obligatoire au régime d'allocations viagères des gérants de débits de tabac. Son taux est fixé à 0,16 % des livraisons en France métropolitaine depuis le 1er janvier 2026.

Aucune ligne autonome n'a été retrouvée dans le brouillon. Cette cotisation reste enregistrée comme candidate pour un lot ultérieur, car sa base juridique complète, son affectation et son classement comme prélèvement obligatoire doivent encore être établis.

## Valeurs du brouillon écartées

Les valeurs suivantes ne sont pas reprises comme recettes canoniques faute d'année de référence :

- cotisation spéciale sur les boissons alcooliques : 700 M€ ;
- taxe sur les boissons prémix : 2,3 M€.

Elles restent visibles dans le brouillon historique et dans les corrections documentées des fiches.

## Garde-fous appliqués

1. Une prévision officielle égale à zéro n'est pas interprétée comme une abrogation.
2. Une ligne statistique agrégée n'est pas ventilée sans source.
3. Un montant du brouillon sans année ne devient pas une recette canonique.
4. Une imposition absente du brouillon peut être ajoutée à l'inventaire lorsque le droit en vigueur et une source budgétaire officielle la confirment.
5. Une date future de recodification ne modifie pas le statut juridique au jour de l'audit.
6. Une piste repérée mais juridiquement incomplète reste hors des fiches prêtes à publier.
7. Les données servies par l'application restent inchangées.
