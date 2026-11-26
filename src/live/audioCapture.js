// Captura de micrófono + VAD por energía (cliente).
// Abre una "actividad" con cualquier sonido fuerte (ladrido, gruñido o voz humana),
// manda pre-roll + audio mientras dura, y la cierra tras VAD.silenceMs de silencio.
// Gemini decide si habla o no (proactive audio + prompt).
import captureWorkletUrl from './pcm-capture.worklet.js?url';
import { AUDIO_IN_RATE, CHUNK_MS, VAD } from './config.js';

export function int16ToBase64(int16) {
  const bytes = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

export async function createAudioCapture(audioStream, handlers) {
  // Pedimos 16 kHz para que el navegador resamplee nativo; si no, el worklet lo hace.
  let ctx;
  try {
    ctx = new AudioContext({ sampleRate: AUDIO_IN_RATE });
  } catch {
    ctx = new AudioContext();
  }
  await ctx.audioWorklet.addModule(captureWorkletUrl);
  const source = ctx.createMediaStreamSource(audioStream);
  const node = new AudioWorkletNode(ctx, 'pcm-capture', { processorOptions: { chunkMs: CHUNK_MS } });
  source.connect(node);
  // No conectamos a destination: no queremos oír el micrófono.

  const prerollMax = Math.ceil(VAD.prerollMs / CHUNK_MS);
  const silenceChunks = Math.ceil(VAD.silenceMs / CHUNK_MS);
  const maxChunks = Math.ceil(VAD.maxActivityMs / CHUNK_MS);

  const state = {
    threshold: VAD.defaultThreshold,
    muted: false, // half-duplex mientras habla el perro
    active: false,
    loudRun: 0,
    quietRun: 0,
    activeChunks: 0,
    preroll: [],
  };

  const endActivity = (reason) => {
    state.active = false;
    state.quietRun = 0;
    state.activeChunks = 0;
    handlers.onActivityEnd?.(reason);
  };

  node.port.onmessage = ({ data }) => {
    const { pcm, rms } = data;
    handlers.onLevel?.(rms);

    if (state.muted) {
      state.loudRun = 0;
      state.preroll.length = 0;
      if (state.active) endActivity('muted');
      return;
    }

    const loud = rms >= state.threshold;

    if (!state.active) {
      state.preroll.push(pcm);
      if (state.preroll.length > prerollMax) state.preroll.shift();
      state.loudRun = loud ? state.loudRun + 1 : 0;
      if (state.loudRun >= VAD.onsetChunks) {
        state.active = true;
        state.loudRun = 0;
        state.quietRun = 0;
        handlers.onActivityStart?.();
        for (const c of state.preroll) handlers.onAudioChunk?.(int16ToBase64(c));
        state.activeChunks = state.preroll.length;
        state.preroll.length = 0;
      }
      return;
    }

    handlers.onAudioChunk?.(int16ToBase64(pcm));
    state.activeChunks++;
    state.quietRun = loud ? 0 : state.quietRun + 1;
    if (state.quietRun >= silenceChunks) endActivity('silence');
    else if (state.activeChunks >= maxChunks) endActivity('max');
  };

  return {
    sampleRate: ctx.sampleRate,
    setThreshold(v) {
      state.threshold = v;
    },
    setMuted(m) {
      state.muted = m;
    },
    isActive: () => state.active,
    async resume() {
      if (ctx.state === 'suspended') await ctx.resume();
    },
    async stop() {
      node.port.onmessage = null;
      source.disconnect();
      node.disconnect();
      await ctx.close().catch(() => {});
    },
  };
}
