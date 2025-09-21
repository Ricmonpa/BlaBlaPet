/**
 * Servicio para upload directo al Blob Store de Vercel
 * Bypass de Vercel Functions para evitar límites de tamaño
 */

class DirectBlobUploadService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://blabla-pet-ai.vercel.app';
  }

  /**
   * Obtener presigned URL para upload directo
   * @param {File} file - Archivo a subir
   * @returns {Promise<Object>} URL de upload y metadata
   */
  async getUploadUrl(file) {
    try {
      console.log('🔗 Obteniendo presigned URL para:', file.name);
      
      // Enviar solo metadata, no el archivo
      const response = await fetch(`${this.baseUrl}/api/get-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obteniendo presigned URL: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Presigned URL obtenida:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo presigned URL:', error);
      throw error;
    }
  }

  /**
   * Subir archivo usando presigned URL de Vercel Blob
   * @param {File} file - Archivo a subir
   * @returns {Promise<Object>} Resultado del upload
   */
  async uploadFile(file) {
    try {
      console.log('📤 Iniciando upload directo...', file.name);
      console.log('📁 Archivo:', { name: file.name, size: file.size, type: file.type });

      // Obtener presigned URL
      const uploadData = await this.getUploadUrl(file);
      console.log('🔗 Presigned URL obtenida:', uploadData.uploadUrl);

      // Subir archivo directamente usando PUT
      console.log('📤 Subiendo archivo a Vercel Blob...');
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Error en upload:', errorText);
        throw new Error(`Error subiendo archivo: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      console.log('✅ Archivo subido exitosamente a Vercel Blob');
      
      return {
        success: true,
        url: uploadData.url,
        downloadUrl: uploadData.downloadUrl || uploadData.url,
        pathname: uploadData.pathname,
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
      const uploadResult = await this.uploadFile(videoFile);

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
