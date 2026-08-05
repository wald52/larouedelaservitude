import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const light = readJson("data/entries-light.json");
const full = readJson("data/entries-full.json");
const lightEntries = Array.isArray(light) ? light : light.entries;
const fullEntries = Array.isArray(full) ? full : full.entries;

test("les deux fichiers ont le même nombre d'entrées", () => {
  assert.equal(lightEntries.length, fullEntries.length);
});

test("chaque id du fichier léger existe dans le fichier complet", () => {
  const fullIds = new Set(fullEntries.map((e) => e.id));
  for (const entry of lightEntries) {
    assert.ok(fullIds.has(entry.id), `id manquant dans full: ${entry.id}`);
  }
});

test("aucun id dupliqué dans le fichier complet", () => {
  const ids = fullEntries.map((e) => e.id);
  assert.equal(ids.length, new Set(ids).size);
});

test("chaque entrée complète a les champs requis", () => {
  for (const entry of fullEntries) {
    for (const field of ["id", "nom", "nom_complet"]) {
      assert.equal(typeof entry[field], "string");
      assert.notEqual(entry[field].trim(), "");
    }
    assert.ok("recette" in entry);
    assert.ok("annee" in entry);
    assert.ok("recette_meur" in entry);
  }
});

// Budget de caractères d'un libellé de roue, cf. scripts/rebuild-derived-data.mjs.
const MAX_LABEL_LENGTH = 30;

test("les libellés courts tiennent dans le budget de la roue", () => {
  for (const entry of lightEntries) {
    assert.ok(
      entry.nom.length <= MAX_LABEL_LENGTH,
      `libellé de ${entry.nom.length} caractères: "${entry.nom}"`
    );
  }
});

test("aucun libellé dupliqué dans le fichier léger", () => {
  const noms = lightEntries.map((e) => e.nom);
  assert.equal(noms.length, new Set(noms).size);
});

test("les deux fichiers portent le même libellé court pour un id donné", () => {
  const lightByIdvalue = new Map(lightEntries.map((e) => [e.id, e.nom]));
  for (const entry of fullEntries) {
    assert.equal(entry.nom, lightByIdvalue.get(entry.id), `libellés désynchronisés: ${entry.id}`);
  }
});

test("recette_meur est un nombre ou null, cohérent avec recette", () => {
  for (const entry of fullEntries) {
    if (entry.recette_meur !== null) {
      assert.equal(typeof entry.recette_meur, "number");
      assert.ok(Number.isFinite(entry.recette_meur), `recette_meur non finie: ${entry.id}`);
    }
    assert.equal(
      entry.recette_meur === null,
      entry.recette === null || entry.recette === undefined,
      `recette et recette_meur désaccordés: ${entry.id}`
    );
  }
});

test("les deux fichiers portent la même version", () => {
  assert.equal(typeof full.version, "string");
  assert.notEqual(full.version.trim(), "");
  assert.equal(light.version, full.version);
});
