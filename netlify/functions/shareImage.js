// netlify/functions/shareImage.js

const { corsHeaders: buildCorsHeaders } = require("./_shared/cors");

// Taille maximale du base64 accepté (~6 Mo décodé pour ~8 Mo base64).
const MAX_IMAGE_BASE64_LENGTH = 8 * 1024 * 1024;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateImgBbHttpsUrl(value) {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("Invalid ImgBB image URL");
  }

  const allowedImgBbHosts = new Set(["i.ibb.co", "ibb.co"]);
  if (parsedUrl.protocol !== "https:" || !allowedImgBbHosts.has(parsedUrl.hostname)) {
    throw new Error("Invalid ImgBB image URL");
  }

  return parsedUrl.toString();
}

function getPublicSiteUrl(event) {
  const configuredUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const host = event.headers.host || event.headers.Host;
  if (!host) {
    throw new Error("Missing request host");
  }

  const protocol = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

function getShareMetadata(text) {
  return {
    title: text.split("\n")[0].substring(0, 100),
    description: text.replace(/\n/g, " ").substring(0, 200)
  };
}

exports.handler = async (event) => {
  const corsHeaders = buildCorsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const { imageData, text } = body;
    if (!imageData || !text || typeof imageData !== "string" || typeof text !== "string") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing imageData or text" })
      };
    }

    if (imageData.length > MAX_IMAGE_BASE64_LENGTH) {
      return {
        statusCode: 413,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Image too large" })
      };
    }

    // On accepte un data-URI image ou du base64 brut, mais rien d'autre.
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Image)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid image data" })
      };
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

    if (!IMGBB_API_KEY) {
      console.error("Missing IMGBB_API_KEY env var");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Server configuration error" })
      };
    }

    const formData = new URLSearchParams();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Image);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let imageUrl;
    try {
      const imgResp = await fetch(
        "https://api.imgbb.com/1/upload",
        { method: "POST", body: formData, signal: controller.signal }
      );
      clearTimeout(timeout);
      const imgJson = await imgResp.json();

      if (!imgJson.success) {
        throw new Error(imgJson.error?.message || "Unknown ImgBB error");
      }

      imageUrl = validateImgBbHttpsUrl(imgJson.data?.url);
    } catch (err) {
      clearTimeout(timeout);
      console.error("ImgBB Upload failed:", err);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Failed to upload to ImgBB" })
      };
    }

    const siteUrl = getPublicSiteUrl(event);
    const { title, description } = getShareMetadata(text);
    const shareParams = new URLSearchParams({
      image: imageUrl,
      title,
      description,
      redirect: siteUrl
    });
    const sharePageUrl = `${siteUrl}/.netlify/functions/sharePage?${shareParams.toString()}`;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        imageUrl,
        sharePageUrl
      })
    };
  } catch (err) {
    console.error("Fatal Error shareImage:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};

exports.escapeHtml = escapeHtml;
exports.validateImgBbHttpsUrl = validateImgBbHttpsUrl;
