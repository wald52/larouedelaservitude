import { expect, openApp, test, waitForDataView, waitForServiceWorker } from "./fixtures.mjs";

async function setServiceWorkerRevision(request, revision) {
  const response = await request.post("/__e2e__/service-worker-revision", {
    data: { revision }
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toEqual({ revision });
}

test.beforeEach(async ({ page, request }) => {
  await setServiceWorkerRevision(request, "base");
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.afterEach(async ({ request }) => {
  await setServiceWorkerRevision(request, "base");
});

test.describe("hors ligne", () => {
  test.use({
    allowedConsoleErrors: ["Failed to load resource: net::ERR_INTERNET_DISCONNECTED"]
  });

  test("un deuxième chargement reste utilisable entièrement hors ligne", async ({
    context,
    page
  }) => {
    await openApp(page);
    const worker = await waitForServiceWorker(page);
    expect(worker.controlled).toBeTruthy();

    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await caches.keys()).some((name) => name.startsWith("larouedelaservitude-"))
        )
      )
      .toBeTruthy();

    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 25_000 });
      await expect(page.getByRole("button", { name: "Tourner la roue" })).toBeVisible();
      await expect(page.locator("#menuTabbar")).toBeVisible();

      await page.getByRole("button", { name: "Données" }).click();
      await waitForDataView(page);
      await expect(page.locator("#tableBody .table-detail-button")).toHaveCount(371);
    } finally {
      await context.setOffline(false);
    }
  });
});

test("une nouvelle génération du service worker attend sans recharger la page", async ({
  page,
  request
}) => {
  await openApp(page);
  await waitForServiceWorker(page);

  const before = await page.evaluate(() => ({
    href: window.location.href,
    navigationCount: performance.getEntriesByType("navigation").length,
    timeOrigin: performance.timeOrigin
  }));

  const candidateRevision = `candidate-${Date.now()}`;
  await setServiceWorkerRevision(request, candidateRevision);

  const update = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      throw new Error("Aucun service worker actif avant la vérification de mise à jour");
    }

    await new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(
        () =>
          reject(new Error("La nouvelle génération du service worker n'est pas passée en attente")),
        25_000
      );

      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        registration.removeEventListener("updatefound", inspect);
        resolve();
      };
      const fail = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        registration.removeEventListener("updatefound", inspect);
        reject(error);
      };
      const observe = (worker) => {
        if (!worker) return;
        const onStateChange = () => {
          if (registration.waiting) {
            worker.removeEventListener("statechange", onStateChange);
            finish();
          } else if (worker.state === "redundant") {
            worker.removeEventListener("statechange", onStateChange);
            fail(new Error("La nouvelle génération du service worker est devenue redondante"));
          }
        };
        worker.addEventListener("statechange", onStateChange);
        onStateChange();
      };
      function inspect() {
        if (registration.waiting) {
          finish();
          return;
        }
        observe(registration.installing);
      }

      registration.addEventListener("updatefound", inspect);
      inspect();
      registration.update().then(inspect).catch(fail);
    });

    return {
      controllerIsActive: navigator.serviceWorker.controller === registration.active,
      waitingState: registration.waiting?.state || null
    };
  });

  expect(update.waitingState).toBe("installed");
  expect(update.controllerIsActive).toBeTruthy();

  await page.waitForTimeout(750);
  const after = await page.evaluate(() => ({
    href: window.location.href,
    navigationCount: performance.getEntriesByType("navigation").length,
    timeOrigin: performance.timeOrigin
  }));

  expect(after).toEqual(before);
  await expect(page.getByRole("button", { name: "Tourner la roue" })).toBeVisible();
});
