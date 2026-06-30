// netlify/functions/shareImage.js

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
  } catch (err) {
    throw new Error("Invalid ImgBB image URL");
  }

  const allowedImgBbHosts = new Set(["i.ibb.co", "ibb.co"]);
  if (parsedUrl.protocol !== "https:" || !allowedImgBbHosts.has(parsedUrl.hostname)) {
    throw new Error("Invalid ImgBB image URL");
  }

  return parsedUrl.toString();
}

exports.handler = async (event, context) => {

  // -------------------------------------------------------
  // 1) CORS
  // -------------------------------------------------------
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
    // -------------------------------------------------------
    // 2) Parse Body
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // 3) Env Vars
    // -------------------------------------------------------
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!IMGBB_API_KEY || !GITHUB_TOKEN) {
      console.error("Missing env vars");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Server configuration error" })
      };
    }

    // -------------------------------------------------------
    // 4) Upload ImgBB
    // -------------------------------------------------------
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
      console.error("ImgBB Upload failed:", err);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Failed to upload to ImgBB", details: err.message })
      };
    }

    // -------------------------------------------------------
    // 5) Préparation GitHub
    // -------------------------------------------------------
    const GITHUB_OWNER = "wald52";
    const GITHUB_REPO = "larouedelaservitude";
    const GITHUB_BRANCH = "main";

    const shareId = `share-${Date.now()}`;
    const siteUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}`;

    const cleanTitle = text.split("\n")[0].substr(0, 100);
    const cleanDesc = text.replace(/\n/g, " ").substr(0, 200);
    const escapedTitle = escapeHtml(cleanTitle);
    const escapedDesc = escapeHtml(cleanDesc);
    const escapedImageUrl = escapeHtml(imageUrl);
    const escapedSiteUrl = escapeHtml(siteUrl);
    const redirectScriptUrl = JSON.stringify(siteUrl);

    const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapedTitle}</title>
<meta property="og:title" content="${escapedTitle}">
<meta property="og:description" content="${escapedDesc}">
<meta property="og:image" content="${escapedImageUrl}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapedSiteUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${escapedImageUrl}">
<meta http-equiv="refresh" content="0; url=${escapedSiteUrl}">
</head><body><script>window.location.href=${redirectScriptUrl};</script></body></html>`;

    const base64Html = Buffer.from(html, "utf8").toString("base64");
    const githubPath = `shares/${shareId}.html`;

    // -------------------------------------------------------
    // 6) 🔥 RÉCUPÉRATION CORRECTE DU HEAD OID
    // -------------------------------------------------------
    const headQuery = `
      query($owner: String!, $repo: String!, $branch: String!) {
        repository(owner: $owner, name: $repo) {
          ref(qualifiedName: $branch) {
            target {
              ... on Commit { oid }
            }
          }
        }
      }
    `;

    const headResp = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: headQuery,
        variables: {
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          branch: `refs/heads/${GITHUB_BRANCH}`
        }
      })
    });

    const headJson = await headResp.json();
    const headOid = headJson.data?.repository?.ref?.target?.oid;

    if (!headOid) throw new Error("Impossible de récupérer le HEAD OID GitHub");


    // -------------------------------------------------------
    // 7) Mutation GitHub stable
    // -------------------------------------------------------
    const commitMutation = `
      mutation($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) {
          commit { url }
        }
      }
    `;

    const commitResp = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: commitMutation,
        variables: {
          input: {
            branch: {
              repositoryNameWithOwner: `${GITHUB_OWNER}/${GITHUB_REPO}`,
              branchName: GITHUB_BRANCH
            },
            message: { headline: `Add share ${shareId}` },
            fileChanges: {
              additions: [{ path: githubPath, contents: base64Html }]
            },
            expectedHeadOid: headOid
          }
        }
      })
    });

    const commitJson = await commitResp.json();
    if (commitJson.errors) throw new Error(JSON.stringify(commitJson.errors));

    // -------------------------------------------------------
    // 8) Retour OK
    // -------------------------------------------------------
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        imageUrl,
        sharePageUrl: `${siteUrl}/shares/${shareId}.html`
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
