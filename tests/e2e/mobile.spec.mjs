import { expect, openApp, spinWheel, test, waitForDataView } from "./fixtures.mjs";

test.describe("téléphone en portrait", () => {
  test.use({
    viewport: { width: 320, height: 568 },
    hasTouch: true,
    isMobile: true
  });

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("la roue, son libellé et la barre de navigation tiennent dans 320 × 568", async ({
    page
  }) => {
    await openApp(page);

    const layout = await page.evaluate(() => {
      const canvas = document.querySelector("#wheelCanvas").getBoundingClientRect();
      const label = document.querySelector("#wheelCurrentLabel").getBoundingClientRect();
      const viewport = document.querySelector('meta[name="viewport"]')?.content || "";
      return {
        canvasLeft: canvas.left,
        canvasRight: canvas.right,
        labelLeft: label.left,
        labelRight: label.right,
        scrollWidth: document.documentElement.scrollWidth,
        touchAction: getComputedStyle(document.body).touchAction,
        viewport,
        width: window.innerWidth
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
    expect(layout.canvasLeft).toBeGreaterThanOrEqual(0);
    expect(layout.canvasRight).toBeLessThanOrEqual(layout.width + 1);
    expect(layout.labelLeft).toBeGreaterThanOrEqual(0);
    expect(layout.labelRight).toBeLessThanOrEqual(layout.width + 1);
    expect(
      layout.touchAction === "manipulation" || layout.touchAction.includes("pinch-zoom")
    ).toBeTruthy();
    expect(layout.viewport).not.toMatch(/maximum-scale|user-scalable\s*=\s*no/i);
    await expect(page.locator("#wheelCurrentLabel")).toBeVisible();
    await expect(page.locator("#menuTabbar")).toBeVisible();
  });

  test("le zoom du navigateur et un texte à 200 % laissent les commandes principales accessibles", async ({
    context,
    page
  }) => {
    await openApp(page);

    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
    await expect
      .poll(() => page.evaluate(() => window.visualViewport?.scale || 1))
      .toBeGreaterThanOrEqual(1.9);

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });

    await expect(page.getByRole("button", { name: "Tourner la roue" })).toBeVisible();
    await expect(page.locator("#menuTabbar")).toBeVisible();

    const dataTab = page.getByRole("button", { name: "Données" });
    await dataTab.focus();
    await expect(dataTab).toBeFocused();
    await dataTab.press("Enter");

    await waitForDataView(page);

    const filtersPanel = page.locator("#filtersPanel");
    const filtersSummary = filtersPanel.locator("summary");
    await filtersSummary.focus();
    await expect(filtersSummary).toBeFocused();
    await filtersSummary.press("Enter");
    await expect(filtersPanel).toHaveAttribute("open", "");

    await page.locator("#search").scrollIntoViewIfNeeded();
    await expect(page.locator("#search")).toBeVisible();
  });
});

test.describe("téléphone en paysage court", () => {
  test.use({
    viewport: { width: 568, height: 320 },
    hasTouch: true,
    isMobile: true
  });

  test("la vue devient défilable et permet encore d'effectuer un tirage", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openApp(page);

    const shortLayout = await page.evaluate(() => ({
      mastheadDisplay: getComputedStyle(document.querySelector(".masthead")).display,
      overflowY: getComputedStyle(document.querySelector(".wrap")).overflowY,
      touchAction: getComputedStyle(document.querySelector(".wrap")).touchAction
    }));
    expect(shortLayout.mastheadDisplay).toBe("none");
    expect(shortLayout.overflowY).toBe("auto");
    expect(shortLayout.touchAction).toContain("pan-y");
    expect(shortLayout.touchAction).toContain("pinch-zoom");

    await spinWheel(page);
    await page.locator("#resultCard").scrollIntoViewIfNeeded();
    await expect(page.locator("#resultCard")).toBeVisible();
    await expect(page.locator("#menuTabbar")).toBeVisible();
  });
});
