// Mide: inicio de vocalización (onset) y fin (activityEnd) → primer audio recibido.
// Lo que percibe el usuario es "end→audio" (el perro dejó de ladrar → empieza a hablar).
export function createLatencyMeter(onSample) {
  let onset = 0;
  let end = 0;
  let waiting = false;
  const history = [];

  const median = (arr) => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };

  return {
    markOnset() {
      onset = performance.now();
      end = 0;
      waiting = true;
    },
    markEnd() {
      end = performance.now();
    },
    // Llamar con el PRIMER chunk de audio de cada respuesta.
    markFirstAudio() {
      if (!waiting) return;
      waiting = false;
      const now = performance.now();
      const fromOnset = Math.round(now - onset);
      // Si el modelo empezó a hablar antes de que cerráramos la actividad, end=0.
      const fromEnd = end ? Math.round(now - end) : 0;
      history.push(fromEnd);
      if (history.length > 10) history.shift();
      const sample = { fromOnset, fromEnd, median: median(history), count: history.length };
      console.log(
        `[latency] onset→audio=${fromOnset}ms end→audio=${fromEnd}ms (mediana últimas ${sample.count}: ${sample.median}ms)`
      );
      onSample?.(sample);
    },
    // El modelo decidió no hablar (o la respuesta fue silencio).
    cancel() {
      waiting = false;
    },
  };
}
