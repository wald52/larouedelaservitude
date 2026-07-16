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
  }
});
