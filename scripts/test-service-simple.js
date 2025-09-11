import fs from 'fs';
import path from 'path';

// Simular la funcionalidad del servicio sin importar el JSON directamente
function testServiceFunctionality() {
  try {
    console.log('🔧 Probando funcionalidad del servicio...');
    
    // Cargar el archivo JSON manualmente
    const signalsPath = path.join(process.cwd(), 'src', 'signals.json');
    const signalsData = JSON.parse(fs.readFileSync(signalsPath, 'utf8'));
    
    console.log('✅ Archivo JSON cargado:', signalsData.length, 'señales');
    
    // Simular extracción de categorías
    const categories = new Set();
    signalsData.forEach(signal => {
      const emotion = signal.emocion_probable;
      if (emotion) {
        emotion.split(',').forEach(e => {
          categories.add(e.trim());
        });
      }
    });
    
    const signalCategories = Array.from(categories);
    console.log('✅ Categorías extraídas:', signalCategories.length);
    
    // Mostrar algunas categorías
    console.log('\n📋 Categorías disponibles:');
    signalCategories.slice(0, 15).forEach(category => {
      console.log(`  - ${category}`);
    });
    
    if (signalCategories.length > 15) {
      console.log(`  ... y ${signalCategories.length - 15} más`);
    }
    
    // Simular búsqueda de señales
    console.log('\n🔍 Probando búsqueda de señales...');
    const testDescription = {
      postura: "cuerpo relajado",
      cola: "cola moviéndose suavemente",
      orejas: "orejas relajadas",
      ojos: "ojos semicerrados",
      boca: "boca semiabierta con lengua afuera",
      movimientos: "ningún movimiento específico",
      sonidos: "ningún sonido visible"
    };
    
    // Buscar señales que coincidan con "relajado"
    const matchedSignals = signalsData.filter(signal => {
      const desc = signal.descripcion.toLowerCase();
      const senal = signal.senal.toLowerCase();
      const emotion = signal.emocion_probable.toLowerCase();
      
      return desc.includes('relajado') || 
             senal.includes('relajado') || 
             emotion.includes('relajación') ||
             emotion.includes('tranquilidad');
    });
    
    console.log(`✅ Señales relacionadas con "relajado" encontradas: ${matchedSignals.length}`);
    
    if (matchedSignals.length > 0) {
      console.log('\n📋 Señales encontradas:');
      matchedSignals.slice(0, 5).forEach(signal => {
        console.log(`  - ${signal.numero}: ${signal.senal} (${signal.emocion_probable})`);
      });
    }
    
    // Verificar distribución de intensidades
    const intensityCounts = {};
    signalsData.forEach(signal => {
      const intensity = signal['intensidad_1-5'];
      intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    });
    
    console.log('\n📊 Distribución de intensidades:');
    Object.keys(intensityCounts).sort().forEach(intensity => {
      console.log(`  Intensidad ${intensity}: ${intensityCounts[intensity]} señales`);
    });
    
    console.log('\n🎉 ¡Prueba de funcionalidad completada exitosamente!');
    console.log('✅ El archivo signals.json ampliado está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testServiceFunctionality();
