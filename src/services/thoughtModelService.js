import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Servicio de Análisis con Modelo de Pensamiento
 * Implementa el prompt de análisis paso a paso para comportamiento canino
 */
class ThoughtModelService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY no encontrada');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Analiza media de mascota usando el modelo de pensamiento
   * @param {string} mediaData - Base64 o blob de la imagen/video
   * @param {string} mediaType - 'image' o 'video'
   * @returns {Object} Resultado del análisis
   */
  async analyzePetMediaWithThoughtModel(mediaData, mediaType = 'image') {
    try {
      console.log('🧠 Iniciando análisis con modelo de pensamiento...');
      
      if (!this.apiKey) {
        throw new Error('API Key de Gemini no configurada');
      }

      // Preparar el prompt exacto proporcionado
      const prompt = `Eres un analista de lenguaje corporal canino de nivel experto. Tu tarea es analizar un video de un perro y generar una descripción detallada de su comportamiento.

Para lograrlo, sigue este proceso de pensamiento:

1. **Observación y Registro:** Examina el video cuadro por cuadro para identificar cada movimiento, postura, y vocalización del perro. Anota las señales clave:
   * Postura del cuerpo (relajada, tensa, inclinada, etc.).
   * Posición de la cola (alta, baja, moviéndose, rígida).
   * Posición de las orejas (hacia adelante, hacia atrás, relajadas).
   * Acciones específicas (sacudir un objeto, reverencia de juego, etc.).
   * Interacciones con el entorno (mirar a la cámara, a una persona, a otro objeto).
   * **SEÑALES AUDITIVAS (PRIORIDAD ALTA):** Ladridos, gemidos, jadeos, gruñidos, respiración, vocalizaciones.

2. **Análisis e Interpretación:** Basándote en tu registro, interpreta el significado de cada señal en el contexto del comportamiento canino. No te limites a describir lo que ves, explica el porqué. Por ejemplo, una "reverencia de juego" no es solo una postura, es una invitación a la interacción. **Correlaciona las señales auditivas con el comportamiento visual simultáneo.**

3. **Traducción a Lenguaje Humano:** Una vez que comprendas la intención del perro, traduce esa energía y esas señales a palabras humanas en PRIMERA PERSONA, como si el perro estuviera hablando directamente. Usa un tono entusiasta e inocente, con exclamaciones naturales como '¡Hmm!', '¡Oh!', '¡Ajá!'. Si se dirige a una persona, usa 'humano', 'mi humano' o 'humano favorito'. NO uses narración externa como 'el perro dice' - solo la voz directa del perro.

4. **Generación de la Respuesta Final:** Combina la descripción detallada, el análisis y la traducción en una respuesta coherente y fluida, como si fueras un experto en comunicación canina. Tu tono debe ser **tranquilo, asertivo y claro**.

**TIPOS DE SEÑALES AUDITIVAS A ANALIZAR:**
- **Ladridos:** Agudos (alerta/excitación) vs graves (advertencia/dominancia)
- **Gemidos:** Ascendentes (petición) vs descendentes (malestar)
- **Jadeos:** Ritmo normal vs acelerado (estrés/calor)
- **Gruñidos:** Juguetones vs territoriales
- **Respiración:** Suspiros (relajación) vs respiración irregular
- **Frecuencia:** Sonidos repetitivos vs aislados
- **Intensidad:** Volumen y urgencia del sonido

**PRIORIDAD DE ANÁLISIS:**
1. Vocalizaciones del perro (máxima prioridad)
2. Comportamiento visual simultáneo
3. Correlación entre señales auditivas y visuales
4. Sonidos ambientales (menor prioridad)

**RECUERDA:** Solo analiza las señales visuales y auditivas del perro. NO leas texto, subtítulos o letras. Ignora música de fondo si está presente.

Responde en formato JSON con la siguiente estructura:
{
  "observacion_detallada": "Descripción paso a paso de lo observado",
  "analisis_interpretacion": "Explicación del significado de cada señal",
  "traduccion_humana": "Lo que el perro está 'diciendo' en primera persona, con tono entusiasta e inocente",
  "respuesta_final": "Síntesis completa del análisis",
  "confianza": 85,
  "emocion_detectada": "estado emocional principal",
  "comportamiento_principal": "descripción del comportamiento clave"
}`;

      // Usar la misma lógica que funciona en geminiService
      const mediaPart = await this.prepareMediaForGemini(mediaData, mediaType);
      
      // Preparar el contenido multimedia
      const content = [
        { text: prompt },
        mediaPart
      ];

      console.log('📤 Enviando solicitud a Gemini...');
      
    // Configurar timeout adaptativo para videos largos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 600 segundos (10 minutos) para videos largos

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: content }],
        generationConfig: {
          temperature: 0.2,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      });

      clearTimeout(timeoutId);

      const response = await result.response;
      const text = response.text();
      
      console.log('📥 Respuesta recibida de Gemini');
      console.log('📝 Respuesta completa:', text);

      // Intentar parsear como JSON
      let parsedResult;
      try {
        // Limpiar la respuesta para extraer solo el JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se encontró JSON válido en la respuesta');
        }
      } catch (parseError) {
        console.warn('⚠️ Error parseando JSON, usando respuesta como texto:', parseError);
        parsedResult = {
          observacion_detallada: text,
          analisis_interpretacion: "Análisis no estructurado",
          traduccion_humana: "Traducción no disponible",
          respuesta_final: text,
          confianza: 50,
          emocion_detectada: "indeterminada",
          comportamiento_principal: "análisis directo"
        };
      }

      // Formatear resultado para compatibilidad
      const formattedResult = {
        translation: parsedResult.traduccion_humana || parsedResult.respuesta_final,
        confidence: parsedResult.confianza || 75,
        emotion: parsedResult.emocion_detectada || "neutral",
        behavior: parsedResult.comportamiento_principal || "comportamiento observado",
        context: parsedResult.analisis_interpretacion || "contexto no disponible",
        thoughtProcess: {
          observacion: parsedResult.observacion_detallada,
          analisis: parsedResult.analisis_interpretacion,
          traduccion: parsedResult.traduccion_humana,
          respuestaFinal: parsedResult.respuesta_final
        },
        source: 'thought_model',
        success: true
      };

      console.log('✅ Análisis con modelo de pensamiento completado');
      return formattedResult;

    } catch (error) {
      console.error('❌ Error en análisis con modelo de pensamiento:', error);
      
      // Fallback en caso de error
      return {
        translation: "No pude analizar el comportamiento del perro en este momento.",
        confidence: 0,
        emotion: "indeterminada",
        behavior: "análisis no disponible",
        context: "Error en el procesamiento",
        thoughtProcess: {
          observacion: "Error en la observación",
          analisis: "Error en el análisis",
          traduccion: "Error en la traducción",
          respuestaFinal: "Error en la respuesta final"
        },
        source: 'thought_model_error',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Preparar media para Gemini (copiado del geminiService que funciona)
   * @param {string|Blob} mediaData - Datos de media
   * @param {string} mediaType - Tipo de media
   * @returns {Promise<Object>} Media part para Gemini
   */
  async prepareMediaForGemini(mediaData, mediaType) {
    try {
      if (mediaType === 'image') {
        // Para imágenes (base64 o blob)
        if (typeof mediaData === 'string' && mediaData.startsWith('data:')) {
          // Es base64, convertir a blob
          const response = await fetch(mediaData);
          const blob = await response.blob();
          return {
            inlineData: {
              data: await this.blobToBase64(blob),
              mimeType: blob.type
            }
          };
        } else if (mediaData instanceof Blob) {
          // Es blob, convertir a base64
          return {
            inlineData: {
              data: await this.blobToBase64(mediaData),
              mimeType: mediaData.type
            }
          };
        } else if (mediaData.startsWith('blob:')) {
          // Es blob URL, convertir a blob y luego a base64
          const response = await fetch(mediaData);
          const blob = await response.blob();
          return {
            inlineData: {
              data: await this.blobToBase64(blob),
              mimeType: blob.type
            }
          };
        }
      } else if (mediaType === 'video') {
        // ENVIAR VIDEO COMPLETO CON AUDIO en lugar de solo frames
        const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
        
        console.log('🎬 ENVIANDO VIDEO COMPLETO CON AUDIO para análisis completo:', {
          size: (videoBlob.size / 1024 / 1024).toFixed(2) + ' MB',
          type: videoBlob.type,
          audioIncluded: 'SÍ - Video completo con audio'
        });
        
        // Convertir video completo a base64 para enviar a Gemini
        const videoBase64 = await this.blobToBase64(videoBlob);
        
        return {
          inlineData: {
            data: videoBase64,
            mimeType: videoBlob.type // Mantener el tipo original del video
          },
          multiFrameData: null, // No usamos frames
          isMultiFrame: false // Indicar que enviamos video completo
        };
      }
      
      // Fallback
      throw new Error('Formato de media no soportado');
    } catch (error) {
      console.error('Error preparando media para Gemini:', error);
      throw error;
    }
  }

  /**
   * Convertir blob a Base64 (copiado del geminiService que funciona)
   * @param {Blob} blob - Blob a convertir
   * @returns {Promise<string>} Base64 string
   */
  blobToBase64(blob) {
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

  /**
   * Crear thumbnail de video (copiado del geminiService que funciona)
   * @param {Blob} videoBlob - Blob del video
   * @returns {Promise<string>} Base64 del thumbnail
   */
  createVideoThumbnail(videoBlob) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // Tomar frame en el 25% del video
        video.currentTime = video.duration * 0.25;
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          this.blobToBase64(blob).then(resolve).catch(reject);
        }, 'image/jpeg', 0.95); // MÁXIMA CALIDAD para análisis
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoBlob);
    });
  }

  /**
   * Obtener duración del video (NUEVA FUNCIONALIDAD)
   * @param {Blob} videoBlob - Blob del video
   * @returns {Promise<number>} Duración en segundos
   */
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

  /**
   * Crear múltiples frames de video para análisis completo (MEJORADO PARA COBERTURA TOTAL)
   * @param {Blob} videoBlob - Blob del video
   * @param {number} frameCount - Número de frames a extraer
   * @returns {Promise<Array>} Array de frames en base64 con timestamps
   */
  createMultipleVideoFrames(videoBlob, frameCount = 8) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames = [];
      
      let currentFrameIndex = 0;
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        console.log(`🎬 Video duration: ${duration}s - Extrayendo ${frameCount} frames para COBERTURA COMPLETA`);
        
        // Extraer frames para cobertura completa del video (app tipo TikTok)
        let adjustedFrameCount = frameCount;
        
        // Para videos largos, mantener cobertura completa
        if (duration > 30) {
          adjustedFrameCount = Math.min(12, Math.ceil(duration / 3)); // Un frame cada 3 segundos
        } else if (duration > 15) {
          adjustedFrameCount = Math.min(8, Math.ceil(duration / 2)); // Un frame cada 2 segundos
        } else if (duration > 10) {
          adjustedFrameCount = Math.min(6, Math.ceil(duration / 1.5)); // Un frame cada 1.5 segundos
        } else {
          adjustedFrameCount = Math.min(4, frameCount); // Para videos cortos, máximo 4 frames
        }
        
        console.log(`🎬 Frames ajustados: ${adjustedFrameCount} para video de ${duration}s`);
        
        // Generar posiciones de frames distribuidas uniformemente INCLUYENDO EL FINAL
        const framePositions = [];
        for (let i = 0; i < adjustedFrameCount; i++) {
          if (i === adjustedFrameCount - 1) {
            // Último frame: 95% del video para asegurar que no esté al final exacto
            framePositions.push(0.95);
          } else {
            framePositions.push(i / (adjustedFrameCount - 1));
          }
        }
        
        console.log(`🎬 Posiciones de frames: ${framePositions.map(p => (p * duration).toFixed(1) + 's').join(', ')}`);
        
        // MÁXIMA CALIDAD para análisis original
        canvas.width = Math.min(video.videoWidth, 1280); // Aumentado para mejor análisis
        canvas.height = Math.min(video.videoHeight, 1280);
        
        console.log('🎬 FRAMES EN ALTA CALIDAD:', {
          original: `${video.videoWidth}x${video.videoHeight}`,
          canvas: `${canvas.width}x${canvas.height}`,
          quality: 'MÁXIMA para análisis'
        });
        
        // Procesar primer frame
        video.currentTime = Math.max(0, video.duration * framePositions[currentFrameIndex]);
      };
      
      video.onseeked = () => {
        // Dibujar frame actual
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          this.blobToBase64(blob).then(base64 => {
            const framePositions = [];
            const duration = video.duration;
            const adjustedFrameCount = currentFrameIndex < 8 ? 8 : Math.min(12, Math.ceil(duration / 3));
            
            // Recalcular posiciones (necesario para mantener consistencia)
            for (let i = 0; i < adjustedFrameCount; i++) {
              if (i === adjustedFrameCount - 1) {
                framePositions.push(0.95);
              } else {
                framePositions.push(i / (adjustedFrameCount - 1));
              }
            }
            
            const timeInSeconds = video.duration * framePositions[currentFrameIndex];
            frames.push({
              position: framePositions[currentFrameIndex],
              timeSeconds: timeInSeconds,
              timestamp: this.formatTimeForSubtitle(timeInSeconds),
              base64: base64
            });
            
            console.log(`📸 Frame ${currentFrameIndex + 1}/${framePositions.length} extraído: ${frames[frames.length - 1].timestamp} (${timeInSeconds.toFixed(1)}s)`);
            
            currentFrameIndex++;
            
            // Procesar siguiente frame
            if (currentFrameIndex < framePositions.length) {
              video.currentTime = Math.max(0, video.duration * framePositions[currentFrameIndex]);
            } else {
              console.log(`✅ ${frames.length} frames extraídos del video real`);
              resolve(frames);
            }
          }).catch(reject);
        }, 'image/jpeg', 0.95); // MÁXIMA CALIDAD para análisis
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoBlob);
    });
  }

  /**
   * Formatear tiempo en segundos a formato MM:SS para subtítulos
   * @param {number} seconds - Tiempo en segundos
   * @returns {string} Tiempo formateado
   */
  formatTimeForSubtitle(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Verificar si el servicio está disponible
   * @returns {boolean}
   */
  isAvailable() {
    return !!this.apiKey && !!this.genAI;
  }
}

export default new ThoughtModelService();
