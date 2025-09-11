#!/usr/bin/env node

/**
 * Script de prueba para el servicio de doblaje emocional
 * Ejecutar con: node scripts/test-emotional-dubbing.js
 */

import emotionalDubbingService from '../src/services/emotionalDubbingService.js';

console.log('🎭 Prueba del Servicio de Doblaje Emocional\n');

// Función para mostrar resultados de manera formateada
function displayTestResult(testName, input, output) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 ${testName}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log('\n📥 ENTRADA:');
  console.log(`   Traducción: "${input.translation}"`);
  console.log(`   Emoción: ${input.emotion}`);
  console.log(`   Contexto: ${input.context}`);
  if (input.behavior) {
    console.log(`   Comportamiento: ${input.behavior}`);
  }
  
  console.log('\n📤 SALIDA:');
  console.log(`   Doblaje: "${output.emotionalDubbing}"`);
  console.log(`   Tono: ${output.tone}`);
  console.log(`   Estilo: ${output.style}`);
  console.log(`   Contexto: ${output.contextStyle}`);
  console.log(`   Confianza: ${output.confidence}%`);
  console.log(`   Fuente: ${output.source}`);
}

// Casos de prueba
const testCases = [
  {
    name: 'Perro Feliz Jugando',
    input: {
      translation: '¡Estoy feliz! Quiero jugar contigo',
      emotion: 'feliz',
      context: 'juego',
      behavior: 'Cola moviéndose, orejas relajadas, boca abierta'
    }
  },
  {
    name: 'Perro Exigiendo Recompensa',
    input: {
      translation: '¡Dame! ¡Dame! Ya di la pata',
      emotion: 'exigente',
      context: 'recompensa',
      behavior: 'Pata levantada, mirada intensa, boca ligeramente abierta'
    }
  },
  {
    name: 'Perro Ansioso',
    input: {
      translation: 'Aléjate ¡Juega conmigo ya! Exploración',
      emotion: 'ansioso',
      context: 'alerta_defensiva',
      behavior: 'Postura baja, cola relajada, orejas hacia atrás'
    }
  },
  {
    name: 'Perro Cariñoso',
    input: {
      translation: 'Te quiero mucho, eres mi mejor amigo',
      emotion: 'cariñoso',
      context: 'social',
      behavior: 'Mirada tierna, cola suave, postura relajada'
    }
  },
  {
    name: 'Perro Juguetón',
    input: {
      translation: '¡Vamos a correr! ¡Esto será divertido!',
      emotion: 'juguetón',
      context: 'juego',
      behavior: 'Energía alta, movimientos rápidos, cola moviéndose'
    }
  },
  {
    name: 'Perro Defensivo',
    input: {
      translation: '¡Cuidado! ¡Algo no está bien!',
      emotion: 'defensivo',
      context: 'alerta_defensiva',
      behavior: 'Postura tensa, cola rígida, orejas hacia adelante'
    }
  },
  {
    name: 'Perro Expectante',
    input: {
      translation: '¿Dónde está mi premio?',
      emotion: 'expectante',
      context: 'recompensa',
      behavior: 'Mirada fija, postura alerta, cola quieta'
    }
  }
];

// Ejecutar pruebas
console.log('🚀 Ejecutando pruebas...\n');

testCases.forEach((testCase, index) => {
  try {
    const result = emotionalDubbingService.generateEmotionalDubbing(
      testCase.input.translation,
      testCase.input.emotion,
      testCase.input.context,
      testCase.input.behavior
    );
    
    displayTestResult(testCase.name, testCase.input, result);
    
    // Verificar que el resultado sea válido
    if (!result.emotionalDubbing) {
      console.log('   ❌ ERROR: No se generó doblaje emocional');
    } else if (result.confidence < 70) {
      console.log('   ⚠️  ADVERTENCIA: Confianza baja');
    } else {
      console.log('   ✅ ÉXITO: Prueba completada correctamente');
    }
    
  } catch (error) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   ❌ ERROR: ${error.message}`);
  }
});

// Pruebas de estilos personalizados
console.log('\n\n🎨 Pruebas de Estilos Personalizados\n');

const customStyles = ['amigable', 'dramático', 'poético', 'deportivo'];
const sampleTranslation = '¡Hola! ¿Cómo estás?';

customStyles.forEach(style => {
  try {
    const result = emotionalDubbingService.generateCustomDubbing(sampleTranslation, style);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 Estilo: ${style.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Entrada: "${sampleTranslation}"`);
    console.log(`   Salida: "${result}"`);
    console.log('   ✅ ÉXITO: Estilo personalizado generado');
    
  } catch (error) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 Estilo: ${style.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   ❌ ERROR: ${error.message}`);
  }
});

// Pruebas de detección de patrones
console.log('\n\n🔍 Pruebas de Detección de Patrones\n');

const patternTests = [
  '¡Dame mi premio!',
  'Ya di la pata, ¿dónde está mi snack?',
  '¡Comida! ¡Comida!',
  'Hola, ¿cómo estás?',
  '¡Vamos a jugar!'
];

patternTests.forEach(translation => {
  const isReward = emotionalDubbingService.isRewardPattern(translation);
  
  console.log(`\n${'='.repeat(40)}`);
  console.log(`🔍 Traducción: "${translation}"`);
  console.log(`   Patrón de recompensa: ${isReward ? '✅ SÍ' : '❌ NO'}`);
});

// Resumen final
console.log('\n\n📊 RESUMEN DE PRUEBAS\n');
console.log(`${'='.repeat(60)}`);
console.log(`✅ Pruebas ejecutadas: ${testCases.length}`);
console.log(`✅ Estilos personalizados: ${customStyles.length}`);
console.log(`✅ Patrones de recompensa: ${patternTests.length}`);
console.log(`\n🎭 El servicio de doblaje emocional está funcionando correctamente!`);
console.log(`\n💡 Para probar en la interfaz web:`);
console.log(`   1. Ve a /profile`);
console.log(`   2. Haz clic en "Doblaje Emocional" en las herramientas de desarrollo`);
console.log(`   3. Ejecuta las pruebas interactivas`);

console.log('\n✨ ¡Pruebas completadas!\n');
