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

  // Detectar patrones específicos de comunicación de recompensa
  detectRewardPattern(analysis) {
    const behavior = analysis.behavior?.toLowerCase() || '';
    const emotion = analysis.emotion?.toLowerCase() || '';
    const context = analysis.context?.toLowerCase() || '';
    
    // NO detectar patrones de recompensa si hay señales de agresión
    const aggressivePatterns = [
      'agresivo', 'agresión', 'defensa', 'amenaza', 'gruñido', 'dientes',
      'advertencia', 'dominancia', 'intimidación', 'miedo', 'tenso'
    ];
    
    const hasAggressiveSignals = aggressivePatterns.some(pattern => 
      behavior.includes(pattern) || emotion.includes(pattern) || context.includes(pattern)
    );
    
    // Si hay señales de agresión, NO detectar patrones de recompensa
    if (hasAggressiveSignals) {
      console.log('🚫 Señales de agresión detectadas, ignorando patrones de recompensa');
      return null;
    }
    
    // Patrones específicos de exigencia de recompensa
    const pawRaisingPatterns = [
      'pata levantada', 'manotazo', 'dar la pata', 'pata en el aire',
      'levantando pata', 'manotazos', 'patas levantadas'
    ];
    
    const intenseGazePatterns = [
      'mirada fija', 'ojos atentos', 'mirando intensamente', 'contacto visual',
      'mirada directa', 'ojos bien abiertos', 'mirando fijamente'
    ];
    
    const mouthOpenPatterns = [
      'boca abierta', 'lengua visible', 'baba', 'humedad', 'salivación',
      'hocico húmedo', 'boca ligeramente abierta'
    ];
    
    const rewardContextPatterns = [
      'esperando comida', 'esperando premio', 'esperando snack', 'recompensa',
      'comida', 'snack', 'premio', 'alimento'
    ];
    
    // Detectar patrones
    const hasPawRaising = pawRaisingPatterns.some(pattern => behavior.includes(pattern));
    const hasIntenseGaze = intenseGazePatterns.some(pattern => behavior.includes(pattern));
    const hasMouthOpen = mouthOpenPatterns.some(pattern => behavior.includes(pattern));
    const hasRewardContext = rewardContextPatterns.some(pattern => 
      behavior.includes(pattern) || context.includes(pattern)
    );
    
    // Determinar traducción específica
    if (hasPawRaising && hasIntenseGaze && hasMouthOpen) {
      return {
        translation: "¡Dame! ¡Dame! Ya di la pata, ¿dónde está mi snack?",
        confidence: 95,
        emotion: "exigente",
        pattern: "exigencia_completa"
      };
    } else if (hasPawRaising && hasIntenseGaze) {
      return {
        translation: "¡Comida, comida! ¡Mira cómo te doy la pata!",
        confidence: 90,
        emotion: "insistente",
        pattern: "insistencia_con_pata"
      };
    } else if (hasIntenseGaze && hasMouthOpen) {
      return {
        translation: "¡Quiero mi premio! ¡Dame! ¡Dame!",
        confidence: 85,
        emotion: "expectante",
        pattern: "expectativa_intensa"
      };
    } else if (hasPawRaising) {
      return {
        translation: "Mira, te doy la pata. ¿Me das algo rico?",
        confidence: 80,
        emotion: "solicitante",
        pattern: "solicitud_con_pata"
      };
    } else if (hasRewardContext) {
      return {
        translation: "¡Comida! ¡Comida! ¡Comida!",
        confidence: 75,
        emotion: "deseoso",
        pattern: "deseo_de_comida"
      };
    }
    
    return null; // No se detectó patrón específico
  }

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
        
        // Intentar detectar patrones específicos de recompensa
        const rewardPattern = this.detectRewardPattern(thoughtResult);
        
        if (rewardPattern) {
          console.log('🎯 Patrón de recompensa detectado:', rewardPattern.pattern);
          
          // Generar doblaje emocional
          const emotionalDubbing = emotionalDubbingService.generateEmotionalDubbing(
            rewardPattern.translation,
            rewardPattern.emotion,
            thoughtResult.context,
            thoughtResult.behavior
          );
          
          return {
            ...thoughtResult,
            translation: rewardPattern.translation,
            emotionalDubbing: emotionalDubbing.emotionalDubbing,
            emotionalTone: emotionalDubbing.tone,
            emotionalStyle: emotionalDubbing.style,
            confidence: rewardPattern.confidence,
            emotion: rewardPattern.emotion,
            pattern: rewardPattern.pattern,
            source: 'thought_model_with_pattern_detection',
            success: true
          };
        }
        
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
