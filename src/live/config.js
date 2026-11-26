// Configuración única del Modo en Vivo.
// La importa la función serverless (api/live-token.js) para bloquear la sesión
// dentro del token efímero, y el cliente para los parámetros de captura.
// Verificado contra la doc oficial de Gemini Live API (nov 2026).

export const LIVE_MODEL = 'gemini-3.8-live';

// Voces prebuilt: Puck (Upbeat), Fenrir (Excitable), Leda (Youthful), Sadachbia (Lively)...
export const LIVE_VOICE = 'Puck';

export const SYSTEM_PROMPT = `Eres el perro que aparece en la cámara. Hablas en primera persona, en español mexicano, con tono divertido, natural y breve (una o dos frases).
Recibes video y audio en vivo de lo que ve y oye tu humano.
Reacciona a lo que tú haces: lenguaje corporal, cola, orejas, ladridos, gruñidos, gemidos.
Si oyes voces humanas, úsalas como contexto (te hablan a ti o hablan de ti), pero nunca te atribuyas lo que dijo un humano.
No leas en voz alta texto que aparezca en la imagen.
Si no pasa nada relevante contigo, quédate en silencio. No rellenes.
RESPONDE EN ESPAÑOL. DEBES RESPONDER INEQUÍVOCAMENTE EN ESPAÑOL.`;

// Config de sesión que se BLOQUEA en el token (el cliente no la puede cambiar).
// sessionResumption NO va aquí: el cliente debe poder mandar su handle al reconectar.
export function buildLockedLiveConfig() {
  return {
    responseModalities: ['AUDIO'],
    systemInstruction: SYSTEM_PROMPT,
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } } },
    outputAudioTranscription: {},
    mediaResolution: 'MEDIA_RESOLUTION_LOW',
    // VAD manual: el cliente detecta ladridos/sonidos por energía y manda activityStart/End.
    // El VAD del servidor está pensado para habla humana y puede ignorar ladridos.
    realtimeInputConfig: { automaticActivityDetection: { disabled: true } },
    // Sin compresión, audio+video se corta a los 2 min.
    contextWindowCompression: { slidingWindow: {} },
  };
}

// Parámetros de captura en el cliente.
export const AUDIO_IN_RATE = 16000; // PCM16 LE, audio/pcm;rate=16000
export const AUDIO_OUT_RATE = 24000; // salida de Gemini
export const CHUNK_MS = 40; // doc: 20–40 ms
export const VAD = {
  defaultThreshold: 0.02, // RMS (0..1); ajustable con el slider
  onsetChunks: 2, // 80 ms sobre el umbral para abrir actividad
  silenceMs: 500, // doc: >= 500 ms para no fragmentar
  prerollMs: 320, // audio previo al onset que se manda junto
  maxActivityMs: 12000, // corta actividades eternas (ruido constante)
  playbackTailMs: 150, // half-duplex: espera tras terminar de hablar
};
export const VIDEO = {
  fps: 1, // doc: máximo 1 FPS
  maxSide: 512,
  jpegQuality: 0.6,
  // Frame extra al iniciar una vocalización: nunca a menos de 500 ms del anterior,
  // así el promedio se queda en ~1 FPS.
  minEventGapMs: 500,
};
