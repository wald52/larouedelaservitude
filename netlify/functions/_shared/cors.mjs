const DEFAULT_PUBLIC_SITE_URL = "https://wald52.github.io/larouedelaservitude/";
const DEFAULT_API_SITE_URL = "https://larouedelaservitude.netlify.app/";

function parseHttpUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

export function normalizeBaseUrl(value, fallback = DEFAULT_PUBLIC_SITE_URL) {
  const parsed = parseHttpUrl(value) || parseHttpUrl(fallback);
  if (!parsed) throw new Error("URL publique invalide");

  parsed.hash = "";
  parsed.search = "";
  if (!parsed.pathname.endsWith("/")) parsed.pathname += "/";
  return parsed.toString();
}

export function getPublicSiteUrl() {
  return normalizeBaseUrl(process.env.PUBLIC_SITE_URL, DEFAULT_PUBLIC_SITE_URL);
}

export function getApiSiteOrigin(request) {
  const requestUrl = parseHttpUrl(request?.url);
  if (requestUrl) return requestUrl.origin;

  const configured =
    parseHttpUrl(process.env.DEPLOY_PRIME_URL) ||
    parseHttpUrl(process.env.URL) ||
    parseHttpUrl(DEFAULT_API_SITE_URL);
  return configured.origin;
}

export function getAllowedOrigins(request) {
  const candidates = [
    getPublicSiteUrl(),
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    DEFAULT_API_SITE_URL
  ];

  if (process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev") {
    candidates.push("http://localhost:8888", "http://127.0.0.1:8888");
  }

  const origins = new Set();
  for (const candidate of candidates) {
    const parsed = parseHttpUrl(candidate);
    if (parsed) origins.add(parsed.origin);
  }

  const requestUrl = parseHttpUrl(request?.url);
  if (requestUrl && origins.has(requestUrl.origin)) origins.add(requestUrl.origin);

  return origins;
}

export function isAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && getAllowedOrigins(request).has(origin));
}

export function corsHeaders(request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = getAllowedOrigins(request).has(origin) ? origin : "null";

  return new Headers({
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    Vary: "Origin"
  });
}
