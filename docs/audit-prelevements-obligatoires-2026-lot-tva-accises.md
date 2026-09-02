# Audit des prélèvements obligatoires 2026 — lot TVA et accises

**Date de vérification : 2 septembre 2026**  
**Branche de travail : `audit/tva-accises-2026-09-02`**  
**Données de production modifiées : non**

Ce deuxième lot poursuit la reprise documentaire engagée avec le lot « financement social ». Il transforme sept lignes du brouillon historique en quatre unités canoniques fondées sur le droit en vigueur au 1er septembre 2026 :

- la taxe sur la valeur ajoutée ;
- l'accise sur les alcools ;
- l'accise sur les tabacs ;
- la contribution sur les boissons autres que les boissons alcooliques.

La fiche structurée correspondante est publiée dans [`data/audit/tva-accises-2026-09-02.json`](../data/audit/tva-accises-2026-09-02.json). Elle ne modifie ni `entries-full.json` ni `entries-light.json`.

## Résultat du lot

| Fiche canonique | Lignes du brouillon | Base juridique au 1er septembre 2026 | Recette observée | Informations 2026 | Décision |
|---|---:|---|---:|---:|---|
| TVA | 106 | CGI, articles 256-0 à 298 octodecies | 206 332 M€ en 2024 | 54 820 M€ de TVA nette affectée à la sécurité sociale, pas un total national | conserver |
| Accise sur les alcools | 123, 124, 125 et partie « bières » de 126 | CIBS, articles L. 313-1 à L. 313-45 | aucune recette directement attribuable ; enveloppe « taxes sur les boissons » de 4 749 M€ en 2024 | composantes de 54, 2 173, 98 et 1 081 M€, non additionnées | fusionner |
| Accise sur les tabacs | 127 | CIBS, articles L. 314-1 à L. 314-37 | 13 606 M€ en 2024 | prévision de 11 423 M€ | remplacer l'ancien libellé |
| Contribution sur les boissons non alcooliques | partie « boissons non alcoolisées » de 126 et 198 | CGI, article 1613 quater | aucune recette directement attribuable ; enveloppe « taxes sur les boissons » de 4 749 M€ en 2024 | deux composantes de 92 et 70 M€, non additionnées | scinder puis fusionner |

Les quatre fiches sont prêtes à relire. Les valeurs inconnues restent `null` ou sont absentes des séries canoniques ; aucune estimation n'est produite pour combler les lacunes.

## Corrections apportées à la première phase

### 1. Les anciens droits sur les boissons alcooliques ne sont plus quatre prélèvements autonomes

La table de concordance de l'article 4 de l'ordonnance n° 2021-1843 qualifie les anciens droits sur les vins, les produits intermédiaires, les alcools et les bières de **fractions de l'accise sur les alcools** mentionnée à l'article L. 313-1 du CIBS.

Les lignes 123, 124 et 125 doivent donc être fusionnées. La partie « bières » de la ligne 126 les rejoint. L'article L. 313-15 confirme que les bières, les vins, les autres boissons fermentées, les produits intermédiaires et les alcools sont des catégories fiscales d'une même accise.

La date 2022 est conservée comme début de la forme juridique canonique actuelle, mais elle n'est pas présentée comme l'origine historique unique de toutes ses fractions.

### 2. La ligne 126 doit être scindée

Le brouillon réunit « les bières et les boissons non alcoolisées ». Ce libellé ne correspond plus à une seule unité juridique :

- les bières relèvent de l'accise sur les alcools ;
- les boissons autres que les boissons alcooliques relèvent de l'article 1613 quater du CGI.

La ligne 126 est donc scindée entre deux fiches canoniques.

### 3. La ligne 198 n'est plus une fiche autonome

La ligne 198 décrit l'ancienne contribution sur les boissons contenant des édulcorants de synthèse. Depuis le 1er janvier 2026, l'article 1613 quater institue une contribution unique comportant notamment :

- un montant général sur certaines eaux et boissons conditionnées ;
- un montant sur les produits contenant des édulcorants de synthèse.

La ligne 198 est ainsi fusionnée avec la partie non alcoolique de la ligne 126. Les prévisions de 92 M€ et 70 M€ sont conservées comme deux composantes, et non comme deux prélèvements ou comme un total observé.

### 4. Le « droit de consommation sur les tabacs manufacturés » est une ancienne dénomination

L'article 4 de l'ordonnance n° 2021-1843 rattache l'ancien article 575 du CGI à la fraction métropolitaine de l'**accise sur les tabacs**. La fiche canonique reprend donc la dénomination et les articles L. 314-1 à L. 314-37 du CIBS.

L'annexe 3 du PLFSS 2026 emploie encore l'ancien libellé et l'ancienne référence. Cette divergence est conservée dans la provenance de la prévision, sans contaminer la base juridique courante.

### 5. La TVA reste dans le CGI jusqu'au 1er janvier 2027

Au 1er septembre 2026, le chapitre premier du titre II du CGI demeure la base juridique en vigueur de la TVA. L'article 49 consolidé de l'ordonnance n° 2025-1247, après sa modification du 27 juillet 2026, fixe l'entrée en vigueur générale de la recodification au 1er janvier 2027.

La future codification dans le CIBS est documentée comme contexte juridique à venir ; elle n'est pas utilisée comme droit positif de la fiche datée du 2 septembre 2026.

## Traitement des recettes

### Valeurs observées

La National tax list 2026 fournit des montants de comptabilité nationale pour 2024 :

- TVA : 206 332 M€ ;
- taxes sur les boissons : 4 749 M€ ;
- taxes sur les tabacs : 13 606 M€.

La ligne « taxes sur les boissons » couvre plusieurs prélèvements. Elle sert à confirmer la classification statistique, mais son montant n'est attribué ni à l'accise sur les alcools ni à la contribution sur les boissons non alcooliques.

### Prévisions 2026

L'annexe 3 du PLFSS 2026 fournit des lignes plus détaillées. Elles sont enregistrées comme prévisions et restent séparées des recettes observées.

Pour l'accise sur les alcools, les quatre lignes documentées sont :

| Composante | Prévision 2026 |
|---|---:|
| Produits intermédiaires | 54 M€ |
| Alcools | 2 173 M€ |
| Vins, poirés, cidres et hydromels | 98 M€ |
| Bières | 1 081 M€ |

Pour la contribution de l'article 1613 quater :

| Composante | Prévision 2026 |
|---|---:|
| Tarif général sur certaines boissons non alcooliques | 92 M€ |
| Tarif sur les produits contenant des édulcorants de synthèse | 70 M€ |

Ces composantes ne sont pas additionnées dans les fiches. Une somme arithmétique ne prouverait ni l'exhaustivité des lignes ni leur stricte correspondance avec la granularité juridique actuelle.

Pour la TVA, les 54 820 M€ indiqués par l'annexe correspondent uniquement à la TVA nette affectée à la sécurité sociale. Ils ne remplacent pas le total national observé.

## Valeurs du brouillon écartées

Les valeurs suivantes ne sont pas reprises comme recettes canoniques, faute d'année de référence dans le brouillon :

- TVA : 141 200 M€ ;
- produits intermédiaires : 104,7 M€ ;
- vins, cidres, poirés et hydromels : 122,2 M€ ;
- boissons avec édulcorants : 58,4 M€.

Elles restent visibles dans le brouillon historique et sont mentionnées dans les corrections des fiches, mais elles ne sont pas utilisées pour calculer ou remplacer une recette datée.

## Contrôle de complétude du secteur

Trois unités voisines ont été repérées mais laissées à un lot ultérieur afin de ne pas élargir artificiellement le périmètre :

- la contribution sur les boissons sucrées de l'article 1613 ter du CGI, présente dans l'annexe 3 mais sans ligne autonome retrouvée dans le brouillon ;
- la taxe sur les boissons dites « prémix » de la ligne 197 ;
- la cotisation sur les alcools de plus de 18° de la ligne 23, distincte de l'accise sur les alcools.

Ce contrôle évite de confondre la reprise des anciennes fractions d'accise avec l'ensemble des prélèvements sanitaires ou sociaux portant sur les boissons.

## Garde-fous appliqués

1. Une ancienne dénomination ou une fraction n'est pas publiée comme prélèvement autonome.
2. Une ligne statistique agrégée n'est pas distribuée entre ses composantes sans source.
3. Une prévision n'est pas présentée comme une recette observée.
4. Deux composantes tarifaires d'un même article ne deviennent pas deux fiches.
5. Les montants sans année restent exclus des séries canoniques.
6. Le droit positif est daté ; une recodification future n'est pas anticipée.
7. Les données servies par l'application restent inchangées.
