/**
 * Servicio para generar URLs únicas de videos analizados
 * Permite compartir videos con preview como TikTok
 */
class VideoShareService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    this.videoStorage = new Map(); // Almacenamiento temporal de videos
  }

  /**
   * Generar ID único para un video
   * @param {Object} post - Datos del post con video
   * @returns {string} ID único
   */
  generateVideoId(post) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `video_${timestamp}_${randomId}`;
  }

  /**
   * Almacenar video temporalmente y generar URL única
   * @param {Object} post - Datos del post con video
   * @returns {string} URL única del video
   */
  storeVideoAndGenerateUrl(post) {
    const videoId = this.generateVideoId(post);
    
    // Almacenar datos del video
    this.videoStorage.set(videoId, {
      ...post,
      id: videoId,
      createdAt: new Date().toISOString(),
      shareCount: 0
    });

    // Generar URL única
    const videoUrl = `${this.baseUrl}/video/${videoId}`;
    
    console.log(`📹 Video almacenado con ID: ${videoId}`);
    console.log(`🔗 URL generada: ${videoUrl}`);
    
    return videoUrl;
  }

  /**
   * Obtener datos de video por ID
   * @param {string} videoId - ID del video
   * @returns {Object|null} Datos del video o null si no existe
   */
  getVideoById(videoId) {
    return this.videoStorage.get(videoId) || null;
  }

  /**
   * Incrementar contador de compartidos
   * @param {string} videoId - ID del video
   */
  incrementShareCount(videoId) {
    const video = this.videoStorage.get(videoId);
    if (video) {
      video.shareCount += 1;
      this.videoStorage.set(videoId, video);
    }
  }

  /**
   * Generar metadatos Open Graph para WhatsApp preview
   * @param {Object} video - Datos del video
   * @returns {Promise<Object>} Metadatos Open Graph
   */
  async generateOpenGraphMeta(video) {
    const title = `¡Mira lo que dice ${video.petName || 'mi mascota'}! 🐕`;
    const description = video.translation || video.emotionalDubbing || 'Análisis de comportamiento de mascota';
    const thumbnail = await this.generateVideoThumbnail(video);
    
    return {
      title: title,
      description: description,
      image: thumbnail,
      url: `${this.baseUrl}/video/${video.id}`,
      type: 'video.other',
      site_name: 'Yo Pett',
      locale: 'es_ES'
    };
  }

  /**
   * Generar thumbnail del video
   * @param {Object} video - Datos del video
   * @returns {Promise<string>} URL del thumbnail
   */
  async generateVideoThumbnail(video) {
    if (video.mediaType !== 'video') {
      return video.mediaUrl; // Para imágenes, usar la imagen directamente
    }

    try {
      // Crear elemento video temporal para extraer frame
      const videoElement = document.createElement('video');
      videoElement.crossOrigin = 'anonymous';
      videoElement.src = video.mediaUrl;
      
      return new Promise((resolve, reject) => {
        videoElement.addEventListener('loadeddata', () => {
          // Buscar el frame en el 25% del video
          videoElement.currentTime = videoElement.duration * 0.25;
        });

        videoElement.addEventListener('seeked', () => {
          try {
            // Crear canvas para capturar el frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Establecer dimensiones del canvas
            canvas.width = 400;
            canvas.height = 600;
            
            // Dibujar el frame en el canvas
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            // Convertir a data URL
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // Limpiar elementos temporales
            videoElement.remove();
            canvas.remove();
            
            resolve(thumbnailUrl);
          } catch (error) {
            console.error('Error generando thumbnail:', error);
            resolve(video.mediaUrl); // Fallback a URL original
          }
        });

        videoElement.addEventListener('error', () => {
          console.error('Error cargando video para thumbnail');
          resolve(video.mediaUrl); // Fallback a URL original
        });

        // Timeout de seguridad
        setTimeout(() => {
          resolve(video.mediaUrl);
        }, 5000);
      });
    } catch (error) {
      console.error('Error en generateVideoThumbnail:', error);
      return video.mediaUrl; // Fallback a URL original
    }
  }

  /**
   * Generar texto de compartir optimizado para WhatsApp
   * @param {Object} video - Datos del video
   * @returns {string} Texto optimizado
   */
  generateShareText(video) {
    const petName = video.petName || 'mi mascota';
    const translation = video.translation || video.emotionalDubbing || 'análisis de comportamiento';
    
    return `¡Mira lo que dice ${petName}! 🐕\n\n"${translation}"\n\n#YoPett #Perros #Mascotas\n\nVer video completo: ${this.baseUrl}/video/${video.id}`;
  }

  /**
   * Limpiar videos antiguos (más de 24 horas)
   */
  cleanupOldVideos() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (const [videoId, video] of this.videoStorage.entries()) {
      const createdAt = new Date(video.createdAt);
      if (createdAt < oneDayAgo) {
        this.videoStorage.delete(videoId);
        console.log(`🗑️ Video ${videoId} eliminado por antigüedad`);
      }
    }
  }

  /**
   * Obtener estadísticas de videos
   * @returns {Object} Estadísticas
   */
  getStats() {
    const videos = Array.from(this.videoStorage.values());
    const totalShares = videos.reduce((sum, video) => sum + video.shareCount, 0);
    
    return {
      totalVideos: videos.length,
      totalShares: totalShares,
      averageShares: videos.length > 0 ? (totalShares / videos.length).toFixed(1) : 0
    };
  }
}

export default new VideoShareService();
