import { getApiSiteOrigin, getPublicSiteUrl, normalizeBaseUrl } from "./_shared/cors.mjs";
import { escapeHtml, normalizeText, validateImgBbHttpsUrl } from "./_shared/share.mjs";

export const config = {
  path: ["/share", "/.netlify/functions/sharePage"]
};

export function normalizeRedirectUrl(value, publicSiteUrl = getPublicSiteUrl()) {
  const fallback = new URL(normalizeBaseUrl(publicSiteUrl));

  if (!value) return fallback.toString();

  try {
    const candidate = new URL(value);
    const basePath = fallback.pathname.endsWith("/") ? fallback.pathname : `${fallback.pathname}/`;
    const candidatePath = candidate.pathname.endsWith("/")
      ? candidate.pathname
      : `${candidate.pathname}/`;

    const isSameSite =
      candidate.protocol === fallback.protocol && candidate.origin === fallback.origin;
    const isInsideBasePath = candidatePath === basePath || candidatePath.startsWith(basePath);

    if (isSameSite && isInsideBasePath) {
      candidate.username = "";
      candidate.password = "";
      candidate.hash = "";
      return candidate.toString();
    }
  } catch {
    // Repli ci-dessous.
  }

  return fallback.toString();
}

function securityHeaders() {
  return new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Content-Language": "fr",
    "Cache-Control": "public, max-age=300, s-maxage=300",
    "Content-Security-Policy":
      "default-src 'none'; img-src https://i.ibb.co https://ibb.co; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-Robots-Tag": "noindex, nofollow, noarchive"
  });
}

export default async function handler(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  const requestUrl = new URL(request.url);
  let imageUrl;
  try {
    imageUrl = validateImgBbHttpsUrl(requestUrl.searchParams.get("image"));
  } catch {
    return new Response("Invalid image URL", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" }
    });
  }

  const title =
    normalizeText(requestUrl.searchParams.get("title"), 100) || "La roue de la servitude";
  const description =
    normalizeText(requestUrl.searchParams.get("description"), 200) ||
    "Résultat partagé depuis La roue de la servitude.";
  const redirectUrl = normalizeRedirectUrl(requestUrl.searchParams.get("redirect"));

  const canonicalParams = new URLSearchParams({
    image: imageUrl,
    title,
    description,
    redirect: redirectUrl
  });
  const sharePageUrl =
    `${getApiSiteOrigin(request)}${requestUrl.pathname}?` + canonicalParams.toString();

  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedImageUrl = escapeHtml(imageUrl);
  const escapedRedirectUrl = escapeHtml(redirectUrl);
  const escapedSharePageUrl = escapeHtml(sharePageUrl);

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:image" content="${escapedImageUrl}">
    <meta property="og:image:alt" content="Résultat de la roue de la servitude">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapedSharePageUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapedTitle}">
    <meta name="twitter:description" content="${escapedDescription}">
    <meta name="twitter:image" content="${escapedImageUrl}">
    <link rel="canonical" href="${escapedSharePageUrl}">
    <meta http-equiv="refresh" content="0;url=${escapedRedirectUrl}">
    <style>body{font:16px system-ui,sans-serif;margin:2rem;color:#111;background:#fff}a{color:inherit}</style>
  </head>
  <body>
    <p>Redirection vers <a href="${escapedRedirectUrl}">La roue de la servitude</a>…</p>
  </body>
</html>`;

  return new Response(request.method === "HEAD" ? null : html, {
    status: 200,
    headers: securityHeaders()
  });
}
