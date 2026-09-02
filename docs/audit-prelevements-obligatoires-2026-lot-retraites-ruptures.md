# Audit des prélèvements obligatoires 2026 — lot retraites et ruptures

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/retraites-ruptures-2026-09-02`**  
**Données de production modifiées : non**

Ce quatrième lot poursuit la reprise documentaire des prélèvements sociaux affectés à l'assurance vieillesse. Il couvre trois lignes du brouillon historique et corrige surtout la granularité de la ligne relative aux retraites à prestations définies.

La fiche structurée correspondante est publiée dans [`data/audit/retraites-ruptures-2026-09-02.json`](../data/audit/retraites-ruptures-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Ligne du brouillon | Base juridique au 2 septembre 2026 | Prévision 2025 | Prévision 2026 | Décision |
|---|---:|---|---:|---:|---|
| Contribution sur les avantages de préretraite d'entreprise | 13 | CSS, article L. 137-10 | 38 M€ | 34 M€ | conserver |
| Contribution employeur sur les retraites à prestations définies à droits conditionnels | 14 | CSS, article L. 137-11 | enveloppe familiale | enveloppe familiale | scinder et conserver |
| Contribution à la charge des bénéficiaires sur les rentes à prestations définies | 14 | CSS, article L. 137-11-1 | enveloppe familiale | enveloppe familiale | scinder, classement SEC à confirmer |
| Contribution employeur sur les retraites à prestations définies à droits acquis | 14 | CSS, article L. 137-11-2 | enveloppe familiale | enveloppe familiale | scinder et conserver |
| Contribution sur les indemnités de rupture conventionnelle et de mise à la retraite | 15 | CSS, article L. 137-12 | 873 M€ | 1 155 M€ | conserver, renommer et élargir le périmètre |
| Cotisation des débitants de tabac au RAVGDT | absente | décret n° 63-1104 du 30 octobre 1963 | inconnue | inconnue | candidat bloqué |

Quatre fiches sont prêtes à relire. Deux créances juridiquement actives restent bloquées : la contribution précomptée sur les rentes à prestations définies, faute de classement statistique explicite, et la cotisation RAVGDT, faute de classement SEC et de rattachement institutionnel suffisamment précis.

## La ligne 14 doit produire trois créances distinctes

Le brouillon traitait comme une unité unique la « contribution sur les régimes de retraite conditionnant la constitution de droits à prestations à l'achèvement de la carrière du bénéficiaire dans l'entreprise ».

Le droit en vigueur distingue pourtant trois contributions ayant des redevables, des assiettes et des taux différents :

1. **Article L. 137-11 — employeur, droits conditionnels historiques.**  
   L'employeur choisit entre une contribution de 32 % sur les rentes, de 24 % sur les primes versées à l'organisme gestionnaire, ou de 48 % sur les dotations aux provisions ou le coût des services rendus. Les nouveaux régimes et nouvelles affiliations sont fermés depuis le 5 juillet 2019, et les droits conditionnels nouveaux sont en principe fermés pour les périodes d'emploi postérieures au 1er janvier 2020. La contribution demeure cependant active pour les régimes et droits existants.

2. **Article L. 137-11-1 — bénéficiaire de la rente.**  
   Cette contribution est précomptée sur les rentes. Elle comporte des tranches à 0 %, 7 % et 14 %, avec des seuils de référence revalorisés chaque année. Les dispositions instituant un taux de 21 % et certains plafonds supérieurs ont été déclarées contraires à la Constitution et ne sont pas traitées comme applicables.

3. **Article L. 137-11-2 — employeur, droits acquis.**  
   Les sommes versées par l'employeur pour financer les nouveaux régimes à droits acquis supportent une contribution de 29,7 %.

La scission n'est donc pas une séparation de simples taux : elle correspond à trois créances légales autonomes.

## Classement statistique de la contribution des bénéficiaires

Le contrôle final a montré que la contribution de l'article L. 137-11-1 ne pouvait pas hériter automatiquement de la ligne 107 de la National tax list.

Cette ligne, classée D29C et intitulée « Autres taxes », est une enveloppe résiduelle utilisée pour les contributions employeur du lot. Elle ne nomme pas la créance précomptée sur les rentes et ne suffit pas à classer un prélèvement dû par le bénéficiaire.

Deux lignes D51 agrégées ont été repérées comme pistes — « Autres taxes » et « Autres prélèvements sociaux » — mais aucune ne nomme explicitement la contribution. Le dossier conserve donc les trois créances juridiques issues de la scission, tout en bloquant la fiche L. 137-11-1 jusqu'à obtention d'une table de passage ou d'une source de comptabilité nationale plus précise.

## Prévision de 179 M€ non ventilée

L'annexe 3 du PLFSS 2026 présente une seule ligne « Contribution sur les régimes de retraite à prestations définies », fondée sur l'article L. 137-11, avec 179 M€ en 2025 et 179 M€ en 2026.

Après la scission juridique, cette source ne permet pas de déterminer si la prévision couvre exclusivement l'article L. 137-11 ou toute la section L. 137-11 à L. 137-11-2. Les 179 M€ sont donc conservés comme **enveloppe familiale non attribuée**. Aucune répartition n'est fabriquée entre les trois créances.

## Contribution sur les avantages de préretraite

L'article L. 137-10 met à la charge de l'employeur une contribution de 50 % sur les avantages de préretraite ou de cessation anticipée d'activité versés à d'anciens salariés, directement ou par un tiers agissant pour son compte.

La contribution, créée en 2003, est affectée à la Caisse nationale d'assurance vieillesse. Le PLFSS 2026 fournit des prévisions de 38 M€ en 2025 et 34 M€ en 2026.

Aucune recette observée directement attribuable n'est publiée dans ce lot.

## Rupture conventionnelle et mise à la retraite

La ligne 15 du brouillon ne mentionnait que les indemnités de mise à la retraite et portait une recette de 39 M€ sans année.

Depuis le 1er septembre 2023, l'article L. 137-12 couvre deux faits générateurs :

- la part exonérée de cotisations sociales des indemnités de mise à la retraite à l'initiative de l'employeur ;
- la part exonérée de cotisations sociales des indemnités de rupture conventionnelle.

Le taux a été porté de 30 % à **40 %** par la loi de financement de la sécurité sociale pour 2026. Le libellé canonique est donc élargi et daté. Les prévisions de 873 M€ pour 2025 et de 1 155 M€ pour 2026 sont conservées séparément ; l'ancien montant non daté de 39 M€ n'est pas repris comme recette observée.

Le libellé plus étroit imprimé dans l'annexe du PLFSS est conservé comme provenance de la prévision, sans remplacer le périmètre juridique courant.

## Enveloppes statistiques non ventilées

La National tax list 2026 fournit notamment trois lignes agrégées ou résiduelles pertinentes pour le contrôle :

| Ligne | Code SEC | Libellé | Montant 2024 | Traitement |
|---:|---|---|---:|---|
| 107 | D29C C01 | Autres taxes | 1 364 M€ | soutien de classement pour les contributions employeur ; aucun montant individuel |
| 136 | D51M C01 | Autres taxes | 1 127 M€ | piste non attribuée |
| 141 | D51M C06 | Autres prélèvements sociaux | 14 646 M€ | piste non attribuée |

Aucun de ces montants n'est attribué à une fiche particulière. Les lignes D51 sont seulement conservées comme pistes de recherche pour la contribution due par les bénéficiaires.

## RAVGDT : obligation confirmée, appartenance au périmètre encore bloquée

Le décret n° 63-1104 a institué à compter du 1er janvier 1963 un régime d'allocations viagères pour les gérants de débits de tabac. Les sources administratives le décrivent comme un régime de retraite obligatoire par répartition. Son financement comprend notamment une cotisation des gérants et une contribution de l'État.

Pour la France métropolitaine, le décret consolidé retient depuis le 1er janvier 2025 un taux de 1,555 % de la remise brute. La fiche opérationnelle de la douane indique depuis le 1er janvier 2026 une remise brute égale à 10,29 % des livraisons et exprime la cotisation RAVGDT à 0,16 % du montant des livraisons de tabacs manufacturés.

Ces deux présentations sont cohérentes : 1,555 % de 10,29 % représente environ 0,1600 % des livraisons. Une page dédiée au RAVGDT, pourtant mise à jour en juillet 2026, affiche encore le taux de 1,570 % applicable depuis 2024 ; elle n'est donc pas utilisée pour fixer le taux courant.

Cette réconciliation tarifaire ne résout pas, à elle seule, le classement statistique. La cotisation est enregistrée comme candidate avec :

- `legal_status: active` ;
- `obligation_status: confirmed` ;
- `po_status: unresolved` ;
- `membership_status: blocked` ;
- aucune recette observée ou prévision inventée.

Les questions restantes sont le secteur institutionnel SEC du bénéficiaire final, la ligne de comptabilité nationale où la cotisation est enregistrée et l'existence d'une recette annuelle directement attribuable.

## Prochaines lignes cohérentes

Deux entrées voisines sont réservées à un lot ultérieur :

- la ligne 12, ancienne contribution de 8,2 % sur certains abondements d'employeur aux PERCO, dont il faut déterminer l'abrogation, le remplacement ou l'absorption dans le forfait social ;
- la ligne 16, qui combine les contributions patronale et salariale sur les options et actions gratuites et doit être scindée.

## Garde-fous appliqués

1. Des créances fondées sur des articles, redevables et assiettes distincts ne sont pas fusionnées.
2. Une classification statistique agrégée n'est pas héritée automatiquement après une scission juridique.
3. Une enveloppe budgétaire familiale n'est pas répartie sans source.
4. Une ligne statistique résiduelle n'est pas attribuée à une fiche particulière.
5. Les dispositions déclarées inconstitutionnelles ne sont pas publiées comme taux applicables.
6. Un montant du brouillon sans année ne devient pas une recette canonique.
7. Une obligation juridique ne suffit pas, seule, à établir l'appartenance aux prélèvements obligatoires.
8. Les données servies par l'application restent inchangées.
