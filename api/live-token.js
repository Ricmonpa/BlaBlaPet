import { GoogleGenAI } from '@google/genai';
import { LIVE_MODEL, buildLockedLiveConfig } from '../src/live/config.js';

// Emite un token efímero para que el celular se conecte DIRECTO a Gemini Live
// sin ver la API key. La config de la sesión (modelo, prompt, voz, VAD...) queda
// bloqueada dentro del token, así el cliente no puede cambiarla.

const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?blablapet\.com$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/, // pruebas en LAN desde el celular
];

// Rate limit en memoria por IP (best-effort: se reinicia con cada cold start).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX_PER_WINDOW;
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
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many sessions, try later' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1beta' } });
    const now = Date.now();
    const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(now + 60 * 1000).toISOString();

    const token = await client.authTokens.create({
      config: {
        uses: 1, // reanudar sesión no cuenta como uso
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: { model: LIVE_MODEL, config: buildLockedLiveConfig() },
        // [] = bloquear exactamente los campos definidos arriba.
        lockAdditionalFields: [],
      },
    });

    return res.status(200).json({ token: token.name, model: LIVE_MODEL, expireTime });
  } catch (err) {
    console.error('live-token error:', err?.message || err);
    return res.status(502).json({ error: 'Could not create live token' });
  }
}
