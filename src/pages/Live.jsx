import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPhoneMediaSource } from '../live/mediaSource';
import { createAudioCapture } from '../live/audioCapture';
import { createAudioPlayer } from '../live/audioPlayer';
import { createFrameSender } from '../live/frameSender';
import { createLiveClient } from '../live/liveClient';
import { createLatencyMeter } from '../live/latencyMeter';
import { VAD } from '../live/config';

const STATUS_LABEL = {
  idle: 'Detenido',
  connecting: 'Conectando…',
  live: 'En vivo',
  reconnecting: 'Reconectando…',
  error: 'Error',
};

export default function Live() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const rig = useRef(null); // { media, capture, player, frames, client, latency, wakeLock }

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [latency, setLatency] = useState(null);
  const [level, setLevel] = useState(0);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [threshold, setThreshold] = useState(VAD.defaultThreshold);

  const running = status !== 'idle' && status !== 'error';

  const stop = useCallback(async () => {
    const r = rig.current;
    rig.current = null;
    if (!r) return;
    clearTimeout(r.unmuteTimer);
    clearTimeout(r.clearSubTimer);
    r.frames?.stop();
    r.client?.stop();
    r.media?.stop();
    await r.capture?.stop();
    await r.player?.stop();
    r.wakeLock?.release?.().catch(() => {});
    setStatus('idle');
    setListening(false);
    setSpeaking(false);
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (rig.current) return;
    setError('');
    setSubtitle('');
    const r = { responding: false, gotAudio: false, newTurn: true };
    rig.current = r;
    try {
      // Crear/reanudar AudioContexts dentro del gesto del usuario (autoplay policy).
      r.player = await createAudioPlayer({
        onStart: () => setSpeaking(true),
        onDrained: () => {
          setSpeaking(false);
          clearTimeout(r.unmuteTimer);
          r.unmuteTimer = setTimeout(() => r.capture?.setMuted(false), VAD.playbackTailMs);
          clearTimeout(r.clearSubTimer);
          r.clearSubTimer = setTimeout(() => setSubtitle(''), 4000);
        },
      });
      await r.player.resume();

      r.latency = createLatencyMeter(setLatency);
      r.media = await createPhoneMediaSource(videoRef.current);

      r.client = createLiveClient({
        onStatus: (s, detail) => {
          if (s === 'error') {
            stop().then(() => {
              setStatus('error');
              setError(detail || 'Error de conexión');
            });
            return;
          }
          if (rig.current === r) setStatus(s);
        },
        onAudio: (b64, rate) => {
          if (!r.responding) {
            r.responding = true;
            r.latency.markFirstAudio();
          }
          r.gotAudio = true;
          // Half-duplex: no mandar mic mientras habla el perro (evita que se escuche a sí mismo).
          clearTimeout(r.unmuteTimer);
          r.capture?.setMuted(true);
          r.player.push(b64, rate);
        },
        onTranscript: (text) => {
          clearTimeout(r.clearSubTimer);
          setSubtitle((prev) => (r.newTurn ? text : prev + text));
          r.newTurn = false;
        },
        onInterrupted: () => r.player.flush(),
        onTurnComplete: () => {
          if (!r.gotAudio) r.latency.cancel();
          r.responding = false;
          r.gotAudio = false;
          r.newTurn = true;
        },
      });
      await r.client.start();

      r.capture = await createAudioCapture(r.media.audioStream, {
        onLevel: (rms) => setLevel(rms),
        onActivityStart: () => {
          r.client.activityStart();
          r.frames?.sendNow(); // frame del instante del ladrido, no de hasta 1 s antes
          r.latency.markOnset();
          setListening(true);
        },
        onAudioChunk: (b64) => r.client.sendAudio(b64),
        onActivityEnd: () => {
          r.client.activityEnd();
          r.latency.markEnd();
          setListening(false);
        },
      });
      r.capture.setThreshold(threshold);
      await r.capture.resume();

      r.frames = createFrameSender(r.media.videoEl, (b64) => r.client.sendFrame(b64));
      r.frames.start();

      r.wakeLock = await navigator.wakeLock?.request('screen').catch(() => null);
    } catch (err) {
      console.error('[live] no se pudo iniciar', err);
      await stop();
      setStatus('error');
      setError(err?.name === 'NotAllowedError' ? 'Permite cámara y micrófono' : err?.message || 'No se pudo iniciar');
    }
  }, [stop, threshold]);

  useEffect(() => () => {
    stop();
  }, [stop]);

  const onThreshold = (e) => {
    const v = Number(e.target.value);
    setThreshold(v);
    rig.current?.capture?.setThreshold(v);
  };

  const latencyColor =
    latency == null ? 'bg-gray-700' : latency.fromEnd < 1500 ? 'bg-green-600' : latency.fromEnd < 2500 ? 'bg-yellow-600' : 'bg-red-600';

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col select-none">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />

      {/* Barra superior */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={() => { stop(); navigate('/'); }} className="px-3 py-1 rounded-full bg-white/15 text-sm">
          ← Salir
        </button>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${status === 'live' ? 'bg-red-600' : 'bg-white/15'}`}>
            {status === 'live' ? '● ' : ''}{STATUS_LABEL[status]}
          </span>
          <span className={`px-2 py-1 rounded-full font-mono ${latencyColor}`} title="fin de sonido → primer audio">
            {latency ? `${latency.fromEnd}ms · med ${latency.median}ms` : '— ms'}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Subtítulo */}
      <div className="relative z-10 px-4 pb-3 min-h-[4.5rem] flex items-end justify-center">
        {subtitle && (
          <p className="max-w-xl text-center text-lg leading-snug font-semibold bg-black/60 rounded-xl px-4 py-2">
            🐶 {subtitle}
          </p>
        )}
      </div>

      {/* Controles */}
      <div className="relative z-10 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent space-y-3">
        <div className="flex items-center gap-3 text-xs">
          <span className="w-16">{speaking ? '🔊 Habla' : listening ? '👂 Oyendo' : '…'}</span>
          <div className="flex-1 h-2 rounded bg-white/15 overflow-hidden relative">
            <div className="h-full bg-green-400 transition-[width] duration-75" style={{ width: `${Math.min(100, level * 800)}%` }} />
            <div className="absolute top-0 h-full w-0.5 bg-yellow-300" style={{ left: `${Math.min(100, threshold * 800)}%` }} />
          </div>
        </div>
        <label className="flex items-center gap-3 text-xs">
          <span className="w-16">Sensib.</span>
          <input type="range" min="0.005" max="0.1" step="0.005" value={threshold} onChange={onThreshold} className="flex-1" />
        </label>
        {error && <p className="text-center text-sm text-red-300">{error}</p>}
        <button
          onClick={running ? stop : start}
          className={`w-full py-4 rounded-2xl text-lg font-bold ${running ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {running ? 'Detener' : 'Iniciar modo en vivo'}
        </button>
      </div>
    </div>
  );
}
