import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Servicio de Análisis Dual para BlaBlaPet
 * Genera dos tipos de subtítulos: Traducción Técnica y Doblaje para Pet-Parents
 */
class DualAnalysisService {
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
   * Analiza media de mascota generando análisis técnico y emocional
   * @param {string|Blob} mediaData - Base64 o blob de la imagen/video
   * @param {string} mediaType - 'image' o 'video'
   * @returns {Object} Resultado con output_tecnico y output_emocional
   */
  async analyzePetMediaDual(mediaData, mediaType = 'image') {
    try {
      console.log('🎭 Iniciando análisis dual (técnico + emocional)...');
      
      if (!this.apiKey) {
        throw new Error('API Key de Gemini no configurada');
      }

      // Preparar el prompt exacto proporcionado por el usuario
      const prompt = `Eres un analista de lenguaje corporal canino de nivel experto. Tu tarea es analizar un video de un perro y generar dos tipos de descripciones en tiempo real:

1. **output_tecnico:** Una descripción objetiva y detallada del comportamiento canino. Tu análisis debe ser preciso y basado en la psicología animal. Debe incluir el nombre de los comportamientos (ej. "reverencia de juego"), el contexto y lo que significan.

2. **output_emocional:** Una traducción emocional y amigable del comportamiento, como si el perro estuviera hablando directamente al dueño. El tono debe ser entusiasta, cariñoso y juguetón, similar a un personaje de una película de animación. Usa un lenguaje simple y directo.

Para lograrlo, sigue este proceso:

a. **Observación y Registro:** Examina el video del perro e identifica todas las señales corporales, posturas, vocalizaciones y acciones.
b. **Análisis e Interpretación Técnica:** Interpreta cada señal y comportamiento. Asocia cada acción con su significado técnico en el lenguaje canino.
c. **Traducción Emocional:** Convierte esa interpretación técnica en una "voz" de perro. Piensa en lo que un perro alegre y juguetón diría a su dueño para expresar esas mismas emociones.
d. **Generación de la Respuesta Final:** Entrega las dos salidas de manera clara y separada.

Ejemplo de formato de salida:
output_tecnico: [Aquí va la descripción técnica]
output_emocional: [Aquí va la traducción amigable]

**IMPORTANTE - PROHIBIDO:**
❌ NO leas texto, subtítulos, títulos o letras en el video/imagen
❌ NO describas contenido del video, solo el comportamiento del perro
❌ NO menciones palabras escritas, solo señales visuales
❌ NO analices audio o sonidos, solo comportamiento visual

**SEÑALES VISUALES A DETECTAR:**

1. **Lenguaje Corporal Completo:**
   - Postura general (play bow, sentado, de pie, agachado)
   - Posición de las patas (extendidas, flexionadas, levantadas)
   - Movimiento de la cola (agitación, posición, velocidad)
   - Orejas (erguidas, relajadas, hacia atrás)
   - Mirada (directa, esquiva, intensa, suave)

2. **Expresiones Faciales:**
   - Ojos (abiertos, entrecerrados, brillantes, suaves)
   - Boca (abierta, cerrada, lengua visible, babeo)
   - Cejas y músculos faciales
   - Expresión general (alegre, concentrada, relajada, tensa)

3. **Movimientos y Gestos:**
   - Saltos, giros, carreras
   - Manotazos o patadas
   - Inclinación de cabeza
   - Movimientos repetitivos
   - Contacto físico

4. **Contexto Emocional:**
   - Invitación a jugar (play bow, cola agitada, mirada juguetona)
   - Exigencia de recompensa (mirada fija, patas levantadas, insistencia)
   - Alegría y felicidad (cola agitada, saltos, expresión relajada)
   - Ansiedad o estrés (cola baja, orejas hacia atrás, tensión)
   - Curiosidad (cabeza inclinada, mirada atenta)

**RECUERDA:** Solo analiza las señales visuales del perro. NO leas texto, subtítulos o letras.

Responde en formato JSON:
{
  "output_tecnico": "descripción técnica detallada del comportamiento",
  "output_emocional": "traducción emocional como si el perro hablara",
  "confianza": 85,
  "emocion_detectada": "estado emocional principal",
  "comportamiento_principal": "descripción del comportamiento clave",
  "contexto": "contexto de la situación"
}`;

      // Usar la misma lógica que funciona en geminiService
      const mediaPart = await this.prepareMediaForGemini(mediaData, mediaType);
      
      // Preparar el contenido multimedia
      const content = [
        { text: prompt },
        mediaPart
      ];

      console.log('📤 Enviando solicitud a Gemini para análisis dual...');
      
      // Configurar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 70000); // 70 segundos

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: content }],
        generationConfig: {
          temperature: 0.3,
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
          output_tecnico: "Análisis técnico no disponible",
          output_emocional: "Traducción emocional no disponible",
          confianza: 50,
          emocion_detectada: "indeterminada",
          comportamiento_principal: "análisis directo",
          contexto: "contexto no disponible"
        };
      }

      // Formatear resultado para compatibilidad con el sistema existente
      const formattedResult = {
        // Mantener compatibilidad con el sistema existente
        translation: parsedResult.output_emocional || "Traducción no disponible",
        confidence: parsedResult.confianza || 75,
        emotion: parsedResult.emocion_detectada || "neutral",
        behavior: parsedResult.comportamiento_principal || "comportamiento observado",
        context: parsedResult.contexto || "contexto no disponible",
        
        // Nuevos campos para el análisis dual
        output_tecnico: parsedResult.output_tecnico || "Análisis técnico no disponible",
        output_emocional: parsedResult.output_emocional || "Traducción emocional no disponible",
        
        // Metadatos
        source: 'dual_analysis',
        success: true,
        analysisType: 'dual'
      };

      console.log('✅ Análisis dual completado');
      console.log('🔬 Técnico:', formattedResult.output_tecnico);
      console.log('🎭 Emocional:', formattedResult.output_emocional);
      
      return formattedResult;

    } catch (error) {
      console.error('❌ Error en análisis dual:', error);
      
      // Fallback en caso de error
      return {
        translation: "No pude analizar el comportamiento del perro en este momento.",
        confidence: 0,
        emotion: "indeterminada",
        behavior: "análisis no disponible",
        context: "Error en el procesamiento",
        output_tecnico: "Análisis técnico no disponible debido a un error",
        output_emocional: "Traducción emocional no disponible debido a un error",
        source: 'dual_analysis_error',
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
        
        // Crear thumbnail del video
        const thumbnail = await this.createVideoThumbnail(videoBlob);
        
        return {
          inlineData: {
            data: thumbnail,
            mimeType: 'image/jpeg'
          }
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

export default new DualAnalysisService();
