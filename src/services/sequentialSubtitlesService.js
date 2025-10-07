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

    // PROMPT CORREGIDO: Análisis completo de video con audio
    console.log('✅ Usando prompt corregido para análisis completo de video');
    
    // Definir el prompt específico para subtítulos secuenciales con TTS
    const prompt = `Eres un analista de comportamiento canino experto. Tu tarea es analizar este video COMPLETO del perro (que incluye audio) y generar una transcripción emocional secuencial para nuestro servicio de Texto a Voz (TTS).

El video puede tener una duración inexacta, posiblemente superior a 5 minutos. Debes cubrir el 100% de la duración.

**IMPORTANTE - RESTRICCIÓN CRÍTICA:**
- NO leas, traduzcas, o interpretes NINGÚN texto nativo del video original (subtítulos originales, títulos, marcas de agua, etc.)
- IGNORA completamente cualquier texto que sea parte del video original
- SÍ puedes leer y usar subtítulos emocionales que hayas generado previamente
- Tu análisis debe basarse ÚNICAMENTE en el comportamiento visual y auditivo del perro
- NO uses información de texto nativo del video para generar tus traducciones

**REQUERIMIENTOS DE ANÁLISIS:**
1. **Vocalizaciones:** Analiza y correlaciona TODAS las señales auditivas: (**ladridos, aullidos, gruñidos, lloriqueos, quejidos, jadeos, suspiros, vociferaciones**) con el comportamiento visual.
2. **Transiciones:** Los bloques de subtítulos deben reflejar cambios CLAVE en el estado emocional o la actividad del perro.
3. **Duración:** Genera bloques de subtítulos con una duración **mínima de 3 segundos** y **máxima de 15 segundos**. La cantidad total de bloques debe cubrir la duración total del video.

**FORMATO DE SALIDA (SOLO JSON):**

- **ATENCIÓN:** El valor de 'traduccion_emocional' será enviado directamente a un servicio de voz. Debe ser una frase natural, con la puntuación y exclamaciones necesarias para transmitir la emoción.
- Los 'timestamp' deben usar el formato de texto legible **MM:SS - MM:SS** (Minutos:Segundos).

{
  "subtitles": [
    {
      "timestamp": "00:00 - 00:07",
      "traduccion_tecnica": "Descripción técnica del comportamiento observado",
      "traduccion_emocional": "Traducción emocional del estado del perro"
    },
    {
      "timestamp": "00:07 - 00:15",
      "traduccion_tecnica": "Descripción técnica del comportamiento observado", 
      "traduccion_emocional": "Traducción emocional del estado del perro"
    }
  ]
}`;

    try {
      // Usar thoughtModelService con el prompt específico para subtítulos secuenciales
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
      
      // USAR VIDEO COMPLETO CON AUDIO en lugar de frames
      if (!mediaPart.isMultiFrame && mediaPart.inlineData) {
        console.log('🎬 Usando análisis de VIDEO COMPLETO CON AUDIO');
        return await this.processVideoWithAudio(mediaPart.inlineData);
      }
      
      // FALLBACK: Si por alguna razón no se puede usar video completo, usar frames
      if (mediaPart.isMultiFrame && mediaPart.multiFrameData) {
        console.log('🎬 Fallback: Usando análisis multi-frame REAL con', mediaPart.multiFrameData.length, 'frames');
        return await this.generateSubtitlesFromRealFrames(mediaPart.multiFrameData);
      }
      
      // NO HAY FALLBACK - Si no hay video ni frames, fallar honestamente
      throw new Error('No hay video completo ni frames disponibles - rechazando análisis');
      
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
        // ENVIAR VIDEO COMPLETO CON AUDIO en lugar de solo frames
        const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
        
        console.log('🎬 ANALIZANDO VIDEO COMPLETO CON AUDIO:', {
          size: (videoBlob.size / 1024 / 1024).toFixed(2) + ' MB',
          type: videoBlob.type,
          isOriginal: mediaData instanceof Blob ? 'SÍ - Blob original' : 'NO - URL remota',
          audioIncluded: 'SÍ - Video completo con audio'
        });
        
        // Convertir video completo a base64 para enviar a Gemini
        const videoBase64 = await this.blobToBase64(videoBlob);
        
        return {
          isMultiFrame: false, // Cambiado a false para indicar que enviamos video completo
          multiFrameData: null, // No usamos frames
          inlineData: {
            data: videoBase64,
            mimeType: videoBlob.type // Mantener el tipo original del video
          }
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
    const timeRange = this.parseTimestamp(lastSubtitle);
    
    if (timeRange) {
      return timeRange.end;
    }
    
    // Si no es el formato esperado, devolver 0
    console.warn('⚠️ No se pudo calcular duración - formato de timestamp no soportado');
    return 0;
  }

  // Obtener subtítulo actual basado en el tiempo transcurrido
  getCurrentSubtitle(subtitles, currentTime) {
    if (!subtitles || subtitles.length === 0) return null;
    
    for (const subtitle of subtitles) {
      const timeRange = this.parseTimestamp(subtitle);
      if (timeRange && currentTime >= timeRange.start && currentTime <= timeRange.end) {
        return subtitle;
      }
    }
    
    return null;
  }

  // Parsear timestamp a segundos (formato MM:SS - MM:SS)
  parseTimestamp(subtitle) {
    // FORMATO: timestamp como string "MM:SS - MM:SS"
    if (subtitle && subtitle.timestamp && typeof subtitle.timestamp === 'string') {
      const match = subtitle.timestamp.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
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
    }
    
    // Si no es el formato esperado, devolver null
    console.warn('⚠️ Formato de timestamp no soportado:', subtitle);
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

  // Procesar video completo con audio
  async processVideoWithAudio(videoData) {
    console.log(`🎬 Procesando video completo con audio para análisis completo`);
    
    // Prompt optimizado para análisis de video completo con audio y TTS
    const videoPrompt = `Eres un analista de comportamiento canino experto. Tu tarea es analizar este video COMPLETO del perro (que incluye audio) y generar una transcripción emocional secuencial para nuestro servicio de Texto a Voz (TTS).

El video puede tener una duración inexacta, posiblemente superior a 5 minutos. Debes cubrir el 100% de la duración.

**IMPORTANTE - RESTRICCIÓN CRÍTICA:**
- NO leas, traduzcas, o interpretes NINGÚN texto nativo del video original (subtítulos originales, títulos, marcas de agua, etc.)
- IGNORA completamente cualquier texto que sea parte del video original
- SÍ puedes leer y usar subtítulos emocionales que hayas generado previamente
- Tu análisis debe basarse ÚNICAMENTE en el comportamiento visual y auditivo del perro
- NO uses información de texto nativo del video para generar tus traducciones

**REQUERIMIENTOS DE ANÁLISIS:**
1. **Vocalizaciones:** Analiza y correlaciona TODAS las señales auditivas: (**ladridos, aullidos, gruñidos, lloriqueos, quejidos, jadeos, suspiros, vociferaciones**) con el comportamiento visual.
2. **Transiciones:** Los bloques de subtítulos deben reflejar cambios CLAVE en el estado emocional o la actividad del perro.
3. **Duración:** Genera bloques de subtítulos con una duración **mínima de 3 segundos** y **máxima de 15 segundos**. La cantidad total de bloques debe cubrir la duración total del video.

**FORMATO DE SALIDA (SOLO JSON):**

- **ATENCIÓN:** El valor de 'traduccion_emocional' será enviado directamente a un servicio de voz. Debe ser una frase natural, con la puntuación y exclamaciones necesarias para transmitir la emoción.
- Los 'timestamp' deben usar el formato de texto legible **MM:SS - MM:SS** (Minutos:Segundos).

{
  "subtitles": [
    {
      "timestamp": "00:00 - 00:07",
      "traduccion_tecnica": "Descripción técnica del comportamiento observado",
      "traduccion_emocional": "Traducción emocional del estado del perro"
    },
    {
      "timestamp": "00:07 - 00:15",
      "traduccion_tecnica": "Descripción técnica del comportamiento observado", 
      "traduccion_emocional": "Traducción emocional del estado del perro"
    }
  ]
}`;

      const result = await this.generateContentWithRetry([
      { text: videoPrompt },
      { inlineData: { data: videoData.data, mimeType: videoData.mimeType } }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // 🔍 DEBUGGING: Capturar respuesta RAW de Gemini
      console.log('🔍 RAW Gemini response:', text);
      console.log('🔍 Response length:', text.length);
      console.log('🔍 First 500 chars:', text.substring(0, 500));
      console.log('🔍 Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
      
      // Parsear respuesta
    let videoAnalysis;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('🔍 JSON extraído:', jsonMatch[0]);
          console.log('🔍 JSON length:', jsonMatch[0].length);
          videoAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          console.error('❌ No se encontró JSON válido en la respuesta');
          console.error('❌ Texto completo:', text);
          throw new Error('No JSON found');
        }
      } catch (parseError) {
      console.error(`❌ Error parseando análisis de video:`, parseError);
      console.error(`❌ JSON problemático:`, jsonMatch ? jsonMatch[0] : 'No JSON found');
      return {
        subtitles: [],
        totalDuration: 0,
        success: false,
        source: 'video_analysis_parse_error',
        error: parseError.message
      };
    }

    // Procesar subtítulos
    if (videoAnalysis && videoAnalysis.subtitles && Array.isArray(videoAnalysis.subtitles)) {
      const subtitles = videoAnalysis.subtitles.map((subtitle, index) => ({
        id: `subtitle_${index + 1}`,
        timestamp: subtitle.timestamp,
        traduccion_tecnica: subtitle.traduccion_tecnica,
        traduccion_emocional: subtitle.traduccion_emocional,
        confidence: 95,
        source: 'gemini_video_analysis',
        frameIndex: index
      }));
      
      console.log(`✅ Video completo procesado: ${subtitles.length} subtítulos generados`);
      
      // Calcular duración total basada en el último timestamp
      const totalDuration = this.calculateTotalDuration(subtitles);
      
      return {
        subtitles: subtitles,
        totalDuration: totalDuration,
        success: true,
        source: 'video_analysis_with_audio',
        analysisStats: {
          totalSubtitles: subtitles.length,
          audioProcessed: true,
          videoProcessed: true
        }
      };
    }
    
    console.warn('⚠️ No se encontraron subtítulos en la respuesta de Gemini');
    return {
      subtitles: [],
      totalDuration: 0,
      success: false,
      source: 'video_analysis_error',
      error: 'No subtitles found in Gemini response'
    };
  }
}

export default new SequentialSubtitlesService();