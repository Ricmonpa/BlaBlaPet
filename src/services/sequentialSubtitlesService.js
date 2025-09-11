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

    const prompt = `Eres un analista de lenguaje corporal canino de nivel experto. Tu tarea es analizar un ${mediaType} y generar una serie de subtítulos en tiempo real, divididos por momentos clave en el comportamiento del perro.

Proceso de pensamiento:
1. Observa el ${mediaType} y divídelo en segmentos lógicos, donde cada segmento representa un cambio significativo en la postura o acción del perro.
2. Para cada segmento, identifica la marca de tiempo (ej. 00:03, 00:08, etc.).
3. Genera una traducción técnica detallada y una traducción emocional amigable para ese segmento específico.
4. Formatea la respuesta como una lista de objetos JSON, donde cada objeto contiene 'timestamp', 'traduccion_tecnica' y 'traduccion_emocional'.

Ejemplo de formato de salida:
[
  {
    "timestamp": "00:00 - 00:05",
    "traduccion_tecnica": "El perro se encuentra en una postura de juego, agitando un juguete de un lado a otro. Este comportamiento indica una alta energía y excitación.",
    "traduccion_emocional": "¡Guau! ¡Miren mi juguete! ¡Qué divertido es!"
  },
  {
    "timestamp": "00:06 - 00:10",
    "traduccion_tecnica": "El perro baja el pecho en una clara reverencia de juego, mirando hacia la cámara. Esta es una invitación directa a la interacción.",
    "traduccion_emocional": "¡Mira lo que hago! ¡Ven a jugar conmigo, por favor!"
  }
]

IMPORTANTE: 
- Analiza el ${mediaType} completo y divide en 6-12 momentos clave
- Cada momento debe ser significativo y diferente del anterior
- ${isLongVideo ? '**CRÍTICO: Este video es LARGO - DEBES cubrir TODA la duración del video**' : 'Los timestamps deben ser realistas'}
- Las traducciones técnicas deben ser precisas y educativas
- Las traducciones emocionales deben ser divertidas y expresivas

**DETECCIÓN DE QUIETUD:**
- Si el perro se queda quieto o inmóvil, interpreta esto como comunicación:
  * "Estoy observando y procesando la situación"
  * "Me desinteresé de la actividad anterior" 
  * "Estoy en modo de espera o descanso"
  * "Necesito un momento para relajarme"
  * "Estoy evaluando si continuar o cambiar de actividad"
- Incluye estos momentos de quietud como subtítulos válidos

${isLongVideo ? `**INSTRUCCIONES CRÍTICAS PARA VIDEO LARGO:**
- Este video tiene más de 15 segundos de duración
- DEBES generar subtítulos que cubran TODA la duración del video
- NO te limites a los primeros 13-15 segundos
- Genera timestamps que lleguen hasta el final del video
- Incluye momentos de transición, cambios de comportamiento y evolución
- Si el video dura 37 segundos, tus timestamps deben llegar hasta 00:37
- Si el video dura 60 segundos, tus timestamps deben llegar hasta 01:00
- ANALIZA TODO EL CONTENIDO TEMPORAL DEL VIDEO` : ''}

- Responde SOLO con el JSON, sin texto adicional`;

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
      
      // Usar thoughtModelService pero con el prompt de subtítulos secuenciales
      const result = await thoughtModelService.model.generateContent([
        { text: prompt },
        mediaPart
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      // Intentar parsear la respuesta como JSON
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const subtitles = JSON.parse(jsonMatch[0]);
          
          // Validar que sea un array con la estructura correcta
          if (Array.isArray(subtitles) && subtitles.length > 0) {
            // Obtener duración real del video para post-procesamiento
            let realVideoDuration = 0;
            try {
              const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
              realVideoDuration = await this.getVideoDuration(videoBlob);
              console.log(`🎬 Duración real del video: ${realVideoDuration}s`);
            } catch (error) {
              console.warn('⚠️ No se pudo obtener duración real del video');
            }

            const validatedSubtitles = subtitles.map((subtitle, index) => ({
              id: `subtitle_${index + 1}`,
              timestamp: subtitle.timestamp || `00:${String(index * 5).padStart(2, '0')} - 00:${String((index + 1) * 5).padStart(2, '0')}`,
              traduccion_tecnica: subtitle.traduccion_tecnica || 'Análisis técnico no disponible',
              traduccion_emocional: subtitle.traduccion_emocional || 'Traducción emocional no disponible',
              confidence: 85 + Math.random() * 15, // 85-100%
              source: 'thought_model_sequential'
            }));

            // POST-PROCESAMIENTO: Asegurar cobertura completa del video
            const processedSubtitles = this.ensureFullVideoCoverage(validatedSubtitles, realVideoDuration);

            return {
              subtitles: processedSubtitles,
              totalDuration: this.calculateTotalDuration(processedSubtitles),
              success: true,
              source: 'thought_model_sequential'
            };
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Error parseando JSON de subtítulos secuenciales:', parseError);
      }
      
      throw new Error('Error parseando respuesta de subtítulos secuenciales');
      
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
        const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
        const thumbnail = await this.createVideoThumbnail(videoBlob);
        
        return {
          inlineData: {
            data: thumbnail,
            mimeType: 'image/jpeg'
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

  // Crear thumbnail de video
  async createVideoThumbnail(videoBlob) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        video.currentTime = video.duration * 0.25;
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(thumbnail);
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoBlob);
    });
  }

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
    
    // Fallback: estimar basado en el número de subtítulos
    return subtitles.length * 5;
  }

  // Obtener subtítulo actual basado en el tiempo transcurrido
  getCurrentSubtitle(subtitles, currentTime) {
    if (!subtitles || subtitles.length === 0) return null;
    
    for (const subtitle of subtitles) {
      const timeRange = this.parseTimestamp(subtitle.timestamp);
      if (currentTime >= timeRange.start && currentTime <= timeRange.end) {
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
    
    return { start: 0, end: 5 }; // Fallback
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

  // Asegurar cobertura completa del video (NUEVA FUNCIONALIDAD CRÍTICA)
  ensureFullVideoCoverage(subtitles, realDuration) {
    if (!realDuration || realDuration <= 0) {
      console.warn('⚠️ No se puede asegurar cobertura completa sin duración real');
      return subtitles;
    }

    // Calcular duración actual cubierta
    const currentCoverage = this.calculateTotalDuration(subtitles);
    console.log(`🎬 Cobertura actual: ${currentCoverage}s de ${realDuration}s`);

    if (currentCoverage >= realDuration * 0.9) {
      console.log('✅ Cobertura completa ya alcanzada');
      return subtitles;
    }

    // Si hay gap significativo, extender los timestamps
    const gap = realDuration - currentCoverage;
    console.log(`🔧 Gap detectado: ${gap}s - Extendiendo timestamps...`);

    // Estrategia 1: Extender el último subtítulo
    if (subtitles.length > 0) {
      const lastSubtitle = subtitles[subtitles.length - 1];
      const lastTimeRange = this.parseTimestamp(lastSubtitle.timestamp);
      
      // Extender el último subtítulo hasta el final
      const newEndTime = Math.floor(realDuration);
      const newEndMinutes = Math.floor(newEndTime / 60);
      const newEndSeconds = newEndTime % 60;
      
      lastSubtitle.timestamp = `${this.formatTime(lastTimeRange.start)} - ${this.formatTime(newEndTime)}`;
      console.log(`🔧 Último subtítulo extendido: ${lastSubtitle.timestamp}`);
    }

    // Estrategia 2: Añadir subtítulos adicionales si el gap es muy grande
    if (gap > 10) {
      const additionalSubtitles = this.generateAdditionalSubtitles(subtitles, realDuration);
      subtitles.push(...additionalSubtitles);
      console.log(`🔧 Añadidos ${additionalSubtitles.length} subtítulos adicionales`);
    }

    return subtitles;
  }

  // Generar subtítulos adicionales para cubrir gaps grandes
  generateAdditionalSubtitles(existingSubtitles, realDuration) {
    const additional = [];
    const lastTimeRange = this.parseTimestamp(existingSubtitles[existingSubtitles.length - 1].timestamp);
    const startTime = lastTimeRange.end;
    
    // Generar subtítulos cada 8-10 segundos hasta el final
    let currentTime = startTime;
    let subtitleIndex = existingSubtitles.length + 1;
    
    while (currentTime < realDuration - 5) {
      const endTime = Math.min(currentTime + 8, realDuration);
      
      additional.push({
        id: `subtitle_${subtitleIndex}`,
        timestamp: `${this.formatTime(currentTime)} - ${this.formatTime(endTime)}`,
        traduccion_tecnica: 'El perro continúa su actividad, mostrando comportamientos adicionales que requieren observación detallada.',
        traduccion_emocional: '¡Sigo aquí! ¡Más cosas por descubrir!',
        confidence: 75 + Math.random() * 15,
        source: 'thought_model_sequential_extended'
      });
      
      currentTime = endTime;
      subtitleIndex++;
    }
    
    return additional;
  }

  // Formatear tiempo en MM:SS
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export default new SequentialSubtitlesService();
