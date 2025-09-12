import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import videoShareService from '../services/videoShareService.js';
import SequentialSubtitlesOverlay from '../components/SequentialSubtitlesOverlay.jsx';

const VideoPreview = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Obtener datos del video
    const videoData = videoShareService.getVideoById(videoId);
    
    if (!videoData) {
      setError('Video no encontrado');
      setLoading(false);
      return;
    }

    console.log('🎬 Video data:', {
      id: videoData.id,
      isSequentialSubtitles: videoData.isSequentialSubtitles,
      subtitles: videoData.subtitles?.length,
      mediaType: videoData.mediaType
    });

    setVideo(videoData);
    setLoading(false);

    // Generar metadatos Open Graph para WhatsApp
    videoShareService.generateOpenGraphMeta(videoData).then(metaData => {
      updateMetaTags(metaData);
    });

    // Incrementar contador de compartidos
    videoShareService.incrementShareCount(videoId);

  }, [videoId]);

  /**
   * Actualizar metadatos Open Graph en el head del documento
   * @param {Object} metaData - Metadatos a insertar
   */
  const updateMetaTags = (metaData) => {
    // Limpiar metadatos existentes
    const existingTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
    existingTags.forEach(tag => tag.remove());

    // Crear nuevos metadatos
    const metaTags = [
      { property: 'og:title', content: metaData.title },
      { property: 'og:description', content: metaData.description },
      { property: 'og:image', content: metaData.image },
      { property: 'og:url', content: metaData.url },
      { property: 'og:type', content: metaData.type },
      { property: 'og:site_name', content: metaData.site_name },
      { property: 'og:locale', content: metaData.locale },
      { name: 'twitter:card', content: 'player' },
      { name: 'twitter:title', content: metaData.title },
      { name: 'twitter:description', content: metaData.description },
      { name: 'twitter:image', content: metaData.image },
      { name: 'twitter:player', content: metaData.url },
      { name: 'twitter:player:width', content: '400' },
      { name: 'twitter:player:height', content: '600' }
    ];

    // Insertar metadatos en el head
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      if (tag.property) {
        meta.setAttribute('property', tag.property);
      } else {
        meta.setAttribute('name', tag.name);
      }
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    // Actualizar título de la página
    document.title = metaData.title;
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.petName ? `¡Mira lo que dice ${video.petName}!` : 'Video de Yo Pett',
        text: video.translation || video.emotionalDubbing || 'Análisis de comportamiento de mascota',
        url: window.location.href
      });
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('URL copiada al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">😿</div>
          <h1 className="text-2xl font-bold mb-2">Video no encontrado</h1>
          <p className="text-gray-400 mb-6">El video que buscas no existe o ha expirado</p>
          <button
            onClick={handleBackToApp}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver a Yo Pett
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToApp}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleShare}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative h-screen w-full">
        {video.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={video.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls
            onLoadedData={() => console.log('🎬 Video loaded:', videoRef.current)}
            onPlay={() => console.log('▶️ Video playing')}
            onPause={() => console.log('⏸️ Video paused')}
          />
        ) : (
          <img
            src={video.mediaUrl}
            alt={`${video.petName} the ${video.breed}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Subtítulos secuenciales para videos */}
        {video.isSequentialSubtitles && video.subtitles && video.mediaType === 'video' && (
          <SequentialSubtitlesOverlay 
            subtitles={video.subtitles}
            videoRef={videoRef}
            totalDuration={video.totalDuration}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {/* Pet Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">
            {video.petName ? `¡Mira lo que dice ${video.petName}!` : 'Análisis de Mascota'}
          </h1>
          {video.breed && (
            <p className="text-gray-300 text-sm">{video.breed}</p>
          )}
        </div>


        {/* Confidence */}
        {video.confidence && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Confianza:</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${video.confidence}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium">{video.confidence}%</span>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">
            Analizado con Yo Pett - Traductor de Mascotas
          </p>
          <button
            onClick={handleBackToApp}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors text-sm"
          >
            Analizar mi mascota
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
