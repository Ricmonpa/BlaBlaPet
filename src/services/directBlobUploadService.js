/**
 * Servicio para upload directo al Blob Store de Vercel
 * Bypass de Vercel Functions para evitar límites de tamaño
 */

class DirectBlobUploadService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://blabla-pet-ai.vercel.app';
  }

  /**
   * Obtener URL de upload directo al Blob Store
   * @param {string} fileName - Nombre del archivo
   * @param {string} contentType - Tipo de contenido
   * @returns {Promise<Object>} URL de upload y metadata
   */
  async getUploadUrl(fileName, contentType = 'video/mp4') {
    try {
      console.log('🔗 Obteniendo URL de upload directo para:', fileName);
      
      const response = await fetch(`${this.baseUrl}/api/get-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName, contentType })
      });

      if (!response.ok) {
        throw new Error(`Error obteniendo URL de upload: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ URL de upload obtenida:', result.pathname);
      
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo URL de upload:', error);
      throw error;
    }
  }

  /**
   * Subir archivo directamente al Blob Store
   * @param {File} file - Archivo a subir
   * @param {string} fileName - Nombre del archivo en el Blob Store
   * @returns {Promise<Object>} Resultado del upload
   */
  async uploadFile(file, fileName) {
    try {
      console.log('📤 Iniciando upload directo al Blob Store...', fileName);
      console.log('📁 Archivo:', { name: file.name, size: file.size, type: file.type });

      // Obtener URL de upload
      const { uploadUrl } = await this.getUploadUrl(fileName, file.type);

      // Subir archivo directamente al Blob Store
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Error subiendo archivo: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();
      console.log('✅ Archivo subido exitosamente:', result.pathname);
      
      return {
        success: true,
        url: result.url,
        downloadUrl: result.downloadUrl,
        pathname: result.pathname,
        size: file.size,
        type: file.type,
      };

    } catch (error) {
      console.error('❌ Error en upload directo:', error);
      throw error;
    }
  }

  /**
   * Subir video con metadata
   * @param {File} videoFile - Archivo de video
   * @param {Object} metadata - Metadata del video
   * @returns {Promise<Object>} Video subido con metadata
   */
  async uploadVideo(videoFile, metadata = {}) {
    try {
      const timestamp = Date.now();
      const fileName = `videos/video_${timestamp}_${Math.random().toString(36).slice(2, 8)}.mp4`;
      
      console.log('🎬 Subiendo video con metadata...', fileName);

      // Subir archivo de video
      const uploadResult = await this.uploadFile(videoFile, fileName);

      // Crear metadata del video
      const videoData = {
        id: `video_${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
        petName: metadata.petName || 'Mascota',
        translation: metadata.translation || '',
        emotionalDubbing: metadata.emotionalDubbing || '',
        mediaUrl: uploadResult.url,
        mediaType: 'video',
        thumbnailUrl: uploadResult.url, // Usar la misma URL como thumbnail por ahora
        userId: metadata.userId || 'user_anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shareCount: 0,
        likeCount: 0,
        commentCount: 0,
        isPublic: true,
        tags: metadata.tags || [],
        metadata: {
          duration: metadata.duration || 0,
          fileSize: uploadResult.size,
          resolution: metadata.resolution || 'unknown',
          format: 'mp4'
        },
        ...metadata
      };

      // Guardar metadata en la base de datos
      const response = await fetch(`${this.baseUrl}/api/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        throw new Error(`Error guardando metadata: ${response.status} ${response.statusText}`);
      }

      const savedVideo = await response.json();
      console.log('✅ Video y metadata guardados:', savedVideo.id);
      
      return savedVideo;

    } catch (error) {
      console.error('❌ Error subiendo video:', error);
      throw error;
    }
  }
}

export default new DirectBlobUploadService();
