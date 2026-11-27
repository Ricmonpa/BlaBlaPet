// Cliente del proxy /api/gemini. Imita la interfaz que usaban los servicios con
// @google/generative-ai (model.generateContent(...) → { response: { text() } })
// para no tocar la lógica del flujo existente. La API key vive solo en el server.

const ENDPOINT = '/api/gemini';
// Vercel limita el body de una función a ~4.5 MB: los medios inline más grandes
// se suben con el Files API (bytes directo del navegador a Google).
const MAX_INLINE_BASE64 = 3 * 1024 * 1024;

async function post(payload) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.error?.message || data?.error || `HTTP ${r.status}`;
    throw new Error(`[${r.status}] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
  }
  return data;
}

function base64ToBlob(b64, mimeType) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

async function uploadToFilesApi(b64, mimeType) {
  const blob = base64ToBlob(b64, mimeType);
  const { uploadUrl } = await post({ action: 'upload-start', mimeType, size: blob.size, displayName: 'blablapet-media' });
  const up = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' },
    body: blob,
  });
  if (!up.ok) throw new Error(`Files API upload failed: ${up.status}`);
  let file = (await up.json()).file;
  // Los videos se procesan antes de poder usarse.
  for (let i = 0; i < 60 && file.state === 'PROCESSING'; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    file = await post({ action: 'file-status', name: file.name });
  }
  if (file.state !== 'ACTIVE') throw new Error(`Files API: archivo en estado ${file.state}`);
  return { fileData: { fileUri: file.uri, mimeType: file.mimeType || mimeType } };
}

// Acepta las mismas formas que el SDK viejo: string, array de strings/parts,
// o { contents, generationConfig }.
function normalize(request) {
  if (typeof request === 'string') request = [request];
  if (Array.isArray(request)) request = { contents: [{ role: 'user', parts: request }] };
  const contents = request.contents.map((c) => ({
    role: c.role || 'user',
    parts: (Array.isArray(c.parts) ? c.parts : [c.parts]).map((p) => {
      if (typeof p === 'string') return { text: p };
      // Solo campos válidos para la API (algunos servicios agregan metadata propia).
      if (p.text != null) return { text: p.text };
      if (p.inlineData) return { inlineData: { data: p.inlineData.data, mimeType: p.inlineData.mimeType } };
      if (p.fileData) return { fileData: p.fileData };
      return p;
    }),
  }));
  return { contents, generationConfig: request.generationConfig };
}

async function generateContent(model, request) {
  const { contents, generationConfig } = normalize(request);

  const inlineSize = contents.reduce(
    (n, c) => n + c.parts.reduce((m, p) => m + (p.inlineData?.data?.length || 0), 0),
    0
  );
  if (inlineSize > MAX_INLINE_BASE64) {
    for (const c of contents) {
      for (let i = 0; i < c.parts.length; i++) {
        const p = c.parts[i];
        if (p.inlineData && p.inlineData.data.length > 256 * 1024) {
          c.parts[i] = await uploadToFilesApi(p.inlineData.data, p.inlineData.mimeType);
        }
      }
    }
  }

  const data = await post({ action: 'generate', model, contents, generationConfig });
  const candidates = data.candidates || [];
  const response = {
    candidates,
    usageMetadata: data.usageMetadata,
    promptFeedback: data.promptFeedback,
    text() {
      const parts = candidates[0]?.content?.parts || [];
      const text = parts.map((p) => p.text || '').join('');
      if (!text && (data.promptFeedback?.blockReason || candidates[0]?.finishReason === 'SAFETY')) {
        throw new Error(`Respuesta bloqueada: ${data.promptFeedback?.blockReason || 'SAFETY'}`);
      }
      return text;
    },
  };
  return { response };
}

export function createProxyModel(model) {
  return { model, generateContent: (request) => generateContent(model, request) };
}
