import SmartVideoCompressor from '../utils/smartVideoCompressor.js';

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
      console.log('📤 Subiendo archivo DIRECTO a Cloudinary (bypass Vercel)...', file.name);
      console.log('📁 Archivo:', { name: file.name, size: file.size, type: file.type });

      // Upload directo a Cloudinary desde el frontend (bypass Vercel 4.5MB limit)
      const formData = new FormData();
      formData.append('file', file);
      // Usar upload preset (más seguro para producción)
      formData.append('upload_preset', 'yo-pett-videos');
      formData.append('folder', 'yo-pett-videos');
      
      // Agregar autenticación para upload directo
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
      
      if (apiKey) formData.append('api_key', apiKey);
      if (apiSecret) formData.append('api_secret', apiSecret);
      
      // Agregar metadata como context
      if (metadata.subtitles) {
        formData.append('context', JSON.stringify({
          subtitles: JSON.stringify(metadata.subtitles),
          petName: metadata.petName || '',
          translation: metadata.translation || '',
          emotionalDubbing: metadata.emotionalDubbing || '',
          totalDuration: metadata.totalDuration || 0,
          isSequentialSubtitles: metadata.isSequentialSubtitles || false,
          userId: metadata.userId || '',
          isPublic: metadata.isPublic || false
        }));
      }
      
      if (metadata.tags) {
        formData.append('tags', metadata.tags.join(','));
      }

      // Upload directo a Cloudinary (SIN VERCEL)
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      console.log('🚀 Upload directo a Cloudinary...');
      console.log('🔧 Cloud Name:', cloudName);
      console.log('🔗 Upload URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Agregar timeout para evitar colgadas
        signal: AbortSignal.timeout(900000) // 15 minutos timeout para videos largos
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cloudinary upload failed:', errorText);
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Upload directo a Cloudinary exitoso:', result);
      
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
        url: result.secure_url,
        downloadUrl: result.secure_url,
        pathname: result.publicId,
        size: file.size,
        type: file.type,
        cloudinary: result // Pasar el resultado completo de Cloudinary
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
      // Validar que el archivo no sea null
      if (!videoFile) {
        throw new Error('No se puede subir: archivo de video no válido o expirado. Por favor, graba un nuevo video.');
      }
      
      const timestamp = Date.now();
      let processedFile = videoFile;
      let wasCompressed = false;
      
      console.log('🎬 Subiendo video con metadata...');
      console.log('📁 Archivo original:', {
        name: videoFile.name,
        size: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
        type: videoFile.type
      });

      // COMPRESIÓN INTELIGENTE AUTOMÁTICA
      console.log('🎯 Aplicando compresión inteligente automática...');
      const compressionResult = await SmartVideoCompressor.compressWithFallback(videoFile);
      processedFile = compressionResult.file;
      
      console.log('📊 Resultado de compresión:', {
        perfilFinal: compressionResult.finalProfile,
        intentos: compressionResult.attempts.length,
        tamañoFinal: (processedFile.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      // Intentar subir el archivo (comprimido o original) a Cloudinary
      let uploadResult;
      try {
        uploadResult = await this.uploadFile(processedFile, metadata);
      } catch (uploadError) {
        // Si falla el upload, el compresor inteligente ya aplicó fallback progresivo
        // Solo intentar una compresión más agresiva si es absolutamente necesario
        if (uploadError.message.includes('413') || uploadError.message.includes('too large')) {
          console.log('🗜️ Upload falló incluso con compresión inteligente, intentando compresión extrema...');
          
          try {
            // Usar el perfil más agresivo disponible
            const extremeProfile = SmartVideoCompressor.fallbackProfiles[2]; // 360p_extreme
            processedFile = await SmartVideoCompressor.compressWithProfile(videoFile, extremeProfile);
            
            uploadResult = await this.uploadFile(processedFile, metadata);
            wasCompressed = true;
            
            console.log('✅ Éxito con compresión extrema:', (processedFile.size / 1024 / 1024).toFixed(2) + ' MB');
          } catch (fallbackError) {
            console.error('❌ Falló incluso con compresión extrema:', fallbackError);
            throw new Error('Video demasiado grande incluso después de compresión extrema (360p, 200kbps)');
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
          ...uploadResult.metadata?.metadata || {}, // Usar metadata anidado si existe
          duration: metadata.duration || uploadResult.cloudinary?.duration || 0,
          fileSize: uploadResult.size,
          originalSize: videoFile.size,
          wasCompressed: wasCompressed,
          resolution: wasCompressed ? '480p' : (metadata.resolution || 'original'),
          format: processedFile.type.includes('webm') ? 'webm' : 'mp4',
          cloudinary: uploadResult.cloudinary
        }
      };

      console.log('✅ Video subido a Cloudinary exitosamente:', uploadResult.cloudinary?.public_id);
      
      if (wasCompressed) {
        console.log('🗜️ Video fue comprimido para cumplir límites de tamaño');
      }
      
      // Retornar estructura correcta para Camera.jsx - SIEMPRE usar HTTPS
      return {
        success: true,
        mediaUrl: uploadResult.cloudinary?.secure_url || uploadResult.secure_url,
        id: uploadResult.cloudinary?.public_id,
        cloudinary: uploadResult.cloudinary,
        metadata: videoData
      };

    } catch (error) {
      console.error('❌ Error subiendo video:', error);
      throw error;
    }
  }
}

export default new DirectBlobUploadService();
