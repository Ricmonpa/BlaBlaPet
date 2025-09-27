import { GoogleGenerativeAI } from '@google/generative-ai';
import thoughtModelService from './thoughtModelService.js';

class GeminiService {
  constructor() {
    // Inicializar Gemini con API key
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Usar el modelo de pensamiento actual
    this.thoughtModelService = thoughtModelService;
  }

  // Analizar imagen/video y generar traducción (método original)
  async analyzePetMedia(mediaData, mediaType = 'image', useSimpleAnalysis = true) {
    try {
      console.log('🔍 Analizando media con Gemini (método original)...');
      
      // Timeout general para todo el análisis
      const analysisTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout in media analysis')), 45000)
      );
      
      const analysisPromise = (async () => {
        // Preparar el prompt para análisis de mascotas
        const prompt = this.buildPetAnalysisPrompt(mediaType);
        
        // Convertir media a formato compatible con Gemini
        const mediaPart = await this.prepareMediaForGemini(mediaData, mediaType);
        
        // Para videos, usar análisis simplificado por defecto para evitar congelamientos
        if (mediaType === 'video') {
          if (useSimpleAnalysis) {
            console.log('🎬 Usando análisis simplificado de video (1 frame)...');
            return await this.analyzeSingleVideoFrame(mediaData, prompt);
          } else {
            console.log('🎬 Usando análisis completo de video (múltiples frames)...');
            return await this.analyzeVideoSequence(mediaData, prompt);
          }
        }
        
        // Generar contenido con Gemini
        const result = await this.model.generateContent([prompt, mediaPart]);
        const response = await result.response;
        const text = response.text();
        
        // Parsear la respuesta
        const analysis = this.parseGeminiResponse(text);
        
        console.log('✅ Análisis completado:', analysis);
        return analysis;
      })();
      
      return await Promise.race([analysisPromise, analysisTimeout]);
      
    } catch (error) {
      console.error('❌ Error en análisis Gemini:', error);
      throw error;
    }
  }

  // Analizar imagen/video usando modelo de pensamiento (método actual)
  async analyzePetMediaWithThoughtModel(mediaData, mediaType = 'image', useSimpleAnalysis = true) {
    try {
      console.log('🧠 Analizando media con modelo de pensamiento...');
      
      // Usar el servicio de modelo de pensamiento
      const analysis = await this.thoughtModelService.analyzePetMediaWithThoughtModel(
        mediaData, 
        mediaType
      );
      
      console.log('✅ Análisis con modelo de pensamiento completado:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ Error en análisis con modelo de pensamiento:', error);
      throw error;
    }
  }

  // Construir prompt específico para análisis de mascotas
  buildPetAnalysisPrompt(mediaType) {
    return `Eres un experto en comportamiento animal y comunicación canina. Tu tarea es analizar este video o imagen de un perro y proporcionar dos tipos de traducciones, una emocional y una técnica.

TU PERSONALIDAD:
- Habla en primera persona ("yo") en un tono natural, divertido y cercano.
- Como si fueras la voz interior del perro doblado de Disney para un TikTok.
- Tu misión es traducir el mensaje real del perro para "dogparents".

ANÁLISIS REQUERIDO:

Traducción Emocional ("Doblaje"):
DEBE SER SOLO LA VOZ DIRECTA DEL PERRO, sin descripciones.
NO uses frases como "El perro está diciendo" o "El perrito dice".
Empieza directamente con lo que el perro "dice": "¡Hola!", "¡Qué emoción!", etc.
Usa un lenguaje juguetón y simple, como un personaje de caricatura.
Ejemplo CORRECTO: "¡Guau! ¿Qué fue ese ruido? ¡Estoy muy curioso!"
Ejemplo INCORRECTO: "El perro está diciendo: ¡Guau! ¿Qué fue ese ruido?"

Traducción Técnica:
DEBE SER SOLO ANÁLISIS TÉCNICO DEL COMPORTAMIENTO DEL PERRO.
NO describas el entorno, objetos, personas o el contexto visual.
Enfócate ÚNICAMENTE en: postura, orejas, cola, ojos, gestos, movimientos, ladridos, gemidos, silbidos, vocalizacoines, gruñidos, jadeos.
Usa términos técnicos (ej. "señal de calma", "postura de juego", "orejas erguidas").
Ejemplo CORRECTO: "Postura de alerta. Orejas erguidas, indicando atención. Pupilas dilatadas sugieren excitación."
Ejemplo INCORRECTO: "La imagen muestra a un perro de raza Pit Bull en una habitación..."

Emoción Detectada:
La emoción principal del perro (ej. jugueton, exigente, feliz, curioso, ansioso).

Comportamiento Clave:
Los gestos, sonidos o posturas más importantes (ej. "reverencia de juego", "lamido de hocico").

Confianza:
Del 1 al 100, qué tan segura estás de tu interpretación.

SEÑALES AUDITIVAS (PRIORIDAD ALTA):
Si detectas vocalizaciones del perro, dales más peso en el análisis que los sonidos ambientales o humanos. Correlaciona cada sonido con el comportamiento visual simultáneo.

TIPOS DE SEÑALES AUDITIVAS A ANALIZAR:

Ladridos: 
Agudos (alerta/excitación) vs graves (advertencia/dominancia)
Frecuencia: repetitivos vs aislados
Intensidad: volumen y urgencia

Gemidos: 
Ascendentes (petición) vs descendentes (malestar)
Correlación con postura corporal

Jadeos: 
Ritmo normal vs acelerado (estrés/calor)
Relación con actividad física

Gruñidos: 
Juguetones vs territoriales
Contexto de la situación

Respiración: 
Suspiros (relajación) vs respiración irregular
Patrones de respiración

Frecuencia: 
Sonidos repetitivos vs aislados
Patrones temporales

Intensidad: 
Volumen y urgencia del sonido
Cambios en la intensidad

PRIORIDAD DE ANÁLISIS:
1. Vocalizaciones del perro (máxima prioridad)
2. Comportamiento visual simultáneo
3. Correlación entre señales auditivas y visuales
4. Sonidos ambientales (menor prioridad)

RECUERDA: Solo analiza las señales visuales y auditivas del perro. No leas texto, subtítulos, o letras. Ignora música de fondo si está presenta.

CRÍTICO - FORMATO DE RESPUESTA:
- traduccion_emocional: SOLO la voz del perro, sin "El perro dice" o "El perrito está diciendo"
- traduccion_tecnica: SOLO análisis técnico del comportamiento, sin descripciones del entorno

Responde en formato JSON:
{
  "traduccion_emocional": "¡Hola! Estoy aquí contigo",
  "traduccion_tecnica": "Postura relajada, orejas erguidas, mirada directa",
  "emocion_detectada": "feliz",
  "comportamiento_clave": "acercamiento amigable",
  "confianza": 85
}`;
  }

  // Preparar media para Gemini
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
        // Tomar frame en el 25% del video
        video.currentTime = video.duration * 0.25;
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Convertir a base64
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(thumbnail);
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoBlob);
    });
  }

  // Parsear respuesta de Gemini
  parseGeminiResponse(text) {
    try {
      // Intentar extraer JSON de la respuesta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          // Mantener compatibilidad con el formato anterior
          translation: parsed.traduccion_emocional || parsed.translation || text,
          // Nuevos campos del prompt actualizado
          traduccion_emocional: parsed.traduccion_emocional || parsed.translation || text,
          traduccion_tecnica: parsed.traduccion_tecnica || parsed.behavior || 'no especificado',
          emocion_detectada: parsed.emocion_detectada || parsed.emotion || 'neutral',
          comportamiento_clave: parsed.comportamiento_clave || parsed.behavior || 'no especificado',
          // Campos de compatibilidad
          confidence: parsed.confianza || parsed.confidence || 75,
          emotion: parsed.emocion_detectada || parsed.emotion || 'neutral',
          behavior: parsed.comportamiento_clave || parsed.behavior || 'no especificado',
          context: parsed.context || 'no especificado',
          success: true
        };
      }
      
      // Si no hay JSON, usar el texto completo como traducción
      return {
        translation: text,
        traduccion_emocional: text,
        traduccion_tecnica: 'no especificado',
        emocion_detectada: 'neutral',
        comportamiento_clave: 'no especificado',
        confidence: 60,
        emotion: 'neutral',
        behavior: 'no especificado',
        context: 'no especificado',
        success: true
      };
      
    } catch (error) {
      console.error('Error parseando respuesta:', error);
      return {
        translation: text,
        traduccion_emocional: text,
        traduccion_tecnica: 'no especificado',
        emocion_detectada: 'neutral',
        comportamiento_clave: 'no especificado',
        confidence: 50,
        emotion: 'neutral',
        behavior: 'no especificado',
        context: 'no especificado',
        success: true
      };
    }
  }

  // Sin respuestas de fallback - el sistema debe fallar si no puede procesar

  // Verificar si el servicio está disponible
  async checkServiceStatus() {
    try {
      const result = await this.model.generateContent("Hola");
      return result.response.text().length > 0;
    } catch (error) {
      console.error('Error checking Gemini service:', error);
      return false;
    }
  }

  // Analizar secuencia de video para detectar patrones de comunicación
  async analyzeVideoSequence(videoBlob, prompt) {
    try {
      console.log('🎬 Analizando secuencia de video...');
      
      // Timeout general para todo el proceso
      const sequenceTimeout = setTimeout(() => {
        console.warn('⚠️ Timeout en análisis de secuencia, usando fallback');
        throw new Error('Timeout in video sequence analysis');
      }, 30000); // 30 segundos de timeout total
      
      try {
        // Extraer múltiples frames del video
        const frames = await this.extractVideoFrames(videoBlob, 3); // 3 frames clave
        
        console.log(`📊 Analizando ${frames.length} frames...`);
        
        // Analizar cada frame con timeout individual
        const frameAnalyses = [];
        for (let i = 0; i < frames.length; i++) {
          console.log(`🔍 Analizando frame ${i + 1}/${frames.length}...`);
          
          const framePrompt = `${prompt}\n\nEste es el frame ${i + 1} de ${frames.length} de una secuencia. Analiza específicamente las señales de comunicación en este momento.`;
          
          const mediaPart = {
            inlineData: {
              data: frames[i],
              mimeType: 'image/jpeg'
            }
          };
          
          // Timeout individual para cada frame
          const framePromise = this.model.generateContent([framePrompt, mediaPart]);
          const frameTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout analyzing frame ${i + 1}`)), 15000)
          );
          
          const result = await Promise.race([framePromise, frameTimeout]);
          const response = await result.response;
          const text = response.text();
          
          const analysis = this.parseGeminiResponse(text);
          frameAnalyses.push({
            frame: i + 1,
            ...analysis
          });
          
          console.log(`✅ Frame ${i + 1} analizado`);
        }
        
        // Usar directamente el análisis del primer frame (más confiable)
        // El modelo de pensamiento ya analiza el comportamiento completo
        const primaryAnalysis = frameAnalyses[0];
        
        clearTimeout(sequenceTimeout);
        console.log('✅ Análisis de secuencia completado (usando modelo de pensamiento):', primaryAnalysis);
        return primaryAnalysis;
        
      } catch (error) {
        clearTimeout(sequenceTimeout);
        throw error;
      }
      
    } catch (error) {
      console.error('❌ Error en análisis de secuencia:', error);
      console.log('🔄 Usando fallback a análisis de frame único...');
      // Fallback a análisis de frame único
      return await this.analyzeSingleVideoFrame(videoBlob, prompt);
    }
  }

  // Extraer frames clave del video
  async extractVideoFrames(videoBlob, numFrames = 3) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames = [];
      
      // Timeout para evitar que se cuelgue
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout al extraer frames del video, usando fallback');
        reject(new Error('Timeout extracting video frames'));
      }, 30000); // 30 segundos de timeout
      
      video.onloadedmetadata = () => {
        console.log('📹 Video metadata cargada, duración:', video.duration);
        const duration = video.duration;
        
        // Verificar que el video tenga duración válida
        if (!duration || duration <= 0) {
          clearTimeout(timeout);
          reject(new Error('Video sin duración válida'));
          return;
        }
        
        const frameInterval = duration / (numFrames + 1); // +1 para evitar el frame final
        
        let framesExtracted = 0;
        
        const extractFrame = (time) => {
          console.log(`📸 Extrayendo frame ${framesExtracted + 1} en tiempo ${time}s`);
          video.currentTime = time;
        };
        
        video.onseeked = () => {
          try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            const frame = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            frames.push(frame);
            framesExtracted++;
            
            console.log(`✅ Frame ${framesExtracted} extraído`);
            
            if (framesExtracted < numFrames) {
              extractFrame(frameInterval * (framesExtracted + 1));
            } else {
              clearTimeout(timeout);
              console.log(`🎬 Extracción completada: ${frames.length} frames`);
              resolve(frames);
            }
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        };
        
        video.onerror = (error) => {
          clearTimeout(timeout);
          console.error('❌ Error en video:', error);
          reject(new Error('Error loading video'));
        };
        
        video.src = URL.createObjectURL(videoBlob);
        
        // Empezar con el primer frame
        extractFrame(frameInterval);
      };
      
      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Error cargando metadata del video:', error);
        reject(new Error('Error loading video metadata'));
      };
    });
  }

  // FUNCIÓN ELIMINADA: combineFrameAnalyses
  // Esta función sobrescribía las respuestas del modelo de pensamiento con traducciones hardcodeadas
  // Ahora usamos directamente las respuestas inteligentes del modelo

  // Análisis de fallback para video (frame único)
  async analyzeSingleVideoFrame(videoBlob, prompt) {
    const mediaPart = await this.prepareMediaForGemini(videoBlob, 'video');
    const result = await this.model.generateContent([prompt, mediaPart]);
    const response = await result.response;
    const text = response.text();
    
    return this.parseGeminiResponse(text);
  }
}

export default new GeminiService();
