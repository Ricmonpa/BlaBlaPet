// AudioWorklet: reproduce chunks PCM16 (24 kHz de Gemini) con una cola simple.
// Mensajes: { type: 'push', pcm: Int16Array, rate } | { type: 'flush' }
// Emite: { type: 'start' } al empezar a sonar, { type: 'drained' } al vaciarse.
/* global sampleRate, registerProcessor, AudioWorkletProcessor */

class PcmPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = []; // Float32Array[] ya al sampleRate del contexto
    this.cur = null;
    this.idx = 0;
    this.playing = false;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'flush') {
        this.queue = [];
        this.cur = null;
        this.idx = 0;
        if (this.playing) {
          this.playing = false;
          this.port.postMessage({ type: 'drained', flushed: true });
        }
      } else if (data.type === 'push') {
        this.queue.push(this.convert(data.pcm, data.rate));
      }
    };
  }

  convert(pcm, rate) {
    const ratio = rate / sampleRate;
    const outLen = Math.floor(pcm.length / ratio);
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const p = i * ratio;
      const j = Math.floor(p);
      const a = pcm[j] / 32768;
      const b = (j + 1 < pcm.length ? pcm[j + 1] : pcm[j]) / 32768;
      out[i] = a + (b - a) * (p - j);
    }
    return out;
  }

  process(_inputs, outputs) {
    const out = outputs[0][0];
    let o = 0;
    while (o < out.length) {
      if (!this.cur || this.idx >= this.cur.length) {
        this.cur = this.queue.shift() || null;
        this.idx = 0;
        if (!this.cur) break;
        if (!this.playing) {
          this.playing = true;
          this.port.postMessage({ type: 'start' });
        }
      }
      const n = Math.min(out.length - o, this.cur.length - this.idx);
      out.set(this.cur.subarray(this.idx, this.idx + n), o);
      o += n;
      this.idx += n;
    }
    if (o < out.length) {
      out.fill(0, o);
      if (this.playing && !this.cur) {
        this.playing = false;
        this.port.postMessage({ type: 'drained' });
      }
    }
    for (let c = 1; c < outputs[0].length; c++) outputs[0][c].set(out);
    return true;
  }
}

registerProcessor('pcm-player', PcmPlayerProcessor);
