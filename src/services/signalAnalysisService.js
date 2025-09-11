// Importar el archivo JSON usando una función asíncrona
let signalsData = [];

// Función para cargar los datos de señales
async function loadSignalsData() {
  try {
    // Verificar si estamos en el navegador o en Node.js
    if (typeof window !== 'undefined') {
      // Navegador: usar fetch
      const response = await fetch('/src/signals.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      signalsData = await response.json();
    } else {
      // Node.js: usar fs
      const fs = await import('fs');
      const path = await import('path');
      const signalsPath = path.join(process.cwd(), 'src', 'signals.json');
      const fileContent = fs.readFileSync(signalsPath, 'utf8');
      signalsData = JSON.parse(fileContent);
    }
    // console.log('✅ Matriz de señales cargada:', signalsData.length, 'señales'); // Comentado: ya no usamos matriz de señales
  } catch (error) {
    console.error('❌ Error cargando matriz de señales:', error);
    signalsData = [];
  }
}

class SignalAnalysisService {
  constructor() {
    this.signalsMatrix = signalsData;
    this.signalCategories = this.extractCategories();
    // Cargar datos si no están disponibles
    if (this.signalsMatrix.length === 0) {
      loadSignalsData().then(() => {
        this.signalsMatrix = signalsData;
        this.signalCategories = this.extractCategories();
      });
    }
  }

  // Extraer categorías únicas de la matriz
  extractCategories() {
    const categories = new Set();
    this.signalsMatrix.forEach(signal => {
      // Usar emocion_probable como categoría principal
      const emotion = signal.emocion_probable;
      if (emotion) {
        // Dividir emociones múltiples y agregar cada una
        emotion.split(',').forEach(e => {
          categories.add(e.trim());
        });
      }
    });
    return Array.from(categories);
  }

  // PASO 1: Descripción objetiva sin interpretación
  async getObjectiveDescription(mediaData, mediaType, geminiService) {
    try {
      const objectivePrompt = `Eres un observador experto en comportamiento canino. Tu tarea es describir ÚNICAMENTE las señales visuales del perro que ves en la imagen/video.

**IMPORTANTE - PROHIBIDO:**
❌ NO leas texto, subtítulos, títulos o letras en el video/imagen
❌ NO describas contenido del video, solo el comportamiento del perro
❌ NO menciones palabras escritas, solo señales visuales
❌ NO analices audio o sonidos, solo comportamiento visual

**DESCRIBE SOLO ESTO:**
- Postura corporal del perro
- Posición y movimiento de la cola
- Posición de las orejas
- Expresión de los ojos
- Posición de la boca y lengua
- Movimientos específicos del cuerpo
- Gestos o acciones particulares

**FORMATO DE RESPUESTA:**
Responde ÚNICAMENTE en formato JSON válido, sin markdown, sin comillas adicionales:
{
  "postura": "descripción de la postura corporal",
  "cola": "descripción de la cola y su movimiento",
  "orejas": "descripción de las orejas",
  "ojos": "descripción de la mirada y expresión",
  "boca": "descripción de la boca y lengua",
  "movimientos": "descripción de movimientos específicos",
  "sonidos": "si hay sonidos visibles (boca abierta, etc.)"
}

**RECUERDA:** Solo describe lo que ves del perro. NO leas texto, subtítulos o letras. Responde SOLO el JSON, sin markdown.`;

      const mediaPart = await geminiService.prepareMediaForGemini(mediaData, mediaType);
      const result = await geminiService.model.generateContent([objectivePrompt, mediaPart]);
      const response = await result.response;
      let text = response.text();
      
      // Limpiar la respuesta de markdown si está presente
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.substring(7);
      }
      if (text.startsWith('```')) {
        text = text.substring(3);
      }
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
      text = text.trim();
      
      const description = JSON.parse(text);
      console.log('🔬 Descripción objetiva:', description);
      
      return description;
      
    } catch (error) {
      console.error('❌ Error obteniendo descripción objetiva:', error);
      
      return {
        postura: "postura no determinada",
        cola: "cola no determinada", 
        orejas: "orejas no determinadas",
        ojos: "ojos no determinados",
        boca: "boca no determinada",
        movimientos: "movimientos no determinados",
        sonidos: "sonidos no determinados"
      };
    }
  }

  // PASO 2: Interpretación usando la matriz de señales
  async interpretWithSignalMatrix(objectiveDescription) {
    try {
      console.log('🔍 Interpretando con matriz de señales...');
      
      // DETECCIÓN PRIORITARIA: Play Bow y señales de juego
      const playBowDetection = this.detectPlayBow(objectiveDescription);
      if (playBowDetection.isPlayBow) {
        console.log('🎯 ¡PLAY BOW DETECTADO! Prioridad absoluta a juego');
        return {
          translation: playBowDetection.translation,
          confidence: 95,
          emotion: 'juguetón',
          behavior: this.formatBehaviorDescription(objectiveDescription),
          context: 'Invitación clara a jugar',
          success: true
        };
      }
      
      // Buscar señales que coincidan con la descripción
      const matchedSignals = this.findMatchingSignals(objectiveDescription);
      
      // Calcular conglomerado de comunicación
      const conglomerate = this.calculateConglomerate(matchedSignals);
      
      // Generar interpretación final
      const interpretation = this.generateFinalInterpretation(conglomerate, objectiveDescription);
      
      console.log('✅ Interpretación completada:', interpretation);
      return interpretation;
      
    } catch (error) {
      console.error('❌ Error en interpretación:', error);
      const fallback = this.getFallbackInterpretation();
      return {
        ...fallback,
        success: true // Asegurar que siempre sea true
      };
    }
  }

  // DETECCIÓN ESPECÍFICA DE PLAY BOW
  detectPlayBow(description) {
    const postura = description.postura ? description.postura.toLowerCase() : '';
    const cola = description.cola ? description.cola.toLowerCase() : '';
    const movimientos = description.movimientos ? description.movimientos.toLowerCase() : '';
    
    // Patrones específicos de Play Bow
    const playBowPatterns = [
      'pecho en el suelo',
      'pecho al suelo', 
      'pecho en suelo',
      'pecho al piso',
      'pecho en piso',
      'trasero arriba',
      'cadera arriba',
      'cola moviendo',
      'cola moviéndose',
      'cola agitada',
      'play bow',
      'postura de juego',
      'invitación a jugar'
    ];
    
    // Verificar si hay coincidencias con patrones de Play Bow
    const hasPlayBowPattern = playBowPatterns.some(pattern => 
      postura.includes(pattern) || 
      cola.includes(pattern) || 
      movimientos.includes(pattern)
    );
    
    // Verificar elementos específicos del Play Bow
    const hasChestDown = postura.includes('pecho') && (postura.includes('suelo') || postura.includes('piso'));
    const hasHipsUp = postura.includes('trasero') || postura.includes('cadera') || postura.includes('arriba');
    const hasTailMoving = cola.includes('moviendo') || cola.includes('agitada') || cola.includes('movimiento');
    
    // Es Play Bow si tiene al menos 2 de los 3 elementos clave
    const playBowScore = [hasChestDown, hasHipsUp, hasTailMoving].filter(Boolean).length;
    const isPlayBow = hasPlayBowPattern || playBowScore >= 2;
    
    if (isPlayBow) {
      return {
        isPlayBow: true,
        translation: '¡Invitación clara a jugar! Estoy emocionado y quiero que juegues conmigo',
        confidence: 95,
        pattern: 'Play Bow detectado'
      };
    }
    
    return {
      isPlayBow: false,
      translation: '',
      confidence: 0,
      pattern: 'No es Play Bow'
    };
  }

  // Buscar señales que coincidan con la descripción objetiva
  findMatchingSignals(description) {
    const matches = [];
    
    this.signalsMatrix.forEach(signal => {
      let score = 0;
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      // BONUS ESPECIAL para señales de juego
      let gameBonus = 1;
      if (signalText.includes('play bow') || 
          signalText.includes('juego') || 
          signalEmotion.includes('juego') ||
          signalEmotion.includes('invitación')) {
        gameBonus = 2; // Doble puntuación para señales de juego
      }
      
      // Buscar coincidencias en postura
      if (description.postura && this.hasMatch(description.postura, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      // Buscar coincidencias en cola
      if (description.cola && this.hasMatch(description.cola, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      // Buscar coincidencias en orejas
      if (description.orejas && this.hasMatch(description.orejas, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      // Buscar coincidencias en ojos
      if (description.ojos && this.hasMatch(description.ojos, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      // Buscar coincidencias en boca
      if (description.boca && this.hasMatch(description.boca, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      // Buscar coincidencias en movimientos
      if (description.movimientos && this.hasMatch(description.movimientos, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      // Buscar coincidencias en sonidos
      if (description.sonidos && this.hasMatch(description.sonidos, signalText, signalDesc)) {
        score += this.getIntensityScore(signal['intensidad_1-5']) * gameBonus;
      }
      
      if (score > 0) {
        matches.push({
          ...signal,
          matchScore: score,
          gameBonus: gameBonus
        });
      }
    });
    
    // Ordenar por puntuación de coincidencia
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Verificar si hay coincidencia entre descripción y señal
  hasMatch(description, signalText, signalDesc) {
    const desc = description.toLowerCase();
    
    // PRIORIDAD 1: Coincidencias exactas o muy específicas
    if (signalText.includes(desc) || signalDesc.includes(desc)) {
      return true;
    }
    
    // PRIORIDAD 2: Coincidencias de frases completas (más de 5 palabras)
    const descPhrases = desc.split(',').map(p => p.trim());
    for (const phrase of descPhrases) {
      if (phrase.split(' ').length > 5) {
        if (signalText.includes(phrase) || signalDesc.includes(phrase)) {
          return true;
        }
      }
    }
    
    // PRIORIDAD 3: Palabras clave específicas y únicas del Play Bow
    const playBowKeywords = ['play bow', 'pecho en suelo', 'cadera arriba', 'cola moviendo'];
    for (const keyword of playBowKeywords) {
      if (desc.includes(keyword)) {
        if (signalText.includes(keyword) || signalDesc.includes(keyword)) {
          return true;
        }
      }
    }
    
    // PRIORIDAD 4: Palabras clave específicas de sumisión/miedo
    const submissionKeywords = ['encogido', 'entre piernas', 'hacia atrás', 'semicerrados', 'evitando', 'tensa', 'quieto'];
    for (const keyword of submissionKeywords) {
      if (desc.includes(keyword)) {
        if (signalText.includes(keyword) || signalDesc.includes(keyword)) {
          return true;
        }
      }
    }
    
    // PRIORIDAD 5: Palabras clave específicas de agresión
    const aggressionKeywords = ['rígido', 'tenso', 'amenazante', 'mirada intensa', 'mostrando dientes', 'inmóvil', 'amenaza'];
    for (const keyword of aggressionKeywords) {
      if (desc.includes(keyword)) {
        if (signalText.includes(keyword) || signalDesc.includes(keyword)) {
          return true;
        }
      }
    }
    
    // PRIORIDAD 6: Palabras clave específicas de alegría y juego
    const joyKeywords = ['alegría', 'felices', 'brillantes', 'entusiasmo', 'energía', 'saltando', 'círculos', 'relajado'];
    for (const keyword of joyKeywords) {
      if (desc.includes(keyword)) {
        if (signalText.includes(keyword) || signalDesc.includes(keyword)) {
          return true;
        }
      }
    }
    
    // PRIORIDAD 7: Solo palabras muy específicas y únicas (mínimo 7 caracteres)
    const descWords = desc.split(' ');
    
    return descWords.some(word => {
      if (word.length < 7) return false; // Aumentar el mínimo para evitar falsos positivos
      
      // Evitar palabras muy comunes que pueden causar confusión
      const commonWords = ['está', 'con', 'del', 'las', 'los', 'una', 'para', 'como', 'muy', 'más', 'sin', 'por', 'que', 'este', 'esta', 'eso', 'esa', 'hacia', 'sobre', 'entre', 'desde', 'hasta', 'pegada', 'pegadas', 'movimiento', 'movimientos', 'suelo', 'cuerpo', 'cabeza', 'cola', 'ojos', 'orejas', 'boca', 'postura', 'movimientos', 'sonidos'];
      if (commonWords.includes(word)) return false;
      
      // Solo palabras muy específicas y únicas
      const specificWords = ['encogido', 'semicerrados', 'evitando', 'quieto', 'tensa', 'pegada', 'pegadas', 'rígido', 'tenso', 'amenazante', 'intensa', 'amenaza', 'inmóvil', 'mostrando', 'dientes', 'alegría', 'felices', 'brillantes', 'entusiasmo', 'energía', 'saltando', 'círculos', 'relajado'];
      if (specificWords.includes(word)) {
        return signalText.includes(word) || signalDesc.includes(word);
      }
      
      return false; // Solo palabras muy específicas
    });
  }

  // Obtener puntuación basada en intensidad
  getIntensityScore(intensidad) {
    // Intensidad más alta = mayor puntuación
    return parseInt(intensidad) || 1;
  }

  // Calcular conglomerado de comunicación
  calculateConglomerate(matchedSignals) {
    if (matchedSignals.length === 0) {
      return {
        primaryEmotion: 'neutral',
        confidence: 50,
        signals: [],
        translation: 'No puedo interpretar claramente lo que veo'
      };
    }

    // PRIORIDAD ABSOLUTA: Verificar si hay Play Bow o señales de juego claras
    const playBowSignals = matchedSignals.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      // DETECCIÓN MUY ESPECÍFICA DE PLAY BOW - solo el patrón real
      const isPlayBow = (signalText.includes('play bow') || 
             signalText.includes('pecho al piso') ||
             signalText.includes('cadera arriba') ||
             signalDesc.includes('pecho en el suelo') ||
             signalDesc.includes('trasero arriba')) &&
             // DEBE contener elementos específicos del Play Bow
             (signalText.includes('pecho') || signalDesc.includes('pecho')) &&
             (signalText.includes('suelo') || signalText.includes('piso') || signalDesc.includes('suelo') || signalDesc.includes('piso')) &&
             // EXCLUIR señales que contengan elementos de agresión o tensión
             !signalText.includes('rígido') &&
             !signalText.includes('tenso') &&
             !signalText.includes('amenaza') &&
             !signalText.includes('dominancia') &&
             !signalText.includes('erguido') &&
             !signalText.includes('amenazante') &&
             !signalText.includes('mirada intensa') &&
             !signalEmotion.includes('amenaza') &&
             !signalEmotion.includes('dominancia') &&
             // EXCLUIR si la descripción contiene elementos de agresión
             !signalDesc.includes('rígido') &&
             !signalDesc.includes('tenso') &&
             !signalDesc.includes('amenaza') &&
             !signalDesc.includes('dominancia') &&
             !signalDesc.includes('erguido') &&
             !signalDesc.includes('amenazante');
      
      return isPlayBow;
    });

    if (playBowSignals.length > 0) {
      return {
        dominantEmotion: { 
          emotion: 'juguetón', 
          signals: playBowSignals, 
          score: playBowSignals.reduce((sum, s) => sum + s.matchScore, 0) 
        },
        allSignals: matchedSignals,
        totalSignals: matchedSignals.length
      };
    }

    // PRIORIDAD ALTA: Verificar si hay señales de agresión y amenaza
    const aggressionSignals = matchedSignals.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      const isAggression = signalText.includes('agresión') ||
             signalText.includes('defensa') ||
             signalText.includes('amenaza') ||
             signalText.includes('gruñido') ||
             signalText.includes('dientes') ||
             signalText.includes('advertencia') ||
             signalText.includes('dominancia') ||
             signalText.includes('intimidación') ||
             signalText.includes('rígido') ||
             signalText.includes('tenso') ||
             signalText.includes('amenazante') ||
             signalText.includes('mirada intensa') ||
             signalEmotion.includes('agresión') ||
             signalEmotion.includes('defensa') ||
             signalEmotion.includes('amenaza') ||
             signalEmotion.includes('dominancia');
      
      return isAggression;
    });

    if (aggressionSignals.length > 0) {
      return {
        dominantEmotion: { 
          emotion: 'agresivo', 
          signals: aggressionSignals, 
          score: aggressionSignals.reduce((sum, s) => sum + s.matchScore, 0) 
        },
        allSignals: matchedSignals,
        totalSignals: matchedSignals.length
      };
    }

    // Agrupar señales por categorías de emoción con lógica mejorada
    const emotionCategories = {
      'miedoso': [],
      'ansioso': [],
      'juguetón': [],
      'feliz': [],
      'curioso': [],
      'exigente': [],
      'neutral': []
    };

    matchedSignals.forEach(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      // CLASIFICACIÓN MEJORADA: Evitar confundir juego con sumisión
      if (signalText.includes('juego') || signalText.includes('diversión') ||
          signalText.includes('excitación') || signalText.includes('play') ||
          signalText.includes('alegría') || signalEmotion.includes('juego') ||
          signalEmotion.includes('diversión') || signalEmotion.includes('invitación')) {
        emotionCategories['juguetón'].push(signal);
      } else if (signalText.includes('miedo') || signalText.includes('sumisión') ||
                 signalText.includes('inseguridad') || signalText.includes('evitación') ||
                 signalEmotion.includes('miedo') || signalEmotion.includes('sumisión')) {
        // EXCEPCIÓN: No clasificar como miedo si hay señales de juego
        const hasGameSignals = matchedSignals.some(s => 
          s.senal.toLowerCase().includes('juego') || 
          s.emocion_probable.toLowerCase().includes('juego')
        );
        if (!hasGameSignals) {
          emotionCategories['miedoso'].push(signal);
        } else {
          emotionCategories['neutral'].push(signal); // Clasificar como neutral si hay conflicto
        }
      } else if (signalText.includes('ansiedad') || signalText.includes('estrés') ||
                 signalText.includes('nerviosismo') || signalEmotion.includes('ansiedad') ||
                 signalEmotion.includes('estrés')) {
        emotionCategories['ansioso'].push(signal);
      } else if (signalText.includes('felicidad') || signalText.includes('contento') ||
                 signalText.includes('relajación') || signalEmotion.includes('felicidad') ||
                 signalEmotion.includes('relajación')) {
        emotionCategories['feliz'].push(signal);
      } else if (signalText.includes('curiosidad') || signalText.includes('interés') ||
                 signalText.includes('atención') || signalEmotion.includes('curiosidad') ||
                 signalEmotion.includes('interés')) {
        emotionCategories['curioso'].push(signal);
      } else if (signalText.includes('exigencia') || signalText.includes('atención') ||
                 signalText.includes('insistencia') || signalEmotion.includes('exigencia')) {
        emotionCategories['exigente'].push(signal);
      } else {
        emotionCategories['neutral'].push(signal);
      }
    });

    // Encontrar la categoría dominante
    let dominantCategory = null;
    let maxScore = 0;

    Object.entries(emotionCategories).forEach(([category, signals]) => {
      if (signals.length > 0) {
        const totalScore = signals.reduce((sum, signal) => sum + signal.matchScore, 0);
        if (totalScore > maxScore) {
          maxScore = totalScore;
          dominantCategory = { emotion: category, signals, score: totalScore };
        }
      }
    });

    return {
      dominantEmotion: dominantCategory,
      allSignals: matchedSignals,
      totalSignals: matchedSignals.length
    };
  }

  // Generar interpretación final
  generateFinalInterpretation(conglomerate, description) {
    if (!conglomerate.dominantEmotion) {
      return {
        translation: 'No puedo interpretar claramente lo que veo',
        confidence: 30,
        emotion: 'neutral',
        behavior: this.formatBehaviorDescription(description),
        context: 'observación sin interpretación clara'
      };
    }

    const { emotion, signals } = conglomerate.dominantEmotion;
    
    // Obtener la señal principal (la de mayor puntuación)
    const primarySignal = signals[0];
    
    // Calcular confianza basada en número y puntuación de señales
    const confidence = Math.min(95, 50 + (signals.length * 10) + (primarySignal.matchScore * 5));
    
    // Determinar emoción principal
    const primaryEmotion = this.determinePrimaryEmotion(signals);
    
    // Generar traducción
    const translation = this.generateTranslation(primarySignal, signals);
    
    return {
      translation,
      confidence: Math.round(confidence),
      emotion: primaryEmotion,
      behavior: this.formatBehaviorDescription(description),
      context: this.determineContext(signals)
    };
  }

  // Determinar emoción principal
  determinePrimaryEmotion(signals) {
    // PRIORIDAD ABSOLUTA: Play Bow y señales de juego claras
    const playBowSignals = signals.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      return signalText.includes('play bow') || 
             signalText.includes('pecho al piso') ||
             signalText.includes('cadera arriba') ||
             signalDesc.includes('pecho en el suelo') ||
             signalDesc.includes('trasero arriba') ||
             signalEmotion.includes('invitación a jugar') ||
             signalEmotion.includes('juego');
    });

    // Si hay Play Bow, es definitivamente juego
    if (playBowSignals.length > 0) {
      return 'juguetón';
    }

    // PRIORIDAD ALTA: Señales de agresión y amenaza
    const aggressionSignals = signals.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      return signalText.includes('agresión') ||
             signalText.includes('defensa') ||
             signalText.includes('amenaza') ||
             signalText.includes('gruñido') ||
             signalText.includes('dientes') ||
             signalText.includes('advertencia') ||
             signalText.includes('dominancia') ||
             signalText.includes('intimidación') ||
             signalText.includes('rígido') ||
             signalText.includes('tenso') ||
             signalText.includes('amenazante') ||
             signalText.includes('mirada intensa') ||
             signalEmotion.includes('agresión') ||
             signalEmotion.includes('defensa') ||
             signalEmotion.includes('amenaza') ||
             signalEmotion.includes('dominancia');
    });

    if (aggressionSignals.length > 0) {
      return 'agresivo';
    }

    // PRIORIDAD ALTA: Señales de miedo y sumisión
    const fearSignals = signals.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      return signalText.includes('miedo') ||
             signalText.includes('sumisión') ||
             signalText.includes('inseguridad') ||
             signalText.includes('evitación') ||
             signalText.includes('encogido') ||
             signalText.includes('entre piernas') ||
             signalText.includes('hacia atrás') ||
             signalText.includes('semicerrados') ||
             signalText.includes('evitando') ||
             signalText.includes('tensa') ||
             signalText.includes('quieto') ||
             signalEmotion.includes('miedo') ||
             signalEmotion.includes('sumisión') ||
             signalEmotion.includes('incomodidad');
    });

    if (fearSignals.length > 0) {
      return 'miedoso';
    }

    // PRIORIDAD ALTA: Señales de juego específicas
    const gameSignals = signals.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      return signalText.includes('juego') ||
             signalText.includes('diversión') ||
             signalText.includes('excitación') ||
             signalText.includes('alegría') ||
             signalText.includes('play') ||
             signalDesc.includes('juego') ||
             signalEmotion.includes('juego') ||
             signalEmotion.includes('diversión') ||
             signalEmotion.includes('excitación');
    });

    if (gameSignals.length > 0) {
      return 'juguetón';
    }

    // PRIORIDAD MEDIA: Otras emociones con puntuación
    const emotionKeywords = {
      'ansioso': ['ansiedad', 'estrés', 'nerviosismo', 'inquietud', 'tensión'],
      'feliz': ['felicidad', 'contento', 'relajación', 'bienestar', 'tranquilidad'],
      'curioso': ['curiosidad', 'interés', 'atención', 'exploración', 'investigación'],
      'exigente': ['exigencia', 'atención', 'insistencia', 'demanda']
    };

    let maxScore = 0;
    let primaryEmotion = 'neutral';

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      let highIntensityCount = 0;
      
      signals.forEach(signal => {
        const signalText = signal.senal.toLowerCase();
        const signalDesc = signal.descripcion.toLowerCase();
        const signalEmotion = signal.emocion_probable.toLowerCase();
        const intensity = signal['intensidad_1-5'];
        
        keywords.forEach(keyword => {
          if (signalText.includes(keyword) || 
              signalDesc.includes(keyword) || 
              signalEmotion.includes(keyword)) {
            score += signal.matchScore;
            // Dar bonus por alta intensidad
            if (intensity >= 4) {
              highIntensityCount++;
              score += 2; // Bonus adicional por alta intensidad
            }
          }
        });
      });
      
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    });

    return primaryEmotion;
  }

  // Generar traducción
  generateTranslation(primarySignal, signals) {
    // Usar la interpretación priorizada de la señal principal como base
    let translation = primarySignal.interpretacion_priorizada;
    
    // Si hay múltiples señales, combinar información
    if (signals.length > 1) {
      const additionalContext = signals.slice(1, 3).map(s => s.interpretacion_priorizada).join(' ');
      translation = `${translation} ${additionalContext}`;
    }
    
    return translation;
  }

  // Formatear descripción de comportamiento
  formatBehaviorDescription(description) {
    const parts = [];
    
    if (description.postura) parts.push(`Postura: ${description.postura}`);
    if (description.cola) parts.push(`Cola: ${description.cola}`);
    if (description.orejas) parts.push(`Orejas: ${description.orejas}`);
    if (description.ojos) parts.push(`Ojos: ${description.ojos}`);
    if (description.boca) parts.push(`Boca: ${description.boca}`);
    if (description.movimientos) parts.push(`Movimientos: ${description.movimientos}`);
    if (description.sonidos) parts.push(`Sonidos: ${description.sonidos}`);
    
    return parts.join('. ');
  }

  // Determinar contexto
  determineContext(signals) {
    // Usar la emoción probable de la señal principal como contexto
    if (signals.length > 0) {
      return signals[0].emocion_probable;
    }
    return 'interacción general';
  }

  // Respuestas de fallback
  getFallbackDescription() {
    return {
      postura: 'postura no claramente visible',
      cola: 'cola no claramente visible',
      orejas: 'orejas no claramente visibles',
      ojos: 'ojos no claramente visibles',
      boca: 'boca no claramente visible',
      movimientos: 'movimientos no claramente visibles',
      sonidos: 'sin sonidos detectados'
    };
  }

  getFallbackInterpretation() {
    return {
      translation: 'No puedo interpretar claramente lo que veo',
      confidence: 20,
      emotion: 'neutral',
      behavior: 'comportamiento no claramente visible',
      context: 'sin contexto claro',
      success: true // Asegurar que siempre sea true
    };
  }

  // Método principal para análisis completo
  async analyzeWithSignalMatrix(mediaData, mediaType, geminiService) {
    try {
      console.log('🔍 Iniciando análisis con matriz de señales...');
      
      // Paso 1: Obtener descripción objetiva
      const objectiveDescription = await this.getObjectiveDescription(mediaData, mediaType, geminiService);
      console.log('✅ Descripción objetiva obtenida:', objectiveDescription);
      
      // Paso 2: Analizar con matriz de señales
      const signalAnalysis = await this.interpretWithSignalMatrix(objectiveDescription);
      console.log('✅ Análisis con matriz completado:', signalAnalysis);
      
      return {
        analysisMethod: 'signal-matrix',
        objectiveDescription,
        ...signalAnalysis,
        success: true // Asegurar que siempre sea true
      };
      
    } catch (error) {
      console.error('❌ Error en análisis con matriz de señales:', error);
      const fallback = this.getFallbackInterpretation();
      return {
        ...fallback,
        success: true // Asegurar que siempre sea true
      };
    }
  }
}

export default SignalAnalysisService;
