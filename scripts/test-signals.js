import fs from 'fs';
import path from 'path';

// Función para cargar y validar el archivo signals.json
function testSignalsFile() {
  try {
    // Leer el archivo JSON
    const signalsPath = path.join(process.cwd(), 'src', 'signals.json');
    const signalsData = JSON.parse(fs.readFileSync(signalsPath, 'utf8'));
    
    console.log('✅ Archivo signals.json cargado exitosamente');
    console.log(`📊 Total de señales: ${signalsData.length}`);
    console.log(`🔢 Rango de números: ${signalsData[0].numero} a ${signalsData[signalsData.length-1].numero}`);
    
    // Verificar estructura de cada señal
    const requiredFields = ['numero', 'senal', 'descripcion', 'emocion_probable', 'intensidad_1-5', 'interpretacion_priorizada'];
    let structureValid = true;
    
    signalsData.forEach((signal, index) => {
      const missingFields = requiredFields.filter(field => !(field in signal));
      if (missingFields.length > 0) {
        console.log(`❌ Señal ${index + 1} (${signal.numero}) falta campos: ${missingFields.join(', ')}`);
        structureValid = false;
      }
    });
    
    if (structureValid) {
      console.log('✅ Todas las señales tienen la estructura correcta');
    }
    
    // Verificar que los números sean secuenciales
    let sequentialValid = true;
    for (let i = 0; i < signalsData.length; i++) {
      if (signalsData[i].numero !== i + 1) {
        console.log(`❌ Número de señal no secuencial en posición ${i + 1}: esperado ${i + 1}, encontrado ${signalsData[i].numero}`);
        sequentialValid = false;
      }
    }
    
    if (sequentialValid) {
      console.log('✅ Numeración secuencial correcta');
    }
    
    // Mostrar algunas señales de ejemplo
    console.log('\n📋 Ejemplos de señales:');
    console.log('1.', signalsData[0]);
    console.log('50.', signalsData[49]);
    console.log('100.', signalsData[99]);
    
    console.log('\n🎉 ¡Validación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al cargar signals.json:', error.message);
  }
}

// Ejecutar la prueba
testSignalsFile();
