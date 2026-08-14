import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const feedback = require("../netlify/functions/sendFeedback.js");

const ev = (method, body, origin) => ({
  httpMethod: method,
  headers: origin ? { origin } : {},
  body: body ? JSON.stringify(body) : ""
});

const ORIGIN = "https://wald52.github.io";

test("OPTIONS renvoie l'origine autorisée / null sinon", async () => {
  const ok = await feedback.handler(ev("OPTIONS", null, ORIGIN));
  assert.equal(ok.headers["Access-Control-Allow-Origin"], ORIGIN);
  const bad = await feedback.handler(ev("OPTIONS", null, "https://evil.example"));
  assert.equal(bad.headers["Access-Control-Allow-Origin"], "null");
});

test("méthode non autorisée -> 405", async () => {
  const res = await feedback.handler(ev("GET", null, ORIGIN));
  assert.equal(res.statusCode, 405);
});

test("honeypot rempli -> 200 silencieux, sans appel réseau", async () => {
  const res = await feedback.handler(
    ev(
      "POST",
      { userMessage: "un vrai message assez long", honeypot: "bot", type: "info", resultText: "r" },
      ORIGIN
    )
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), { ok: true });
});

test("message trop court -> 400", async () => {
  const res = await feedback.handler(
    ev("POST", { userMessage: "court", type: "info", resultText: "r" }, ORIGIN)
  );
  assert.equal(res.statusCode, 400);
});

test("trop de liens -> 400", async () => {
  const msg = "voir http://a http://b http://c http://d merci beaucoup";
  const res = await feedback.handler(
    ev("POST", { userMessage: msg, type: "info", resultText: "r" }, ORIGIN)
  );
  assert.equal(res.statusCode, 400);
});
