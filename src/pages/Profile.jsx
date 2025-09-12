import React, { useState, useEffect } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import PetCard from '../components/PetCard';
import videoShareService from '../services/videoShareService.js';

/**
 * Página de Perfil tipo TikTok
 * Muestra videos personales del usuario en grid de 3 columnas
 */
const Profile = () => {
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  // Cargar videos del usuario
  useEffect(() => {
    loadUserVideos();
  }, []);

  const loadUserVideos = async () => {
    try {
      setLoading(true);
      // Obtener videos del usuario desde la base de datos
      const videos = await videoShareService.getUserVideos();
      setUserVideos(videos);
    } catch (error) {
      console.error('Error cargando videos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convertir video de la base de datos a formato de post
  const convertVideoToPost = (video) => {
    return {
      id: video.id,
      username: `@${video.userId}`,
      petName: video.petName || 'Mi mascota',
      breed: 'Mascota',
      mediaUrl: video.mediaUrl || video.thumbnailUrl,
      mediaType: video.mediaType || 'video',
      // Solo incluir traducción estática si NO hay subtítulos secuenciales
      translation: video.isSequentialSubtitles ? null : (video.translation || video.emotionalDubbing || 'Análisis de comportamiento'),
      emotionalDubbing: video.isSequentialSubtitles ? null : (video.emotionalDubbing || video.translation),
      emotionalTone: 'análisis',
      emotionalStyle: 'personal',
      emotion: 'personal',
      context: 'video_personal',
      confidence: video.confidence || 85,
      likes: video.likeCount || 0,
      comments: video.commentCount || 0,
      shares: video.shareCount || 0,
      timestamp: formatTimestamp(video.createdAt),
      isPersonal: true,
      source: 'user_profile',
      // Incluir propiedades de subtítulos secuenciales
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

  // Manejar selección de video
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  // Manejar edición de video
  const handleEditVideo = (video) => {
    setEditingVideo(video);
    // Aquí podrías abrir un modal de edición
    console.log('Editando video:', video);
  };

  // Manejar eliminación de video
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este video?')) {
      try {
        // Aquí implementarías la eliminación del video
        console.log('Eliminando video:', videoId);
        // Recargar videos
        await loadUserVideos();
      } catch (error) {
        console.error('Error eliminando video:', error);
      }
    }
  };

  // Manejar compartir video
  const handleShareVideo = async (video) => {
    try {
      // Usar el servicio de compartir
      const shareService = window.shareService;
      if (shareService) {
        await shareService.shareToWhatsApp(video);
      }
    } catch (error) {
      console.error('Error compartiendo video:', error);
    }
  };

  // Calcular stats del usuario
  const userStats = {
    videos: userVideos.length,
    totalLikes: userVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0),
    totalShares: userVideos.reduce((sum, video) => sum + (video.shareCount || 0), 0),
    totalComments: userVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header del Perfil */}
      <div className="bg-gradient-to-b from-[#1ca9b1] to-[#0f8a91] pt-12 pb-6 px-4">
        <div className="flex items-center space-x-4">
          {/* Foto de perfil */}
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Información del usuario */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">@usuario_yo_pett</h1>
            <p className="text-white/80 text-sm">Traductor de mascotas</p>
            
            {/* Stats */}
            <div className="flex space-x-6 mt-2">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{userStats.videos}</div>
                <div className="text-white/70 text-xs">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{userStats.totalLikes}</div>
                <div className="text-white/70 text-xs">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{userStats.totalShares}</div>
                <div className="text-white/70 text-xs">Shares</div>
              </div>
            </div>
          </div>

          {/* Botón de editar perfil */}
          <button className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
            Editar
          </button>
        </div>
      </div>

      {/* Grid de Videos */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Cargando videos...</span>
          </div>
        ) : userVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-xl font-bold text-white mb-2">No tienes videos aún</h3>
            <p className="text-white/70 mb-6">Crea tu primer video analizando a tu mascota</p>
            <button 
              onClick={() => window.location.href = '/camera'}
              className="bg-[#1ca9b1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0f8a91] transition-colors"
            >
              Crear Video
            </button>
          </div>
        ) : (
          <>
            {/* Título de la sección */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Mis Videos</h2>
              <span className="text-white/70 text-sm">{userVideos.length} videos</span>
            </div>

            {/* Grid de 3 columnas tipo TikTok */}
            <div className="grid grid-cols-3 gap-2">
              {userVideos.map((video, index) => {
                const post = convertVideoToPost(video);
                return (
                  <div
                    key={video.id}
                    className="relative group cursor-pointer"
                    onClick={() => handleVideoSelect(video)}
                  >
                    {/* Thumbnail del video */}
                    <div className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
                      {video.mediaType === 'video' ? (
                        <video
                          src={video.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={video.mediaUrl}
                          alt={video.petName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Overlay con información */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-xs font-medium truncate">{video.petName}</p>
                          <p className="text-white/80 text-xs truncate">"{video.translation}"</p>
                        </div>
                      </div>

                      {/* Indicador de video */}
                      {video.mediaType === 'video' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Stats del video */}
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center space-x-2 text-white text-xs">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {video.likeCount || 0}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                            </svg>
                            {video.shareCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menú de opciones */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVideo(video);
                          }}
                          className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video.id);
                          }}
                          className="w-6 h-6 bg-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500/70 transition-colors"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de video (placeholder) */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md mx-auto">
            <PetCard 
              post={convertVideoToPost(selectedVideo)} 
              onClose={() => setShowVideoModal(false)}
            />
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Profile;