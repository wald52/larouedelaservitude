// netlify/functions/shareImage.js

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateImgBbHttpsUrl(value) {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch (err) {
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
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

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
    } catch (e) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const { imageData, text } = body;
    if (!imageData || !text) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing imageData or text" })
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

    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");
    const formData = new URLSearchParams();
    formData.append("image", base64Image);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let imageUrl;
    try {
      const imgResp = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData, signal: controller.signal }
      );
      clearTimeout(timeout);
      const imgJson = await imgResp.json();

      if (!imgJson.success) {
        throw new Error(imgJson.error?.message || "Unknown ImgBB error");
      }

      imageUrl = validateImgBbHttpsUrl(imgJson.data?.url);
      console.log("✅ Image uploaded:", imageUrl);
    } catch (err) {
      clearTimeout(timeout);
      console.error("ImgBB Upload failed:", err);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Failed to upload to ImgBB", details: err.message })
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
      body: JSON.stringify({ error: "Internal server error", message: err.message })
    };
  }
};

exports.escapeHtml = escapeHtml;
exports.validateImgBbHttpsUrl = validateImgBbHttpsUrl;
