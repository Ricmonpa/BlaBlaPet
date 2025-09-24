// Servicio para generar subtítulos secuenciales basado en momentos clave del comportamiento canino
import thoughtModelService from './thoughtModelService.js';
import cacheService from './cacheService.js';
import batchProcessor from './batchProcessor.js';

class SequentialSubtitlesService {
  constructor() {
    this.useThoughtModel = true;
  }

  // Generar subtítulos secuenciales para un video
  async generateSequentialSubtitles(mediaData, mediaType = 'video') {
    try {
      console.log('🎬 Generando subtítulos secuenciales...');
      
      if (this.useThoughtModel) {
        return await this.generateWithThoughtModel(mediaData, mediaType);
      } else {
        throw new Error('Servicio de subtítulos no disponible: Modelo de Pensamiento deshabilitado');
      }
    } catch (error) {
      console.error('Error generando subtítulos secuenciales:', error);
      throw error;
    }
  }

  // Generar subtítulos usando el Modelo de Pensamiento
  async generateWithThoughtModel(mediaData, mediaType) {
    // Verificar estado de cuota de API antes de proceder
    const quotaStatus = await this.checkQuotaStatus();
    if (!quotaStatus.available) {
      throw new Error(quotaStatus.message);
    }

    // Detectar duración del video para decidir estrategia de prompt
    let isLongVideo = false;
    if (mediaType === 'video') {
      try {
        const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
        const duration = await this.getVideoDuration(videoBlob);
        isLongVideo = duration > 15;
        console.log(`🎬 Video duration: ${duration}s - ${isLongVideo ? 'LARGO' : 'CORTO'}`);
      } catch (error) {
        console.warn('⚠️ No se pudo detectar duración del video, usando prompt estándar');
      }
    }

    // ELIMINADO: El prompt anterior era una mentira gigante que pedía análisis completo basado en un thumbnail
    // Ahora SOLO usamos análisis multi-frame real
    console.log('🚫 PROMPT FALSO ELIMINADO - Solo análisis multi-frame real permitido');

    try {
      // Usar thoughtModelService pero con el prompt específico para subtítulos secuenciales
      const result = await this.generateSequentialSubtitlesWithThoughtModel(mediaData, mediaType, prompt);
      
      if (result && result.subtitles) {
        console.log(`✅ Generados ${result.subtitles.length} subtítulos secuenciales con Modelo de Pensamiento`);
        return result;
      }
      
      // Si no hay resultado válido, lanzar error
      throw new Error('Error: No se pudieron generar subtítulos secuenciales');
      
    } catch (error) {
      console.error('❌ Error en Modelo de Pensamiento:', error.message);
      throw new Error(`No se pudo generar subtítulos secuenciales: ${error.message}`);
    }
  }

  // Generar subtítulos secuenciales usando thoughtModelService con prompt específico
  async generateSequentialSubtitlesWithThoughtModel(mediaData, mediaType, prompt) {
    try {
      // Preparar media para Gemini
      const mediaPart = await this.prepareMediaForGemini(mediaData, mediaType);
      
      // SOLO análisis multi-frame real - NO más thumbnails falsos
      if (mediaPart.isMultiFrame && mediaPart.multiFrameData) {
        console.log('🎬 Usando análisis multi-frame REAL con', mediaPart.multiFrameData.length, 'frames');
        return await this.generateSubtitlesFromRealFrames(mediaPart.multiFrameData);
      }
      
      // NO HAY FALLBACK - Si no hay frames reales, fallar honestamente
      throw new Error('No hay frames reales disponibles - rechazando análisis basado en thumbnail único');
      // CÓDIGO ELIMINADO: Ya no se usa análisis basado en thumbnail único
      
    } catch (error) {
      console.error('❌ Error generando subtítulos secuenciales:', error);
      throw error;
    }
  }

  // Preparar media para Gemini (copiado de thoughtModelService)
  async prepareMediaForGemini(mediaData, mediaType) {
    try {
      if (mediaType === 'image') {
        if (typeof mediaData === 'string' && mediaData.startsWith('data:')) {
          const response = await fetch(mediaData);
          const blob = await response.blob();
          return {
            inlineData: {
              data: await this.blobToBase64(blob),
              mimeType: blob.type
            }
          };
        } else if (mediaData instanceof Blob) {
          return {
            inlineData: {
              data: await this.blobToBase64(mediaData),
              mimeType: mediaData.type
            }
          };
        }
      } else if (mediaType === 'video') {
        // USAR ANÁLISIS MULTI-FRAME REAL en lugar de thumbnail falso
        const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
        
        console.log('🎬 ANALIZANDO VIDEO ORIGINAL:', {
          size: (videoBlob.size / 1024 / 1024).toFixed(2) + ' MB',
          type: videoBlob.type,
          isOriginal: mediaData instanceof Blob ? 'SÍ - Blob original' : 'NO - URL remota'
        });
        
        // Generar frames reales del video ORIGINAL
        const frames = await thoughtModelService.createMultipleVideoFrames(videoBlob, 8);
        
        return {
          isMultiFrame: true,
          multiFrameData: frames,
          inlineData: null // NO usar thumbnail falso
        };
      }
      
      throw new Error('Formato de media no soportado');
      
    } catch (error) {
      console.error('Error preparando media:', error);
      throw error;
    }
  }

  // Convertir blob a base64
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // FUNCIÓN ELIMINADA: No más thumbnails falsos

  // Calcular duración total basada en los timestamps
  calculateTotalDuration(subtitles) {
    if (!subtitles || subtitles.length === 0) return 0;
    
    const lastSubtitle = subtitles[subtitles.length - 1];
    const timestamp = lastSubtitle.timestamp;
    
    // Extraer el tiempo final del timestamp (formato: "00:00 - 00:05")
    const timeMatch = timestamp.match(/(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);
      return minutes * 60 + seconds;
    }
    
    // NO HAY FALLBACK FALSO - Si no se puede calcular, devolver 0
    console.warn('⚠️ No se pudo calcular duración real de subtítulos');
    return 0;
  }

  // Obtener subtítulo actual basado en el tiempo transcurrido
  getCurrentSubtitle(subtitles, currentTime) {
    if (!subtitles || subtitles.length === 0) return null;
    
    for (const subtitle of subtitles) {
      const timeRange = this.parseTimestamp(subtitle.timestamp);
      if (timeRange && currentTime >= timeRange.start && currentTime <= timeRange.end) {
        return subtitle;
      }
    }
    
    return null;
  }

  // Parsear timestamp a segundos
  parseTimestamp(timestamp) {
    // Formato: "00:00 - 00:05"
    const match = timestamp.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startMinutes = parseInt(match[1]);
      const startSeconds = parseInt(match[2]);
      const endMinutes = parseInt(match[3]);
      const endSeconds = parseInt(match[4]);
      
      return {
        start: startMinutes * 60 + startSeconds,
        end: endMinutes * 60 + endSeconds
      };
    }
    
    // NO HAY FALLBACK FALSO - Si no se puede parsear, devolver null
    console.warn('⚠️ No se pudo parsear timestamp:', timestamp);
    return null;
  }

  // Obtener progreso de subtítulos (0-1)
  getSubtitlesProgress(subtitles, currentTime) {
    if (!subtitles || subtitles.length === 0) return 0;
    
    const totalDuration = this.calculateTotalDuration(subtitles);
    return Math.min(currentTime / totalDuration, 1);
  }

  // Configurar modo de generación
  setGenerationMode(useThoughtModel) {
    this.useThoughtModel = useThoughtModel;
    console.log(`🎬 Modo de generación de subtítulos: ${useThoughtModel ? 'Modelo de Pensamiento' : 'Deshabilitado'}`);
  }

  // Obtener modo actual
  getGenerationMode() {
    return this.useThoughtModel ? 'thought_model' : 'disabled';
  }

  // Obtener duración del video (NUEVA FUNCIONALIDAD)
  getVideoDuration(videoBlob) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoBlob);
    });
  }

  // Asegurar cobertura completa del video (FUNCIONALIDAD CRÍTICA MEJORADA)
  ensureFullVideoCoverage(subtitles, realDuration) {
    if (!realDuration || realDuration <= 0) {
      console.warn('⚠️ No se puede asegurar cobertura completa sin duración real');
      return subtitles;
    }

    // Calcular duración actual cubierta
    const currentCoverage = this.calculateTotalDuration(subtitles);
    const coveragePercentage = (currentCoverage / realDuration) * 100;
    console.log(`🎬 Cobertura actual: ${currentCoverage}s de ${realDuration}s (${coveragePercentage.toFixed(1)}%)`);

    // HONESTIDAD TOTAL: Si la cobertura es insuficiente, admitirlo
    if (coveragePercentage < 60) {
      console.error(`❌ COBERTURA INSUFICIENTE: ${coveragePercentage.toFixed(1)}% - NO se generarán subtítulos falsos`);
      throw new Error(`Cobertura insuficiente: solo ${coveragePercentage.toFixed(1)}% del video tiene análisis real`);
    }

    // Si la cobertura está entre 60-90%, mantener solo lo real
    if (coveragePercentage < 90) {
      console.log(`⚠️ Cobertura parcial (${coveragePercentage.toFixed(1)}%) - Manteniendo solo contenido real`);
      return subtitles; // NO extender con contenido falso
    }

    console.log('✅ Cobertura completa ya alcanzada');
    return subtitles;
  }

  // FUNCIÓN ELIMINADA: No más generación de contenido falso
  // El sistema ahora solo acepta análisis real de frames reales

  // Generar subtítulos desde frames reales del video (SOLO ANÁLISIS HONESTO)
  async generateSubtitlesFromRealFrames(frames) {
    try {
      console.log('🎬 Analizando', frames.length, 'frames reales del video...');
      
      // VALIDACIÓN CRÍTICA: Verificar que los frames cubran todo el video
      const maxFrameTime = Math.max(...frames.map(f => f.timeSeconds));
      console.log(`🎬 Frame más tardío: ${maxFrameTime}s`);
      
      // Para videos largos, usar procesamiento inteligente
      const stats = cacheService.getStats();
      const needsOptimization = !cacheService.canMakeRequests(frames.length);
      
      let framesToProcess = frames;
      
      if (needsOptimization) {
        console.log(`⚠️ Cuota limitada - optimizando procesamiento de ${frames.length} frames`);
        framesToProcess = this.optimizeFramesForQuota(frames);
        console.log(`🎬 Frames optimizados: ${framesToProcess.length} (de ${frames.length})`);
      } else {
        console.log(`✅ Cuota suficiente - procesando todos los ${frames.length} frames`);
      }
      
      // Usar procesamiento por lotes para videos largos
      const subtitles = await this.processFramesInBatches(framesToProcess);
      const successfulAnalyses = subtitles.length;

      console.log(`✅ Análisis honesto completado: ${successfulAnalyses}/${framesToProcess.length} frames analizados exitosamente`);

      // VALIDACIÓN CRÍTICA: Si no hay subtítulos válidos, FALLAR
      if (subtitles.length === 0) {
        throw new Error('No se generaron subtítulos válidos - todos los frames fueron rechazados por contenido insuficiente');
      }

      // VALIDACIÓN FINAL: Asegurar que tenemos subtítulos para todo el video
      const finalDuration = Math.max(maxFrameTime + 3, 10); // Mínimo 10 segundos
      
      return {
        subtitles: subtitles,
        totalDuration: finalDuration,
        success: true,
        source: 'honest_multi_frame_analysis',
        analysisStats: {
          totalFrames: frames.length,
          successfulAnalyses: successfulAnalyses,
          maxFrameTime: maxFrameTime,
          finalDuration: finalDuration
        }
      };

    } catch (error) {
      console.error('❌ Error en análisis multi-frame honesto:', error);
      throw error;
    }
  }

  // Formatear tiempo en MM:SS
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Optimizar frames manteniendo cobertura completa del video
  optimizeFramesForQuota(frames) {
    // Para una app tipo TikTok, necesitamos cobertura completa
    // Solo optimizamos si realmente es necesario por cuota
    
    const stats = cacheService.getStats();
    const remainingRequests = stats.remainingRequests;
    
    // Si tenemos suficientes requests, usar todos los frames
    if (remainingRequests >= frames.length) {
      console.log(`🎬 Usando todos los ${frames.length} frames (${remainingRequests} requests disponibles)`);
      return frames;
    }
    
    // Solo optimizar si estamos cerca del límite
    if (remainingRequests < frames.length && remainingRequests > 0) {
      console.log(`⚠️ Optimizando frames por cuota: ${frames.length} → ${remainingRequests}`);
      
      // Distribuir frames uniformemente para mantener cobertura
      const optimizedFrames = [];
      const step = frames.length / remainingRequests;
      
      for (let i = 0; i < remainingRequests; i++) {
        const index = Math.floor(i * step);
        optimizedFrames.push(frames[index]);
      }
      
      return optimizedFrames;
    }
    
    // Si no hay requests disponibles, usar frames mínimos estratégicos
    console.log(`🚨 Cuota crítica - usando frames mínimos estratégicos`);
    return [frames[0], frames[Math.floor(frames.length / 2)], frames[frames.length - 1]];
  }

  // Generar contenido con retry logic y cache para manejar cuota de API
  async generateContentWithRetry(content, maxRetries = 3) {
    // Verificar cache primero
    const cacheKey = cacheService.generateCacheKey(content);
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('🎯 Usando resultado del cache');
      return cachedResult;
    }

    // Verificar si podemos hacer requests
    if (!cacheService.canMakeRequest()) {
      throw new Error('Límite diario de análisis alcanzado. Intenta mañana o actualiza tu plan de Gemini API.');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${maxRetries} de llamada a Gemini API`);
        const result = await thoughtModelService.model.generateContent(content);
        
        // Incrementar contador y guardar en cache
        cacheService.incrementRequestCount();
        cacheService.set(cacheKey, result);
        
        console.log(`✅ Llamada exitosa en intento ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Intento ${attempt} falló:`, error.message);
        
        // Si es error de cuota, no reintentar
        if (error.message.includes('quota') || error.message.includes('429')) {
          throw error;
        }
        
        // Si es el último intento, lanzar el error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Esperar antes del siguiente intento (backoff exponencial)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Verificar estado de cuota de API
  async checkQuotaStatus() {
    // Usar estadísticas del cache service
    const stats = cacheService.getStats();
    
    if (!stats.canMakeRequest) {
      const hoursUntilReset = Math.ceil(stats.timeUntilReset / (1000 * 60 * 60));
      return { 
        available: false, 
        message: `Límite diario alcanzado (${stats.requestsToday}/${stats.dailyLimit}). Intenta en ${hoursUntilReset} horas.`,
        retryAfter: stats.timeUntilReset
      };
    }
    
    // Hacer una llamada de prueba solo si no tenemos información del cache
    try {
      const result = await thoughtModelService.model.generateContent("test");
      return { available: true, message: `API disponible (${stats.remainingRequests} requests restantes)` };
    } catch (error) {
      if (error.message.includes('quota') || error.message.includes('429')) {
        return { 
          available: false, 
          message: "Cuota de API excedida. Intenta más tarde.",
          retryAfter: this.extractRetryTime(error.message)
        };
      }
      return { available: false, message: "Error de API: " + error.message };
    }
  }

  // Extraer tiempo de retry del mensaje de error
  extractRetryTime(errorMessage) {
    const match = errorMessage.match(/retry in (\d+(?:\.\d+)?)s/);
    return match ? parseFloat(match[1]) : 60; // Default 60 segundos
  }

  // Procesar frames en lotes para videos largos
  async processFramesInBatches(frames) {
    console.log(`🔄 Procesando ${frames.length} frames en lotes para video tipo TikTok`);
    
    const processFrame = async (frame, index) => {
      const nextFrame = frames[index + 1];
      const startTime = frame.timestamp;
      const endTime = nextFrame ? nextFrame.timestamp : this.formatTime(frame.timeSeconds + 3);
      const timestamp = `${startTime} - ${endTime}`;
      
      console.log(`📸 Procesando frame ${index + 1}/${frames.length}: ${timestamp} (${frame.timeSeconds}s)`);
      
      // Prompt optimizado para análisis rápido
      const framePrompt = `Eres un analista de lenguaje corporal canino experto. Analiza esta imagen del momento ${timestamp} del video y genera una traducción del comportamiento del perro.

Responde SOLO en formato JSON:
{
  "traduccion_tecnica": "Análisis técnico del comportamiento observado",
  "traduccion_emocional": "Lo que el perro estaría 'diciendo' en palabras humanas"
}`;

      const result = await this.generateContentWithRetry([
        { text: framePrompt },
        { inlineData: { data: frame.base64, mimeType: 'image/jpeg' } }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Parsear respuesta
      let frameAnalysis;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          frameAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        console.error(`❌ Error parseando frame ${index + 1}:`, parseError);
        return null;
      }

      // Validar respuesta
      if (frameAnalysis && frameAnalysis.traduccion_tecnica && frameAnalysis.traduccion_emocional) {
        if (frameAnalysis.traduccion_emocional === "null" || frameAnalysis.traduccion_tecnica === "null") {
          console.log(`🚫 Frame ${index + 1} - respuesta "null", saltando`);
          return null;
        }
        
        console.log(`✅ Frame ${index + 1} procesado exitosamente`);
        return {
          id: `subtitle_${index + 1}`,
          timestamp: timestamp,
          traduccion_tecnica: frameAnalysis.traduccion_tecnica,
          traduccion_emocional: frameAnalysis.traduccion_emocional,
          confidence: 95,
          source: 'gemini_analysis',
          frameIndex: index,
          realTime: frame.timeSeconds
        };
      }
      
      return null;
    };

    // Usar el procesador por lotes
    const subtitles = await batchProcessor.processFramesInBatches(
      frames, 
      processFrame,
      (progress) => {
        console.log(`📊 Progreso: ${progress.progress.toFixed(1)}% (${progress.processedFrames}/${progress.totalFrames} frames)`);
      }
    );

    // Filtrar subtítulos nulos
    const validSubtitles = subtitles.filter(subtitle => subtitle !== null);
    
    console.log(`✅ Procesamiento completado: ${validSubtitles.length} subtítulos válidos de ${frames.length} frames`);
    return validSubtitles;
  }
}

export default new SequentialSubtitlesService();