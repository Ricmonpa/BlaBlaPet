import React, { useState, useEffect } from 'react';
import dogVoiceService from '../services/dogVoiceService';

/**
 * Botón flotante para activar/desactivar audio original + voz TTS
 * Solo se muestra en videos con subtítulos secuenciales
 */
const FloatingVoiceButton = ({ subtitles = [], currentTime = 0, isVideoPlaying = false, videoRef, isAudioEnabled, setIsAudioEnabled }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Cargar preferencia guardada
  useEffect(() => {
    const savedPreference = localStorage.getItem('audioEnabled');
    if (savedPreference !== null) {
      const enabled = JSON.parse(savedPreference);
      console.log('🎤 Cargando preferencia guardada:', enabled);
      setIsAudioEnabled(enabled);
      dogVoiceService.setEnabled(enabled);
    } else {
      // Si no hay preferencia guardada, empezar desactivado
      console.log('🎤 Sin preferencia guardada, empezando desactivado');
      setIsAudioEnabled(false);
      dogVoiceService.setEnabled(false);
    }
  }, [setIsAudioEnabled]);

  // Guardar preferencia y manejar audio
  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(isAudioEnabled));
    dogVoiceService.setEnabled(isAudioEnabled);
    
    // El audio del video se maneja desde PetCard con muted={!isAudioEnabled}
    console.log('🎬 Estado de audio actualizado:', isAudioEnabled ? 'ACTIVADO' : 'DESACTIVADO');
  }, [isAudioEnabled]);

  // Encontrar subtítulo activo
  const findActiveSubtitle = (time) => {
    if (!subtitles || subtitles.length === 0) return null;
    
    return subtitles.find(subtitle => {
      const timeRange = subtitle.timestamp?.split(' - ');
      if (!timeRange || timeRange.length !== 2) return false;
      
      const startTime = parseTimeToSeconds(timeRange[0]);
      const endTime = parseTimeToSeconds(timeRange[1]);
      
      return time >= startTime && time <= endTime;
    });
  };

  // Convertir tiempo MM:SS a segundos
  const parseTimeToSeconds = (timeString) => {
    const parts = timeString.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  // Reproducir subtítulo emocional
  const speakSubtitle = (subtitle) => {
    if (!subtitle?.traduccion_emocional || !isAudioEnabled) return;
    
    setIsPlaying(true);
    dogVoiceService.speak(subtitle.traduccion_emocional);
  };

  // Monitorear tiempo del video con debounce
  useEffect(() => {
    if (!isAudioEnabled || !isVideoPlaying) return;

    // Debounce para evitar llamadas múltiples
    const timeoutId = setTimeout(() => {
      const activeSubtitle = findActiveSubtitle(currentTime);
      if (activeSubtitle && activeSubtitle.traduccion_emocional) {
        speakSubtitle(activeSubtitle);
      }
    }, 50); // 50ms de debounce (reducido)

    return () => clearTimeout(timeoutId);
  }, [isAudioEnabled, isVideoPlaying, currentTime, subtitles]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      dogVoiceService.stop();
    };
  }, []);

  // Manejar cambio de estado de reproducción
  useEffect(() => {
    if (!isVideoPlaying) {
      dogVoiceService.stop();
      setIsPlaying(false);
    }
  }, [isVideoPlaying]);

  const toggleAudio = (e) => {
    console.log('🎤 CLIC DETECTADO en botón de audio!');
    console.log('🎤 Evento completo:', e);
    console.log('🎤 Target:', e.target);
    console.log('🎤 CurrentTarget:', e.currentTarget);
    
    // Prevenir que el evento se propague al video o al contenedor
    e.stopPropagation();
    e.preventDefault();
    
    const newEnabled = !isAudioEnabled;
    console.log(`🎤 Toggle audio: ${newEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log(`🎤 Estado actual: isAudioEnabled=${isAudioEnabled}, newEnabled=${newEnabled}`);
    setIsAudioEnabled(newEnabled);
    
    if (!newEnabled) {
      console.log('🎤 Desactivando audio original + voz TTS...');
      dogVoiceService.stop();
      setIsPlaying(false);
    } else {
      console.log('🎤 Activando audio original + voz TTS...');
      // Probar voz al activar
      dogVoiceService.testVoice();
    }
  };

  const handlePointerDown = (e) => {
    // Prevenir que el touch/click se propague
    e.stopPropagation();
  };

  // Solo mostrar si hay subtítulos secuenciales
  if (!subtitles || subtitles.length === 0) {
    console.log('🎤 FloatingVoiceButton: No hay subtítulos, no mostrando botón');
    return null;
  }

  // Debug logs (solo cuando cambien las props importantes) - REDUCIDO
  useEffect(() => {
    // Solo loggear cambios significativos, no cada frame
    if (currentTime % 5 < 0.1) { // Solo cada 5 segundos
    console.log('🎤 FloatingVoiceButton renderizando:', {
      isAudioEnabled,
      subtitlesCount: subtitles.length,
        currentTime: Math.floor(currentTime),
      isVideoPlaying
    });
    }
  }, [isAudioEnabled, subtitles.length, Math.floor(currentTime), isVideoPlaying]);

  return (
    <button
      onClick={toggleAudio}
      onPointerDown={handlePointerDown}
      onTouchStart={(e) => e.stopPropagation()}
      className={`voice-button absolute top-32 right-4 z-[100] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 ${
        isAudioEnabled 
          ? 'bg-green-500 text-white hover:bg-green-600 ring-2 ring-green-300' 
          : 'bg-gray-700 text-white hover:bg-gray-600 ring-2 ring-gray-500'
      }`}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
      title={isAudioEnabled ? 'Desactivar audio' : 'Activar audio'}
      aria-label={isAudioEnabled ? 'Desactivar audio' : 'Activar audio'}
    >
      <span className="text-xl" role="img" aria-label={isAudioEnabled ? 'Audio activo' : 'Audio desactivado'}>
        {isAudioEnabled ? '🔊' : '🔇'}
      </span>
    </button>
  );
};

export default FloatingVoiceButton;
