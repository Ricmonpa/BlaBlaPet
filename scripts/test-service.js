import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Función para probar el servicio de análisis de señales
function testSignalAnalysisService() {
  try {
    console.log('🔧 Inicializando SignalAnalysisService...');
    
    // Crear instancia del servicio
    const service = new SignalAnalysisService();
    
    console.log('✅ Servicio inicializado correctamente');
    console.log(`📊 Matriz de señales cargada: ${service.signalsMatrix.length} señales`);
    console.log(`📋 Categorías extraídas: ${service.signalCategories.length}`);
    
    // Mostrar algunas categorías
    console.log('\n📋 Categorías disponibles:');
    service.signalCategories.slice(0, 10).forEach(category => {
      console.log(`  - ${category}`);
    });
    
    if (service.signalCategories.length > 10) {
      console.log(`  ... y ${service.signalCategories.length - 10} más`);
    }
    
    // Probar búsqueda de señales
    console.log('\n🔍 Probando búsqueda de señales...');
    const testDescription = {
      postura: "cuerpo relajado",
      cola: "cola moviéndose suavemente",
      orejas: "orejas relajadas",
      ojos: "ojos semicerrados",
      boca: "boca semiabierta con lengua afuera",
      movimientos: "ningún movimiento específico",
      sonidos: "ningún sonido visible"
    };
    
    const matchedSignals = service.findMatchingSignals(testDescription);
    console.log(`✅ Señales encontradas: ${matchedSignals.length}`);
    
    if (matchedSignals.length > 0) {
      console.log('\n📋 Primeras señales encontradas:');
      matchedSignals.slice(0, 3).forEach(signal => {
        console.log(`  - ${signal.numero}: ${signal.senal} (${signal.emocion_probable})`);
      });
    }
    
    console.log('\n🎉 ¡Prueba del servicio completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al probar el servicio:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testSignalAnalysisService();
