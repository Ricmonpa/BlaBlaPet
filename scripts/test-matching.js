import fs from 'fs';
import path from 'path';

// Función para cargar los datos de señales
async function loadSignalsData() {
  const signalsPath = path.join(process.cwd(), 'src', 'signals.json');
  const fileContent = fs.readFileSync(signalsPath, 'utf8');
  return JSON.parse(fileContent);
}

// Función para verificar coincidencias
function hasMatch(description, signalText, signalDesc) {
  const desc = description.toLowerCase();
  
  // Buscar coincidencias en el nombre de la señal
  const signalKeywords = signalText.split(' ');
  const signalMatch = signalKeywords.some(keyword => {
    if (keyword.length < 3) return false; // Ignorar palabras muy cortas
    return desc.includes(keyword);
  });
  
  // Buscar coincidencias en la descripción de la señal
  const descKeywords = signalDesc.split(' ');
  const descMatch = descKeywords.some(keyword => {
    if (keyword.length < 3) return false; // Ignorar palabras muy cortas
    return desc.includes(keyword);
  });
  
  return signalMatch || descMatch;
}

// Función para obtener puntuación basada en intensidad
function getIntensityScore(intensidad) {
  return parseInt(intensidad) || 1;
}

// Función para buscar señales que coincidan
function findMatchingSignals(description, signalsMatrix) {
  const matches = [];
  
  signalsMatrix.forEach(signal => {
    let score = 0;
    const signalText = signal.senal.toLowerCase();
    const signalDesc = signal.descripcion.toLowerCase();
    
    // Buscar coincidencias en postura
    if (description.postura && hasMatch(description.postura, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    // Buscar coincidencias en cola
    if (description.cola && hasMatch(description.cola, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    // Buscar coincidencias en orejas
    if (description.orejas && hasMatch(description.orejas, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    // Buscar coincidencias en ojos
    if (description.ojos && hasMatch(description.ojos, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    // Buscar coincidencias en boca
    if (description.boca && hasMatch(description.boca, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    // Buscar coincidencias en movimientos
    if (description.movimientos && hasMatch(description.movimientos, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    // Buscar coincidencias en sonidos
    if (description.sonidos && hasMatch(description.sonidos, signalText, signalDesc)) {
      score += getIntensityScore(signal['intensidad_1-5']);
    }
    
    if (score > 0) {
      matches.push({
        ...signal,
        matchScore: score
      });
    }
  });
  
  // Ordenar por puntuación de coincidencia
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Función principal de prueba
async function testMatching() {
  try {
    console.log('🔧 Probando búsqueda de coincidencias...');
    
    // Cargar datos
    const signalsData = await loadSignalsData();
    console.log('✅ Datos cargados:', signalsData.length, 'señales');
    
    // Descripción de prueba
    const description = {
      postura: "cuerpo tenso y rígido",
      cola: "cola rígida en alto",
      orejas: "orejas hacia atrás",
      ojos: "mirada fija intensa",
      boca: "mostrando dientes, labios retraídos",
      movimientos: "cuerpo rígido previo a ataque",
      sonidos: "gruñido bajo y constante"
    };
    
    console.log('📋 Descripción de prueba:', description);
    
    // Buscar coincidencias
    const matches = findMatchingSignals(description, signalsData);
    console.log(`\n✅ Coincidencias encontradas: ${matches.length}`);
    
    if (matches.length > 0) {
      console.log('\n📋 Top 10 coincidencias:');
      matches.slice(0, 10).forEach((signal, index) => {
        console.log(`${index + 1}. ${signal.numero}: ${signal.senal} (Score: ${signal.matchScore})`);
        console.log(`   Descripción: ${signal.descripcion}`);
        console.log(`   Emoción: ${signal.emocion_probable}`);
        console.log(`   Intensidad: ${signal['intensidad_1-5']}`);
        console.log(`   Interpretación: ${signal.interpretacion_priorizada}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No se encontraron coincidencias. Probando con palabras clave específicas...');
      
      // Probar con palabras clave específicas
      const testKeywords = ['tenso', 'rígido', 'dientes', 'gruñido', 'fija', 'atrás'];
      
      testKeywords.forEach(keyword => {
        const keywordMatches = signalsData.filter(signal => {
          const signalText = signal.senal.toLowerCase();
          const signalDesc = signal.descripcion.toLowerCase();
          return signalText.includes(keyword) || signalDesc.includes(keyword);
        });
        
        if (keywordMatches.length > 0) {
          console.log(`\n🔍 Palabra clave "${keyword}": ${keywordMatches.length} coincidencias`);
          keywordMatches.slice(0, 3).forEach(signal => {
            console.log(`  - ${signal.numero}: ${signal.senal}`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar la prueba
testMatching();
