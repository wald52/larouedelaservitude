# Audit des prélèvements obligatoires 2026 — hydroélectricité et chasse

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/hydroelectricite-chasse-2026-09-02`**  
**Données de production modifiées : non**

Ce lot poursuit la reprise documentaire avec la ligne hydroélectrique du brouillon et les deux lignes relatives au permis de chasser. Il intervient au lendemain de l’entrée en vigueur de la nouvelle architecture juridique des installations hydroélectriques de plus de 4 500 kilowatts.

La fiche structurée correspondante est publiée dans [`data/audit/hydroelectricite-chasse-2026-09-02.json`](../data/audit/hydroelectricite-chasse-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche ou décision | Ligne du brouillon | Situation au 2 septembre 2026 | Donnée disponible | Décision |
|---|---:|---|---:|---|
| Redevance cynégétique due lors de la validation du permis | 41 | active, articles L. 423-19 à L. 423-21-1 | 57 M€ observés en 2024 | conserver et réunir les variantes de tarif |
| Redevance des installations hydroélectriques autorisées de plus de 4 500 kW | partie de 31 | active depuis le 1er septembre 2026, article L. 543-1 | aucun taux réglementaire ni produit individuel identifié dans les sources contrôlées | scinder et bloquer |
| Redevances des concessions hydroélectriques maintenues sous le droit antérieur | partie de 31 | régime transitoire actif pour les concessions couvertes par l’article 21 de la loi de 2026 | ancien montant de 0,9 M€ non daté | scinder davantage et bloquer |
| Redevance de délivrance initiale ou de duplicata du permis de chasser | 40 | active, article R. 423-11 | tarifs de 30 €, 15 € ou 30 € | exclure des prélèvements obligatoires |
| Redevance d’occupation du domaine public des installations hydroélectriques autorisées | absente du brouillon, identifiée lors de la scission | active depuis le 1er septembre 2026, article L. 543-2 | 2 000 € par MW installé avant indexation | exclure des prélèvements obligatoires |

Une seule fiche franchit tous les contrôles de publication : la redevance cynégétique de validation. Les redevances hydroélectriques proportionnelles restent bloquées faute de classement statistique et, pour le nouveau dispositif, faute de taux réglementaires identifiés. Les deux paiements à contrepartie directe sont documentés comme charges actives hors du périmètre des prélèvements obligatoires.

## La ligne hydroélectrique du brouillon n’est plus une unité juridique

La ligne 31 du brouillon décrivait une « redevance proportionnelle sur l’énergie hydraulique », avec une année 1919 et une recette de 0,9 M€ sans année de référence.

Cette formulation ne peut plus servir de fiche canonique au 2 septembre 2026. La loi n° 2026-554 du 29 juin 2026 a créé une nouvelle architecture applicable au plus tard le **1er septembre 2026**, tout en maintenant certaines concessions sous les dispositions antérieures jusqu’à leur résiliation ou selon le régime transitoire applicable.

La ligne doit donc être séparée entre :

1. la nouvelle redevance de l’article L. 543-1 pour les installations relevant du régime d’autorisation ;
2. les différentes redevances des concessions qui restent soumises au droit antérieur ;
3. la redevance distincte d’occupation du domaine public de l’article L. 543-2.

Ces trois ensembles n’ont ni la même assiette, ni le même objet, ni nécessairement le même traitement statistique.

## Nouvelle redevance de l’article L. 543-1

L’article L. 543-1 soumet à une redevance les installations utilisant l’énergie hydraulique pour produire ou stocker de l’électricité lorsqu’elles :

- relèvent du régime d’autorisation applicable aux installations de plus de 4 500 kW ;
- sont situées en France métropolitaine, à l’exception de la Corse.

Pour chaque année civile, le montant dû est égal à la quantité d’électricité injectée sur le réseau, en mégawattheures, multipliée par un montant issu d’un barème progressif appliqué au résultat net annuel par mégawattheure.

Le code prévoit quatre tranches :

| Résultat net par MWh | Traitement prévu |
|---|---|
| de 0 € à 30 € | taux fixé par décret |
| plus de 30 € à 60 € | taux croissant fixé par décret |
| plus de 60 € à 100 € | taux croissant fixé par décret |
| plus de 100 € | taux croissant fixé par décret |

Les quatre tranches restent les paramètres d’une seule redevance. Elles ne deviennent pas quatre prélèvements.

### Taux non inventés

L’article renvoie à un décret en Conseil d’État, pris après avis de la Commission de régulation de l’énergie, pour fixer les taux et les modalités de comptabilité appropriée.

Aucun décret comportant ces taux n’a été identifié dans les sources contrôlées au 2 septembre 2026. Le fichier d’audit enregistre donc l’état précis `not_identified_in_sources_checked_as_of_2026-09-02` :

- aucun taux n’est fabriqué ;
- aucun produit n’est calculé à partir des tranches ;
- la fiche reste bloquée jusqu’à l’ajout du texte réglementaire ou d’une publication officielle équivalente.

Cette formulation ne prétend pas démontrer l’inexistence absolue d’un texte ; elle décrit seulement le résultat vérifiable de la recherche effectuée pour le lot.

### Bénéficiaires

L’État perçoit la totalité de la redevance et en reverse **3 %** aux établissements publics territoriaux de bassin concernés. La part de chaque établissement est plafonnée à 50 % de certaines dépenses de fonctionnement définies par l’article.

Le bénéficiaire public est ainsi établi, mais ce constat ne suffit pas encore à déterminer le code SEC de la créance. La redevance a été créée en 2026, après la dernière année disponible de la National tax list.

## Anciennes concessions : plusieurs redevances transitoires

L’article 21 de la loi du 29 juin 2026 maintient certaines concessions sous les dispositions législatives antérieures jusqu’à leur résiliation ou selon le régime transitoire prévu.

L’ancien chapitre III comportait au moins trois mécanismes :

### Ancien article L. 523-1

L’acte de concession pouvait prévoir :

- une redevance proportionnelle au nombre de kilowattheures produits ;
- une redevance proportionnelle aux dividendes ou bénéfices répartis ;
- éventuellement le cumul des deux.

Une fraction était répartie entre l’État, les départements et les communes selon les règles alors applicables.

### Ancien article L. 523-2

Les nouvelles concessions ou les renouvellements pouvaient supporter une redevance proportionnelle aux recettes de la concession. Son taux plafond était déterminé pour chaque concession dans la procédure de mise en concurrence, avec des fractions affectées à l’État et aux collectivités concernées.

### Ancien article L. 523-3

Les concessions prorogées supportaient une redevance proportionnelle aux recettes ou bénéfices. L’article R. 523-5 fixait à **40 %** le taux applicable au résultat normatif net d’impôt sur les sociétés.

Le libellé de la ligne 31 agrège donc plusieurs créances et plusieurs formules. Le lot ne publie pas artificiellement une fiche unique appelée « redevance proportionnelle hydroélectrique ». Une reprise par article ou par population de concessions reste nécessaire.

L’année 1919 du brouillon peut appartenir à l’histoire générale du régime des concessions, mais elle ne constitue pas une date de création commune prouvée pour ces différents mécanismes. Le montant non daté de 0,9 M€ n’est réparti entre aucune composante.

## Enveloppes statistiques hydroélectriques non attribuées

Trois lignes de la National tax list ont été examinées :

| Ligne | Code | Libellé | Montant 2024 | Traitement |
|---:|---|---|---:|---|
| 32 | D214A C04 | Autres taxes sur l’énergie | 622 M€ | enveloppe résiduelle non attribuée |
| 65 | D214H C03 | Autres taxes sur l’énergie | 0 M€ | enveloppe résiduelle non attribuée |
| 92 | D29A C11 | Taxe sur l’utilisation des voies navigables, dont taxe hydraulique | 0 M€ | périmètre différent, non attribué |

Aucune ne nomme une des créances du code de l’énergie. La nouvelle redevance de 2026 ne peut pas être rétroprojetée dans une statistique arrêtée à 2024, et les anciennes concessions ne peuvent pas être rapprochées d’une ligne résiduelle sans table de passage.

## Redevance domaniale de l’article L. 543-2

Le même chapitre institue une redevance distincte fixée à **2 000 € par mégawatt installé**, indexée chaque année sur l’indice du coût de la construction. Elle peut être réduite ou supprimée pendant la durée de certains financements publics accordés par l’État.

Cette créance renvoie expressément à l’article L. 2125-1 du code général de la propriété des personnes publiques : elle est due en contrepartie de l’occupation ou de l’utilisation du domaine public.

Elle est donc documentée comme une recette domaniale à contrepartie individualisable et exclue du périmètre des prélèvements obligatoires retenu par le projet. Elle ne doit pas être fusionnée avec la redevance de production ou de stockage de l’article L. 543-1.

Le montant de 2 000 € par MW est un tarif de base, non une recette annuelle.

## Redevance cynégétique de validation

La ligne 41 du brouillon est confirmée comme une créance active. La validation du permis donne lieu au paiement d’une redevance cynégétique nationale ou départementale. Le permis peut être validé annuellement, pour neuf jours consécutifs ou pour trois jours consécutifs.

Depuis le **3 avril 2026**, les montants sont :

| Portée | Durée | Tarif normal | Première validation |
|---|---|---:|---:|
| nationale ou départementale | annuelle | 50,60 € | 25,30 € |
| nationale ou départementale | neuf jours | 35,25 € | 17,62 € |
| nationale ou départementale | trois jours | 25,01 € | 12,51 € |

La réduction de moitié s’applique à la première validation dans les conditions prévues par les textes. Les variantes nationales et départementales ont les mêmes montants en 2026.

Ces six tarifs normaux et six tarifs réduits ne représentent pas douze prélèvements : ils sont les modalités de la même redevance.

### Collecte et affectation

Les redevances sont encaissées par un comptable public de l’État ou par un régisseur de recettes de l’État placé auprès d’une fédération départementale ou interdépartementale des chasseurs. Leur produit est versé à une agence de l’eau selon les modalités réglementaires.

Depuis 2025, l’article L. 213-10-11 les inscrit explicitement parmi les redevances du dispositif des agences de l’eau.

### Correspondance statistique directe

La ligne 195 de la National tax list, classée `D59D C04`, est intitulée « Redevance cynégétique (permis de chasse) » et porte **57 M€ en 2024**.

Cette ligne est directement attribuée à la redevance de validation. Le libellé statistique générique « permis de chasse » ne doit cependant pas conduire à y inclure la redevance de délivrance initiale du titre.

Les cotisations fédérales annuelles ou temporaires, qui peuvent être acquittées en parallèle lors de la validation, ne sont pas incluses dans la fiche.

## Délivrance initiale du permis : charge active hors prélèvements obligatoires

L’article R. 423-11 prévoit :

| Acte | Montant |
|---|---:|
| délivrance initiale | 30 € |
| délivrance initiale à un mineur âgé de plus de seize ans | 15 € |
| duplicata | 30 € |

La redevance est perçue par l’agent comptable de l’Office français de la biodiversité, établissement public de l’État. Elle est liée à la délivrance ou au duplicata d’un titre individualisé ; le code prévoit notamment le remboursement lorsque le permis ne peut juridiquement être délivré dans le cas visé par l’article R. 423-9.

Le paiement rémunère donc directement une opération administrative individualisable. Il est conservé comme charge active mais exclu du périmètre des prélèvements obligatoires.

La ligne NTL 195 ne lui est pas attribuée : elle correspond à la redevance cynégétique de validation, dont le produit, les montants et la base légale sont différents.

## Prochaines recherches

Trois prolongements sont enregistrés :

1. identifier le décret fixant les taux du barème de l’article L. 543-1 ;
2. obtenir une ventilation budgétaire ou domaniale des redevances des concessions maintenues sous le droit antérieur ;
3. contrôler séparément les cotisations fédérales de chasse, qui ne sont pas la redevance cynégétique.

Le prochain lot de reprise du brouillon peut traiter les lignes 51 à 53 relatives aux anciens droits de francisation, de navigation et de passeport, déjà signalés comme remplacés par les taxes actuelles sur les engins maritimes.

## Garde-fous appliqués

1. Un ancien libellé couvrant plusieurs régimes juridiques est scindé.
2. Une réforme entrée en vigueur en 2026 n’est pas rétroprojetée dans les observations de 2024.
3. Une ligne statistique résiduelle n’est pas attribuée sans table de passage.
4. Les taux réglementaires manquants ne sont pas inventés.
5. Une redevance de production et une redevance d’occupation du domaine public restent distinctes.
6. Une charge domaniale ou administrative à contrepartie directe est exclue du périmètre fiscal.
7. Les variantes de durée, de territoire et de première validation ne créent pas de fiches supplémentaires.
8. Un tarif unitaire n’est pas une recette.
9. Le montant non daté du brouillon n’est pas promu.
10. Les données servies par l’application restent inchangées.
