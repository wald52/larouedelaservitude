import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  finiteNumbers,
  sum,
  mean,
  quantile,
  median,
  standardDeviation,
  describe,
  gini,
  topShare,
  lorenzPoints,
  groupByPeriod,
  magnitudeBuckets,
  countBy
} from "../js/stats.js";

// js/stats.js n'a aucune dépendance au DOM : c'est justement ce qui permet de
// le tester ici, alors que le reste du front-end ne l'est pas (voir CLAUDE.md
// §8). Les chiffres affichés sur donnees.html sortent tous de ce module.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const full = JSON.parse(readFileSync(join(root, "data/entries-full.json"), "utf8"));
const entries = Array.isArray(full) ? full : full.entries;

const approx = (actual, expected, tolerance = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `attendu ${expected} ± ${tolerance}, obtenu ${actual}`
  );
};

test("finiteNumbers écarte les valeurs non exploitables", () => {
  assert.deepEqual(finiteNumbers([1, null, 2, undefined, NaN, "3", Infinity, ""]), [1, 2, 3]);
});

test("les agrégats de base ignorent les valeurs manquantes", () => {
  assert.equal(sum([1, null, 2]), 3);
  assert.equal(mean([1, null, 3]), 2);
  assert.equal(median([3, 1, null, 2]), 2);
});

test("une série vide renvoie null plutôt que zéro", () => {
  assert.equal(mean([]), null);
  assert.equal(median([]), null);
  assert.equal(quantile([], 0.5), null);
  assert.equal(standardDeviation([1]), null);
  assert.equal(gini([]), null);
  assert.deepEqual(lorenzPoints([]), []);
  assert.deepEqual(groupByPeriod([]), []);
});

test("médiane et quantiles interpolent comme attendu", () => {
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(quantile([1, 2, 3, 4, 5], 0.25), 2);
  assert.equal(quantile([1, 2, 3, 4], 0.25), 1.75);
  assert.equal(quantile([5, 1, 3], 0), 1);
  assert.equal(quantile([5, 1, 3], 1), 5);
});

test("écart-type sur l'échantillon (dénominateur n-1)", () => {
  approx(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]), 2.13808993529939, 1e-12);
});

test("describe résume la série en une passe", () => {
  const summary = describe([10, 20, 30, 40, null]);
  assert.equal(summary.count, 4);
  assert.equal(summary.sum, 100);
  assert.equal(summary.mean, 25);
  assert.equal(summary.median, 25);
  assert.equal(summary.min, 10);
  assert.equal(summary.max, 40);
  assert.equal(summary.p25, 17.5);
  assert.equal(summary.p75, 32.5);
});

test("Gini vaut 0 sur une répartition parfaitement égale", () => {
  approx(gini([5, 5, 5, 5]), 0);
});

test("Gini tend vers 1 quand tout est concentré sur une seule entrée", () => {
  const concentration = gini([0, 0, 0, 0, 0, 0, 0, 0, 0, 100]);
  approx(concentration, 0.9, 1e-12);
  assert.ok(concentration < 1);
});

test("Gini refuse ce qui n'a pas de sens (valeurs négatives, total nul)", () => {
  assert.equal(gini([-1, 5]), null);
  assert.equal(gini([0, 0, 0]), null);
});

test("Gini est insensible à l'ordre et à l'échelle des valeurs", () => {
  const values = [3, 1, 40, 12, 7];
  approx(gini([...values].reverse()), gini(values), 1e-12);
  approx(gini(values.map((value) => value * 1000)), gini(values), 1e-12);
});

test("topShare mesure la part des plus grosses valeurs", () => {
  approx(topShare([50, 30, 10, 10], 1), 0.5);
  approx(topShare([50, 30, 10, 10], 2), 0.8);
  assert.equal(topShare([50, 30], 0), null);
  assert.equal(topShare([], 3), null);
});

test("la courbe de Lorenz part de (0,0), arrive à (1,1) et croît", () => {
  const points = lorenzPoints([1, 2, 3, 4]);
  assert.equal(points.length, 5);
  assert.deepEqual(points[0], { x: 0, y: 0 });
  approx(points.at(-1).x, 1);
  approx(points.at(-1).y, 1);

  for (let i = 1; i < points.length; i++) {
    assert.ok(points[i].y >= points[i - 1].y);
    // Sous la diagonale : les petites valeurs pèsent moins que leur effectif.
    assert.ok(points[i].y <= points[i].x + 1e-12);
  }
});

test("groupByPeriod conserve les périodes vides", () => {
  const buckets = groupByPeriod([1801, 1802, 1825], 10);
  assert.deepEqual(
    buckets.map((bucket) => [bucket.start, bucket.count]),
    [
      [1800, 2],
      [1810, 0],
      [1820, 1]
    ]
  );
  assert.equal(buckets[0].end, 1809);
  assert.equal(buckets[0].label, "1800s");
});

test("groupByPeriod accepte une autre granularité", () => {
  const buckets = groupByPeriod([1990, 2001, 2024], 25);
  assert.deepEqual(
    buckets.map((bucket) => [bucket.start, bucket.count]),
    [
      [1975, 1],
      [2000, 2]
    ]
  );
  assert.equal(buckets[0].label, "1975–1999");
});

test("magnitudeBuckets range les valeurs par puissance de dix", () => {
  const buckets = magnitudeBuckets([0.5, 5, 50, 500, 0, -3]);
  assert.deepEqual(
    buckets.map((bucket) => [bucket.exponent, bucket.count]),
    [
      [-1, 1],
      [0, 1],
      [1, 1],
      [2, 1]
    ]
  );
});

test("countBy classe du plus fréquent au moins fréquent", () => {
  const rows = [{ a: "x" }, { a: "y" }, { a: "x" }, { a: null }];
  assert.deepEqual(
    countBy(rows, (row) => row.a),
    [
      { key: "x", count: 2 },
      { key: "y", count: 1 }
    ]
  );
});

// ===============================
//  Cohérence avec le jeu de données réel
// ===============================

test("les statistiques du jeu de données réel restent cohérentes", () => {
  const recettes = entries.map((entry) => entry.recette_meur);
  const summary = describe(recettes);

  assert.equal(summary.count, recettes.filter((value) => value !== null).length);
  assert.ok(summary.count > 0, "le jeu de données doit contenir des recettes");
  assert.ok(summary.min >= 0, "aucune recette négative attendue");
  assert.ok(summary.max >= summary.median);
  approx(summary.sum, sum(recettes), 1e-6);

  const concentration = gini(recettes);
  assert.ok(concentration > 0 && concentration < 1);

  const part = topShare(recettes, 10);
  assert.ok(part > 0 && part <= 1);
});

test("le regroupement par décennie couvre toutes les années connues", () => {
  const annees = entries.map((entry) => entry.annee).filter((value) => value !== null);
  const buckets = groupByPeriod(annees, 10);

  assert.equal(
    buckets.reduce((total, bucket) => total + bucket.count, 0),
    annees.length
  );
  assert.ok(buckets[0].start <= Math.min(...annees));
  assert.ok(buckets.at(-1).end >= Math.max(...annees));
});
