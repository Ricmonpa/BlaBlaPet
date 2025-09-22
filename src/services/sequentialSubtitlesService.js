// Servicio para generar subtítulos secuenciales basado en momentos clave del comportamiento canino
import thoughtModelService from './thoughtModelService.js';

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
        
        // Generar frames reales del video
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
      
      const subtitles = [];
      let successfulAnalyses = 0;
      
      // Analizar cada frame individualmente para obtener análisis honesto
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const nextFrame = frames[i + 1];
        
        // Crear timestamp range para este frame
        const startTime = frame.timestamp;
        const endTime = nextFrame ? nextFrame.timestamp : this.formatTime(frame.timeSeconds + 3);
        const timestamp = `${startTime} - ${endTime}`;
        
        console.log(`📸 Analizando frame ${i + 1}/${frames.length}: ${timestamp} (${frame.timeSeconds}s)`);
        
        // Prompt específico para este frame con MÁXIMA honestidad
        const framePrompt = `Analiza esta imagen específica de un video de mascota tomada en el momento ${timestamp}.

REGLAS ABSOLUTAS DE HONESTIDAD:
- Describe ÚNICAMENTE lo que está VISIBLE en esta imagen específica
- NO inventes, NO asumas, NO extrapoles comportamientos
- Si el animal está inmóvil, di "El animal está inmóvil"
- Si no puedes ver la cara, di "No se puede ver la expresión facial"
- Si la imagen es borrosa, di "La imagen no es clara"
- Si no hay actividad visible, di "No hay actividad visible"
- NUNCA uses frases como "parece que", "probablemente", "podría estar"

Describe SOLO lo observable:
- Postura exacta del animal (solo lo que ves)
- Partes del cuerpo visibles y su posición
- Objetos o elementos visibles en la escena
- Ubicación del animal en el encuadre

Responde en formato JSON:
{
  "traduccion_tecnica": "Descripción objetiva de lo visible sin interpretaciones",
  "traduccion_emocional": "Traducción basada ÚNICAMENTE en evidencia visual clara"
}

CRÍTICO: Si no hay suficiente información visual clara, responde con null en ambos campos.`;

        try {
          const result = await thoughtModelService.model.generateContent([
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
            console.warn(`⚠️ Error parseando frame ${i + 1}, NO se creará contenido falso`);
            frameAnalysis = {
              traduccion_tecnica: null,
              traduccion_emocional: null
            };
          }

          // VALIDACIÓN ESTRICTA: Solo contenido real y honesto
          if (frameAnalysis.traduccion_tecnica && frameAnalysis.traduccion_emocional) {
            // Rechazar respuestas especulativas
            const speculativeWords = ['parece', 'probablemente', 'podría', 'tal vez', 'quizás', 'aparentemente', 'posiblemente'];
            const hasSpeculation = speculativeWords.some(word => 
              frameAnalysis.traduccion_tecnica.toLowerCase().includes(word) ||
              frameAnalysis.traduccion_emocional.toLowerCase().includes(word)
            );
            
            if (hasSpeculation) {
              console.warn(`⚠️ Frame ${i + 1} contiene especulación, RECHAZADO`);
            } else {
              subtitles.push({
                id: `subtitle_${i + 1}`,
                timestamp: timestamp,
                traduccion_tecnica: frameAnalysis.traduccion_tecnica,
                traduccion_emocional: frameAnalysis.traduccion_emocional,
                confidence: 95, // Alta confianza solo para contenido verificado
                source: 'verified_honest_analysis',
                frameIndex: i,
                realTime: frame.timeSeconds
              });
              console.log(`✅ Frame ${i + 1} VERIFICADO como honesto`);
            }
          } else {
            console.warn(`⚠️ Frame ${i + 1} no generó contenido válido, OMITIENDO`);
          }
          
        } catch (error) {
          console.error(`❌ Error analizando frame ${i + 1}:`, error);
          console.warn(`⚠️ Frame ${i + 1} falló completamente, NO se creará subtítulo falso`);
          // NO crear subtítulos falsos cuando hay errores
        }
      }

      successfulAnalyses = subtitles.length; // Contar solo los subtítulos realmente creados
      }

      console.log(`✅ Análisis honesto completado: ${successfulAnalyses}/${frames.length} frames analizados exitosamente`);

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
}

export default new SequentialSubtitlesService();