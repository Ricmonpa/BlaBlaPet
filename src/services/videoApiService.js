/**
 * Servicio de API para videos - Conecta con la base de datos JSON Server
 * NO modifica el modelo de pensamiento existente
 */

class VideoApiService {
  constructor() {
    // Detectar si estamos en producción o desarrollo
    const isProduction = typeof window !== 'undefined' && 
      (window.location.hostname.includes('vercel.app') || 
       window.location.hostname.includes('blabla-pet-web') ||
       window.location.hostname !== 'localhost');
    
    this.baseUrl = isProduction 
      ? (typeof window !== 'undefined' ? window.location.origin : 'https://blabla-pet-web.vercel.app')
      : 'http://localhost:3002';
    
    // Usar siempre /api/videos para consistencia
    this.videosEndpoint = `${this.baseUrl}/api/videos`;
    this.usersEndpoint = `${this.baseUrl}/api/users`;
    this.sharesEndpoint = `${this.baseUrl}/api/shares`;
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
   * Obtener todos los videos públicos
   * @returns {Promise<Array>} Lista de videos
   */
  async getAllVideos() {
    try {
      console.log('📋 Obteniendo todos los videos...');
      
      const response = await fetch(this.videosEndpoint);
      
      if (!response.ok) {
        throw new Error(`Error obteniendo videos: ${response.status} ${response.statusText}`);
      }

      const videos = await response.json();
      console.log(`✅ ${videos.length} videos obtenidos`);
      
      return videos;
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
