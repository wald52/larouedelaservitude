import { test } from "node:test";
import assert from "node:assert/strict";

import handler, { config } from "../netlify/functions/sendFeedback.mjs";
import { neutralizeMentions } from "../netlify/functions/_shared/share.mjs";

const ORIGIN = "https://wald52.github.io";
const ENDPOINT = "https://larouedelaservitude.netlify.app/.netlify/functions/sendFeedback";

function request(method, body, origin = ORIGIN, contentType = "application/json") {
  const headers = new Headers();
  if (origin) headers.set("Origin", origin);
  if (body !== undefined) headers.set("Content-Type", contentType);

  return new Request(ENDPOINT, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function validBody(overrides = {}) {
  return {
    userMessage: "Un message assez long pour être utile.",
    honeypot: "",
    type: "info",
    resultText: "Droits de douane",
    ...overrides
  };
}

test("la configuration applique une limite native Netlify", () => {
  assert.ok(config.path.includes("/.netlify/functions/sendFeedback"));
  assert.equal(config.rateLimit.windowLimit, 2);
  assert.equal(config.rateLimit.windowSize, 180);
  assert.deepEqual(config.rateLimit.aggregateBy, ["ip", "domain"]);
});

test("OPTIONS accepte l'origine canonique et refuse les autres", async () => {
  const ok = await handler(request("OPTIONS"));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("access-control-allow-origin"), ORIGIN);

  const bad = await handler(request("OPTIONS", undefined, "https://evil.example"));
  assert.equal(bad.status, 403);
});

test("méthode non autorisée -> 405", async () => {
  const response = await handler(request("GET"));
  assert.equal(response.status, 405);
});

test("requête sans origine -> 403", async () => {
  const response = await handler(request("POST", validBody(), null));
  assert.equal(response.status, 403);
});

test("honeypot rempli -> 200 silencieux sans appel réseau", async () => {
  const response = await handler(request("POST", validBody({ honeypot: "bot" })));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("type invalide -> 400", async () => {
  const response = await handler(request("POST", validBody({ type: "autre" })));
  assert.equal(response.status, 400);
});

test("message trop court -> 400", async () => {
  const response = await handler(request("POST", validBody({ userMessage: "court" })));
  assert.equal(response.status, 400);
});

test("message trop long -> 413", async () => {
  const response = await handler(request("POST", validBody({ userMessage: "a".repeat(3_001) })));
  assert.equal(response.status, 413);
});

test("trop de liens -> 400", async () => {
  const response = await handler(
    request(
      "POST",
      validBody({ userMessage: "voir http://a http://b http://c http://d merci beaucoup" })
    )
  );
  assert.equal(response.status, 400);
});

test("message valide sans token -> 500 explicite", async () => {
  const previous = process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_TOKEN;
  try {
    const response = await handler(request("POST", validBody()));
    assert.equal(response.status, 500);
    const payload = await response.json();
    assert.equal(payload.error, "server_configuration_error");
  } finally {
    if (previous === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previous;
  }
});


test("neutralizeMentions conserve les adresses e-mail", () => {
  assert.equal(
    neutralizeMentions("Contact : nom@example.com — ping @everyone"),
    "Contact : nom@example.com — ping @\u200beveryone"
  );
});

test("une panne réseau GitHub -> 502", async () => {
  const previousToken = process.env.GITHUB_TOKEN;
  const previousFetch = globalThis.fetch;
  process.env.GITHUB_TOKEN = "test-token";
  globalThis.fetch = async () => {
    throw new Error("network down");
  };

  try {
    const response = await handler(request("POST", validBody()));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).error, "github_unavailable");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previousToken;
  }
});

test("la mutation neutralise les mentions et valide l'URL retournée", async () => {
  const previousToken = process.env.GITHUB_TOKEN;
  const previousFetch = globalThis.fetch;
  let sentPayload;

  process.env.GITHUB_TOKEN = "test-token";
  globalThis.fetch = async (_url, options) => {
    sentPayload = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        data: {
          createDiscussion: {
            discussion: {
              url: "https://github.com/wald52/larouedelaservitude/discussions/123"
            }
          }
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  try {
    const response = await handler(
      request(
        "POST",
        validBody({
          userMessage: "Merci de vérifier avec @admin, ce message est assez long.",
          resultText: "@everyone — Droits de douane"
        })
      )
    );

    assert.equal(response.status, 200);
    assert.equal(
      (await response.json()).url,
      "https://github.com/wald52/larouedelaservitude/discussions/123"
    );

    const input = sentPayload.variables.input;
    assert.ok(!input.title.includes("@everyone"));
    assert.ok(input.title.includes("@\u200beveryone"));
    assert.ok(input.body.includes("@\u200badmin"));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previousToken;
  }
});
