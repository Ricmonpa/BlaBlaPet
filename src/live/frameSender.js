// Toma un frame JPEG reducido del <video> a VIDEO.fps (máx 1 FPS según la doc)
// y lo entrega en base64. Un solo canvas reutilizado; sin procesamiento extra.
// sendNow(): frame alineado a un evento (p. ej. inicio de ladrido). Reinicia el
// reloj de 1 FPS desde ahí y respeta un hueco mínimo para no pasarse del límite.
import { VIDEO } from './config.js';

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export function createFrameSender(videoEl, onFrame) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  let timer = null;
  let busy = false;
  let lastSent = 0;
  let pending = null;
  const interval = 1000 / VIDEO.fps;

  const grab = async () => {
    if (busy || !videoEl.videoWidth || document.hidden) return;
    busy = true;
    try {
      const scale = Math.min(1, VIDEO.maxSide / Math.max(videoEl.videoWidth, videoEl.videoHeight));
      const w = Math.round(videoEl.videoWidth * scale);
      const h = Math.round(videoEl.videoHeight * scale);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      ctx.drawImage(videoEl, 0, 0, w, h);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', VIDEO.jpegQuality));
      if (blob) {
        lastSent = performance.now();
        onFrame(await blobToBase64(blob));
      }
    } finally {
      busy = false;
    }
  };

  const restartClock = () => {
    clearInterval(timer);
    timer = setInterval(grab, interval);
  };

  return {
    start() {
      if (!timer) timer = setInterval(grab, interval);
    },
    sendNow() {
      if (!timer || pending) return;
      const wait = Math.max(0, lastSent + VIDEO.minEventGapMs - performance.now());
      pending = setTimeout(() => {
        pending = null;
        if (!timer) return;
        restartClock();
        grab();
      }, wait);
    },
    stop() {
      clearInterval(timer);
      clearTimeout(pending);
      timer = null;
      pending = null;
    },
  };
}
