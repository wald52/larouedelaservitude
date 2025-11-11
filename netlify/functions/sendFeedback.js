// netlify/functions/sendFeedback.js
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { resultText, userMessage, userEmail, honeypot } = payload;

    // basic spam prevention
    if (honeypot) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, note: 'spam' }) };
    }
    if (!resultText || !userMessage || userMessage.trim().length < 3) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid input' }) };
    }

    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME  = process.env.REPO_NAME;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!REPO_OWNER || !REPO_NAME || !GITHUB_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ ok:false, error:'Server not configured' }) };
    }

    const title = `Retour : ${resultText.slice(0, 80)}`;
    const body = [
      `**Résultat:** ${resultText}`,
      ``,
      `**Message utilisateur:**`,
      userMessage,
      ``,
      `**Email (optionnel):** ${userEmail || '(non précisé)'}`,
      ``,
      `*Envoyé depuis la page La roue de la servitude*`
    ].join('\n');

    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['feedback']
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('GitHub API error', resp.status, text);
      return { statusCode: 502, body: JSON.stringify({ ok:false, error:'GitHub API error' }) };
    }

    const data = await resp.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, url: data.html_url })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: 'Server error' }) };
  }
}
