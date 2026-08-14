#!/usr/bin/env node
import { readFileSync } from "node:fs";

const lightPath = "data/entries-light.json";
const fullPath = "data/entries-full.json";
const failures = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`${path}: JSON invalide (${error.message})`);
    return null;
  }
}

function getEntries(path, data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.entries)) return data.entries;
  failures.push(`${path}: le fichier doit contenir un tableau ou une propriété entries[]`);
  return [];
}

function requireString(entry, field, path, index) {
  if (typeof entry[field] !== "string" || entry[field].trim() === "") {
    failures.push(`${path}: entrée #${index + 1}: champ "${field}" manquant ou vide`);
  }
}

function checkDuplicates(entries, path) {
  const seen = new Map();
  entries.forEach((entry, index) => {
    if (!entry?.id) return;
    if (!seen.has(entry.id)) {
      seen.set(entry.id, index);
      return;
    }
    failures.push(
      `${path}: id dupliqué "${entry.id}" aux entrées #${seen.get(entry.id) + 1} et #${index + 1}`
    );
  });
}

// Deux secteurs de la roue ne doivent jamais porter le même libellé : sinon
// le tirage devient illisible dès que les libellés s'affichent.
function checkDuplicateLabels(entries, path) {
  const seen = new Map();
  entries.forEach((entry, index) => {
    const nom = entry?.nom;
    if (typeof nom !== "string" || nom.trim() === "") return;
    if (!seen.has(nom)) {
      seen.set(nom, index);
      return;
    }
    failures.push(
      `${path}: libellé dupliqué "${nom}" aux entrées #${seen.get(nom) + 1} et #${index + 1}`
    );
  });
}

// Le champ version pilote l'invalidation du cache IndexedDB côté client
// (js/entries.js). Sans lui, une correction de données ne parvient jamais
// aux visiteurs déjà venus.
function requireVersion(path, data) {
  if (typeof data?.version !== "string" || data.version.trim() === "") {
    failures.push(`${path}: champ "version" manquant ou vide`);
  }
  return data?.version;
}

const lightData = readJson(lightPath);
const fullData = readJson(fullPath);
const lightEntries = getEntries(lightPath, lightData);
const fullEntries = getEntries(fullPath, fullData);

// Budget de caractères d'un libellé de roue, cf. scripts/rebuild-derived-data.mjs.
const MAX_LABEL_LENGTH = 30;

lightEntries.forEach((entry, index) => {
  requireString(entry, "id", lightPath, index);
  requireString(entry, "nom", lightPath, index);
  if (typeof entry?.nom === "string" && entry.nom.length > MAX_LABEL_LENGTH) {
    failures.push(
      `${lightPath}: entrée #${index + 1}: libellé de ${entry.nom.length} caractères (maximum ${MAX_LABEL_LENGTH}): "${entry.nom}"`
    );
  }
});

fullEntries.forEach((entry, index) => {
  requireString(entry, "id", fullPath, index);
  requireString(entry, "nom", fullPath, index);
  requireString(entry, "nom_complet", fullPath, index);
  if (!("recette" in entry))
    failures.push(`${fullPath}: entrée #${index + 1}: champ "recette" manquant`);
  if (!("annee" in entry))
    failures.push(`${fullPath}: entrée #${index + 1}: champ "annee" manquant`);
  if (!("recette_meur" in entry)) {
    failures.push(`${fullPath}: entrée #${index + 1}: champ "recette_meur" manquant`);
  } else if (entry.recette_meur !== null && !Number.isFinite(entry.recette_meur)) {
    failures.push(
      `${fullPath}: entrée #${index + 1}: "recette_meur" doit être un nombre ou null (reçu ${JSON.stringify(entry.recette_meur)})`
    );
  } else if (
    (entry.recette_meur === null) !==
    (entry.recette === null || entry.recette === undefined)
  ) {
    failures.push(
      `${fullPath}: entrée #${index + 1}: "recette" et "recette_meur" doivent être renseignés ou nuls ensemble`
    );
  }
});

checkDuplicates(lightEntries, lightPath);
checkDuplicates(fullEntries, fullPath);
checkDuplicateLabels(lightEntries, lightPath);

const lightVersion = requireVersion(lightPath, lightData);
const fullVersion = requireVersion(fullPath, fullData);
if (lightVersion && fullVersion && lightVersion !== fullVersion) {
  failures.push(`version différente: ${lightPath}=${lightVersion}, ${fullPath}=${fullVersion}`);
}

const fullById = new Map(fullEntries.map((entry) => [entry.id, entry]));
const lightById = new Map(lightEntries.map((entry) => [entry.id, entry]));

for (const entry of lightEntries) {
  if (entry?.id && !fullById.has(entry.id))
    failures.push(`${lightPath}: id absent du fichier complet: ${entry.id}`);
}

for (const entry of fullEntries) {
  if (entry?.id && !lightById.has(entry.id))
    failures.push(`${fullPath}: id absent du fichier léger: ${entry.id}`);
}

if (lightEntries.length !== fullEntries.length) {
  failures.push(
    `Nombre d'entrées différent: ${lightPath}=${lightEntries.length}, ${fullPath}=${fullEntries.length}`
  );
}

if (failures.length) {
  console.error("Validation des données échouée:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validation des données OK (${lightEntries.length} entrées).`);
