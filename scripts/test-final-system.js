import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Diferentes descripciones para probar
const testCases = [
  {
    name: "Play Bow - Invitación a jugar",
    description: {
      postura: "El perro está inclinado hacia abajo, con el pecho en el suelo y las caderas arriba",
      cola: "La cola está moviéndose de lado a lado con entusiasmo",
      orejas: "Las orejas están erguidas hacia adelante, mostrando interés",
      ojos: "Los ojos están brillantes y atentos, mirando hacia adelante",
      boca: "La boca está ligeramente abierta, mostrando la lengua",
      movimientos: "El perro está haciendo movimientos de invitación al juego",
      sonidos: "No se observan sonidos visibles"
    },
    expectedEmotion: "juguetón"
  },
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
    },
    expectedEmotion: "miedoso"
  },
  {
    name: "Alegría - Excitación",
    description: {
      postura: "El perro está erguido, con el cuerpo relajado",
      cola: "La cola está moviéndose en círculos amplios con entusiasmo",
      orejas: "Las orejas están erguidas hacia adelante, mostrando atención",
      ojos: "Los ojos están brillantes y felices",
      boca: "La boca está abierta, mostrando la lengua con alegría",
      movimientos: "El perro está saltando y moviéndose con energía",
      sonidos: "No se observan sonidos visibles"
    },
    expectedEmotion: "juguetón"
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
    },
    expectedEmotion: "agresivo"
  }
];

async function testFinalSystem() {
  console.log('🧪 Prueba final del sistema de análisis de señales...\n');
  
  const signalService = new SignalAnalysisService();
  
  // Esperar a que se carguen los datos
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log('='.repeat(50));
    
    try {
      const result = await signalService.interpretWithSignalMatrix(testCase.description);
      
      console.log('✅ Resultado:');
      console.log('  Emoción detectada:', result.emotion);
      console.log('  Emoción esperada:', testCase.expectedEmotion);
      console.log('  Traducción:', result.translation);
      console.log('  Confianza:', result.confidence);
      console.log('  Contexto:', result.context);
      
      if (result.emotion === testCase.expectedEmotion) {
        console.log('🎯 ✅ PRUEBA PASADA');
        passedTests++;
      } else {
        console.log('❌ ❌ PRUEBA FALLIDA');
      }
      
    } catch (error) {
      console.error('❌ Error en prueba:', error.message);
    }
    
    console.log('\n');
  }
  
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(50));
  console.log(`Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`Porcentaje de éxito: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está funcionando correctamente.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar el sistema.');
  }
}

// Ejecutar pruebas
testFinalSystem().catch(console.error);
