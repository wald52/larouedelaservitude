// netlify/functions/uploadShareGraphQL.js
// Node 18 compatible (Netlify functions)
const fetch = global.fetch || require("node-fetch");

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

function graphqlRequest(token, query, variables = {}) {
  return fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "netlify-function-uploadShareGraphQL"
    },
    body: JSON.stringify({ query, variables })
  }).then(r => r.json());
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
    }

    const {
      GITHUB_TOKEN,
      GITHUB_REPO_OWNER,
      GITHUB_REPO_NAME,
      GITHUB_BRANCH = "main"
    } = process.env;

    if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Missing GitHub configuration in env vars" })
      };
    }

    const payload = JSON.parse(event.body || "{}");
    const { filename, contentBase64, folder = "public/shares", commitMessage } = payload;

    if (!filename || !contentBase64) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Missing filename or contentBase64" }) };
    }

    // sanitize filename and path
    const safeFile = filename.replace(/[^a-zA-Z0-9_\-\.]/g, "-");
    const path = `${folder.replace(/^\/+|\/+$/g, "")}/${safeFile}`;

    // 1) get repository id
    const repoQuery = `
      query($owner:String!, $name:String!) {
        repository(owner:$owner, name:$name) { id }
      }
    `;
    const repoRes = await graphqlRequest(GITHUB_TOKEN, repoQuery, { owner: GITHUB_REPO_OWNER, name: GITHUB_REPO_NAME });
    if (repoRes.errors) throw new Error(repoRes.errors[0].message);
    const repoId = repoRes.data?.repository?.id;
    if (!repoId) throw new Error("Repository not found or access denied");

    // 2) create blob with the base64 content
    const createBlobMutation = `
      mutation($content: Base64String!) {
        createBlob(input: { content: $content, encoding: BASE64 }) {
          blob { oid }
        }
      }
    `;
    const blobRes = await graphqlRequest(GITHUB_TOKEN, createBlobMutation, { content: contentBase64 });
    if (blobRes.errors) throw new Error(blobRes.errors[0].message);
    const blobOid = blobRes.data.createBlob.blob.oid;

    // 3) create tree containing our new file
    const createTreeMutation = `
      mutation($repoId: ID!, $entries: [CreateTreeEntry!]!) {
        createTree(input: { repositoryId: $repoId, entries: $entries }) {
          tree { oid }
        }
      }
    `;
    const entries = [{
      path,
      mode: "BLOB",
      type: "BLOB",
      oid: blobOid
    }];
    const treeRes = await graphqlRequest(GITHUB_TOKEN, createTreeMutation, { repoId, entries });
    if (treeRes.errors) throw new Error(treeRes.errors[0].message);
    const treeOid = treeRes.data.createTree.tree.oid;

    // 4) create commit on branch
    const createCommitMutation = `
      mutation($repoId: ID!, $branchName: String!, $treeOid: GitObjectID!, $message: String!) {
        createCommitOnBranch(input: {
          branch: { repositoryNameWithOwner: $repoNameWithOwner, branchName: $branchName },
          message: { headline: $message },
          tree: $treeOid
        }) {
          commit { oid, url }
        }
      }
    `;
    // Note: GraphQL expects repositoryNameWithOwner string for createCommitOnBranch
    const repoNameWithOwner = `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
    const commitMessageFinal = commitMessage || `Add share image ${safeFile}`;
    const commitRes = await graphqlRequest(GITHUB_TOKEN, createCommitMutation, {
      repoId,
      repoNameWithOwner,
      branchName: GITHUB_BRANCH,
      treeOid,
      message: commitMessageFinal
    });
    if (commitRes.errors) throw new Error(commitRes.errors[0].message);

    // Raw content public URL
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${path}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, url: rawUrl })
    };

  } catch (err) {
    console.error("uploadShareGraphQL error:", err && (err.stack || err.message || err));
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: (err && err.message) || "server_error" })
    };
  }
};
