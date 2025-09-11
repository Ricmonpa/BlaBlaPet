import SignalAnalysisService from '../src/services/signalAnalysisService.js';

// Analizar las señales encontradas
async function analyzeSignals() {
  try {
    console.log('🔧 Analizando señales encontradas...');
    
    const service = new SignalAnalysisService();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const description = {
      postura: "cuerpo tenso",
      cola: "cola rígida", 
      orejas: "orejas hacia atrás",
      ojos: "mirada fija",
      boca: "mostrando dientes",
      movimientos: "cuerpo rígido",
      sonidos: "gruñido"
    };
    
    const matches = service.findMatchingSignals(description);
    
    console.log(`📊 Total de coincidencias: ${matches.length}`);
    
    // Agrupar por emoción
    const emotionGroups = {};
    matches.forEach(signal => {
      const emotions = signal.emocion_probable.split(',').map(e => e.trim());
      emotions.forEach(emotion => {
        if (!emotionGroups[emotion]) {
          emotionGroups[emotion] = [];
        }
        emotionGroups[emotion].push(signal);
      });
    });
    
    console.log('\n📋 Agrupación por emoción:');
    Object.entries(emotionGroups).forEach(([emotion, signals]) => {
      const totalScore = signals.reduce((sum, s) => sum + s.matchScore, 0);
      const highIntensity = signals.filter(s => s['intensidad_1-5'] >= 4).length;
      
      console.log(`\n${emotion}:`);
      console.log(`  Señales: ${signals.length}`);
      console.log(`  Score total: ${totalScore}`);
      console.log(`  Alta intensidad (4-5): ${highIntensity}`);
      
      signals.slice(0, 3).forEach(signal => {
        console.log(`  - ${signal.numero}: ${signal.senal} (Score: ${signal.matchScore}, Intensidad: ${signal['intensidad_1-5']})`);
      });
    });
    
    // Buscar específicamente señales de agresión
    console.log('\n🔍 Señales específicas de agresión:');
    const aggressiveSignals = matches.filter(signal => {
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
             signalEmotion.includes('agresión') ||
             signalEmotion.includes('defensa') ||
             signalEmotion.includes('amenaza');
    });
    
    console.log(`Encontradas: ${aggressiveSignals.length}`);
    aggressiveSignals.forEach(signal => {
      console.log(`- ${signal.numero}: ${signal.senal} (Score: ${signal.matchScore}, Intensidad: ${signal['intensidad_1-5']})`);
      console.log(`  Emoción: ${signal.emocion_probable}`);
      console.log(`  Interpretación: ${signal.interpretacion_priorizada}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar el análisis
analyzeSignals();
