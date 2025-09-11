import TranslatorService from '../src/services/translatorService.js';

// Probar el servicio de traducción con señales de agresión
async function testTranslationFix() {
  try {
    console.log('🔧 Probando servicio de traducción con señales de agresión...');
    
    const translator = new TranslatorService();
    
    // Simular resultado de análisis con señales de agresión
    const aggressiveAnalysis = {
      translation: 'Dominancia Advertencia crítica Juego rudo',
      confidence: 95,
      emotion: 'agresivo',
      behavior: 'Postura: Acostado sobre una superficie, con el cuerpo ligeramente inclinado hacia adelante. Cola: La cola no es visible en la imagen. Orejas: Orejas caídas, ligeramente hacia atrás. Ojos: Ojos abiertos, mirada fija, con una expresión que podría interpretarse como alerta o intensa. Boca: Boca abierta mostrando los dientes, con la mandíbula inferior ligeramente retraída. Movimientos: No se observan movimientos específicos. Sonidos: No se observan sonidos visibles.',
      context: 'Alerta',
      success: true
    };
    
    console.log('📋 Análisis simulado (agresivo):');
    console.log(`Emoción: ${aggressiveAnalysis.emotion}`);
    console.log(`Traducción: ${aggressiveAnalysis.translation}`);
    console.log(`Comportamiento: ${aggressiveAnalysis.behavior.substring(0, 100)}...`);
    
    // Probar detección de patrones
    console.log('\n🔍 Probando detección de patrones...');
    const rewardPattern = translator.detectRewardPattern(aggressiveAnalysis);
    
    if (rewardPattern) {
      console.log('❌ ERROR: Se detectó patrón de recompensa cuando no debería');
      console.log('Patrón detectado:', rewardPattern.pattern);
    } else {
      console.log('✅ CORRECTO: No se detectó patrón de recompensa (como debe ser)');
    }
    
    // Simular resultado de análisis con señales de recompensa
    const rewardAnalysis = {
      translation: 'Solicitar contacto',
      confidence: 85,
      emotion: 'exigente',
      behavior: 'Postura: Cuerpo erguido. Cola: Cola moviéndose. Orejas: Orejas atentas. Ojos: Mirada fija. Boca: Boca abierta con lengua visible. Movimientos: Pata levantada. Sonidos: No se observan sonidos visibles.',
      context: 'Esperando premio',
      success: true
    };
    
    console.log('\n📋 Análisis simulado (recompensa):');
    console.log(`Emoción: ${rewardAnalysis.emotion}`);
    console.log(`Traducción: ${rewardAnalysis.translation}`);
    console.log(`Comportamiento: ${rewardAnalysis.behavior.substring(0, 100)}...`);
    
    // Probar detección de patrones
    console.log('\n🔍 Probando detección de patrones...');
    const rewardPattern2 = translator.detectRewardPattern(rewardAnalysis);
    
    if (rewardPattern2) {
      console.log('✅ CORRECTO: Se detectó patrón de recompensa');
      console.log('Patrón detectado:', rewardPattern2.pattern);
      console.log('Traducción:', rewardPattern2.translation);
    } else {
      console.log('❌ ERROR: No se detectó patrón de recompensa cuando debería');
    }
    
    console.log('\n🎉 ¡Prueba de traducción completada!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testTranslationFix();
