import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const HOST = process.env.E2E_HOST || "127.0.0.1";
const PORT = Number(process.env.E2E_PORT || 4173);
const CONTROL_ENABLED = process.env.PLAYWRIGHT_TEST === "1";
const CONTROL_PATH = "/__e2e__/service-worker-revision";
const MAX_CONTROL_BODY = 4096;

let serviceWorkerRevision = "base";

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"]
]);

function sendJson(response, statusCode, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": body.length,
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_CONTROL_BODY) {
      throw new Error("Control request body too large");
    }
    chunks.push(chunk);
  }

  const source = Buffer.concat(chunks).toString("utf8");
  return source ? JSON.parse(source) : {};
}

function resolveRequestedFile(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decodedPath === "/" || decodedPath === "/index") {
    decodedPath = "/index.html";
  } else if (decodedPath.endsWith("/")) {
    decodedPath += "index.html";
  }

  const candidate = resolve(ROOT, `.${decodedPath}`);
  const rel = relative(ROOT, candidate);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    return null;
  }

  return candidate;
}

async function serveStatic(request, response, pathname) {
  const candidate = resolveRequestedFile(pathname);
  if (!candidate) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  let filePath = candidate;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = resolve(filePath, "index.html");
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }

  let body;
  try {
    body = await readFile(filePath);
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }

  const relativeName = relative(ROOT, filePath).split(sep).join("/");
  const isServiceWorker = relativeName === "service-worker.js";
  if (isServiceWorker && serviceWorkerRevision !== "base") {
    body = Buffer.concat([
      body,
      Buffer.from(`\n// Playwright revision: ${JSON.stringify(serviceWorkerRevision)}\n`)
    ]);
  }

  const headers = {
    "Cache-Control": isServiceWorker ? "no-cache, no-store, must-revalidate" : "no-store",
    "Content-Length": body.length,
    "Content-Type": MIME_TYPES.get(extname(filePath).toLowerCase()) || "application/octet-stream",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff"
  };
  if (isServiceWorker) headers["Service-Worker-Allowed"] = "/";

  response.writeHead(200, headers);
  response.end(request.method === "HEAD" ? undefined : body);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);

  if (url.pathname === CONTROL_PATH) {
    if (!CONTROL_ENABLED) {
      response.writeHead(404).end("Not found");
      return;
    }
    if (request.method !== "POST") {
      response.writeHead(405, { Allow: "POST" }).end("Method not allowed");
      return;
    }

    try {
      const body = await readJsonBody(request);
      const revision = String(body.revision || "").trim();
      if (!revision || revision.length > 100) {
        sendJson(response, 400, { error: "Invalid revision" });
        return;
      }
      serviceWorkerRevision = revision;
      sendJson(response, 200, { revision: serviceWorkerRevision });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  await serveStatic(request, response, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`[E2E] Static server listening on http://${HOST}:${PORT}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
  });
}
