/**
 * Compresor de video inteligente para uploads optimizados
 * Fase 1 + 2: Compresión automática por duración + Fallback progresivo
 * 
 * Objetivo: Videos de 5 min → 15-25MB → Upload en 2-4 min
 */

class SmartVideoCompressor {
  constructor() {
    // Configuraciones específicas por duración
    this.compressionProfiles = {
      // Videos cortos (< 30s) - compresión ligera
      short: {
        maxWidth: 720,
        maxHeight: 1280,
        targetBitrate: 800, // kbps
        audioBitrate: 128,  // kbps - AUDIO DE CALIDAD
        audioSampleRate: 44100,
        audioChannels: 2,   // ESTÉREO - Preserva audio original
        fps: 24,
        maxSizeMB: 10,
        description: 'Videos cortos - calidad alta'
      },
      
      // Videos medianos (30s - 2min) - compresión balanceada
      medium: {
        maxWidth: 720,
        maxHeight: 1280,
        targetBitrate: 600, // kbps
        audioBitrate: 128,  // kbps - AUDIO DE CALIDAD
        audioSampleRate: 44100, // 44.1kHz - Calidad completa
        audioChannels: 2,   // ESTÉREO - Preserva audio original
        fps: 24,
        maxSizeMB: 15,
        description: 'Videos medianos - balance calidad/tamaño'
      },
      
      // Videos largos (> 2min) - compresión agresiva OBLIGATORIA
      long: {
        maxWidth: 720,
        maxHeight: 1280,
        targetBitrate: 600, // kbps - tu configuración específica
        audioBitrate: 128,  // kbps - AUDIO DE CALIDAD
        audioSampleRate: 44100, // 44.1kHz - Calidad completa
        audioChannels: 2,   // ESTÉREO - Preserva audio original
        fps: 24,
        maxSizeMB: 25, // Target: 15-25MB para 5 min
        description: 'Videos largos - compresión obligatoria para 5 min'
      }
    };

    // Configuraciones de fallback progresivo
    this.fallbackProfiles = [
      {
        name: '720p_balanced',
        maxWidth: 720,
        maxHeight: 1280,
        targetBitrate: 600,
        audioBitrate: 128,  // AUDIO DE CALIDAD
        audioSampleRate: 44100,
        audioChannels: 2,   // ESTÉREO
        fps: 24,
        description: 'Primer intento - 720p balanceado'
      },
      {
        name: '480p_aggressive',
        maxWidth: 480,
        maxHeight: 854,
        targetBitrate: 400,
        audioBitrate: 128,  // AUDIO DE CALIDAD
        audioSampleRate: 44100,
        audioChannels: 2,   // ESTÉREO
        fps: 20,
        description: 'Segundo intento - 480p agresivo'
      },
      {
        name: '360p_extreme',
        maxWidth: 360,
        maxHeight: 640,
        targetBitrate: 200,
        audioBitrate: 96,   // AUDIO DE CALIDAD (mínimo aceptable)
        audioSampleRate: 44100,
        audioChannels: 2,   // ESTÉREO
        fps: 15,
        description: 'Último intento - 360p extremo'
      }
    ];
  }

  /**
   * Determinar perfil de compresión basado en duración
   * @param {number} duration - Duración en segundos
   * @returns {string} Nombre del perfil
   */
  getCompressionProfile(duration) {
    if (duration <= 30) return 'short';
    if (duration <= 120) return 'medium'; // 2 minutos
    return 'long'; // > 2 minutos - COMPRESIÓN OBLIGATORIA
  }

  /**
   * Verificar si el video necesita compresión obligatoria
   * @param {File} videoFile - Archivo de video
   * @returns {Promise<Object>} { needsCompression: boolean, profile: string, reason: string }
   */
  async analyzeVideo(videoFile) {
    try {
      const duration = await this.getVideoDuration(videoFile);
      const profile = this.getCompressionProfile(duration);
      const profileConfig = this.compressionProfiles[profile];
      
      const sizeMB = videoFile.size / (1024 * 1024);
      const needsCompression = duration > 120 || sizeMB > profileConfig.maxSizeMB;
      
      let reason = '';
      if (duration > 120) {
        reason = `Video de ${duration.toFixed(1)}s requiere compresión obligatoria (>2min)`;
      } else if (sizeMB > profileConfig.maxSizeMB) {
        reason = `Video de ${sizeMB.toFixed(1)}MB excede límite de ${profileConfig.maxSizeMB}MB`;
      }

      return {
        needsCompression,
        profile,
        duration,
        sizeMB,
        reason,
        targetSizeMB: profileConfig.maxSizeMB,
        config: profileConfig
      };
    } catch (error) {
      console.error('❌ Error analizando video:', error);
      // En caso de error, asumir que necesita compresión
      return {
        needsCompression: true,
        profile: 'long',
        duration: 0,
        sizeMB: 0,
        reason: 'Error analizando video - aplicar compresión por seguridad',
        targetSizeMB: 25,
        config: this.compressionProfiles.long
      };
    }
  }

  /**
   * Comprimir video con perfil específico
   * @param {File} videoFile - Archivo original
   * @param {Object} profile - Configuración de compresión
   * @returns {Promise<File>} Video comprimido
   */
  async compressWithProfile(videoFile, profile) {
    console.log(`🗜️ Comprimiendo con perfil: ${profile.name || 'custom'}`);
    console.log(`📐 Configuración: ${profile.maxWidth}x${profile.maxHeight}, ${profile.targetBitrate}kbps, ${profile.fps}fps`);
    
    try {
      const duration = await this.getVideoDuration(videoFile);
      
      // Crear elementos para procesamiento
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Configurar video - NO MUTED para capturar audio
      video.src = URL.createObjectURL(videoFile);
      video.muted = false; // ✅ NO silenciar para poder capturar audio
      video.playsInline = true;
      video.volume = 0.5; // ✅ Volumen reducido para evitar eco

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Calcular dimensiones comprimidas
      const { width, height } = this.calculateCompressedDimensions(
        video.videoWidth, 
        video.videoHeight,
        profile.maxWidth,
        profile.maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      console.log(`📐 Dimensiones: ${video.videoWidth}x${video.videoHeight} → ${width}x${height}`);

      // CAPTURAR AUDIO DEL VIDEO ORIGINAL
      let audioTrack = null;
      try {
        // Intentar capturar stream del video con audio
        const videoStream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
        const audioTracks = videoStream.getAudioTracks();
        
        if (audioTracks && audioTracks.length > 0) {
          audioTrack = audioTracks[0];
          console.log(`✅ Audio capturado del video original: ${audioTrack.label}`);
          
          // ✅ PREVENIR ECO: Configurar audio track para evitar duplicación
          if (audioTrack.getSettings) {
            const settings = audioTrack.getSettings();
            console.log('🎵 Configuración de audio original:', settings);
          }
        } else {
          console.warn('⚠️ Video sin pista de audio');
        }
      } catch (audioError) {
        console.warn('⚠️ No se pudo capturar audio del video:', audioError.message);
      }

      // Configurar stream de video comprimido desde canvas
      const canvasStream = canvas.captureStream(Math.min(profile.fps, 30));
      const videoTrack = canvasStream.getVideoTracks()[0];
      
      // COMBINAR video comprimido + audio original
      let stream;
      if (audioTrack) {
        stream = new MediaStream([videoTrack, audioTrack]);
        console.log('✅ Stream combinado: video comprimido + audio original');
      } else {
        stream = canvasStream;
        console.log('⚠️ Stream sin audio (video original no tenía audio)');
      }
      
      // Configurar MediaRecorder con el stream combinado
      let mimeType = 'video/webm';
      let recorderOptions = {};
      
      // Usar VP9 si está disponible para mejor compresión
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      }
      
      // Configurar bitrate seguro
      const safeBitrate = Math.max(profile.targetBitrate * 1000, 200000); // Mínimo 200kbps
      const audioBitrate = audioTrack ? profile.audioBitrate * 1000 : 0; // Solo si hay audio
      
      try {
        recorderOptions = {
          mimeType: mimeType,
          videoBitsPerSecond: safeBitrate
        };
        
        // Solo agregar audioBitsPerSecond si hay audio
        if (audioTrack) {
          recorderOptions.audioBitsPerSecond = audioBitrate;
        }
        
        // Probar configuración
        const testRecorder = new MediaRecorder(stream, recorderOptions);
        testRecorder.stop();
        
        if (audioTrack) {
          console.log(`🎵 Audio: ${profile.audioBitrate}kbps, ${profile.audioSampleRate || 44100}Hz, ${profile.audioChannels || 2} canal(es) - PRESERVADO`);
        } else {
          console.log('🎵 Audio: No disponible en video original');
        }
        
      } catch (error) {
        console.warn('⚠️ Configuración avanzada no soportada, usando básica');
        recorderOptions = { mimeType: 'video/webm' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      
      if (audioTrack) {
        console.log(`🎬 MediaRecorder configurado: ${recorderOptions.mimeType}, ${safeBitrate}bps video, ${audioBitrate}bps audio - CON AUDIO ORIGINAL`);
      } else {
        console.log(`🎬 MediaRecorder configurado: ${recorderOptions.mimeType}, ${safeBitrate}bps video - SIN AUDIO`);
      }

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Iniciar grabación
      mediaRecorder.start(100);

      // Procesar video frame por frame con timeout robusto
      video.currentTime = 0;
      await video.play();

      let frameCount = 0;
      const maxFrames = Math.ceil(duration * Math.min(profile.fps, 30));
      let lastProgressLog = 0;
      let processingTimeout = null;
      let isProcessing = true;

      // Timeout de seguridad: 3x la duración del video + 60s buffer
      const safeTimeout = Math.max((duration * 3 + 60) * 1000, 180000); // Mínimo 3 minutos
      console.log(`🎬 Procesando ${maxFrames} frames con timeout de ${(safeTimeout/1000).toFixed(0)}s`);

      const captureFrame = () => {
        if (!isProcessing) {
          console.log('🛑 Proceso cancelado');
          return;
        }

        if (video.ended || video.paused || frameCount >= maxFrames) {
          console.log(`🎬 Captura completada: ${frameCount} frames de ${maxFrames} esperados`);
          isProcessing = false;
          clearTimeout(processingTimeout);
          mediaRecorder.stop();
          return;
        }

        try {
          ctx.drawImage(video, 0, 0, width, height);
          frameCount++;
          
          // Log de progreso cada 10%
          const progress = Math.floor((frameCount / maxFrames) * 100);
          if (progress >= lastProgressLog + 10) {
            console.log(`🔄 Progreso compresión: ${progress}% (${frameCount}/${maxFrames} frames)`);
            lastProgressLog = progress;
          }
          
          // Control de framerate
          setTimeout(() => requestAnimationFrame(captureFrame), 1000 / Math.min(profile.fps, 30));
        } catch (error) {
          console.warn('⚠️ Error capturando frame:', error);
          isProcessing = false;
          clearTimeout(processingTimeout);
          mediaRecorder.stop();
        }
      };

      // Timeout de seguridad
      processingTimeout = setTimeout(() => {
        if (isProcessing) {
          console.warn(`⏱️ Timeout alcanzado después de ${(safeTimeout/1000).toFixed(0)}s - finalizando con ${frameCount} frames`);
          isProcessing = false;
          mediaRecorder.stop();
        }
      }, safeTimeout);

      setTimeout(captureFrame, 100);

      // Esperar finalización con timeout
      const compressedBlob = await new Promise((resolve, reject) => {
        const finalizationTimeout = setTimeout(() => {
          console.warn('⏱️ Timeout esperando finalización del MediaRecorder');
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob);
          } else {
            reject(new Error('No se generaron chunks de video'));
          }
        }, 30000); // 30s para finalizar

        mediaRecorder.onstop = () => {
          clearTimeout(finalizationTimeout);
          const blob = new Blob(chunks, { type: 'video/webm' });
          console.log(`✅ MediaRecorder finalizado: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(blob);
        };
      });

      // Limpiar recursos agresivamente
      console.log('🧹 Limpiando recursos de compresión...');
      
      // Detener todos los tracks
      if (audioTrack) {
        audioTrack.stop();
        console.log('🧹 Audio track detenido');
      }
      if (videoTrack) {
        videoTrack.stop();
        console.log('🧹 Video track detenido');
      }
      
      // Limpiar streams
      stream.getTracks().forEach(track => track.stop());
      canvasStream.getTracks().forEach(track => track.stop());
      
      // Limpiar elementos DOM
      URL.revokeObjectURL(video.src);
      video.pause();
      video.src = '';
      video.load();
      video.remove();
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      canvas.remove();
      
      console.log('🧹 Recursos liberados');

      // Crear archivo comprimido
      const fileExtension = '.webm';
      const fileType = 'video/webm';
      
      const compressedFile = new File(
        [compressedBlob], 
        videoFile.name.replace(/\.[^/.]+$/, `_compressed_${profile.name || 'custom'}${fileExtension}`),
        { type: fileType }
      );

      const compressionRatio = ((videoFile.size - compressedFile.size) / videoFile.size * 100).toFixed(1);
      const finalSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);

      console.log('✅ Compresión completada:', {
        originalSize: (videoFile.size / 1024 / 1024).toFixed(2) + ' MB',
        compressedSize: finalSizeMB + ' MB',
        compressionRatio: compressionRatio + '%',
        targetAchieved: compressedFile.size <= (profile.targetSizeMB || 25) * 1024 * 1024 ? '✅' : '⚠️'
      });

      return compressedFile;

    } catch (error) {
      console.error('❌ Error en compresión con perfil:', error);
      throw error;
    }
  }

  /**
   * Compresión inteligente con fallback progresivo
   * @param {File} videoFile - Archivo original
   * @returns {Promise<Object>} { file: File, attempts: Array, finalProfile: string }
   */
  async compressWithFallback(videoFile) {
    const analysis = await this.analyzeVideo(videoFile);
    const attempts = [];
    
    console.log('🎯 Análisis del video:', analysis);

    // Si no necesita compresión, devolver original
    if (!analysis.needsCompression) {
      console.log('✅ Video no necesita compresión');
      return {
        file: videoFile,
        attempts: [{ profile: 'none', success: true, sizeMB: analysis.sizeMB }],
        finalProfile: 'none',
        analysis
      };
    }

    // Intentar compresión con fallback progresivo
    const profilesToTry = [
      { ...analysis.config, name: '720p_balanced', targetSizeMB: analysis.targetSizeMB },
      this.fallbackProfiles[1], // 480p_aggressive
      this.fallbackProfiles[2]  // 360p_extreme
    ];

    for (let i = 0; i < profilesToTry.length; i++) {
      const profile = profilesToTry[i];
      try {
        console.log(`🔄 Intento ${i + 1}/${profilesToTry.length}: ${profile.description}`);
        
        // Timeout por intento: 5 minutos
        const compressionPromise = this.compressWithProfile(videoFile, profile);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de compresión')), 300000)
        );
        
        const compressedFile = await Promise.race([compressionPromise, timeoutPromise]);
        const sizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
        
        attempts.push({
          profile: profile.name,
          success: true,
          sizeMB: parseFloat(sizeMB),
          targetSizeMB: profile.targetSizeMB || 25
        });

        // Si el tamaño es aceptable, usar este resultado
        if (compressedFile.size <= (profile.targetSizeMB || 25) * 1024 * 1024) {
          console.log(`✅ Éxito con perfil ${profile.name}: ${sizeMB}MB`);
          return {
            file: compressedFile,
            attempts,
            finalProfile: profile.name,
            analysis
          };
        } else {
          console.log(`⚠️ ${profile.name} resultó en ${sizeMB}MB (objetivo: ${profile.targetSizeMB || 25}MB), intentando siguiente...`);
        }

      } catch (error) {
        console.error(`❌ Error con perfil ${profile.name}:`, error.message);
        attempts.push({
          profile: profile.name,
          success: false,
          error: error.message,
          sizeMB: 0
        });
        
        // Si es timeout, intentar con perfil más agresivo
        if (error.message.includes('Timeout')) {
          console.log('⏱️ Timeout detectado, intentando perfil más agresivo...');
          continue;
        }
      }
    }

    // Si todos los intentos fallaron, lanzar error
    console.error('❌ Todos los intentos de compresión fallaron');
    throw new Error('No se pudo comprimir el video. Intenta con un video más corto o de menor calidad.');
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
   * @param {number} maxHeight - Alto máximo
   * @returns {Object} Nuevas dimensiones
   */
  calculateCompressedDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Reducir ancho si es necesario
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    // Reducir alto si es necesario
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    // Asegurar dimensiones pares
    width = width % 2 === 0 ? width : width - 1;
    height = height % 2 === 0 ? height : height - 1;
    
    return { width: Math.round(width), height: Math.round(height) };
  }
}

export default new SmartVideoCompressor();
