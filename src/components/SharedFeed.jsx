import React, { useState, useEffect } from 'react';
import PetCard from './PetCard.jsx';
import videoShareService from '../services/videoShareService.js';

/**
 * Componente de Feed Compartido
 * Muestra videos de todos los usuarios desde la base de datos
 */
const SharedFeed = ({ onVideoSelect }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  // Cargar videos del feed público
  const loadVideos = async (pageNum = 1, refresh = false) => {
    try {
      setLoading(pageNum === 1);
      if (refresh) setRefreshing(true);

      console.log(`📋 Cargando videos del feed público - página ${pageNum}`);

      // Obtener videos desde la base de datos
      const publicVideos = await videoShareService.getPublicFeed();
      
      // Simular paginación (en una implementación real, esto vendría del servidor)
      const videosPerPage = 10;
      const startIndex = (pageNum - 1) * videosPerPage;
      const endIndex = startIndex + videosPerPage;
      const pageVideos = publicVideos.slice(startIndex, endIndex);

      console.log(`✅ ${pageVideos.length} videos cargados de ${publicVideos.length} total`);

      if (refresh || pageNum === 1) {
        setVideos(pageVideos);
        setCurrentIndex(0);
      } else {
        setVideos(prev => [...prev, ...pageVideos]);
      }

      setHasMore(endIndex < publicVideos.length);
      setPage(pageNum);
      setError(null);

    } catch (error) {
      console.error('❌ Error cargando videos del feed:', error);
      setError('Error cargando videos del feed');
      
      // Fallback a localStorage si falla la base de datos
      try {
        const fallbackVideos = videoShareService.getUserVideos();
        setVideos(fallbackVideos);
        console.log('🔄 Usando fallback a localStorage');
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar más videos (paginación)
  const loadMore = () => {
    if (!loading && hasMore) {
      loadVideos(page + 1);
    }
  };

  // Refrescar feed
  const refreshFeed = () => {
    loadVideos(1, true);
  };

  // Cargar videos al montar el componente
  useEffect(() => {
    loadVideos();
  }, []);

  // Manejar swipe vertical tipo TikTok
  const handleSwipe = (direction) => {
    if (direction === 'up' && currentIndex < videos.length - 1) {
      // Siguiente video
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      // Video anterior
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'up' && currentIndex === videos.length - 1 && hasMore) {
      // Cargar más videos cuando llegamos al final
      loadMore();
    }
  };

  // Manejar eventos de teclado para navegación
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSwipe(e.key === 'ArrowUp' ? 'up' : 'down');
    }
  };

  // Manejar eventos de touch para swipe
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientY);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const touchEnd = touch.clientY;
    const diff = touchStart - touchEnd;
    
    // Si el swipe es suficientemente largo
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe hacia arriba (siguiente video)
        handleSwipe('up');
      } else {
        // Swipe hacia abajo (video anterior)
        handleSwipe('down');
      }
    }
    
    setTouchStart(null);
  };

  // Manejar selección de video
  const handleVideoSelect = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  // Convertir video de la base de datos a formato de post
  const convertVideoToPost = (video) => {
    // Determinar si el video tiene subtítulos secuenciales
    const hasSequentialSubtitles = video.isSequentialSubtitles && video.subtitles && video.subtitles.length > 0;
    
    return {
      id: video.id,
      username: `@${video.userId}`,
      petName: video.petName || 'Mascota',
      breed: 'Mascota',
      mediaUrl: video.mediaUrl || video.thumbnailUrl,
      mediaType: video.mediaType || 'video',
      
      // Para videos con subtítulos secuenciales, no mostrar traducción estática
      translation: hasSequentialSubtitles ? null : (video.translation || video.emotionalDubbing || 'Análisis de comportamiento'),
      emotionalDubbing: hasSequentialSubtitles ? null : (video.emotionalDubbing || video.translation),
      
      emotionalTone: 'análisis',
      emotionalStyle: 'compartido',
      emotion: 'compartido',
      context: 'feed_compartido',
      confidence: 85,
      likes: video.likeCount || 0,
      comments: video.commentCount || 0,
      shares: video.shareCount || 0,
      timestamp: formatTimestamp(video.createdAt),
      isShared: true,
      source: 'shared_feed',
      
      // Preservar propiedades de subtítulos secuenciales
      isSequentialSubtitles: video.isSequentialSubtitles || false,
      subtitles: video.subtitles || null,
      totalDuration: video.totalDuration || video.duration || 30
    };
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Hace un momento';
    
    const now = new Date();
    const videoDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - videoDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Mostrar loading
  if (loading && videos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Cargando feed compartido...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error && videos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center text-white p-6">
          <div className="text-6xl mb-4">😿</div>
          <h3 className="text-xl font-bold mb-2">Error cargando el feed</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={refreshFeed}
            className="bg-[#1ca9b1] text-white px-6 py-2 rounded-lg hover:bg-[#0f8a91] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar feed vacío
  if (videos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center text-white p-6">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-xl font-bold mb-2">¡No hay videos aún!</h3>
          <p className="text-gray-300 mb-4">Sé el primero en compartir un video de tu mascota</p>
          <button
            onClick={refreshFeed}
            className="bg-[#1ca9b1] text-white px-6 py-2 rounded-lg hover:bg-[#0f8a91] transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header del Feed Compartido */}
      <div className="flex-shrink-0 bg-[#1ca9b1] pt-12 pb-4 px-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo_blabla_pet_positive.png" 
              alt="BlaBlaPet Logo" 
              className="h-20 w-auto"
            />
            <div>
              <h1 className="text-white text-lg font-bold">Feed Compartido</h1>
              <p className="text-white/80 text-sm">{videos.length} videos</p>
              <p className="text-white/60 text-xs">↑↓ Swipe para navegar</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={refreshFeed}
              disabled={refreshing}
              className="text-white disabled:opacity-50"
            >
              <svg 
                className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Container - Sistema TikTok (Swipe Vertical) */}
      <div 
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {videos.map((video, index) => {
          const post = convertVideoToPost(video);
          
          // Debug logging para subtítulos secuenciales
          if (post.isSequentialSubtitles) {
            console.log('🎬 Video con subtítulos secuenciales:', {
              id: video.id,
              petName: video.petName,
              isSequentialSubtitles: post.isSequentialSubtitles,
              subtitlesCount: post.subtitles?.length,
              totalDuration: post.totalDuration
            });
          }
          
          return (
            <div
              key={video.id}
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                index === currentIndex ? 'translate-y-0' : 
                index < currentIndex ? '-translate-y-full' : 'translate-y-full'
              }`}
            >
              <PetCard 
                post={post} 
                onSelect={() => handleVideoSelect(video)}
                isShared={true}
              />
            </div>
          );
        })}
      </div>

      {/* Indicador de posición actual */}
      {videos.length > 1 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
          <div className="flex flex-col space-y-2">
            {videos.slice(0, Math.min(5, videos.length)).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50'
                }`}
              />
            ))}
            {videos.length > 5 && (
              <div className="text-white/70 text-xs text-center">
                {currentIndex + 1}/{videos.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de carga más */}
      {loading && videos.length > 0 && (
        <div className="flex-shrink-0 bg-black/80 text-white text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
          <p className="text-sm mt-2">Cargando más videos...</p>
        </div>
      )}

      {/* Botón de cargar más */}
      {!loading && hasMore && (
        <div className="flex-shrink-0 bg-black/80 text-center py-4">
          <button
            onClick={loadMore}
            className="bg-[#1ca9b1] text-white px-6 py-2 rounded-lg hover:bg-[#0f8a91] transition-colors"
          >
            Cargar más videos
          </button>
        </div>
      )}
    </div>
  );
};

export default SharedFeed;
