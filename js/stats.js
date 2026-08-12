// ===============================
//  stats.js — Statistiques descriptives (fonctions pures)
// ===============================
// Aucune dépendance, aucun accès au DOM : ce module est le moteur de calcul de
// la page d'analyse (donnees.html) et il est testé directement sous Node
// (tests/stats.test.mjs). Toute règle de calcul affichée à l'écran doit vivre
// ici plutôt que dans le rendu, pour rester vérifiable.
//
// Convention commune à toutes les fonctions : les valeurs non finies (null,
// undefined, NaN) sont ignorées et ne comptent jamais dans les effectifs. Une
// série vide renvoie null plutôt que 0 — « aucune donnée » et « zéro » sont
// deux informations différentes, surtout ici où 222 prélèvements sur 371 n'ont
// pas de recette connue.

/**
 * Ne garde que les nombres exploitables d'une série.
 * @param {Array<unknown>} values
 * @returns {number[]}
 */
export function finiteNumbers(values) {
  const result = [];
  for (const value of values || []) {
    // ⚠️ Number(null), Number("") et Number(false) valent 0 : sans ce filtre
    // explicite, les 222 recettes inconnues du jeu de données compteraient
    // comme autant de zéros et écraseraient toutes les moyennes.
    if (value === null || value === undefined || value === "" || typeof value === "boolean") {
      continue;
    }

    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric)) result.push(numeric);
  }
  return result;
}

/**
 * Somme d'une série (0 si la série est vide : une somme neutre a du sens).
 * @param {Array<number>} values
 * @returns {number}
 */
export function sum(values) {
  return finiteNumbers(values).reduce((total, value) => total + value, 0);
}

/**
 * Moyenne arithmétique.
 * @param {Array<number>} values
 * @returns {number|null} null si aucune valeur exploitable
 */
export function mean(values) {
  const numbers = finiteNumbers(values);
  if (!numbers.length) return null;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

/**
 * Quantile par interpolation linéaire (méthode « linear », celle de numpy).
 * @param {Array<number>} values
 * @param {number} q - Entre 0 et 1
 * @returns {number|null}
 */
export function quantile(values, q) {
  const sorted = finiteNumbers(values).sort((a, b) => a - b);
  if (!sorted.length) return null;
  if (q <= 0) return sorted[0];
  if (q >= 1) return sorted[sorted.length - 1];

  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];

  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

/**
 * Médiane.
 * @param {Array<number>} values
 * @returns {number|null}
 */
export function median(values) {
  return quantile(values, 0.5);
}

/**
 * Écart-type de l'échantillon (dénominateur n-1). null en dessous de 2 valeurs,
 * où la dispersion n'a pas de sens.
 * @param {Array<number>} values
 * @returns {number|null}
 */
export function standardDeviation(values) {
  const numbers = finiteNumbers(values);
  if (numbers.length < 2) return null;

  const average = numbers.reduce((total, value) => total + value, 0) / numbers.length;
  const variance =
    numbers.reduce((total, value) => total + (value - average) ** 2, 0) / (numbers.length - 1);

  return Math.sqrt(variance);
}

/**
 * Résumé complet d'une série, en une passe pour la vue « statistiques ».
 * @param {Array<number>} values
 * @returns {{count:number,sum:number,mean:number|null,median:number|null,min:number|null,max:number|null,p25:number|null,p75:number|null,stdDev:number|null}}
 */
export function describe(values) {
  const numbers = finiteNumbers(values);

  return {
    count: numbers.length,
    sum: sum(numbers),
    mean: mean(numbers),
    median: median(numbers),
    min: numbers.length ? Math.min(...numbers) : null,
    max: numbers.length ? Math.max(...numbers) : null,
    p25: quantile(numbers, 0.25),
    p75: quantile(numbers, 0.75),
    stdDev: standardDeviation(numbers)
  };
}

/**
 * Indice de Gini (0 = parfaitement réparti, 1 = tout concentré sur une entrée).
 * Défini uniquement sur des valeurs positives ou nulles, ce qui est le cas des
 * recettes fiscales.
 * @param {Array<number>} values
 * @returns {number|null} null si la série est vide, négative ou de somme nulle
 */
export function gini(values) {
  const sorted = finiteNumbers(values).sort((a, b) => a - b);
  if (!sorted.length || sorted[0] < 0) return null;

  const total = sorted.reduce((acc, value) => acc + value, 0);
  if (total <= 0) return null;

  const n = sorted.length;
  let weighted = 0;
  for (let i = 0; i < n; i++) {
    weighted += (i + 1) * sorted[i];
  }

  return (2 * weighted) / (n * total) - (n + 1) / n;
}

/**
 * Part du total détenue par les `count` plus grandes valeurs.
 * @param {Array<number>} values
 * @param {number} count
 * @returns {number|null} Fraction entre 0 et 1
 */
export function topShare(values, count) {
  const numbers = finiteNumbers(values);
  const total = numbers.reduce((acc, value) => acc + value, 0);
  if (!numbers.length || total <= 0 || count <= 0) return null;

  const head = numbers.sort((a, b) => b - a).slice(0, count);
  return head.reduce((acc, value) => acc + value, 0) / total;
}

/**
 * Points de la courbe de Lorenz : part cumulée du total (y) détenue par la
 * fraction cumulée des entrées les plus petites (x). La diagonale y = x
 * représente la répartition parfaitement égale.
 * @param {Array<number>} values
 * @returns {Array<{x:number,y:number}>} [] si le calcul n'a pas de sens
 */
export function lorenzPoints(values) {
  const sorted = finiteNumbers(values).sort((a, b) => a - b);
  if (!sorted.length || sorted[0] < 0) return [];

  const total = sorted.reduce((acc, value) => acc + value, 0);
  if (total <= 0) return [];

  const points = [{ x: 0, y: 0 }];
  let cumulative = 0;
  for (let i = 0; i < sorted.length; i++) {
    cumulative += sorted[i];
    points.push({ x: (i + 1) / sorted.length, y: cumulative / total });
  }

  return points;
}

/**
 * Regroupe des années par tranche (décennie par défaut), sans trou : les
 * périodes vides entre le premier et le dernier groupe sont conservées à 0,
 * sinon l'histogramme mentirait sur le rythme des créations.
 * @param {Array<number>} years
 * @param {number} size - Largeur d'une tranche, en années
 * @returns {Array<{start:number,end:number,label:string,count:number}>}
 */
export function groupByPeriod(years, size = 10) {
  const numbers = finiteNumbers(years);
  if (!numbers.length || size <= 0) return [];

  const floorTo = (year) => Math.floor(year / size) * size;
  const first = floorTo(Math.min(...numbers));
  const last = floorTo(Math.max(...numbers));

  const counts = new Map();
  for (let start = first; start <= last; start += size) {
    counts.set(start, 0);
  }
  for (const year of numbers) {
    const start = floorTo(year);
    counts.set(start, counts.get(start) + 1);
  }

  return [...counts.entries()].map(([start, count]) => ({
    start,
    end: start + size - 1,
    label: size === 10 ? `${start}s` : `${start}–${start + size - 1}`,
    count
  }));
}

/**
 * Répartition par ordre de grandeur (puissances de 10), l'échelle naturelle
 * pour des recettes qui s'étalent de 0 à 147 500 M€.
 * @param {Array<number>} values
 * @returns {Array<{exponent:number,min:number,max:number,label:string,count:number}>}
 */
export function magnitudeBuckets(values) {
  const numbers = finiteNumbers(values).filter((value) => value > 0);
  if (!numbers.length) return [];

  const exponentOf = (value) => Math.floor(Math.log10(value));
  const first = exponentOf(Math.min(...numbers));
  const last = exponentOf(Math.max(...numbers));

  const counts = new Map();
  for (let exponent = first; exponent <= last; exponent++) {
    counts.set(exponent, 0);
  }
  for (const value of numbers) {
    const exponent = exponentOf(value);
    counts.set(exponent, counts.get(exponent) + 1);
  }

  return [...counts.entries()].map(([exponent, count]) => ({
    exponent,
    min: 10 ** exponent,
    max: 10 ** (exponent + 1),
    label: `10^${exponent}`,
    count
  }));
}

/**
 * Compte les occurrences d'une clé, du plus fréquent au moins fréquent.
 * @param {Array<object>} rows
 * @param {(row: object) => string|null} keyOf
 * @returns {Array<{key:string,count:number}>}
 */
export function countBy(rows, keyOf) {
  const counts = new Map();
  for (const row of rows || []) {
    const key = keyOf(row);
    if (key === null || key === undefined || key === "") continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "fr"));
}
