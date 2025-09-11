/**
 * Servicio para generar URLs únicas de videos analizados
 * Permite compartir videos con preview como TikTok
 */
class VideoShareService {
  constructor() {
    // Detectar si estamos en producción o desarrollo
    const isProduction = typeof window !== 'undefined' && 
      (window.location.hostname.includes('vercel.app') || 
       window.location.hostname.includes('blabla-pet-web') ||
       window.location.hostname !== 'localhost');
    
    this.baseUrl = isProduction 
      ? 'https://blabla-pet-web.vercel.app'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
    
    // Usar variable de entorno si está disponible
    if (typeof process !== 'undefined' && process.env && process.env.VITE_APP_URL) {
      this.baseUrl = process.env.VITE_APP_URL;
    }
    
    this.storageKey = 'yo_pett_videos';
    this.isProduction = isProduction;
    
    // Asegurar que siempre use el puerto correcto en desarrollo
    if (!isProduction) {
      if (this.baseUrl.includes('5175')) {
        this.baseUrl = this.baseUrl.replace('5175', '5173');
      }
      if (this.baseUrl.includes('5177')) {
        this.baseUrl = this.baseUrl.replace('5177', '5173');
      }
    }
    
    // Logs solo en desarrollo
    if (!isProduction) {
      console.log(`🌐 VideoShareService initialized for DEVELOPMENT`);
      console.log(`🔗 Base URL: ${this.baseUrl}`);
    }
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
   * Almacenar video persistentemente y generar URL única
   * @param {Object} post - Datos del post con video
   * @returns {Promise<string>} URL única del video
   */
  async storeVideoAndGenerateUrl(post) {
    const videoId = this.generateVideoId(post);
    
    // Crear objeto de video con metadatos
    const videoData = {
      ...post,
      id: videoId,
      createdAt: new Date().toISOString(),
      shareCount: 0
    };
    
    // Guardar en almacenamiento
    await this.saveVideoToStorage(videoId, videoData);

    // Generar URL única con parámetros para el preview
    const videoUrl = `${this.baseUrl}/video.html?id=${videoId}`;
    
    // Logs solo en desarrollo
    if (!this.isProduction) {
      console.log(`📹 Video almacenado persistentemente con ID: ${videoId}`);
      console.log(`🔗 URL generada: ${videoUrl}`);
    }
    
    return videoUrl;
  }

  /**
   * Obtener datos de video por ID
   * @param {string} videoId - ID del video
   * @returns {Promise<Object|null>} Datos del video o null si no existe
   */
  async getVideoById(videoId) {
    return await this.getVideoFromStorage(videoId);
  }

  /**
   * Incrementar contador de compartidos
   * @param {string} videoId - ID del video
   */
  async incrementShareCount(videoId) {
    const video = await this.getVideoFromStorage(videoId);
    if (video) {
      video.shareCount += 1;
      await this.saveVideoToStorage(videoId, video);
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
      url: `${this.baseUrl}/video.html?id=${video.id}`,
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
   * Limpiar videos antiguos (más de 7 días)
   */
  cleanupOldVideos() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const allVideos = this.getAllVideosFromStorage();
    const videosToKeep = {};
    
    for (const [videoId, video] of Object.entries(allVideos)) {
      const createdAt = new Date(video.createdAt);
      if (createdAt >= oneWeekAgo) {
        videosToKeep[videoId] = video;
      } else {
        console.log(`🗑️ Video ${videoId} eliminado por antigüedad`);
      }
    }
    
    // Guardar solo los videos que no han expirado
    localStorage.setItem(this.storageKey, JSON.stringify(videosToKeep));
  }

  /**
   * Obtener estadísticas de videos
   * @returns {Object} Estadísticas
   */
  getStats() {
    const videos = Object.values(this.getAllVideosFromStorage());
    const totalShares = videos.reduce((sum, video) => sum + video.shareCount, 0);
    
    return {
      totalVideos: videos.length,
      totalShares: totalShares,
      averageShares: videos.length > 0 ? (totalShares / videos.length).toFixed(1) : 0
    };
  }

  /**
   * Guardar video en almacenamiento (localStorage + IndexedDB en producción)
   * @param {string} videoId - ID del video
   * @param {Object} videoData - Datos del video
   */
  async saveVideoToStorage(videoId, videoData) {
    try {
      // Siempre guardar en localStorage para compatibilidad
      const allVideos = this.getAllVideosFromStorage();
      allVideos[videoId] = videoData;
      localStorage.setItem(this.storageKey, JSON.stringify(allVideos));
      
      // En producción, también guardar en IndexedDB para mayor capacidad
      if (this.isProduction && 'indexedDB' in window) {
        await this.saveToIndexedDB(videoId, videoData);
      }
      
      // Logs solo en desarrollo
      if (!this.isProduction) {
        console.log(`💾 Video ${videoId} guardado en localStorage`);
      }
    } catch (error) {
      console.error('Error guardando video:', error);
    }
  }

  /**
   * Obtener video específico desde almacenamiento
   * @param {string} videoId - ID del video
   * @returns {Object|null} Datos del video
   */
  async getVideoFromStorage(videoId) {
    try {
      // Primero intentar desde localStorage
      const allVideos = this.getAllVideosFromStorage();
      if (allVideos[videoId]) {
        return allVideos[videoId];
      }
      
      // En producción, también buscar en IndexedDB
      if (this.isProduction && 'indexedDB' in window) {
        const indexedVideo = await this.getFromIndexedDB(videoId);
        if (indexedVideo) {
          return indexedVideo;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo video:', error);
      return null;
    }
  }

  /**
   * Obtener todos los videos desde localStorage
   * @returns {Object} Todos los videos almacenados
   */
  getAllVideosFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error obteniendo videos desde localStorage:', error);
      return {};
    }
  }

  /**
   * Obtener todos los videos del usuario para el perfil
   * @returns {Array} Array de videos del usuario
   */
  getUserVideos() {
    const allVideos = this.getAllVideosFromStorage();
    return Object.values(allVideos).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Guardar video en IndexedDB (para producción)
   * @param {string} videoId - ID del video
   * @param {Object} videoData - Datos del video
   */
  async saveToIndexedDB(videoId, videoData) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('YoPettVideos', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        const putRequest = store.put(videoData, videoId);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos');
        }
      };
    });
  }

  /**
   * Obtener video desde IndexedDB (para producción)
   * @param {string} videoId - ID del video
   * @returns {Object|null} Datos del video
   */
  async getFromIndexedDB(videoId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('YoPettVideos', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['videos'], 'readonly');
        const store = transaction.objectStore('videos');
        const getRequest = store.get(videoId);
        
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos');
        }
      };
    });
  }
}

export default new VideoShareService();
