import { expect, fulfillCorsJson, openApp, spinWheel, test } from "./fixtures.mjs";

const NETLIFY_ORIGIN = "https://larouedelaservitude.netlify.app";
const SHARE_ENDPOINT = `${NETLIFY_ORIGIN}/.netlify/functions/shareImage`;
const FEEDBACK_ENDPOINT = `${NETLIFY_ORIGIN}/.netlify/functions/sendFeedback`;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("le chargement initial, deux tirages et la fermeture du résultat fonctionnent", async ({
  page
}) => {
  await openApp(page);

  const initialLabel = await page.locator("#wheelCanvas").getAttribute("aria-label");
  expect(initialLabel).toContain("371 éléments restants");

  const firstResult = await spinWheel(page);
  await expect(page.getByRole("button", { name: "Fermer le résultat" })).toBeVisible();

  const secondResult = await spinWheel(page);
  expect(secondResult).not.toBe(firstResult);
  await expect(page.locator("#wheelCanvas")).toHaveAttribute("aria-label", /369 éléments restants/);

  await page.getByRole("button", { name: "Fermer le résultat" }).click();
  await expect(page.locator("#resultCard")).toBeHidden();
  await expect(page.locator("#introDef")).toBeVisible();
});

test("le partage et le formulaire de signalement utilisent uniquement les endpoints simulés", async ({
  page
}) => {
  let sharePayload = null;
  let feedbackPayload = null;

  await page.route(SHARE_ENDPOINT, async (route) => {
    if (route.request().method() === "POST") {
      sharePayload = route.request().postDataJSON();
    }
    await fulfillCorsJson(route, {
      success: true,
      imageUrl: "https://i.ibb.co/example/result.webp",
      sharePageUrl: `${NETLIFY_ORIGIN}/share?fixture=1`
    });
  });

  await page.route(FEEDBACK_ENDPOINT, async (route) => {
    if (route.request().method() === "POST") {
      feedbackPayload = route.request().postDataJSON();
    }
    await fulfillCorsJson(route, {
      url: "https://github.com/wald52/larouedelaservitude/discussions/999"
    });
  });

  await openApp(page);
  await spinWheel(page);

  await page.getByRole("button", { name: "Partager ce résultat" }).click();
  await expect(page.locator("#shareModal")).toBeVisible();
  await page.getByRole("button", { name: "Partager sur Facebook" }).click();

  await expect.poll(() => sharePayload).not.toBeNull();
  expect(sharePayload.text).toContain("Recette");
  expect(sharePayload.imageData.length).toBeGreaterThan(100);
  await expect.poll(() => page.evaluate(() => window.__E2E_OPENED_URLS__.length)).toBe(1);
  const openedUrl = await page.evaluate(() => window.__E2E_OPENED_URLS__[0]);
  expect(openedUrl).toContain("facebook.com/sharer/sharer.php");
  expect(openedUrl).toContain(encodeURIComponent(`${NETLIFY_ORIGIN}/share?fixture=1`));
  await expect(page.locator("#shareModal")).toBeHidden();

  await page.getByRole("button", { name: /Signaler une erreur/ }).click();
  await expect(page.locator("#feedbackModal")).toBeVisible();
  await page
    .locator("#formMessage")
    .fill("La source de cette recette devrait être vérifiée dans la prochaine mise à jour.");
  await page.getByRole("button", { name: "Envoyer" }).click();

  await expect(page.locator("#feedbackStatus")).toContainText("Merci");
  expect(feedbackPayload.type).toBe("info");
  expect(feedbackPayload.userMessage).toContain("source de cette recette");
  expect(feedbackPayload.resultText).toContain("Recette");
});

test("la préférence mouvement réduit accélère le tirage sans charger l'effet billets", async ({
  page
}) => {
  await openApp(page);
  expect(
    await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  ).toBeTruthy();

  const startedAt = Date.now();
  await spinWheel(page);
  expect(Date.now() - startedAt).toBeLessThan(7_000);

  const billsLoadedByPage = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .some((entry) => new URL(entry.name).pathname.endsWith("/bills.js"))
  );
  expect(billsLoadedByPage).toBeFalsy();
});
