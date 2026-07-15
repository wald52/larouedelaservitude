import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharePage = require("../netlify/functions/sharePage.js");

const eventWithHost = (host, query, method = "GET") => ({
  httpMethod: method,
  headers: { host },
  queryStringParameters: query
});

test("normalizeText compacte les espaces et tronque", () => {
  assert.equal(sharePage.normalizeText("  a\n  b   c  ", 100), "a b c");
  assert.equal(sharePage.normalizeText("abcdef", 3), "abc");
  assert.equal(sharePage.normalizeText(null, 10), "");
});

test("normalizeRedirectUrl garde une URL du même hôte", () => {
  const event = { headers: { host: "larouedelaservitude.netlify.app" } };
  assert.equal(
    sharePage.normalizeRedirectUrl("https://larouedelaservitude.netlify.app/page", event),
    "https://larouedelaservitude.netlify.app/page"
  );
});

test("normalizeRedirectUrl bloque un open-redirect vers un autre hôte", () => {
  const event = { headers: { host: "larouedelaservitude.netlify.app" } };
  assert.equal(
    sharePage.normalizeRedirectUrl("https://evil.example/steal", event),
    "https://larouedelaservitude.netlify.app"
  );
});

test("handler POST -> 405", async () => {
  const res = await sharePage.handler(eventWithHost("host.example", {}, "POST"));
  assert.equal(res.statusCode, 405);
});

test("handler image invalide -> 400", async () => {
  const res = await sharePage.handler(eventWithHost("host.example", { image: "https://evil.example/x" }));
  assert.equal(res.statusCode, 400);
});

test("handler échappe le titre (pas de XSS) et redirige vers l'hôte de la requête", async () => {
  const res = await sharePage.handler(
    eventWithHost("host.example", {
      image: "https://i.ibb.co/abc/x.png",
      title: '<script>alert(1)</script>',
      redirect: "https://evil.example/steal"
    })
  );
  assert.equal(res.statusCode, 200);
  assert.ok(!res.body.includes("<script>alert(1)</script>"));
  assert.ok(res.body.includes("&lt;script&gt;"));
  // Le méta-refresh ne doit pas pointer vers l'hôte attaquant
  assert.ok(!res.body.includes("evil.example"));
  assert.ok(res.body.includes("host.example"));
});
