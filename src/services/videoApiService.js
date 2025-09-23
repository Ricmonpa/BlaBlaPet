/**
 * Servicio de API para videos - Híbrido JSON Server/Cloudinary
 * Desarrollo: JSON Server (localhost:3002)
 * Producción: Cloudinary + API endpoints
 */

class VideoApiService {
  constructor() {
    // Detectar si estamos en producción o desarrollo - PRIORIDAD: PRODUCCIÓN SEGURA
    const isProduction = typeof window !== 'undefined' && 
      (window.location.hostname.includes('vercel.app') || 
       window.location.hostname.includes('blabla-pet-web') ||
       window.location.hostname.includes('.vercel.app') ||
       window.location.hostname.includes('.netlify.app') ||
       window.location.hostname.includes('.github.io') ||
       window.location.hostname.includes('herokuapp.com'));
    
    // En desarrollo usar JSON Server, en producción usar Cloudinary + API
    if (isProduction) {
      // Producción: Cloudinary + API endpoints
      this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://blabla-pet-ai.vercel.app';
      this.videosEndpoint = `${this.baseUrl}/api/videos`;
      this.usersEndpoint = `${this.baseUrl}/api/users`;
      this.sharesEndpoint = `${this.baseUrl}/api/shares`;
      console.log('🔧 VideoApiService configurado para PRODUCCIÓN (Cloudinary):', this.baseUrl);
    } else {
      // Desarrollo: JSON Server - Solo en localhost
      this.baseUrl = 'http://localhost:3002';
      this.videosEndpoint = `${this.baseUrl}/videos`;
      this.usersEndpoint = `${this.baseUrl}/users`;
      this.sharesEndpoint = `${this.baseUrl}/shares`;
      console.log('🔧 VideoApiService configurado para DESARROLLO (JSON Server):', this.baseUrl);
    }
  }

  /**
   * Guardar video en la base de datos
   * @param {Object} videoData - Datos del video
   * @returns {Promise<Object>} Video guardado
   */
  async saveVideo(videoData) {
    try {
      console.log('💾 Guardando video en base de datos...', videoData.id);
      
      const response = await fetch(this.videosEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error(`Error guardando video: ${response.status} ${response.statusText}`);
      }

      const savedVideo = await response.json();
      console.log('✅ Video guardado exitosamente:', savedVideo.id);
      
      return savedVideo;
    } catch (error) {
      console.error('❌ Error guardando video:', error);
      throw error;
    }
  }

  /**
   * Obtener video por ID desde la base de datos
   * @param {string} videoId - ID del video
   * @returns {Promise<Object|null>} Video encontrado o null
   */
  async getVideoById(videoId) {
    try {
      console.log('🔍 Buscando video en base de datos:', videoId);
      
      const response = await fetch(`${this.videosEndpoint}/${videoId}`);
      
      if (response.status === 404) {
        console.log('❌ Video no encontrado:', videoId);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Error obteniendo video: ${response.status} ${response.statusText}`);
      }

      const video = await response.json();
      console.log('✅ Video encontrado:', video.id);
      
      return video;
    } catch (error) {
      console.error('❌ Error obteniendo video:', error);
      return null;
    }
  }

  /**
   * Limpiar URLs blob expiradas y URLs de Vercel Blob no válidas del localStorage
   * @returns {Array} Videos locales válidos
   */
  cleanExpiredBlobUrls() {
    try {
      const localVideos = JSON.parse(localStorage.getItem('localVideos') || '[]');
      const validVideos = [];
      let removedCount = 0;
      
      localVideos.forEach(video => {
        // Verificar si es una URL blob
        const isBlobUrl = video.mediaUrl && video.mediaUrl.startsWith('blob:');
        // Verificar si es una URL de Vercel Blob (que puede haber expirado)
        const isVercelBlobUrl = video.mediaUrl && video.mediaUrl.includes('blob.vercel-storage.com');
        
        // Remover URLs blob expiradas (más de 1 hora)
        if (isBlobUrl) {
          const videoDate = new Date(video.createdAt);
          const now = new Date();
          const ageInHours = (now - videoDate) / (1000 * 60 * 60);
          
          if (ageInHours > 1) {
            console.log('🚫 Removiendo video con URL blob expirada (más de 1 hora):', video.id);
            removedCount++;
          } else {
            // Mantener videos blob recientes (menos de 1 hora)
            console.log('⏰ Manteniendo video blob reciente:', video.id, `(${ageInHours.toFixed(1)}h)`);
            validVideos.push(video);
          }
        } 
        // Remover URLs de Vercel Blob (ya no funcionan después de la migración)
        else if (isVercelBlobUrl) {
          console.log('🚫 Removiendo video con URL de Vercel Blob (migrado a Cloudinary):', video.id);
          removedCount++;
        } 
        // Mantener videos con URLs válidas (Cloudinary, etc.)
        else {
          validVideos.push(video);
        }
      });
      
      if (removedCount > 0) {
        console.log(`🧹 Limpiados ${removedCount} videos con URLs expiradas o obsoletas`);
        localStorage.setItem('localVideos', JSON.stringify(validVideos));
      }
      
      return validVideos;
    } catch (error) {
      console.error('❌ Error limpiando URLs expiradas:', error);
      return [];
    }
  }

  /**
   * Obtener todos los videos públicos (remotos + locales)
   * @returns {Promise<Array>} Lista de videos
   */
  async getAllVideos() {
    try {
      console.log('📋 Obteniendo todos los videos...');
      
      // Obtener videos remotos
      let remoteVideos = [];
      try {
        const response = await fetch(this.videosEndpoint);
        if (response.ok) {
          remoteVideos = await response.json();
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo videos remotos:', error.message);
      }
      
      // Obtener videos locales y limpiar URLs blob expiradas
      const localVideos = this.cleanExpiredBlobUrls();
      
      // Combinar videos (locales primero para que aparezcan arriba)
      const allVideos = [...localVideos, ...remoteVideos];
      
      console.log(`✅ ${allVideos.length} videos obtenidos (${localVideos.length} locales + ${remoteVideos.length} remotos)`);
      
      return allVideos;
    } catch (error) {
      console.error('❌ Error obteniendo videos:', error);
      return [];
    }
  }

  /**
   * Obtener videos de un usuario específico
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de videos del usuario
   */
  async getUserVideos(userId) {
    try {
      console.log('👤 Obteniendo videos del usuario:', userId);
      
      const response = await fetch(`${this.videosEndpoint}?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Error obteniendo videos del usuario: ${response.status} ${response.statusText}`);
      }

      const videos = await response.json();
      console.log(`✅ ${videos.length} videos del usuario obtenidos`);
      
      return videos;
    } catch (error) {
      console.error('❌ Error obteniendo videos del usuario:', error);
      return [];
    }
  }

  /**
   * Actualizar video existente
   * @param {string} videoId - ID del video
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Video actualizado
   */
  async updateVideo(videoId, updateData) {
    try {
      console.log('🔄 Actualizando video:', videoId);
      
      const response = await fetch(`${this.videosEndpoint}/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Error actualizando video: ${response.status} ${response.statusText}`);
      }

      const updatedVideo = await response.json();
      console.log('✅ Video actualizado:', updatedVideo.id);
      
      return updatedVideo;
    } catch (error) {
      console.error('❌ Error actualizando video:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de compartidos
   * @param {string} videoId - ID del video
   * @returns {Promise<Object>} Video actualizado
   */
  async incrementShareCount(videoId) {
    try {
      const video = await this.getVideoById(videoId);
      if (!video) {
        throw new Error('Video no encontrado');
      }

      const updatedVideo = await this.updateVideo(videoId, {
        shareCount: (video.shareCount || 0) + 1
      });

      console.log('📈 Contador de compartidos incrementado:', updatedVideo.shareCount);
      return updatedVideo;
    } catch (error) {
      console.error('❌ Error incrementando contador de compartidos:', error);
      throw error;
    }
  }

  /**
   * Registrar un share
   * @param {Object} shareData - Datos del share
   * @returns {Promise<Object>} Share registrado
   */
  async registerShare(shareData) {
    try {
      console.log('📤 Registrando share...', shareData.videoId);
      
      const response = await fetch(this.sharesEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shareData,
          sharedAt: new Date().toISOString(),
          success: true
        })
      });

      if (!response.ok) {
        throw new Error(`Error registrando share: ${response.status} ${response.statusText}`);
      }

      const share = await response.json();
      console.log('✅ Share registrado:', share.id);
      
      return share;
    } catch (error) {
      console.error('❌ Error registrando share:', error);
      throw error;
    }
  }

  /**
   * Verificar si el servicio está disponible
   * @returns {Promise<boolean>} true si está disponible
   */
  async isAvailable() {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch (error) {
      console.error('❌ Servicio de base de datos no disponible:', error);
      return false;
    }
  }
}

export default new VideoApiService();
