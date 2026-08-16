// ===============================
//  theme-tokens.test.mjs — Les jetons de thème vivent dans le `:root` de base
// ===============================
// Une règle conditionnelle (`:root[data-theme="dark"]`, `:root[data-install]`…)
// n'a le droit que de *redéfinir* un jeton, jamais d'en introduire un.
//
// Ce test existe parce que l'invariant a été enfreint : une règle insérée par
// erreur au milieu du bloc `:root` l'a coupé en deux, et tout ce qui suivait —
// la trame de fond, la romaine du bandeau de titre, le filet rouge — s'est
// retrouvé sous `:root[data-install="open"]`. Le CSS restait parfaitement
// valide, Prettier l'a reformaté sans rien dire, et la page s'affichait sans sa
// trame ni sa typographie tant que la bannière d'installation n'était pas là.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../", import.meta.url);

// Les jetons d'une page peuvent être répartis sur plusieurs feuilles : on les
// met donc en commun page par page, comme le navigateur le fait.
// Il n'y a plus qu'une page : donnees.css habille désormais une vue de
// index.html, et ne déclare plus aucun jeton — ce que ce test vérifie aussi,
// puisque le moindre `:root` qui y réapparaîtrait serait jugé avec les autres.
const PAGES = {
  "index.html": ["index.html", "buttons.css", "menu.css", "bills.css", "donnees.css"]
};

/** CSS d'un fichier : son contenu s'il est déjà une feuille, ses <style> sinon. */
function readCss(file) {
  const source = readFileSync(fileURLToPath(new URL(file, ROOT)), "utf8");
  if (!file.endsWith(".html")) return source;
  return [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
}

/** Les commentaires parlent de `:root` : on les retire avant de lire le CSS. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Règles dont le sélecteur commence par `:root`, avec leurs déclarations de
 * propriétés personnalisées. Analyse volontairement naïve — le CSS de ces pages
 * est écrit à la main, sans imbrication.
 * @returns {Array<{selector: string, tokens: string[]}>}
 */
function rootRules(css) {
  const rules = [];

  for (const match of stripComments(css).matchAll(/(:root[^{}]*)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    const tokens = [...match[2].matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);
    rules.push({ selector, tokens });
  }

  return rules;
}

for (const [page, files] of Object.entries(PAGES)) {
  test(`${page} : aucune règle conditionnelle n'introduit de jeton absent de :root`, () => {
    const rules = files.flatMap((file) =>
      rootRules(readCss(file)).map((rule) => ({ ...rule, file }))
    );

    const base = rules.filter((rule) => rule.selector === ":root");
    assert.ok(base.length > 0, `${page} n'a aucun bloc \`:root\` de base`);

    const declared = new Set(base.flatMap((rule) => rule.tokens));

    for (const rule of rules) {
      if (rule.selector === ":root") continue;

      for (const token of rule.tokens) {
        assert.ok(
          declared.has(token),
          `${page} (${rule.file}) : \`${token}\` n'est déclaré que dans \`${rule.selector}\`. ` +
            "Une règle conditionnelle ne peut que redéfinir un jeton du `:root` de base — " +
            "sinon il disparaît dès que la condition n'est pas remplie."
        );
      }
    }
  });
}

test("index.html : le thème sombre redéfinit bien tout un jeu de jetons", () => {
  const dark = rootRules(readCss("index.html")).find((rule) =>
    rule.selector.includes('data-theme="dark"')
  );

  assert.ok(dark, 'le bloc `:root[data-theme="dark"]` est introuvable');
  assert.ok(dark.tokens.length > 10, "le thème sombre ne redéfinit presque plus rien");
});
