// Cliente de Gemini Live: token efímero → WebSocket directo, resumption y GoAway.
import { GoogleGenAI, Modality } from '@google/genai';

const TOKEN_URL = '/api/live-token';
const MAX_RECONNECTS = 3;

async function fetchToken() {
  const r = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || `Token HTTP ${r.status}`);
  return body; // { token, model, expireTime }
}

export function createLiveClient(handlers) {
  let session = null;
  let tokenInfo = null;
  let resumeHandle = null;
  let closedByUser = false;
  let reconnects = 0;
  let connecting = false;
  let gen = 0; // ignora eventos de sockets viejos

  const emitStatus = (s, detail) => handlers.onStatus?.(s, detail);

  const onmessage = (msg) => {
    if (msg.setupComplete) {
      reconnects = 0;
      emitStatus('live');
    }
    if (msg.sessionResumptionUpdate?.resumable && msg.sessionResumptionUpdate.newHandle) {
      resumeHandle = msg.sessionResumptionUpdate.newHandle;
    }
    if (msg.goAway) {
      console.info('[live] GoAway, timeLeft=', msg.goAway.timeLeft);
      reconnect('goaway');
      return;
    }
    const sc = msg.serverContent;
    if (!sc) return;
    if (sc.interrupted) handlers.onInterrupted?.();
    // Un evento puede traer varias partes (audio + texto): procesarlas todas.
    for (const part of sc.modelTurn?.parts || []) {
      const d = part.inlineData;
      if (d?.data && d.mimeType?.startsWith('audio/')) {
        const rate = Number(/rate=(\d+)/.exec(d.mimeType)?.[1]) || 24000;
        handlers.onAudio?.(d.data, rate);
      }
    }
    if (sc.outputTranscription?.text) handlers.onTranscript?.(sc.outputTranscription.text);
    if (sc.turnComplete) handlers.onTurnComplete?.();
  };

  async function open() {
    connecting = true;
    const myGen = ++gen;
    emitStatus('connecting');
    try {
      const expired = !tokenInfo || Date.parse(tokenInfo.expireTime) - Date.now() < 30_000;
      // Token nuevo si no hay uno vigente o si no tenemos handle (uses:1 ya se gastó).
      if (expired || !resumeHandle) tokenInfo = await fetchToken();
      const ai = new GoogleGenAI({ apiKey: tokenInfo.token, httpOptions: { apiVersion: 'v1beta' } });
      session = await ai.live.connect({
        model: tokenInfo.model,
        // El resto de la config va bloqueada en el token (api/live-token.js).
        config: {
          responseModalities: [Modality.AUDIO],
          sessionResumption: resumeHandle ? { handle: resumeHandle } : {},
        },
        callbacks: {
          onopen: () => console.info('[live] socket abierto'),
          onmessage: (m) => myGen === gen && onmessage(m),
          onerror: (e) => console.warn('[live] error', e?.message || e),
          onclose: (e) => {
            console.info('[live] socket cerrado', e?.code, e?.reason);
            if (myGen !== gen) return;
            session = null;
            if (!closedByUser && !connecting) reconnect('closed');
          },
        },
      });
    } finally {
      connecting = false;
    }
  }

  async function reconnect(reason) {
    if (closedByUser || connecting) return;
    if (reconnects >= MAX_RECONNECTS) {
      emitStatus('error', 'Se perdió la conexión');
      return;
    }
    reconnects++;
    gen++;
    const old = session;
    session = null;
    try {
      old?.close();
    } catch {
      /* noop */
    }
    emitStatus('reconnecting', reason);
    await new Promise((r) => setTimeout(r, 300 * reconnects));
    try {
      await open();
    } catch (err) {
      console.warn('[live] reconexión falló', err);
      reconnect('retry');
    }
  }

  const send = (payload) => {
    if (!session) return false;
    try {
      session.sendRealtimeInput(payload);
      return true;
    } catch (err) {
      console.warn('[live] send falló', err);
      return false;
    }
  };

  return {
    async start() {
      closedByUser = false;
      reconnects = 0;
      resumeHandle = null;
      tokenInfo = null;
      await open();
    },
    sendAudio: (b64) => send({ audio: { data: b64, mimeType: 'audio/pcm;rate=16000' } }),
    sendFrame: (b64) => send({ video: { data: b64, mimeType: 'image/jpeg' } }),
    activityStart: () => send({ activityStart: {} }),
    activityEnd: () => send({ activityEnd: {} }),
    isOpen: () => !!session,
    stop() {
      closedByUser = true;
      gen++;
      try {
        session?.close();
      } catch {
        /* noop */
      }
      session = null;
      emitStatus('idle');
    },
  };
}
