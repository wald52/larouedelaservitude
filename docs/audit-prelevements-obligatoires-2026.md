# Audit du brouillon des prélèvements obligatoires — 1er septembre 2026

> Ce document décrit la première tranche de l’issue #36. La liste en production reste un brouillon tant que les décisions bloquées ne sont pas résolues.

## Résultat quantifié

- Entrées examinées : **371 / 371**.
- Appartenances au périmètre déjà suffisamment prouvées : **46**.
- Fiches entièrement prêtes à publier avec provenance de recette : **0**.
- Entrées exclues comme unités autonomes : **14**.
- Entrées marquées abrogées ou remplacées : **39**.
- Entrées à fusionner ou éclater : **105**.
- Entrées dont la qualification reste non résolue : **251**.

Les catégories se recoupent : par exemple un ancien prélèvement remplacé est aussi bloqué, et un doublon peut décrire un prélèvement réel.

## Ce qui est prouvé dans ce lot

- La définition et le test cumulatif sont fixés à partir de l’Insee et de la méthodologie SEC 2010.
- La feuille française de la National Tax List 2026 est archivée sous forme JSON avec ses 141 sous-lignes et ses recettes 1995-2024.
- Le tableau des principales impositions affectées à la sécurité sociale de l’annexe 3 est transcrit dans un fichier séparé.
- Chaque entrée du brouillon reçoit une décision, des codes de motif, des preuves éventuelles et des correspondances de recherche non probantes.
- Le validateur interdit qu’une appartenance soit déclarée `ready` sans preuve officielle de classification et de vigueur.

## Appartenances déjà confirmées (fiches encore bloquées)

- `#13` **Contribution sur les avantages de préretraite d'entreprise** → `contribution-preretraite`
- `#14` **Contribution sur les régimes de retraite conditionnant la constitution de droits à prestations à l'achèvement de la carrière du bénéficiaire dans l'entreprise** → `contribution-retraites-prestations-definies`
- `#15` **Contribution sur les indemnités de mise à la retraite** → `contribution-indemnites-retraite`
- `#17` **Forfait social** → `forfait-social`
- `#19` **Contribution vente en gros** → `contribution-pharma-ventes-gros`
- `#21` **Contribution sur les dépenses de promotion des médicaments** → `contribution-pharma-publicite-medicaments`
- `#23` **Cotisation spéciale sur les boissons alcooliques** → `cotisation-alcools-plus-18`
- `#27` **Contribution sociale de solidarité des sociétés (C3S)** → `c3s`
- `#99` **Taxe sur les salaires** → `taxe-salaires`
- `#106` **Taxe sur la valeur ajoutée (TVA)** → `tva`
- `#107` **Taxe sur les services numériques** → `taxe-services-numeriques`
- `#123` **Droit de consommation sur les produits intermédiaires** → `droit-consommation-produits-intermediaires`
- `#124` **Droits de consommation sur les alcools** → `droit-consommation-alcools`
- `#125` **Droit de circulation sur les vins, cidres, poirés et hydromels** → `droit-circulation-vins-cidres-hydromels`
- `#127` **Droit de consommation sur les tabacs manufacturés** → `droit-consommation-tabacs`
- `#134` **Taxe spéciale sur les conventions d'assurances** → `tsca`
- `#140` **Taxe foncière sur les propriétés bâties (IF-TFB)** → `taxe-fonciere-proprietes-baties`
- `#141` **Taxe foncière sur les propriétés non bâties (IF-TFNB)** → `taxe-fonciere-proprietes-non-baties`
- `#144` **Cotisation foncière des entreprises (IF-CFE)** → `cotisation-fonciere-entreprises`
- `#146` **Imposition forfaitaire sur les pylônes (TFP-PYL)** → `imposition-forfaitaire-pylones`
- `#156` **Taxe pour la gestion des milieux aquatiques et la prévention des inondations** → `taxe-gemapi`
- `#164` **Taxe départementale additionnelle aux droits d'enregistrement ou à la taxe de publicité foncière exigible sur les mutations à titre onéreux** → `taxe-departementale-additionnelle-droits-enregistrement`
- `#173` **Taxe pour frais de chambres de commerce et d'industrie (IF-AUT-10)** → `taxe-additionnelle-cfe-cci`
- `#174` **Contribution sociale généralisée (CSG)** → `csg`
- `#176` **Contribution pour le remboursement de la dette sociale (CRDS)** → `crds`
- `#178` **Taxe pour frais de chambres de métiers et de l'artisanat (IF-AUT-20)** → `taxe-additionnelle-cfe-chambres-metiers`
- `#180` **Taxe pour frais de chambres d'agriculture (IF-AUT-30)** → `taxe-additionnelle-tfnb-chambres-agriculture`
- `#197` **Taxe sur les boissons prémix** → `taxe-premix`
- `#198` **Contribution perçue sur les boissons et préparations liquides destinées à la consommation humaine contenant des édulcorants de synthèse et ne contenant pas de sucres ajoutés** → `contribution-boissons-edulcorees`
- `#209` **Imposition forfaitaire sur les entreprises de réseaux (TFP-IFER)** → `ifer`
- `#247` **Taxe sur les surfaces commerciales (TFP-TSC)** → `tascom`
- `#257` **Contribution tarifaire d'acheminement (CTA)** → `contribution-tarifaire-acheminement`
- `#299` **Taxe fixe due à chaque délivrance de CI (AIS-MOB-10-20-20)** → `taxe-fixe-certificat-immatriculation`
- `#302` **Taxe sur les émissions de dioxyde de carbone** → `taxe-emissions-co2-immatriculation`
- `#303` **Taxe sur la masse en ordre de marche** → `taxe-masse-ordre-marche`
- `#304` **Taxe annuelle sur les émissions de dioxyde de carbone** → `taxe-annuelle-emissions-co2-fins-economiques`
- `#305` **Taxe annuelle sur les émissions de polluants atmosphérique** → `taxe-annuelle-polluants-fins-economiques`
- `#306` **Taxe sur l'affectation des véhicules lourds de transport de marchandises (AIS-MOB-10-30-30)** → `taxe-annuelle-vehicules-lourds-marchandises`
- `#311` **Taxe sur l'exploitation des infrastructures de transport de longue distance (AIS-MOB-50)** → `taxe-infrastructures-transport-longue-distance`
- `#312` **Taxe sur les services de communications électroniques (AIS-CCN-30-10)** → `taxe-services-communications-electroniques`
- `#318` **Cotisation sur la valeur ajoutée des entreprises (CVAE)** → `cvae`
- `#344` **Contribution solidarité autonomie** → `contribution-solidarite-autonomie`
- `#345` **Assurance maladie - maternité - invalidité - décès** → `cotisation-maladie-maternite-invalidite-deces`
- `#348` **Allocations familiales** → `cotisation-allocations-familiales`
- `#349` **Accidents du travail** → `cotisation-accidents-travail-maladies-professionnelles`
- `#353` **Fonds national de garantie des salaires (AGS)** → `cotisation-ags`

## Exclusions certaines ou structurelles

- `#9` **Redevance pour la rémunération pour copie privée** — La rémunération pour copie privée indemnise des titulaires de droits privés ; aucun reroutage vers S.13/S.212 n'est documenté.
- `#11` **Redevance perçue sur formalités de l'Institut national de la propriété industrielle** — Le libellé décrit la rémunération de formalités de l'INPI, donc une prestation individualisable, sauf preuve statistique contraire.
- `#28` **Droit départemental de passage sur les ouvrages d'art reliant le continent aux îles maritimes** — Un péage rémunère directement l’usage d’un ouvrage.
- `#33` **Contribution forfaitaire représentative des frais de réacheminement** — Remboursement de frais de rapatriement individualisables.
- `#34` **Redevance perçue à l'occasion de l'introduction des familles étrangères en France** — Redevance liée à une procédure administrative individualisée.
- `#45` **Fraction des produits annuels de la vente de biens confisqués** — Produit de cession de biens confisqués, et non prélèvement sur un redevable.
- `#71` **Péage plaisance** — Péage portuaire lié à l’usage d’un équipement.
- `#207` **Droit d'examen du permis de chasse** — Droit d'inscription à un examen individualisé, distinct de la redevance cynégétique.
- `#234` **Redevance pour frais d'envoi des certificats d'immatriculation des véhicules** — Frais d’envoi individualisables du certificat d’immatriculation : ils rémunèrent directement l’acheminement du titre, distinct de la taxe fixe sur sa délivrance.
- `#255` **Fraction du produit des successions en déshérence** — Produit d'une succession en déshérence, pas un impôt successoral.
- `#271` **Redevances lors du lancement de certains matériels aéronautiques** — Droits dus à l'occasion d'autorisations et prestations individualisées de lancement.
- `#292` **Redevance pour droit de construire (EPAD)** — Droit de construire dans une opération d'aménagement : recette foncière/domaniale, pas prélèvement fiscal identifié.
- `#341` **Taxe d'atterrissage** — Redevance d’atterrissage rémunérant l’usage de l’aérodrome.
- `#363` **assurance décès cadre (adhésion obligatoire pour les cadres quel que soit le secteur d'activité)** — Prime d'assurance décès conventionnelle des cadres, sans preuve de réception ou reroutage par S.13.

## Principaux remplacements et abrogations

- `#3` **Taxe à la production sur le quota de sucre, le quota d'isoglucose et le quota de sirop d'inuline** — `repealed`. Le régime européen des quotas sucriers auquel ce prélèvement se rattache est historique ; une source juridique d’abrogation doit encore être jointe.
- `#43` **Participation pour voirie et réseaux** — `repealed` → `taxe-amenagement`. La participation pour voirie et réseaux ne peut plus être instaurée ; ne pas la publier comme prélèvement actuel.
- `#51` **Droit de francisation et de navigation en Corse, Droit de passeport en Corse** — `replaced` → `taxes-navigation-maritime`. Ancien droit de francisation/navigation recodifié et remplacé dans le CIBS.
- `#52` **Droit de francisation et de navigation** — `replaced` → `taxes-navigation-maritime`. Ancien droit de francisation/navigation recodifié et remplacé dans le CIBS.
- `#53` **Droit de passeport** — `replaced` → `taxes-navigation-maritime`. Ancien droit de passeport remplacé par les taxes actuelles sur les engins maritimes.
- `#54` **Taxe intérieure de consommation sur les produits énergétiques (TICPE)** — `replaced` → `accise-produits-energetiques`. Libellé TICPE historique ; employer la dénomination et la structure actuelles du CIBS.
- `#55` **Contribution au service public de l'électricité (CSPE)** — `replaced` → `accise-electricite`. La CSPE n’est plus une imposition autonome sous ce nom ; rapprocher de l’accise sur l’électricité.
- `#59` **Taxe intérieure sur les houilles, les lignites et les cokes (TICHLC)** — `replaced` → `accise-charbons`. Libellé historique de l’accise sur les charbons.
- `#62` **Taxe spéciale sur certains véhicules routiers** — `replaced` → `taxe-annuelle-vehicules-lourds-marchandises`. La taxe spéciale sur certains véhicules routiers a été remplacée par la taxe CIBS actuelle.
- `#83` **Participation au financement des congés individuels de formation des salariés sous contrats à durée déterminée CIF-CDD** — `replaced` → `contribution-cpf-cdd`. Le libellé CIF-CDD est historique ; la contribution actuelle est la contribution CPF-CDD.
- `#86` **Taxe dans le domaine funéraire** — `repealed`. Taxe communale sur les convois, inhumations et crémations supprimée ; conserver uniquement en historique.
- `#89` **Versement transport** — `replaced` → `versement-mobilite`. Le versement transport est devenu versement mobilité.
- `#109` **Taxe de l'aviation civile (TAC)** — `replaced` → `taxes-transport-aerien`. La taxe de l’aviation civile historique est intégrée à la structure actuelle du CIBS.
- `#136` **Taxe sur les véhicules de sociétés (TVS)** — `replaced` → `taxes-annuelles-vehicules-fins-economiques`. La taxe sur les véhicules de sociétés est remplacée depuis 2024 par deux taxes annuelles.
- `#137` **Taxe sur les véhicules de tourisme les plus polluants** — `replaced` → `taxe-emissions-co2-immatriculation`. Ancienne présentation du malus, à rapprocher de la taxe CIBS actuelle.
- `#138` **Malus (ou « écopastille »)** — `replaced` → `taxe-emissions-co2-immatriculation`. Ancienne présentation du malus, à rapprocher de la taxe CIBS actuelle.
- `#139` **Malus annuel** — `replaced` → `taxe-masse-ordre-marche`. Ancienne taxe poids/malus masse, à rapprocher de la taxe CIBS actuelle.
- `#175` **Prélèvement social sur les revenus du patrimoine et les produits de placements** — `replaced` → `prelevement-solidarite-revenus-capital`. Ancien prélèvement social sur les revenus du patrimoine et de placement.
- `#177` **Prélèvement de solidarité de 2 % sur les revenus du patrimoine et les produits de placements** — `replaced` → `prelevement-solidarite-revenus-capital`. Ancienne contribution additionnelle de 2 %, remplacée par le prélèvement de solidarité actuel.
- `#182` **Contribution à l'audiovisuel public due par les professionnels (TFP-CAP)** — `repealed`. Contribution à l’audiovisuel public supprimée en 2022.
- `#208` **Droits affectés au fonds d'indemnisation de la profession d'avoués près les cours d'appel** — `repealed`. Droit temporaire destiné à indemniser la suppression de la profession d’avoué.
- `#210` **Taxe communale sur la consommation finale d'électricité (TCFE)** — `replaced` → `accise-electricite`. Les taxes locales sur la consommation finale d’électricité ont été intégrées à l’accise sur l’électricité.
- `#211` **Taxe départementale des espaces naturels sensibles (TDENS)** — `replaced` → `taxe-amenagement`. La taxe départementale des espaces naturels sensibles a été intégrée à la taxe d’aménagement.
- `#245` **Prélèvements sur les bénéfices tirés de la construction immobilière** — `repealed`. Prélèvement historique sur les profits de construction ; aucune vigueur actuelle établie.
- `#246` **Participation des employeurs au financement de la formation professionnelle continue, versée à l'État** — `replaced` → `contribution-formation-professionnelle`. Ancien dispositif de participation à la formation professionnelle.
- `#249` **Taxe exceptionnelle sur la réserve de capitalisation des entreprises d'assurance (TFP-ASSUR)** — `repealed`. Contribution exceptionnelle et temporaire, non actuelle.
- `#254` **Taxe professionnelle de la Poste et de France Telecom** — `repealed`. Imposition spécifique historique liée à la réforme de la taxe professionnelle.
- `#263` **Droits d'apport des sociétés** — `repealed`. Droit d’apport ancien ; aucune vigueur actuelle établie.
- `#266` **Contributions au Fonds national de l'emploi (FNE)** — `repealed`. Contributions historiques au Fonds national de l’emploi.
- `#268` **Contribution des institutions financières** — `repealed`. Contribution historique des institutions financières.
- `#273` **Taxe sur les stations et liaisons radio privées** — `repealed`. Taxe historique sur la publicité radiodiffusée.
- `#276` **Participation dépassement du COS** — `replaced` → `taxe-amenagement`. Ancienne participation d’urbanisme remplacée par le régime actuel de taxe d’aménagement.
- `#277` **Taxe locale d'équipement** — `replaced` → `taxe-amenagement`. Taxe locale d’équipement remplacée par la taxe d’aménagement.
- `#278` **Taxe complémentaire à la TLE (IdF)** — `replaced` → `taxe-amenagement`. Taxe locale d’équipement en Île-de-France remplacée par la taxe d’aménagement.
- `#286` **Taxe sur les fournitures d'électricité** — `replaced` → `accise-electricite`. Taxe sur les fournitures d’électricité intégrée à l’accise actuelle.
- `#291` **Taxe sur les syndicats d'énergie** — `replaced` → `accise-electricite`. Ancienne taxe syndicale liée à l’électricité ; rapprocher du régime actuel.
- `#293` **Taxe et prélèvement sur les sommes encaissées par les sociétés de télévision au titre de la redevance, de la diffusion des messages publicitaires et des abonnements** — `repealed`. Prélèvement historique lié à la redevance audiovisuelle.
- `#338` **Eco-contribution sur la taxe de solidarité sur les billets d'avion** — `replaced` → `taxe-transport-aerien-passagers`. « Éco-contribution » est une ancienne présentation de la taxe de solidarité sur les billets d’avion. Le CIBS la porte désormais comme tarif de solidarité de la taxe sur le transport aérien de passagers.
- `#339` **Taxe d'aéroport** — `replaced` → `taxe-transport-aerien-passagers`. L’ancienne taxe d’aéroport a été recodifiée dans la taxe sur le transport aérien de passagers, notamment sous les tarifs de sûreté et de sécurité et de péréquation aéroportuaire.

## Prochaine tranche de recherche

La priorité est désormais de résoudre les familles où la loi impose un paiement à un organisme privé ou professionnel : assurance chômage, retraites complémentaires, APEC, CVO et contributions professionnelles. Le caractère obligatoire ne suffit pas ; il faut établir le secteur institutionnel du bénéficiaire ou le reroutage dans les comptes nationaux.

Ensuite, les agrégats CIBS, les taxes spéciales d’équipement, les impositions sectorielles affectées et les spécificités ultramarines doivent être redécoupés article par article.

La commande `npm run audit:data` produit le décompte à jour et les listes bloquantes.
