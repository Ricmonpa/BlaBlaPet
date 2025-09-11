import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Diferentes descripciones para debug
const testCases = [
  {
    name: "Sumisión - Miedo",
    description: {
      postura: "El perro está encogido, con el cuerpo bajo al suelo",
      cola: "La cola está entre las piernas, pegada al cuerpo",
      orejas: "Las orejas están hacia atrás, pegadas a la cabeza",
      ojos: "Los ojos están semicerrados, evitando el contacto visual",
      boca: "La boca está cerrada, tensa",
      movimientos: "El perro está quieto, sin movimientos",
      sonidos: "No se observan sonidos visibles"
    }
  },
  {
    name: "Agresión - Amenaza",
    description: {
      postura: "El perro está rígido, con el cuerpo tenso y erguido",
      cola: "La cola está rígida y alta, sin movimiento",
      orejas: "Las orejas están erguidas hacia adelante, tensas",
      ojos: "Los ojos están fijos y amenazantes, con mirada intensa",
      boca: "La boca está cerrada, mostrando los dientes",
      movimientos: "El perro está inmóvil, en posición de amenaza",
      sonidos: "No se observan sonidos visibles"
    }
  }
];

async function debugFinalSystem() {
  console.log('🔍 Debug final del sistema...\n');
  
  const signalService = new SignalAnalysisService();
  
  // Esperar a que se carguen los datos
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log('='.repeat(50));
    
    try {
      // Debug: Ver qué señales se encuentran
      console.log('\n🔍 Buscando señales que coincidan...');
      const matchedSignals = signalService.findMatchingSignals(testCase.description);
      
      console.log(`📊 Señales encontradas: ${matchedSignals.length}`);
      
      // Mostrar solo las primeras 5 señales
      matchedSignals.slice(0, 5).forEach((signal, index) => {
        console.log(`\n--- Señal ${index + 1} ---`);
        console.log('Señal:', signal.senal);
        console.log('Emoción probable:', signal.emocion_probable);
        console.log('Puntuación:', signal.matchScore);
      });
      
      // Verificar señales por categoría
      const aggressionSignals = matchedSignals.filter(signal => {
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
      
      const fearSignals = matchedSignals.filter(signal => {
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
      
      console.log(`\n🔍 Señales de agresión: ${aggressionSignals.length}`);
      console.log(`🔍 Señales de miedo: ${fearSignals.length}`);
      
      // Debug: Ver el conglomerado
      console.log('\n🔍 Calculando conglomerado...');
      const conglomerate = signalService.calculateConglomerate(matchedSignals);
      
      console.log('\n📊 Resultado del conglomerado:');
      console.log('Emoción dominante:', conglomerate.dominantEmotion?.emotion);
      console.log('Señales dominantes:', conglomerate.dominantEmotion?.signals?.length || 0);
      console.log('Puntuación total:', conglomerate.dominantEmotion?.score || 0);
      
      // Debug: Ver la emoción final
      console.log('\n🔍 Determinando emoción principal...');
      const finalEmotion = signalService.determinePrimaryEmotion(matchedSignals);
      console.log('Emoción final:', finalEmotion);
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// Ejecutar debug
debugFinalSystem().catch(console.error);
