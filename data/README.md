# Jeu de données

Les fichiers `entries-light.json` et `entries-full.json` décrivent la même liste de prélèvements. Le premier alimente rapidement la roue ; le second fournit les détails et les valeurs numériques utilisées dans la vue **Données & analyse**.

## Ce que signifie la version

Le champ `version` identifie une publication technique du jeu de données. Il ne doit pas être interprété comme l'année de référence commune des recettes : les entrées actuelles ne portent pas encore cette information de manière systématique.

## Couverture connue

Le jeu contient 371 entrées, avec de nombreux champs inconnus. Une valeur `null` signifie « non renseignée dans cette publication », et non nécessairement « inexistante » ou « nulle ». Les agrégats de recettes portent uniquement sur les montants connus et ne représentent donc pas la totalité des prélèvements obligatoires français.

## Audit 2026 en cours

La liste utilisée par l'application reste un **brouillon historique**. Elle n'est pas encore une liste exhaustive et juridiquement validée des seuls prélèvements obligatoires actuellement en vigueur.

La première phase de l'audit est conservée séparément afin de pouvoir reprendre le travail sans modifier prématurément les données servies par la roue :

- [`../docs/prelevements-obligatoires-methodologie.md`](../docs/prelevements-obligatoires-methodologie.md) définit le périmètre, les critères d'inclusion et les motifs d'exclusion ;
- [`../docs/audit-prelevements-obligatoires-2026.md`](../docs/audit-prelevements-obligatoires-2026.md) présente les résultats et les limites de la première phase ;
- [`audit/draft-2026-08-05.json`](audit/draft-2026-08-05.json) contient une décision de travail pour chacune des 371 entrées ;
- [`audit/summary-2026-09-01.json`](audit/summary-2026-09-01.json) résume l'état d'avancement ;
- [`audit/reason-codes.json`](audit/reason-codes.json) documente le vocabulaire de décision ;
- [`reference/`](reference/) archive les référentiels officiels et leur provenance utilisés pour les rapprochements.

La reprise ligne par ligne est ensuite publiée par lots autonomes :

- [`audit/financement-social-2026-09-01.json`](audit/financement-social-2026-09-01.json) rassemble cinq fiches canoniques prêtes à relire — CSG, CRDS, C3S, forfait social et taxe sur les salaires ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-financement-social.md`](../docs/audit-prelevements-obligatoires-2026-lot-financement-social.md) documente les choix, corrections et limites de ce premier lot de reprise ;
- [`audit/tva-accises-2026-09-02.json`](audit/tva-accises-2026-09-02.json) rassemble quatre fiches canoniques prêtes à relire — TVA, accises sur les alcools et les tabacs, et contribution sur les boissons non alcooliques ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-tva-accises.md`](../docs/audit-prelevements-obligatoires-2026-lot-tva-accises.md) documente les fusions d'anciens droits, la scission de la ligne mixte « bières et boissons non alcoolisées » et les limites des enveloppes statistiques ;
- [`audit/fiscalite-comportementale-2026-09-02.json`](audit/fiscalite-comportementale-2026-09-02.json) rassemble quatre fiches canoniques prêtes à relire — boissons sucrées, cotisation sur les alcools de plus de 18°, taxe prémix et droit de licence des débitants de tabac ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-fiscalite-comportementale.md`](../docs/audit-prelevements-obligatoires-2026-lot-fiscalite-comportementale.md) documente deux lacunes d'inventaire, les prévisions nulles de la taxe prémix et les limites des enveloppes statistiques « boissons » et « tabacs » ;
- [`audit/retraites-ruptures-2026-09-02.json`](audit/retraites-ruptures-2026-09-02.json) rassemble quatre fiches canoniques prêtes à relire — préretraite, deux contributions employeur sur les retraites à prestations définies et contribution sur les indemnités de rupture ou de mise à la retraite — ainsi que deux candidats encore bloqués : la contribution due par les bénéficiaires de rentes à prestations définies et la cotisation RAVGDT ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-retraites-ruptures.md`](../docs/audit-prelevements-obligatoires-2026-lot-retraites-ruptures.md) documente la scission de la ligne 14, le blocage du classement statistique de la contribution des bénéficiaires, la non-ventilation des enveloppes statistiques et budgétaires, et les preuves encore manquantes pour le RAVGDT ;
- [`audit/epargne-avantages-capital-2026-09-02.json`](audit/epargne-avantages-capital-2026-09-02.json) rassemble une fiche canonique prête à relire pour la contribution patronale sur les options et actions gratuites, une exclusion historique pour l'ancienne contribution PERCO et deux candidats bloqués pour les contributions salariales sur options/actions gratuites et carried interests ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-epargne-avantages-capital.md`](../docs/audit-prelevements-obligatoires-2026-lot-epargne-avantages-capital.md) documente l'abrogation de l'article L. 137-5, la scission de la ligne 16, la ligne NTL directe de la contribution patronale et l'absence de classement SEC explicite pour les créances dues par les bénéficiaires ;
- [`audit/fiscalite-pharmaceutique-2026-09-02.json`](audit/fiscalite-pharmaceutique-2026-09-02.json) rassemble cinq fiches canoniques prêtes à relire — ventes en gros, promotion des médicaments et trois contributions sur le chiffre d'affaires — ainsi que trois candidats bloqués : contribution de sauvegarde au montant M, taxe sur le retard d'entrée des génériques et promotion des dispositifs médicaux ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-fiscalite-pharmaceutique.md`](../docs/audit-prelevements-obligatoires-2026-lot-fiscalite-pharmaceutique.md) documente la correction des années de création, le remplacement du mécanisme Lv/Lh, la scission de la ligne 22 et la non-ventilation des enveloppes statistique et budgétaire ;
- [`audit/dispositifs-medicaux-2026-09-02.json`](audit/dispositifs-medicaux-2026-09-02.json) documente deux contributions actives absentes du brouillon — promotion des dispositifs médicaux et sauvegarde fondée sur le montant Z — ainsi qu'une ancienne contribution de première vente abrogée depuis 2021 ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-dispositifs-medicaux.md`](../docs/audit-prelevements-obligatoires-2026-lot-dispositifs-medicaux.md) explique le blocage statistique des deux contributions actives, distingue le seuil Z d'une recette et conserve l'ancien article L. 245-5-5-1 comme fiche historique ;
- [`audit/logement-sante-autonomie-2026-09-02.json`](audit/logement-sante-autonomie-2026-09-02.json) rassemble trois fiches canoniques prêtes à relire — FNAL, taxe de solidarité additionnelle et contribution employeur de solidarité pour l'autonomie — ainsi que trois candidats bloqués : CASA, contribution permanente des organismes complémentaires au financement des médecins et contribution temporaire 2026 ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-logement-sante-autonomie.md`](../docs/audit-prelevements-obligatoires-2026-lot-logement-sante-autonomie.md) documente la fusion de la fraction de TSA, la séparation entre CSA et CASA et la non-ventilation de l'enveloppe budgétaire des organismes complémentaires ;
- [`audit/plaidoirie-cvec-2026-09-02.json`](audit/plaidoirie-cvec-2026-09-02.json) rassemble une fiche canonique prête à relire pour les droits de plaidoirie et la contribution équivalente de la CNBF, ainsi qu'un candidat CVEC encore bloqué faute de classement SEC et de traitement institutionnel explicites ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-plaidoirie-cvec.md`](../docs/audit-prelevements-obligatoires-2026-lot-plaidoirie-cvec.md) documente le classement des droits de plaidoirie en cotisations sociales obligatoires, l'exclusion du montant non daté de 9,8 M€, la séparation du produit administratif de la CVEC et la non-attribution des lignes NTL résiduelles ;
- [`audit/cnbf-cotisations-base-2026-09-02.json`](audit/cnbf-cotisations-base-2026-09-02.json) ajoute deux fiches canoniques prêtes à relire, absentes du brouillon — cotisation forfaitaire et cotisation proportionnelle du régime vieillesse de base de la CNBF — et conserve le produit comptable du régime comme enveloppe administrative non ventilée ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-cnbf-cotisations-base.md`](../docs/audit-prelevements-obligatoires-2026-lot-cnbf-cotisations-base.md) documente les barèmes 2026, les profils SEC employeur, salarié et indépendant, l'absence de dates de création certaines et l'addendum de produit administratif aux droits de plaidoirie ;
- [`audit/cnbf-complementaire-invalidite-2026-09-02.json`](audit/cnbf-complementaire-invalidite-2026-09-02.json) ajoute deux fiches canoniques prêtes à relire, absentes du brouillon — cotisation au régime complémentaire obligatoire à points et cotisation invalidité-décès des avocats non salariés — avec leurs produits administratifs séparés des comptes nationaux ;
- [`../docs/audit-prelevements-obligatoires-2026-lot-cnbf-complementaire-invalidite.md`](../docs/audit-prelevements-obligatoires-2026-lot-cnbf-complementaire-invalidite.md) documente les classes C1, C2 et C2+, les profils employeur, salarié, indépendant et conjoint collaborateur, les composantes avocat et CARPA de l'invalidité-décès, ainsi que les limites sur la date d'origine et le reroutage statistique.

Ces fichiers d'audit ne sont pas consommés par l'application et ne remplacent pas `entries-full.json`. Une entrée ne devra rejoindre le futur référentiel canonique qu'après vérification de son existence juridique, de son appartenance au périmètre des prélèvements obligatoires, de son statut en vigueur et de ses sources datées.

## Provenance à ajouter

Toute nouvelle collecte devrait conserver, pour chaque entrée, au minimum :

```json
{
  "source_url": "https://…",
  "source_titre": "…",
  "source_date": "2026-08-01",
  "recette_annee": 2025,
  "date_verification": "2026-08-05",
  "statut": "actif",
  "notes": "…"
}
```

Ces champs ne sont pas encore obligatoires afin de ne pas inventer une provenance absente des données historiques. Ils devront devenir requis lorsque la reprise documentaire aura été effectuée.

## Règles de modification

1. Modifier d'abord `entries-full.json`.
2. Conserver des identifiants uniques et stables.
3. Reporter exactement les mêmes identifiants et noms courts dans `entries-light.json`.
4. Mettre à jour la même valeur `version` dans les deux fichiers.
5. Exécuter `npm run check:data`.
6. Exécuter `npm run stamp` et committer les fichiers réécrits, car les données font partie de l'instantané hors ligne.
7. Vérifier manuellement les unités, les accords (« million »/« millions »), les années de référence et les liens de source.
