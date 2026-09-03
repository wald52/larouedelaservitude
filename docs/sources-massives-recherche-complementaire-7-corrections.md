# Correction de la huitième recherche complémentaire

Date de vérification : **3 septembre 2026**.  
Cette correction s’applique à
[`sources-massives-recherche-complementaire-7.md`](sources-massives-recherche-complementaire-7.md)
et au registre
[`bulk-sources-supplement-7-2026-09-03.json`](../data/reference/bulk-sources-supplement-7-2026-09-03.json).

Le fichier machine-readable qui fait foi en cas de contradiction est
[`bulk-sources-supplement-7-corrections-2026-09-03.json`](../data/reference/bulk-sources-supplement-7-corrections-2026-09-03.json).

## Correction : les jeux Ircantec sont courants

La première rédaction s’appuyait sur le jeu externe
« Effectifs de cotisants à l’Ircantec, par employeurs », dont le catalogue est daté du
9 novembre 2023. Une vérification supplémentaire a identifié deux jeux officiels plus
récents de la Caisse des Dépôts :

- [Actifs et cotisants Ircantec](https://www.data.gouv.fr/datasets/actifs-et-cotisants-ircantec-1),
  mis à jour le **3 juillet 2026**, avec cinq ressources CSV ;
- [Employeurs Ircantec](https://www.data.gouv.fr/datasets/employeurs-ircantec), mis à jour
  le **14 août 2026**, avec deux ressources CSV.

Le jeu Ircantec doit donc être classé :

```text
priority: 2
status: ready_to_ingest
```

et non `support_only`.

## Champ documenté

Le régime couvre notamment :

- les salariés relevant des employeurs du champ Ircantec ;
- les élus des collectivités territoriales ;
- les employeurs de l’État et établissements publics nationaux ;
- les collectivités territoriales, EPCI et établissements publics locaux ;
- les établissements hospitaliers et autres établissements de santé ;
- d’autres employeurs, notamment certains EPIC, sociétés de droit privé, organismes
  publics, GIP, associations et fondations.

Les deux jeux distinguent des notions qui ne doivent pas être fusionnées :

```text
actif
    → personne ayant acquis des droits sans les avoir encore liquidés

cotisant
    → affilié ayant fait l’objet d’une déclaration d’employeur pendant l’année

employeur
    → organisme ou famille d’organismes du champ du régime
```

Un actif peut ne plus cotiser pendant l’année. Un cotisant peut aussi être observé dans
plusieurs relations d’emploi ou périodes selon les conventions du fichier.

## Utilité pour l’audit

Les ressources peuvent fournir en masse :

- les effectifs d’actifs ;
- les effectifs de cotisants ;
- les familles d’employeurs ;
- la répartition entre fonctions publiques et autres employeurs ;
- des séries historiques utiles comme dénominateurs ;
- des noms de catégories à rapprocher des comptes du régime, du PLACSS, de la DREES et de
  l’Insee.

Elles permettent de traiter l’Ircantec comme une source courante de contrôle du champ et
non comme une simple archive historique.

## Limites maintenues

Les jeux ne fournissent pas :

- l’assiette de cotisation par employeur ;
- les taux effectivement appliqués ;
- le montant dû ;
- le montant encaissé ;
- les régularisations ;
- le classement SEC détaillé des employeurs ;
- une correspondance univoque entre population, composante de cotisation et ligne NTL.

Une famille d’employeurs ne constitue ni une créance juridique ni un secteur
institutionnel. Les effectifs ne doivent pas être multipliés par un salaire ou un taux
moyen pour reconstruire une recette.

La page du jeu « Employeurs Ircantec » signale également que certains fichiers ne sont pas
disponibles. Le manifeste d’ingestion doit donc distinguer les ressources annoncées des
ressources effectivement récupérées.

## Ingestion corrigée

Livrable recommandé :

```text
data/reference/ircantec-contributors-employers-manifest.json
```

Étapes :

1. archiver les cinq CSV du jeu actifs-cotisants ;
2. archiver les deux CSV du jeu employeurs ;
3. enregistrer l’identifiant et l’URL de chaque ressource ;
4. conserver la date de mise à jour du jeu et celle du fichier ;
5. profiler les colonnes, millésimes, unités et dimensions ;
6. distinguer actifs, cotisants, employeurs et familles ;
7. signaler les fichiers annoncés mais indisponibles ;
8. rapprocher les agrégats des comptes sociaux sans calcul individuel.

## Lacune reformulée

La lacune n’est plus « absence de source Ircantec courante ». Elle devient :

> Aucun jeu public national identifié ne fournit les assiettes, taux, montants dus et
> paiements Ircantec par employeur et composante de cotisation.

Les jeux courants résolvent donc le dénominateur et le champ institutionnel, mais pas le
produit détaillé du prélèvement.

## Règles anti-inférence corrigées

1. **Actif Ircantec n’est pas nécessairement cotisant de l’année.**
2. **Cotisant n’est pas relation d’emploi unique.**
3. **Famille d’employeurs n’est pas secteur SEC.**
4. **Effectif n’est ni assiette ni recette.**
5. **Jeu courant n’efface pas l’ancien miroir : il le remplace uniquement comme source de
   fraîcheur.**
6. **Ressource annoncée n’est pas ressource récupérée tant que le téléchargement n’a pas été
   vérifié.**

Cette correction doit être appliquée avant fusion ou ingestion des fichiers de la huitième
passe.
