import { expect, test as base } from "@playwright/test";

export const test = base.extend({
  allowedConsoleErrors: [[], { option: true }],
  page: async ({ allowedConsoleErrors, context, page }, use, testInfo) => {
    const browserErrors = [];
    const unexpectedExternalRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        browserErrors.push(`console.error: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      browserErrors.push(`pageerror: ${error.stack || error.message}`);
    });

    await context.addInitScript(() => {
      window.__E2E_OPENED_URLS__ = [];
      window.__E2E_ALERTS__ = [];
      window.open = (url) => {
        window.__E2E_OPENED_URLS__.push(String(url));
        return null;
      };
      window.alert = (message) => {
        window.__E2E_ALERTS__.push(String(message));
      };
    });

    await context.route(
      /^https?:\/\/(?!(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$))/,
      async (route) => {
        unexpectedExternalRequests.push(route.request().url());
        await route.abort("blockedbyclient");
      }
    );

    await use(page);

    const unexpectedBrowserErrors = browserErrors.filter(
      (error) => !allowedConsoleErrors.some((fragment) => error.includes(fragment))
    );

    if (unexpectedBrowserErrors.length || unexpectedExternalRequests.length) {
      await testInfo.attach("browser-diagnostics.json", {
        body: Buffer.from(
          JSON.stringify(
            {
              browserErrors,
              allowedConsoleErrors,
              unexpectedBrowserErrors,
              unexpectedExternalRequests
            },
            null,
            2
          ),
          "utf8"
        ),
        contentType: "application/json"
      });
    }

    expect.soft(unexpectedBrowserErrors, "Aucune erreur JavaScript inattendue").toEqual([]);
    expect
      .soft(unexpectedExternalRequests, "Aucune requête externe réelle ne doit quitter les tests")
      .toEqual([]);
  }
});

export { expect };

export async function openApp(page, path = "/") {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `La navigation vers ${path} doit répondre`).not.toBeNull();
  expect(response.ok(), `La navigation vers ${path} doit réussir`).toBeTruthy();

  await expect(page.locator("#spinBtn")).toHaveCount(1);
  await expect(page.locator("#wheelCanvas")).toHaveAttribute("aria-label", /éléments restants/);
  await expect(page.locator("#wheelCurrentLabel")).not.toHaveText("");
  await expect(page.locator("#menuTabbar")).toBeVisible();

  const requestedView = new URL(page.url()).searchParams.get("vue") || "roue";
  await expect(page.locator("html")).toHaveAttribute("data-view", requestedView);
  if (requestedView === "roue") {
    await expect(page.getByRole("button", { name: "Tourner la roue" })).toBeVisible();
  } else {
    await expect(page.locator("#spinBtn")).toBeHidden();
  }
}

export async function waitForDataView(page) {
  await expect(page.locator("html")).toHaveAttribute("data-view", "donnees");
  await expect(page.locator("#loadingStatus")).toBeHidden({ timeout: 20_000 });
  await expect(page.locator("#resultCount")).toContainText("prélèvement");
  await expect(page.locator("#tableBody .table-detail-button").first()).toBeVisible();
}

export async function spinWheel(page) {
  const resultCard = page.locator("#resultCard");
  const resultText = page.locator("#resultText");
  const canvas = page.locator("#wheelCanvas");
  const previousText = (await resultText.innerText()).trim();
  const previousLabel = (await canvas.getAttribute("aria-label")) || "";
  const countMatch = previousLabel.match(/(\d+) éléments? restants?/);

  if (!countMatch) {
    throw new Error(`Décompte de la roue introuvable dans « ${previousLabel} »`);
  }

  const expectedRemaining = Number(countMatch[1]) - 1;
  await page.getByRole("button", { name: "Tourner la roue" }).click();

  await page.waitForFunction(
    ({ expectedRemaining, previousText }) => {
      const nextLabel = document.querySelector("#wheelCanvas")?.getAttribute("aria-label") || "";
      const nextText = document.querySelector("#resultText")?.innerText.trim() || "";
      return (
        nextLabel.includes(`${expectedRemaining} élément`) && nextText && nextText !== previousText
      );
    },
    { expectedRemaining, previousText },
    { timeout: 20_000 }
  );

  await expect(resultCard).toBeVisible();
  await expect(resultText.locator(".result__title")).toBeVisible();
  return (await resultText.innerText()).trim();
}

export async function waitForServiceWorker(page) {
  return page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers indisponibles dans ce navigateur");
    }

    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Le service worker n'a pas pris le contrôle de la page")),
          15_000
        );
        const done = () => {
          clearTimeout(timer);
          resolve();
        };

        navigator.serviceWorker.addEventListener("controllerchange", done, { once: true });
        if (navigator.serviceWorker.controller) done();
      });
    }

    return {
      activeScript: registration.active?.scriptURL || null,
      controlled: Boolean(navigator.serviceWorker.controller)
    };
  });
}

export async function fulfillCorsJson(route, value, status = 200) {
  const request = route.request();
  const headers = {
    "access-control-allow-headers": "Content-Type",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8"
  };

  if (request.method() === "OPTIONS") {
    await route.fulfill({ status: 204, headers, body: "" });
    return;
  }

  await route.fulfill({ status, headers, body: JSON.stringify(value) });
}
