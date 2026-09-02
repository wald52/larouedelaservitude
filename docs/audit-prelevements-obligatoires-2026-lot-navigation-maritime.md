# Audit des prélèvements obligatoires 2026 — lot navigation maritime

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/navigation-maritime-2026-09-02`**  
**Branche parente : `audit/hydroelectricite-chasse-2026-09-02` / PR #52**  
**Données de production modifiées : non**

Ce lot poursuit la reprise documentaire avec les trois anciennes lignes relatives au droit annuel de francisation et de navigation et au droit de passeport. Depuis le 1er janvier 2022, ces anciens prélèvements sont les fractions pavillon français et pavillon étranger d’une seule créance : la taxe annuelle sur les engins maritimes à usage personnel.

La fiche structurée correspondante est publiée dans [`data/audit/navigation-maritime-2026-09-02.json`](../data/audit/navigation-maritime-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Lignes du brouillon | Base juridique au 2 septembre 2026 | Recette observée | Décision |
|---|---:|---|---:|---|
| Taxe annuelle sur les engins maritimes à usage personnel — TAEMUP | 51, 52 et 53 | CIBS, articles L. 423-4 à L. 423-37 | 44 M€ en 2024 | fusionner les trois anciens libellés dans une fiche unique |

La fiche est prête à relire. Les anciennes lignes ne doivent plus être publiées séparément.

## Le DAFN et le passeport sont devenus deux fractions d’une même taxe

La table de concordance de l’article 4 de l’ordonnance n° 2021-1843 établit la correspondance suivante :

| Ancienne créance | Correspondance actuelle |
|---|---|
| Droit annuel de francisation et de navigation, ancien article 223 du code des douanes | fraction de la TAEMUP perçue sur les engins battant pavillon français |
| Droit de passeport, ancien article 238 du code des douanes | fraction de la TAEMUP perçue sur les engins ne battant pas pavillon français |

Cette table interdit de conserver deux fiches fiscales autonomes après la recodification. Le pavillon détermine le rattachement territorial, la formalité et certaines affectations du produit ; il ne crée pas une deuxième taxe.

La TAEMUP actuelle a été créée par l’ordonnance du 22 décembre 2021 et s’applique depuis le **1er janvier 2022**. Les années 1967 et 1994 du brouillon sont conservées comme informations possibles sur les prédécesseurs, mais ne deviennent pas l’année de création de la fiche canonique actuelle.

## Le passeport demeure une formalité, pas un prélèvement

Pour un engin battant pavillon français, la formalité fiscale repose sur son enregistrement.

Pour un engin ne battant pas pavillon français, elle repose sur l’obtention du passeport prévu par le code des transports lorsque le propriétaire ou la personne disposant de l’engin relève du territoire de taxation.

Le mot « passeport » subsiste donc dans le droit positif, mais comme formalité de rattachement d’un engin sous pavillon étranger. Il ne désigne plus une taxe autonome.

Le propriétaire est redevable. La personne ayant la disposition d’un engin sous pavillon étranger est également redevable dans les conditions du code.

## La Corse est un profil territorial de la même TAEMUP

La ligne 51 réunissait le droit de francisation et de navigation et le droit de passeport « en Corse ». Elle ne correspond pas à une troisième créance.

L’article L. 423-21 prévoit une minoration comprise entre 10 % et 50 % lorsque :

1. le port d’enregistrement est situé en Corse ou le passeport a été délivré en Corse ;
2. l’engin a stationné au moins une fois dans un port corse au cours de l’année précédant le fait générateur.

Le pourcentage est fixé par la collectivité de Corse. Pour l’année de taxation **2026**, le taux opérationnel publié par le ministère chargé de la mer est de **10 %**.

Cette minoration et l’affectation du produit à la collectivité de Corse restent des caractéristiques territoriales de la TAEMUP. Elles ne donnent pas lieu à une fiche indépendante.

## Champ d’application en 2026

Jusqu’au 31 décembre 2026, la taxe concerne notamment :

- les navires d’une longueur de coque supérieure ou égale à 7 mètres ;
- les navires de moins de 7 mètres dotés d’une puissance administrative supérieure ou égale à 22 CV ;
- les véhicules nautiques à moteur de moins de 4 mètres, propulsés par une turbine entraînée par un moteur à combustion interne et d’une puissance propulsive nette maximale d’au moins 90 kW ;
- les navires de grande plaisance d’au moins 30 mètres et 750 kW, soumis à un barème forfaitaire dérogatoire.

La taxe porte sur les engins armés pour une navigation maritime à usage personnel et rattachés au territoire de taxation. Le fait générateur intervient, en principe, le premier jour de l’année où les conditions sont réunies. Lors de la première formalité en cours d’année, une diminution d’un douzième par mois révolu s’applique.

## Barème applicable en 2026

### Terme lié à la longueur de coque

| Longueur | Tarif |
|---|---:|
| moins de 7 m | 0 € |
| de 7 m à moins de 8 m | 77 € |
| de 8 m à moins de 9 m | 105 € |
| de 9 m à moins de 10 m | 178 € |
| de 10 m à moins de 11 m | 240 € |
| de 11 m à moins de 12 m | 274 € |
| de 12 m à moins de 15 m | 458 € |
| 15 m ou plus | 886 € |

### Terme lié à la puissance administrative

| Puissance administrative | Tarif unitaire |
|---|---:|
| jusqu’à 5 CV | 0 €/CV |
| de 6 à 8 CV | 14 €/CV |
| de 9 à 10 CV | 16 €/CV |
| de 11 à 20 CV | 35 €/CV |
| de 21 à 25 CV | 40 €/CV |
| de 26 à 50 CV | 44 €/CV |
| de 51 à 99 CV | 50 €/CV |
| à partir de 100 CV | 64 €/CV |

Pour un navire ordinaire, le montant est la somme du terme coque et du terme moteur. Le tarif unitaire du moteur est multiplié par la puissance administrative, diminuée de 5 CV lorsque la puissance reste inférieure à 100 CV, sous les règles particulières relatives aux moteurs amovibles.

### Véhicules nautiques à moteur

| Puissance propulsive | Tarif unitaire |
|---|---:|
| de 90 à 159 kW | 3 €/kW |
| 160 kW ou plus | 4 €/kW |

Le tarif s’applique dès le premier kilowatt lorsque le seuil de taxation est atteint.

### Grande plaisance

Les yachts d’au moins 30 mètres et 750 kW relèvent d’un barème forfaitaire croisant la longueur et la puissance. Les montants vont de **30 000 € à 200 000 €**. Les minorations de vétusté et la minoration corse ne s’appliquent pas à ce barème.

Ces différents termes, classes et catégories sont les modalités de calcul d’une seule taxe. Ils ne deviennent pas des prélèvements autonomes.

## Minorations, majorations et dispense de paiement en 2026

Pour les engins construits avant 2008, la minoration de vétusté est de :

| Date de construction | Minoration |
|---|---:|
| avant 1993 | 80 % |
| de 1993 à 1997 | 55 % |
| de 1998 à 2007 | 33 % |

Pour un navire autre qu’un véhicule nautique à moteur dont la puissance administrative dépasse 100 CV, cette minoration ne porte que sur le terme lié à la coque.

Pour certains pavillons d’États ou territoires non coopératifs ou dépourvus de convention d’échange de renseignements, le tarif est multiplié par trois lorsque la coque mesure moins de 15 mètres et par cinq à partir de 15 mètres.

La taxe n’est pas acquittée lorsque son montant calculé pour l’engin est inférieur à **76 €**. Ce seuil de paiement n’est ni une exonération générale ni une recette.

## Affectation du produit

L’article L. 423-37 organise plusieurs profils d’affectation :

- pour les engins sous pavillon français hors tarif corse, le produit est réparti selon les textes entre le Conservatoire de l’espace littoral et des rivages lacustres, les éco-organismes de la filière des navires de plaisance et la Société nationale de sauvetage en mer ;
- pour les engins relevant du tarif corse, le produit est affecté à la collectivité de Corse ;
- pour certains engins de grande plaisance sous pavillon étranger, le produit est affecté à la Société nationale de sauvetage en mer.

Ces affectations multiples ne justifient pas une scission de la créance. Aucune ventilation de recette par bénéficiaire n’est fabriquée dans le lot.

## Recette 2024 et retard de libellé statistique

La National tax list 2026 contient une ligne 193 classée `D59D C02`, encore intitulée « Droit annuel de francisation et de navigation ». Elle porte **44 M€ en 2024**.

Ce libellé est historiquement en retard sur la dénomination juridique applicable depuis 2022. Le rapprochement reste suffisamment solide parce que la table de concordance officielle rattache précisément le DAFN à la fraction pavillon français de la TAEMUP et le droit de passeport à sa fraction pavillon étranger.

Les 44 M€ sont donc attribués à la fiche canonique, mais ils ne sont pas ventilés entre :

- pavillon français et pavillon étranger ;
- Corse et reste du territoire ;
- coque, moteur, véhicules nautiques ou grande plaisance ;
- différents bénéficiaires du produit.

## Montants historiques du brouillon écartés

Le brouillon contenait :

| Ligne | Montant |
|---:|---:|
| 51 — Corse et passeport | 3 M€ |
| 52 — DAFN | 39,2 M€ |
| 53 — passeport | 2,2 M€ |

Ces montants ne portent pas d’année et leur périmètre peut se chevaucher. Ils ne sont ni additionnés ni substitués à la valeur NTL 2024.

## Réforme applicable seulement en 2027

L’article 66 de la loi de finances pour 2026 modifie le champ et le barème à compter du **1er janvier 2027**. Il prévoit notamment :

- pour les navires de moins de 7 mètres, un seuil moteur exprimé à 120 kW à la place des 22 CV administratifs ;
- un nouveau barème coque allant de 80 € à 1 200 € ;
- un barème moteur progressif exprimé en kilowatts, avec des tarifs marginaux de 3 € à 6 € ;
- de nouvelles règles de minoration de vétusté, notamment pour les véhicules nautiques à moteur.

Ces règles futures sont documentées afin de préparer la maintenance du référentiel. Elles ne sont pas appliquées au calcul ni à la description de l’année 2026.

## Prochaines lignes cohérentes

Trois ensembles voisins restent à traiter séparément :

- la taxe sur le permis de conduire des bateaux de plaisance à moteur, qui comprend des fractions relatives au titre et à l’examen ;
- la taxe sur le transport maritime de passagers vers des espaces naturels protégés ;
- la taxe sur le transport maritime de passagers dans certains territoires côtiers, notamment la Corse et l’outre-mer.

Leur fait générateur, leur redevable et leur affectation diffèrent de ceux de la TAEMUP.

## Garde-fous appliqués

1. Deux anciens prélèvements devenus des fractions d’une taxe unique ne restent pas deux fiches.
2. Le passeport sous pavillon étranger reste une formalité, pas un prélèvement autonome.
3. Une minoration et une affectation propres à la Corse ne créent pas une taxe territoriale supplémentaire.
4. Les termes coque, moteur, VNM et grande plaisance restent des modalités tarifaires.
5. Un libellé statistique historique n’est rapproché du droit courant qu’avec une table de concordance officielle.
6. Les montants non datés du brouillon ne sont pas additionnés.
7. Une recette nationale n’est pas ventilée entre profils ou bénéficiaires sans source.
8. Les règles entrant en vigueur en 2027 ne sont pas appliquées à 2026.
9. Les données servies par l’application restent inchangées.
