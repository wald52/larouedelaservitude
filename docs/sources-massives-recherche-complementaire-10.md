# Onzième recherche complémentaire sur les sources massives

Date de vérification : **4 septembre 2026**.  
Travail lié à l’issue [#36](https://github.com/wald52/larouedelaservitude/issues/36).

Ce document complète les dix passes précédentes. Le registre structuré associé est
[`data/reference/bulk-sources-supplement-10-2026-09-04.json`](../data/reference/bulk-sources-supplement-10-2026-09-04.json).

## Résultat principal

Cette passe complète trois infrastructures encore incomplètes :

1. l’identité juridique et l’histoire des entreprises et organismes non lucratifs, avec
   le RNE, le BODACC, le RNA et le JOAFE ;
2. les paramètres et dénominateurs des prélèvements assis sur le travail, avec les niveaux
   de prise en charge de l’apprentissage, Siasp et le CAS Pensions ;
3. la résolution des émetteurs financiers français, grâce au fichier LEI France de
   l’Insee qui relie directement LEI et SIREN ou code d’agrément.

La participation des employeurs à l’effort de construction est également documentée au
travers des rapports ANCOLS, mais la source reste `candidate` tant que son accès et ses
tableaux PDF n’ont pas été stabilisés.

Le nouveau pipeline d’identité est :

```text
nom publié dans une source fiscale
    → identifiant juridique stable
    → événements de création, modification, cession ou dissolution
    → documents et comptes publiés
    → bénéficiaire, collecteur ou redevable candidat
    → secteur institutionnel et rôle fiscal vérifiés séparément
```

Un registre juridique ne constitue ni un rôle fiscal ni une preuve de classement SEC.

## Matrice de complémentarité

| Besoin | Source principale | Contrôle | Ce que la source ne prouve pas |
| --- | --- | --- | --- |
| Identité d’une entreprise | RNE, Sirene | BODACC, LEI France | assujettissement et secteur SEC |
| Événements d’entreprise | BODACC | RNE, actes et statuts | état consolidé courant |
| Identité d’une association | RNA | JOAFE, Sirene | activité courante et secteur SEC |
| Événements associatifs | JOAFE | RNA | état consolidé et bénéficiaire fiscal |
| Apprentissage | NPEC France compétences | RNCP, OPCO, contrats et comptes | contribution payée par l’employeur |
| Masse salariale publique | Siasp | DSN, comptes publics et régimes | assiette exacte de chaque cotisation |
| Pensions de l’État | CAS Pensions | Siasp, budget et comptes nationaux | paiement individuel exhaustif |
| PEEC | rapports ANCOLS | Action Logement et comptes | déclaration individuelle de l’employeur |
| Émetteurs financiers | LEI France | Sirene, GLEIF et FIRDS | instrument ou transaction taxable |

## 1. Registre national des entreprises

Sources :

- [serveur SFTP Entreprises de l’INPI](https://data.inpi.fr/content/editorial/Serveur_ftp_entreprises) ;
- [API Entreprises de l’INPI](https://data.inpi.fr/content/editorial/Acces_API_Entreprises).

L’INPI diffuse les données du Registre national des entreprises par SFTP et API après
création gratuite d’un compte. Les familles annoncées comprennent les créations,
modifications et cessations, les actes et statuts, ainsi que les comptes annuels non
confidentiels.

La documentation publiée donne des ordres de grandeur élevés : environ cinq millions
d’entreprises actives dans le stock, deux millions de formalités de création-modification-
cessation par an, 1,5 million de dépôts de comptes annuels et environ 28 millions d’actes
et statuts. Une part importante des comptes déposés fait l’objet d’une déclaration de
confidentialité.

### Apport

Le RNE peut résoudre en masse :

- SIREN, dénomination et anciennes dénominations ;
- forme juridique, activité et capital ;
- dates et événements de formalité ;
- actes et statuts ;
- comptes annuels accessibles ;
- identité des redevables, collecteurs et bénéficiaires déjà cités dans l’inventaire.

### Complémentarité

```text
Sirene
    → identité statistique et administrative

RNE
    → formalités juridiques, actes et dépôts

BODACC
    → annonces publiques d’événements

LEI
    → identité normalisée sur les marchés financiers
```

Les dates et objets de ces registres ne doivent pas être fusionnés.

### Limites et statut

Le RNE ne prouve ni assujettissement, ni secteur SEC, ni recette. L’absence de comptes
ouverts ne prouve pas l’absence de dépôt. Les actes PDF demandent un pipeline documentaire
distinct et l’authentification doit être intégrée à la reproductibilité.

La source reste donc `candidate` jusqu’à un prototype ciblé sur les entités déjà présentes
dans le projet.

## 2. BODACC

Sources :

- [jeu BODACC](https://www.data.gouv.fr/datasets/bodacc) ;
- [API BODACC](https://bodacc-datadila.opendatasoft.com/api/explore/v2.0).

Le BODACC publie cinq éditions par semaine et dispose d’archives numériques depuis 2008.
Les annonces sont réparties principalement entre :

- bulletin A : ventes, cessions, immatriculations, créations et procédures collectives ;
- bulletin B : modifications et radiations ;
- bulletin C : avis de dépôts des comptes annuels.

Les données sont disponibles par API et sous plusieurs formats structurés.

### Table événementielle proposée

Une ingestion peut produire :

```text
SIREN ou identité candidate
    ├── immatriculation
    ├── création d’établissement
    ├── modification
    ├── cession
    ├── radiation
    ├── procédure collective
    └── avis de dépôt de comptes
```

Chaque annonce doit être conservée avec son identifiant, sa date, son bulletin et son
texte ou enregistrement source.

Une annonce n’est pas l’état courant. Plusieurs annonces peuvent se rapporter à la même
formalité. Une radiation peut ne concerner qu’un établissement. Un avis du bulletin C ne
contient pas nécessairement les données chiffrées du dépôt.

Livrable recommandé :

```text
data/reference/bodacc-business-events-manifest.json
```

## 3. Répertoire national des associations

Source :
[Répertoire national des associations](https://www.data.gouv.fr/datasets/repertoire-national-des-associations).

Le RNA couvre les associations de la loi de 1901, hors Bas-Rhin, Haut-Rhin et Moselle. Il
est diffusé sous forme de deux extractions mensuelles :

- `RNA_waldec`, pour les organismes disposant d’un numéro RNA et créés ou modifiés depuis
  2009 ;
- `RNA_import`, pour des associations plus anciennes sans changement déclaré depuis 2009.

Les champs comprennent notamment le numéro RNA, le nom, le sigle, l’objet, le siège,
l’adresse de gestion et le site internet.

### Précautions

Les deux extractions répondent à des historiques administratifs différents. Elles ne
doivent pas être concaténées sans une colonne de provenance. Une association ancienne sans
changement récent n’est pas nécessairement active. Le RNA ne fournit pas toujours le
SIREN, les comptes ou le secteur SEC.

La reconnaissance d’utilité publique, l’intérêt général, la perception d’une subvention et
l’appartenance à S.13 sont des notions distinctes.

## 4. JOAFE et comptes des organismes non lucratifs

Sources :

- [jeu ASSOCIATIONS (JOAFE)](https://www.data.gouv.fr/datasets/associations-joafe) ;
- [API Annonces et comptes annuels](https://www.data.gouv.fr/dataservices/api-annonces-officielles-et-comptes-annuels-des-associations) ;
- [comptes des associations](https://www.data.gouv.fr/datasets/comptes-associations).

Le corpus comprend les créations, modifications et dissolutions d’associations, ainsi que
des annonces relatives aux associations syndicales de propriétaires, fondations
d’entreprise, fonds de dotation, fondations partenariales et certaines décisions. Les
comptes soumis à une obligation de publication sont diffusés séparément.

### Chaîne RNA–JOAFE

```text
RNA
    → identité et objet déclarés

JOAFE
    → événements publiés et comptes soumis à publication

Sirene
    → identité économique lorsqu’elle existe

comptes et listes institutionnelles
    → financement et secteur candidat
```

Une annonce n’est pas un état consolidé. Toutes les associations ne publient pas de
comptes ; leur absence ne permet donc aucune conclusion sur l’activité ou le financement.

Livrable commun recommandé :

```text
data/reference/nonprofit-identities-events-manifest.json
```

Contrôles proposés : dissolution non répercutée, changement de nom ignoré, compte sans
identité certaine, organisme hors champ RNA d’Alsace-Moselle et bénéficiaire sans secteur
SEC résolu.

## 5. Niveaux de prise en charge de l’apprentissage

Source :
[Niveaux de prise en charge des contrats d’apprentissage](https://www.francecompetences.fr/regulation-des-couts-et-des-niveaux-de-prise-en-charge/apprentissage/).

France compétences publie plusieurs versions du référentiel national reliant notamment :

- certifications RNCP ;
- branches ou conventions ;
- OPCO ;
- niveaux de prise en charge ;
- version et date de publication.

Les versions de mai et de septembre 2026 peuvent être archivées et comparées.

### Règle centrale

```text
niveau de prise en charge
    ≠ taux de contribution de l’employeur
    ≠ montant payé par l’employeur
    ≠ paiement définitif au CFA
    ≠ recette d’un prélèvement
```

Le référentiel décrit un paramètre de financement. Un même RNCP peut avoir plusieurs
valeurs selon la branche et une nouvelle version peut corriger la précédente.

Livrable recommandé :

```text
data/reference/apprenticeship-npec-versions-manifest.json
```

## 6. Siasp et les rémunérations publiques

Source :
[Système d’information sur les agents des services publics](https://www.insee.fr/fr/metadonnees/source/serie/s1322).

Siasp couvre les effectifs, caractéristiques d’emploi, volumes de travail et rémunérations
des fonctions publiques d’État, territoriale et hospitalière. Depuis 2022, la quasi-
totalité des employeurs publics utilise la DSN ; les périodes antérieures reposaient sur
des sources variables selon les versants.

### Complément de la masse salariale privée

```text
Open Urssaf
    → secteur privé du régime général

Siasp
    → trois versants de la fonction publique

MSA et autres régimes
    → agriculture et champs particuliers
```

Cette combinaison fournit des dénominateurs agrégés plus complets pour les prélèvements sur
les rémunérations.

### Limites

Siasp est statistique et ne publie pas les paiements de cotisations par employeur. Les
militaires, apprentis, internes, assistants familiaux et autres catégories peuvent être
inclus ou exclus selon les tableaux. Salaire brut, salaire net et équivalent temps plein
ne sont pas l’assiette exacte de toutes les cotisations.

Livrable recommandé :

```text
data/reference/siasp-public-pay-series-manifest.json
```

## 7. CAS Pensions

Source :
[Compte d’affectation spéciale Pensions](https://retraitesdeletat.gouv.fr/statistiques/cas.html).

Le Service des retraites de l’État publie les taux, règles, feuilles de calcul et agrégats
du CAS Pensions. Les paramètres 2026 recensés comprennent notamment la retenue agent, les
contributions employeurs, l’allocation temporaire d’invalidité et les règles propres à
certains détachements.

### Granularité correcte

```text
retenue agent
≠ contribution employeur
≠ ATI
≠ RAFP
≠ régularisation
≠ remboursement
≠ dépense de pension
```

Le taux dépend de la catégorie d’employeur, de la position, de la date et du régime. Un
produit calculé à partir de Siasp et d’un taux doit rester une estimation de contrôle,
jamais une observation.

Livrable recommandé :

```text
data/reference/cas-pensions-rates-and-aggregates.json
```

## 8. ANCOLS et PEEC

Source :
[Agence nationale de contrôle du logement social](https://www.ancols.fr/).

Les rapports ANCOLS portent sur les ressources et emplois de la participation des
employeurs à l’effort de construction, les collecteurs, bénéficiaires, prêts, subventions,
retours, contrôles et évaluations.

Ils peuvent documenter les flux agrégés et les évolutions institutionnelles du réseau
Action Logement. Ils ne publient toutefois pas les bases, montants dus et paiements de
chaque employeur.

La source reste `candidate` : le site a connu des erreurs d’accès pendant la vérification
et les tableaux sont dispersés dans des rapports PDF.

Livrable préalable :

```text
data/reference/ancols-peec-reports-manifest.json
```

Il devra inventorier les rapports 2019-2025, les téléchargements, pages, tableaux, unités
et définitions avant toute extraction de montants.

## 9. LEI France : relation directe avec le SIREN

Source :
[FAQ LEI France de l’Insee](https://lei-france.insee.fr/faq).

L’Insee attribue des LEI aux entités de droit français et publie un fichier XML des LEI
qu’il gère. Ce fichier comprend le SIREN ou, selon le cas, un code d’agrément. Les fichiers
restent disponibles pendant trente jours glissants et un schéma XML est publié.

### Apport à la TTF

La passe précédente proposait :

```text
nom BOFiP
    → SIREN
    → LEI GLEIF
    → ISIN
```

LEI France fournit une relation française plus directe :

```text
SIREN ou code d’agrément
    ↔ LEI géré par l’Insee
```

Elle doit être utilisée avant le rapprochement mondial GLEIF, tout en conservant les
statuts et éventuels transferts entre organismes émetteurs de LEI.

### Limites

Le fichier ne couvre pas tous les LEI mondiaux ni toutes les entités intervenant en
France. Un LEI ne prouve ni le siège fiscal annuel, ni l’existence d’un ISIN, ni une
transaction ou une dette de TTF. La fenêtre de trente jours doit être archivée.

Livrable recommandé :

```text
data/reference/lei-france-siren-snapshots.json
```

## Graphe d’identité et d’événements

Les sources justifient une table de relations indépendante des fiches de prélèvements :

```text
entité interne
    ├── identified_by → SIREN, SIRET, RNA, FINESS, LEI…
    ├── named_as → dénomination et période
    ├── announced_in → BODACC ou JOAFE
    ├── registered_in → RNE, RNA, Sirene ou FINESS
    ├── succeeded_by → successeur
    ├── merged_into → entité absorbante
    ├── filed_accounts_in → dépôt ou publication
    ├── collected_by → organisme collecteur
    ├── allocated_to → bénéficiaire
    └── classified_as → secteur institutionnel daté
```

Une fusion ou succession ne transfère pas automatiquement les créances, affectations ou
classements. Elle déclenche une revue documentée.

## Résultats négatifs à conserver

- Aucun état unique ne fusionne correctement RNE, Sirene et BODACC.
- Le RNA national exclut les associations de droit local d’Alsace-Moselle.
- La correspondance RNA–JOAFE–SIREN reste incomplète pour les organismes anciens.
- Les comptes ouverts ne couvrent pas toutes les entreprises et associations.
- Le NPEC ne fournit pas la contribution acquittée par chaque employeur.
- Siasp et le CAS Pensions ne publient pas les paiements par employeur et composante.
- Les rapports ANCOLS ne contiennent pas les déclarations PEEC individuelles.
- LEI France ne fournit qu’une fenêtre publique de trente jours.

## Ordre d’ingestion recommandé

1. **BODACC**, pour créer une table événementielle générale depuis 2008 ;
2. **RNA et JOAFE**, pour les identités et événements des organismes non lucratifs ;
3. **LEI France**, dont les snapshots doivent être archivés rapidement ;
4. **NPEC apprentissage**, pour versionner RNCP, branches, OPCO et paramètres ;
5. **Siasp**, pour compléter les dénominateurs privés par les rémunérations publiques ;
6. **CAS Pensions**, pour les taux et agrégats par régime et date ;
7. **prototype RNE**, limité aux entités déjà connues ;
8. **manifeste ANCOLS**, avant toute extraction PEEC.

## Règles supplémentaires anti-inférence

1. **Inscription au RNE n’est pas assujettissement fiscal.**
2. **Formalité RNE n’est pas annonce BODACC.**
3. **Annonce BODACC n’est pas état consolidé.**
4. **Avis de dépôt n’est pas compte chiffré.**
5. **Absence de compte ouvert n’est pas absence de dépôt.**
6. **Radiation d’établissement n’est pas disparition certaine de l’entreprise.**
7. **RNA_waldec et RNA_import exigent une provenance distincte.**
8. **Association RNA n’est pas organisme public.**
9. **Utilité publique n’est pas classement S.13.**
10. **Annonce JOAFE n’est pas état courant complet.**
11. **Absence de compte JOAFE n’est pas absence de compte.**
12. **Niveau de prise en charge n’est pas contribution employeur.**
13. **Une version NPEC ne doit pas écraser la précédente.**
14. **RNCP, branche, IDCC et OPCO sont des identifiants distincts.**
15. **Salaire brut Siasp n’est pas assiette de toute cotisation.**
16. **Effectif public n’est pas montant de cotisation.**
17. **La transition DSN doit être datée.**
18. **Le taux CAS Pensions dépend de l’employeur et de la position.**
19. **Retenue agent et contribution employeur sont des flux distincts.**
20. **Masse salariale multipliée par un taux n’est pas recette observée.**
21. **Ressource PEEC n’est pas nécessairement versement courant d’un employeur.**
22. **Prêt ou retour PEEC n’est pas prélèvement.**
23. **LEI n’est pas SIREN.**
24. **LEI valide n’est pas éligibilité fiscale annuelle.**
25. **Fenêtre de publication n’est pas historique.**
26. **Relation d’identité ne transfère pas automatiquement une créance.**
27. **Fusion ne transfère pas automatiquement une affectation.**
28. **Toute identité ou relation doit porter une source et une période.**

## Décision recommandée pour l’issue #36

La prochaine ingestion à plus fort rendement est le **BODACC**. Son API ouverte et ses
archives depuis 2008 permettront de construire une chronologie réutilisable pour presque
tous les redevables et bénéficiaires commerciaux.

Le deuxième chantier doit ingérer conjointement le **RNA et le JOAFE**, très utiles pour
les associations, fondations et fonds de dotation présents parmi les bénéficiaires et
organismes sectoriels.

Le troisième chantier doit archiver immédiatement **LEI France**, car sa fenêtre de trente
jours est courte et la source complète directement le pipeline des 121 émetteurs de la
TTF.

Le RNE doit rester un prototype ciblé avant aspiration générale. L’ANCOLS doit rester en
phase de manifeste jusqu’à validation de ses téléchargements et tableaux.
