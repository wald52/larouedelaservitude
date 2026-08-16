import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectPrecacheIssues } from "../scripts/check-precache.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Le pré-cache est la seule chose qui rend l'application utilisable hors ligne
// après un unique chargement : une ressource oubliée ne se voit qu'en coupant
// le réseau sur un appareil vierge. D'où ce garde-fou automatique.
test("le pré-cache couvre toutes les ressources locales", () => {
  assert.deepEqual(collectPrecacheIssues(), []);
});

// L'estampillage est ce qui rend impossible le mélange de deux générations : le
// HTML de la génération N ne référence que des URLs N. Si le dépôt a dérivé de
// ce que l'estampilleur produirait, alors le service worker précache des URLs
// que les pages ne demandent pas — et inversement. Le hors ligne est cassé sans
// que rien ne le dise.
test("l'estampillage du dépôt est à jour", () => {
  assert.doesNotThrow(() =>
    execFileSync("node", ["scripts/stamp-assets.mjs", "--check"], { cwd: root, stdio: "pipe" })
  );
});
