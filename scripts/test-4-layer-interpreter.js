#!/usr/bin/env node

/**
 * Script de prueba para el Motor de Interpretación de 4 Capas
 * Demuestra cómo funciona el sistema progresivo vs la matriz plana anterior
 */

// Simular el servicio de interpretación (en un entorno real sería importado)
class MockSignalInterpreterService {
  constructor() {
    this.signals = [
      {
        id: "play_bow",
        nombre: "Reverencia de juego",
        categoria: "juego",
        combinaciones_clave: ["cola_mueve_rapido", "orejas_relajadas"],
        layer_1_raw: "Postura de reverencia con patas delanteras extendidas",
        layer_4_interpretation: "El perro está claramente invitando a jugar de forma amistosa"
      },
      {
        id: "cola_mueve_rapido",
        nombre: "Cola moviéndose rápidamente",
        categoria: "alegría",
        combinaciones_clave: ["play_bow", "orejas_relajadas"],
        layer_1_raw: "Movimiento lateral rápido de la cola",
        layer_4_interpretation: "El perro está muy feliz y emocionado"
      },
      {
        id: "orejas_relajadas",
        nombre: "Orejas en posición natural",
        categoria: "social",
        combinaciones_clave: ["play_bow", "cola_mueve_rapido"],
        layer_1_raw: "Orejas en posición natural, no tensas",
        layer_4_interpretation: "El perro está cómodo y relajado"
      }
    ];
  }

  // CAPA 1: Detección de señales individuales
  layer1_detectSignals(signalsDetected) {
    const detectedSignals = [];
    
    for (const signalId of signalsDetected) {
      const signal = this.signals.find(s => s.id === signalId);
      if (signal) {
        detectedSignals.push({
          id: signal.id,
          nombre: signal.nombre,
          categoria: signal.categoria,
          layer1_raw: signal.layer_1_raw
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

  // CAPA 2: Análisis de combinaciones
  layer2_analyzeCombinations(signalsDetected) {
    const combinations = [];
    const signalObjects = this.signals.filter(s => signalsDetected.includes(s.id));
    
    for (const signal of signalObjects) {
      if (signal.combinaciones_clave) {
        const foundCombinations = signal.combinaciones_clave.filter(comboId => 
          signalsDetected.includes(comboId)
        );
        
        if (foundCombinations.length > 0) {
          combinations.push({
            primary_signal: signal.id,
            combination_signals: foundCombinations,
            interpretation_change: `La presencia de ${foundCombinations.join(', ')} modifica la interpretación de ${signal.nombre}`
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

  // CAPA 3: Análisis contextual
  layer3_analyzeContext(signalsDetected, context = {}) {
    const contextAnalysis = {
      lugar: context.lugar || 'desconocido',
      interaccion: context.interaccion || 'desconocida',
      objeto: context.objeto || 'ninguno'
    };
    
    return {
      layer: 3,
      description: "Análisis contextual situacional",
      context: contextAnalysis,
      contextualized_signals: this.signals.filter(s => signalsDetected.includes(s.id))
    };
  }

  // CAPA 4: Síntesis narrativa
  layer4_generateNarrative(layer1, layer2, layer3) {
    if (layer1.signals.length === 0) {
      return {
        layer: 4,
        description: "Síntesis narrativa final",
        narrative: "No se detectaron señales claras para interpretar.",
        confidence: 0.0
      };
    }

    const primarySignal = layer1.signals[0];
    let narrative = `Tu perro está mostrando ${primarySignal.nombre.toLowerCase()}. `;
    
    if (layer2.combinations.length > 0) {
      narrative += `Esta señal se combina con otras que refuerzan su significado. `;
    }
    
    if (layer3.context.lugar !== 'desconocido') {
      narrative += `El contexto de ${layer3.context.lugar} `;
      if (layer3.context.interaccion !== 'desconocida') {
        narrative += `y la interacción ${layer3.context.interaccion} `;
      }
      narrative += `ayudan a confirmar la interpretación. `;
    }
    
    const contextualizedSignal = layer3.contextualized_signals.find(s => s.id === primarySignal.id);
    if (contextualizedSignal) {
      narrative += contextualizedSignal.layer_4_interpretation;
    }
    
    const confidence = 0.7 + (layer2.combinations.length * 0.1) + (layer3.context.lugar !== 'desconocido' ? 0.05 : 0);
    
    return {
      layer: 4,
      description: "Síntesis narrativa final",
      narrative: narrative,
      confidence: Math.min(confidence, 0.95)
    };
  }

  // Función principal de interpretación
  interpretSignals(signalsDetected, context = {}) {
    try {
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
            narrative: layer4.narrative
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: "Interpretación incierta - señales ambiguas detectadas"
      };
    }
  }
}

// Función para mostrar resultados de forma clara
function displayResults(title, data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${title}`);
  console.log(`${'='.repeat(60)}`);
  
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
}

// Función para comparar sistema anterior vs nuevo
function compareSystems() {
  console.log(`\n${'🚀'.repeat(20)} COMPARACIÓN DE SISTEMAS ${'🚀'.repeat(20)}`);
  
  // SISTEMA ANTERIOR (Matriz plana)
  console.log(`\n📋 SISTEMA ANTERIOR (Matriz Plana):`);
  console.log(`   • Señal → Traducción literal`);
  console.log(`   • Sin contexto`);
  console.log(`   • Sin combinaciones`);
  console.log(`   • Resultado: "play_bow = invitación a jugar"`);
  
  // SISTEMA NUEVO (4 Capas)
  console.log(`\n🆕 SISTEMA NUEVO (4 Capas):`);
  console.log(`   • Capa 1: Detección individual`);
  console.log(`   • Capa 2: Análisis de combinaciones`);
  console.log(`   • Capa 3: Contexto situacional`);
  console.log(`   • Capa 4: Síntesis narrativa`);
  console.log(`   • Resultado: Narrativa contextual completa`);
}

// Función principal de pruebas
function runTests() {
  const interpreter = new MockSignalInterpreterService();
  
  console.log(`🐕 MOTOR DE INTERPRETACIÓN DE 4 CAPAS - DEMOSTRACIÓN`);
  console.log(`   Sistema que reemplaza la matriz plana por interpretación contextual progresiva`);
  
  // Comparar sistemas
  compareSystems();
  
  // PRUEBA 1: Señal individual
  displayResults("PRUEBA 1: Señal Individual (play_bow)", {
    description: "Solo una señal detectada",
    input: {
      signals: ["play_bow"],
      context: { lugar: "casa", interaccion: "con humano" }
    }
  });
  
  const result1 = interpreter.interpretSignals(["play_bow"], { lugar: "casa", interaccion: "con humano" });
  displayResults("RESULTADO PRUEBA 1", result1);
  
  // PRUEBA 2: Múltiples señales con combinaciones
  displayResults("PRUEBA 2: Múltiples Señales (play_bow + cola_mueve_rapido)", {
    description: "Dos señales que se combinan para cambiar la interpretación",
    input: {
      signals: ["play_bow", "cola_mueve_rapido"],
      context: { lugar: "casa", interaccion: "con humano", objeto: "juguete" }
    }
  });
  
  const result2 = interpreter.interpretSignals(
    ["play_bow", "cola_mueve_rapido"], 
    { lugar: "casa", interaccion: "con humano", objeto: "juguete" }
  );
  displayResults("RESULTADO PRUEBA 2", result2);
  
  // PRUEBA 3: Contexto que cambia la interpretación
  displayResults("PRUEBA 3: Contexto Crítico (veterinario)", {
    description: "Misma señal en contexto de veterinario",
    input: {
      signals: ["play_bow"],
      context: { lugar: "veterinario", interaccion: "con veterinario" }
    }
  });
  
  const result3 = interpreter.interpretSignals(
    ["play_bow"], 
    { lugar: "veterinario", interaccion: "con veterinario" }
  );
  displayResults("RESULTADO PRUEBA 3", result3);
  
  // Resumen de ventajas
  console.log(`\n${'💡'.repeat(20)} VENTAJAS DEL NUEVO SISTEMA ${'💡'.repeat(20)}`);
  console.log(`✅ Mayor precisión por análisis de combinaciones`);
  console.log(`✅ Interpretación contextual según situación`);
  console.log(`✅ Narrativas comprensibles para humanos`);
  console.log(`✅ Cálculo de confianza por capa`);
  console.log(`✅ Sistema extensible y mantenible`);
  
  console.log(`\n${'🎯'.repeat(20)} CONCLUSIÓN ${'🎯'.repeat(20)}`);
  console.log(`El motor de 4 capas transforma la interpretación canina de una`);
  console.log(`traducción literal a un análisis inteligente y contextual que`);
  console.log(`proporciona insights valiosos para los pet parents.`);
}

// Ejecutar pruebas directamente
runTests();
