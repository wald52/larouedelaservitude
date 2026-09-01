import { test } from "node:test";
import assert from "node:assert/strict";

import handler, { config, getShareMetadata } from "../netlify/functions/shareImage.mjs";
import {
  inspectImageDataUri,
  MAX_IMAGE_BASE64_LENGTH
} from "../netlify/functions/_shared/image.mjs";
import { escapeHtml, validateImgBbHttpsUrl } from "../netlify/functions/_shared/share.mjs";

const ORIGIN = "https://wald52.github.io";
const ENDPOINT = "https://larouedelaservitude.netlify.app/.netlify/functions/shareImage";
const ONE_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z8xQAAAAASUVORK5CYII=";

function request(method, body, origin = ORIGIN, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  if (origin) headers.set("Origin", origin);
  if (body !== undefined) headers.set("Content-Type", "application/json");

  return new Request(ENDPOINT, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

test("la configuration applique une limite native Netlify", () => {
  assert.ok(config.path.includes("/.netlify/functions/shareImage"));
  assert.equal(config.rateLimit.windowLimit, 5);
  assert.equal(config.rateLimit.windowSize, 60);
  assert.deepEqual(config.rateLimit.aggregateBy, ["ip", "domain"]);
});

test("escapeHtml échappe les caractères sensibles", () => {
  assert.equal(
    escapeHtml('<a href="x">&\'</a>'),
    "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;"
  );
});

test("validateImgBbHttpsUrl accepte seulement les hôtes ImgBB en HTTPS", () => {
  assert.equal(validateImgBbHttpsUrl("https://i.ibb.co/abc/x.png"), "https://i.ibb.co/abc/x.png");
  assert.throws(() => validateImgBbHttpsUrl("https://evil.example/x.png"));
  assert.throws(() => validateImgBbHttpsUrl("http://i.ibb.co/abc/x.png"));
});

test("inspectImageDataUri vérifie le type réel de l'image", () => {
  const image = inspectImageDataUri(ONE_PIXEL_PNG);
  assert.equal(image.mime, "image/png");
  assert.ok(image.bytes.length > 20);

  assert.throws(
    () => inspectImageDataUri("data:image/png;base64,QUJDRA=="),
    /contenu ne correspond pas/i
  );
});

test("les métadonnées sont compactées et bornées", () => {
  const metadata = getShareMetadata("  Première ligne\n\n deuxième ligne  ");
  assert.equal(metadata.title, "Première ligne deuxième ligne");
  assert.equal(metadata.description, "Première ligne deuxième ligne");
});

test("OPTIONS accepte uniquement une origine autorisée", async () => {
  const ok = await handler(request("OPTIONS"));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("access-control-allow-origin"), ORIGIN);

  const bad = await handler(request("OPTIONS", undefined, "https://evil.example"));
  assert.equal(bad.status, 403);
  assert.equal(bad.headers.get("access-control-allow-origin"), "null");
});

test("une requête sans origine est refusée", async () => {
  const response = await handler(
    request("POST", { imageData: ONE_PIXEL_PNG, text: "résultat" }, null)
  );
  assert.equal(response.status, 403);
});

test("méthode non autorisée -> 405", async () => {
  const response = await handler(request("GET"));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST, OPTIONS");
});

test("un Content-Type autre que JSON -> 415", async () => {
  const response = await handler(
    new Request(ENDPOINT, {
      method: "POST",
      headers: { Origin: ORIGIN, "Content-Type": "text/plain" },
      body: "bonjour"
    })
  );
  assert.equal(response.status, 415);
});

test("champs manquants -> 400", async () => {
  const response = await handler(request("POST", { text: "résultat" }));
  assert.equal(response.status, 400);
});

test("image trop grande -> 413 avant tout appel externe", async () => {
  const imageData = `data:image/png;base64,${"A".repeat(MAX_IMAGE_BASE64_LENGTH + 4)}`;
  const response = await handler(request("POST", { imageData, text: "résultat" }));
  assert.equal(response.status, 413);
});

test("données d'image invalides -> 400", async () => {
  const response = await handler(
    request("POST", { imageData: "data:image/png;base64,QUJDRA==", text: "résultat" })
  );
  assert.equal(response.status, 400);
});

test("une image valide sans clé serveur -> 500 explicite", async () => {
  const previous = process.env.IMGBB_API_KEY;
  delete process.env.IMGBB_API_KEY;
  try {
    const response = await handler(
      request("POST", { imageData: ONE_PIXEL_PNG, text: "Un résultat suffisamment descriptif" })
    );
    assert.equal(response.status, 500);
    const payload = await response.json();
    assert.equal(payload.error, "server_configuration_error");
  } finally {
    if (previous === undefined) delete process.env.IMGBB_API_KEY;
    else process.env.IMGBB_API_KEY = previous;
  }
});
