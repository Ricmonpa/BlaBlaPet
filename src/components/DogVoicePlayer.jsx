import React, { useState, useEffect, useRef } from 'react';
import dogVoiceService from '../services/dogVoiceService';

/**
 * Componente para reproducir subtítulos emocionales con voz de perro
 */
const DogVoicePlayer = ({ subtitles = [], currentTime = 0, isVideoPlaying = false }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [voiceConfig, setVoiceConfig] = useState({
    rate: 1.2,
    pitch: 1.3,
    volume: 0.8
  });
  
  const lastSpokenRef = useRef(null);
  const intervalRef = useRef(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('dogVoiceConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setVoiceConfig(config);
      dogVoiceService.updateConfig(config);
    }
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('dogVoiceConfig', JSON.stringify(voiceConfig));
    dogVoiceService.updateConfig(voiceConfig);
  }, [voiceConfig]);

  // Encontrar subtítulo activo basado en tiempo actual
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
    if (!subtitle?.traduccion_emocional || !isEnabled) return;
    
    // Evitar repetir el mismo subtítulo
    if (lastSpokenRef.current === subtitle.id) return;
    
    lastSpokenRef.current = subtitle.id;
    setCurrentSubtitle(subtitle);
    setIsPlaying(true);
    
    dogVoiceService.speak(subtitle.traduccion_emocional, voiceConfig);
  };

  // Monitorear tiempo del video para reproducir subtítulos
  useEffect(() => {
    if (!isEnabled || !isVideoPlaying) return;

    const checkSubtitle = () => {
      const activeSubtitle = findActiveSubtitle(currentTime);
      if (activeSubtitle && activeSubtitle.traduccion_emocional) {
        speakSubtitle(activeSubtitle);
      }
    };

    // Verificar cada 500ms
    intervalRef.current = setInterval(checkSubtitle, 500);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, isVideoPlaying, currentTime, subtitles]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    dogVoiceService.setEnabled(newEnabled);
    
    if (!newEnabled) {
      setIsPlaying(false);
      setCurrentSubtitle(null);
    }
  };

  const testVoice = () => {
    dogVoiceService.testVoice();
  };

  const updateConfig = (key, value) => {
    setVoiceConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="dog-voice-player bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎤 Voces de Perro
        </h3>
        <button
          onClick={toggleVoice}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            isEnabled 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          {isEnabled ? 'Activado' : 'Desactivado'}
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          {/* Controles de voz */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velocidad: {voiceConfig.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceConfig.rate}
                onChange={(e) => updateConfig('rate', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tono: {voiceConfig.pitch.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceConfig.pitch}
                onChange={(e) => updateConfig('pitch', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volumen: {Math.round(voiceConfig.volume * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={voiceConfig.volume}
                onChange={(e) => updateConfig('volume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Botón de prueba */}
          <div className="flex gap-2">
            <button
              onClick={testVoice}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔊 Probar Voz
            </button>
            
            <button
              onClick={() => dogVoiceService.stop()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              ⏹️ Parar
            </button>
          </div>

          {/* Subtítulo actual */}
          {currentSubtitle && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Perro dice:</strong>
              </p>
              <p className="text-gray-800 font-medium">
                "{currentSubtitle.traduccion_emocional}"
              </p>
            </div>
          )}

          {/* Estado */}
          <div className="text-sm text-gray-600">
            <p>🎤 Voz: {dogVoiceService.getStatus().currentVoice}</p>
            <p>📊 Subtítulos: {subtitles.length} disponibles</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogVoicePlayer;
