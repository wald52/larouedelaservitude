import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const shareImage = require("../netlify/functions/shareImage.js");

const ev = (method, body, origin) => ({
  httpMethod: method,
  headers: origin ? { origin } : {},
  body: body ? JSON.stringify(body) : ""
});

test("escapeHtml échappe les caractères sensibles", () => {
  assert.equal(shareImage.escapeHtml('<a href="x">&\'</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
});

test("validateImgBbHttpsUrl accepte les hôtes ImgBB en https", () => {
  assert.equal(shareImage.validateImgBbHttpsUrl("https://i.ibb.co/abc/x.png"), "https://i.ibb.co/abc/x.png");
});

test("validateImgBbHttpsUrl rejette un autre hôte", () => {
  assert.throws(() => shareImage.validateImgBbHttpsUrl("https://evil.example/x.png"));
});

test("validateImgBbHttpsUrl rejette http", () => {
  assert.throws(() => shareImage.validateImgBbHttpsUrl("http://i.ibb.co/abc/x.png"));
});

test("OPTIONS renvoie l'origine seulement si autorisée", async () => {
  const ok = await shareImage.handler(ev("OPTIONS", null, "https://wald52.github.io"));
  assert.equal(ok.headers["Access-Control-Allow-Origin"], "https://wald52.github.io");

  const bad = await shareImage.handler(ev("OPTIONS", null, "https://evil.example"));
  assert.equal(bad.headers["Access-Control-Allow-Origin"], "null");
});

test("méthode non autorisée -> 405", async () => {
  const res = await shareImage.handler(ev("GET", null, "https://wald52.github.io"));
  assert.equal(res.statusCode, 405);
});

test("champs manquants -> 400", async () => {
  const res = await shareImage.handler(ev("POST", { text: "x" }, "https://wald52.github.io"));
  assert.equal(res.statusCode, 400);
});

test("image trop grande -> 413", async () => {
  const res = await shareImage.handler(
    ev("POST", { imageData: "A".repeat(9 * 1024 * 1024), text: "x" }, "https://wald52.github.io")
  );
  assert.equal(res.statusCode, 413);
});

test("données d'image invalides -> 400", async () => {
  const res = await shareImage.handler(
    ev("POST", { imageData: "pas du base64 !!", text: "x" }, "https://wald52.github.io")
  );
  assert.equal(res.statusCode, 400);
});
