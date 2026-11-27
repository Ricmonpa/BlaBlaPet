/* global process, Buffer */
// Proxy server-side para Gemini: la API key nunca llega al navegador.
// Un solo endpoint (para no gastar funciones del plan Hobby) con 3 acciones:
//   generate      → models/{model}:generateContent (body chico: texto, frames o fileData)
//   upload-start  → abre una subida resumible del Files API y devuelve la upload URL;
//                   el navegador sube los bytes DIRECTO a Google (esa URL no lleva key),
//                   así los videos grandes no pasan por el límite de 4.5 MB de Vercel.
//   file-status   → estado del archivo subido (PROCESSING / ACTIVE / FAILED)

export const config = { maxDuration: 300 };

const API = 'https://generativelanguage.googleapis.com';
const MODEL_RE = /^gemini-[a-z0-9.-]+$/;
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?blablapet\.com$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
];

// Rate limit en memoria por IP (best-effort, se reinicia en cold start).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 120;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX_PER_WINDOW;
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const originOk = ALLOWED_ORIGINS.some((re) => re.test(origin));
  if (originOk) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(originOk ? 204 : 403).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!originOk) return res.status(403).json({ error: 'Origin not allowed' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'quota: too many requests (429)' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    if (body.action === 'generate') {
      const { model, contents, generationConfig } = body;
      if (!MODEL_RE.test(model || '')) return res.status(400).json({ error: 'Invalid model' });
      if (!Array.isArray(contents)) return res.status(400).json({ error: 'contents required' });
      const r = await fetch(`${API}/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents, generationConfig }),
      });
      const data = await r.json().catch(() => ({}));
      return res.status(r.status).json(data);
    }

    if (body.action === 'upload-start') {
      const { mimeType, size, displayName } = body;
      if (!/^(video|image|audio)\/[\w.+-]+$/.test(mimeType || '') || !(size > 0) || size > 2e9) {
        return res.status(400).json({ error: 'Invalid upload params' });
      }
      const r = await fetch(`${API}/upload/v1beta/files`, {
        method: 'POST',
        headers: {
          'x-goog-api-key': key,
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': String(size),
          'X-Goog-Upload-Header-Content-Type': mimeType,
          'Content-Type': 'application/json',
          // La sesión la usa el navegador: Google valida CORS contra este origin.
          Origin: origin,
        },
        body: JSON.stringify({ file: { display_name: String(displayName || 'blablapet-media').slice(0, 100) } }),
      });
      const uploadUrl = r.headers.get('x-goog-upload-url');
      if (!r.ok || !uploadUrl) {
        const text = await r.text().catch(() => '');
        return res.status(r.status || 502).json({ error: 'upload-start failed', detail: text.slice(0, 300) });
      }
      return res.status(200).json({ uploadUrl });
    }

    if (body.action === 'file-status') {
      const name = String(body.name || '');
      if (!/^files\/[a-z0-9-]+$/.test(name)) return res.status(400).json({ error: 'Invalid file name' });
      const r = await fetch(`${API}/v1beta/${name}`, { headers: { 'x-goog-api-key': key } });
      const data = await r.json().catch(() => ({}));
      return res.status(r.status).json({ name: data.name, uri: data.uri, mimeType: data.mimeType, state: data.state, error: data.error });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('gemini proxy error:', err?.message || err);
    return res.status(502).json({ error: 'Gemini proxy failed' });
  }
}
