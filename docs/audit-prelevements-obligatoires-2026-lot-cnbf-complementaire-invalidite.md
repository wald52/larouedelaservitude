# Audit des prélèvements obligatoires 2026 — CNBF complémentaire et invalidité-décès

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/cnbf-complementaire-invalidite-2026-09-02`**  
**Données de production modifiées : non**

Ce lot poursuit la reprise des ressources obligatoires de la Caisse nationale des barreaux français. Après les droits de plaidoirie et les deux cotisations du régime vieillesse de base, il documente deux régimes distincts qui n’avaient pas de ligne autonome dans le brouillon historique :

- le régime complémentaire obligatoire de retraite à points ;
- le régime obligatoire invalidité-décès des avocats non salariés.

Les deux fiches structurées sont publiées dans [`data/audit/cnbf-complementaire-invalidite-2026-09-02.json`](../data/audit/cnbf-complementaire-invalidite-2026-09-02.json). Elles ne modifient ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Présence dans le brouillon | Base juridique au 2 septembre 2026 | Produit administratif 2025 | Décision |
|---|---|---|---:|---|
| Cotisation au régime complémentaire obligatoire de retraite des avocats | aucune ligne autonome retrouvée | CSS, articles L. 654-1 à L. 654-7 et règlement CNBF | 478,895026 M€ | ajouter à l’inventaire |
| Cotisation au régime obligatoire invalidité-décès des avocats non salariés | aucune ligne autonome retrouvée | CSS, article L. 652-9, article D. 652-3 et statuts CNBF | 23,102695 M€ | ajouter à l’inventaire |

Les deux fiches sont prêtes à relire. Les produits publiés dans les comptes de la CNBF sont conservés comme données administratives ; ils ne sont pas présentés comme des observations de comptabilité nationale.

## Deux régimes distincts du régime vieillesse de base

Les statuts de la CNBF la qualifient d’organisme de sécurité sociale chargé de régimes obligatoires d’assurance vieillesse de base, d’assurance vieillesse complémentaire et d’invalidité-décès.

Cette architecture impose quatre séparations :

1. les cotisations forfaitaire et proportionnelle financent le régime vieillesse de base ;
2. les droits de plaidoirie et la contribution équivalente financent une quote-part du même régime de base ;
3. la cotisation complémentaire finance un compte distinct du régime à points ;
4. la cotisation invalidité-décès finance un régime de prévoyance obligatoire distinct.

La proximité du gestionnaire ne justifie donc aucune fusion entre ces ressources.

## Régime complémentaire obligatoire

L’article L. 654-1 du code de la sécurité sociale prévoit le régime complémentaire obligatoire de retraite et de réversion des avocats. L’article L. 654-2 fonde les cotisations sur :

- le revenu professionnel pour l’avocat non salarié ;
- la rémunération brute pour l’avocat salarié ;
- une assiette optionnelle de 25 % ou 50 % du revenu de l’avocat pour le conjoint collaborateur.

Le règlement actuel rappelle que le régime a été prévu par la loi du 2 janvier 1979 et institué par une décision de l’assemblée générale extraordinaire de la CNBF du **16 février 1979**. L’année 1979 est donc retenue comme année de création de cette cotisation complémentaire.

### Cinq tranches de revenu en 2026

| Tranche | Revenu professionnel 2026 |
|---:|---:|
| 1 | de 1 € à 42 507 € |
| 2 | de 42 508 € à 85 014 € |
| 3 | de 85 015 € à 127 521 € |
| 4 | de 127 522 € à 170 028 € |
| 5 | de 170 029 € à 212 535 € |

### Classes C1, C2 et majoration C2+

| Classe ou option | Tranche 1 | Tranche 2 | Tranche 3 | Tranche 4 | Tranche 5 |
|---|---:|---:|---:|---:|---:|
| C1 | 7,0 % | 10,4 % | 12,2 % | 14,0 % | 15,8 % |
| C2 | 7,0 % | 11,6 % | 13,7 % | 15,8 % | 17,9 % |
| C2+ | 7,0 % | 11,6 % | 13,7 % | 15,8 % | 20,4 % |

C2+ n’est pas un troisième prélèvement. Le règlement permet une majoration facultative de **2,5 points** sur la tranche la plus élevée de C2. Les choix, maintiens et changements de classe suivent des règles propres au statut de l’avocat et à sa date d’affiliation ; aucun taux n’est présenté comme applicable uniformément à tous les cotisants.

Pour les avocats non salariés inscrits pour la première fois en 2025 ou 2026, le barème prévoit en C1 un appel provisionnel de **639 €**. Il s’agit d’une modalité d’appel avant régularisation, et non d’une cotisation autonome ou d’une recette.

### Avocats salariés

Pour l’avocat salarié, le barème répartit la cotisation complémentaire entre :

- **60 % à la charge de l’employeur** ;
- **40 % à la charge du salarié**, précomptés sur sa rémunération.

Cette ventilation ne crée pas deux fiches juridiques. La cotisation reste une seule créance du régime complémentaire, mais ses flux reçoivent des profils SEC différents selon le débiteur économique.

### Conjoint collaborateur

Le conjoint collaborateur peut retenir une assiette égale à 25 % ou à 50 % du revenu professionnel de l’avocat. À défaut de choix, l’assiette de 25 % s’applique. Ces options restent des modalités de la même cotisation.

## Classement SEC de la cotisation complémentaire

Le régime est obligatoire, géré par un organisme de sécurité sociale et comptabilisé dans un compte distinct. Le classement retenu est celui des cotisations sociales effectives obligatoires :

| Profil économique | Classement retenu |
|---|---|
| avocat non salarié | `D.613c`, détail volontaire `D.613cs` |
| part patronale pour l’avocat salarié | `D.611C` |
| part précomptée sur l’avocat salarié | `D.613c`, détail `D.613ce` |

Le rattachement de la CNBF au sous-secteur `S.1314` reste présenté comme une inférence institutionnelle documentée à partir de son statut officiel d’organisme de sécurité sociale ; le code de secteur n’est pas imprimé littéralement dans l’arrêté.

## Produit administratif du régime complémentaire

Les comptes annuels 2025 de la CNBF publient un poste « Cotisations sociales » propre au régime complémentaire :

| Exercice | Produit administratif |
|---:|---:|
| 2024 | 455,905694 M€ |
| 2025 | 478,895026 M€ |

Le compte distinct du régime permet de rattacher ces valeurs à la cotisation complémentaire. Elles restent toutefois des produits de comptabilité administrative CNBF et ne sont pas transformées en observations des comptes nationaux.

## Régime invalidité-décès

L’article L. 652-9 prévoit une cotisation distincte destinée au financement du régime invalidité-décès. La CNBF précise que ce régime couvre les avocats non salariés ; les avocats salariés relèvent du régime général pour ces risques.

Le conjoint collaborateur acquitte, selon son option, le quart ou la moitié de la cotisation forfaitaire de l’avocat.

### Montants 2026

| Profil ou composante | Montant annuel 2026 |
|---|---:|
| avocat non salarié, 1re à 4e année d’exercice | 68 € |
| avocat non salarié, 5e année et suivantes, ainsi que 65 ans et plus | 170 € |
| avocat retraité encore en activité au 1er janvier 2026 | 500 € |
| part recouvrée auprès de la CARPA, par avocat non salarié du barreau | 163 € |

Le barème opérationnel emploie le raccourci « cotisation recouvrée auprès du barreau ». Les statuts approuvés en 2026 désignent plus précisément la **CARPA** et organisent des acomptes trimestriels suivis d’une régularisation annuelle.

La part recouvrée auprès de la CARPA ne constitue pas une deuxième cotisation canonique. L’article L. 652-9 prévoit une cotisation distincte unique, dont les statuts peuvent répartir l’appel entre plusieurs composantes.

## Classement SEC de l’invalidité-décès

La cotisation finance un régime de sécurité sociale obligatoire réservé aux avocats non salariés. Le profil principal est donc classé en :

```text
D.613c
└── D.613cs — cotisations obligatoires des travailleurs indépendants
```

Le détail du reroutage économique de la part recouvrée auprès de la CARPA n’est pas publié dans les sources disponibles. Cette part reste dans la même fiche, mais aucun code de débiteur économique plus précis n’est inventé. La fiche peut être publiée au niveau de la famille des cotisations sociales obligatoires, tout en conservant cette limite documentaire.

## Produit administratif du régime invalidité-décès

Les comptes annuels de la CNBF publient :

| Exercice | Produit administratif |
|---:|---:|
| 2024 | 22,099465 M€ |
| 2025 | 23,102695 M€ |

Ces valeurs sont directement rattachées au compte du régime invalidité-décès. Comme pour le complémentaire, elles restent distinctes d’une observation de comptabilité nationale.

## Date d’origine laissée ouverte pour l’invalidité-décès

Une version retrouvée de l’ancien article L. 723-6 atteste l’existence de la cotisation au plus tard en **1985**. Elle ne suffit pas à établir le texte d’origine du prélèvement.

Le champ `annee_creation` reste donc `null`. L’année 1985 est seulement conservée comme plancher documentaire, conformément à la méthode appliquée aux cotisations du régime de base.

## Relations avec les lignes génériques du brouillon

Le brouillon comporte des lignes génériques de retraite complémentaire et d’assurance maladie-maternité-invalidité-décès. Elles ne nomment pas la CNBF et peuvent couvrir des régimes, tranches ou mécanismes d’une tout autre portée.

Le lot ne les détourne pas pour combler artificiellement les lacunes CNBF. Les deux nouvelles fiches sont enregistrées comme ajouts d’inventaire explicites.

## Garde-fous appliqués

1. Deux régimes obligatoires distincts donnent deux fiches, même lorsqu’ils sont gérés par la même caisse.
2. Des classes et tranches tarifaires ne deviennent pas des prélèvements autonomes.
3. Une majoration optionnelle de taux ne devient pas une nouvelle classe juridique.
4. La ventilation employeur-salarié modifie le profil SEC, pas l’unité canonique.
5. Les options du conjoint collaborateur restent des modalités de calcul.
6. La part CARPA de l’invalidité-décès ne devient pas une seconde cotisation.
7. Un montant forfaitaire, un plafond ou un appel provisionnel n’est pas une recette.
8. Les produits administratifs restent séparés des comptes nationaux.
9. Une première codification retrouvée n’est pas transformée en date d’origine certaine.
10. Les données servies par l’application restent inchangées.
