/**
 * Servicio para upload directo al Blob Store de Vercel
 * Bypass de Vercel Functions para evitar límites de tamaño
 */

class DirectBlobUploadService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://blabla-pet-ai.vercel.app';
  }

  /**
   * Obtener token de upload usando handleUpload de Vercel Blob
   * @param {File} file - Archivo a subir
   * @returns {Promise<Object>} Token y URL de upload
   */
  async getUploadToken(file) {
    try {
      console.log('🔗 Obteniendo token de upload para:', file.name);
      
      // Crear FormData con el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.baseUrl}/api/get-upload-url`, {
        method: 'POST',
        body: formData // No establecer Content-Type, el browser lo hace automáticamente
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obteniendo token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Token de upload obtenido:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo token de upload:', error);
      throw error;
    }
  }

  /**
   * Subir archivo usando handleUpload de Vercel Blob
   * @param {File} file - Archivo a subir
   * @returns {Promise<Object>} Resultado del upload
   */
  async uploadFile(file) {
    try {
      console.log('📤 Iniciando upload con handleUpload...', file.name);
      console.log('📁 Archivo:', { name: file.name, size: file.size, type: file.type });

      // Obtener token de upload usando handleUpload
      const uploadData = await this.getUploadToken(file);
      console.log('🔗 Token obtenido:', uploadData);

      // Si handleUpload devuelve directamente la URL del blob, no necesitamos hacer PUT
      if (uploadData.url) {
        console.log('✅ Archivo subido exitosamente via handleUpload');
        
        return {
          success: true,
          url: uploadData.url,
          downloadUrl: uploadData.downloadUrl || uploadData.url,
          pathname: uploadData.pathname,
          size: file.size,
          type: file.type,
        };
      }

      // Si devuelve un token para upload posterior
      if (uploadData.token && uploadData.uploadUrl) {
        console.log('🔗 Usando token para upload directo...');
        
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
            'Authorization': `Bearer ${uploadData.token}`
          },
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ Error en upload:', errorText);
          throw new Error(`Error subiendo archivo: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
        }

        console.log('✅ Archivo subido exitosamente con token');
        
        return {
          success: true,
          url: uploadData.url,
          downloadUrl: uploadData.downloadUrl || uploadData.url,
          pathname: uploadData.pathname,
          size: file.size,
          type: file.type,
        };
      }

      throw new Error('Respuesta inesperada de handleUpload');

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
