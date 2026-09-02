# Audit des prélèvements obligatoires 2026 — permis bateau et passagers maritimes

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/permis-bateau-passagers-maritimes-2026-09-02`**  
**Branche parente : `audit/navigation-maritime-2026-09-02` / PR #53**  
**Données de production modifiées : non**

Ce lot poursuit la reprise des impositions de navigation après la TAEMUP. Il traite la taxe sur le permis de conduire des bateaux de plaisance à moteur, la taxe sur les passagers à destination d’espaces naturels protégés et les anciennes lignes mixtes de transport aérien et maritime en Corse et dans les départements d’outre-mer.

La fiche structurée correspondante est publiée dans [`data/audit/permis-bateau-passagers-maritimes-2026-09-02.json`](../data/audit/permis-bateau-passagers-maritimes-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche ou décision | Origine | Situation au 2 septembre 2026 | Donnée disponible | Décision |
|---|---|---|---:|---|
| Taxe sur le transport maritime de passagers à destination d’espaces naturels protégés | ligne 64 | active, CIBS L. 423-47 à L. 423-56 | rendement prévisionnel de 4,5 M€ en 2026 | conserver comme candidate bloquée faute de classement SEC |
| Taxe sur le permis de conduire des bateaux de plaisance à moteur | absente comme ligne maritime identifiable | active, CIBS L. 423-38 à L. 423-46 | tarifs de 78 € et 38 € | documenter comme charge à contrepartie directe hors du périmètre retenu |
| Ancienne composante maritime outre-mer | partie de la ligne 63 | supprimée du champ après 2011 | montant de 9,4 M€ non daté et non ventilable | conserver comme historique |
| Ancienne composante maritime corse | partie de la ligne 172 | non applicable depuis le 1er janvier 2022 | montant de 47,4 M€ non daté et mixte | conserver comme historique |
| Majorations aériennes en Corse et en outre-mer | autres parties des lignes 63 et 172 | actives dans la taxe sur le transport aérien de passagers | ligne NTL mixte de 47 M€ en 2024 | réserver à un lot aérien |

Aucune nouvelle fiche de prélèvement obligatoire n’est publiée comme définitivement prête dans ce lot. La taxe destinée aux espaces protégés satisfait les tests juridique, obligatoire et institutionnel mais reste sans correspondance statistique individuelle. La taxe sur le permis bateau est exclue selon le test de contrepartie directe de la méthodologie du projet, sous réserve d’une future source de comptes nationaux qui imposerait un autre traitement.

## Taxe sur les passagers à destination d’espaces naturels protégés

Les articles L. 423-47 à L. 423-56 du CIBS soumettent à la taxe l’embarquement d’un passager à bord d’un navire exploité à titre professionnel à destination d’un espace naturel protégé ou d’un port le desservant. Le fait générateur intervient au départ programmé du navire.

La taxe est due par la personne qui arme le navire. Elle est ajoutée au prix demandé au passager.

### Calcul en 2026

Le montant est égal à **6,542 %** du prix hors TVA du transport entre le lieu d’embarquement et l’espace protégé. Il est plafonné à **1,96 € par passager en 2026**.

Pour les embarquements taxables d’un même passager intervenant le même jour après le premier, le montant est réduit de 50 %.

L’embarquement destiné à rejoindre la résidence principale ou le lieu de travail du passager est exonéré.

Ces règles constituent les paramètres d’une même taxe. Le pourcentage et le plafond unitaire ne sont pas des recettes.

### Affectation collective

L’article L. 321-12 du code de l’environnement affecte le produit aux personnes publiques gestionnaires des espaces protégés désignées par le code. La fraction non attribuée à l’un de ces gestionnaires revient aux communes sur le territoire desquelles se situe l’espace.

Le produit est ainsi destiné à la préservation collective des espaces naturels. Il ne rémunère pas une prestation individualisée fournie au passager par le bénéficiaire de la taxe.

### Création

La taxe a été créée par l’article 48 de la loi du 2 février 1995 relative au renforcement de la protection de l’environnement, sous l’ancien article 285 quater du code des douanes. Elle est aujourd’hui recodifiée dans le CIBS.

### Prévision 2026, mais pas de recette observée

L’article 135 de la loi de finances pour 2026 mentionne un rendement prévisionnel de **4,5 M€**, sans plafond d’affectation.

Cette valeur est enregistrée comme prévision budgétaire. Elle ne devient pas une recette observée et ne remplace pas une éventuelle donnée des comptes nationaux.

Le montant de **2,6 M€** figurant dans le brouillon ne porte pas d’année et n’est pas repris.

### Pourquoi la fiche reste bloquée

Aucune ligne directement nommée n’a été retrouvée dans la National tax list 2026. Le droit en vigueur et l’affectation publique sont établis, mais la règle de publication du projet exige également une correspondance officielle avec la comptabilité nationale.

La fiche conserve donc :

```text
po_status: unresolved
membership_status: blocked
publication_status: blocked
```

La recherche suivante devra identifier une table de passage Insee ou Eurostat, un compte d’administration publique ou une autre source primaire donnant le code SEC de cette taxe.

## Taxe sur le permis de conduire des bateaux de plaisance à moteur

Les articles L. 423-38 à L. 423-46 du CIBS prévoient une taxe portant sur le titre de conduite des bateaux de plaisance à moteur et sur certaines candidatures à l’examen.

Les faits générateurs sont :

- la délivrance d’un titre taxable ;
- l’inscription à une candidature taxable.

Le redevable est respectivement le titulaire du titre ou le candidat.

### Tarifs 2026

| Fait générateur | Montant |
|---|---:|
| délivrance du titre | 78 € |
| candidature taxable à l’examen | 38 € |

En Guyane, les montants sont réduits de moitié pour les titres délivrés et les examens organisés sur le territoire.

Le paiement intervient au stade de la demande correspondante, au moyen du procédé applicable au timbre dématérialisé.

### Traitement méthodologique

Le paiement est directement lié à une démarche individualisée : délivrance d’un titre ou inscription à un examen. La méthodologie du projet l’écarte donc du référentiel des prélèvements obligatoires au titre de la contrepartie directe.

Le dossier conserve néanmoins deux précautions :

1. le droit français emploie la dénomination « taxe » ;
2. aucune ligne de comptabilité nationale nommant cette taxe n’a été retrouvée.

Le statut retenu est donc une exclusion méthodologique révisable si une source statistique officielle classe explicitement le flux comme impôt :

```text
po_status: excluded
publication_status: non_po_charge
statistical_override_possible: true
```

Les montants de 78 € et 38 € restent des tarifs unitaires, pas des recettes.

## La ligne générique « taxe sur les permis de conduire » n’est pas réaffectée

La ligne 170 du brouillon porte le libellé général « taxe sur les permis de conduire ». Elle ne mentionne ni la navigation, ni les bateaux de plaisance, ni les articles L. 423-38 à L. 423-46.

Elle n’est donc pas utilisée comme preuve que la taxe maritime était déjà présente dans le brouillon. Elle reste réservée à un lot consacré aux permis routiers et aux droits de délivrance ou de remplacement correspondants.

## Deux lignes mixtes doivent être scindées selon le mode de transport

Les lignes 63 et 172 réunissent chacune une composante aérienne et une composante maritime. Les deux modes n’ont plus le même statut juridique en 2026.

### Outre-mer — ligne 63

L’ancien article 285 ter du code des douanes prévoyait une taxe sur les transports publics **aériens et maritimes** de passagers en Guadeloupe, Guyane, Martinique et à La Réunion.

La version incluant le transport maritime a cessé de s’appliquer à la fin de 2011. Le dispositif a ensuite subsisté pour le seul transport aérien, avant d’être recodifié dans la taxe sur le transport aérien de passagers.

La ligne 63 est donc décomposée en :

- une composante maritime historique, exclue de l’inventaire actif ;
- une majoration aérienne actuelle, réservée au prochain lot aérien.

Les **9,4 M€** du brouillon ne portent pas d’année et ne peuvent être ventilés entre modes ou territoires.

### Corse — ligne 172

L’ancienne taxe corse portait sur les passagers embarquant ou débarquant par voie aérienne ou maritime. Le CIBS conserve les articles décrivant la composante maritime, mais chacun précise que la taxe **n’est plus applicable depuis le 1er janvier 2022**.

La majoration aérienne en Corse demeure, quant à elle, dans la taxe sur le transport aérien de passagers.

La ligne 172 est donc également scindée en :

- une composante maritime historique ;
- une majoration aérienne actuelle à traiter dans le lot aérien.

Les **47,4 M€** du brouillon sont non datés et correspondent à un libellé mixte : ils ne sont attribués à aucune composante.

## La ligne NTL 105 reste réservée au lot aérien

La National tax list 2026 contient une ligne 105, classée `D29B C05`, toujours intitulée :

> Taxe due par les entreprises de transport public aérien et maritime — Corse, DOM

Elle porte **47 M€ en 2024**.

Ce libellé statistique n’a pas suivi les évolutions juridiques :

- le mode maritime a disparu du dispositif outre-mer après 2011 ;
- la taxe maritime corse n’est plus applicable depuis 2022 ;
- les majorations aériennes territoriales restent actives.

Le montant 2024 n’est donc attribué à aucune fiche maritime. Il est conservé comme enveloppe statistique à résoudre lors de l’audit de la taxe sur le transport aérien de passagers.

## Garde-fous appliqués

1. Une ligne combinant transport aérien et maritime est scindée lorsque les deux modes ont des statuts juridiques différents.
2. Une composante aérienne encore active n’est pas supprimée avec une composante maritime historique.
3. Un libellé statistique devenu anachronique n’est pas attribué sans analyse de son périmètre réel.
4. Une prévision budgétaire reste distincte d’une recette observée.
5. Un tarif par titre, candidature ou passager n’est pas une recette.
6. Une taxe à contrepartie individualisée est écartée selon la méthodologie, avec possibilité de révision en cas de classement SEC explicite contraire.
7. Une ligne générique du brouillon n’est pas réaffectée sans preuve.
8. Les montants non datés du brouillon ne sont ni additionnés ni promus.
9. Les données servies par l’application restent inchangées.

## Prochain lot

Le prolongement direct est la taxe sur le transport aérien de passagers, avec :

- la majoration en Corse ;
- la majoration en outre-mer ;
- la résolution de la ligne NTL 105 de 47 M€ en 2024 ;
- le rapprochement des anciens libellés territoriaux avec la structure actuelle du CIBS.
