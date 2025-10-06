import React, { useState, useRef, useEffect } from 'react';

const SequentialSubtitlesOverlay = ({ subtitles, videoRef, totalDuration }) => {
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTechnical, setShowTechnical] = useState(true);
  const [showEmotional, setShowEmotional] = useState(true);

  // Debug logs (solo una vez) - REDUCIDO
  useEffect(() => {
    // Solo loggear una vez al montar
    console.log('🎬 SequentialSubtitlesOverlay montado:', {
      subtitles: subtitles?.length,
      videoRef: !!videoRef?.current,
      totalDuration
    });
  }, []); // Solo una vez al montar

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
      if (current && (!currentSubtitle || current.timestamp !== currentSubtitle.timestamp)) {
        console.log('🎬 Subtítulo actual:', {
          timestamp: current.timestamp,
          tecnica: current.traduccion_tecnica,
          emocional: current.traduccion_emocional,
          confidence: current.confidence,
          // VERIFICAR ESTRUCTURA COMPLETA
          fullStructure: current,
          hasTraduccionEmocional: !!current.traduccion_emocional,
          hasTraduccionTecnica: !!current.traduccion_tecnica,
          hasTimestamp: !!current.timestamp,
          hasConfidence: !!current.confidence
        });
      }
      
      setCurrentSubtitle(current || null);
    }
  }, [currentTime, subtitles, currentSubtitle?.timestamp]);

  // Escuchar cambios de tiempo del video
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
    };

    const handleLoadedData = () => {
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
  }, [videoRef]); // Solo videoRef, no videoRef?.current

  // Mostrar el overlay solo si hay subtítulos disponibles Y hay video ref
  if (!subtitles || subtitles.length === 0 || !videoRef?.current) return null;

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-2 pointer-events-none">
      <div className="text-center max-w-lg mx-auto">
        {/* Traducción Emocional - Más compacta */}
        {showEmotional && currentSubtitle && currentSubtitle.traduccion_emocional && (
          <div className="mb-2">
            <p className="text-xs text-gray-200 mb-1">Traducción Emocional:</p>
            <p className="text-base font-semibold text-yellow-300 leading-tight bg-black bg-opacity-70 p-2 rounded-lg border border-yellow-500">
              "{currentSubtitle.traduccion_emocional}"
            </p>
          </div>
        )}
        
        {/* Traducción Técnica - Compacta y con scroll */}
        {showTechnical && currentSubtitle && currentSubtitle.traduccion_tecnica && (
          <div className="mb-2">
            <p className="text-xs text-gray-200 mb-1">Traducción Técnica:</p>
            <div className="max-h-20 overflow-y-auto bg-white bg-opacity-90 text-gray-800 p-2 rounded-lg border border-gray-300">
              <p className="text-xs leading-tight">
                {currentSubtitle.traduccion_tecnica}
              </p>
            </div>
          </div>
        )}
        
        {/* Información del subtítulo - Ultra compacta */}
        {currentSubtitle && (
          <div className="mt-1 text-xs text-gray-400 bg-black bg-opacity-40 px-2 py-0.5 rounded text-center">
            {currentSubtitle.timestamp || 'Sin timestamp'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SequentialSubtitlesOverlay;
