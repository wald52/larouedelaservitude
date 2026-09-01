import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("les métadonnées publiques utilisent l'URL canonique absolue", () => {
  const html = read("index.html");
  assert.match(html, /rel="canonical" href="https:\/\/wald52\.github\.io\/larouedelaservitude\/"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(
    html,
    /property="og:url" content="https:\/\/wald52\.github\.io\/larouedelaservitude\/"/
  );
  assert.match(
    html,
    /property="og:image"[\s\S]*https:\/\/wald52\.github\.io\/larouedelaservitude\/icons\/og-image\.png/
  );
  assert.equal((html.match(/name="theme-color"/g) || []).length, 2);
});

test("les gestes tactiles conservent le zoom et la roue a un plancher", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /html,\s*\n\s*body\s*\{[^}]*touch-action:\s*none/);
  assert.match(html, /touch-action:\s*pan-x pan-y pinch-zoom/);
  assert.match(html, /--wheel-cap:\s*max\(148px,/);
  assert.match(html, /@media \(max-height: 520px\) and \(orientation: landscape\)/);
});

test("les bornes numériques gardent chacune leur nom accessible", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /aria-labelledby="recetteRangeLabel"/);
  assert.doesNotMatch(html, /aria-labelledby="anneeRangeLabel"/);
  assert.match(html, /aria-label="Recette minimale en millions d'euros"/);
  assert.match(html, /aria-label="Recette maximale en millions d'euros"/);
});

test("la roue expose visuellement le secteur sous le pointeur", () => {
  const html = read("index.html");
  const app = read("js/app.js");
  assert.match(html, /id="wheelCurrentLabel"/);
  assert.match(app, /function updateCurrentSectorLabel/);
  assert.match(app, /getSelectedIndex\(a\)/);
});

test("le tableau propose un vrai bouton sans rendre 371 lignes tabulables", () => {
  const explorer = read("js/data-explorer.js");
  assert.match(explorer, /className = "table-detail-button"/);
  assert.doesNotMatch(explorer, /tr\.tabIndex = 0/);
  assert.doesNotMatch(explorer, /tr\.setAttribute\("role", "button"\)/);
});

test("le précache ne dépend plus des médias purement facultatifs", () => {
  const worker = read("service-worker.js");
  const stamp = read("scripts/stamp-assets.mjs");
  assert.match(worker, /function isOptionalPrecacheAsset/);
  assert.match(worker, /Pré-cache essentiel incomplet/);
  assert.doesNotMatch(stamp, /"icons\/og-image\.png"/);
});

test("le manifeste porte un nom court et une description utile", () => {
  const manifest = JSON.parse(read("site.webmanifest"));
  assert.equal(manifest.id, "./");
  assert.equal(manifest.lang, "fr");
  assert.ok(manifest.short_name.length <= 20);
  assert.ok(manifest.description.length > manifest.name.length);
});
