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
      setIsVoiceEnabled(JSON.parse(savedPreference));
      dogVoiceService.setEnabled(JSON.parse(savedPreference));
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
    }, 100); // 100ms de debounce

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

  const toggleVoice = () => {
    const newEnabled = !isVoiceEnabled;
    setIsVoiceEnabled(newEnabled);
    
    if (!newEnabled) {
      dogVoiceService.stop();
      setIsPlaying(false);
    }
  };

  // Solo mostrar si hay subtítulos secuenciales
  if (!subtitles || subtitles.length === 0) return null;

  return (
    <button
      onClick={toggleVoice}
      className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 ${
        isVoiceEnabled 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-gray-500 text-white hover:bg-gray-600'
      }`}
      title={isVoiceEnabled ? 'Desactivar voz de perro' : 'Activar voz de perro'}
    >
      {isVoiceEnabled ? '🎤' : '🔇'}
    </button>
  );
};

export default FloatingVoiceButton;
