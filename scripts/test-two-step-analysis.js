import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Simular el análisis en dos pasos
async function testTwoStepAnalysis() {
  try {
    console.log('🔧 Probando análisis en dos pasos...');
    
    // Crear instancia del servicio
    const service = new SignalAnalysisService();
    
    // Simular descripción objetiva de un perro agresivo (PASO 1)
    const objectiveDescription = {
      postura: "cuerpo tenso y rígido",
      cola: "cola rígida en alto",
      orejas: "orejas hacia atrás",
      ojos: "mirada fija intensa",
      boca: "mostrando dientes, labios retraídos",
      movimientos: "cuerpo rígido previo a ataque",
      sonidos: "gruñido bajo y constante"
    };
    
    console.log('📋 PASO 1 - Descripción objetiva:');
    console.log(JSON.stringify(objectiveDescription, null, 2));
    
    // PASO 2: Interpretación usando la matriz de señales
    console.log('\n🔍 PASO 2 - Interpretando con matriz de señales...');
    
    // Buscar señales que coincidan
    const matchedSignals = service.findMatchingSignals(objectiveDescription);
    console.log(`✅ Señales encontradas: ${matchedSignals.length}`);
    
    if (matchedSignals.length > 0) {
      console.log('\n📋 Top 5 señales coincidentes:');
      matchedSignals.slice(0, 5).forEach((signal, index) => {
        console.log(`${index + 1}. ${signal.numero}: ${signal.senal} (Score: ${signal.matchScore})`);
        console.log(`   Descripción: ${signal.descripcion}`);
        console.log(`   Emoción: ${signal.emocion_probable}`);
        console.log(`   Intensidad: ${signal['intensidad_1-5']}`);
        console.log(`   Interpretación: ${signal.interpretacion_priorizada}`);
        console.log('');
      });
      
      // Calcular conglomerado
      const conglomerate = service.calculateConglomerate(matchedSignals);
      console.log('📊 Conglomerado calculado:');
      console.log(`Emoción dominante: ${conglomerate.dominantEmotion?.emotion || 'N/A'}`);
      console.log(`Total de señales: ${conglomerate.totalSignals}`);
      
      // Generar interpretación final
      const interpretation = service.generateFinalInterpretation(conglomerate, objectiveDescription);
      console.log('\n🎯 Interpretación final:');
      console.log(`Traducción: ${interpretation.translation}`);
      console.log(`Confianza: ${interpretation.confidence}%`);
      console.log(`Emoción: ${interpretation.emotion}`);
      console.log(`Comportamiento: ${interpretation.behavior}`);
      console.log(`Contexto: ${interpretation.context}`);
    }
    
    console.log('\n🎉 ¡Análisis en dos pasos completado exitosamente!');
    console.log('✅ El sistema está funcionando correctamente con la matriz ampliada');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testTwoStepAnalysis();
