import fs from 'fs';
import path from 'path';

// Simular el análisis de señales de agresión
function testAggressionAnalysis() {
  try {
    console.log('🔧 Probando análisis de señales de agresión...');
    
    // Cargar el archivo JSON
    const signalsPath = path.join(process.cwd(), 'src', 'signals.json');
    const signalsData = JSON.parse(fs.readFileSync(signalsPath, 'utf8'));
    
    // Simular descripción objetiva de un perro agresivo
    const aggressiveDescription = {
      postura: "cuerpo tenso y rígido",
      cola: "cola rígida en alto",
      orejas: "orejas hacia atrás",
      ojos: "mirada fija intensa",
      boca: "mostrando dientes, labios retraídos",
      movimientos: "cuerpo rígido previo a ataque",
      sonidos: "gruñido bajo y constante"
    };
    
    console.log('📋 Descripción objetiva simulada:');
    console.log(JSON.stringify(aggressiveDescription, null, 2));
    
    // Buscar señales que coincidan con agresión
    const aggressiveSignals = signalsData.filter(signal => {
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      const signalEmotion = signal.emocion_probable.toLowerCase();
      
      const aggressiveKeywords = [
        'agresión', 'defensa', 'amenaza', 'gruñido', 'mostrar dientes',
        'advertencia', 'dominancia', 'tenso', 'rígido', 'fijo'
      ];
      
      return aggressiveKeywords.some(keyword => 
        signalText.includes(keyword) || 
        signalDesc.includes(keyword) || 
        signalEmotion.includes(keyword)
      );
    });
    
    console.log(`\n🔍 Señales de agresión encontradas: ${aggressiveSignals.length}`);
    
    if (aggressiveSignals.length > 0) {
      console.log('\n📋 Señales de agresión identificadas:');
      aggressiveSignals.slice(0, 10).forEach(signal => {
        console.log(`  - ${signal.numero}: ${signal.senal}`);
        console.log(`    Descripción: ${signal.descripcion}`);
        console.log(`    Emoción: ${signal.emocion_probable}`);
        console.log(`    Intensidad: ${signal['intensidad_1-5']}`);
        console.log(`    Interpretación: ${signal.interpretacion_priorizada}`);
        console.log('');
      });
    }
    
    // Simular búsqueda de coincidencias específicas
    console.log('🔍 Buscando coincidencias específicas con la descripción:');
    
    const matches = [];
    signalsData.forEach(signal => {
      let score = 0;
      const signalText = signal.senal.toLowerCase();
      const signalDesc = signal.descripcion.toLowerCase();
      
      // Buscar coincidencias en postura
      if (aggressiveDescription.postura.includes('tenso') && 
          (signalText.includes('tenso') || signalDesc.includes('tenso'))) {
        score += signal['intensidad_1-5'];
      }
      
      // Buscar coincidencias en cola
      if (aggressiveDescription.cola.includes('rígida') && 
          (signalText.includes('rígida') || signalDesc.includes('rígida'))) {
        score += signal['intensidad_1-5'];
      }
      
      // Buscar coincidencias en orejas
      if (aggressiveDescription.orejas.includes('atrás') && 
          (signalText.includes('atrás') || signalDesc.includes('atrás'))) {
        score += signal['intensidad_1-5'];
      }
      
      // Buscar coincidencias en ojos
      if (aggressiveDescription.ojos.includes('fija') && 
          (signalText.includes('fija') || signalDesc.includes('fija'))) {
        score += signal['intensidad_1-5'];
      }
      
      // Buscar coincidencias en boca
      if (aggressiveDescription.boca.includes('dientes') && 
          (signalText.includes('dientes') || signalDesc.includes('dientes'))) {
        score += signal['intensidad_1-5'];
      }
      
      // Buscar coincidencias en movimientos
      if (aggressiveDescription.movimientos.includes('rígido') && 
          (signalText.includes('rígido') || signalDesc.includes('rígido'))) {
        score += signal['intensidad_1-5'];
      }
      
      // Buscar coincidencias en sonidos
      if (aggressiveDescription.sonidos.includes('gruñido') && 
          (signalText.includes('gruñido') || signalDesc.includes('gruñido'))) {
        score += signal['intensidad_1-5'];
      }
      
      if (score > 0) {
        matches.push({
          ...signal,
          matchScore: score
        });
      }
    });
    
    // Ordenar por puntuación
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log(`\n✅ Coincidencias encontradas: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('\n📋 Top 5 coincidencias:');
      matches.slice(0, 5).forEach((signal, index) => {
        console.log(`${index + 1}. ${signal.numero}: ${signal.senal} (Score: ${signal.matchScore})`);
        console.log(`   Emoción: ${signal.emocion_probable}`);
        console.log(`   Interpretación: ${signal.interpretacion_priorizada}`);
        console.log('');
      });
      
      // Simular interpretación final
      const primarySignal = matches[0];
      const confidence = Math.min(95, 50 + (matches.length * 10) + (primarySignal.matchScore * 5));
      
      console.log('🎯 Interpretación final simulada:');
      console.log(`Traducción: ${primarySignal.interpretacion_priorizada}`);
      console.log(`Confianza: ${Math.round(confidence)}%`);
      console.log(`Emoción: ${primarySignal.emocion_probable}`);
    }
    
    console.log('\n🎉 ¡Prueba de análisis de agresión completada!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testAggressionAnalysis();
