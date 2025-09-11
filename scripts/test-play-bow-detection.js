import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Simular descripción objetiva de un Play Bow
const playBowDescription = {
  postura: "El perro está inclinado hacia abajo, con el pecho en el suelo y las caderas arriba",
  cola: "La cola está moviéndose de lado a lado con entusiasmo",
  orejas: "Las orejas están erguidas hacia adelante, mostrando interés",
  ojos: "Los ojos están brillantes y atentos, mirando hacia adelante",
  boca: "La boca está ligeramente abierta, mostrando la lengua",
  movimientos: "El perro está haciendo movimientos de invitación al juego",
  sonidos: "No se observan sonidos visibles"
};

// Simular descripción objetiva de sumisión (para comparar)
const submissionDescription = {
  postura: "El perro está encogido, con el cuerpo bajo al suelo",
  cola: "La cola está entre las piernas, pegada al cuerpo",
  orejas: "Las orejas están hacia atrás, pegadas a la cabeza",
  ojos: "Los ojos están semicerrados, evitando el contacto visual",
  boca: "La boca está cerrada, tensa",
  movimientos: "El perro está quieto, sin movimientos",
  sonidos: "No se observan sonidos visibles"
};

async function testPlayBowDetection() {
  console.log('🧪 Probando detección de Play Bow...\n');
  
  const signalService = new SignalAnalysisService();
  
  // Esperar a que se carguen los datos
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📋 Descripción de Play Bow:');
  console.log(JSON.stringify(playBowDescription, null, 2));
  console.log('\n🔍 Analizando Play Bow...');
  
  try {
    const playBowResult = await signalService.interpretWithSignalMatrix(playBowDescription);
    console.log('\n✅ Resultado Play Bow:');
    console.log('Emoción:', playBowResult.emotion);
    console.log('Traducción:', playBowResult.translation);
    console.log('Confianza:', playBowResult.confidence);
    console.log('Contexto:', playBowResult.context);
  } catch (error) {
    console.error('❌ Error analizando Play Bow:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('📋 Descripción de Sumisión:');
  console.log(JSON.stringify(submissionDescription, null, 2));
  console.log('\n🔍 Analizando Sumisión...');
  
  try {
    const submissionResult = await signalService.interpretWithSignalMatrix(submissionDescription);
    console.log('\n✅ Resultado Sumisión:');
    console.log('Emoción:', submissionResult.emotion);
    console.log('Traducción:', submissionResult.translation);
    console.log('Confianza:', submissionResult.confidence);
    console.log('Contexto:', submissionResult.context);
  } catch (error) {
    console.error('❌ Error analizando Sumisión:', error);
  }
}

// Ejecutar prueba
testPlayBowDetection().catch(console.error);
