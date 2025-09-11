import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Descripción de agresión
const aggressionDescription = {
  postura: "El perro está rígido, con el cuerpo tenso y erguido",
  cola: "La cola está rígida y alta, sin movimiento",
  orejas: "Las orejas están erguidas hacia adelante, tensas",
  ojos: "Los ojos están fijos y amenazantes, con mirada intensa",
  boca: "La boca está cerrada, mostrando los dientes",
  movimientos: "El perro está inmóvil, en posición de amenaza",
  sonidos: "No se observan sonidos visibles"
};

async function debugAggression() {
  console.log('🔍 Debug: Analizando coincidencias para agresión...\n');
  
  const signalService = new SignalAnalysisService();
  
  // Esperar a que se carguen los datos
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📋 Descripción de Agresión:');
  console.log(JSON.stringify(aggressionDescription, null, 2));
  
  // Debug: Ver qué señales se encuentran
  console.log('\n🔍 Buscando señales que coincidan...');
  
  try {
    // Llamar directamente a la función de búsqueda
    const matchedSignals = signalService.findMatchingSignals(aggressionDescription);
    
    console.log('\n📊 Señales encontradas:', matchedSignals.length);
    
    // Mostrar solo las primeras 10 señales para no saturar
    matchedSignals.slice(0, 10).forEach((signal, index) => {
      console.log(`\n--- Señal ${index + 1} ---`);
      console.log('Señal:', signal.senal);
      console.log('Descripción:', signal.descripcion);
      console.log('Emoción probable:', signal.emocion_probable);
      console.log('Interpretación:', signal.interpretacion_priorizada);
      console.log('Puntuación:', signal.matchScore);
      console.log('Bonus de juego:', signal.gameBonus || 1);
      
      // Debug: Ver por qué coincide
      console.log('🔍 Debug coincidencia:');
      Object.entries(aggressionDescription).forEach(([category, desc]) => {
        const descLower = desc.toLowerCase();
        const signalText = signal.senal.toLowerCase();
        const signalDesc = signal.descripcion.toLowerCase();
        
        if (signalText.includes(descLower) || signalDesc.includes(descLower)) {
          console.log(`  ${category}: "${desc}" -> Coincidencia exacta`);
        } else {
          // Buscar palabras clave
          const descWords = descLower.split(' ').filter(word => word.length >= 4);
          const matches = descWords.filter(word => 
            signalText.includes(word) || signalDesc.includes(word)
          );
          if (matches.length > 0) {
            console.log(`  ${category}: "${desc}" -> Palabras coincidentes: ${matches.join(', ')}`);
          }
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar debug
debugAggression().catch(console.error);
