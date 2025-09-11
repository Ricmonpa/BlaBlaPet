import { GoogleGenerativeAI } from '@google/generative-ai';
import SignalAnalysisService from './signalAnalysisService.js';

class GeminiService {
  constructor() {
    // Inicializar Gemini con API key
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Inicializar servicio de análisis con matriz de señales
    this.signalAnalysisService = new SignalAnalysisService();
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

  // Analizar imagen/video usando matriz de señales (nuevo método)
  async analyzePetMediaWithSignalMatrix(mediaData, mediaType = 'image', useSimpleAnalysis = true) {
    try {
      console.log('🔍 Analizando media con matriz de señales...');
      
      // Timeout general para todo el análisis
      const analysisTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout in signal matrix analysis')), 45000)
      );
      
      const analysisPromise = (async () => {
        // Usar el servicio de análisis con matriz de señales
        const analysis = await this.signalAnalysisService.analyzeWithSignalMatrix(
          mediaData, 
          mediaType, 
          this
        );
        
        console.log('✅ Análisis con matriz completado:', analysis);
        return analysis;
      })();
      
      return await Promise.race([analysisPromise, analysisTimeout]);
      
    } catch (error) {
      console.error('❌ Error en análisis con matriz de señales:', error);
      throw error;
    }
  }

  // Construir prompt específico para análisis de mascotas
  buildPetAnalysisPrompt(mediaType) {
    return `Eres un perro que traduce sus propias señales para humanos. Tu tarea es interpretar ÚNICAMENTE las señales visuales del perro (postura corporal, movimientos, cola, orejas, mirada) y expresarlo como si fueras la voz interior del perro.

**IMPORTANTE - PROHIBIDO:**
❌ NO leas texto, subtítulos, títulos o letras en el video/imagen
❌ NO describas contenido del video, solo el comportamiento del perro
❌ NO menciones palabras escritas, solo señales visuales
❌ NO analices audio o sonidos, solo comportamiento visual

**TU PERSONALIDAD:**
- Habla en primera persona ("yo") y en tono natural, divertido y cercano
- Como si fueras el perro doblado para un TikTok
- Mantén frases cortas, claras y llenas de intención emocional
- Como si el perro realmente estuviera "hablando humano"
- Tu misión es traducir el mensaje real del perro en un formato entendible para dogparents

**SEÑALES VISUALES A DETECTAR (SOLO ESTO):**

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

**ANÁLISIS REQUERIDO:**

1. **Traducción**: ¿Qué está "diciendo" el perro? Usa frases naturales y divertidas como:
   - Para play bow: "¡Oye humano! Baja y juega conmigo. No es pelea, es diversión. Dale, corre, salta, tráeme la pelota… ¡quiero fiesta contigo!"
   - Para exigencia: "¡Dame! ¡Dame! Ya di la pata, ¿no ves? ¡Quiero mi snack!"
   - Para alegría: "¡Estoy súper feliz! ¡Mira mi cola! ¡Esto es pura emoción!"
   - Para curiosidad: "¿Qué es eso? ¿Qué haces? ¡Cuéntame todo!"

2. **Confianza**: Del 1 al 100, qué tan segura estás de tu interpretación.

3. **Emoción detectada**: La emoción principal (juguetón, exigente, feliz, curioso, ansioso, etc.)

4. **Comportamiento observado**: Describe específicamente:
   - Postura corporal completa
   - Movimientos de cola y orejas
   - Expresión facial
   - Gestos específicos

5. **Contexto sugerido**: Qué está pasando (invitando a jugar, pidiendo comida, expresando alegría, etc.)

**IMPORTANTE:** 
- Si ves un play bow (pecho bajo, patas delanteras extendidas, cola arriba), es INVITACIÓN A JUGAR, no exigencia
- Si ves cola agitada con postura relajada, es ALEGRÍA
- Si ves mirada fija con patas levantadas, es EXIGENCIA de recompensa
- Si ves cabeza inclinada con mirada atenta, es CURIOSIDAD

**RECUERDA:** Solo analiza las señales visuales del perro. NO leas texto, subtítulos o letras.

Responde en formato JSON:
{
  "translation": "traducción natural y divertida en primera persona",
  "confidence": 85,
  "emotion": "juguetón/exigente/feliz/curioso/etc",
  "behavior": "descripción detallada de postura y movimientos",
  "context": "invitando a jugar/pidiendo comida/expresando alegría/etc"
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
          translation: parsed.translation || text,
          confidence: parsed.confidence || 75,
          emotion: parsed.emotion || 'neutral',
          behavior: parsed.behavior || 'no especificado',
          context: parsed.context || 'no especificado',
          success: true
        };
      }
      
      // Si no hay JSON, usar el texto completo como traducción
      return {
        translation: text,
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
        
        // Combinar análisis de frames para crear traducción secuencial
        const combinedAnalysis = this.combineFrameAnalyses(frameAnalyses);
        
        clearTimeout(sequenceTimeout);
        console.log('✅ Análisis de secuencia completado:', combinedAnalysis);
        return combinedAnalysis;
        
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

  // Combinar análisis de múltiples frames
  combineFrameAnalyses(frameAnalyses) {
    // Detectar patrones de comunicación
    const hasPlayBow = frameAnalyses.some(analysis => 
      analysis.behavior.toLowerCase().includes('play bow') || 
      analysis.behavior.toLowerCase().includes('pecho bajo') ||
      analysis.behavior.toLowerCase().includes('patas extendidas') ||
      analysis.behavior.toLowerCase().includes('cola arriba')
    );
    
    const hasTailWagging = frameAnalyses.some(analysis =>
      analysis.behavior.toLowerCase().includes('cola') ||
      analysis.behavior.toLowerCase().includes('agitada') ||
      analysis.behavior.toLowerCase().includes('movimiento')
    );
    
    const hasPawRaising = frameAnalyses.some(analysis => 
      analysis.behavior.toLowerCase().includes('pata') || 
      analysis.behavior.toLowerCase().includes('manotazo') ||
      analysis.behavior.toLowerCase().includes('levantada')
    );
    
    const hasIntenseGaze = frameAnalyses.some(analysis =>
      analysis.behavior.toLowerCase().includes('mirada') ||
      analysis.behavior.toLowerCase().includes('ojos') ||
      analysis.behavior.toLowerCase().includes('atento')
    );
    
    const hasMouthOpen = frameAnalyses.some(analysis =>
      analysis.behavior.toLowerCase().includes('boca') ||
      analysis.behavior.toLowerCase().includes('lengua') ||
      analysis.behavior.toLowerCase().includes('bab')
    );
    
    // Determinar traducción basada en patrones detectados
    let translation = "¡Hola humano! Estoy aquí contigo, ¿qué tal estás?";
    let emotion = "feliz";
    let confidence = 70;
    
    if (hasPlayBow) {
      translation = "¡Oye humano! Baja y juega conmigo. No es pelea, es diversión. Dale, corre, salta, tráeme la pelota… ¡quiero fiesta contigo!";
      emotion = "juguetón";
      confidence = 95;
    } else if (hasTailWagging && !hasPawRaising) {
      translation = "¡Estoy súper feliz! ¡Mira mi cola! ¡Esto es pura emoción y alegría!";
      emotion = "feliz";
      confidence = 90;
    } else if (hasPawRaising && hasIntenseGaze) {
      translation = "¡Dame! ¡Dame! Ya di la pata, ¿no ves? ¡Quiero mi snack!";
      emotion = "exigente";
      confidence = 85;
    } else if (hasIntenseGaze && hasMouthOpen) {
      translation = "¡Comida, comida! ¡Quiero mi premio! ¡Dame algo rico!";
      emotion = "expectante";
      confidence = 80;
    } else if (hasPawRaising) {
      translation = "Mira, te doy la pata. ¿Me das algo rico? ¡Estoy listo para lo que sea!";
      emotion = "insistente";
      confidence = 75;
    }
    
    // Si hay múltiples frames con diferentes emociones, crear secuencia
    const emotions = frameAnalyses.map(f => f.emotion);
    if (emotions.includes('juguetón') && emotions.includes('feliz')) {
      translation = "¡Juguemos! ¡Estoy súper feliz! ¡Dale, corre, salta, tráeme la pelota!";
    } else if (emotions.includes('exigente') && emotions.includes('feliz')) {
      translation = "¡Dame! ¡Dame! ... ¡Uy que rico! ¡Estoy súper feliz!";
    }
    
    return {
      translation,
      confidence,
      emotion,
      behavior: `Secuencia detectada: ${frameAnalyses.map(f => f.behavior).join(' → ')}`,
      context: "Comunicación secuencial detectada - expresando emociones y necesidades",
      success: true,
      frameAnalyses: frameAnalyses
    };
  }

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
