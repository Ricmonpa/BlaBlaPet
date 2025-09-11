// Función para detectar patrones específicos de comunicación de recompensa
function detectRewardPattern(analysis) {
  const behavior = analysis.behavior?.toLowerCase() || '';
  const emotion = analysis.emotion?.toLowerCase() || '';
  const context = analysis.context?.toLowerCase() || '';
  
  // NO detectar patrones de recompensa si hay señales de agresión
  const aggressivePatterns = [
    'agresivo', 'agresión', 'defensa', 'amenaza', 'gruñido', 'dientes',
    'advertencia', 'dominancia', 'intimidación', 'miedo', 'tenso'
  ];
  
  const hasAggressiveSignals = aggressivePatterns.some(pattern => 
    behavior.includes(pattern) || emotion.includes(pattern) || context.includes(pattern)
  );
  
  // Si hay señales de agresión, NO detectar patrones de recompensa
  if (hasAggressiveSignals) {
    console.log('🚫 Señales de agresión detectadas, ignorando patrones de recompensa');
    return null;
  }
  
  // Patrones específicos de exigencia de recompensa
  const pawRaisingPatterns = [
    'pata levantada', 'manotazo', 'dar la pata', 'pata en el aire',
    'levantando pata', 'manotazos', 'patas levantadas'
  ];
  
  const intenseGazePatterns = [
    'mirada fija', 'ojos atentos', 'mirando intensamente', 'contacto visual',
    'mirada directa', 'ojos bien abiertos', 'mirando fijamente'
  ];
  
  const mouthOpenPatterns = [
    'boca abierta', 'lengua visible', 'baba', 'humedad', 'salivación',
    'hocico húmedo', 'boca ligeramente abierta'
  ];
  
  const rewardContextPatterns = [
    'esperando comida', 'esperando premio', 'esperando snack', 'recompensa',
    'comida', 'snack', 'premio', 'alimento'
  ];
  
  // Detectar patrones
  const hasPawRaising = pawRaisingPatterns.some(pattern => behavior.includes(pattern));
  const hasIntenseGaze = intenseGazePatterns.some(pattern => behavior.includes(pattern));
  const hasMouthOpen = mouthOpenPatterns.some(pattern => behavior.includes(pattern));
  const hasRewardContext = rewardContextPatterns.some(pattern => 
    behavior.includes(pattern) || context.includes(pattern)
  );
  
  // Determinar traducción específica
  if (hasPawRaising && hasIntenseGaze && hasMouthOpen) {
    return {
      translation: "¡Dame! ¡Dame! Ya di la pata, ¿dónde está mi snack?",
      confidence: 95,
      emotion: "exigente",
      pattern: "exigencia_completa"
    };
  } else if (hasPawRaising && hasIntenseGaze) {
    return {
      translation: "¡Comida, comida! ¡Mira cómo te doy la pata!",
      confidence: 90,
      emotion: "insistente",
      pattern: "insistencia_con_pata"
    };
  } else if (hasIntenseGaze && hasMouthOpen) {
    return {
      translation: "¡Quiero mi premio! ¡Dame! ¡Dame!",
      confidence: 85,
      emotion: "expectante",
      pattern: "expectativa_intensa"
    };
  } else if (hasPawRaising) {
    return {
      translation: "Mira, te doy la pata. ¿Me das algo rico?",
      confidence: 80,
      emotion: "solicitante",
      pattern: "solicitud_con_pata"
    };
  } else if (hasRewardContext) {
    return {
      translation: "¡Comida! ¡Comida! ¡Comida!",
      confidence: 75,
      emotion: "deseoso",
      pattern: "deseo_de_comida"
    };
  }
  
  return null; // No se detectó patrón específico
}

// Probar la función
function testPatternDetection() {
  console.log('🔧 Probando detección de patrones...');
  
  // Caso 1: Análisis con señales de agresión
  const aggressiveAnalysis = {
    translation: 'Dominancia Advertencia crítica Juego rudo',
    confidence: 95,
    emotion: 'agresivo',
    behavior: 'Postura: Acostado sobre una superficie, con el cuerpo ligeramente inclinado hacia adelante. Cola: La cola no es visible en la imagen. Orejas: Orejas caídas, ligeramente hacia atrás. Ojos: Ojos abiertos, mirada fija, con una expresión que podría interpretarse como alerta o intensa. Boca: Boca abierta mostrando los dientes, con la mandíbula inferior ligeramente retraída. Movimientos: No se observan movimientos específicos. Sonidos: No se observan sonidos visibles.',
    context: 'Alerta',
    success: true
  };
  
  console.log('\n📋 Caso 1: Análisis agresivo');
  console.log(`Emoción: ${aggressiveAnalysis.emotion}`);
  console.log(`Comportamiento: ${aggressiveAnalysis.behavior.substring(0, 100)}...`);
  
  const result1 = detectRewardPattern(aggressiveAnalysis);
  if (result1) {
    console.log('❌ ERROR: Se detectó patrón de recompensa cuando no debería');
    console.log('Patrón:', result1.pattern);
  } else {
    console.log('✅ CORRECTO: No se detectó patrón de recompensa');
  }
  
  // Caso 2: Análisis con señales de recompensa
  const rewardAnalysis = {
    translation: 'Solicitar contacto',
    confidence: 85,
    emotion: 'exigente',
    behavior: 'Postura: Cuerpo erguido. Cola: Cola moviéndose. Orejas: Orejas atentas. Ojos: Mirada fija. Boca: Boca abierta con lengua visible. Movimientos: Pata levantada. Sonidos: No se observan sonidos visibles.',
    context: 'Esperando premio',
    success: true
  };
  
  console.log('\n📋 Caso 2: Análisis de recompensa');
  console.log(`Emoción: ${rewardAnalysis.emotion}`);
  console.log(`Comportamiento: ${rewardAnalysis.behavior.substring(0, 100)}...`);
  
  const result2 = detectRewardPattern(rewardAnalysis);
  if (result2) {
    console.log('✅ CORRECTO: Se detectó patrón de recompensa');
    console.log('Patrón:', result2.pattern);
    console.log('Traducción:', result2.translation);
  } else {
    console.log('❌ ERROR: No se detectó patrón de recompensa cuando debería');
  }
  
  console.log('\n🎉 ¡Prueba completada!');
}

// Ejecutar la prueba
testPatternDetection();
