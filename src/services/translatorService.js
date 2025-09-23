// Servicio para comunicación con el traductor perro-humano
import thoughtModelService from './thoughtModelService.js';
import emotionalDubbingService from './emotionalDubbingService.js';
import sequentialSubtitlesService from './sequentialSubtitlesService.js';

class TranslatorService {
  constructor() {
    // URL base del API del traductor (ajustar según tu implementación)
    this.baseUrl = import.meta.env.VITE_TRANSLATOR_API_URL || 'http://localhost:3001/api';
    this.useThoughtModel = true; // Usar Modelo de Pensamiento exclusivamente
    this.useSequentialSubtitles = true; // Usar subtítulos secuenciales por defecto
  }

  // FUNCIÓN ELIMINADA: detectRewardPattern
  // Esta función sobrescribía las traducciones del modelo de pensamiento con patrones hardcodeados
  // Ahora confiamos en la inteligencia del modelo para detectar patrones complejos

  // Generar subtítulos secuenciales para video
  async generateSequentialSubtitles(mediaData, mediaType = 'video') {
    try {
      console.log('🎬 Generando subtítulos secuenciales...');
      
      if (this.useSequentialSubtitles) {
        const result = await sequentialSubtitlesService.generateSequentialSubtitles(mediaData, mediaType);
        
        if (result && result.success) {
          console.log(`✅ Subtítulos secuenciales generados: ${result.subtitles.length} momentos`);
          return {
            ...result,
            source: 'sequential_subtitles'
          };
        }
      }
      
      // Sin fallback - lanzar error
      throw new Error('Servicio de subtítulos no disponible');
      
    } catch (error) {
      console.error('Error generando subtítulos secuenciales:', error);
      throw new Error('No se pudo generar subtítulos: Servicio no disponible');
    }
  }

  // Enviar foto/video al traductor
  async translateMedia(mediaData, mediaType) {
    try {
      // Usar Modelo de Pensamiento exclusivamente
      if (this.useThoughtModel) {
        console.log('🧠 Usando Modelo de Pensamiento para traducción...');
        
        const thoughtResult = await thoughtModelService.analyzePetMediaWithThoughtModel(mediaData, mediaType);
        
        // Verificar que el resultado sea válido
        if (!thoughtResult || !thoughtResult.translation) {
          throw new Error('Modelo de Pensamiento no devolvió resultado válido');
        }
        
        // LIBERADO: Ya no sobrescribimos las respuestas del modelo de pensamiento
        // El modelo de pensamiento ya genera traducciones inteligentes y contextuales
        
        // Generar doblaje emocional para el resultado normal
        const emotionalDubbing = emotionalDubbingService.generateEmotionalDubbing(
          thoughtResult.translation,
          thoughtResult.emotion,
          thoughtResult.context,
          thoughtResult.behavior
        );
        
        return {
          translation: thoughtResult.translation,
          emotionalDubbing: emotionalDubbing.emotionalDubbing,
          emotionalTone: emotionalDubbing.tone,
          emotionalStyle: emotionalDubbing.style,
          confidence: thoughtResult.confidence,
          emotion: thoughtResult.emotion,
          behavior: thoughtResult.behavior,
          context: thoughtResult.context,
          success: true,
          source: 'thought_model'
        };
      }

      // Si no está habilitado el Modelo de Pensamiento, lanzar error
      throw new Error('Modelo de Pensamiento no está habilitado');
      
    } catch (error) {
      console.error('Error en traducción:', error);
      throw error; // No hay fallback, lanzar error directamente
    }
  }


  // Configurar modo de análisis
  setAnalysisMode(mode) {
    switch (mode) {
      case 'thought':
        this.useThoughtModel = true;
        this.useSequentialSubtitles = false;
        console.log('🧠 Modo de análisis: Modelo de Pensamiento');
        break;
      case 'sequential':
        this.useThoughtModel = true;
        this.useSequentialSubtitles = true;
        console.log('🎬 Modo de análisis: Subtítulos Secuenciales');
        break;
      default:
        console.warn('⚠️ Modo de análisis no reconocido:', mode);
        console.log('🧠 Usando Modelo de Pensamiento por defecto');
    }
  }

  // Obtener modo de análisis actual
  getAnalysisMode() {
    if (this.useSequentialSubtitles && this.useThoughtModel) {
      return 'sequential';
    } else if (this.useThoughtModel) {
      return 'thought';
    } else {
      return 'disabled';
    }
  }

  // Verificar estado del servicio
  async checkServiceStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Error checking service status:', error);
      return false;
    }
  }

  // Obtener historial de traducciones
  async getTranslationHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting translation history:', error);
      return [];
    }
  }
}

export default new TranslatorService();
