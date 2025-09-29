import { useState, useEffect, useCallback } from 'react';
import dogVoiceService from '../services/dogVoiceService';

/**
 * Hook personalizado para manejar la funcionalidad de voz de perros
 */
const useDogVoice = (subtitles = [], currentTime = 0, isVideoPlaying = false) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [voiceConfig, setVoiceConfig] = useState({
    rate: 1.2,
    pitch: 1.3,
    volume: 0.8
  });

  // Cargar configuración guardada al inicializar
  useEffect(() => {
    const savedConfig = localStorage.getItem('dogVoiceConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setVoiceConfig(config);
        dogVoiceService.updateConfig(config);
      } catch (error) {
        console.warn('Error cargando configuración de voz:', error);
      }
    }
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    localStorage.setItem('dogVoiceConfig', JSON.stringify(voiceConfig));
    dogVoiceService.updateConfig(voiceConfig);
  }, [voiceConfig]);

  // Encontrar subtítulo activo basado en tiempo
  const findActiveSubtitle = useCallback((time) => {
    if (!subtitles || subtitles.length === 0) return null;
    
    return subtitles.find(subtitle => {
      const timeRange = subtitle.timestamp?.split(' - ');
      if (!timeRange || timeRange.length !== 2) return false;
      
      const startTime = parseTimeToSeconds(timeRange[0]);
      const endTime = parseTimeToSeconds(timeRange[1]);
      
      return time >= startTime && time <= endTime;
    });
  }, [subtitles]);

  // Convertir tiempo MM:SS a segundos
  const parseTimeToSeconds = useCallback((timeString) => {
    const parts = timeString.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }, []);

  // Reproducir subtítulo emocional
  const speakSubtitle = useCallback((subtitle) => {
    if (!subtitle?.traduccion_emocional || !isEnabled) return;
    
    setCurrentSubtitle(subtitle);
    setIsPlaying(true);
    
    dogVoiceService.speak(subtitle.traduccion_emocional, voiceConfig);
  }, [isEnabled, voiceConfig]);

  // Monitorear tiempo del video para reproducir subtítulos automáticamente
  useEffect(() => {
    if (!isEnabled || !isVideoPlaying) return;

    const activeSubtitle = findActiveSubtitle(currentTime);
    if (activeSubtitle && activeSubtitle.traduccion_emocional) {
      speakSubtitle(activeSubtitle);
    }
  }, [isEnabled, isVideoPlaying, currentTime, findActiveSubtitle, speakSubtitle]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      dogVoiceService.stop();
    };
  }, []);

  // Manejar cambio de estado de reproducción del video
  useEffect(() => {
    if (!isVideoPlaying) {
      dogVoiceService.stop();
      setIsPlaying(false);
    }
  }, [isVideoPlaying]);

  // Toggle de habilitación
  const toggleVoice = useCallback(() => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    dogVoiceService.setEnabled(newEnabled);
    
    if (!newEnabled) {
      setIsPlaying(false);
      setCurrentSubtitle(null);
    }
  }, [isEnabled]);

  // Actualizar configuración
  const updateConfig = useCallback((key, value) => {
    setVoiceConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Probar voz
  const testVoice = useCallback(() => {
    dogVoiceService.testVoice();
  }, []);

  // Parar voz
  const stopVoice = useCallback(() => {
    dogVoiceService.stop();
    setIsPlaying(false);
  }, []);

  // Pausar voz
  const pauseVoice = useCallback(() => {
    dogVoiceService.pause();
  }, []);

  // Reanudar voz
  const resumeVoice = useCallback(() => {
    dogVoiceService.resume();
  }, []);

  // Obtener estado del servicio
  const getStatus = useCallback(() => {
    return dogVoiceService.getStatus();
  }, []);

  return {
    // Estado
    isEnabled,
    isPlaying,
    currentSubtitle,
    voiceConfig,
    
    // Acciones
    toggleVoice,
    updateConfig,
    testVoice,
    stopVoice,
    pauseVoice,
    resumeVoice,
    speakSubtitle,
    getStatus,
    
    // Utilidades
    findActiveSubtitle: (time) => findActiveSubtitle(time)
  };
};

export default useDogVoice;
