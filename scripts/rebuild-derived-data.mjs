#!/usr/bin/env node
// ===============================
//  rebuild-derived-data.mjs — Régénère les champs dérivés des données
// ===============================
//
// Deux champs sont *dérivés* et ne doivent pas être édités à la main :
//
//   - data/entries-full.json  → `recette_meur` : la valeur numérique extraite
//     de la chaîne `recette` (en millions d'euros). `recette` reste la source
//     de vérité rédactionnelle.
//   - data/entries-light.json → `nom` : le libellé court affiché sur la roue,
//     dérivé du `nom_complet` du fichier complet.
//
// Le script est idempotent : il lit les champs sources (`recette`,
// `nom_complet`) et réécrit uniquement les champs dérivés. Il ne crée ni ne
// supprime jamais d'entrée, et préserve l'ordre et les `id`.
//
// À ne pas confondre avec scripts/convert-entries.mjs, qui est du legacy et
// reconstruit les deux fichiers depuis une source qui n'existe plus.
//
// Usage :
//   node scripts/rebuild-derived-data.mjs           # écrit les fichiers
//   node scripts/rebuild-derived-data.mjs --check   # signale sans écrire

import { readFileSync, writeFileSync } from 'node:fs';

const LIGHT_PATH = 'data/entries-light.json';
const FULL_PATH = 'data/entries-full.json';

// Budget de caractères d'un libellé court. buildLabelLayer() (js/app.js)
// retronque de toute façon selon la largeur mesurée du secteur : ce budget
// sert seulement à garder les libellés lisibles et à borner le poids du
// fichier léger.
const MAX_LABEL_LENGTH = 30;

const checkOnly = process.argv.includes('--check');

// ===============================
//  Recette : chaîne → nombre
// ===============================

// Toutes les recettes du corpus suivent le même motif, en millions d'euros.
const RECETTE_PATTERN = /^([\d  ]+(?:,\d+)?) millions d'euros$/;

function parseRecette(recette, id) {
  if (recette === null || recette === undefined || recette === '') return null;

  const match = String(recette).trim().match(RECETTE_PATTERN);
  if (!match) {
    throw new Error(`Format de recette non reconnu pour "${id}" : ${JSON.stringify(recette)}`);
  }

  const value = Number(match[1].replace(/[  ]/g, '').replace(',', '.'));
  if (!Number.isFinite(value)) {
    throw new Error(`Recette non numérique pour "${id}" : ${JSON.stringify(recette)}`);
  }

  return value;
}

// ===============================
//  Libellés courts
// ===============================

// Abréviations du vocabulaire fiscal récurrent. Appliquées dans l'ordre :
// les plus longues d'abord, pour que "Taxe spéciale d'équipement" l'emporte
// sur "Taxe".
const ABBREVIATIONS = [
  [/^Taxe spéciale d'équipement\b/i, 'TSE'],
  [/^Imposition forfaitaire sur les entreprises de réseaux\b/i, 'IFER'],
  [/^Taxe pour le développement\b/i, 'Dév.'],
  [/^Taxe pour frais de\b/i, 'Frais de'],
  [/^Taxe additionnelle\b/i, 'Taxe add.'],
  [/^Retraite complémentaire\b/i, 'Retr. compl.'],
  [/^Taxe sur la valeur ajoutée\b/i, 'TVA'],
  [/^Contribution sociale généralisée\b/i, 'CSG'],
  [/^Participation au financement\b/i, 'Financement'],
  [/^Participation des employeurs\b/i, 'Particip. employeurs'],
  [/^Contribution\b/i, 'Contrib.'],
  [/^Contributions\b/i, 'Contrib.'],
  [/^Participation\b/i, 'Particip.'],
  [/^Prélèvements?\b/i, 'Prélèv.'],
  [/^Cotisation additionnelle\b/i, 'Cotis. add.'],
  [/^Cotisations?\b/i, 'Cotis.'],
  [/^Redevances?\b/i, 'Redev.']
];

// Segments de liaison qui n'apportent aucune information distinctive et
// mangent le budget de caractères.
const FILLERS = [
  /\bau profit (?:de la|de l'|des|du|de)\s*/gi,
  /\bperçue? au profit (?:de la|de l'|des|du|de)\s*/gi,
  /\bdestinée? (?:à|au|aux)\s*/gi,
  /\brelative? (?:à la|à l'|aux|au|à)\s*/gi,
  /\bainsi que (?:les|le|la|des|du|de la|de l')\s*/gi,
  /\bregroupant (?:les|le|la)\s*/gi,
  /\bdans les métiers (?:de la|de l'|des|du|de)\s*/gi,
  /\bde la zone dite\s*/gi
];

// Abréviations applicables n'importe où dans le libellé.
const INLINE_ABBREVIATIONS = [
  [/\bétablissements? publics? fonciers?(?: et d'aménagement)?\b/gi, 'EPF'],
  [/\bétablissements? publics? locaux?\b/gi, 'ét. public local'],
  [/\bétablissements? publics?\b/gi, 'ét. public'],
  [/\bformation professionnelle\b/gi, 'formation pro.'],
  [/\bprofessionnelle\b/gi, 'pro.'],
  [/\bSécurité sociale\b/gi, 'Sécu'],
  [/\bindustries? (?:de la|de l'|des|du|de)\s*/gi, 'ind. '],
  [/\bindustries?\b/gi, 'ind.'],
  [/\bpropriétés? non bâties?\b/gi, 'prop. non bâties'],
  [/\bpropriétés? bâties?\b/gi, 'prop. bâties'],
  [/\bdépartementale?\b/gi, 'dép.'],
  [/\bAssurance vieillesse\b/gi, 'Assur. vieillesse']
];

function normalize(text) {
  return String(text)
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*$/, '')
    .trim();
}

// Retire les codes techniques entre parenthèses en fin de nom
// (ex. "(IF-AUT-80)", "(TFP-TASC)") — ils ne parlent pas à l'utilisateur.
function stripTechnicalCode(text) {
  const stripped = text.replace(/\s*\([A-Z0-9][A-Z0-9\-.\s]*\)\s*$/, '').trim();
  // Quelques entrées n'ont *que* leur code pour tout nom (ex. "(TFP-TFSCT)") :
  // mieux vaut un code qu'un libellé vide.
  return stripped || text.trim();
}

function applyRules(text, rules) {
  let result = text;
  for (const [pattern, replacement] of rules) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s+/g, ' ').trim();
}

function stripFillers(text) {
  let result = text;
  for (const pattern of FILLERS) {
    result = result.replace(pattern, '');
  }
  return result.replace(/\s+/g, ' ').trim();
}

// Mots de liaison qui n'ont aucun sens en fin de libellé : une coupe qui
// laisse "Taxe installations nucléaires de" doit rendre "Taxe installations
// nucléaires".
const TRAILING_STOPWORDS =
  /(?:\s+(?:de|du|des|d'|la|le|les|l'|à|au|aux|en|et|sur|pour|dans|par|non|ainsi|que|dite?))+$/i;

// Une désambiguïsation peut faire commencer un libellé par un mot pris au
// milieu de la phrase : on lui rend sa majuscule. Appliqué avant tout test
// d'unicité, pour que deux libellés ne diffèrent jamais que par la casse.
function capitalize(text) {
  return text.charAt(0).toLocaleUpperCase('fr-FR') + text.slice(1);
}

function tidy(text) {
  let result = text.trim().replace(/[\s,;:–-]+$/, '');
  let previous;
  do {
    previous = result;
    result = result.replace(TRAILING_STOPWORDS, '').replace(/[\s,;:–-]+$/, '');
  } while (result !== previous && result.length > 0);
  return result || text.trim();
}

// Garde le plus de mots entiers possible dans le budget. Renvoie une chaîne
// vide si même le premier mot déborde — à l'appelant de décider quoi faire.
function fitWords(text, maxLength) {
  if (maxLength <= 0) return '';

  const words = text.split(' ');
  let result = '';
  for (const word of words) {
    const candidate = result ? `${result} ${word}` : word;
    if (candidate.length > maxLength) break;
    result = candidate;
  }

  return result ? tidy(result) : '';
}

// Coupe sur une limite de mot, jamais au milieu d'un mot.
function truncateOnWord(text, maxLength) {
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return tidy(text);

  const fitted = fitWords(text, maxLength);
  // Un premier mot plus long que le budget : coupe nette, faute de mieux.
  return fitted || tidy(text.split(' ')[0].slice(0, maxLength));
}

// Construit un libellé en partant du nom complet, en desserrant
// progressivement : abréviations, puis suppression des liaisons, puis coupe.
function shorten(nomComplet) {
  const base = stripTechnicalCode(normalize(nomComplet));

  // Abréviations et liaisons vont de pair : garder "TSE au profit de l'EPF de
  // PACA" juste parce qu'il tient dans le budget donnerait un libellé
  // incohérent avec "TSE EPF de Normandie".
  const shortened = stripFillers(applyRules(base, ABBREVIATIONS));

  const candidates = [base, shortened, applyRules(shortened, INLINE_ABBREVIATIONS)];

  for (const candidate of candidates) {
    if (candidate.length <= MAX_LABEL_LENGTH) return capitalize(tidy(candidate));
  }

  return capitalize(truncateOnWord(candidates[candidates.length - 1], MAX_LABEL_LENGTH));
}

// Mots trop courants pour discriminer quoi que ce soit.
const STOPWORDS = new Set([
  'de', 'du', 'des', 'd', 'la', 'le', 'les', 'l', 'à', 'au', 'aux', 'en', 'et',
  'sur', 'pour', 'dans', 'par', 'ainsi', 'que', 'sa', 'ses', 'son', 'un', 'une'
]);

// Découpe un libellé en mots signifiants, en gardant la forme d'origine pour
// l'affichage et une forme normalisée pour la comparaison.
function significantWords(text) {
  return text
    .split(' ')
    .map((word) => ({
      // Le point final est conservé : il fait partie des abréviations
      // ("Contrib.", "Particip.").
      raw: word.replace(/^[([{«"']+|[)\]}»",;:]+$/g, ''),
      key: word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '')
    }))
    .filter((word) => word.raw && word.key && !STOPWORDS.has(word.key));
}

function expand(nomComplet) {
  return applyRules(
    stripFillers(applyRules(stripTechnicalCode(normalize(nomComplet)), ABBREVIATIONS)),
    INLINE_ABBREVIATIONS
  );
}

// Désambiguïsation : deux entrées ne doivent jamais porter le même libellé.
// Pour chaque groupe en collision, on repère les mots que les autres membres
// du groupe n'ont pas — c'est là qu'est l'information — et on les accroche au
// libellé commun, en rognant la tête pour tenir dans le budget.
function disambiguate(entries) {
  const groups = new Map(); // label -> [index]

  entries.forEach((entry, index) => {
    const list = groups.get(entry.label);
    if (list) list.push(index);
    else groups.set(entry.label, [index]);
  });

  const used = new Set([...groups.keys()].filter((label) => groups.get(label).length === 1));

  for (const [label, indexes] of groups) {
    if (indexes.length === 1) continue;

    const members = indexes.map((index) => ({
      index,
      words: significantWords(expand(entries[index].nomComplet))
    }));

    // Un mot présent chez tous les membres ne distingue personne.
    const frequency = new Map();
    for (const member of members) {
      for (const key of new Set(member.words.map((word) => word.key))) {
        frequency.set(key, (frequency.get(key) || 0) + 1);
      }
    }

    for (const member of members) {
      // Les mots les plus rares dans le groupe d'abord : dans
      // "… installations nucléaires de base - stockage", c'est "stockage"
      // qui distingue, pas "installations". Le tri est stable, donc l'ordre
      // du texte départage les mots de même rareté.
      const seenKeys = new Set();
      const distinctive = member.words
        .filter((word) => {
          if (frequency.get(word.key) >= members.length) return false;
          if (seenKeys.has(word.key)) return false; // "commissaires comptes comptes"
          seenKeys.add(word.key);
          return true;
        })
        .sort((a, b) => frequency.get(a.key) - frequency.get(b.key));

      // Assemble le libellé commun tronqué + les `count` premiers mots
      // discriminants, ou null si la queue ne laisse pas de place à la tête.
      const build = (count) => {
        const tail = distinctive
          .slice(0, count)
          .map((word) => word.raw)
          .join(' ');
        if (tail.length + 2 > MAX_LABEL_LENGTH) return null;
        // fitWords et non truncateOnWord : une tête amputée en plein mot
        // ("Particip" pour "Particip.") est pire que pas de tête du tout.
        const head = fitWords(label, MAX_LABEL_LENGTH - tail.length - 1);
        // Une tête réduite à un ou deux caractères ("T Accompagnement…")
        // n'apporte rien : mieux vaut la queue seule.
        return capitalize(head.length >= 3 ? `${head} ${tail}` : tail);
      };

      let candidate = label;
      let taken = 0;

      // Le minimum de mots qui suffit à lever l'ambiguïté.
      for (let count = 1; count <= distinctive.length; count++) {
        const next = build(count);
        if (!next) break;
        candidate = next;
        if (!used.has(next)) {
          taken = count;
          break;
        }
      }

      // Puis un mot de plus tant que ça tient : "… surfaces commerciales"
      // est plus parlant que "… surfaces".
      for (let count = taken + 1; taken && count <= distinctive.length; count++) {
        const next = build(count);
        if (!next || used.has(next)) break;
        candidate = next;
      }

      // Dernier recours : le nom complet abrégé, coupé au budget.
      if (used.has(candidate)) {
        candidate = expand(entries[member.index].nomComplet);
      }

      candidate = capitalize(truncateOnWord(candidate, MAX_LABEL_LENGTH));

      // Filet de sécurité : suffixe numérique, pour garantir l'invariant
      // d'unicité que valide scripts/validate-data.mjs.
      let suffix = 2;
      let unique = candidate;
      while (used.has(unique)) {
        const room = MAX_LABEL_LENGTH - String(suffix).length - 1;
        unique = `${truncateOnWord(candidate, room)} ${suffix}`;
        suffix++;
      }

      used.add(unique);
      entries[member.index].label = unique;
    }
  }

  return entries;
}

// ===============================
//  Exécution
// ===============================

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function unwrap(data) {
  return Array.isArray(data) ? data : data.entries;
}

const fullData = readJson(FULL_PATH);
const lightData = readJson(LIGHT_PATH);
const fullEntries = unwrap(fullData);
const lightEntries = unwrap(lightData);

const fullById = new Map(fullEntries.map((entry) => [entry.id, entry]));

// 1. Recette numérique
for (const entry of fullEntries) {
  entry.recette_meur = parseRecette(entry.recette, entry.id);
}

// 2. Libellés courts
const computed = disambiguate(
  lightEntries.map((entry) => {
    const full = fullById.get(entry.id);
    if (!full) throw new Error(`id absent du fichier complet : ${entry.id}`);
    const nomComplet = full.nom_complet || full.nom;
    const label = shorten(nomComplet);
    if (!label) throw new Error(`libellé vide pour "${entry.id}" (nom_complet: ${nomComplet})`);
    return { id: entry.id, nomComplet, label };
  })
);

const changed = [];
computed.forEach((item, index) => {
  const entry = lightEntries[index];
  if (entry.nom !== item.label) changed.push(`${entry.nom} → ${item.label}`);
  entry.nom = item.label;
  // Les deux fichiers restent en miroir : le `nom` du fichier complet est le
  // même libellé court que celui du fichier léger.
  fullById.get(entry.id).nom = item.label;
});

const distinct = new Set(lightEntries.map((entry) => entry.nom)).size;
const longest = Math.max(...lightEntries.map((entry) => entry.nom.length));

console.log(`Libellés : ${distinct}/${lightEntries.length} distincts, max ${longest} caractères`);
console.log(`Libellés modifiés : ${changed.length}`);

const overBudget = lightEntries.filter((entry) => entry.nom.length > MAX_LABEL_LENGTH);
if (overBudget.length) {
  console.log(`Au-dessus du budget (${MAX_LABEL_LENGTH}) : ${overBudget.length}`);
  for (const entry of overBudget) console.log(`  ${entry.nom.length} — ${entry.nom}`);
}
console.log(
  `Recettes numériques : ${fullEntries.filter((e) => e.recette_meur !== null).length}/${fullEntries.length}`
);

if (checkOnly) {
  process.exit(0);
}

// 3. Écriture — le fichier léger adopte la forme { version, entries } pour
// porter la même version que le fichier complet (cf. js/entries.js).
const version = fullData.version;
if (!version) throw new Error(`${FULL_PATH} : champ "version" manquant`);

writeFileSync(LIGHT_PATH, `${JSON.stringify({ version, entries: lightEntries }, null, 2)}\n`, 'utf8');
writeFileSync(
  FULL_PATH,
  `${JSON.stringify({ version, entries: fullEntries }, null, 2)}\n`,
  'utf8'
);

console.log(`Écrit : ${LIGHT_PATH}, ${FULL_PATH}`);
