/**
 * Script de prueba para el nuevo sistema de análisis dual
 * Prueba el servicio dualAnalysisService y translatorService con el nuevo prompt
 */

import dualAnalysisService from '../src/services/dualAnalysisService.js';
import translatorService from '../src/services/translatorService.js';

// Simular datos de imagen para prueba
const createTestImageData = () => {
  // Crear un canvas simple con un rectángulo para simular una imagen
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // Dibujar un fondo verde (césped)
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, 400, 300);
  
  // Dibujar un rectángulo marrón (simulando un perro)
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(150, 100, 100, 80);
  
  // Dibujar un círculo (cabeza)
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.arc(200, 80, 30, 0, 2 * Math.PI);
  ctx.fill();
  
  // Convertir a base64
  return canvas.toDataURL('image/jpeg', 0.8);
};

async function testDualAnalysisService() {
  console.log('🧪 Iniciando prueba del DualAnalysisService...');
  
  try {
    // Verificar que el servicio esté disponible
    if (!dualAnalysisService.isAvailable()) {
      console.error('❌ DualAnalysisService no está disponible (falta API key)');
      return false;
    }
    
    console.log('✅ DualAnalysisService está disponible');
    
    // Crear datos de imagen de prueba
    const testImageData = createTestImageData();
    console.log('📸 Datos de imagen de prueba creados');
    
    // Probar análisis dual
    console.log('🔍 Ejecutando análisis dual...');
    const result = await dualAnalysisService.analyzePetMediaDual(testImageData, 'image');
    
    console.log('📊 Resultado del análisis dual:');
    console.log('  - Éxito:', result.success);
    console.log('  - Confianza:', result.confidence);
    console.log('  - Emoción:', result.emotion);
    console.log('  - Comportamiento:', result.behavior);
    console.log('  - Contexto:', result.context);
    console.log('  - Fuente:', result.source);
    
    if (result.output_tecnico) {
      console.log('🔬 Traducción Técnica:');
      console.log('   ', result.output_tecnico);
    }
    
    if (result.output_emocional) {
      console.log('🎭 Doblaje para Pet-Parents:');
      console.log('   ', result.output_emocional);
    }
    
    // Verificar que tenemos ambos outputs
    if (result.output_tecnico && result.output_emocional) {
      console.log('✅ Análisis dual completado exitosamente');
      return true;
    } else {
      console.warn('⚠️ Análisis dual incompleto - faltan outputs');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de DualAnalysisService:', error);
    return false;
  }
}

async function testTranslatorServiceWithDualAnalysis() {
  console.log('🧪 Iniciando prueba del TranslatorService con análisis dual...');
  
  try {
    // Configurar modo dual
    translatorService.setAnalysisMode('dual');
    console.log('🎭 Modo configurado:', translatorService.getAnalysisMode());
    
    // Crear datos de imagen de prueba
    const testImageData = createTestImageData();
    console.log('📸 Datos de imagen de prueba creados');
    
    // Probar traducción con análisis dual
    console.log('🔍 Ejecutando traducción con análisis dual...');
    const result = await translatorService.translateMedia(testImageData, 'image');
    
    console.log('📊 Resultado de la traducción:');
    console.log('  - Éxito:', result.success);
    console.log('  - Confianza:', result.confidence);
    console.log('  - Emoción:', result.emotion);
    console.log('  - Comportamiento:', result.behavior);
    console.log('  - Contexto:', result.context);
    console.log('  - Fuente:', result.source);
    console.log('  - Tipo de análisis:', result.analysisType);
    
    if (result.output_tecnico) {
      console.log('🔬 Traducción Técnica:');
      console.log('   ', result.output_tecnico);
    }
    
    if (result.output_emocional) {
      console.log('🎭 Doblaje para Pet-Parents:');
      console.log('   ', result.output_emocional);
    }
    
    // Verificar que tenemos ambos outputs
    if (result.output_tecnico && result.output_emocional) {
      console.log('✅ Traducción con análisis dual completada exitosamente');
      return true;
    } else {
      console.warn('⚠️ Traducción con análisis dual incompleta - faltan outputs');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de TranslatorService:', error);
    return false;
  }
}

async function testAnalysisModeSwitching() {
  console.log('🧪 Iniciando prueba de cambio de modos de análisis...');
  
  try {
    const modes = ['dual', 'thought', 'external'];
    
    for (const mode of modes) {
      console.log(`🔄 Probando modo: ${mode}`);
      translatorService.setAnalysisMode(mode);
      
      const currentMode = translatorService.getAnalysisMode();
      console.log(`   Modo actual: ${currentMode}`);
      
      if (currentMode === mode) {
        console.log(`   ✅ Modo ${mode} configurado correctamente`);
      } else {
        console.log(`   ❌ Error: esperado ${mode}, obtenido ${currentMode}`);
        return false;
      }
    }
    
    console.log('✅ Cambio de modos de análisis funcionando correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en prueba de cambio de modos:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando suite de pruebas para análisis dual...\n');
  
  const results = {
    dualAnalysisService: false,
    translatorServiceDual: false,
    modeSwitching: false
  };
  
  // Prueba 1: DualAnalysisService directo
  console.log('='.repeat(50));
  console.log('PRUEBA 1: DualAnalysisService');
  console.log('='.repeat(50));
  results.dualAnalysisService = await testDualAnalysisService();
  
  console.log('\n' + '='.repeat(50));
  console.log('PRUEBA 2: TranslatorService con análisis dual');
  console.log('='.repeat(50));
  results.translatorServiceDual = await testTranslatorServiceWithDualAnalysis();
  
  console.log('\n' + '='.repeat(50));
  console.log('PRUEBA 3: Cambio de modos de análisis');
  console.log('='.repeat(50));
  results.modeSwitching = await testAnalysisModeSwitching();
  
  // Resumen de resultados
  console.log('\n' + '='.repeat(50));
  console.log('RESUMEN DE PRUEBAS');
  console.log('='.repeat(50));
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`📊 DualAnalysisService: ${results.dualAnalysisService ? '✅' : '❌'}`);
  console.log(`📊 TranslatorService Dual: ${results.translatorServiceDual ? '✅' : '❌'}`);
  console.log(`📊 Cambio de modos: ${results.modeSwitching ? '✅' : '❌'}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema de análisis dual está funcionando correctamente.');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar los logs para más detalles.');
  }
  
  return results;
}

// Ejecutar pruebas si se llama directamente
if (typeof window !== 'undefined') {
  // En el navegador
  window.testDualAnalysis = runAllTests;
  console.log('🧪 Pruebas cargadas. Ejecuta testDualAnalysis() en la consola para comenzar.');
} else {
  // En Node.js (si se ejecuta directamente)
  runAllTests().catch(console.error);
}

export { testDualAnalysisService, testTranslatorServiceWithDualAnalysis, testAnalysisModeSwitching, runAllTests };
