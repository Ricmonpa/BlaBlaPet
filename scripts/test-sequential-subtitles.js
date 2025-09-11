// Script de prueba para subtítulos secuenciales
import translatorService from '../src/services/translatorService.js';
import sequentialSubtitlesService from '../src/services/sequentialSubtitlesService.js';

async function testSequentialSubtitles() {
  console.log('🎬 Iniciando prueba de subtítulos secuenciales...\n');

  try {
    // Configurar modo de análisis secuencial
    translatorService.setAnalysisMode('sequential');
    console.log('✅ Modo de análisis configurado: Sequential\n');

    // Simular datos de video
    const mockVideoData = 'data:video/webm;base64,mock_video_data_for_testing';
    
    // Probar generación de subtítulos secuenciales
    console.log('📹 Generando subtítulos secuenciales...');
    const result = await translatorService.generateSequentialSubtitles(mockVideoData, 'video');
    
    if (result && result.success) {
      console.log('✅ Subtítulos secuenciales generados exitosamente!\n');
      
      // Mostrar información del resultado
      console.log('📊 Información del análisis:');
      console.log(`   - Subtítulos generados: ${result.subtitles.length}`);
      console.log(`   - Duración total: ${result.totalDuration} segundos`);
      console.log(`   - Fuente: ${result.source}\n`);
      
      // Mostrar cada subtítulo
      console.log('📝 Subtítulos generados:');
      result.subtitles.forEach((subtitle, index) => {
        console.log(`\n   ${index + 1}. ${subtitle.timestamp}`);
        console.log(`      Técnica: ${subtitle.traduccion_tecnica}`);
        console.log(`      Emocional: "${subtitle.traduccion_emocional}"`);
        console.log(`      Confianza: ${subtitle.confidence}%`);
      });
      
      // Probar funciones auxiliares
      console.log('\n🔧 Probando funciones auxiliares...');
      
      // Probar obtención de subtítulo actual
      const currentSubtitle = sequentialSubtitlesService.getCurrentSubtitle(result.subtitles, 7.5);
      if (currentSubtitle) {
        console.log(`   - Subtítulo actual en 7.5s: ${currentSubtitle.traduccion_emocional}`);
      }
      
      // Probar progreso
      const progress = sequentialSubtitlesService.getSubtitlesProgress(result.subtitles, 10);
      console.log(`   - Progreso en 10s: ${(progress * 100).toFixed(1)}%`);
      
      // Probar parseo de timestamp
      const timeRange = sequentialSubtitlesService.parseTimestamp(result.subtitles[0].timestamp);
      console.log(`   - Rango de tiempo del primer subtítulo: ${timeRange.start}s - ${timeRange.end}s`);
      
    } else {
      console.log('❌ Error: No se pudieron generar los subtítulos secuenciales');
      console.log('Resultado:', result);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

async function testSequentialSubtitlesService() {
  console.log('\n🧪 Probando SequentialSubtitlesService directamente...\n');

  try {
    // Probar generación con Gemini
    console.log('📹 Probando generación con Gemini...');
    const geminiResult = await sequentialSubtitlesService.generateSequentialSubtitles(
      'data:video/webm;base64,mock_data', 
      'video'
    );
    
    if (geminiResult && geminiResult.success) {
      console.log('✅ Generación con Gemini exitosa!');
      console.log(`   - Subtítulos: ${geminiResult.subtitles.length}`);
      console.log(`   - Fuente: ${geminiResult.source}`);
    } else {
      console.log('⚠️ Generación con Gemini falló, usando fallback');
    }

    // Probar modo de generación
    console.log('\n⚙️ Probando configuración de modo...');
    sequentialSubtitlesService.setGenerationMode(false);
    console.log(`   - Modo actual: ${sequentialSubtitlesService.getGenerationMode()}`);
    
    sequentialSubtitlesService.setGenerationMode(true);
    console.log(`   - Modo actual: ${sequentialSubtitlesService.getGenerationMode()}`);

  } catch (error) {
    console.error('❌ Error en prueba directa:', error);
  }
}

async function testTranslatorServiceModes() {
  console.log('\n🔄 Probando modos del TranslatorService...\n');

  const modes = ['sequential', 'dual', 'thought', 'external'];
  
  for (const mode of modes) {
    try {
      translatorService.setAnalysisMode(mode);
      const currentMode = translatorService.getAnalysisMode();
      console.log(`✅ Modo configurado: ${mode} -> Actual: ${currentMode}`);
    } catch (error) {
      console.error(`❌ Error configurando modo ${mode}:`, error);
    }
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas completas de subtítulos secuenciales\n');
  console.log('=' .repeat(60));
  
  await testSequentialSubtitles();
  console.log('\n' + '=' .repeat(60));
  
  await testSequentialSubtitlesService();
  console.log('\n' + '=' .repeat(60));
  
  await testTranslatorServiceModes();
  console.log('\n' + '=' .repeat(60));
  
  console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testSequentialSubtitles, testSequentialSubtitlesService, testTranslatorServiceModes };
