# Modo en Vivo (`/live`): Fase 1

Apuntas la cámara trasera del celular al perro y la app manda audio y frames a **Gemini Live API**. El perro "habla" en tiempo real, con voz y subtítulo.
Es independiente del flujo de subir video: no toca `/`, `/camera` ni las APIs de upload.

## Arquitectura

```
Celular (Chrome Android)
  MediaSource  ── interfaz intercambiable: phone hoy, glasses en Fase 2
   ├─ audioCapture   AudioWorklet → PCM16 16 kHz, chunks de 40 ms + VAD por energía (RMS)
   ├─ frameSender    canvas 512 px JPEG q0.6 @ 1 FPS
   ├─ liveClient     @google/genai → WebSocket directo a Gemini (token efímero)
   ├─ audioPlayer    AudioWorklet, cola PCM 24 kHz, flush si llega "interrupted"
   └─ latencyMeter   onset / fin de sonido → primer audio de respuesta
                 ▲ POST /api/live-token
Vercel  api/live-token.js   GEMINI_API_KEY solo en el server
```

| Archivo | Rol |
|---|---|
| `src/live/config.js` | Modelo, voz, prompt y config bloqueada; parámetros de VAD y video. Es la fuente única para la función y para el cliente. |
| `api/live-token.js` | Emite un token efímero (`uses:1`, 1 min para abrir, 30 min de vida). Modelo, prompt, voz, VAD, transcripción y compresión quedan bloqueados con `liveConnectConstraints` + `lockAdditionalFields: []`. También revisa el `Origin` y aplica un rate limit por IP (10 sesiones cada 10 min). |
| `src/live/mediaSource.js` | `createPhoneMediaSource(videoEl)` → `{ kind, audioStream, videoEl, stop }` |
| `src/live/audioCapture.js` + `pcm-capture.worklet.js` | Captura, resampleo y VAD |
| `src/live/audioPlayer.js` + `pcm-player.worklet.js` | Reproducción de la voz |
| `src/live/frameSender.js` | Frames a 1 FPS |
| `src/live/liveClient.js` | Conexión, session resumption, GoAway y reconexión (máx. 3 intentos) |
| `src/live/latencyMeter.js` | Logs `[latency]` y la mediana de las últimas 10 respuestas |
| `src/pages/Live.jsx` | UI. Ruta lazy-loaded, así que el SDK no entra al bundle principal. |

### Decisiones (verificadas en la doc oficial, nov 2026)
- **Modelo `gemini-3.8-live`** (GA). Solo responde con AUDIO; el texto sale de `outputAudioTranscription`. *Proactive audio* está siempre activo, así que el modelo puede elegir no hablar.
- **VAD manual en el cliente.** El VAD del servidor está pensado para voz humana y podría ignorar ladridos. Cualquier sonido arriba del umbral durante 80 ms abre una actividad: se manda `activityStart` más 320 ms de pre-roll. Tras 500 ms de silencio se manda `activityEnd` (la doc recomienda ≥500 ms). Las actividades se cortan a los 12 s.
- **Half-duplex.** Mientras suena la voz del perro no se manda micrófono (más 150 ms de cola), para que el modelo no se escuche a sí mismo por la bocina. `noiseSuppression` está apagado para no "limpiar" los ladridos.
- **Sesiones largas.** Sin compresión, una sesión de audio+video dura solo **2 min**, así que se usa `contextWindowCompression: slidingWindow`. La conexión dura unos 10 min; se usa `sessionResumption` y se reconecta al recibir `GoAway`.
- **Voz:** `Puck` (Upbeat). Para cambiarla, edita `LIVE_VOICE` en `config.js`. Alternativas: Fenrir (Excitable), Leda (Youthful), Sadachbia (Lively).

## Cómo probar

1. En Vercel → Settings → Environment Variables, agrega `GEMINI_API_KEY` (**sin** prefijo `VITE_`) en Preview y Production.
2. Haz deploy de la branch `feature/live-mode`. Vercel crea un preview URL.
3. En el celular, abre `https://<preview>.vercel.app/live`, toca **Iniciar modo en vivo**, acepta cámara y micrófono y apunta al perro.
4. Para ver los logs, conecta el celular por USB y abre `chrome://inspect` en la PC. Busca líneas como:
   `[latency] onset→audio=XXXXms end→audio=YYYms (mediana últimas N: ZZZms)`
5. Si se dispara con el ruido de fondo, sube la **Sensib.**; si no detecta ladridos, bájala. La barra verde es el nivel del mic y la línea amarilla es el umbral.

Para probar en local (`npm run dev` no sirve `/api`) usa `vercel dev`. El celular tiene que entrar por HTTPS o por `localhost`, porque `getUserMedia` lo exige.

## Latencias medidas

| Escenario | onset→audio | end→audio |
|---|---|---|
| E2E en Chromium headless con mic y cámara falsos y un Gemini **simulado** que responde a los 200 ms (ladrido de 0.7 s) | ~1,330–1,370 ms | ~206 ms → **overhead del cliente ≈ 6–7 ms** |
| Moto G50 + Gemini real | *pendiente: llénalo con tus logs* | *pendiente* |

Cómo leerlo:
- **end→audio** = TTFB del modelo + red + ~7 ms del cliente. Es lo que percibes desde que el perro calla hasta que empieza la voz. Es la métrica de la meta < 1.5 s.
- **onset→audio** = duración del sonido + 500 ms de silencio de cierre + end→audio.
- Si hace falta recortar, el parámetro con más efecto es `VAD.silenceMs` (500 → 350 ms). La doc advierte que bajarlo de 500 ms fragmenta el audio.

## Limitaciones conocidas
- Live API y los tokens efímeros están en **preview**; la API puede cambiar.
- En el free tier, Google puede usar los datos para mejorar sus productos. En paid cuesta ~$0.025/min (audio in $0.005 + video in $0.002 + audio out $0.018).
- **Solo el sonido abre turnos.** Un perro que mueve la cola en silencio no dispara respuesta (los frames se mandan, pero el turno lo abre el VAD). Ver la propuesta de abajo.
- El VAD por energía se dispara con ruido fuerte (TV, calle); se compensa con el slider.
- El rate limit vive en memoria: se reinicia en cada cold start. Para prototipo basta; para producción hay que pasarlo a KV o Upstash.
- El modo es half-duplex: si hablas mientras el perro "habla", no se te escucha.
- iOS Safari no se probó.

## Propuesta pendiente de aprobación: frames extra en vocalización
La doc limita el video a **1 FPS máximo**, así que no conviene mandar ráfagas. Opciones compatibles con ese límite:
1. **Frame alineado al evento:** en `activityStart`, mandar en ese momento un frame fresco y reiniciar el reloj de 1 FPS. Es barato y muestra el instante del ladrido, no uno de hasta 1 s antes.
2. Ese frame a 768 px y los demás a 384 px, para compensar tokens.
3. Un "strip": un collage de 2–3 frames de los últimos 600 ms en una sola imagen. Captura lenguaje corporal rápido sin pasarse de 1 FPS.

## Fase 2 (lentes)
- Implementar `createGlassesMediaSource()` con el mismo contrato que `createPhoneMediaSource`. Lo demás no cambia.
- La salida de audio pasa a las bocinas de los lentes; el subtítulo pasa al display (Ray-Ban Display).
