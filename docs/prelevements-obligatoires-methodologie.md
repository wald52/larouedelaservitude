# Méthode d’identification des prélèvements obligatoires

Date de référence : **2026-09-01**.

## Objet

Le projet cherche une liste des prélèvements obligatoires français **juridiquement en vigueur**, et non une collection de tout ce qui porte les mots « taxe », « contribution », « cotisation », « droit » ou « redevance ». La qualification est économique et institutionnelle autant que juridique.

## Test cumulatif

Une entrée n’est publiable que lorsque les cinq points suivants sont établis par des sources primaires :

1. **Obligation** — le paiement est imposé par une norme ;
2. **Bénéficiaire économique** — la recette est reçue par une administration publique (S.13) ou une institution de l’Union européenne (S.212), directement ou après un reroutage de comptabilité nationale documenté ;
3. **Absence de contrepartie directe et immédiate** — un prix, un péage, un loyer domanial ou des frais de dossier individualisables ne sont pas retenus par défaut ;
4. **Classement SEC 2010** — D.2, D.5, D.91 ou cotisations sociales effectives obligatoires D.611c/D.613c, nettes de D.995 ;
5. **Vigueur** — l’imposition existe effectivement au 2026-09-01, sous son nom et son mécanisme actuels.

La définition française de départ est celle de l’Insee (`insee-definition-po`). Le périmètre statistique et les codes sont ceux de la méthodologie européenne 2026 (`ec-methodology-2026`).

## Deux questions séparées

- **La norme existe-t-elle aujourd’hui ?** C’est le `legal_status`.
- **Cette recette appartient-elle aux prélèvements obligatoires ?** C’est le `po_status`.

Une taxe légalement en vigueur peut être hors périmètre si sa recette ne va pas à S.13/S.212. À l’inverse, une ancienne taxe peut avoir été un prélèvement obligatoire tout en étant aujourd’hui abrogée.

## Granularité canonique

Une entrée correspond à une imposition ou une cotisation juridiquement distincte. Ne sont pas créées comme entrées autonomes :

- les tranches, taux, seuils et parts salariale/patronale d’un même prélèvement ;
- les fractions affectées à différents bénéficiaires ;
- les simples changements de collecteur ;
- les libellés agrégés réunissant plusieurs taxes ;
- les anciennes appellations déjà remplacées.

Une famille peut néanmoins être éclatée lorsque la loi crée plusieurs faits générateurs ou créances distinctes. Chaque décision d’éclatement doit citer ses articles.

## Hiérarchie des sources

1. texte en vigueur daté (Légifrance, droit de l’Union) ;
2. nomenclature de comptabilité nationale NTL/Eurostat et méthodologie SEC ;
3. annexes budgétaires et sociales officielles pour les bénéficiaires et recettes ;
4. administrations de collecte pour les modalités courantes ;
5. sources secondaires uniquement pour repérer une piste.

La discussion partagée par le mainteneur est enregistrée comme `research_context` : elle aide à ne rien oublier, mais ne constitue jamais une preuve.

## États de l’audit

- `confirmed` : qualification PO établie ;
- `excluded` : hors définition ou pas une unité de prélèvement ;
- `unresolved` : preuves encore insuffisantes ;
- `active`, `repealed`, `replaced`, `unknown` : état juridique ;
- `membership_status=ready` : l’appartenance au périmètre et la vigueur sont suffisamment étayées ;
- `publication_status=ready` : la fiche canonique est en plus documentée, y compris l’année et la source de toute recette.

## Montants

Chaque recette devra porter `recette_annee`, une unité, une source et une date de consultation. Les 141 sous-lignes françaises de la NTL 2026 fournissent des recettes jusqu’en 2024 ; elles ne doivent pas être présentées comme des montants 2026. Les prévisions 2026 de l’annexe 3 de la LFSS sont conservées séparément comme prévisions, sans écraser les observations NTL.

## Limite du premier lot

Ce premier lot établit le protocole et audite chaque ligne du brouillon. Il ne remplace pas encore `entries-full.json`, car **251 entrées restent non résolues** et plusieurs familles doivent être fusionnées ou éclatées. Publier maintenant une liste prétendument exhaustive reproduirait précisément le problème signalé dans l’issue #36.
