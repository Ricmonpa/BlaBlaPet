import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Probar directamente el servicio
async function testServiceDirect() {
  try {
    console.log('🔧 Probando servicio directamente...');
    
    // Crear instancia del servicio
    const service = new SignalAnalysisService();
    
    // Esperar a que se cargue la matriz
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📊 Matriz cargada:', service.signalsMatrix.length, 'señales');
    
    // Descripción específica de agresión
    const description = {
      postura: "cuerpo tenso",
      cola: "cola rígida", 
      orejas: "orejas hacia atrás",
      ojos: "mirada fija",
      boca: "mostrando dientes",
      movimientos: "cuerpo rígido",
      sonidos: "gruñido"
    };
    
    console.log('📋 Descripción:', description);
    
    // Buscar coincidencias directamente
    const matches = service.findMatchingSignals(description);
    console.log(`\n✅ Coincidencias encontradas: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('\n📋 Top 5 coincidencias:');
      matches.slice(0, 5).forEach((signal, index) => {
        console.log(`${index + 1}. ${signal.numero}: ${signal.senal} (Score: ${signal.matchScore})`);
        console.log(`   Emoción: ${signal.emocion_probable}`);
        console.log(`   Interpretación: ${signal.interpretacion_priorizada}`);
        console.log('');
      });
      
      // Calcular conglomerado
      const conglomerate = service.calculateConglomerate(matches);
      console.log('📊 Conglomerado:', conglomerate.dominantEmotion?.emotion || 'N/A');
      
      // Generar interpretación
      const interpretation = service.generateFinalInterpretation(conglomerate, description);
      console.log('\n🎯 Interpretación final:');
      console.log(`Traducción: ${interpretation.translation}`);
      console.log(`Confianza: ${interpretation.confidence}%`);
      console.log(`Emoción: ${interpretation.emotion}`);
    } else {
      console.log('❌ No se encontraron coincidencias');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar la prueba
testServiceDirect();
