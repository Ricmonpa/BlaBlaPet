// AudioWorklet: micrófono → PCM16 16 kHz en chunks fijos + RMS por chunk.
// Ligero a propósito (Moto G50): resampleo lineal y nada más.

const TARGET_RATE = 16000;

class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const chunkMs = options?.processorOptions?.chunkMs || 40;
    this.chunkSize = Math.round((TARGET_RATE * chunkMs) / 1000);
    this.ratio = sampleRate / TARGET_RATE; // 1 si el AudioContext ya está a 16 kHz
    this.pos = 0; // posición fraccional en la entrada
    this.prev = 0; // última muestra del bloque anterior (para interpolar)
    this.buf = new Int16Array(this.chunkSize);
    this.len = 0;
    this.sumSq = 0;
  }

  push(sample) {
    const s = Math.max(-1, Math.min(1, sample));
    this.buf[this.len++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    this.sumSq += s * s;
    if (this.len === this.chunkSize) {
      const rms = Math.sqrt(this.sumSq / this.chunkSize);
      const out = this.buf;
      this.port.postMessage({ pcm: out, rms }, [out.buffer]);
      this.buf = new Int16Array(this.chunkSize);
      this.len = 0;
      this.sumSq = 0;
    }
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    if (this.ratio === 1) {
      for (let i = 0; i < input.length; i++) this.push(input[i]);
      return true;
    }
    // Resampleo lineal: índices fraccionales sobre [prev, ...input]
    const n = input.length;
    while (this.pos < n) {
      const i = Math.floor(this.pos);
      const frac = this.pos - i;
      const a = i === 0 ? this.prev : input[i - 1];
      const b = input[i];
      this.push(a + (b - a) * frac);
      this.pos += this.ratio;
    }
    this.pos -= n;
    this.prev = input[n - 1];
    return true;
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor);
