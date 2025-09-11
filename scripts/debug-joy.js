import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Descripción de alegría
const joyDescription = {
  postura: "El perro está erguido, con el cuerpo relajado",
  cola: "La cola está moviéndose en círculos amplios con entusiasmo",
  orejas: "Las orejas están erguidas hacia adelante, mostrando atención",
  ojos: "Los ojos están brillantes y felices",
  boca: "La boca está abierta, mostrando la lengua con alegría",
  movimientos: "El perro está saltando y moviéndose con energía",
  sonidos: "No se observan sonidos visibles"
};

async function debugJoy() {
  console.log('🔍 Debug: Analizando coincidencias para alegría...\n');
  
  const signalService = new SignalAnalysisService();
  
  // Esperar a que se carguen los datos
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📋 Descripción de Alegría:');
  console.log(JSON.stringify(joyDescription, null, 2));
  
  // Debug: Ver qué señales se encuentran
  console.log('\n🔍 Buscando señales que coincidan...');
  
  try {
    // Llamar directamente a la función de búsqueda
    const matchedSignals = signalService.findMatchingSignals(joyDescription);
    
    console.log('\n📊 Señales encontradas:', matchedSignals.length);
    
    // Mostrar todas las señales encontradas
    matchedSignals.forEach((signal, index) => {
      console.log(`\n--- Señal ${index + 1} ---`);
      console.log('Señal:', signal.senal);
      console.log('Descripción:', signal.descripcion);
      console.log('Emoción probable:', signal.emocion_probable);
      console.log('Interpretación:', signal.interpretacion_priorizada);
      console.log('Puntuación:', signal.matchScore);
      console.log('Bonus de juego:', signal.gameBonus || 1);
    });
    
    // Debug: Ver el conglomerado
    console.log('\n🔍 Calculando conglomerado...');
    const conglomerate = signalService.calculateConglomerate(matchedSignals);
    
    console.log('\n📊 Resultado del conglomerado:');
    console.log('Emoción dominante:', conglomerate.dominantEmotion?.emotion);
    console.log('Señales dominantes:', conglomerate.dominantEmotion?.signals?.length || 0);
    console.log('Puntuación total:', conglomerate.dominantEmotion?.score || 0);
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar debug
debugJoy().catch(console.error);
