import React, { useState, useRef, useEffect } from 'react';

const SequentialSubtitlesOverlay = ({ subtitles, videoRef, totalDuration }) => {
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTechnical, setShowTechnical] = useState(true);
  const [showEmotional, setShowEmotional] = useState(true);

  // Debug logs
  console.log('🎬 SequentialSubtitlesOverlay props:', {
    subtitles: subtitles?.length,
    videoRef: !!videoRef?.current,
    totalDuration,
    subtitlesData: subtitles?.slice(0, 2) // Mostrar primeros 2 subtítulos para debug
  });

  // Parsear timestamp a segundos
  const parseTimestamp = (timestamp) => {
    const match = timestamp.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startMinutes = parseInt(match[1]);
      const startSeconds = parseInt(match[2]);
      const endMinutes = parseInt(match[3]);
      const endSeconds = parseInt(match[4]);
      
      return {
        start: startMinutes * 60 + startSeconds,
        end: endMinutes * 60 + endSeconds
      };
    }
    
    return { start: 0, end: 5 };
  };

  // Actualizar subtítulo actual basado en el tiempo
  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      // Buscar subtítulo exacto primero
      let current = subtitles.find(subtitle => {
        const timeRange = parseTimestamp(subtitle.timestamp);
        return currentTime >= timeRange.start && currentTime <= timeRange.end;
      });
      
      // Si no hay coincidencia exacta, buscar el más cercano
      if (!current) {
        current = subtitles.find(subtitle => {
          const timeRange = parseTimestamp(subtitle.timestamp);
          return currentTime >= timeRange.start;
        });
      }
      
      // Si aún no hay coincidencia, usar el primer subtítulo
      if (!current && subtitles.length > 0) {
        current = subtitles[0];
      }
      
      // Solo loggear cuando cambie el subtítulo
      if (current && (!currentSubtitle || current.id !== currentSubtitle.id)) {
        console.log('🎬 Subtítulo actual:', {
          timestamp: current.timestamp,
          tecnica: current.traduccion_tecnica,
          emocional: current.traduccion_emocional,
          confidence: current.confidence
        });
      }
      
      setCurrentSubtitle(current || null);
    }
  }, [currentTime, subtitles]);

  // Escuchar cambios de tiempo del video
  useEffect(() => {
    const video = videoRef?.current;
    console.log('🎬 Video ref:', video);
    if (!video) {
      console.log('❌ No hay video ref');
      return;
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      console.log('⏰ Video time:', time);
      setCurrentTime(time);
    };

    // Asegurar que el video esté listo
    const handleLoadedData = () => {
      console.log('🎬 Video loaded, duration:', video.duration);
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);
    
    // Si el video ya está cargado, establecer el tiempo inicial
    if (video.readyState >= 2) {
      setCurrentTime(video.currentTime);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoRef]);

  // Mostrar el overlay si hay subtítulos disponibles, incluso si no hay currentSubtitle
  if (!subtitles || subtitles.length === 0) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-4 pointer-events-none">
      <div className="text-center max-w-2xl mx-auto">
        {/* Traducción Emocional - Ahora arriba */}
        {showEmotional && currentSubtitle.traduccion_emocional && (
          <div className="mb-3">
            <p className="text-sm text-gray-200 mb-1">Traducción Emocional:</p>
            <p className="text-lg font-semibold text-yellow-300 leading-relaxed bg-black bg-opacity-70 p-3 rounded-lg border border-yellow-500">
              "{currentSubtitle.traduccion_emocional}"
            </p>
          </div>
        )}
        
        {/* Traducción Técnica - Ahora abajo con mejor legibilidad */}
        {showTechnical && currentSubtitle.traduccion_tecnica && (
          <div className="mb-3">
            <p className="text-sm text-gray-200 mb-1">Traducción Técnica:</p>
            <p className="text-sm leading-relaxed bg-white bg-opacity-90 text-gray-800 p-3 rounded-lg border border-gray-300">
              {currentSubtitle.traduccion_tecnica}
            </p>
          </div>
        )}
        
        {/* Información del subtítulo */}
        <div className="mt-2 text-xs text-gray-300 bg-black bg-opacity-50 px-2 py-1 rounded">
          {currentSubtitle.timestamp} • Confianza: {currentSubtitle.confidence}%
        </div>
      </div>
    </div>
  );
};

export default SequentialSubtitlesOverlay;
