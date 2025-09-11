// Script de prueba simplificado para subtítulos secuenciales (Node.js compatible)

// Simular el servicio de subtítulos secuenciales para pruebas
class MockSequentialSubtitlesService {
  constructor() {
    this.useGemini = true;
  }

  async generateSequentialSubtitles(mediaData, mediaType = 'video') {
    console.log('🎬 Generando subtítulos secuenciales (simulado)...');
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSubtitles = [
      {
        id: 'subtitle_1',
        timestamp: '00:00 - 00:05',
        traduccion_tecnica: 'El perro se encuentra en una postura de juego, agitando un juguete de un lado a otro. Este comportamiento indica una alta energía y excitación.',
        traduccion_emocional: '¡Guau! ¡Miren mi juguete! ¡Qué divertido es!',
        confidence: 90,
        source: 'mock'
      },
      {
        id: 'subtitle_2',
        timestamp: '00:06 - 00:10',
        traduccion_tecnica: 'El perro baja el pecho en una clara reverencia de juego, mirando hacia la cámara. Esta es una invitación directa a la interacción.',
        traduccion_emocional: '¡Mira lo que hago! ¡Ven a jugar conmigo, por favor!',
        confidence: 88,
        source: 'mock'
      },
      {
        id: 'subtitle_3',
        timestamp: '00:11 - 00:15',
        traduccion_tecnica: 'El perro levanta la pata delantera en un gesto de solicitud, manteniendo contacto visual intenso. Este comportamiento sugiere una petición de recompensa.',
        traduccion_emocional: '¡Dame! ¡Dame! Ya di la pata, ¿dónde está mi snack?',
        confidence: 92,
        source: 'mock'
      },
      {
        id: 'subtitle_4',
        timestamp: '00:16 - 00:20',
        traduccion_tecnica: 'El perro mantiene la mirada fija y la boca ligeramente abierta, mostrando signos de expectativa y anticipación por una recompensa.',
        traduccion_emocional: '¡Quiero mi premio! ¡Mira cómo te estoy esperando!',
        confidence: 87,
        source: 'mock'
      }
    ];

    return {
      subtitles: mockSubtitles,
      totalDuration: 20,
      success: true,
      source: 'mock'
    };
  }

  getCurrentSubtitle(subtitles, currentTime) {
    if (!subtitles || subtitles.length === 0) return null;
    
    for (const subtitle of subtitles) {
      const timeRange = this.parseTimestamp(subtitle.timestamp);
      if (currentTime >= timeRange.start && currentTime <= timeRange.end) {
        return subtitle;
      }
    }
    
    return null;
  }

  parseTimestamp(timestamp) {
    const match = timestamp.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startMinutes = parseInt(match[1]);
      const startSeconds = parseInt(match[2]);
      const endMinutes = parseInt(match[3]);
      const endSeconds = parseInt(match[4]);
      
      return {
        start: startMinutes * 60 + startSeconds,
        end: endMinutes * 60 + endSeconds
      };
    }
    
    return { start: 0, end: 5 };
  }

  getSubtitlesProgress(subtitles, currentTime) {
    if (!subtitles || subtitles.length === 0) return 0;
    
    const totalDuration = 20; // Mock duration
    return Math.min(currentTime / totalDuration, 1);
  }

  setGenerationMode(useGemini) {
    this.useGemini = useGemini;
    console.log(`🎬 Modo de generación: ${useGemini ? 'Gemini IA' : 'Fallback'}`);
  }

  getGenerationMode() {
    return this.useGemini ? 'gemini' : 'fallback';
  }
}

// Simular el servicio de traducción
class MockTranslatorService {
  constructor() {
    this.useSequentialSubtitles = true;
    this.useGemini = true;
    this.useDualAnalysis = false;
  }

  async generateSequentialSubtitles(mediaData, mediaType = 'video') {
    console.log('🎬 Generando subtítulos secuenciales...');
    
    const mockService = new MockSequentialSubtitlesService();
    const result = await mockService.generateSequentialSubtitles(mediaData, mediaType);
    
    if (result && result.success) {
      console.log(`✅ Subtítulos secuenciales generados: ${result.subtitles.length} momentos`);
      return {
        ...result,
        source: 'sequential_subtitles'
      };
    }
    
    return await this.generateBasicSubtitles();
  }

  generateBasicSubtitles() {
    const basicSubtitles = [
      {
        id: 'basic_1',
        timestamp: '00:00 - 00:05',
        traduccion_tecnica: 'Análisis del comportamiento canino en progreso...',
        traduccion_emocional: '¡Hola! ¿Qué tal estás?',
        confidence: 75,
        source: 'basic_fallback'
      }
    ];

    return {
      subtitles: basicSubtitles,
      totalDuration: 5,
      success: true,
      source: 'basic_fallback'
    };
  }

  setAnalysisMode(mode) {
    switch (mode) {
      case 'sequential':
        this.useSequentialSubtitles = true;
        this.useGemini = true;
        this.useDualAnalysis = false;
        console.log('🎬 Modo de análisis: Subtítulos Secuenciales');
        break;
      case 'dual':
        this.useSequentialSubtitles = false;
        this.useGemini = true;
        this.useDualAnalysis = true;
        console.log('🎭 Modo de análisis: Dual (Técnico + Emocional)');
        break;
      case 'thought':
        this.useSequentialSubtitles = false;
        this.useGemini = true;
        this.useDualAnalysis = false;
        console.log('🧠 Modo de análisis: Modelo de Pensamiento');
        break;
      case 'external':
        this.useSequentialSubtitles = false;
        this.useGemini = false;
        this.useDualAnalysis = false;
        console.log('🌐 Modo de análisis: API Externa');
        break;
      default:
        console.warn('⚠️ Modo de análisis no reconocido:', mode);
    }
  }

  getAnalysisMode() {
    if (this.useSequentialSubtitles && this.useGemini) {
      return 'sequential';
    } else if (this.useDualAnalysis && this.useGemini) {
      return 'dual';
    } else if (this.useGemini) {
      return 'thought';
    } else {
      return 'external';
    }
  }
}

async function testSequentialSubtitles() {
  console.log('🎬 Iniciando prueba de subtítulos secuenciales...\n');

  try {
    const translatorService = new MockTranslatorService();
    
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
      
      const mockService = new MockSequentialSubtitlesService();
      
      // Probar obtención de subtítulo actual
      const currentSubtitle = mockService.getCurrentSubtitle(result.subtitles, 7.5);
      if (currentSubtitle) {
        console.log(`   - Subtítulo actual en 7.5s: ${currentSubtitle.traduccion_emocional}`);
      }
      
      // Probar progreso
      const progress = mockService.getSubtitlesProgress(result.subtitles, 10);
      console.log(`   - Progreso en 10s: ${(progress * 100).toFixed(1)}%`);
      
      // Probar parseo de timestamp
      const timeRange = mockService.parseTimestamp(result.subtitles[0].timestamp);
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
    const mockService = new MockSequentialSubtitlesService();
    
    // Probar generación
    console.log('📹 Probando generación...');
    const result = await mockService.generateSequentialSubtitles(
      'data:video/webm;base64,mock_data', 
      'video'
    );
    
    if (result && result.success) {
      console.log('✅ Generación exitosa!');
      console.log(`   - Subtítulos: ${result.subtitles.length}`);
      console.log(`   - Fuente: ${result.source}`);
    } else {
      console.log('⚠️ Generación falló');
    }

    // Probar modo de generación
    console.log('\n⚙️ Probando configuración de modo...');
    mockService.setGenerationMode(false);
    console.log(`   - Modo actual: ${mockService.getGenerationMode()}`);
    
    mockService.setGenerationMode(true);
    console.log(`   - Modo actual: ${mockService.getGenerationMode()}`);

  } catch (error) {
    console.error('❌ Error en prueba directa:', error);
  }
}

async function testTranslatorServiceModes() {
  console.log('\n🔄 Probando modos del TranslatorService...\n');

  const translatorService = new MockTranslatorService();
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

// Ejecutar las pruebas
runAllTests().catch(console.error);
