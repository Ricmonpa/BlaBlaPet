// Servicio para generar doblaje emocional de las traducciones técnicas
class EmotionalDubbingService {
  constructor() {
    // Mapeo de emociones técnicas a tonos emocionales
    this.emotionTones = {
      'feliz': {
        tone: 'alegre',
        style: 'entusiasta y cariñoso',
        examples: ['¡Qué alegría verte!', '¡Estoy súper feliz!', '¡Me encanta este momento!']
      },
      'ansioso': {
        tone: 'nervioso',
        style: 'inquieto y preocupado',
        examples: ['¡Ay, estoy un poco nervioso!', '¡Necesito que me tranquilices!', '¡Me siento inquieto!']
      },
      'exigente': {
        tone: 'insistente',
        style: 'determinado y persistente',
        examples: ['¡Vamos, ya es hora!', '¡No me hagas esperar más!', '¡Lo quiero ahora mismo!']
      },
      'insistente': {
        tone: 'persistente',
        style: 'tenaz y determinado',
        examples: ['¡Por favor, por favor!', '¡No me rindo fácilmente!', '¡Seguiré insistiendo!']
      },
      'expectante': {
        tone: 'esperanzado',
        style: 'optimista y emocionado',
        examples: ['¡Estoy tan emocionado!', '¡No puedo esperar más!', '¡Será increíble!']
      },
      'solicitante': {
        tone: 'amable',
        style: 'educado y respetuoso',
        examples: ['¿Podrías ayudarme?', '¡Serías tan amable!', '¡Te lo agradecería mucho!']
      },
      'deseoso': {
        tone: 'anhelante',
        style: 'deseoso y emocionado',
        examples: ['¡Lo deseo tanto!', '¡Sería un sueño hecho realidad!', '¡No puedo contener mi emoción!']
      },
      'defensivo': {
        tone: 'cauteloso',
        style: 'protector y alerta',
        examples: ['¡Cuidado, algo no está bien!', '¡Me siento amenazado!', '¡Necesito protegerte!']
      },
      'juguetón': {
        tone: 'divertido',
        style: 'alegre y travieso',
        examples: ['¡Vamos a jugar!', '¡Esto será súper divertido!', '¡No puedo contener mi energía!']
      },
      'cariñoso': {
        tone: 'tierno',
        style: 'amoroso y dulce',
        examples: ['¡Te quiero tanto!', '¡Eres lo mejor que me ha pasado!', '¡Me haces tan feliz!']
      },
      'cansado': {
        tone: 'agotado',
        style: 'fatigado y relajado',
        examples: ['¡Ay, estoy agotado!', '¡Necesito un descansito!', '¡Me siento muy cansado!']
      },
      'curioso': {
        tone: 'curioso',
        style: 'interesado y explorador',
        examples: ['¡Qué interesante!', '¡Quiero explorar esto!', '¡Me intriga mucho!']
      },
      'emocionado': {
        tone: 'emocionado',
        style: 'entusiasta y energético',
        examples: ['¡Estoy súper emocionado!', '¡No puedo contener mi emoción!', '¡Qué emoción!']
      }
    };

    // Mapeo de contextos a tonos narrativos
    this.contextTones = {
      'juego': {
        style: 'divertido y energético',
        prefix: '¡',
        suffix: '!'
      },
      'alerta_defensiva': {
        style: 'serio y protector',
        prefix: '¡',
        suffix: '!'
      },
      'exploración': {
        style: 'curioso y aventurero',
        prefix: '¡',
        suffix: '!'
      },
      'recompensa': {
        style: 'emocionado y expectante',
        prefix: '¡',
        suffix: '!'
      },
      'social': {
        style: 'amigable y sociable',
        prefix: '¡',
        suffix: '!'
      },
      'descanso': {
        style: 'tranquilo y relajado',
        prefix: '¡',
        suffix: '!'
      }
    };
  }

  // Generar doblaje emocional basado en la traducción técnica
  generateEmotionalDubbing(technicalTranslation, emotion, context, behavior) {
    try {
      // Obtener el tono emocional
      const emotionTone = this.emotionTones[emotion] || this.emotionTones['feliz'];
      const contextTone = this.contextTones[context] || this.contextTones['social'];

      // Generar doblaje emocional
      let emotionalDubbing = '';

      // Si es un patrón de recompensa específico, usar traducciones especiales
      if (this.isRewardPattern(technicalTranslation)) {
        emotionalDubbing = this.generateRewardDubbing(emotion, context);
      } else {
        // Generar doblaje basado en la emoción y contexto
        emotionalDubbing = this.generateContextualDubbing(technicalTranslation, emotionTone, contextTone);
      }

      // Aplicar estilo del contexto
      emotionalDubbing = this.applyContextStyle(emotionalDubbing, contextTone);

      return {
        emotionalDubbing,
        tone: emotionTone.tone,
        style: emotionTone.style,
        contextStyle: contextTone.style,
        confidence: this.calculateEmotionalConfidence(emotion, context),
        source: 'emotional_dubbing_service'
      };
    } catch (error) {
      console.error('Error generando doblaje emocional:', error);
      return {
        emotionalDubbing: technicalTranslation,
        tone: 'neutral',
        style: 'neutral',
        contextStyle: 'neutral',
        confidence: 70,
        source: 'emotional_dubbing_service_fallback'
      };
    }
  }

  // Detectar si es un patrón de recompensa
  isRewardPattern(translation) {
    const rewardKeywords = [
      'dame', 'comida', 'snack', 'premio', 'recompensa', 'pata', 'manotazo'
    ];
    return rewardKeywords.some(keyword => 
      translation.toLowerCase().includes(keyword)
    );
  }

  // Generar doblaje específico para recompensas
  generateRewardDubbing(emotion, context) {
    const rewardDubbings = {
      'exigente': '¡Vamos, ya es hora de mi premio! ¡No me hagas esperar más!',
      'insistente': '¡Por favor, por favor! ¡Mira qué bien te doy la pata!',
      'expectante': '¡Estoy tan emocionado! ¡Será mi snack favorito!',
      'solicitante': '¿Podrías ser tan amable de darme mi premio? ¡Te lo agradecería mucho!',
      'deseoso': '¡Lo deseo tanto! ¡Sería un sueño hecho realidad!',
      'default': '¡Quiero mi premio! ¡Soy un buen perro!'
    };

    return rewardDubbings[emotion] || rewardDubbings['default'];
  }

  // Generar doblaje contextual
  generateContextualDubbing(technicalTranslation, emotionTone, contextTone) {
    // Convertir la traducción técnica en algo más emocional
    let emotionalDubbing = technicalTranslation;

    // Reemplazar frases técnicas por expresiones más emocionales
    const replacements = {
      'aléjate': '¡Por favor, mantén tu distancia!',
      'juega conmigo': '¡Vamos a divertirnos juntos!',
      'exploración': '¡Qué emoción explorar esto!',
      'estoy feliz': '¡Estoy súper feliz!',
      'quiero jugar': '¡No puedo esperar para jugar!',
      'estoy triste': '¡Me siento un poco triste!',
      'tengo hambre': '¡Mi pancita está rugiendo!',
      'estoy cansado': '¡Necesito un descansito!',
      'estoy emocionado': '¡Estoy súper emocionado!'
    };

    // Aplicar reemplazos
    Object.entries(replacements).forEach(([technical, emotional]) => {
      emotionalDubbing = emotionalDubbing.replace(
        new RegExp(technical, 'gi'), 
        emotional
      );
    });

    // Si no se aplicaron reemplazos, usar el tono emocional
    if (emotionalDubbing === technicalTranslation) {
      const randomExample = emotionTone.examples[
        Math.floor(Math.random() * emotionTone.examples.length)
      ];
      emotionalDubbing = `${randomExample} ${technicalTranslation}`;
    }

    return emotionalDubbing;
  }

  // Aplicar estilo del contexto
  applyContextStyle(dubbing, contextTone) {
    return `${contextTone.prefix}${dubbing}${contextTone.suffix}`;
  }

  // Calcular confianza del doblaje emocional
  calculateEmotionalConfidence(emotion, context) {
    let baseConfidence = 80;

    // Ajustar confianza basado en la emoción
    if (emotion && this.emotionTones[emotion]) {
      baseConfidence += 10;
    }

    // Ajustar confianza basado en el contexto
    if (context && this.contextTones[context]) {
      baseConfidence += 5;
    }

    return Math.min(baseConfidence, 95);
  }

  // Generar doblaje personalizado para casos específicos
  generateCustomDubbing(technicalTranslation, customStyle) {
    const styles = {
      'amigable': {
        prefix: '¡Hola amigo! ',
        suffix: ' ¡Espero que estés teniendo un día increíble!'
      },
      'dramático': {
        prefix: '¡*Suspiro dramático* ',
        suffix: ' ¡*Lágrimas de perro*'
      },
      'poético': {
        prefix: 'Como las estrellas en la noche, ',
        suffix: ' así es mi amor por ti.'
      },
      'deportivo': {
        prefix: '¡Vamos equipo! ',
        suffix: ' ¡Somos imparables!'
      }
    };

    const style = styles[customStyle] || styles['amigable'];
    return `${style.prefix}${technicalTranslation}${style.suffix}`;
  }
}

export default new EmotionalDubbingService();
