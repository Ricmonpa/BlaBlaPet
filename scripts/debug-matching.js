import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Simular descripción objetiva de sumisión
const submissionDescription = {
  postura: "El perro está encogido, con el cuerpo bajo al suelo",
  cola: "La cola está entre las piernas, pegada al cuerpo",
  orejas: "Las orejas están hacia atrás, pegadas a la cabeza",
  ojos: "Los ojos están semicerrados, evitando el contacto visual",
  boca: "La boca está cerrada, tensa",
  movimientos: "El perro está quieto, sin movimientos",
  sonidos: "No se observan sonidos visibles"
};

async function debugMatching() {
  console.log('🔍 Debug: Analizando coincidencias para sumisión...\n');
  
  const signalService = new SignalAnalysisService();
  
  // Esperar a que se carguen los datos
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📋 Descripción de Sumisión:');
  console.log(JSON.stringify(submissionDescription, null, 2));
  
  // Debug: Ver qué señales se encuentran
  console.log('\n🔍 Buscando señales que coincidan...');
  
  try {
    // Llamar directamente a la función de búsqueda
    const matchedSignals = signalService.findMatchingSignals(submissionDescription);
    
    console.log('\n📊 Señales encontradas:', matchedSignals.length);
    
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
debugMatching().catch(console.error);
