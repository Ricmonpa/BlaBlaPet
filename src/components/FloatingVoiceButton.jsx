import React, { useState, useEffect } from 'react';
import dogVoiceService from '../services/dogVoiceService';

/**
 * Botón flotante simple para activar/desactivar voz de perro
 * Solo se muestra en videos con subtítulos secuenciales
 */
const FloatingVoiceButton = ({ subtitles = [], currentTime = 0, isVideoPlaying = false }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cargar preferencia guardada
  useEffect(() => {
    const savedPreference = localStorage.getItem('dogVoiceEnabled');
    if (savedPreference !== null) {
      const enabled = JSON.parse(savedPreference);
      console.log('🎤 Cargando preferencia guardada:', enabled);
      setIsVoiceEnabled(enabled);
      dogVoiceService.setEnabled(enabled);
    } else {
      // Si no hay preferencia guardada, empezar desactivado
      console.log('🎤 Sin preferencia guardada, empezando desactivado');
      setIsVoiceEnabled(false);
      dogVoiceService.setEnabled(false);
    }
  }, []);

  // Guardar preferencia
  useEffect(() => {
    localStorage.setItem('dogVoiceEnabled', JSON.stringify(isVoiceEnabled));
    dogVoiceService.setEnabled(isVoiceEnabled);
  }, [isVoiceEnabled]);

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
    if (!subtitle?.traduccion_emocional || !isVoiceEnabled) return;
    
    setIsPlaying(true);
    dogVoiceService.speak(subtitle.traduccion_emocional);
  };

  // Monitorear tiempo del video con debounce
  useEffect(() => {
    if (!isVoiceEnabled || !isVideoPlaying) return;

    // Debounce para evitar llamadas múltiples
    const timeoutId = setTimeout(() => {
      const activeSubtitle = findActiveSubtitle(currentTime);
      if (activeSubtitle && activeSubtitle.traduccion_emocional) {
        speakSubtitle(activeSubtitle);
      }
    }, 50); // 50ms de debounce (reducido)

    return () => clearTimeout(timeoutId);
  }, [isVoiceEnabled, isVideoPlaying, currentTime, subtitles]);

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

  const toggleVoice = (e) => {
    console.log('🎤 CLIC DETECTADO en botón de voz!');
    console.log('🎤 Evento completo:', e);
    console.log('🎤 Target:', e.target);
    console.log('🎤 CurrentTarget:', e.currentTarget);
    
    // Prevenir que el evento se propague al video o al contenedor
    e.stopPropagation();
    e.preventDefault();
    
    const newEnabled = !isVoiceEnabled;
    console.log(`🎤 Toggle voz de perro: ${newEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log(`🎤 Estado actual: isVoiceEnabled=${isVoiceEnabled}, newEnabled=${newEnabled}`);
    setIsVoiceEnabled(newEnabled);
    
    if (!newEnabled) {
      console.log('🎤 Desactivando voz de perro...');
      dogVoiceService.stop();
      setIsPlaying(false);
    } else {
      // Probar voz al activar
      console.log('🎤 Activando voz de perro...');
      console.log('🎤 Probando voz de perro...');
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

  console.log('🎤 FloatingVoiceButton renderizando:', {
    isVoiceEnabled,
    subtitlesCount: subtitles.length,
    currentTime,
    isVideoPlaying
  });

  return (
    <button
      onClick={toggleVoice}
      onPointerDown={handlePointerDown}
      onTouchStart={(e) => e.stopPropagation()}
      className={`voice-button absolute top-4 right-4 z-[100] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 ${
        isVoiceEnabled 
          ? 'bg-green-500 text-white hover:bg-green-600 ring-2 ring-green-300' 
          : 'bg-gray-700 text-white hover:bg-gray-600 ring-2 ring-gray-500'
      }`}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        border: '3px solid red', // DEBUG: Ver si está visible
        backgroundColor: isVoiceEnabled ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)' // DEBUG: Ver si está tapado
      }}
      title={isVoiceEnabled ? 'Desactivar voz de perro' : 'Activar voz de perro'}
      aria-label={isVoiceEnabled ? 'Desactivar voz de perro' : 'Activar voz de perro'}
    >
      <span className="text-xl" role="img" aria-label={isVoiceEnabled ? 'Micrófono activo' : 'Sonido desactivado'}>
        {isVoiceEnabled ? '🎤' : '🔇'}
      </span>
    </button>
  );
};

export default FloatingVoiceButton;
