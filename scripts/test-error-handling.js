import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Simular el manejo de errores del sistema
async function testErrorHandling() {
  try {
    console.log('🔧 Probando manejo de errores del sistema...');
    
    // Crear instancia del servicio
    const service = new SignalAnalysisService();
    
    // Simular descripción objetiva con valores por defecto (como cuando falla Gemini)
    const fallbackDescription = {
      postura: "postura no determinada",
      cola: "cola no determinada", 
      orejas: "orejas no determinadas",
      ojos: "ojos no determinados",
      boca: "boca no determinada",
      movimientos: "movimientos no determinados",
      sonidos: "sonidos no determinados"
    };
    
    console.log('📋 Descripción por defecto (fallback):');
    console.log(JSON.stringify(fallbackDescription, null, 2));
    
    // Probar interpretación con valores por defecto
    console.log('\n🔍 Probando interpretación con valores por defecto...');
    const interpretation = await service.interpretWithSignalMatrix(fallbackDescription);
    
    console.log('✅ Interpretación con fallback:');
    console.log(`Traducción: ${interpretation.translation}`);
    console.log(`Confianza: ${interpretation.confidence}%`);
    console.log(`Emoción: ${interpretation.emotion}`);
    console.log(`Comportamiento: ${interpretation.behavior}`);
    console.log(`Contexto: ${interpretation.context}`);
    
    // Probar con descripción más específica
    console.log('\n🔍 Probando con descripción más específica...');
    const specificDescription = {
      postura: "cuerpo tenso",
      cola: "cola rígida", 
      orejas: "orejas hacia atrás",
      ojos: "mirada fija",
      boca: "mostrando dientes",
      movimientos: "cuerpo rígido",
      sonidos: "gruñido"
    };
    
    const specificInterpretation = await service.interpretWithSignalMatrix(specificDescription);
    
    console.log('✅ Interpretación específica:');
    console.log(`Traducción: ${specificInterpretation.translation}`);
    console.log(`Confianza: ${specificInterpretation.confidence}%`);
    console.log(`Emoción: ${specificInterpretation.emotion}`);
    
    console.log('\n🎉 ¡Prueba de manejo de errores completada!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testErrorHandling();
