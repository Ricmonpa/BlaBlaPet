/**
 * Compresor de video agresivo para videos de hasta 5 minutos
 * Reduce significativamente el tamaño para evitar límites de serverless
 */

class VideoCompressor {
  constructor() {
    this.maxDuration = 5 * 60; // 5 minutos en segundos
    this.maxSizeBytes = 10 * 1024 * 1024; // 10MB límite objetivo
    
    // Configuraciones por modo (más conservadoras para evitar corrupción)
    this.modes = {
      // Modo agresivo - para almacenamiento
      aggressive: {
        targetBitrate: 500, // kbps más alto para evitar corrupción
        maxWidth: 480,
        fps: 20 // FPS más alto para mejor calidad
      },
      // Modo análisis - para que Gemini pueda ver bien
      analysis: {
        targetBitrate: 1000, // kbps alto para máxima calidad
        maxWidth: 720, // HD para mejor análisis
        fps: 25
      }
    };
  }

  /**
   * Comprimir video usando canvas y MediaRecorder
   * @param {File} videoFile - Archivo de video original
   * @param {Object} options - Opciones de compresión
   * @returns {Promise<File>} Video comprimido
   */
  async compressVideo(videoFile, options = {}) {
    const mode = options.mode || 'aggressive'; // Por defecto agresivo
    const config = this.modes[mode];
    
    console.log(`🗜️ Iniciando compresión en modo ${mode.toUpperCase()}...`);
    try {
      console.log('🗜️ Iniciando compresión agresiva de video...');
      console.log('📁 Archivo original:', {
        name: videoFile.name,
        size: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
        type: videoFile.type
      });

      // Verificar duración del video
      const duration = await this.getVideoDuration(videoFile);
      console.log('⏱️ Duración del video:', duration.toFixed(2) + ' segundos');

      if (duration > this.maxDuration) {
        throw new Error(`Video demasiado largo: ${duration.toFixed(1)}s. Máximo permitido: ${this.maxDuration}s`);
      }

      // Crear elemento video para procesar
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Configurar video
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Calcular dimensiones según el modo
      const { width, height } = this.calculateCompressedDimensions(
        video.videoWidth, 
        video.videoHeight,
        config.maxWidth
      );

      canvas.width = width;
      canvas.height = height;

      console.log('📐 Dimensiones:', {
        original: `${video.videoWidth}x${video.videoHeight}`,
        compressed: `${width}x${height}`,
        mode: mode
      });

      // Configurar MediaRecorder con configuraciones COMPATIBLES
      const stream = canvas.captureStream(Math.min(config.fps, 30)); // Máximo 30fps
      
      // Usar configuraciones más conservadoras y compatibles
      let mimeType = 'video/webm';
      let recorderOptions = {};
      
      // Solo agregar bitrate si es soportado y no muy bajo
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      }
      
      // Bitrate mínimo para evitar corrupción
      const safeBitrate = Math.max(config.targetBitrate * 1000, 300000); // Mínimo 300kbps
      
      try {
        recorderOptions = {
          mimeType: mimeType,
          videoBitsPerSecond: safeBitrate
        };
        
        // Probar si la configuración es soportada
        const testRecorder = new MediaRecorder(stream, recorderOptions);
        testRecorder.stop();
        
      } catch (error) {
        console.warn('⚠️ Configuración avanzada no soportada, usando básica');
        recorderOptions = { mimeType: 'video/webm' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      
      console.log('🎬 MediaRecorder configurado:', {
        mimeType: recorderOptions.mimeType,
        bitrate: recorderOptions.videoBitsPerSecond || 'automático',
        fps: Math.min(config.fps, 30)
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Iniciar grabación
      mediaRecorder.start(100); // Chunk cada 100ms

      // Reproducir y capturar frames de manera más estable
      video.currentTime = 0;
      await video.play();

      let frameCount = 0;
      const maxFrames = Math.ceil(duration * Math.min(config.fps, 30));

      const captureFrame = () => {
        if (video.ended || video.paused || frameCount >= maxFrames) {
          console.log(`🎬 Captura completada: ${frameCount} frames`);
          mediaRecorder.stop();
          return;
        }

        try {
          // Dibujar frame actual en canvas comprimido
          ctx.drawImage(video, 0, 0, width, height);
          frameCount++;
          
          // Continuar captura con throttling
          setTimeout(() => requestAnimationFrame(captureFrame), 1000 / Math.min(config.fps, 30));
        } catch (error) {
          console.warn('⚠️ Error capturando frame:', error);
          mediaRecorder.stop();
        }
      };

      // Esperar un poco antes de empezar la captura
      setTimeout(captureFrame, 100);

      // Esperar a que termine la grabación
      const compressedBlob = await new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };
      });

      // Limpiar recursos
      URL.revokeObjectURL(video.src);
      video.remove();
      canvas.remove();

      // Crear archivo comprimido como WebM (más compatible)
      const fileExtension = '.webm';
      const fileType = 'video/webm';
      
      const compressedFile = new File(
        [compressedBlob], 
        videoFile.name.replace(/\.[^/.]+$/, `_compressed${fileExtension}`),
        { type: fileType }
      );

      const compressionRatio = ((videoFile.size - compressedFile.size) / videoFile.size * 100).toFixed(1);

      console.log('✅ Compresión completada:', {
        originalSize: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
        compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        compressionRatio: compressionRatio + '%',
        finalSize: compressedFile.size < this.maxSizeBytes ? '✅ Dentro del límite' : '⚠️ Aún muy grande'
      });

      return compressedFile;

    } catch (error) {
      console.error('❌ Error en compresión de video:', error);
      throw error;
    }
  }

  /**
   * Obtener duración del video
   * @param {File} videoFile - Archivo de video
   * @returns {Promise<number>} Duración en segundos
   */
  async getVideoDuration(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = reject;
    });
  }

  /**
   * Calcular dimensiones comprimidas manteniendo aspect ratio
   * @param {number} originalWidth - Ancho original
   * @param {number} originalHeight - Alto original
   * @param {number} maxWidth - Ancho máximo
   * @returns {Object} Nuevas dimensiones
   */
  calculateCompressedDimensions(originalWidth, originalHeight, maxWidth = 480) {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = Math.min(originalWidth, maxWidth);
    let height = Math.round(width / aspectRatio);
    
    // Asegurar que las dimensiones sean pares (requerido por algunos codecs)
    width = width % 2 === 0 ? width : width - 1;
    height = height % 2 === 0 ? height : height - 1;
    
    return { width, height };
  }

  /**
   * Verificar si el video necesita compresión
   * @param {File} videoFile - Archivo de video
   * @returns {boolean} True si necesita compresión
   */
  needsCompression(videoFile) {
    return videoFile.size > this.maxSizeBytes;
  }
}

export default new VideoCompressor();