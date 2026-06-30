// netlify/functions/sharePage.js

const { escapeHtml, validateImgBbHttpsUrl } = require("./shareImage");

function normalizeText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().substring(0, maxLength);
}

function normalizeRedirectUrl(value, event) {
  const host = event.headers.host || event.headers.Host;
  const fallbackProtocol = host?.includes("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  const fallbackUrl = host ? `${fallbackProtocol}://${host}` : "/";

  if (!value || !host) {
    return fallbackUrl;
  }

  try {
    const parsedUrl = new URL(value);
    if ((parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") && parsedUrl.host === host) {
      return parsedUrl.toString().replace(/\/$/, "");
    }
  } catch (err) {
    return fallbackUrl;
  }

  return fallbackUrl;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    return {
      statusCode: 405,
      headers: { Allow: "GET, HEAD" },
      body: "Method not allowed"
    };
  }

  const params = event.queryStringParameters || {};
  let imageUrl;
  try {
    imageUrl = validateImgBbHttpsUrl(params.image);
  } catch (err) {
    return { statusCode: 400, body: "Invalid image URL" };
  }

  const title = normalizeText(params.title, 100) || "La roue de la servitude";
  const description = normalizeText(params.description, 200) || "Résultat partagé depuis La roue de la servitude.";
  const redirectUrl = normalizeRedirectUrl(params.redirect, event);
  const sharePageUrl = `${redirectUrl}/.netlify/functions/sharePage?${new URLSearchParams(params).toString()}`;

  const escapedTitle = escapeHtml(title);
  const escapedDesc = escapeHtml(description);
  const escapedImageUrl = escapeHtml(imageUrl);
  const escapedRedirectUrl = escapeHtml(redirectUrl);
  const escapedSharePageUrl = escapeHtml(sharePageUrl);
  const redirectScriptUrl = JSON.stringify(redirectUrl);

  const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapedTitle}</title>
<meta property="og:title" content="${escapedTitle}">
<meta property="og:description" content="${escapedDesc}">
<meta property="og:image" content="${escapedImageUrl}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapedSharePageUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${escapedImageUrl}">
<link rel="canonical" href="${escapedSharePageUrl}">
<meta http-equiv="refresh" content="0; url=${escapedRedirectUrl}">
</head><body><script>window.location.href=${redirectScriptUrl};</script></body></html>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    },
    body: event.httpMethod === "HEAD" ? "" : html
  };
};
