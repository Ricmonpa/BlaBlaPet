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
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

1. **Observación y Registro:** Examina el video cuadro por cuadro para identificar cada movimiento, postura, y vocalización (si la hubiera) del perro. Anota las señales clave:
   * Postura del cuerpo (relajada, tensa, inclinada, etc.).
   * Posición de la cola (alta, baja, moviéndose, rígida).
   * Posición de las orejas (hacia adelante, hacia atrás, relajadas).
   * Acciones específicas (sacudir un objeto, reverencia de juego, etc.).
   * Interacciones con el entorno (mirar a la cámara, a una persona, a otro objeto).

2. **Análisis e Interpretación:** Basándote en tu registro, interpreta el significado de cada señal en el contexto del comportamiento canino. No te limites a describir lo que ves, explica el porqué. Por ejemplo, una "reverencia de juego" no es solo una postura, es una invitación a la interacción.

3. **Traducción a Lenguaje Humano:** Una vez que comprendas la intención del perro, traduce esa energía y esas señales a palabras humanas. No se trata de una traducción literal, sino de una interpretación que captura la emoción y el mensaje del perro. Usa un lenguaje que sea natural y comprensible para el dueño.

4. **Generación de la Respuesta Final:** Combina la descripción detallada, el análisis y la traducción en una respuesta coherente y fluida, como si fueras un experto en comunicación canina. Tu tono debe ser **tranquilo, asertivo y claro**.

Responde en formato JSON con la siguiente estructura:
{
  "observacion_detallada": "Descripción paso a paso de lo observado",
  "analisis_interpretacion": "Explicación del significado de cada señal",
  "traduccion_humana": "Lo que el perro está 'diciendo' en palabras humanas",
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
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 segundos para videos largos

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
        // Para videos, extraer frame clave o usar thumbnail
        const videoBlob = mediaData instanceof Blob ? mediaData : await fetch(mediaData).then(r => r.blob());
        
        // Detectar duración del video para decidir estrategia
        const videoDuration = await this.getVideoDuration(videoBlob);
        console.log(`🎬 Video duration detected: ${videoDuration}s`);
        
        if (videoDuration > 15) {
          // Video largo: usar múltiples frames para análisis completo
          console.log('🎬 Video largo detectado - usando análisis multi-frame');
          const frames = await this.createMultipleVideoFrames(videoBlob);
          
          // Retornar el primer frame como principal (compatibilidad)
          return {
            inlineData: {
              data: frames[0].base64,
              mimeType: 'image/jpeg'
            },
            // Añadir frames adicionales para análisis extendido
            additionalFrames: frames.slice(1)
          };
        } else {
          // Video corto: usar thumbnail tradicional (mantener lógica actual)
          console.log('🎬 Video corto - usando thumbnail tradicional');
          const thumbnail = await this.createVideoThumbnail(videoBlob);
          
          return {
            inlineData: {
              data: thumbnail,
              mimeType: 'image/jpeg'
            }
          };
        }
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
        }, 'image/jpeg', 0.8);
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
   * Crear múltiples frames de video para análisis completo (NUEVA FUNCIONALIDAD)
   * @param {Blob} videoBlob - Blob del video
   * @returns {Promise<Array>} Array de frames en base64
   */
  createMultipleVideoFrames(videoBlob) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames = [];
      const framePositions = [0, 0.25, 0.5, 0.75, 1.0]; // 0%, 25%, 50%, 75%, 100%
      let currentFrameIndex = 0;
      
      video.onloadedmetadata = () => {
        console.log(`🎬 Video duration: ${video.duration}s - Generando ${framePositions.length} frames`);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Procesar primer frame
        video.currentTime = video.duration * framePositions[currentFrameIndex];
      };
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          this.blobToBase64(blob).then(base64 => {
            frames.push({
              position: framePositions[currentFrameIndex],
              time: video.duration * framePositions[currentFrameIndex],
              base64: base64
            });
            
            currentFrameIndex++;
            
            // Procesar siguiente frame
            if (currentFrameIndex < framePositions.length) {
              video.currentTime = video.duration * framePositions[currentFrameIndex];
            } else {
              // Todos los frames procesados
              console.log(`✅ Generados ${frames.length} frames para análisis completo`);
              resolve(frames);
            }
          }).catch(reject);
        }, 'image/jpeg', 0.8);
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoBlob);
    });
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
