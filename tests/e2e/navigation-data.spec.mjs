import { expect, openApp, test, waitForDataView } from "./fixtures.mjs";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("les quatre vues restent navigables et le bouton précédent restaure leur ordre", async ({
  page
}) => {
  await openApp(page);
  const root = page.locator("html");

  await page.getByRole("button", { name: "Historique" }).click();
  await expect(root).toHaveAttribute("data-view", "historique");
  await expect(page.getByRole("heading", { name: "Historique", level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\?vue=historique$/);

  await page.getByRole("button", { name: "Données" }).click();
  await waitForDataView(page);
  await expect(page).toHaveURL(/\?vue=donnees/);

  await page.getByRole("button", { name: "Réglages" }).click();
  await expect(root).toHaveAttribute("data-view", "reglages");
  await expect(page.getByRole("heading", { name: "Réglages", level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\?vue=reglages$/);

  await page.goBack();
  await waitForDataView(page);

  await page.goBack();
  await expect(root).toHaveAttribute("data-view", "historique");

  await page.goBack();
  await expect(root).toHaveAttribute("data-view", "roue");
  await expect(page.getByRole("button", { name: "Tourner la roue" })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("vue")).toBeFalsy();
});

test("les filtres et le tri de la vue Données sont restaurés depuis l'URL", async ({ page }) => {
  await openApp(page, "/?vue=donnees");
  await waitForDataView(page);

  await page.locator("#search").fill("douane");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"), { timeout: 5_000 })
    .toBe("douane");

  await page.locator("#filterRecette").selectOption("with");
  await page.locator("#sortPreset").selectOption("annee-asc");

  await expect.poll(() => new URL(page.url()).searchParams.get("recette")).toBe("with");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("tri"))
    .toBe("annee:asc,nom_complet:asc");

  const savedUrl = page.url();
  const savedCount = await page.locator("#resultCount").innerText();
  const filteredRows = await page.locator("#tableBody tr").count();
  expect(filteredRows).toBeGreaterThan(0);
  expect(filteredRows).toBeLessThan(371);

  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForDataView(page);

  await expect(page.locator("#search")).toHaveValue("douane");
  await expect(page.locator("#filterRecette")).toHaveValue("with");
  await expect(page.locator("#sortChips")).toContainText("Création");
  await expect(page.locator("#resultCount")).toHaveText(savedCount);
  expect(page.url()).toBe(savedUrl);
});

test("une fiche de données s'ouvre au clavier sans rendre les lignes du tableau tabulables", async ({
  page
}) => {
  await openApp(page, "/?vue=donnees");
  await waitForDataView(page);

  await expect(page.locator("#tableBody tr[tabindex]")).toHaveCount(0);
  await expect(page.locator("#tableBody .table-detail-button")).toHaveCount(371);

  const firstDetailButton = page.locator("#tableBody .table-detail-button").first();
  const accessibleName = await firstDetailButton.getAttribute("aria-label");
  await firstDetailButton.focus();
  await expect(firstDetailButton).toBeFocused();
  await firstDetailButton.press("Enter");

  await expect(page.locator("#detail")).toBeVisible();
  await expect(page.locator("#detailTitle")).not.toHaveText("");
  expect(accessibleName).toContain(await page.locator("#detailTitle").innerText());

  await page.keyboard.press("Escape");
  await expect(page.locator("#detail")).toBeHidden();
});
