// Fuente de medios intercambiable.
// Contrato (lo que el resto del modo en vivo necesita):
//   { kind, audioStream: MediaStream, videoEl: HTMLVideoElement, stop(): void }
// Fase 1: cámara trasera + micrófono del celular.
// Fase 2: createGlassesMediaSource() con el mismo contrato (p. ej. frames y audio
// que llegan del SDK de los lentes, pintados en un <video>/<canvas> propio).

export async function createPhoneMediaSource(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: false, // no queremos que "limpie" los ladridos como ruido
      autoGainControl: true,
      channelCount: 1,
    },
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 15, max: 24 },
    },
  });

  const videoTracks = stream.getVideoTracks();
  const audioTracks = stream.getAudioTracks();
  videoEl.srcObject = new MediaStream(videoTracks);
  videoEl.muted = true;
  videoEl.playsInline = true;
  await videoEl.play().catch(() => {});

  return {
    kind: 'phone',
    audioStream: new MediaStream(audioTracks),
    videoEl,
    stop() {
      stream.getTracks().forEach((t) => t.stop());
      videoEl.srcObject = null;
    },
  };
}
