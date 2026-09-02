# Audit des prélèvements obligatoires 2026 — taxes sur le transport aérien

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/transport-aerien-2026-09-02`**  
**Données de production modifiées : non**

Ce lot achève le traitement des composantes aériennes laissées en attente par le lot consacré au permis bateau et aux passagers maritimes. Il reprend l’ancienne taxe de l’aviation civile, la taxe de solidarité, la taxe d’aéroport et les anciennes lignes mixtes Corse et outre-mer pour les rapprocher de la structure actuelle du code des impositions sur les biens et services.

La fiche structurée correspondante est publiée dans [`data/audit/transport-aerien-2026-09-02.json`](../data/audit/transport-aerien-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Lignes du brouillon reprises | Base juridique au 2 septembre 2026 | Recette individuellement attribuable | Décision |
|---|---|---|---:|---|
| Taxe sur le transport aérien de passagers | 63, 108, 109, 172, 338 et 339 | CIBS, articles L. 422-13 à L. 422-40 | aucune recette complète ; enveloppe territoriale de 47 M€ en 2024 | publier pour revue |
| Taxe sur le transport aérien de marchandises | parties fret et courrier des lignes 109 et 339 | CIBS, articles L. 422-41 à L. 422-48 | aucune recette individuelle isolée | publier pour revue |

Les deux fiches sont prêtes à relire. Les tarifs, les classes d’aéroport, les catégories de destination et les majorations territoriales restent les composantes de ces deux taxes parentes ; ils ne sont pas publiés comme prélèvements autonomes.

## La recodification de 2022 impose deux taxes, pas une série de prédécesseurs

La table de concordance de l’ordonnance du 22 décembre 2021 établit les correspondances suivantes :

| Ancien prélèvement ou composante | Créance actuelle |
|---|---|
| taxe de l’aviation civile sur les passagers | tarif de l’aviation civile de la taxe passagers |
| taxe de solidarité sur les billets d’avion | tarif de solidarité de la taxe passagers |
| taxe d’aéroport sur les passagers | tarif de sûreté et de sécurité de la taxe passagers |
| majoration de la taxe d’aéroport | tarif de péréquation aéroportuaire de la taxe passagers |
| taxe aérienne corse | majoration en Corse de la taxe passagers |
| taxe aérienne outre-mer | majoration en outre-mer de la taxe passagers |
| taxe de l’aviation civile sur le fret et le courrier | tarif de l’aviation civile de la taxe marchandises |
| taxe d’aéroport sur le fret et le courrier | tarif de sûreté et de sécurité de la taxe marchandises |

La taxe de l’aviation civile et la taxe d’aéroport doivent donc être **scindées** entre les assiettes passagers et marchandises. À l’inverse, la taxe de solidarité et les majorations Corse ou outre-mer sont **fusionnées** dans la seule taxe passagers.

Les deux taxes canoniques actuelles ont été créées par l’ordonnance de 2021 et sont applicables depuis le **1er janvier 2022**. Les années historiques des prédécesseurs restent dans leur provenance et ne deviennent pas la date de création de la structure actuelle.

## Taxe sur le transport aérien de passagers

L’article L. 422-20 définit une taxe unique dont le montant est, pour chaque embarquement taxable, la somme de quatre tarifs :

1. tarif de l’aviation civile ;
2. tarif de solidarité ;
3. tarif de sûreté et de sécurité ;
4. tarif de péréquation aéroportuaire.

Le dispositif comprend également le tarif unique de Bâle-Mulhouse et les majorations Paris-Charles de Gaulle, Corse et outre-mer. Ces éléments restent dans une seule fiche.

La taxe est due par l’entreprise de transport aérien public qui exploite l’aéronef. Dans les situations de partage de codes, affrètement, location ou organisation équivalente prévues par le code, le redevable est le transporteur dont le numéro de vol est utilisé aux fins du contrôle de la circulation aérienne.

Le fait générateur principal est l’embarquement d’un passager sur un vol commercial, hors transit direct. En Corse, certains débarquements sont également compris dans le champ.

### Tarif de l’aviation civile

Pour les embarquements réalisés du **1er avril 2026 au 31 mars 2027**, les montants sont :

| Destination finale | Tarif par passager |
|---|---:|
| européenne ou assimilée | 5,21 € |
| intermédiaire ou lointaine | 9,37 € |

Les passagers en correspondance remplissant les conditions du code sont exonérés de ce tarif.

### Tarif de solidarité

Le tarif de solidarité varie selon la destination finale et les conditions du transport :

| Destination | Service normal | Services additionnels | Affaires turbopropulseur | Affaires turboréacteur |
|---|---:|---:|---:|---:|
| européenne ou assimilée | 7,40 € | 30 € | 210 € | 420 € |
| intermédiaire | 15 € | 80 € | 675 € | 1 015 € |
| lointaine | 40 € | 120 € | 1 025 € | 2 100 € |

Depuis le **1er juin 2026**, une réduction de 65 % s’applique aux services aériens énumérés par l’arrêté du 13 mai 2026 lorsqu’ils relèvent d’une obligation de service public et sont exploités dans le cadre d’une délégation de service public. Le lot conserve le pourcentage et la liste réglementaire comme paramètres ; il ne recalcule pas un tarif arrondi autonome.

La taxe de solidarité historique de la ligne `#108` et l’« éco-contribution » de la ligne `#338` ne deviennent donc pas deux fiches actuelles. Elles correspondent à des présentations historiques du tarif de solidarité de la taxe passagers.

### Sûreté, sécurité et péréquation

Le tarif de sûreté et de sécurité est fixé par aérodrome ou groupement d’aérodromes. Les bornes publiées en 2026 sont :

| Classe | Fourchette par passager |
|---:|---:|
| 1 | 3,30 € à 11,80 € |
| 2 | 2,16 € à 10,25 € |
| 3 | 0,73 € à 20 € |
| 4 | 0 € |

Pour un passager en correspondance, la minoration réglementaire est de **72 %**.

Depuis le **1er juillet 2026**, le tarif de péréquation aéroportuaire est fixé à **1,35 €**. Il ne s’applique pas aux passagers en correspondance. Le tarif unique de l’aéroport de Bâle-Mulhouse est fixé à **1,42 €** depuis la même date.

L’ancienne taxe d’aéroport de la ligne `#339` doit être scindée : sa partie passagers correspond à ces tarifs, tandis que sa partie fret et courrier alimente la taxe sur les marchandises.

### Majoration Paris-Charles de Gaulle

L’article L. 422-26-1 prévoit depuis le **1er avril 2026** une majoration applicable à certains embarquements et débarquements à Paris-Charles de Gaulle, dans la limite légale de 1,40 €.

L’arrêté du 16 janvier 2026 fixe toutefois son tarif à **0 € du 1er avril 2026 au 31 mars 2027** et dispense les transporteurs des obligations déclaratives correspondantes pendant cette période.

Le zéro est conservé comme une valeur réglementaire explicite. Il ne signifie ni suppression ni abrogation de la composante.

### Majoration en Corse

La majoration corse s’applique à chaque passager embarqué ou débarqué sur le territoire corse. Son montant est fixé localement dans la limite de **4,57 € par passager** et son produit est affecté à la collectivité de Corse.

La composante aérienne de la ligne `#172` est intégrée à ce profil. La composante maritime historique a déjà été traitée dans le lot précédent.

### Majoration en outre-mer

La majoration outre-mer s’applique à chaque passager embarqué au départ de la Guadeloupe, de la Guyane, de la Martinique, de Mayotte ou de La Réunion. Son montant est fixé par la collectivité compétente dans la limite de **4,57 € par passager**.

Le produit est réparti :

- à hauteur de 70 % au profit de la région ou de la collectivité concernée ;
- à hauteur de 30 % au profit des communes littorales classées stations de tourisme.

La composante aérienne de la ligne `#63` est intégrée à ce profil. Sa composante maritime historique a déjà été exclue de l’inventaire courant.

Les taux locaux effectifs de la Corse et des cinq territoires ultramarins ne sont pas consolidés dans ce lot. Le plafond légal ne leur est pas substitué.

## Taxe sur le transport aérien de marchandises

La taxe marchandises regroupe, depuis 2022, les anciennes assiettes de fret et de courrier de la taxe de l’aviation civile et de la taxe d’aéroport.

Elle est due lors de l’embarquement de fret ou de courrier sur un vol commercial, hors transit direct. Le redevable est le transporteur aérien public déterminé selon les mêmes règles opérationnelles que pour les passagers.

Son montant comporte deux termes :

| Composante | Tarif 2026 |
|---|---:|
| aviation civile, du 1er avril 2026 au 31 mars 2027 | 1,55 € par tonne |
| sûreté et sécurité, aérodromes des classes 1 à 3 | 1 € par tonne |
| sûreté et sécurité, classe 4 | 0 € |

La déclaration et le paiement sont effectués conjointement avec la taxe passagers. Le fret et le courrier ne deviennent pas deux fiches, et les deux tarifs ne deviennent pas deux taxes autonomes.

## Traitement des recettes statistiques

### Ligne NTL 70 : enveloppe générale non allouée

La ligne 70 de la National tax list, classée `D214H C10` et intitulée « Taxes sur les transports », porte **1 859 M€ en 2024**.

Cette ligne est plus large que les seules taxes aériennes de passagers et de marchandises. Elle peut couvrir d’autres prélèvements liés aux transports et ne fournit aucune ventilation entre passagers, fret, sûreté, solidarité ou nuisances sonores.

Les 1 859 M€ restent donc une enveloppe statistique non attribuée.

### Ligne NTL 105 : enveloppe des majorations territoriales

La ligne 105, classée `D29B C05`, conserve l’ancien libellé « Taxe due par les entreprises de transport public aérien et maritime — Corse, DOM » et porte **47 M€ en 2024**.

Le droit maritime outre-mer avait cessé en 2011 et la composante maritime corse n’était plus applicable depuis 2022. Le produit 2024 est donc rapproché, par inférence documentée, des seules composantes aériennes qui subsistent : majorations Corse et outre-mer de la taxe passagers.

Cette valeur reste une **enveloppe collective de composantes** :

- elle ne représente pas la totalité de la taxe passagers ;
- elle n’est pas répartie entre la Corse et les territoires ultramarins ;
- elle ne permet pas de déduire les taux locaux appliqués.

## Montants du brouillon non repris

Le brouillon contenait notamment :

| Ligne | Montant |
|---:|---:|
| 63 — taxe mixte outre-mer | 9,4 M€ |
| 108 — taxe de solidarité | 161,99 M€ |
| 109 — taxe de l’aviation civile | 401 M€ |
| 172 — taxe mixte corse | 47,4 M€ |

Ces valeurs ne portent pas d’année explicite. Elles ne sont pas promues comme observations, additionnées ni réparties entre les deux taxes actuelles.

## Lignes voisines laissées ouvertes

Trois ensembles restent à traiter séparément :

- la taxe sur les nuisances sonores aériennes, qui demeure une taxe autonome fondée sur le décollage et affectée à l’aide aux riverains ;
- la ligne `#340`, « taxe d’embarquement sur les passagers dans les territoires d’outre-mer », dont le territoire, le texte et le bénéficiaire exacts doivent être identifiés ;
- la ligne `#341`, taxe ou redevance d’atterrissage, qui relève a priori de la tarification de l’usage aéroportuaire et nécessite un contrôle spécifique de contrepartie et de classement.

Aucune de ces lignes n’est absorbée dans les deux fiches du présent lot.

## Garde-fous appliqués

1. Les anciennes TAC et taxe d’aéroport sont scindées entre passagers et marchandises selon la concordance officielle.
2. Le tarif de solidarité n’est pas maintenu comme taxe autonome.
3. Les majorations Corse, outre-mer et Paris-CDG restent des composantes de la taxe passagers.
4. Un tarif nul n’est pas interprété comme une abrogation.
5. Une ligne statistique générale n’est pas ventilée sans source.
6. Une enveloppe de composantes territoriales n’est pas présentée comme le produit total de la taxe.
7. Les montants non datés du brouillon ne sont pas promus.
8. Les tarifs par passager ou par tonne ne sont pas des recettes.
9. La TNSA et les redevances aéroportuaires voisines ne sont pas absorbées.
10. Les données servies par l’application restent inchangées.
