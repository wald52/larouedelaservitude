# Audit des prélèvements obligatoires 2026 — extension CNBF

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/plaidoirie-cvec-2026-09-02`**  
**Données de production modifiées : non**

Cette extension complète le lot consacré aux droits de plaidoirie et à la CVEC. Le contrôle du brouillon historique n’a retrouvé aucune ligne autonome pour les deux autres cotisations qui financent le régime vieillesse de base des avocats : la cotisation annuelle forfaitaire et la cotisation proportionnelle au revenu.

Les deux lacunes d’inventaire sont documentées dans [`data/audit/cnbf-cotisations-base-2026-09-02.json`](../data/audit/cnbf-cotisations-base-2026-09-02.json). Elles ne modifient ni `entries-full.json` ni `entries-light.json`.

## Résultat

| Fiche canonique | Situation dans le brouillon | Base juridique au 2 septembre 2026 | Barème 2026 | Décision |
|---|---|---|---|---|
| Cotisation annuelle forfaitaire au régime de base de la CNBF | aucune ligne autonome retrouvée | CSS, article L. 652-7, premier alinéa | de 363 € à 1 988 € selon l’ancienneté ; ventilation 60/40 pour les salariés | ajouter à l’inventaire |
| Cotisation proportionnelle au revenu au régime de base de la CNBF | aucune ligne autonome retrouvée | CSS, article L. 652-7, deuxième alinéa, et D. 652-1 | 3,20 % dans la limite de 297 549 € ; ventilation 1,92/1,28 pour les salariés | ajouter à l’inventaire |

Les deux fiches sont prêtes à relire. Elles complètent, sans la remplacer ni la fusionner, la fiche existante relative aux droits de plaidoirie et à la contribution équivalente.

## Deux cotisations juridiquement distinctes

L’article L. 652-7 prévoit successivement :

1. une cotisation annuelle obligatoire pour tous les avocats, susceptible d’être graduée suivant l’âge lors de la prestation de serment et l’ancienneté d’exercice ;
2. une cotisation assise sur les revenus professionnels, dans la limite d’un plafond fixé par décret.

La première est publiée comme **cotisation forfaitaire** et la seconde comme **cotisation proportionnelle**. Elles disposent d’assiettes et de règles de calcul différentes et constituent donc deux unités canoniques.

Elles ne doivent cependant pas être éclatées à nouveau entre avocats salariés et non salariés. Pour les avocats salariés, l’article L. 652-10 organise le versement par l’employeur et le précompte de la quote-part salariale. L’article D. 652-2 fixe cette quote-part à 40 % du montant de la cotisation. La répartition 60 % employeur / 40 % salarié décrit ainsi les débiteurs économiques d’une même créance, et non deux nouveaux prélèvements.

## Barème forfaitaire 2026

Le barème officiel de la CNBF fixe les montants annuels suivants :

| Ancienneté professionnelle | Total | Part employeur de l’avocat salarié | Part salariale |
|---|---:|---:|---:|
| 1re année | 363,00 € | 217,80 € | 145,20 € |
| 2e année | 730,00 € | 438,00 € | 292,00 € |
| 3e année | 1 145,00 € | 687,00 € | 458,00 € |
| 4e et 5e années | 1 558,00 € | 934,80 € | 623,20 € |
| 6e année et suivantes, ainsi que 65 ans et plus | 1 988,00 € | 1 192,80 € | 795,20 € |

Ces cinq niveaux sont les modalités d’un barème unique. Ils ne deviennent pas cinq fiches.

Pour l’avocat non salarié, la totalité du montant est à sa charge. Pour l’avocat salarié, le barème répartit chaque montant selon les proportions fixées par le code.

## Cotisation proportionnelle 2026

L’article D. 652-1 fixe le taux à **3,20 %** dans la limite de sept fois la première tranche de revenus du régime complémentaire. Le barème 2026 traduit cette règle par :

- un plafond annuel de **297 549 €** ;
- un plafond mensuel de **24 795,75 €** ;
- une part employeur de **1,92 %** pour l’avocat salarié ;
- une part salariale de **1,28 %** ;
- le taux intégral de **3,20 %** pour l’avocat non salarié.

Pour les deux premières années d’activité non salariée, l’assiette provisionnelle est fixée à 19 % du plafond de la sécurité sociale, soit 9 131 € en 2026. L’appel provisoire correspondant est de 292 €. Cette somme est une modalité d’appel avant régularisation, et non une recette ou un forfait définitif indépendant.

Le plafond de 297 549 € est une limite d’assiette ; il ne doit jamais être présenté comme un produit fiscal.

## Classement SEC par profil de cotisant

Les deux cotisations sont obligatoires et financent un régime d’assurance vieillesse de base géré par un organisme de sécurité sociale. Leur classement relève donc des cotisations sociales effectives, et non des impôts de la National tax list fiscale.

Le même prélèvement juridique reçoit plusieurs profils comptables selon le statut de l’avocat :

| Profil économique | Classement retenu |
|---|---|
| avocat non salarié | `D.613c`, détail volontaire `D.613cs` — cotisations obligatoires des travailleurs indépendants |
| employeur d’un avocat salarié, part de 60 % | `D.611C` — cotisations sociales effectives obligatoires des employeurs |
| avocat salarié, part de 40 % | `D.613c`, détail `D.613ce` — cotisations sociales effectives obligatoires des salariés |

Cette ventilation est cohérente avec la nomenclature européenne et avec les règles de versement et de précompte du code de la sécurité sociale.

La CNBF est qualifiée par ses statuts d’organisme de sécurité sociale gestionnaire de régimes obligatoires. Comme dans la fiche sur les droits de plaidoirie, le rattachement au sous-secteur `S.1314` est conservé comme une inférence institutionnelle documentée : le code de secteur n’est pas imprimé littéralement dans l’arrêté.

## Produit administratif non ventilé

Les comptes annuels 2025 de la CNBF publient, dans le compte de résultat du régime de retraite de base, un poste « Cotisations sociales » :

| Exercice | Produit administratif |
|---:|---:|
| 2024 | 306,622518 M€ |
| 2025 | 325,810142 M€ |

Ce poste n’est pas ventilé entre :

- cotisation forfaitaire et cotisation proportionnelle ;
- avocats non salariés ;
- parts patronales et salariales des avocats salariés ;
- éventuels produits afférents inclus dans la présentation comptable.

Il reste donc une **enveloppe administrative familiale non attribuée**. Aucun des deux montants n’est publié comme recette individuelle d’une fiche ni comme observation de comptabilité nationale.

## Addendum aux droits de plaidoirie

Les mêmes comptes permettent de documenter séparément le produit administratif de la fiche précédente :

| Composante | 2024 | 2025 |
|---|---:|---:|
| Droits de plaidoirie | 4,673876 M€ | 4,050671 M€ |
| Contributions équivalentes | 110,748136 M€ | 114,447025 M€ |
| Total des deux mécanismes | 115,422012 M€ | 118,497696 M€ |

Ces montants confortent la décision de conserver le droit et la contribution équivalente comme deux composantes documentées d’une même obligation de financement. Ils restent qualifiés de produits administratifs et ne sont pas présentés comme des données de comptes nationaux.

## Dates historiques prudentes

La plus ancienne version du code retrouvée dans ce contrôle mentionne la cotisation annuelle obligatoire en 1985. Une version entrée en vigueur en 1992 ajoute explicitement la cotisation assise sur les revenus.

Ces dates constituent des **planchers documentaires** :

- la cotisation forfaitaire existait au plus tard en 1985 ;
- la cotisation proportionnelle est explicitement codifiée au plus tard en 1992.

Le champ `annee_creation` reste donc `null` pour les deux fiches. Les dates retrouvées ne sont pas transformées en origines historiques certaines sans recherche complémentaire sur les textes antérieurs.

## Périmètre à poursuivre

Le barème 2026 fait également apparaître :

- le régime complémentaire obligatoire à points ;
- la cotisation invalidité-décès des avocats non salariés ;
- une cotisation invalidité-décès recouvrée auprès des barreaux.

Ces obligations ne sont pas absorbées dans les deux fiches du présent addendum. Elles doivent être contrôlées dans un lot ultérieur avec leur propre base juridique, leur classement et leurs produits.

## Garde-fous appliqués

1. Une lacune du brouillon est signalée explicitement.
2. Deux assiettes prévues par deux alinéas distincts donnent deux fiches canoniques.
3. Une ventilation employeur-salarié ne crée pas artificiellement deux fiches supplémentaires.
4. Les profils SEC sont attachés au débiteur économique sans modifier l’unité juridique.
5. Un barème d’ancienneté ne devient pas une série de prélèvements.
6. Un plafond et un appel provisionnel ne sont pas des recettes.
7. Un produit administratif familial n’est pas ventilé sans source.
8. Une première date de codification retrouvée n’est pas présentée comme une création certaine.
9. Les données servies par l’application restent inchangées.
