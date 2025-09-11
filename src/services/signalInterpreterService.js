import signalsData from '../signals_enhanced.json';

/**
 * Motor de interpretación contextual de 4 capas para señales caninas
 * Reemplaza el sistema de matriz plana por análisis progresivo y contextual
 */
class SignalInterpreterService {
  constructor() {
    this.signals = signalsData.signals;
    this.rules = signalsData.metadata.rules;
    this.categories = signalsData.metadata.categories;
  }

  /**
   * CAPA 1: Detección de señales individuales
   * Entrada: lista de señales observadas
   * Salida: descripción literal de cada señal
   */
  layer1_detectSignals(signalsDetected) {
    const detectedSignals = [];
    
    for (const signalId of signalsDetected) {
      const signal = this.signals.find(s => s.id === signalId);
      if (signal) {
        detectedSignals.push({
          id: signal.id,
          nombre: signal.nombre,
          descripcion: signal.descripcion,
          categoria: signal.categoria,
          layer1_raw: signal.layer_1_raw,
          confidence: this.parseConfidence(signal.confidence_range)
        });
      }
    }
    
    return {
      layer: 1,
      description: "Detección de señales individuales",
      signals: detectedSignals,
      total: detectedSignals.length
    };
  }

  /**
   * CAPA 2: Agrupación de combinaciones
   * Buscar patrones conocidos en combinaciones_clave
   */
  layer2_analyzeCombinations(signalsDetected) {
    const combinations = [];
    const signalObjects = this.signals.filter(s => signalsDetected.includes(s.id));
    
    // Buscar combinaciones conocidas
    for (const signal of signalObjects) {
      if (signal.combinaciones_clave) {
        const foundCombinations = signal.combinaciones_clave.filter(comboId => 
          signalsDetected.includes(comboId)
        );
        
        if (foundCombinations.length > 0) {
          combinations.push({
            primary_signal: signal.id,
            combination_signals: foundCombinations,
            interpretation_change: `La presencia de ${foundCombinations.join(', ')} modifica la interpretación de ${signal.nombre}`,
            confidence_boost: 0.1 // Aumenta confianza por combinación
          });
        }
      }
    }
    
    return {
      layer: 2,
      description: "Análisis de combinaciones de señales",
      combinations: combinations,
      total_combinations: combinations.length
    };
  }

  /**
   * CAPA 3: Contexto situacional
   * Considerar metadata: lugar, interacción, estado previo
   */
  layer3_analyzeContext(signalsDetected, context = {}) {
    const contextAnalysis = {
      lugar: context.lugar || 'desconocido',
      interaccion: context.interaccion || 'desconocida',
      objeto: context.objeto || 'ninguno',
      estado_previo: context.estado_previo || 'desconocido'
    };
    
    // Analizar cómo el contexto afecta las señales
    const contextualizedSignals = [];
    
    for (const signalId of signalsDetected) {
      const signal = this.signals.find(s => s.id === signalId);
      if (signal) {
        const contextualized = {
          ...signal,
          context_impact: this.analyzeContextImpact(signal, contextAnalysis)
        };
        contextualizedSignals.push(contextualized);
      }
    }
    
    return {
      layer: 3,
      description: "Análisis contextual situacional",
      context: contextAnalysis,
      contextualized_signals: contextualizedSignals
    };
  }

  /**
   * CAPA 4: Síntesis narrativa
   * Generar mensaje natural y narrativo para el pet parent
   */
  layer4_generateNarrative(layer1, layer2, layer3) {
    const narrative = this.buildNarrative(layer1, layer2, layer3);
    const confidence = this.calculateOverallConfidence(layer1, layer2, layer3);
    
    return {
      layer: 4,
      description: "Síntesis narrativa final",
      narrative: narrative,
      confidence: confidence,
      recommendation: this.generateRecommendation(narrative, confidence),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Función principal de interpretación que ejecuta las 4 capas
   */
  interpretSignals(signalsDetected, context = {}) {
    try {
      // Ejecutar las 4 capas secuencialmente
      const layer1 = this.layer1_detectSignals(signalsDetected);
      const layer2 = this.layer2_analyzeCombinations(signalsDetected);
      const layer3 = this.layer3_analyzeContext(signalsDetected, context);
      const layer4 = this.layer4_generateNarrative(layer1, layer2, layer3);
      
      return {
        success: true,
        interpretation: {
          layers: [layer1, layer2, layer3, layer4],
          summary: {
            signals_detected: signalsDetected.length,
            confidence: layer4.confidence,
            narrative: layer4.narrative,
            recommendation: layer4.recommendation
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: "Interpretación incierta - señales ambiguas o contradictorias detectadas"
      };
    }
  }

  // Métodos auxiliares privados
  
  parseConfidence(confidenceRange) {
    const match = confidenceRange.match(/(\d+)-(\d+)%/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return (min + max) / 200; // Convertir a decimal 0-1
    }
    return 0.75; // Valor por defecto
  }

  analyzeContextImpact(signal, context) {
    let impact = "neutral";
    
    // Lógica para analizar impacto del contexto
    if (context.lugar === "veterinario" && signal.categoria === "miedo") {
      impact = "amplifica";
    } else if (context.lugar === "casa" && signal.categoria === "juego") {
      impact = "confirma";
    } else if (context.interaccion === "con perro desconocido" && signal.categoria === "agresión") {
      impact = "requiere_caution";
    }
    
    return impact;
  }

  buildNarrative(layer1, layer2, layer3) {
    if (layer1.signals.length === 0) {
      return "No se detectaron señales claras para interpretar.";
    }

    const primarySignal = layer1.signals[0];
    let narrative = `Tu perro está mostrando ${primarySignal.nombre.toLowerCase()}. `;
    
    // Añadir información de combinaciones
    if (layer2.combinations.length > 0) {
      narrative += `Esta señal se combina con otras que refuerzan su significado. `;
    }
    
    // Añadir contexto
    if (layer3.context.lugar !== 'desconocido') {
      narrative += `El contexto de ${layer3.context.lugar} `;
      if (layer3.context.interaccion !== 'desconocida') {
        narrative += `y la interacción ${layer3.context.interaccion} `;
      }
      narrative += `ayudan a confirmar la interpretación. `;
    }
    
    // Añadir interpretación final
    const contextualizedSignal = layer3.contextualized_signals.find(s => s.id === primarySignal.id);
    if (contextualizedSignal) {
      narrative += contextualizedSignal.layer_4_interpretation;
    }
    
    return narrative;
  }

  calculateOverallConfidence(layer1, layer2, layer3) {
    let baseConfidence = 0.7;
    
    // Ajustar por número de señales
    if (layer1.signals.length > 1) {
      baseConfidence += 0.1;
    }
    
    // Ajustar por combinaciones
    if (layer2.combinations.length > 0) {
      baseConfidence += 0.15;
    }
    
    // Ajustar por contexto
    if (layer3.context.lugar !== 'desconocido') {
      baseConfidence += 0.05;
    }
    
    return Math.min(baseConfidence, 0.95); // Máximo 95%
  }

  generateRecommendation(narrative, confidence) {
    if (confidence < 0.6) {
      return "Observa más señales antes de tomar decisiones. La interpretación actual es incierta.";
    } else if (confidence < 0.8) {
      return "La interpretación es probable pero considera el contexto adicional.";
    } else {
      return "La interpretación es confiable. Puedes actuar según la narrativa proporcionada.";
    }
  }

  // Métodos de utilidad para el frontend
  
  getAllSignals() {
    return this.signals;
  }

  getSignalsByCategory(category) {
    return this.signals.filter(s => s.categoria === category);
  }

  searchSignals(query) {
    const lowerQuery = query.toLowerCase();
    return this.signals.filter(s => 
      s.nombre.toLowerCase().includes(lowerQuery) ||
      s.descripcion.toLowerCase().includes(lowerQuery) ||
      s.categoria.toLowerCase().includes(lowerQuery)
    );
  }

  getSignalById(id) {
    return this.signals.find(s => s.id === id);
  }
}

// Exportar instancia singleton
const signalInterpreterService = new SignalInterpreterService();
export default signalInterpreterService;
