# Audit des prélèvements obligatoires 2026 — complément transport aérien

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/transport-aerien-2026-09-02`**  
**Données de production modifiées : non**

Ce complément achève les trois lignes laissées ouvertes lors de la rédaction du lot principal consacré aux taxes sur le transport aérien :

- la taxe sur les nuisances sonores aériennes de la ligne 186 ;
- la taxe d’embarquement sur les passagers dans les territoires d’outre-mer de la ligne 340 ;
- la taxe ou redevance d’atterrissage de la ligne 341.

Les décisions structurées sont publiées dans [`data/audit/transport-aerien-complement-2026-09-02.json`](../data/audit/transport-aerien-complement-2026-09-02.json). Ce fichier complète, sans dupliquer ses fiches, [`data/audit/transport-aerien-2026-09-02.json`](../data/audit/transport-aerien-2026-09-02.json).

## Résultat

| Ligne | Créance ou charge actuelle | Décision |
|---:|---|---|
| 340 | Majoration outre-mer de la taxe sur le transport aérien de passagers | fusionner dans la fiche passagers existante |
| 186 | Taxe sur les nuisances sonores aériennes | conserver comme candidate active bloquée |
| 341 | Redevance aéroportuaire d’atterrissage | exclure du périmètre des prélèvements obligatoires |

La ligne 340 ne produit aucune nouvelle fiche. La TNSA reste juridiquement active mais ne franchit pas encore le test statistique et institutionnel. La redevance d’atterrissage est une charge active à contrepartie directe.

## La taxe d’embarquement outre-mer est devenue la MOMTAP

Le portail de la direction générale des douanes indique expressément que la **majoration outre-mer de la taxe sur le transport aérien de passagers**, ou MOMTAP, était précédemment dénommée **taxe d’embarquement sur les passagers**, ou TEP.

La ligne 340 est donc rapprochée de la majoration prévue par l’article L. 422-30 du CIBS. Elle ne doit pas rester une taxe autonome à côté de la taxe passagers.

Le profil courant présente les caractéristiques suivantes :

- embarquement sur un vol commercial en Guadeloupe, Guyane, Martinique, à Mayotte ou à La Réunion ;
- billet émis à titre onéreux ;
- redevable : entreprise de transport aérien réalisant l’embarquement ;
- montant fixé par la région ou la collectivité compétente dans la limite de **4,57 € par passager** ;
- modulation possible selon la distance du vol.

Le plafond légal ne remplace pas les taux effectivement votés dans chaque territoire. Leur consolidation reste une recherche ultérieure.

Ce rapprochement clôt le statut `source_needed` de la ligne 340 inscrit dans le lot parent. Il ne modifie pas le traitement de la ligne NTL 105 : les **47 M€ en 2024** restent une enveloppe collective des majorations aériennes de Corse et d’outre-mer, non ventilée entre territoires.

## Correction du champ de la taxe passagers

Le lot parent indiquait uniquement les débarquements taxables en Corse. Depuis le **1er avril 2026**, l’article L. 422-14 soumet également à la taxe certains débarquements de passagers à l’aéroport Paris-Charles de Gaulle, hors transit direct.

La description canonique devient donc :

- embarquements taxables sur les vols commerciaux dans le territoire de taxation ;
- débarquements taxables en Corse et à Paris-Charles de Gaulle depuis le 1er avril 2026.

Cette modification du champ en 2026 n’est pas rétroprojetée dans l’observation territoriale de 2024.

## Taxe sur les nuisances sonores aériennes

La TNSA demeure une taxe autonome. Elle ne doit être absorbée ni par la taxe sur le transport aérien de passagers, ni par la taxe sur les marchandises.

La taxe portant ce nom a été créée par l’article 19 de la loi de finances rectificative pour 2003 et s’applique depuis le **1er janvier 2005**. L’année 1992 du brouillon n’est donc pas retenue comme année de création de la TNSA actuelle.

### Fait générateur, redevable et calcul

Le fait générateur est le décollage d’un aéronef sur un aérodrome entrant dans le champ de la taxe. Le redevable est l’exploitant de l’aéronef ou, à défaut, son propriétaire.

Le calcul combine :

1. le tarif propre à l’aérodrome ;
2. un coefficient dépendant du groupe acoustique de l’aéronef et de l’heure du décollage ;
3. le logarithme décimal de la masse maximale au décollage exprimée en tonnes.

Les aéronefs de moins de deux tonnes ainsi que les aéronefs et missions entrant dans les exclusions légales ne sont pas taxés.

### Tarifs des aérodromes

| Groupe | Aérodrome | Tarif |
|---:|---|---:|
| 1 | Nantes-Atlantique | 37,80 € |
| 1 | Paris-Charles de Gaulle | 24,30 € |
| 1 | Paris-Le Bourget | 75,00 € |
| 1 | Paris-Orly | 26,60 € |
| 2 | Toulouse-Blagnac | 17,70 € |
| 3 | Beauvais-Tillé | 2,90 € |
| 3 | Bordeaux-Mérignac | 10,00 € |
| 3 | Lyon-Saint Exupéry | 0 € |
| 3 | Marseille-Provence | 4,70 € |
| 3 | Nice-Côte d’Azur | 0,50 € |

Un tarif nul est une valeur réglementaire explicite. Il ne signifie pas que la taxe est abrogée.

### Coefficients acoustiques et horaires

Les coefficients vont de **0,25 à 60** selon le groupe acoustique et la plage horaire. Les décollages les plus bruyants et les plus tardifs reçoivent les coefficients les plus élevés.

Ces tarifs et coefficients restent les paramètres d’une seule taxe. Ils ne deviennent ni des prélèvements autonomes ni des recettes.

### Affectation et blocage statistique

Le produit finance, pour l’aérodrome concerné, les aides et mesures en faveur des riverains exposés au bruit. Le bénéficiaire opérationnel peut toutefois être un exploitant aéroportuaire public ou privé.

Le corpus local ne fournit pas encore :

- une ligne NTL nommant directement la TNSA ;
- son code SEC individuel ;
- le traitement de reroutage lorsque l’exploitant est privé ;
- une recette annuelle directement attribuable.

La ligne NTL 70 « Taxes sur les transports », soit **1 859 M€ en 2024**, reste trop agrégée et n’est pas attribuée.

La fiche conserve donc `po_status: unresolved`, `membership_status: blocked` et `publication_status: blocked` malgré l’existence juridique confirmée.

Le montant de **57 M€** du brouillon n’a pas d’année de référence. Il n’est pas promu comme recette observée.

## Redevance d’atterrissage : contrepartie directe

La ligne 341 emploie le terme générique « taxe d’atterrissage ». Le droit en vigueur la qualifie de **redevance d’atterrissage**.

L’article R. 6325-5 du code des transports précise qu’elle est perçue en contrepartie de la mise à disposition, au bénéfice des aéronefs de plus de six tonnes :

- des infrastructures nécessaires à l’atterrissage et au décollage ;
- des équipements nécessaires à la circulation au sol ;
- éventuellement de services complémentaires tels que le balisage, l’information de vol et les aides visuelles.

Le tarif dépend de la masse maximale certifiée au décollage de l’aéronef.

Cette formulation établit une contrepartie directe et individualisable entre le paiement et l’usage des installations aéroportuaires. La charge est donc conservée comme juridiquement active mais exclue du référentiel des prélèvements obligatoires :

```text
po_status: excluded
membership_status: excluded_from_po_inventory
publication_status: non_po_charge
```

Elle n’hérite d’aucune ligne statistique attribuée aux taxes aériennes.

## État consolidé du lot aérien

Après ce complément, le lot aérien comporte :

| Statut | Élément |
|---|---|
| Prête à relire | Taxe sur le transport aérien de passagers |
| Prête à relire dans le lot parent | Taxe sur le transport aérien de marchandises |
| Active, bloquée | Taxe sur les nuisances sonores aériennes |
| Active, hors périmètre PO | Redevance d’atterrissage |

La ligne 340 est absorbée dans la première fiche et ne figure pas comme unité supplémentaire.

## Garde-fous appliqués

1. Un ancien nom administratif explicitement remplacé est fusionné dans la créance actuelle.
2. Une majoration territoriale ne devient pas une taxe autonome.
3. Le champ 2026 de la taxe passagers est corrigé sans modifier les observations 2024.
4. Une taxe fondée sur le décollage et le bruit n’est pas absorbée par les taxes fondées sur le transport.
5. Des tarifs et coefficients ne deviennent pas des recettes ou des fiches.
6. Une ligne statistique agrégée n’est pas ventilée.
7. Un montant du brouillon sans année n’est pas promu.
8. Une redevance rémunérant directement l’usage d’infrastructures est exclue du périmètre PO.
9. Les données servies par l’application restent inchangées.
