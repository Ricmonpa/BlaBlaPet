import VideoCompressor from '../utils/videoCompressor.js';

/**
 * Servicio para upload directo a Cloudinary
 * Con compresión agresiva como fallback para videos grandes
 */

class DirectBlobUploadService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://blabla-pet-ai.vercel.app';
  }

  /**
   * Subir archivo directamente a Cloudinary
   * @param {File} file - Archivo a subir
   * @param {Object} metadata - Metadata del archivo
   * @returns {Promise<Object>} Resultado del upload
   */
  async uploadToCloudinary(file, metadata = {}) {
    try {
      console.log('📤 Subiendo archivo a Cloudinary...', file.name);
      console.log('📁 Archivo:', { name: file.name, size: file.size, type: file.type });

      const formData = new FormData();
      formData.append('video', file);
      
      // Agregar metadata como campos adicionales
      if (metadata.petName) formData.append('petName', metadata.petName);
      if (metadata.translation) formData.append('translation', metadata.translation);
      if (metadata.emotionalDubbing) formData.append('emotionalDubbing', metadata.emotionalDubbing);
      if (metadata.subtitles) formData.append('subtitles', JSON.stringify(metadata.subtitles));
      if (metadata.totalDuration) formData.append('totalDuration', metadata.totalDuration);
      if (metadata.isSequentialSubtitles) formData.append('isSequentialSubtitles', metadata.isSequentialSubtitles);
      if (metadata.userId) formData.append('userId', metadata.userId);
      if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic);

      const response = await fetch(`${this.baseUrl}/api/upload-video-cloudinary`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error subiendo a Cloudinary: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Archivo subido exitosamente a Cloudinary:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error subiendo a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Subir archivo usando Cloudinary (método principal)
   * @param {File} file - Archivo a subir
   * @param {Object} metadata - Metadata del archivo
   * @returns {Promise<Object>} Resultado del upload
   */
  async uploadFile(file, metadata = {}) {
    try {
      console.log('📤 Iniciando upload a Cloudinary...', file.name);
      console.log('📁 Archivo:', { name: file.name, size: file.size, type: file.type });

      // Usar el nuevo método de Cloudinary
      const result = await this.uploadToCloudinary(file, metadata);
      
      return {
        success: true,
        url: result.url,
        downloadUrl: result.url,
        pathname: result.publicId,
        size: file.size,
        type: file.type,
        cloudinary: result.cloudinary
      };

    } catch (error) {
      console.error('❌ Error en upload a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Subir video con metadata y compresión automática
   * @param {File} videoFile - Archivo de video
   * @param {Object} metadata - Metadata del video
   * @returns {Promise<Object>} Video subido con metadata
   */
  async uploadVideo(videoFile, metadata = {}) {
    try {
      const timestamp = Date.now();
      let processedFile = videoFile;
      let wasCompressed = false;
      
      console.log('🎬 Subiendo video con metadata...');
      console.log('📁 Archivo original:', {
        name: videoFile.name,
        size: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
        type: videoFile.type
      });

      // Verificar si necesita compresión
      if (VideoCompressor.needsCompression(videoFile)) {
        console.log('🗜️ Video muy grande, aplicando compresión agresiva...');
        
        try {
          // Usar modo análisis si es para subtítulos, agresivo para almacenamiento
          const compressionMode = metadata?.forAnalysis ? 'analysis' : 'aggressive';
          
          processedFile = await VideoCompressor.compressVideo(videoFile, {
            mode: compressionMode
          });
          
          console.log(`🗜️ Compresión en modo ${compressionMode}:`, {
            original: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
            compressed: (processedFile.size / 1024 / 1024).toFixed(2) + ' MB'
          });
          wasCompressed = true;
          
          console.log('✅ Video comprimido exitosamente');
        } catch (compressionError) {
          console.warn('⚠️ Error en compresión, intentando upload original:', compressionError.message);
          // Si falla la compresión, intentar con el original
          processedFile = videoFile;
        }
      }

      // Intentar subir el archivo (comprimido o original) a Cloudinary
      let uploadResult;
      try {
        uploadResult = await this.uploadFile(processedFile, metadata);
      } catch (uploadError) {
        // Si falla el upload y no se había comprimido, intentar compresión
        if (!wasCompressed && (uploadError.message.includes('413') || uploadError.message.includes('too large'))) {
          console.log('🗜️ Upload falló por tamaño, forzando compresión...');
          
          try {
            processedFile = await VideoCompressor.compressVideo(videoFile, {
              mode: 'aggressive' // Siempre agresivo en fallback
            });
            
            uploadResult = await this.uploadFile(processedFile, metadata);
            wasCompressed = true;
          } catch (fallbackError) {
            console.error('❌ Falló incluso con compresión máxima:', fallbackError);
            throw new Error('Video demasiado grande incluso después de compresión agresiva');
          }
        } else {
          throw uploadError;
        }
      }

      // El metadata ya viene del endpoint de Cloudinary, solo agregar información adicional
      const videoData = {
        ...uploadResult.metadata, // Usar metadata de Cloudinary
        cloudinary: uploadResult.cloudinary, // Información específica de Cloudinary
        metadata: {
          ...uploadResult.metadata.metadata,
          duration: metadata.duration || uploadResult.cloudinary?.duration || 0,
          fileSize: uploadResult.size,
          originalSize: videoFile.size,
          wasCompressed: wasCompressed,
          resolution: wasCompressed ? '480p' : (metadata.resolution || 'original'),
          format: processedFile.type.includes('webm') ? 'webm' : 'mp4',
          cloudinary: uploadResult.cloudinary
        }
      };

      console.log('✅ Video subido a Cloudinary exitosamente:', uploadResult.publicId);
      
      if (wasCompressed) {
        console.log('🗜️ Video fue comprimido para cumplir límites de tamaño');
      }
      
      return videoData;

    } catch (error) {
      console.error('❌ Error subiendo video:', error);
      throw error;
    }
  }
}

export default new DirectBlobUploadService();
