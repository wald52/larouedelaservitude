import { test } from "node:test";
import assert from "node:assert/strict";

import handler, { config, normalizeRedirectUrl } from "../netlify/functions/sharePage.mjs";
import { normalizeText } from "../netlify/functions/_shared/share.mjs";

const ENDPOINT = "https://larouedelaservitude.netlify.app/.netlify/functions/sharePage";

function request(query = {}, method = "GET") {
  const url = new URL(ENDPOINT);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return new Request(url, { method });
}

test("la page de partage conserve l'ancienne route et expose /share", () => {
  assert.deepEqual(config.path, ["/share", "/.netlify/functions/sharePage"]);
});

test("normalizeText compacte les espaces et tronque", () => {
  assert.equal(normalizeText("  a\n  b   c  ", 100), "a b c");
  assert.equal(normalizeText("abcdef", 3), "abc");
  assert.equal(normalizeText(null, 10), "");
});

test("normalizeRedirectUrl autorise uniquement le site public et son sous-chemin", () => {
  const publicSite = "https://wald52.github.io/larouedelaservitude/";
  assert.equal(
    normalizeRedirectUrl("https://wald52.github.io/larouedelaservitude/?vue=donnees", publicSite),
    "https://wald52.github.io/larouedelaservitude/?vue=donnees"
  );
  assert.equal(
    normalizeRedirectUrl("https://wald52.github.io/autre-projet/", publicSite),
    publicSite
  );
  assert.equal(normalizeRedirectUrl("https://evil.example/steal", publicSite), publicSite);
});

test("handler POST -> 405", async () => {
  const response = await handler(request({}, "POST"));
  assert.equal(response.status, 405);
});

test("handler image invalide -> 400", async () => {
  const response = await handler(request({ image: "https://evil.example/x" }));
  assert.equal(response.status, 400);
});

test("le HTML échappe le titre et redirige vers le domaine canonique", async () => {
  const response = await handler(
    request({
      image: "https://i.ibb.co/abc/x.png",
      title: "<script>alert(1)</script>",
      description: "un résultat",
      redirect: "https://evil.example/steal"
    })
  );

  assert.equal(response.status, 200);
  const body = await response.text();
  assert.ok(!body.includes("<script>alert(1)</script>"));
  assert.ok(body.includes("&lt;script&gt;"));
  assert.ok(!body.includes("evil.example"));
  assert.ok(body.includes("wald52.github.io/larouedelaservitude/"));
  assert.ok(body.includes("larouedelaservitude.netlify.app"));
});

test("la page de partage envoie des en-têtes de sécurité", async () => {
  const response = await handler(request({ image: "https://i.ibb.co/abc/x.png" }));
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("x-robots-tag"), /noindex/);
});

test("HEAD ne renvoie aucun corps", async () => {
  const response = await handler(request({ image: "https://i.ibb.co/abc/x.png" }, "HEAD"));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});
