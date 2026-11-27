// Reproductor de la voz del perro (PCM16 24 kHz base64 → bocina).
import playerWorkletUrl from './pcm-player.worklet.js?url';
import { AUDIO_OUT_RATE } from './config.js';

export function base64ToInt16(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer, 0, bytes.length >> 1);
}

export async function createAudioPlayer({ onStart, onDrained } = {}) {
  let ctx;
  try {
    ctx = new AudioContext({ sampleRate: AUDIO_OUT_RATE, latencyHint: 'interactive' });
  } catch {
    ctx = new AudioContext({ latencyHint: 'interactive' });
  }
  await ctx.audioWorklet.addModule(playerWorkletUrl);
  const node = new AudioWorkletNode(ctx, 'pcm-player', { outputChannelCount: [1] });
  node.connect(ctx.destination);
  node.port.onmessage = ({ data }) => {
    if (data.type === 'start') onStart?.();
    else if (data.type === 'drained') onDrained?.(data.flushed);
  };

  return {
    push(b64, rate = AUDIO_OUT_RATE) {
      const pcm = base64ToInt16(b64);
      node.port.postMessage({ type: 'push', pcm, rate }, [pcm.buffer]);
    },
    flush() {
      node.port.postMessage({ type: 'flush' });
    },
    async resume() {
      if (ctx.state === 'suspended') await ctx.resume();
    },
    async stop() {
      node.disconnect();
      await ctx.close().catch(() => {});
    },
  };
}
